import { describe, expect, it, vi } from 'vitest';
import { EV } from '@ms/shared';
import { Room, checkRoleList } from '../server/src/rooms/room';

function makeRoom(n: number, emit: (id: string, ev: string, p: unknown) => void = () => {}): Room {
  const room = new Room('ABCD', emit, () => {});
  for (let i = 0; i < n; i++) room.join(`s${i}`, `P${i}`, `sock${i}`);
  return room;
}

describe('chọn vai ở bàn chờ', () => {
  it('chỉ chủ phòng được chỉnh', () => {
    const room = makeRoom(5);
    expect(room.updateOptions('s1', { intro: false })).not.toBeNull();
    expect(room.updateOptions('s0', { intro: false })).toBeNull();
    expect(room.options.intro).toBe(false);
    room.dispose();
  });

  it('từ chối vai lạ hoặc quá số lá', () => {
    const room = makeRoom(5);
    expect(room.updateOptions('s0', { roles: ['abc'] })).not.toBeNull();
    expect(room.updateOptions('s0', { roles: ['seer', 'seer'] })).not.toBeNull();
    expect(room.updateOptions('s0', { roles: ['werewolf', 'werewolf', 'werewolf', 'werewolf'] })).not.toBeNull();
    room.dispose();
  });

  it('danh sách phải có Sói và có người ngoài phe Sói', () => {
    expect(checkRoleList(['seer', 'villager'])).not.toBeNull();
    expect(checkRoleList(['werewolf', 'cub'])).not.toBeNull();
    expect(checkRoleList(['traitor', 'villager'])).not.toBeNull();
    expect(checkRoleList(['werewolf', 'seer'])).toBeNull();
    expect(checkRoleList([])).toBeNull();
  });

  it('không bắt đầu khi số vai chọn khác số người', () => {
    const room = makeRoom(5);
    room.updateOptions('s0', { roles: ['werewolf', 'seer', 'villager'] });
    expect(room.requestStart('s0')).toMatch(/3 vai/);
    room.dispose();
  });

  it('chọn đủ vai thì ván dùng đúng bộ vai đó, đầu ván là INTRO', () => {
    vi.useFakeTimers();
    const room = makeRoom(5);
    const want = ['werewolf', 'seer', 'guard', 'villager', 'villager'] as const;
    expect(room.updateOptions('s0', { roles: [...want] })).toBeNull();
    expect(room.requestStart('s0')).toBeNull();
    // 5 người chưa đủ maxPlayers nên đếm ngược; chờ hết đếm ngược.
    vi.advanceTimersByTime(room.settings.countdownMs + 100);
    expect(room.game).not.toBeNull();
    expect(room.game!.phase).toBe('INTRO');
    expect(room.game!.players.map((p) => p.role).sort()).toEqual([...want].sort());
    room.dispose();
    vi.useRealTimers();
  });
});

describe('ghế xem', () => {
  it('chuyển sang ghế xem: không tính là người chơi, chủ phòng không chuyển được', () => {
    const room = makeRoom(5);
    room.moveToWatch('s0', 0);
    expect(room.watchers[0]).toBeNull();
    room.moveToWatch('s3', 0);
    room.moveToWatch('s4', 1);
    room.moveToWatch('s2', 0);
    expect(room.watchers.map((w) => w?.sessionId)).toEqual(['s3', 's4']);
    expect(room.seats.filter(Boolean)).toHaveLength(3);
    // Còn 3 người chơi nên chưa đủ để bắt đầu.
    expect(room.requestStart('s0')).toMatch(/ít nhất/);
    room.dispose();
  });

  it('ghế xem nhận lời quản trò, ghế chơi đầy thì người mới vào ghế xem', () => {
    const got: string[] = [];
    const room = makeRoom(10, (id, ev) => {
      if (ev === EV.gameCue) got.push(id);
    });
    expect(room.join('w1', 'Loa', 'sockw1')).toEqual({ ok: true, seat: -1 });
    expect(room.watchers[0]?.sessionId).toBe('w1');
    expect(room.join('w2', 'Loa2', 'sockw2').ok).toBe(true);
    expect(room.join('w3', 'Thừa', 'sockw3').ok).toBe(false);

    vi.useFakeTimers();
    expect(room.requestStart('s0')).toBeNull();
    expect(room.game).not.toBeNull();
    // Mọi cue của ván cũng tới ghế xem.
    vi.advanceTimersByTime(room.settings.introMs + 5000);
    expect(got).toContain('sockw1');
    expect(got).toContain('sockw2');
    room.dispose();
    vi.useRealTimers();
  });

  it('chủ phòng mời được người ở ghế xem; từ ghế xem về ghế chơi', () => {
    const room = makeRoom(5);
    room.moveToWatch('s4', 0);
    room.moveSeat('s4', 7);
    expect(room.watchers[0]).toBeNull();
    expect(room.seats[7]?.sessionId).toBe('s4');
    room.moveToWatch('s4', 1);
    expect(room.kick('s0', 10 + 1)).toBeNull();
    expect(room.watchers[1]).toBeNull();
    room.dispose();
  });
});
