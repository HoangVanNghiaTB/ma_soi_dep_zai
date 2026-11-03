import { isWolfKind, isWolfTeam } from '@ms/shared';
import type { RoleId, Winner } from '@ms/shared';

export interface Alive {
  role: RoleId;
  alive: boolean;
}

/**
 * Kiểm tra thắng thua theo thứ tự ưu tiên.
 * (Chán Đời thắng khi bị treo cổ được xử lý riêng lúc treo cổ.)
 */
export function checkWinner(players: readonly Alive[]): Winner | null {
  const alive = players.filter((p) => p.alive);

  if (alive.length === 1 && alive[0].role === 'whitewolf') return 'whitewolf';

  const wolfKinds = alive.filter((p) => isWolfKind(p.role)).length;
  const traitors = alive.filter((p) => p.role === 'traitor').length;
  if (wolfKinds === 0 && traitors === 0) return 'village';

  const wolfTeam = alive.filter((p) => isWolfTeam(p.role)).length;
  const others = alive.length - wolfTeam;
  if (wolfTeam >= 1 && wolfTeam >= others) return 'wolf';

  return null;
}
