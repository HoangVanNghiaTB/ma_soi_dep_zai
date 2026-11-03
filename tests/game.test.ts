import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { DEFAULT_TIMINGS } from '@ms/shared';
import type { ChatMsg, Cue, Fx, GameView, RoleId, Timings } from '@ms/shared';
import { Game } from '../server/src/game/game';

// ----------------------------------------------------------------- tiện ích

function mulberry32(seed: number): () => number {
  let a = seed >>> 0;
  return () => {
    a = (a + 0x6d2b79f5) >>> 0;
    let t = a;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

interface Harness {
  game: Game;
  cues: Cue[];
  fxs: { fx: Fx; audience: number[] }[];
  chats: { msg: ChatMsg; audience: number[] }[];
  ended: () => boolean;
}

function make(roles: RoleId[], opts: { rng?: () => number; timings?: Partial<Timings> } = {}): Harness {
  const cues: Cue[] = [];
  const fxs: Harness['fxs'] = [];
  const chats: Harness['chats'] = [];
  let ended = false;
  const game = new Game(
    roles.map((_, i) => ({ sessionId: `s${i}`, name: `P${i}` })),
    {
      timings: { ...DEFAULT_TIMINGS, ...opts.timings },
      rng: opts.rng ?? mulberry32(7),
      roles,
      onChange: () => {},
      onCue: (c) => cues.push(c),
      onFx: (fx, audience) => fxs.push({ fx, audience }),
      onChat: (msg, audience) => chats.push({ msg, audience }),
      onEnd: () => {
        ended = true;
      },
    },
  );
  return { game, cues, fxs, chats, ended: () => ended };
}

const view = (g: Game, seat: number): GameView => g.viewFor(seat);

/** Chạy thời gian cho tới khi điều kiện đúng. */
function run(g: Game, pred: () => boolean, maxMs = 900_000): void {
  let t = 0;
  while (!pred()) {
    if (t >= maxMs) throw new Error(`hết giờ chờ (phase=${g.phase}, đêm ${g.night})`);
    vi.advanceTimersByTime(100);
    t += 100;
  }
}

function waitPrompt(g: Game, seat: number, kind: string): void {
  run(g, () => view(g, seat).prompt?.kind === kind);
}

function doAct(g: Game, seat: number, kind: string, targets: number[] = []): void {
  waitPrompt(g, seat, kind);
  g.act(seat, kind, targets);
}

function doSkip(g: Game, seat: number, kind: string): void {
  waitPrompt(g, seat, kind);
  g.skip(seat);
}

function toPhase(g: Game, phase: string): void {
  run(g, () => g.phase === phase);
}

/** Sang hết đêm tới thảo luận ban ngày. */
function toDay(g: Game): void {
  run(g, () => g.phase === 'DAY_DISCUSS' || g.phase === 'END');
}

/** Bỏ phiếu cho từng người theo bảng `votes` (ghế -> ghế | 'skip'), người không có trong bảng thì bỏ qua. */
function vote(g: Game, votes: Record<number, number | 'skip'>): void {
  toPhase(g, 'DAY_VOTE');
  for (const p of g.players) {
    if (!p.alive) continue;
    const v = votes[p.seat];
    if (typeof v === 'number') g.act(p.seat, 'vote', [v]);
    else g.skip(p.seat);
  }
}

/** Qua hết một ngày (không ai bị treo) để sang đêm kế. */
function passDay(g: Game): void {
  const night = g.night;
  toDay(g);
  vote(g, {});
  run(g, () => g.night === night + 1 || g.phase === 'END');
}

beforeEach(() => {
  vi.useFakeTimers();
});
afterEach(() => {
  vi.useRealTimers();
});

const V: RoleId = 'villager';

// ------------------------------------------------------------------- cơ bản

describe('đêm: gọi vai', () => {
  it('chỉ gọi những vai có trong ván', () => {
    const h = make(['werewolf', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    const ids = h.cues.map((c) => c.id);
    expect(ids).toContain('night_start');
    expect(ids).toContain('wolf_wake');
    expect(ids).toContain('wolf_sleep');
    expect(ids).toContain('dawn');
    expect(ids).not.toContain('seer_wake');
    expect(ids).not.toContain('witch_wake');
  });

  it('đúng thứ tự: Bảo Vệ trước Sói, Tiên Tri sau Sói, Phù Thủy sau Tiên Tri', () => {
    const h = make(['werewolf', 'guard', 'seer', 'witch', V, V]);
    h.game.start();
    toDay(h.game);
    const wakes = h.cues.map((c) => c.id).filter((id) => id.endsWith('_wake') || id === 'witch_poison');
    expect(wakes).toEqual(['guard_wake', 'wolf_wake', 'seer_wake', 'witch_wake', 'witch_poison']);
  });

  it('chỉ vai được gọi mới sáng màn hình, người khác tối', () => {
    const h = make(['werewolf', V, V, V, V]);
    h.game.start();
    waitPrompt(h.game, 0, 'bite');
    expect(view(h.game, 0).awake).toBe(true);
    expect(view(h.game, 1).awake).toBe(false);
    expect(view(h.game, 1).prompt).toBeNull();
  });

  it('đêm đầu Kẻ Phản Bội được gọi ngay sau bầy Sói (dậy và ngủ), từ đêm 2 thì không', () => {
    const h = make(['werewolf', 'traitor', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    const ids = h.cues.map((c) => c.id).filter((id) => id.includes('wolf') || id.includes('traitor'));
    expect(ids).toEqual(['wolf_wake', 'traitor_wake', 'wolf_sleep', 'traitor_sleep']);

    passDay(h.game);
    h.cues.length = 0;
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    expect(h.cues.map((c) => c.id).some((id) => id.includes('traitor'))).toBe(false);
  });
});

describe('đêm: Sói cắn', () => {
  it('người bị cắn thành bia mộ và được công bố khi trời sáng', () => {
    const h = make(['werewolf', V, V, V, V]);
    h.game.start();
    doAct(h.game, 0, 'bite', [2]);
    run(h.game, () => h.game.phase === 'DAWN' && view(h.game, 0).announce !== null);
    expect(view(h.game, 0).announce).toContain('P2');
    expect(h.game.players[2].alive).toBe(false);
    expect(view(h.game, 3).players[2].icon).toBe('tomb');
  });

  it('hoà lượt cắn thì chọn ngẫu nhiên một trong những người hoà', () => {
    const h = make(['werewolf', 'cub', V, V, V, V, V]);
    h.game.start();
    waitPrompt(h.game, 0, 'bite');
    h.game.act(0, 'bite', [2]);
    h.game.act(1, 'bite', [3]);
    toDay(h.game);
    expect(h.game.players.filter((p) => !p.alive)).toHaveLength(1);
    expect([2, 3]).toContain(h.game.players.findIndex((p) => !p.alive));
  });

  it('Sói chốt rồi không đổi ý, không cắn được Sói, người ngoài lượt không thao tác được', () => {
    const h = make(['werewolf', 'cub', V, V, V, V]);
    h.game.start();
    waitPrompt(h.game, 0, 'bite');
    const targets = view(h.game, 0).prompt!.targets;
    expect(targets).not.toContain(0);
    expect(targets).not.toContain(1);

    h.game.act(2, 'bite', [3]);
    expect(h.game.viewFor(2).prompt).toBeNull();

    h.game.act(0, 'bite', [2]);
    h.game.act(0, 'bite', [3]);
    expect(view(h.game, 0).prompt).toBeNull();
  });

  it('số lượt cắn hiện trên đầu người bị chọn, chỉ Sói thấy', () => {
    const h = make(['werewolf', 'cub', V, V, V, V]);
    h.game.start();
    waitPrompt(h.game, 0, 'bite');
    h.game.act(0, 'bite', [2]);
    expect(view(h.game, 1).players[2].count).toBe(1);
    expect(view(h.game, 3).players[2].count).toBeNull();
  });
});

// --------------------------------------------------------------------- các vai

describe('Bảo Vệ', () => {
  it('che được người bị cắn', () => {
    const h = make(['werewolf', 'guard', V, V, V]);
    h.game.start();
    doAct(h.game, 1, 'protect', [2]);
    doAct(h.game, 0, 'bite', [2]);
    toDay(h.game);
    expect(h.game.players.every((p) => p.alive)).toBe(true);
  });

  it('che được cả bình độc', () => {
    const h = make(['werewolf', 'guard', 'witch', V, V, V]);
    h.game.start();
    doAct(h.game, 1, 'protect', [3]);
    doSkip(h.game, 0, 'bite');
    doAct(h.game, 2, 'poison', [3]);
    toDay(h.game);
    expect(h.game.players[3].alive).toBe(true);
  });

  it('không chọn cùng một người hai đêm liền', () => {
    const h = make(['werewolf', 'guard', V, V, V, V]);
    h.game.start();
    doAct(h.game, 1, 'protect', [2]);
    doSkip(h.game, 0, 'bite');
    passDay(h.game);
    waitPrompt(h.game, 1, 'protect');
    expect(view(h.game, 1).prompt!.targets).not.toContain(2);
    expect(view(h.game, 1).prompt!.targets).toContain(3);
  });
});

describe('Phù Thủy', () => {
  it('thấy ai sắp chết, ném bình cứu xanh lá thì người đó sống', () => {
    const h = make(['werewolf', 'witch', V, V, V]);
    h.game.start();
    doAct(h.game, 0, 'bite', [2]);
    waitPrompt(h.game, 1, 'heal');
    expect(view(h.game, 1).prompt!.info).toContain('P2');
    h.game.act(1, 'heal', []);
    doSkip(h.game, 1, 'poison');
    toDay(h.game);
    expect(h.game.players[2].alive).toBe(true);
    const potion = h.fxs.find((x) => x.fx.kind === 'potion')!;
    expect(potion.fx.color).toBe('#4ade80');
    expect(potion.fx.from).toBe(1);
    expect(potion.fx.to).toBe(2);
  });

  it('bình độc tím giết người được chọn; hình ném bình chỉ Phù Thủy và người chết thấy', () => {
    const h = make(['werewolf', 'witch', V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    doAct(h.game, 1, 'poison', [3]);
    toDay(h.game);
    expect(h.game.players[3].alive).toBe(false);
    const potion = h.fxs.find((x) => x.fx.kind === 'potion')!;
    expect(potion.fx.color).toBe('#a855f7');
    expect(potion.audience).toContain(1);
    expect(potion.audience).not.toContain(0);
    expect(potion.audience).not.toContain(4);
  });

  it('mỗi bình chỉ dùng một lần', () => {
    const h = make(['werewolf', 'witch', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    doAct(h.game, 1, 'poison', [3]);
    passDay(h.game);
    doSkip(h.game, 0, 'bite');
    run(h.game, () => h.game.phase !== 'NIGHT' || view(h.game, 1).prompt !== null);
    expect(view(h.game, 1).prompt?.kind).not.toBe('poison');
  });
});

describe('Tiên Tri và Nhà Ngoại Cảm', () => {
  it('Tiên Tri soi ra Sói và Sói Trắng là "Sói", Kẻ Phản Bội là "không phải Sói"', () => {
    const h = make(['werewolf', 'seer', 'traitor', V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    doAct(h.game, 1, 'see', [0]);
    expect(view(h.game, 1).notes).toEqual(['Đêm 1: P0 là Sói.']);
    toDay(h.game);
    expect(view(h.game, 1).notes).toEqual(['Đêm 1: P0 là Sói.']);

    // Sang đêm 2: kết quả đêm 1 biến mất, phải tự nhớ.
    passDay(h.game);
    expect(view(h.game, 1).notes).toEqual([]);
    doSkip(h.game, 0, 'bite');
    doAct(h.game, 1, 'see', [2]);
    expect(view(h.game, 1).notes).toEqual(['Đêm 2: P2 không phải Sói.']);
    expect(view(h.game, 3).notes).toEqual([]);

    // Đêm 3 Tiên Tri bỏ qua: ban ngày không có kết quả nào để xem.
    toDay(h.game);
    passDay(h.game);
    doSkip(h.game, 0, 'bite');
    doSkip(h.game, 1, 'see');
    toDay(h.game);
    expect(view(h.game, 1).notes).toEqual([]);
  });

  it('Nhà Ngoại Cảm biết hai người cùng phe hay khác phe', () => {
    const h = make(['werewolf', 'cub', 'psychic', V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    doAct(h.game, 2, 'compare', [0, 1]);
    expect(view(h.game, 2).notes).toEqual(['Đêm 1: P0 và P1 cùng phe.']);
    passDay(h.game);
    expect(view(h.game, 2).notes).toEqual([]);
    doSkip(h.game, 0, 'bite');
    doAct(h.game, 2, 'compare', [0, 3]);
    expect(view(h.game, 2).notes).toEqual(['Đêm 2: P0 và P3 khác phe.']);
  });
});

describe('Thần Tình Yêu', () => {
  it('chỉ hai người trong cặp thấy trái tim, một người chết thì người kia chết theo', () => {
    const h = make(['werewolf', 'cupid', V, V, V, V]);
    h.game.start();
    doAct(h.game, 1, 'pair', [2, 3]);
    expect(view(h.game, 2).players[3].mark).toBe('heart');
    expect(view(h.game, 3).players[2].mark).toBe('heart');
    expect(view(h.game, 4).players[2].mark).toBeNull();
    expect(view(h.game, 4).players[3].mark).toBeNull();

    doAct(h.game, 0, 'bite', [2]);
    run(h.game, () => h.game.phase === 'DAWN' && view(h.game, 0).announce !== null);
    expect(h.game.players[2].alive).toBe(false);
    expect(h.game.players[3].alive).toBe(false);
    expect(view(h.game, 0).announce).toContain('P2 và P3');
  });

  it('chỉ được gọi ở đêm đầu', () => {
    const h = make(['werewolf', 'cupid', V, V, V, V]);
    h.game.start();
    doAct(h.game, 1, 'pair', [2, 3]);
    doSkip(h.game, 0, 'bite');
    passDay(h.game);
    h.cues.length = 0;
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    expect(h.cues.some((c) => c.id === 'cupid_wake')).toBe(false);
  });
});

describe('Thợ Săn', () => {
  it('chết ban đêm thì bắn trước, rồi bia mộ hiện cùng lúc và công bố một thể', () => {
    const h = make(['werewolf', 'hunter', V, V, V]);
    h.game.start();
    doAct(h.game, 0, 'bite', [1]);
    toPhase(h.game, 'HUNTER');

    // Thợ Săn chưa thành bia mộ, được rút súng và chọn người bắn.
    expect(h.game.players[1].alive).toBe(true);
    expect(view(h.game, 2).players[1].armed).toBe(true);
    expect(view(h.game, 1).prompt?.kind).toBe('shoot');
    expect(view(h.game, 1).prompt!.targets).not.toContain(1);

    h.game.act(1, 'shoot', [0]);
    run(h.game, () => h.game.phase === 'DAWN' && view(h.game, 2).announce !== null);
    expect(h.game.players[1].alive).toBe(false);
    expect(h.game.players[0].alive).toBe(false);
    expect(view(h.game, 2).announce).toContain('P1 và P0');
    const shot = h.fxs.find((x) => x.fx.kind === 'shoot')!;
    expect(shot.fx.from).toBe(1);
    expect(shot.fx.to).toBe(0);
    expect(shot.audience).toHaveLength(5);
  });

  it('hết giờ không chọn thì không ai bị bắn', () => {
    const h = make(['werewolf', 'hunter', V, V, V, V]);
    h.game.start();
    doAct(h.game, 0, 'bite', [1]);
    toPhase(h.game, 'HUNTER');
    vi.advanceTimersByTime(DEFAULT_TIMINGS.hunterMs + 100);
    run(h.game, () => h.game.phase === 'DAWN' && view(h.game, 2).announce !== null);
    expect(h.game.players.filter((p) => !p.alive)).toHaveLength(1);
  });

  it('bị treo cổ cũng được bắn', () => {
    const h = make(['werewolf', 'hunter', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vote(h.game, { 0: 1, 1: 0, 2: 1, 3: 1, 4: 1, 5: 1 });
    toPhase(h.game, 'HUNTER');
    h.game.act(1, 'shoot', [0]);
    run(h.game, () => h.game.phase === 'EXECUTION' || h.game.phase === 'END');
    expect(h.game.players[1].alive).toBe(false);
    expect(h.game.players[0].alive).toBe(false);
  });
});

describe('ban ngày', () => {
  it('nhiều phiếu nhất bị treo cổ', () => {
    const h = make(['werewolf', V, V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vote(h.game, { 0: 3, 1: 3, 2: 3, 3: 0, 4: 0, 5: 'skip' });
    run(h.game, () => h.game.phase === 'EXECUTION');
    expect(h.game.players[3].alive).toBe(false);
    expect(view(h.game, 0).announce).toContain('P3 đã bị treo cổ');
  });

  it('hoà phiếu thì không ai bị treo', () => {
    const h = make(['werewolf', V, V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vote(h.game, { 0: 1, 1: 0 });
    run(h.game, () => h.game.phase === 'EXECUTION');
    expect(h.game.players.every((p) => p.alive)).toBe(true);
  });

  it('không vote được chính mình, bấm vote rồi không đổi phiếu, số phiếu công khai', () => {
    const h = make(['werewolf', V, V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    toPhase(h.game, 'DAY_VOTE');
    h.game.act(0, 'vote', [0]);
    expect(view(h.game, 0).prompt).not.toBeNull();
    h.game.act(0, 'vote', [1]);
    expect(view(h.game, 0).prompt).toBeNull();
    h.game.act(0, 'vote', [2]);
    expect(view(h.game, 4).players[1].count).toBe(1);
    expect(view(h.game, 4).players[2].count).toBe(0);
  });

  it('phiếu của Thị Trưởng tính hai phiếu', () => {
    const h = make(['werewolf', 'mayor', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    // Thị Trưởng bầu P2 (2 phiếu), P3 bầu P4 (1 phiếu): P2 bị treo.
    vote(h.game, { 1: 2, 3: 4 });
    run(h.game, () => h.game.phase === 'EXECUTION');
    expect(h.game.players[2].alive).toBe(false);
    expect(h.game.players[4].alive).toBe(true);
    // Mọi người đều thấy biểu tượng Thị Trưởng.
    expect(view(h.game, 3).players[1].icon).toBe('mayor');
  });

  it('Hoàng Tử bị treo lần đầu không chết và lộ vai, lần hai thì chết', () => {
    const h = make(['werewolf', 'prince', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vote(h.game, { 0: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
    run(h.game, () => h.game.phase === 'EXECUTION');
    expect(h.game.players[1].alive).toBe(true);
    expect(view(h.game, 0).announce).toContain('Hoàng Tử');
    expect(view(h.game, 3).players[1].icon).toBe('prince');

    run(h.game, () => h.game.night === 2);
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vote(h.game, { 0: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
    run(h.game, () => h.game.phase === 'EXECUTION' || h.game.phase === 'END');
    expect(h.game.players[1].alive).toBe(false);
  });

  it('Chán Đời bị treo cổ thì thắng ngay', () => {
    const h = make(['werewolf', 'jester', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vote(h.game, { 0: 1, 2: 1, 3: 1, 4: 1, 5: 1 });
    run(h.game, () => h.game.phase === 'END');
    expect(h.game.winner).toBe('jester');
  });
});

describe('phe Sói', () => {
  it('Sói thấy nhau là biểu tượng "wolf" chung, Kẻ Phản Bội thấy Sói nhưng Sói không thấy Kẻ Phản Bội', () => {
    const h = make(['werewolf', 'cub', 'traitor', 'whitewolf', V, V, V, V]);
    h.game.start();
    const sois = view(h.game, 0);
    expect(sois.players[1].icon).toBe('wolf');
    expect(sois.players[3].icon).toBe('wolf'); // Sói Trắng hiện là Sói thường
    expect(sois.players[2].icon).toBeNull(); // không thấy Kẻ Phản Bội
    expect(sois.players[0].icon).toBe('werewolf'); // mình thấy vai chính xác

    const tr = view(h.game, 2);
    expect(tr.players[0].icon).toBe('wolf');
    expect(tr.players[3].icon).toBe('wolf');
    expect(view(h.game, 4).players[0].icon).toBeNull();
  });

  it('Sói Đầu Đàn biến người bị cắn thành Sói từ đêm 2; người đó đổi biểu tượng và vào bầy', () => {
    const h = make(['alpha', 'werewolf', V, V, V, V, V]);
    h.game.start();
    // Đêm 1 chưa được biến: Sói Đầu Đàn được gọi nhưng không có việc.
    doAct(h.game, 0, 'bite', [2]);
    run(h.game, () => view(h.game, 0).awake === false || h.game.phase !== 'NIGHT');
    expect(view(h.game, 0).prompt?.kind).not.toBe('convert');
    toDay(h.game);
    h.game.players[2].alive = true; // hồi sinh để giữ đủ người cho điều kiện biến (chỉ để thử)
    vote(h.game, {});
    run(h.game, () => h.game.night === 2);

    doAct(h.game, 0, 'bite', [3]);
    waitPrompt(h.game, 0, 'convert');
    expect(view(h.game, 0).prompt!.info).toContain('P3');
    h.game.act(0, 'convert', []);
    toDay(h.game);

    expect(h.game.players[3].alive).toBe(true);
    expect(h.game.players[3].role).toBe('werewolf');
    expect(view(h.game, 1).players[3].icon).toBe('wolf');
    expect(view(h.game, 3).players[3].icon).toBe('werewolf');
    expect(view(h.game, 4).players[3].icon).toBeNull();
  });

  it('Sói Đầu Đàn không biến được nếu Bảo Vệ che người đó', () => {
    const h = make(['alpha', 'werewolf', 'guard', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    passDay(h.game);
    doAct(h.game, 2, 'protect', [3]);
    doAct(h.game, 0, 'bite', [3]);
    run(h.game, () => h.game.phase !== 'NIGHT' || view(h.game, 0).prompt?.kind === 'convert');
    expect(view(h.game, 0).prompt?.kind).not.toBe('convert');
  });

  it('Sói Con chết thì đêm sau bầy Sói được cắn thêm một người', () => {
    const h = make(['cub', 'werewolf', V, V, V, V, V]);
    h.game.start();
    doSkip(h.game, 1, 'bite');
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vote(h.game, { 1: 0, 2: 0, 3: 0, 4: 0, 5: 0, 6: 0 });
    run(h.game, () => h.game.night === 2);
    expect(h.game.players[0].alive).toBe(false);

    h.cues.length = 0;
    doAct(h.game, 1, 'bite', [2]);
    waitPrompt(h.game, 1, 'bite');
    expect(view(h.game, 1).prompt!.targets).not.toContain(2);
    h.game.act(1, 'bite', [3]);
    toDay(h.game);
    expect(h.game.players[2].alive).toBe(false);
    expect(h.game.players[3].alive).toBe(false);
    expect(h.cues.map((c) => c.id)).toContain('wolf_wake_short');
  });

  it('Sói Trắng cách một đêm được giết một Sói khác', () => {
    const h = make(['whitewolf', 'werewolf', 'cub', V, V, V, V, V]);
    h.game.start();
    doSkip(h.game, 1, 'bite');
    toDay(h.game);
    expect(h.cues.some((c) => c.id === 'whitewolf_wake')).toBe(false);
    vote(h.game, {});
    run(h.game, () => h.game.night === 2);

    doSkip(h.game, 1, 'bite');
    waitPrompt(h.game, 0, 'killWolf');
    expect(view(h.game, 0).prompt!.targets.sort()).toEqual([1, 2]);
    h.game.act(0, 'killWolf', [2]);
    toDay(h.game);
    expect(h.game.players[2].alive).toBe(false);
    expect(h.game.players[1].alive).toBe(true);
  });

  it('chat Sói: chỉ trong lượt bầy Sói, chỉ Sói còn sống đọc được, Kẻ Phản Bội thì không', () => {
    const h = make(['werewolf', 'cub', 'traitor', V, V, V]);
    h.game.start();
    h.game.chatWolf(0, 'quá sớm');
    expect(h.chats).toHaveLength(0);

    waitPrompt(h.game, 0, 'bite');
    h.game.chatWolf(0, '  cắn   P3 nhé  ');
    expect(h.chats).toHaveLength(1);
    expect(h.chats[0].msg.text).toBe('cắn P3 nhé');
    expect(h.chats[0].audience.sort()).toEqual([0, 1]);

    h.game.chatWolf(3, 'tôi là Dân');
    h.game.chatWolf(2, 'tôi là Kẻ Phản Bội');
    expect(h.chats).toHaveLength(1);

    h.game.act(0, 'bite', [3]);
    h.game.act(1, 'bite', [3]);
    toDay(h.game);
    h.game.chatWolf(0, 'ban ngày');
    expect(h.chats).toHaveLength(1);
  });
});

describe('người chết và tạm dừng', () => {
  it('người chết xem được ai làm gì ban đêm, người sống thì không', () => {
    const h = make(['werewolf', 'seer', V, V, V, V]);
    h.game.start();
    doAct(h.game, 0, 'bite', [2]);
    doSkip(h.game, 1, 'see');
    toDay(h.game);
    vote(h.game, {});
    run(h.game, () => h.game.night === 2);

    doSkip(h.game, 0, 'bite');
    doAct(h.game, 1, 'see', [0]);
    expect(view(h.game, 2).prompt).toBeNull();
    const feed = view(h.game, 2).feed!;
    expect(feed.some((l) => l.includes('Tiên Tri') && l.includes('soi P0'))).toBe(true);
    expect(view(h.game, 3).feed).toBeNull();
  });

  it('người chết thấy con trỏ và số lượt cắn của Sói ban đêm', () => {
    const h = make(['werewolf', 'cub', V, V, V, V]);
    h.game.start();
    doAct(h.game, 0, 'bite', [2]);
    doAct(h.game, 1, 'bite', [2]);
    toDay(h.game);
    vote(h.game, {});
    run(h.game, () => h.game.night === 2);
    waitPrompt(h.game, 0, 'bite');
    h.game.pointer(0, 3);
    expect(view(h.game, 2).pointers[0]).toBe(3);
    expect(view(h.game, 4).pointers[0]).toBeUndefined();
  });

  it('tạm dừng đóng băng mọi bộ đếm và chặn thao tác, tiếp tục thì chạy phần còn lại', () => {
    const h = make(['werewolf', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    vi.advanceTimersByTime(30_000);
    const before = view(h.game, 1).phaseEndsAt!;

    h.game.pause();
    expect(view(h.game, 1).paused).toBe(true);
    vi.advanceTimersByTime(10 * 60_000);
    expect(h.game.phase).toBe('DAY_DISCUSS');
    h.game.skipDiscuss(1);
    expect(view(h.game, 1).hasSkippedDiscuss).toBe(false);

    h.game.resume();
    expect(view(h.game, 1).paused).toBe(false);
    expect(view(h.game, 1).phaseEndsAt!).toBeGreaterThan(before + 9 * 60_000);
    vi.advanceTimersByTime(DEFAULT_TIMINGS.discussMs - 30_000 - 5_000);
    expect(h.game.phase).toBe('DAY_DISCUSS');
    vi.advanceTimersByTime(10_000);
    expect(h.game.phase).toBe('DAY_VOTE');
  });

  it('nút "Bỏ qua thảo luận" chỉ có sau 60 giây và cần mọi người sống bấm', () => {
    const h = make(['werewolf', V, V, V, V]);
    h.game.start();
    doSkip(h.game, 0, 'bite');
    toDay(h.game);
    h.game.skipDiscuss(0);
    expect(view(h.game, 0).hasSkippedDiscuss).toBe(false);
    vi.advanceTimersByTime(DEFAULT_TIMINGS.skipDiscussAfterMs + 10);
    for (let i = 0; i < 4; i++) h.game.skipDiscuss(i);
    expect(h.game.phase).toBe('DAY_DISCUSS');
    h.game.skipDiscuss(4);
    expect(h.game.phase).toBe('DAY_VOTE');
  });

  it('còn dưới 3 người kết nối thì huỷ ván; người rớt mạng không làm kẹt lượt', () => {
    const h = make(['werewolf', V, V, V, V]);
    h.game.start();
    waitPrompt(h.game, 0, 'bite');
    h.game.setConnected(0, false);
    toDay(h.game);
    h.game.setConnected(1, false);
    h.game.setConnected(2, false);
    expect(h.game.phase).toBe('END');
    expect(h.game.winner).toBe('aborted');
  });
});

describe('chống lộ bài', () => {
  it('view của người sống không chứa vai của người khác, không có bảng vai trước khi hết ván', () => {
    const h = make(['werewolf', 'seer', 'guard', 'witch', 'hunter', 'mayor', 'cupid', 'psychic']);
    h.game.start();
    for (const me of h.game.players) {
      const v = view(h.game, me.seat);
      expect(v.roles).toBeNull();
      for (const other of v.players) {
        if (other.seat === me.seat) continue;
        const allowed = [null, 'wolf', 'tomb'];
        if (h.game.players[other.seat].role === 'mayor') allowed.push('mayor');
        expect(allowed).toContain(other.icon);
      }
    }
  });
});

// ------------------------------------------------- mô phỏng hàng loạt bằng bot

const FAST: Partial<Timings> = {
  discussMs: 4_000,
  skipDiscussAfterMs: 1_000,
  voteMs: 4_000,
  executionMs: 500,
  dawnAnnounceMs: 500,
  hunterMs: 2_000,
  resultMs: 100,
  lastGlowMs: 200,
  idleMinMs: 300,
  idleMaxMs: 600,
  windows: {
    cupid: 1_500, guard: 1_500, wolf: 2_000, alpha: 1_500, whitewolf: 1_500,
    seer: 1_500, witch: 1_500, witchPoison: 1_500, psychic: 1_500,
  },
};

const stats = { winners: new Map<string, number>(), nights: 0, games: 0, roles: new Set<string>() };

function botGame(n: number, seed: number): void {
  const rng = mulberry32(seed);
  const cues: Cue[] = [];
  let ended = false;
  const game = new Game(
    Array.from({ length: n }, (_, i) => ({ sessionId: `s${i}`, name: `P${i}` })),
    {
      timings: { ...DEFAULT_TIMINGS, ...FAST },
      rng,
      onChange: () => {},
      onCue: (c) => cues.push(c),
      onEnd: () => {
        ended = true;
      },
    },
  );
  game.start();

  let guard = 0;
  while (!ended) {
    if (guard++ > 40_000) throw new Error(`ván không kết thúc (n=${n}, seed=${seed}, phase=${game.phase})`);
    vi.advanceTimersByTime(200);
    for (const p of game.players) {
      const v = game.viewFor(p.seat);

      // Kiểm tra rò rỉ ở mọi lúc: không có vai của người khác trong view người sống.
      if (p.alive && v.phase !== 'END') {
        for (const o of v.players) {
          if (o.seat === p.seat) continue;
          const real = game.players[o.seat].role;
          const ok =
            o.icon === null ||
            o.icon === 'tomb' ||
            (o.icon === 'wolf' && ['werewolf', 'cub', 'alpha', 'whitewolf'].includes(real)) ||
            (o.icon === 'mayor' && real === 'mayor') ||
            (o.icon === 'prince' && real === 'prince');
          if (!ok) throw new Error(`lộ vai: ghế ${p.seat} thấy ghế ${o.seat} là ${o.icon} (thật: ${real})`);
        }
        if (v.roles) throw new Error('lộ bảng vai');
      }

      if (v.phase === 'DAY_DISCUSS' && rng() < 0.3) game.skipDiscuss(p.seat);
      const pr = v.prompt;
      if (!pr || rng() > 0.35) continue;
      if (rng() < 0.15) {
        game.skip(p.seat);
        continue;
      }
      const pool = pr.targets.slice();
      const picked: number[] = [];
      for (let k = 0; k < pr.pick && pool.length > 0; k++) {
        picked.push(pool.splice(Math.floor(rng() * pool.length), 1)[0]);
      }
      game.act(p.seat, pr.kind, picked);
    }
  }

  expect(game.winner).not.toBeNull();
  expect(['village', 'wolf', 'jester', 'whitewolf']).toContain(game.winner);
  stats.winners.set(game.winner!, (stats.winners.get(game.winner!) ?? 0) + 1);
  stats.nights += game.night;
  stats.games++;
  for (const p of game.players) stats.roles.add(p.role);
  const v = game.viewFor(0);
  expect(v.roles).not.toBeNull();
  game.destroy();
}

describe('mô phỏng hàng loạt', () => {
  it('ván luôn kết thúc, không kẹt, không lộ vai, mọi cỡ bàn', () => {
    for (let n = 5; n <= 10; n++) {
      for (let seed = 1; seed <= 6; seed++) botGame(n, n * 1000 + seed);
    }
    // Các ván mô phỏng phải đủ đa dạng: nhiều đêm, cả hai phe đều thắng, nhiều loại vai xuất hiện.
    expect(stats.games).toBe(36);
    expect(stats.nights / stats.games).toBeGreaterThan(2);
    expect(stats.winners.get('village')).toBeGreaterThan(0);
    expect(stats.winners.get('wolf')).toBeGreaterThan(0);
    expect(stats.roles.size).toBeGreaterThanOrEqual(12);
  }, 120_000);
});
