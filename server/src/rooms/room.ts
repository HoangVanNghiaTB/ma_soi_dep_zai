import { DEFAULT_TIMINGS, EDITABLE_TIMINGS, EV, MAX_SEATS, MAX_WATCH, ROLES } from '@ms/shared';
import type { ChatMsg, Cue, Fx, LobbySeat, RoleId, RoomOptions, RoomState, Timings } from '@ms/shared';
import { Game } from '../game/game';
import { shuffle } from '../game/deal';

export type Emit = (socketId: string, event: string, payload: unknown) => void;

interface SeatInfo {
  sessionId: string;
  name: string;
  socketId: string | null;
  connected: boolean;
  /** Đang ngồi trong ván đang chạy. */
  inGame: boolean;
  /** Đã rời giữa ván, sẽ bị dọn khi ván xong. */
  left: boolean;
  graceTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Chỉ dùng khi thử nghiệm: đặt biến môi trường MS_DEBUG_ROLES="werewolf,villager,..." (theo thứ tự ghế)
 * để ép vai. Không đặt thì chia ngẫu nhiên như bình thường.
 */
function debugRoles(n: number): RoleId[] | undefined {
  const raw = process.env.MS_DEBUG_ROLES;
  if (!raw) return undefined;
  const list = raw.split(',').map((s) => s.trim());
  return list.length === n && list.every((r) => r in ROLES) ? (list as RoleId[]) : undefined;
}

/** Số lá tối đa của mỗi vai khi chủ phòng chọn tay. */
function maxCopies(r: RoleId): number {
  return r === 'villager' ? MAX_SEATS : r === 'werewolf' ? 3 : 1;
}

/** Kiểm tra danh sách vai chọn tay; trả về lời báo lỗi hoặc null nếu hợp lệ. */
export function checkRoleList(roles: RoleId[]): string | null {
  if (roles.length === 0) return null;
  const wolves = roles.filter((r) => ROLES[r].faction === 'wolf' && r !== 'traitor').length;
  if (wolves === 0) return 'Cần ít nhất một Sói (Ma Sói, Sói Con, Sói Đầu Đàn hoặc Sói Trắng).';
  if (!roles.some((r) => ROLES[r].faction !== 'wolf')) return 'Cần có người không thuộc phe Sói.';
  return null;
}

export type JoinResult = { ok: true; seat: number } | { ok: false; error: string };

/** Ghế chờ: nếu mất kết nối ở bàn chờ quá lâu thì nhường ghế. */
const LOBBY_GRACE_MS = 20_000;

export class Room {
  readonly code: string;
  readonly settings: Timings;
  seats: (SeatInfo | null)[] = Array(MAX_SEATS).fill(null);
  /** Ghế xem: chỉ nghe lời quản trò, không tính là người chơi. */
  watchers: (SeatInfo | null)[] = Array(MAX_WATCH).fill(null);
  hostSession: string | null = null;
  game: Game | null = null;
  options: RoomOptions = { intro: true, roles: [] };
  countdownEndsAt: number | null = null;

  private countdownTimer: ReturnType<typeof setTimeout> | null = null;
  private emptyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    code: string,
    private emit: Emit,
    private onEmpty: (room: Room) => void,
    settings: Timings = DEFAULT_TIMINGS,
  ) {
    this.code = code;
    this.settings = { ...settings };
  }

  // ------------------------------------------------------------------ truy vấn

  seatOfSession(sessionId: string): number {
    return this.seats.findIndex((s) => s?.sessionId === sessionId);
  }

  watcherOfSession(sessionId: string): number {
    return this.watchers.findIndex((s) => s?.sessionId === sessionId);
  }

  get status(): RoomState['status'] {
    if (this.game) return 'IN_GAME';
    return this.countdownEndsAt !== null ? 'COUNTDOWN' : 'LOBBY';
  }

  private seated(): number[] {
    return this.seats.flatMap((s, i) => (s && !s.left ? [i] : []));
  }

  isEmpty(): boolean {
    return this.seats.every((s) => s === null || !s.connected);
  }

  // ----------------------------------------------------------------- vào / ra

  join(sessionId: string, name: string, socketId: string): JoinResult {
    this.clearEmptyTimer();
    const cleanName = name.trim().slice(0, 16) || 'Người chơi';

    const w = this.watcherOfSession(sessionId);
    if (w >= 0) {
      const ws = this.watchers[w]!;
      ws.socketId = socketId;
      ws.connected = true;
      if (ws.graceTimer) clearTimeout(ws.graceTimer);
      ws.graceTimer = null;
      this.broadcast();
      return { ok: true, seat: -1 };
    }

    const existing = this.seatOfSession(sessionId);
    if (existing >= 0) {
      const s = this.seats[existing]!;
      s.socketId = socketId;
      s.connected = true;
      s.left = false;
      if (s.graceTimer) clearTimeout(s.graceTimer);
      s.graceTimer = null;
      if (this.game && s.inGame) {
        const gs = this.game.seatOf(sessionId);
        if (gs >= 0) this.game.setConnected(gs, true);
      }
      this.broadcast();
      return { ok: true, seat: existing };
    }

    const free = this.seats.findIndex((s) => s === null);
    if (free < 0) {
      // Bàn đầy thì vào ghế xem nếu còn.
      const fw = this.watchers.findIndex((s) => s === null);
      if (fw < 0) return { ok: false, error: 'Phòng đã đầy.' };
      this.watchers[fw] = this.newInfo(sessionId, cleanName, socketId);
      this.broadcast();
      return { ok: true, seat: -1 };
    }

    this.seats[free] = this.newInfo(sessionId, cleanName, socketId);
    if (!this.hostSession) this.hostSession = sessionId;
    this.broadcast();
    return { ok: true, seat: free };
  }

  private newInfo(sessionId: string, name: string, socketId: string): SeatInfo {
    return { sessionId, name, socketId, connected: true, inGame: false, left: false, graceTimer: null };
  }

  /** Người chơi chủ động rời phòng. */
  leave(sessionId: string): void {
    const w = this.watcherOfSession(sessionId);
    if (w >= 0) {
      this.watchers[w] = null;
      this.broadcast();
      return;
    }
    const idx = this.seatOfSession(sessionId);
    if (idx < 0) return;
    const s = this.seats[idx]!;
    s.socketId = null;
    s.connected = false;
    this.dropOrMark(idx);
  }

  /** Mất kết nối (đóng tab, rớt mạng). */
  disconnect(socketId: string): void {
    const w = this.watchers.findIndex((s) => s?.socketId === socketId);
    if (w >= 0) {
      const ws = this.watchers[w]!;
      ws.socketId = null;
      ws.connected = false;
      ws.graceTimer = setTimeout(() => {
        if (this.watchers[w] === ws && !ws.connected) {
          this.watchers[w] = null;
          this.broadcast();
        }
      }, LOBBY_GRACE_MS);
      this.broadcast();
      return;
    }
    const idx = this.seats.findIndex((s) => s?.socketId === socketId);
    if (idx < 0) return;
    const s = this.seats[idx]!;
    s.socketId = null;
    s.connected = false;

    if (this.game && s.inGame) {
      const gs = this.game.seatOf(s.sessionId);
      if (gs >= 0) this.game.setConnected(gs, false);
      this.afterPresenceChange();
      return;
    }
    // Ở bàn chờ: giữ ghế một lúc phòng khi chỉ chớp mạng.
    s.graceTimer = setTimeout(() => {
      if (this.seats[idx] === s && !s.connected) this.dropOrMark(idx);
    }, LOBBY_GRACE_MS);
    this.afterPresenceChange();
  }

  private dropOrMark(idx: number): void {
    const s = this.seats[idx];
    if (!s) return;
    if (this.game && s.inGame) {
      s.left = true;
      const gs = this.game.seatOf(s.sessionId);
      if (gs >= 0) this.game.setConnected(gs, false);
    } else {
      if (s.graceTimer) clearTimeout(s.graceTimer);
      this.seats[idx] = null;
      if (this.hostSession === s.sessionId) this.transferHost();
    }
    this.afterPresenceChange();
  }

  private transferHost(): void {
    const next = this.seats.find((s) => s && !s.left && s.connected);
    this.hostSession = next ? next.sessionId : null;
  }

  private afterPresenceChange(): void {
    const host = this.hostSession ? this.seatOfSession(this.hostSession) : -1;
    if (host < 0 || !this.seats[host]!.connected) this.transferHost();

    if (!this.game && this.countdownEndsAt !== null && this.seated().length < this.settings.minPlayers) {
      this.cancelCountdown();
    }
    this.broadcast();

    if (this.isEmpty() && !this.emptyTimer) {
      this.emptyTimer = setTimeout(() => this.onEmpty(this), this.settings.emptyRoomMs);
    }
  }

  private clearEmptyTimer(): void {
    if (this.emptyTimer) clearTimeout(this.emptyTimer);
    this.emptyTimer = null;
  }

  /** Chủ phòng mời một người ra khỏi bàn chờ. */
  kick(sessionId: string, seat: number): string | null {
    if (this.hostSession !== sessionId) return 'Chỉ chủ phòng mới mời người ra được.';
    if (this.status !== 'LOBBY') return 'Chỉ mời được khi chưa bắt đầu ván.';
    if (seat >= MAX_SEATS) {
      const w = seat - MAX_SEATS;
      const ws = this.watchers[w];
      if (!ws) return 'Ghế này đang trống.';
      if (ws.socketId) this.emit(ws.socketId, EV.roomKicked, {});
      if (ws.graceTimer) clearTimeout(ws.graceTimer);
      this.watchers[w] = null;
      this.broadcast();
      return null;
    }
    const s = this.seats[seat];
    if (!s) return 'Ghế này đang trống.';
    if (s.sessionId === sessionId) return 'Bạn không thể tự mời mình.';
    if (s.socketId) this.emit(s.socketId, EV.roomKicked, {});
    if (s.graceTimer) clearTimeout(s.graceTimer);
    this.seats[seat] = null;
    this.afterPresenceChange();
    return null;
  }

  /** Chủ phòng chỉnh các mốc thời gian (giây), áp dụng từ ván sau. */
  updateSettings(sessionId: string, patch: Record<string, unknown>): string | null {
    if (this.hostSession !== sessionId) return 'Chỉ chủ phòng mới chỉnh được.';
    if (this.status !== 'LOBBY') return 'Chỉ chỉnh được khi chưa bắt đầu ván.';
    for (const f of EDITABLE_TIMINGS) {
      const v = patch[f.key];
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      const sec = Math.min(f.max, Math.max(f.min, Math.round(v)));
      (this.settings as unknown as Record<string, number>)[f.key] = sec * 1000;
    }
    this.broadcast();
    return null;
  }

  /** Chủ phòng bật/tắt thời gian đọc vai và chọn vai cho ván sau. */
  updateOptions(sessionId: string, patch: { intro?: unknown; roles?: unknown }): string | null {
    if (this.hostSession !== sessionId) return 'Chỉ chủ phòng mới chỉnh được.';
    if (this.status !== 'LOBBY') return 'Chỉ chỉnh được khi chưa bắt đầu ván.';
    if (typeof patch.intro === 'boolean') this.options.intro = patch.intro;
    if (patch.roles !== undefined) {
      const list = patch.roles;
      if (!Array.isArray(list) || list.length > MAX_SEATS) return 'Danh sách vai không hợp lệ.';
      if (!list.every((r) => typeof r === 'string' && r in ROLES)) return 'Danh sách vai không hợp lệ.';
      const roles = list as RoleId[];
      for (const r of new Set(roles)) {
        if (roles.filter((x) => x === r).length > maxCopies(r)) {
          return `Vai ${ROLES[r].name} chỉ được chọn tối đa ${maxCopies(r)} lá.`;
        }
      }
      this.options.roles = roles;
    }
    this.broadcast();
    return null;
  }

  pause(sessionId: string): void {
    if (this.hostSession !== sessionId || !this.game) return;
    this.game.pause();
  }

  resume(sessionId: string): void {
    if (this.hostSession !== sessionId || !this.game) return;
    this.game.resume();
  }

  /** Chuyển sang ghế xem (chỉ nghe quản trò). Chủ phòng và người đang chơi dở ván không chuyển được. */
  moveToWatch(sessionId: string, slot: number): void {
    if (slot < 0 || slot >= MAX_WATCH || this.watchers[slot] !== null) return;
    const from = this.seatOfSession(sessionId);
    if (from < 0 || this.seats[from]!.inGame || this.hostSession === sessionId) return;
    this.watchers[slot] = this.seats[from];
    this.seats[from] = null;
    this.broadcast();
  }

  moveSeat(sessionId: string, to: number): void {
    // Từ ghế xem về ghế chơi (còn trống) thì được ở mọi lúc, như người mới vào giữa ván.
    const w = this.watcherOfSession(sessionId);
    if (w >= 0) {
      if (to < 0 || to >= MAX_SEATS || this.seats[to] !== null) return;
      this.seats[to] = this.watchers[w];
      this.watchers[w] = null;
      this.broadcast();
      return;
    }
    if (this.status !== 'LOBBY') return;
    const from = this.seatOfSession(sessionId);
    if (from < 0 || to < 0 || to >= MAX_SEATS || this.seats[to] !== null) return;
    this.seats[to] = this.seats[from];
    this.seats[from] = null;
    this.broadcast();
  }

  // ---------------------------------------------------------------- bắt đầu

  /** Chủ phòng bấm Bắt đầu. */
  requestStart(sessionId: string): string | null {
    if (this.hostSession !== sessionId) return 'Chỉ chủ phòng mới bắt đầu được.';
    if (this.status !== 'LOBBY') return 'Ván đang chạy hoặc đang đếm ngược.';
    const n = this.seated().length;
    if (n < this.settings.minPlayers) {
      return `Cần ít nhất ${this.settings.minPlayers} người để bắt đầu.`;
    }
    const bad = this.roleProblem(n);
    if (bad) return bad;
    if (n >= this.settings.maxPlayers) {
      this.startGame();
      return null;
    }
    this.countdownEndsAt = Date.now() + this.settings.countdownMs;
    this.countdownTimer = setTimeout(() => this.finishCountdown(), this.settings.countdownMs);
    this.broadcast();
    return null;
  }

  /** Lý do không bắt đầu được nếu vai chọn tay không khớp số người. */
  private roleProblem(n: number): string | null {
    const roles = this.options.roles;
    if (roles.length === 0) return null;
    if (roles.length !== n) return `Bạn đã chọn ${roles.length} vai nhưng đang có ${n} người. Hãy chọn đủ ${n} vai hoặc xoá hết để chia ngẫu nhiên.`;
    return checkRoleList(roles);
  }

  private finishCountdown(): void {
    this.countdownTimer = null;
    this.countdownEndsAt = null;
    if (this.seated().length < this.settings.minPlayers || this.roleProblem(this.seated().length)) {
      this.broadcast();
      return;
    }
    this.startGame();
  }

  private cancelCountdown(): void {
    if (this.countdownTimer) clearTimeout(this.countdownTimer);
    this.countdownTimer = null;
    this.countdownEndsAt = null;
  }

  private startGame(): void {
    this.cancelCountdown();
    const idxs = this.seated();
    for (const i of idxs) this.seats[i]!.inGame = true;

    this.game = new Game(
      idxs.map((i) => ({ sessionId: this.seats[i]!.sessionId, name: this.seats[i]!.name })),
      {
        timings: this.settings,
        roles: debugRoles(idxs.length) ?? (this.options.roles.length === idxs.length ? shuffle(this.options.roles) : undefined),
        intro: this.options.intro,
        onChange: () => this.broadcastGame(),
        onCue: (cue) => this.broadcastCue(cue),
        onFx: (fx, audience) => this.sendToGameSeats(audience, EV.gameFx, fx),
        onChat: (msg, audience) => this.sendToGameSeats(audience, EV.chatWolf, msg),
        onEnd: () => this.endGame(),
      },
    );
    // Người đã mất kết nối từ trước khi bắt đầu thì đánh dấu ngay.
    idxs.forEach((seatIdx, gs) => {
      if (!this.seats[seatIdx]!.connected) this.game!.setConnected(gs, false);
    });
    this.broadcast();
    this.game.start();
  }

  private endGame(): void {
    this.game?.destroy();
    this.game = null;
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      if (!s) continue;
      s.inGame = false;
      if (s.left || !s.connected) {
        if (s.graceTimer) clearTimeout(s.graceTimer);
        this.seats[i] = null;
      }
    }
    this.afterPresenceChange();
  }

  /** Dọn hết hẹn giờ khi phòng bị xoá. */
  dispose(): void {
    this.cancelCountdown();
    this.clearEmptyTimer();
    this.game?.destroy();
    this.game = null;
    for (const s of this.seats) if (s?.graceTimer) clearTimeout(s.graceTimer);
    for (const s of this.watchers) if (s?.graceTimer) clearTimeout(s.graceTimer);
  }

  // ------------------------------------------------------------------ gửi tin

  private roomStateFor(idx: number, watch = -1): RoomState {
    const s = (watch >= 0 ? this.watchers[watch] : this.seats[idx])!;
    const watchSeats: (LobbySeat | null)[] = this.watchers.map((x) =>
      x ? { name: x.name, connected: x.connected, isHost: false, inGame: false } : null,
    );
    const seats: (LobbySeat | null)[] = this.seats.map((x) =>
      x
        ? {
            name: x.name,
            connected: x.connected,
            isHost: x.sessionId === this.hostSession,
            inGame: x.inGame,
          }
        : null,
    );
    return {
      code: this.code,
      mySeat: watch >= 0 ? -1 : idx,
      seats,
      watchSeats,
      myWatch: watch,
      status: this.status,
      countdownEndsAt: this.countdownEndsAt,
      serverNow: Date.now(),
      settings: this.settings,
      options: this.options,
      playing: watch < 0 && s.inGame && !s.left,
    };
  }

  broadcast(): void {
    this.seats.forEach((s, i) => {
      if (s?.socketId) this.emit(s.socketId, EV.roomState, this.roomStateFor(i));
    });
    this.watchers.forEach((s, i) => {
      if (s?.socketId) this.emit(s.socketId, EV.roomState, this.roomStateFor(-1, i));
    });
    this.broadcastGame();
  }

  sendTo(sessionId: string): void {
    const w = this.watcherOfSession(sessionId);
    if (w >= 0) {
      const ws = this.watchers[w]!;
      if (ws.socketId) this.emit(ws.socketId, EV.roomState, this.roomStateFor(-1, w));
      return;
    }
    const i = this.seatOfSession(sessionId);
    const s = i >= 0 ? this.seats[i] : null;
    if (!s?.socketId) return;
    this.emit(s.socketId, EV.roomState, this.roomStateFor(i));
    this.sendGameView(s);
  }

  private sendGameView(s: SeatInfo): void {
    if (!this.game || !s.socketId || !s.inGame) return;
    const gs = this.game.seatOf(s.sessionId);
    if (gs < 0) return;
    this.emit(s.socketId, EV.gameView, this.game.viewFor(gs));
  }

  private broadcastGame(): void {
    if (!this.game) return;
    for (const s of this.seats) if (s) this.sendGameView(s);
  }

  /** Gửi một sự kiện cho một nhóm ghế trong ván (số ghế trong ván, không phải ghế ở bàn chờ). */
  private sendToGameSeats(gameSeats: number[], event: string, payload: Fx | ChatMsg): void {
    const game = this.game;
    if (!game) return;
    for (const gs of gameSeats) {
      const sessionId = game.players[gs]?.sessionId;
      const s = sessionId ? this.seats[this.seatOfSession(sessionId)] : null;
      if (s?.socketId) this.emit(s.socketId, event, payload);
    }
  }

  private broadcastCue(cue: Cue): void {
    for (const s of this.seats) {
      if (s?.socketId && s.inGame) this.emit(s.socketId, EV.gameCue, cue);
    }
    for (const s of this.watchers) if (s?.socketId) this.emit(s.socketId, EV.gameCue, cue);
  }
}
