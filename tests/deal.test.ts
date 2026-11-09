import { describe, expect, it } from 'vitest';
import { ROLES } from '@ms/shared';
import type { RoleId } from '@ms/shared';
import { BALANCE, FALLBACK, balanceOf, dealRoles, wolfCount } from '../server/src/game/deal';

const WOLF_TEAM: RoleId[] = ['werewolf', 'cub', 'alpha', 'traitor', 'sorceress'];
const SPECIAL_ONCE: RoleId[] = [
  'seer', 'guard', 'hunter', 'witch', 'mayor', 'prince', 'psychic', 'cupid',
  'cub', 'alpha', 'traitor', 'jester', 'whitewolf',
  'fool', 'pacifist', 'lycan', 'medium', 'detective', 'sorceress', 'seeress',
];

describe('wolfCount', () => {
  it('đúng số Sói theo cỡ bàn', () => {
    expect(wolfCount(5)).toBe(1);
    expect(wolfCount(6)).toBe(2);
    expect(wolfCount(7)).toBe(2);
    expect(wolfCount(8)).toBe(3);
    expect(wolfCount(10)).toBe(3);
    expect(wolfCount(12)).toBe(3);
    expect(wolfCount(13)).toBe(4);
    expect(wolfCount(15)).toBe(4);
  });
});

describe('dealRoles', () => {
  it('mọi cỡ bàn: đủ N vai, đúng luật chia, tổng điểm cân bằng trong [-3, +3]', () => {
    for (let n = 6; n <= 15; n++) {
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
        // Tiên Tri Nữ chỉ ra ở bàn lớn (từ 10 người).
        if (n < 10) expect(roles).not.toContain('seeress');
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

  it('bàn 5 người: vai bất kỳ, chỉ cần điểm cân bằng hợp lệ và có Sói', () => {
    const seen = new Set<string>();
    for (let k = 0; k < 500; k++) {
      const roles = dealRoles(5);
      expect(roles).toHaveLength(5);
      const b = balanceOf(roles);
      expect(b).toBeGreaterThanOrEqual(BALANCE.min);
      expect(b).toBeLessThanOrEqual(BALANCE.max);
      expect(roles.some((r) => ['werewolf', 'cub', 'alpha', 'whitewolf'].includes(r))).toBe(true);
      for (const r of new Set(roles)) {
        if (r !== 'villager' && r !== 'werewolf') expect(roles.filter((x) => x === r)).toHaveLength(1);
      }
      roles.forEach((r) => seen.add(r));
    }
    // Không còn bị gò: Nhà Ngoại Cảm, Thần Tình Yêu, phe thứ ba đều có thể xuất hiện.
    for (const r of ['psychic', 'cupid', 'jester', 'whitewolf', 'traitor']) expect(seen.has(r as never)).toBe(true);
  });

  it('Sói Con chỉ xuất hiện khi ván có ít nhất hai Sói', () => {
    const wolfKind = ['werewolf', 'cub', 'alpha', 'whitewolf'];
    let sawCub = 0;
    for (let n = 5; n <= 15; n++) {
      for (let k = 0; k < 400; k++) {
        const roles = dealRoles(n);
        if (roles.includes('cub')) {
          sawCub++;
          expect(roles.filter((r) => wolfKind.includes(r)).length).toBeGreaterThanOrEqual(2);
        }
      }
    }
    expect(sawCub).toBeGreaterThan(0);
  });

  it('Phù Thủy Sói chỉ ra khi có Tiên Tri (hoặc Tiên Tri Nữ); có Tiên Tri thì không bắt buộc có Phù Thủy Sói', () => {
    let withSorceress = 0;
    let seerNoSorceress = 0;
    for (let n = 5; n <= 15; n++) {
      for (let k = 0; k < 500; k++) {
        const roles = dealRoles(n);
        const hasSeer = roles.includes('seer') || roles.includes('seeress');
        if (roles.includes('sorceress')) {
          withSorceress++;
          expect(hasSeer).toBe(true);
        } else if (hasSeer) {
          seerNoSorceress++;
        }
      }
    }
    expect(withSorceress).toBeGreaterThan(0);
    expect(seerNoSorceress).toBeGreaterThan(0);
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
