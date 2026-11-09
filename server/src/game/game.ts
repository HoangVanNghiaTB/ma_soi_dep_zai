import { ROLES, ROLE_IDS, isWolfKind, isWolfTeam } from '@ms/shared';
import type {
  ChatMsg,
  Cue,
  Fx,
  GameView,
  IconId,
  Phase,
  PlayerView,
  Prompt,
  RoleId,
  Timings,
  Winner,
} from '@ms/shared';
import { CUES, totalMs } from './cues';
import type { CueDef } from './cues';
import { dealRoles } from './deal';
import type { Rng } from './deal';
import { checkWinner } from './win';

export interface PlayerInit {
  sessionId: string;
  name: string;
}

export interface GameDeps {
  timings: Timings;
  rng?: Rng;
  now?: () => number;
  /** Chỉ dùng khi kiểm thử: ép vai cho từng ghế thay vì chia ngẫu nhiên. */
  roles?: RoleId[];
  /** Có dành thời gian đọc vai trước đêm đầu không. */
  intro?: boolean;
  /** Có thay đổi, cần gửi view mới cho mọi người. */
  onChange: () => void;
  /** Phát một lời quản trò / hiệu ứng âm thanh cho cả bàn. */
  onCue: (cue: Cue) => void;
  /** Hiệu ứng hình ảnh, chỉ gửi cho những ghế được phép thấy. */
  onFx?: (fx: Fx, audience: number[]) => void;
  /** Tin chat của Sói, chỉ gửi cho những ghế được phép đọc. */
  onChat?: (msg: ChatMsg, audience: number[]) => void;
  /** Hết thời gian xem kết quả, phòng quay về bàn chờ. */
  onEnd: () => void;
}

interface P {
  seat: number;
  sessionId: string;
  name: string;
  role: RoleId;
  alive: boolean;
  connected: boolean;
  lover: number | null;
  princeUsed: boolean;
  /** Thị Trưởng từ đầu ván. Giữ nguyên biểu tượng và phiếu x2 kể cả khi bị Sói Đầu Đàn biến thành Sói. */
  isMayor: boolean;
}

type StepId =
  | 'cupid'
  | 'guard'
  | 'wolves'
  | 'wolves2'
  | 'alpha'
  | 'whitewolf'
  | 'seer'
  | 'sorceress'
  | 'medium'
  | 'detective'
  | 'witchHeal'
  | 'witchPoison'
  | 'psychic';

interface Step {
  id: StepId;
  wake: CueDef[];
  sleep: CueDef[];
  /** Người thao tác được (sống và có việc để làm). Rỗng nghĩa là chờ ngẫu nhiên. */
  actors: number[];
  /** Người dậy nhưng chỉ xem (Kẻ Phản Bội). */
  observers: number[];
  windowMs: number;
}

interface NightState {
  protect: number | null;
  biteRounds: Map<number, number>[];
  biteTargets: number[];
  converted: number | null;
  whiteWolfKill: number | null;
  healed: boolean;
  poison: number | null;
  extraBite: boolean;
}

interface Hunter {
  seat: number;
  set: Set<number>;
  done: (killed: number[]) => void;
  fired: boolean;
}

interface TimerEntry {
  h: ReturnType<typeof setTimeout> | null;
  fn: () => void;
  due: number;
  left: number;
  gen: number;
}

const PACK: RoleId[] = ['werewolf', 'cub', 'alpha', 'whitewolf'];
const isPack = (r: RoleId): boolean => PACK.includes(r);

/** Thứ tự gọi vai trong đêm. `cards` là các lá bài đại diện: ván không có lá nào thì bỏ qua lượt. */
const ORDER: { id: StepId; cards: RoleId[]; when?: (night: number) => boolean }[] = [
  { id: 'cupid', cards: ['cupid'], when: (n) => n === 1 },
  { id: 'guard', cards: ['guard'] },
  { id: 'wolves', cards: ['werewolf', 'cub', 'alpha', 'whitewolf'] },
  { id: 'wolves2', cards: ['werewolf', 'cub', 'alpha', 'whitewolf'] },
  { id: 'alpha', cards: ['alpha'] },
  { id: 'whitewolf', cards: ['whitewolf'], when: (n) => n % 2 === 0 },
  { id: 'seer', cards: ['seer', 'seeress'] },
  { id: 'sorceress', cards: ['sorceress'] },
  { id: 'medium', cards: ['medium'] },
  { id: 'detective', cards: ['detective'] },
  { id: 'witchHeal', cards: ['witch'] },
  { id: 'witchPoison', cards: ['witch'] },
  { id: 'psychic', cards: ['psychic'] },
];

/** Phe dùng cho Nhà Ngoại Cảm: Dân, Sói (gồm Kẻ Phản Bội), Chán Đời, Sói Trắng tính riêng. */
function camp(role: RoleId): string {
  if (isWolfTeam(role)) return 'wolf';
  if (role === 'jester') return 'jester';
  if (role === 'whitewolf') return 'whitewolf';
  return 'village';
}

/**
 * Một ván Ma Sói. Server là quản trò: mọi giờ giấc và kết quả do lớp này quyết.
 */
export class Game {
  readonly players: P[];
  phase: Phase = 'NIGHT';
  night = 0;
  winner: Winner | null = null;
  paused = false;

  private version = 0;
  private cueSeq = 0;
  private fxSeq = 0;
  private gen = 0;
  private timers = new Set<TimerEntry>();
  private maxTimer: ReturnType<typeof setTimeout> | null = null;
  private dead = false;
  private pausedAt = 0;

  private phaseEndsAt: number | null = null;
  private phaseStartedAt = 0;
  private awake = new Set<number>();
  private plan: StepId[] = [];
  private stepIndex = -1;
  private step: Step | null = null;
  private stepActive = false;
  private acted = new Set<number>();
  private votes = new Map<number, number | 'skip'>();
  private skipDiscussSet = new Set<number>();
  private pointers = new Map<number, number | null>();
  private announce: string | null = null;
  private hunter: Hunter | null = null;
  /** Kết quả riêng của từng người. Chỉ giữ kết quả của đêm gần nhất: sang đêm mới thì kết quả cũ không còn hiện nữa. */
  private notes = new Map<number, { night: number; text: string }>();
  private feed: string[] = [];
  private dealt: Set<RoleId>;

  private flags = {
    guardLast: null as number | null,
    alphaUsed: false,
    healLeft: true,
    poisonLeft: true,
    extraBiteNext: false,
  };
  /** Bộ vai đã chia, công khai cho cả bàn biết ván này có những lá nào. */
  private readonly deck: RoleId[];
  private ng: NightState = this.freshNight(false);

  private readonly t: Timings;
  private readonly rng: Rng;
  private readonly now: () => number;

  constructor(inits: PlayerInit[], private deps: GameDeps) {
    this.t = deps.timings;
    this.rng = deps.rng ?? Math.random;
    this.now = deps.now ?? Date.now;
    const roles = deps.roles ?? dealRoles(inits.length, this.rng);
    this.players = inits.map((p, i) => ({
      seat: i,
      sessionId: p.sessionId,
      name: p.name,
      role: roles[i],
      alive: true,
      connected: true,
      lover: null,
      princeUsed: false,
      isMayor: roles[i] === 'mayor',
    }));
    this.dealt = new Set(roles);
    // Kẻ Ngốc và Người Yêu Hoà Bình là vai giấu kín: trong danh sách công khai họ hiện như Dân làng.
    const shown = roles.map((r) => (r === 'fool' || r === 'pacifist' ? 'villager' : r));
    this.deck = ROLE_IDS.flatMap((id) => shown.filter((r) => r === id));
  }

  // ---------------------------------------------------------------- vòng đời

  start(): void {
    this.maxTimer = setTimeout(() => this.endGame('aborted'), this.t.maxGameMs);
    if (this.deps.intro && this.t.introMs > 0) {
      this.phase = 'INTRO';
      this.phaseStartedAt = this.now();
      this.phaseEndsAt = this.now() + this.t.introMs;
      this.after(this.t.introMs, () => this.startNight());
      this.changed();
      return;
    }
    this.startNight();
  }

  destroy(): void {
    this.dead = true;
    this.bump();
    if (this.maxTimer) clearTimeout(this.maxTimer);
    this.maxTimer = null;
  }

  seatOf(sessionId: string): number {
    return this.players.findIndex((p) => p.sessionId === sessionId);
  }

  setConnected(seat: number, connected: boolean): void {
    const p = this.players[seat];
    if (!p || p.connected === connected) return;
    p.connected = connected;
    if (this.phase === 'END' || this.dead) return;

    if (!connected && this.connectedCount() < this.t.minRealPlayers) {
      this.endGame('aborted');
      return;
    }
    if (!connected) this.checkProgress();
    this.changed();
  }

  /** Chủ phòng tạm dừng: đóng băng mọi bộ đếm, giữ nguyên phần giây còn lại. */
  pause(): void {
    if (this.paused || this.dead || this.phase === 'END') return;
    this.paused = true;
    this.pausedAt = this.now();
    for (const e of this.timers) {
      if (e.h) clearTimeout(e.h);
      e.h = null;
      e.left = Math.max(0, e.due - this.pausedAt);
    }
    this.changed();
  }

  resume(): void {
    if (!this.paused || this.dead) return;
    const shift = this.now() - this.pausedAt;
    this.paused = false;
    if (this.phaseEndsAt !== null) this.phaseEndsAt += shift;
    this.phaseStartedAt += shift;
    for (const e of this.timers) this.arm(e, e.left);
    this.changed();
  }

  // --------------------------------------------------------------- thời gian

  /** Huỷ mọi hẹn giờ của giai đoạn trước. */
  private bump(): void {
    this.gen++;
    for (const e of this.timers) if (e.h) clearTimeout(e.h);
    this.timers.clear();
  }

  private arm(e: TimerEntry, ms: number): void {
    e.due = this.now() + ms;
    e.h = setTimeout(() => {
      this.timers.delete(e);
      if (this.dead || e.gen !== this.gen) return;
      e.fn();
    }, ms);
  }

  private after(ms: number, fn: () => void): void {
    const e: TimerEntry = { h: null, fn, due: 0, left: ms, gen: this.gen };
    this.timers.add(e);
    if (!this.paused) this.arm(e, ms);
  }

  private changed(): void {
    this.version++;
    if (!this.dead) this.deps.onChange();
  }

  private cue(def: CueDef, text?: string): void {
    if (this.dead) return;
    const { ms: _ms, ...rest } = def;
    this.deps.onCue({ ...rest, text: text ?? def.text, seq: ++this.cueSeq });
  }

  /** Phát lần lượt nhiều lời: lời sau phát khi lời trước đọc xong. */
  private cueSeqPlay(cues: CueDef[]): void {
    let offset = 0;
    cues.forEach((c, i) => {
      if (i === 0) this.cue(c);
      else this.after(offset, () => this.cue(c));
      offset += c.ms;
    });
  }

  private fx(kind: Fx['kind'], from: number, to: number, color: string, audience: number[]): void {
    this.deps.onFx?.({ seq: ++this.fxSeq, kind, from, to, color }, audience);
  }

  private deadSeats(): number[] {
    return this.players.filter((p) => !p.alive).map((p) => p.seat);
  }

  private rand(min: number, max: number): number {
    return min + Math.floor(this.rng() * (max - min + 1));
  }

  // -------------------------------------------------------------------- đêm

  private freshNight(extraBite: boolean): NightState {
    return {
      protect: null,
      biteRounds: [new Map(), new Map()],
      biteTargets: [],
      converted: null,
      whiteWolfKill: null,
      healed: false,
      poison: null,
      extraBite,
    };
  }

  private startNight(): void {
    this.bump();
    this.night++;
    this.phase = 'NIGHT';
    this.pointers.clear();
    this.awake.clear();
    this.announce = null;
    this.hunter = null;
    this.step = null;
    this.stepActive = false;
    this.stepIndex = -1;
    this.feed = [];
    this.ng = this.freshNight(this.flags.extraBiteNext);
    this.flags.extraBiteNext = false;
    this.plan = ORDER.filter(
      (o) =>
        (!o.when || o.when(this.night)) &&
        o.cards.some((c) => this.dealt.has(c)) &&
        (o.id !== 'wolves2' || this.ng.extraBite),
    ).map((o) => o.id);
    this.phaseEndsAt = null;
    this.cue(CUES.nightStart);
    this.after(CUES.nightStart.ms + this.t.startPauseMs, () => this.nextStep());
    this.changed();
  }

  private lastWolfStep(): StepId {
    return this.ng.extraBite ? 'wolves2' : 'wolves';
  }

  private aliveBy(role: RoleId): number[] {
    return this.players.filter((p) => p.alive && p.role === role).map((p) => p.seat);
  }

  private alivePack(): number[] {
    return this.players.filter((p) => p.alive && isPack(p.role)).map((p) => p.seat);
  }

  /** Người sẽ chết vì bầy Sói (sau khi trừ người được che và người bị biến). */
  private biteVictims(): number[] {
    return this.ng.biteTargets.filter(
      (t) => t !== this.ng.protect && t !== this.ng.converted && this.players[t].alive,
    );
  }

  private canConvert(): boolean {
    if (this.night < 2 || this.flags.alphaUsed) return false;
    if (this.aliveBy('alpha').length === 0) return false;
    const target = this.ng.biteTargets[0];
    if (target === undefined || target === this.ng.protect) return false;
    const alive = this.players.filter((p) => p.alive).length;
    const wolfAfter = this.players.filter((p) => p.alive && isWolfTeam(p.role)).length + 1;
    return wolfAfter < alive - wolfAfter;
  }

  private whiteWolfTargets(): number[] {
    return this.players
      .filter((p) => p.alive && (p.role === 'werewolf' || p.role === 'cub' || p.role === 'alpha'))
      .map((p) => p.seat);
  }

  private makeStep(id: StepId): Step {
    const w = this.t.windows;
    const n1 = this.night === 1;
    const traitorDealt = this.dealt.has('traitor');
    const lastWolf = this.lastWolfStep();
    const traitors = this.aliveBy('traitor');

    const base = (
      wake: CueDef[],
      sleep: CueDef[],
      actors: number[],
      windowMs: number,
      observers: number[] = [],
    ): Step => ({ id, wake, sleep, actors, observers, windowMs });

    switch (id) {
      case 'cupid':
        return base([CUES.cupidWake], [CUES.cupidSleep], this.aliveBy('cupid'), w.cupid);
      case 'guard':
        return base([CUES.guardWake], [CUES.guardSleep], this.aliveBy('guard'), w.guard);
      case 'wolves':
      case 'wolves2': {
        const first = id === 'wolves';
        const wake = [first ? CUES.wolfWake : CUES.wolfWakeShort];
        const sleep = id === lastWolf ? [CUES.wolfSleep] : [];
        let observers: number[] = [];
        if (first && n1 && traitorDealt) {
          wake.push(CUES.traitorWake);
          observers = traitors;
        }
        if (id === lastWolf && n1 && traitorDealt) sleep.push(CUES.traitorSleep);
        return base(wake, sleep, this.alivePack(), w.wolf, observers);
      }
      case 'alpha':
        return base(
          [CUES.alphaWake],
          [CUES.alphaSleep],
          this.canConvert() ? this.aliveBy('alpha') : [],
          w.alpha,
        );
      case 'whitewolf':
        return base(
          [CUES.whiteWolfWake],
          [CUES.whiteWolfSleep],
          this.whiteWolfTargets().length > 0 ? this.aliveBy('whitewolf') : [],
          w.whitewolf,
        );
      case 'seer':
        return base(
          [CUES.seerWake],
          [CUES.seerSleep],
          [...this.aliveBy('seer'), ...this.aliveBy('seeress')],
          w.seer,
        );
      case 'sorceress':
        return base([CUES.sorceressWake], [CUES.sorceressSleep], this.aliveBy('sorceress'), w.sorceress);
      case 'medium':
        return base([CUES.mediumWake], [CUES.mediumSleep], this.aliveBy('medium'), w.medium);
      case 'detective':
        return base([CUES.detectiveWake], [CUES.detectiveSleep], this.aliveBy('detective'), w.detective);
      case 'witchHeal':
        return base(
          [CUES.witchWake],
          [],
          this.flags.healLeft && this.biteVictims().length > 0 ? this.aliveBy('witch') : [],
          w.witch,
        );
      case 'witchPoison':
        return base(
          [CUES.witchPoison],
          [CUES.witchSleep],
          this.flags.poisonLeft ? this.aliveBy('witch') : [],
          w.witchPoison,
        );
      case 'psychic':
        return base([CUES.psychicWake], [CUES.psychicSleep], this.aliveBy('psychic'), w.psychic);
    }
  }

  private nextStep(): void {
    this.bump();
    this.stepIndex++;
    if (this.stepIndex >= this.plan.length) {
      this.endOfNight();
      return;
    }
    const step = this.makeStep(this.plan[this.stepIndex]);
    this.step = step;
    this.acted.clear();
    this.stepActive = false;
    this.pointers.clear();
    this.awake = new Set([...step.actors, ...step.observers]);
    this.phaseEndsAt = null;
    this.cueSeqPlay(step.wake);
    this.after(totalMs(step.wake) + this.t.cueGapMs, () => {
      this.stepActive = true;
      const idle = step.actors.length === 0;
      const ms = idle ? this.rand(this.t.idleMinMs, this.t.idleMaxMs) : step.windowMs;
      this.phaseEndsAt = null;
      this.after(ms, () => this.finishStep());
      this.changed();
      this.checkProgress();
    });
    this.changed();
  }

  private finishStep(): void {
    const step = this.step;
    if (!step || !this.stepActive) return;
    this.stepActive = false;
    this.phaseEndsAt = null;
    this.bump();
    this.pointers.clear();
    this.onStepEnd(step);
    this.cueSeqPlay(step.sleep);
    const last = this.stepIndex === this.plan.length - 1;
    this.after(totalMs(step.sleep) + this.t.sleepGapMs, () => {
      if (!last) {
        this.nextStep();
        return;
      }
      // Vai gọi cuối giữ sáng thêm một lúc rồi về đen, sau đó trời sáng.
      this.after(this.t.lastGlowMs, () => {
        this.awake.clear();
        this.changed();
        this.after(600, () => this.endOfNight());
      });
    });
    this.changed();
  }

  /** Chốt kết quả của lượt vừa xong. */
  private onStepEnd(step: Step): void {
    if (step.id === 'wolves' || step.id === 'wolves2') {
      const round = step.id === 'wolves' ? 0 : 1;
      const count = new Map<number, number>();
      for (const t of this.ng.biteRounds[round].values()) count.set(t, (count.get(t) ?? 0) + 1);
      if (count.size > 0) {
        const max = Math.max(...count.values());
        const top = [...count.entries()].filter(([, c]) => c === max).map(([s]) => s);
        this.ng.biteTargets.push(top[Math.floor(this.rng() * top.length)]);
      }
    }
  }

  private activeStep(): Step | null {
    if (this.phase !== 'NIGHT' || !this.stepActive) return null;
    return this.step;
  }

  // ----------------------------------------------------------------- bình minh

  /** Hết đêm: tính ai chết rồi sang trời sáng. */
  private endOfNight(): void {
    this.bump();
    this.phase = 'DAWN';
    this.awake.clear();
    this.pointers.clear();
    this.step = null;

    const ng = this.ng;
    const kills = new Set<number>();
    if (!ng.healed) {
      for (const t of ng.biteTargets) {
        if (t !== ng.converted && t !== ng.protect) kills.add(t);
      }
    }
    if (ng.whiteWolfKill !== null && ng.whiteWolfKill !== ng.protect) kills.add(ng.whiteWolfKill);
    if (ng.poison !== null && ng.poison !== ng.protect) kills.add(ng.poison);

    this.announce = null;
    this.phaseEndsAt = null;
    this.cue(CUES.dawn);
    this.changed();
    this.after(CUES.dawn.ms + 500, () =>
      this.resolveDeaths([...kills], (killed) => {
        const names = killed.map((s) => this.players[s].name);
        this.showAnnounce(
          names.length > 0 ? `Đêm qua, ${names.join(' và ')} đã chết.` : 'Đêm qua không ai chết.',
          this.t.dawnAnnounceMs,
          'DAWN',
          () => {
            if (!this.checkWin()) this.startDiscuss();
          },
        );
      }),
    );
  }

  private showAnnounce(text: string, ms: number, phase: Phase, then: () => void): void {
    this.bump();
    this.phase = phase;
    this.announce = text;
    this.phaseEndsAt = this.now() + ms;
    this.after(ms, then);
    this.changed();
  }

  // ----------------------------------------------------------- chết và Thợ Săn

  /** Thêm người chết, kéo theo người yêu. */
  private expand(set: Set<number>, seat: number): void {
    const p = this.players[seat];
    if (!p || !p.alive || set.has(seat)) return;
    set.add(seat);
    if (p.lover !== null) this.expand(set, p.lover);
  }

  /**
   * Xử lý một đợt người chết. Nếu có Thợ Săn trong đó thì Thợ Săn bắn trước, rồi mới
   * ghi nhận cái chết của tất cả cùng lúc.
   */
  private resolveDeaths(initial: number[], done: (killed: number[]) => void): void {
    const set = new Set<number>();
    for (const s of initial) this.expand(set, s);
    const hunterSeat = [...set].find((s) => this.players[s].role === 'hunter');
    if (hunterSeat === undefined || !this.players[hunterSeat].connected) {
      this.finalizeDeaths(set, null, done);
      return;
    }
    this.bump();
    this.phase = 'HUNTER';
    this.hunter = { seat: hunterSeat, set, done, fired: false };
    this.pointers.clear();
    this.announce = `${this.players[hunterSeat].name} là Thợ Săn! Hãy chọn người để bắn.`;
    this.phaseEndsAt = this.now() + this.t.hunterMs;
    this.after(this.t.hunterMs, () => this.fireHunter(null));
    this.changed();
  }

  private fireHunter(target: number | null): void {
    const h = this.hunter;
    if (!h || h.fired) return;
    h.fired = true;
    this.bump();
    this.pointers.clear();
    this.phaseEndsAt = null;
    if (target === null) {
      this.announce = null;
      this.hunter = null;
      this.finalizeDeaths(h.set, null, h.done);
      return;
    }
    this.cue({ id: 'gunshot', text: '', sfx: 'gunshot', showMs: 0, ms: 0 });
    this.fx('shoot', h.seat, target, '#ffd479', this.players.map((p) => p.seat));
    this.changed();
    this.after(1000, () => {
      this.hunter = null;
      this.announce = null;
      this.finalizeDeaths(h.set, target, h.done);
    });
  }

  private finalizeDeaths(set: Set<number>, shot: number | null, done: (killed: number[]) => void): void {
    if (shot !== null) this.expand(set, shot);
    const killed = [...set];
    for (const s of killed) {
      const p = this.players[s];
      p.alive = false;
      if (p.role === 'cub') this.flags.extraBiteNext = true;
    }
    this.changed();
    done(killed);
  }

  // ------------------------------------------------------------------- ban ngày

  private startDiscuss(): void {
    this.bump();
    this.phase = 'DAY_DISCUSS';
    this.announce = null;
    this.skipDiscussSet.clear();
    this.pointers.clear();
    this.phaseStartedAt = this.now();
    this.phaseEndsAt = this.phaseStartedAt + this.t.discussMs;
    this.after(this.t.discussMs, () => this.startVote());
    this.changed();
  }

  private startVote(): void {
    this.bump();
    this.phase = 'DAY_VOTE';
    this.votes.clear();
    this.pointers.clear();
    this.cue(CUES.voteStart);
    this.phaseEndsAt = this.now() + this.t.voteMs;
    this.after(this.t.voteMs, () => this.resolveVote());
    this.changed();
  }

  private resolveVote(): void {
    this.bump();
    this.pointers.clear();
    // Kẻ Ngốc không được bỏ qua: hết giờ mà chưa chọn thì phiếu rơi vào một người ngẫu nhiên.
    for (const p of this.players) {
      if (p.role !== 'fool' || !p.alive) continue;
      if (this.votes.get(p.seat) === undefined || this.votes.get(p.seat) === 'skip') {
        const others = this.players.filter((x) => x.alive && x.seat !== p.seat);
        if (others.length > 0) this.votes.set(p.seat, others[Math.floor(this.rng() * others.length)].seat);
      }
    }
    const count = new Map<number, number>();
    for (const [voter, v] of this.votes) {
      if (v === 'skip') continue;
      const weight = this.players[voter].isMayor ? 2 : 1;
      count.set(v, (count.get(v) ?? 0) + weight);
    }
    let hanged: number | null = null;
    if (count.size > 0) {
      const max = Math.max(...count.values());
      const top = [...count.entries()].filter(([, c]) => c === max).map(([s]) => s);
      if (top.length === 1) hanged = top[0];
    }

    const next = () => {
      if (!this.checkWin()) this.startNight();
    };

    if (hanged === null) {
      this.showAnnounce('Không ai bị treo cổ.', this.t.executionMs, 'EXECUTION', next);
      return;
    }
    const p = this.players[hanged];
    this.cue(CUES.hang);

    if (p.role === 'prince' && !p.princeUsed) {
      p.princeUsed = true;
      this.showAnnounce(`${p.name} là Hoàng Tử nên không chết!`, this.t.executionMs, 'EXECUTION', next);
      return;
    }
    if (p.role === 'jester') {
      p.alive = false;
      this.showAnnounce(`${p.name} là Chán Đời và đã thắng!`, this.t.executionMs, 'EXECUTION', () =>
        this.endGame('jester'),
      );
      return;
    }
    this.resolveDeaths([hanged], (killed) => {
      const extra = killed.filter((s) => s !== hanged).map((s) => this.players[s].name);
      const text =
        `${p.name} đã bị treo cổ.` + (extra.length > 0 ? ` ${extra.join(' và ')} cũng chết theo.` : '');
      this.showAnnounce(text, this.t.executionMs, 'EXECUTION', next);
    });
  }

  // ---------------------------------------------------------------- thắng thua

  private checkWin(): boolean {
    const w = checkWinner(this.players);
    if (!w) return false;
    this.endGame(w);
    return true;
  }

  private endGame(w: Winner): void {
    if (this.phase === 'END') return;
    this.bump();
    this.phase = 'END';
    this.winner = w;
    this.awake.clear();
    this.pointers.clear();
    this.announce = null;
    this.hunter = null;
    this.phaseEndsAt = this.now() + this.t.resultMs;
    this.after(this.t.resultMs, () => this.deps.onEnd());
    this.changed();
  }

  // --------------------------------------------------------------- hành động

  private connectedCount(): number {
    return this.players.filter((p) => p.connected).length;
  }

  /** Ai còn phải thao tác ở giai đoạn hiện tại. */
  private pendingActors(): number[] {
    const step = this.activeStep();
    if (step) {
      return step.actors.filter(
        (s) => this.players[s].alive && this.players[s].connected && !this.acted.has(s),
      );
    }
    if (this.phase === 'DAY_VOTE') {
      return this.players
        .filter((p) => p.alive && p.connected && !this.votes.has(p.seat))
        .map((p) => p.seat);
    }
    return [];
  }

  /** Nếu mọi người cần thao tác đã xong thì chuyển bước sớm. */
  private checkProgress(): void {
    if (this.dead || this.paused) return;
    if (this.phase === 'HUNTER' && this.hunter && !this.hunter.fired) {
      if (!this.players[this.hunter.seat].connected) this.fireHunter(null);
      return;
    }
    const step = this.activeStep();
    if (step && step.actors.length > 0 && this.pendingActors().length === 0) {
      this.finishStep();
    } else if (this.phase === 'DAY_VOTE' && this.pendingActors().length === 0) {
      this.resolveVote();
    } else if (this.phase === 'DAY_DISCUSS') {
      const need = this.players.filter((p) => p.alive && p.connected);
      if (need.length > 0 && need.every((p) => this.skipDiscussSet.has(p.seat))) {
        this.startVote();
      }
    }
  }

  private name(seat: number): string {
    return this.players[seat]?.name ?? '?';
  }

  private promptFor(seat: number): Prompt | null {
    const p = this.players[seat];
    if (!p || !p.alive || this.paused) return null;

    if (this.phase === 'HUNTER') {
      const h = this.hunter;
      if (!h || h.fired || h.seat !== seat) return null;
      // Thợ Săn đang chờ chết nên vẫn "sống" ở đây; không bắn người cùng chết với mình.
      return {
        kind: 'shoot',
        label: 'Bắn',
        skipLabel: 'Bỏ qua',
        pick: 1,
        targets: this.players
          .filter((x) => x.alive && !h.set.has(x.seat))
          .map((x) => x.seat),
      };
    }
    if (this.phase === 'DAY_VOTE') {
      if (this.votes.has(seat)) return null;
      if (p.role === 'pacifist') {
        // Không có ai để chọn: chỉ bấm "Bỏ qua" được.
        return {
          kind: 'vote',
          label: 'Vote',
          skipLabel: 'Bỏ qua',
          pick: 1,
          targets: [],
          info: 'Bạn là Người Yêu Hoà Bình: phiếu của bạn luôn là bỏ qua',
        };
      }
      return {
        kind: 'vote',
        label: 'Vote',
        skipLabel: p.role === 'fool' ? 'Chọn ngẫu nhiên' : 'Bỏ qua',
        pick: 1,
        targets: this.players.filter((x) => x.alive && x.seat !== seat).map((x) => x.seat),
        info: p.role === 'fool' ? 'Bạn là Kẻ Ngốc: không được bỏ qua phiếu' : undefined,
      };
    }

    const step = this.activeStep();
    if (!step || !step.actors.includes(seat) || this.acted.has(seat)) return null;
    const others = (pred: (x: P) => boolean = () => true) =>
      this.players.filter((x) => x.alive && x.seat !== seat && pred(x)).map((x) => x.seat);

    switch (step.id) {
      case 'cupid':
        return {
          kind: 'pair',
          label: 'Ghép đôi',
          skipLabel: 'Bỏ qua',
          pick: 2,
          targets: this.players.filter((x) => x.alive).map((x) => x.seat),
        };
      case 'guard':
        return {
          kind: 'protect',
          label: 'Bảo vệ',
          skipLabel: 'Bỏ qua',
          pick: 1,
          targets: this.players
            .filter((x) => x.alive && x.seat !== this.flags.guardLast)
            .map((x) => x.seat),
        };
      case 'wolves':
      case 'wolves2':
        return {
          kind: 'bite',
          label: 'Cắn',
          skipLabel: 'Bỏ qua',
          pick: 1,
          targets: this.players
            .filter((x) => x.alive && !isPack(x.role) && !this.ng.biteTargets.includes(x.seat))
            .map((x) => x.seat),
        };
      case 'alpha':
        return {
          kind: 'convert',
          label: 'Biến thành Sói',
          skipLabel: 'Bỏ qua',
          pick: 0,
          targets: [],
          info: `Người bị cắn: ${this.name(this.ng.biteTargets[0])}`,
        };
      case 'whitewolf':
        return {
          kind: 'killWolf',
          label: 'Giết',
          skipLabel: 'Bỏ qua',
          pick: 1,
          targets: this.whiteWolfTargets(),
        };
      case 'seer':
        return { kind: 'see', label: 'Soi', skipLabel: 'Bỏ qua', pick: 1, targets: others() };
      case 'sorceress':
        return { kind: 'findSeer', label: 'Tìm', skipLabel: 'Bỏ qua', pick: 1, targets: others() };
      case 'medium':
        return { kind: 'sense', label: 'Cảm nhận', skipLabel: 'Bỏ qua', pick: 1, targets: others() };
      case 'detective':
        return {
          kind: 'scan',
          label: 'Dò',
          skipLabel: 'Bỏ qua',
          pick: 1,
          targets: this.players.filter((x) => x.alive).map((x) => x.seat),
        };
      case 'witchHeal': {
        const victims = this.biteVictims().map((s) => this.name(s));
        return {
          kind: 'heal',
          label: 'Cứu',
          skipLabel: 'Bỏ qua',
          pick: 0,
          targets: [],
          info: `Đêm nay ${victims.join(' và ')} sẽ chết`,
        };
      }
      case 'witchPoison':
        return { kind: 'poison', label: 'Dùng độc', skipLabel: 'Bỏ qua', pick: 1, targets: others() };
      case 'psychic':
        return { kind: 'compare', label: 'So sánh', skipLabel: 'Bỏ qua', pick: 2, targets: others() };
    }
  }

  /** Chỉ con trỏ vào một người (chưa chốt). */
  pointer(seat: number, target: number | null): void {
    const prompt = this.promptFor(seat);
    if (!prompt || prompt.pick === 0) return;
    if (target !== null && !prompt.targets.includes(target)) return;
    if (this.pointers.get(seat) === target) return;
    this.pointers.set(seat, target);
    this.changed();
  }

  /** Bấm nút chốt. Chốt rồi không đổi ý. */
  act(seat: number, kind: string, targets: number[]): void {
    const prompt = this.promptFor(seat);
    if (!prompt || prompt.kind !== kind) return;
    let picked: number[] = [];
    if (prompt.pick === 1) {
      if (targets.length !== 1 || !prompt.targets.includes(targets[0])) return;
      picked = [targets[0]];
    } else if (prompt.pick === 2) {
      if (targets.length !== 2 || targets[0] === targets[1]) return;
      if (!targets.every((t) => prompt.targets.includes(t))) return;
      picked = [targets[0], targets[1]];
    }

    this.pointers.delete(seat);
    if (prompt.kind === 'vote') {
      this.votes.set(seat, picked[0]);
    } else if (prompt.kind === 'shoot') {
      this.fireHunter(picked[0]);
      return;
    } else {
      this.applyNight(seat, prompt.kind, picked);
      this.acted.add(seat);
    }
    this.changed();
    this.checkProgress();
  }

  private applyNight(seat: number, kind: Prompt['kind'], t: number[]): void {
    const me = this.players[seat];
    const who = `${ROLES[me.role].name} (${me.name})`;
    const seeAll = this.deadSeats();
    const addNote = (text: string) => this.notes.set(seat, { night: this.night, text });

    switch (kind) {
      case 'pair': {
        const [a, b] = t;
        this.players[a].lover = b;
        this.players[b].lover = a;
        this.feed.push(`${who} ghép đôi ${this.name(a)} và ${this.name(b)}.`);
        break;
      }
      case 'protect':
        this.ng.protect = t[0];
        this.flags.guardLast = t[0];
        this.feed.push(`${who} che chở ${this.name(t[0])}.`);
        break;
      case 'bite': {
        const round = this.step?.id === 'wolves2' ? 1 : 0;
        this.ng.biteRounds[round].set(seat, t[0]);
        this.feed.push(`${who} cắn ${this.name(t[0])}.`);
        break;
      }
      case 'convert': {
        const target = this.ng.biteTargets[0];
        this.players[target].role = 'werewolf';
        this.ng.converted = target;
        this.flags.alphaUsed = true;
        this.feed.push(`${who} biến ${this.name(target)} thành Sói.`);
        break;
      }
      case 'killWolf':
        this.ng.whiteWolfKill = t[0];
        this.feed.push(`${who} giết ${this.name(t[0])}.`);
        break;
      case 'see': {
        const target = this.players[t[0]];
        // Người Mang Dáng Sói bị soi ra là Sói dù là Dân làng.
        const wolfy = isWolfKind(target.role) || target.role === 'lycan';
        addNote(`Đêm ${this.night}: ${target.name} ${wolfy ? 'là Sói' : 'không phải Sói'}.`);
        this.feed.push(`${who} soi ${target.name}.`);
        break;
      }
      case 'findSeer': {
        const target = this.players[t[0]];
        const isSeer = target.role === 'seer' || target.role === 'seeress';
        addNote(`Đêm ${this.night}: ${target.name} ${isSeer ? 'là Tiên Tri' : 'không phải Tiên Tri'}.`);
        this.feed.push(`${who} tìm Tiên Tri ở ${target.name}.`);
        break;
      }
      case 'sense': {
        const target = this.players[t[0]];
        const special = target.role !== 'villager' && target.role !== 'werewolf';
        addNote(`Đêm ${this.night}: ${target.name} ${special ? 'có vai đặc biệt' : 'không có vai đặc biệt'}.`);
        this.feed.push(`${who} cảm nhận ${target.name}.`);
        break;
      }
      case 'scan': {
        const target = this.players[t[0]];
        const n = this.players.length;
        const around = [(t[0] + n - 1) % n, t[0], (t[0] + 1) % n].map((s) => this.players[s]);
        const found = around.some((x) => x.alive && isWolfKind(x.role));
        addNote(
          `Đêm ${this.night}: quanh ${target.name} (cùng hai người ngồi cạnh) ${found ? 'có Sói' : 'không có Sói'}.`,
        );
        this.feed.push(`${who} dò quanh ${target.name}.`);
        break;
      }
      case 'heal': {
        this.ng.healed = true;
        this.flags.healLeft = false;
        const victims = this.biteVictims();
        const audience = [seat, ...seeAll];
        for (const v of victims) this.fx('potion', seat, v, '#4ade80', audience);
        this.feed.push(`${who} cứu ${victims.map((v) => this.name(v)).join(' và ')}.`);
        break;
      }
      case 'poison': {
        this.ng.poison = t[0];
        this.flags.poisonLeft = false;
        this.fx('potion', seat, t[0], '#a855f7', [seat, ...seeAll]);
        this.feed.push(`${who} đầu độc ${this.name(t[0])}.`);
        break;
      }
      case 'compare': {
        const [a, b] = t.map((s) => this.players[s]);
        const same = camp(a.role) === camp(b.role);
        addNote(`Đêm ${this.night}: ${a.name} và ${b.name} ${same ? 'cùng phe' : 'khác phe'}.`);
        this.feed.push(`${who} so sánh ${a.name} và ${b.name}.`);
        break;
      }
      default:
        break;
    }
  }

  /** Bấm nút "Bỏ qua" của lượt đang mở. */
  skip(seat: number): void {
    const prompt = this.promptFor(seat);
    if (!prompt) return;
    this.pointers.delete(seat);
    if (prompt.kind === 'vote') {
      // Kẻ Ngốc không bỏ qua được: nút "Chọn ngẫu nhiên" chọn giúp một người.
      const pool = prompt.targets;
      const fool = this.players[seat].role === 'fool' && pool.length > 0;
      this.votes.set(seat, fool ? pool[Math.floor(this.rng() * pool.length)] : 'skip');
    } else if (prompt.kind === 'shoot') {
      this.fireHunter(null);
      return;
    } else {
      if (prompt.kind === 'protect') this.flags.guardLast = null;
      this.acted.add(seat);
    }
    this.changed();
    this.checkProgress();
  }

  skipDiscuss(seat: number): void {
    if (this.phase !== 'DAY_DISCUSS' || this.paused) return;
    const p = this.players[seat];
    if (!p || !p.alive) return;
    if (this.now() < this.phaseStartedAt + this.t.skipDiscussAfterMs) return;
    if (this.skipDiscussSet.has(seat)) return;
    this.skipDiscussSet.add(seat);
    this.changed();
    this.checkProgress();
  }

  /** Kết quả của đêm hiện tại (nếu có). Đêm sau là mất, người chơi phải tự nhớ. */
  private currentNote(seat: number): string[] {
    const n = this.notes.get(seat);
    return n && n.night === this.night ? [n.text] : [];
  }

  /** Chat riêng của bầy Sói: chỉ trong lượt bầy Sói, chỉ Sói còn sống đọc được. */
  chatWolf(seat: number, raw: string): void {
    const p = this.players[seat];
    const step = this.activeStep();
    if (!p || !p.alive || !isPack(p.role) || this.paused) return;
    if (!step || (step.id !== 'wolves' && step.id !== 'wolves2')) return;
    const text = raw.replace(/\s+/g, ' ').trim().slice(0, 120);
    if (!text) return;
    this.deps.onChat?.({ seat, name: p.name, text }, this.alivePack());
  }

  // --------------------------------------------------------------------- view

  /** Dữ liệu riêng cho một người: không bao giờ chứa vai của người khác. */
  viewFor(seat: number): GameView {
    const me = this.players[seat];
    const ended = this.phase === 'END';
    const night = this.phase === 'NIGHT';
    const mePack = isPack(me.role);
    const meTraitor = me.role === 'traitor';
    const spectator = !me.alive;
    const wolvesStep = this.activeStep()?.id === 'wolves' || this.activeStep()?.id === 'wolves2';
    const showBites = night && wolvesStep && (mePack || spectator);
    const showVotes = this.phase === 'DAY_VOTE' || this.phase === 'EXECUTION';

    const biteCount = new Map<number, number>();
    for (const round of this.ng.biteRounds) {
      for (const t of round.values()) biteCount.set(t, (biteCount.get(t) ?? 0) + 1);
    }
    const voteCount = new Map<number, number>();
    for (const v of this.votes.values()) {
      if (v !== 'skip') voteCount.set(v, (voteCount.get(v) ?? 0) + 1);
    }

    const players: PlayerView[] = this.players.map((p) => {
      let icon: IconId | null = null;
      if (ended) icon = p.alive ? p.role : 'tomb';
      else if (!p.alive) icon = 'tomb';
      else if (p.seat === seat) icon = p.role;
      else if ((mePack || meTraitor) && isPack(p.role)) icon = 'wolf';
      else if (p.isMayor) icon = 'mayor';
      else if (p.role === 'prince' && p.princeUsed) icon = 'prince';

      let count: number | null = null;
      if (showVotes) count = voteCount.get(p.seat) ?? 0;
      else if (showBites) count = biteCount.get(p.seat) ?? 0;

      // Biểu tượng phụ: trái tim cặp đôi; hoặc mũ Thị Trưởng khi icon chính đang là biểu tượng khác
      // (Thị Trưởng bị biến thành Sói: người ngoài vẫn thấy mũ, Sói thấy cả biểu tượng Sói lẫn mũ).
      let mark: IconId | null = null;
      if (p.alive && me.alive && me.lover === p.seat && p.seat !== seat) mark = 'heart';
      else if (p.alive && p.isMayor && icon !== 'mayor') mark = 'mayor';

      return {
        seat: p.seat,
        name: p.name,
        alive: p.alive,
        connected: p.connected,
        icon,
        mark,
        count,
        armed: this.phase === 'HUNTER' && this.hunter?.seat === p.seat && !this.hunter.fired,
      };
    });

    // Con trỏ: ban ngày công khai; ban đêm chỉ Sói thấy của nhau và người chết thấy tất cả.
    const pointers: Record<number, number | null> = {};
    if (this.phase === 'DAY_VOTE' || this.phase === 'HUNTER') {
      for (const [s, t] of this.pointers) pointers[s] = t;
    } else if (night) {
      for (const [s, t] of this.pointers) {
        if (spectator || s === seat || (mePack && isPack(this.players[s].role))) pointers[s] = t;
      }
    }

    const roles: Record<number, RoleId> | null = ended
      ? Object.fromEntries(this.players.map((p) => [p.seat, p.role]))
      : null;

    return {
      version: this.version,
      phase: this.phase,
      night: this.night,
      serverNow: this.now(),
      phaseEndsAt: this.phaseEndsAt,
      paused: this.paused,
      skipDiscussAt:
        this.phase === 'DAY_DISCUSS' ? this.phaseStartedAt + this.t.skipDiscussAfterMs : null,
      hasSkippedDiscuss: this.skipDiscussSet.has(seat),
      awake: night ? me.alive && this.awake.has(seat) : true,
      announce: this.announce,
      winner: this.winner,
      me: { seat, role: me.role, alive: me.alive },
      players,
      pointers,
      prompt: this.promptFor(seat),
      notes: this.currentNote(seat),
      canChat: me.alive && mePack && wolvesStep && !this.paused,
      feed: spectator && night ? this.feed : null,
      deck: this.deck,
      roles,
    };
  }
}
