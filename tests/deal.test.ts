import { describe, expect, it } from 'vitest';
import { ROLES } from '@ms/shared';
import type { RoleId } from '@ms/shared';
import { BALANCE, FALLBACK, balanceOf, dealRoles, wolfCount } from '../server/src/game/deal';

const WOLF_TEAM: RoleId[] = ['werewolf', 'cub', 'alpha', 'traitor'];
const SPECIAL_ONCE: RoleId[] = [
  'seer', 'guard', 'hunter', 'witch', 'mayor', 'prince', 'psychic', 'cupid',
  'cub', 'alpha', 'traitor', 'jester', 'whitewolf',
];

describe('wolfCount', () => {
  it('đúng số Sói theo cỡ bàn', () => {
    expect(wolfCount(5)).toBe(1);
    expect(wolfCount(6)).toBe(2);
    expect(wolfCount(7)).toBe(2);
    expect(wolfCount(8)).toBe(3);
    expect(wolfCount(10)).toBe(3);
  });
});

describe('dealRoles', () => {
  it('mọi cỡ bàn: đủ N vai, đúng luật chia, tổng điểm cân bằng trong [-3, +3]', () => {
    for (let n = 5; n <= 10; n++) {
      for (let k = 0; k < 300; k++) {
        const roles = dealRoles(n);
        expect(roles).toHaveLength(n);

        const wolfTeam = roles.filter((r) => WOLF_TEAM.includes(r));
        expect(wolfTeam).toHaveLength(wolfCount(n));
        // Có ít nhất một Sói thật, không chỉ Kẻ Phản Bội.
        expect(wolfTeam.some((r) => r !== 'traitor')).toBe(true);
        expect(roles.filter((r) => r === 'werewolf').length).toBeLessThanOrEqual(3);

        const third = roles.filter((r) => r === 'jester' || r === 'whitewolf');
        expect(third.length).toBeLessThanOrEqual(1);
        if (n < 8) expect(third).toHaveLength(0);
        if (n < 6) expect(roles).not.toContain('cupid');
        // Bàn 5 người không có Nhà Ngoại Cảm.
        if (n < 6) expect(roles).not.toContain('psychic');

        for (const r of SPECIAL_ONCE) {
          expect(roles.filter((x) => x === r).length).toBeLessThanOrEqual(1);
        }

        const b = balanceOf(roles);
        expect(b).toBeGreaterThanOrEqual(BALANCE.min);
        expect(b).toBeLessThanOrEqual(BALANCE.max);
      }
    }
  });

  it('đội hình mẫu đều hợp lệ về điểm', () => {
    for (const [n, roles] of Object.entries(FALLBACK)) {
      expect(roles).toHaveLength(Number(n));
      const b = balanceOf(roles);
      expect(b).toBeGreaterThanOrEqual(BALANCE.min);
      expect(b).toBeLessThanOrEqual(BALANCE.max);
    }
  });

  it('điểm cân bằng khớp bảng vai', () => {
    expect(ROLES.seer.balance).toBe(7);
    expect(ROLES.alpha.balance).toBe(-9);
  });

  it('các ván khác nhau cho đội hình khác nhau', () => {
    const seen = new Set<string>();
    for (let i = 0; i < 40; i++) seen.add(dealRoles(8).slice().sort().join(','));
    expect(seen.size).toBeGreaterThan(5);
  });
});
