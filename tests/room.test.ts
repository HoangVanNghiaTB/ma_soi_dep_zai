import { describe, expect, it, vi } from 'vitest';
import { Room, checkRoleList } from '../server/src/rooms/room';

function makeRoom(n: number): Room {
  const room = new Room('ABCD', () => {}, () => {});
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
