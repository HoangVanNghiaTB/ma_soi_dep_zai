import type { GameView, Winner } from '@ms/shared';

export function phaseTitle(v: GameView): string {
  switch (v.phase) {
    case 'NIGHT':
      return `Đêm ${v.night}`;
    case 'DAWN':
      return 'Trời sáng';
    case 'DAY_DISCUSS':
      return `Ngày ${v.night} · Thảo luận`;
    case 'DAY_VOTE':
      return `Ngày ${v.night} · Bỏ phiếu`;
    case 'EXECUTION':
      return `Ngày ${v.night} · Kết quả`;
    case 'HUNTER':
      return 'Thợ Săn bắn';
    case 'END':
      return 'Hết ván';
  }
}

export function winnerText(w: Winner | null): string {
  switch (w) {
    case 'village':
      return 'Dân làng thắng!';
    case 'wolf':
      return 'Phe Sói thắng!';
    case 'jester':
      return 'Chán Đời thắng!';
    case 'whitewolf':
      return 'Sói Trắng thắng!';
    case 'aborted':
      return 'Ván bị huỷ vì thiếu người.';
    default:
      return '';
  }
}

/** Gợi ý ngắn cho người chơi, hiện trên mặt bàn. */
export function hintText(v: GameView): string {
  const p = v.prompt;
  if (p) {
    switch (p.kind) {
      case 'bite':
        return 'Chọn người để cắn';
      case 'vote':
        return 'Chọn người để treo cổ';
      case 'pair':
        return 'Chọn hai người thành đôi';
      case 'protect':
        return 'Chọn người để bảo vệ';
      case 'convert':
        return `${p.info ?? ''}. Biến thành Sói?`;
      case 'killWolf':
        return 'Chọn một Sói để giết';
      case 'see':
        return 'Chọn người để soi';
      case 'heal':
        return `${p.info ?? ''}. Cứu không?`;
      case 'poison':
        return 'Chọn người để đầu độc';
      case 'compare':
        return 'Chọn hai người để so sánh';
      case 'shoot':
        return 'Chọn người để bắn';
    }
  }
  if (v.phase === 'HUNTER') return 'Thợ Săn đang chọn người bắn…';
  if (!v.me.alive && v.phase !== 'END') return 'Bạn đã chết, hãy im lặng tới hết ván';
  switch (v.phase) {
    case 'NIGHT':
      return v.awake ? '' : 'Trời tối, hãy nhắm mắt…';
    case 'DAY_DISCUSS':
      return 'Hãy thảo luận, tìm ra Sói';
    case 'DAY_VOTE':
      return v.me.alive ? 'Bạn đã bỏ phiếu' : '';
    default:
      return '';
  }
}
