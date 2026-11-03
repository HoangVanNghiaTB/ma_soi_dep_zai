import { describe, expect, it } from 'vitest';
import type { RoleId } from '@ms/shared';
import { checkWinner } from '../server/src/game/win';

const p = (role: RoleId, alive = true) => ({ role, alive });

describe('checkWinner', () => {
  it('chưa phân thắng bại', () => {
    expect(checkWinner([p('werewolf'), p('villager'), p('villager')])).toBeNull();
  });

  it('Dân thắng khi hết Sói', () => {
    expect(checkWinner([p('werewolf', false), p('villager'), p('villager')])).toBe('village');
  });

  it('Sói thắng khi số Sói không ít hơn số người còn lại', () => {
    expect(checkWinner([p('werewolf'), p('villager'), p('villager', false)])).toBe('wolf');
    expect(checkWinner([p('werewolf'), p('werewolf'), p('villager')])).toBe('wolf');
  });

  it('Kẻ Phản Bội tính vào phe Sói và Dân phải diệt cả nó', () => {
    expect(checkWinner([p('werewolf', false), p('traitor'), p('villager'), p('villager')])).toBeNull();
    expect(checkWinner([p('werewolf', false), p('traitor'), p('villager')])).toBe('wolf');
    expect(checkWinner([p('werewolf', false), p('traitor', false), p('villager')])).toBe('village');
  });

  it('Sói Trắng thắng khi sống một mình', () => {
    expect(checkWinner([p('whitewolf'), p('villager', false), p('werewolf', false)])).toBe('whitewolf');
  });

  it('Sói Trắng không tính vào phe Sói để thắng', () => {
    expect(checkWinner([p('whitewolf'), p('villager'), p('villager')])).toBeNull();
  });
});
