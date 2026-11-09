import type { IconId, RoleId } from '@ms/shared';

/**
 * Biểu tượng vai dùng emoji, giống thẻ bài mẫu: thẻ và biểu tượng trên đầu nhân vật
 * dùng chung một bộ hình. Hình emoji do hệ điều hành / trình duyệt của người chơi vẽ.
 */
export const ICON_EMOJI: Record<IconId, string> = {
  villager: '🧑‍🌾',
  seer: '🔮',
  guard: '🛡️',
  hunter: '🏹',
  witch: '🧪',
  mayor: '🎩',
  prince: '🤴',
  psychic: '👻',
  cupid: '💘',
  werewolf: '🐺',
  cub: '🐾',
  alpha: '🌕',
  traitor: '🎭',
  jester: '🤡',
  whitewolf: '🤍',
  fool: '🃏',
  pacifist: '🕊️',
  lycan: '🐶',
  medium: '🕯️',
  detective: '🕵️',
  sorceress: '🧙',
  seeress: '🔭',
  wolf: '🐺',
  heart: '❤️',
  tomb: '🪦',
};

export const EMOJI_FONT = '"Segoe UI Emoji", "Apple Color Emoji", "Noto Color Emoji", sans-serif';

export type Theme = 'village' | 'wolf' | 'jester' | 'whitewolf';

/** Màu viền của thẻ theo phe, lấy theo thẻ bài mẫu. */
export const THEME_COLOR: Record<Theme, string> = {
  village: '#2f9e63',
  wolf: '#cf4a3f',
  jester: '#7a4fc4',
  whitewolf: '#aab4d0',
};

export function themeOf(role: RoleId): Theme {
  switch (role) {
    case 'werewolf':
    case 'cub':
    case 'alpha':
    case 'traitor':
    case 'sorceress':
      return 'wolf';
    case 'jester':
      return 'jester';
    case 'whitewolf':
      return 'whitewolf';
    default:
      return 'village';
  }
}

/** Màu viền cho biểu tượng nổi trên đầu. */
export function iconColor(id: IconId): string {
  if (id === 'wolf') return THEME_COLOR.wolf;
  if (id === 'heart') return '#e0457b';
  if (id === 'tomb') return '#8a93a6';
  return THEME_COLOR[themeOf(id)];
}
