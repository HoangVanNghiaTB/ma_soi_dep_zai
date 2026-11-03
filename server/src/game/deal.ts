import { ROLES } from '@ms/shared';
import type { RoleId } from '@ms/shared';

export type Rng = () => number;

/** Khoảng tổng điểm cân bằng cho phép của đội hình. */
export const BALANCE = { min: -3, max: 3 };

export function shuffle<T>(arr: readonly T[], rng: Rng = Math.random): T[] {
  const a = arr.slice();
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(rng() * (i + 1));
    [a[i], a[j]] = [a[j], a[i]];
  }
  return a;
}

/** Số người phe Sói theo cỡ bàn: 1 (N=5), 2 (N=6,7), 3 (N=8..10). */
export function wolfCount(n: number): number {
  if (n <= 5) return 1;
  if (n <= 7) return 2;
  return 3;
}

export const balanceOf = (roles: readonly RoleId[]): number =>
  roles.reduce((sum, r) => sum + ROLES[r].balance, 0);

const VILLAGE_SPECIAL: RoleId[] = [
  'seer', 'guard', 'hunter', 'witch', 'mayor', 'prince', 'psychic', 'cupid',
];
const TRUE_WOLVES: RoleId[] = ['werewolf', 'cub', 'alpha'];
const WOLF_PICKS: RoleId[] = ['werewolf', 'werewolf', 'cub', 'alpha', 'traitor'];

/** Đội hình mẫu (tổng điểm đã kiểm tra) dùng khi rút ngẫu nhiên mãi không ra. */
export const FALLBACK: Record<number, RoleId[]> = {
  5: ['alpha', 'seer', 'prince', 'villager', 'villager'],
  6: ['werewolf', 'cub', 'seer', 'guard', 'hunter', 'villager'],
  7: ['werewolf', 'alpha', 'seer', 'guard', 'hunter', 'villager', 'villager'],
  8: ['werewolf', 'cub', 'traitor', 'seer', 'guard', 'witch', 'hunter', 'psychic'],
  9: ['werewolf', 'cub', 'traitor', 'seer', 'guard', 'witch', 'hunter', 'cupid', 'jester'],
  10: ['werewolf', 'werewolf', 'cub', 'whitewolf', 'seer', 'guard', 'witch', 'hunter', 'mayor', 'prince'],
};

/**
 * Rút ngẫu nhiên n vai (5..10) sao cho: đủ số người phe Sói theo cỡ bàn (có ít nhất một Sói thật),
 * phe thứ ba chỉ từ 8 người và tối đa một, Thần Tình Yêu từ 6 người, mỗi vai đặc biệt tối đa một lá,
 * và tổng điểm cân bằng nằm trong [-3, +3]. Trả về danh sách vai đã xáo, chưa gán cho ai.
 */
export function dealRoles(n: number, rng: Rng = Math.random): RoleId[] {
  const size = Math.min(10, Math.max(5, n));
  for (let tries = 0; tries < 3000; tries++) {
    const wolves: RoleId[] = [TRUE_WOLVES[Math.floor(rng() * 3)]];
    while (wolves.length < wolfCount(size)) {
      const pick = WOLF_PICKS[Math.floor(rng() * WOLF_PICKS.length)];
      const ok = pick === 'werewolf' ? wolves.filter((w) => w === 'werewolf').length < 3 : !wolves.includes(pick);
      if (ok) wolves.push(pick);
    }
    const third: RoleId | null =
      size >= 8 && rng() < 0.5 ? (rng() < 0.5 ? 'jester' : 'whitewolf') : null;
    const rest = size - wolves.length - (third ? 1 : 0);
    const pool = shuffle(
      VILLAGE_SPECIAL.filter((r) => r !== 'cupid' || size >= 6),
      rng,
    );
    const special = pool.slice(
      0,
      Math.min(pool.length, rest, 2 + Math.floor(rng() * Math.max(1, rest - 1))),
    );
    const roles: RoleId[] = [...wolves, ...(third ? [third] : []), ...special];
    while (roles.length < size) roles.push('villager');
    const s = balanceOf(roles);
    if (s >= BALANCE.min && s <= BALANCE.max) return shuffle(roles, rng);
  }
  const fb = FALLBACK[size] ?? FALLBACK[5];
  // Bàn lớn hơn 10 hoặc nhỏ hơn 5 không có trong luật: bù thêm Dân làng cho đủ người.
  const base = fb.slice(0, n);
  while (base.length < n) base.push('villager');
  return shuffle(base, rng);
}
