import type { Cue } from '@ms/shared';

/** `ms` là độ dài file giọng (đo từ file thật, theo werewolf/narration.js). */
export type CueDef = Omit<Cue, 'seq'> & { ms: number };

/** Lời quản trò dạng chữ, khớp KICH_BAN_QUAN_TRO.md. */
const TEXT: Record<string, string> = {
  night_start: 'Trời tối rồi, mọi người nhắm mắt lại.',
  dawn: 'Trời sáng rồi, mọi người mở mắt.',
  vote_start: 'Hết giờ thảo luận. Mời mọi người bỏ phiếu.',
  cupid_wake: 'Thần Tình Yêu thức dậy. Hãy chọn hai người thành đôi.',
  cupid_sleep: 'Thần Tình Yêu nhắm mắt lại.',
  traitor_wake: 'Kẻ Phản Bội thức dậy. Hãy nhận ra bầy Sói.',
  traitor_sleep: 'Kẻ Phản Bội nhắm mắt lại.',
  guard_wake: 'Bảo Vệ thức dậy. Hãy chọn một người để bảo vệ.',
  guard_sleep: 'Bảo Vệ nhắm mắt lại.',
  wolf_wake: 'Ma Sói thức dậy. Hãy chọn một người để cắn.',
  wolf_wake_short: 'Ma Sói, hãy chọn thêm một người để cắn.',
  wolf_sleep: 'Ma Sói nhắm mắt lại.',
  alpha_wake: 'Sói Đầu Đàn thức dậy. Bạn có muốn biến người bị cắn thành Sói không?',
  alpha_sleep: 'Sói Đầu Đàn nhắm mắt lại.',
  whitewolf_wake: 'Sói Trắng thức dậy. Bạn có muốn giết một Sói khác không?',
  whitewolf_sleep: 'Sói Trắng nhắm mắt lại.',
  seer_wake: 'Tiên Tri thức dậy. Hãy chọn một người để soi.',
  seer_sleep: 'Tiên Tri nhắm mắt lại.',
  witch_wake: 'Phù Thủy thức dậy. Đêm nay người này sẽ chết. Bạn có muốn cứu không?',
  witch_poison: 'Phù Thủy, bạn có muốn dùng bình độc với ai không?',
  witch_sleep: 'Phù Thủy nhắm mắt lại.',
  psychic_wake: 'Nhà Ngoại Cảm thức dậy. Hãy chọn hai người để so sánh.',
  psychic_sleep: 'Nhà Ngoại Cảm nhắm mắt lại.',
  sorceress_wake: 'Phù Thủy Sói thức dậy. Hãy tìm xem ai là Tiên Tri.',
  sorceress_sleep: 'Phù Thủy Sói nhắm mắt lại.',
  medium_wake: 'Thầy Đồng thức dậy. Hãy chọn một người để cảm nhận.',
  medium_sleep: 'Thầy Đồng nhắm mắt lại.',
  detective_wake: 'Thám Tử Ngoại Cảm thức dậy. Hãy chọn một người để dò.',
  detective_sleep: 'Thám Tử Ngoại Cảm nhắm mắt lại.',
};

function clip(key: string, ms: number, sfx?: string): CueDef {
  return { id: key, text: TEXT[key] ?? '', audio: `gm_${key}`, sfx, ms, showMs: ms + 1200 };
}

export const CUES = {
  nightStart: clip('night_start', 2500, 'wolf_howl'),
  dawn: clip('dawn', 1900, 'dawn_birds'),
  voteStart: clip('vote_start', 2500),
  cupidWake: clip('cupid_wake', 3000),
  cupidSleep: clip('cupid_sleep', 1500),
  traitorWake: clip('traitor_wake', 2900),
  traitorSleep: clip('traitor_sleep', 1800),
  guardWake: clip('guard_wake', 3100),
  guardSleep: clip('guard_sleep', 1300),
  wolfWake: clip('wolf_wake', 2900),
  wolfWakeShort: clip('wolf_wake_short', 1200),
  wolfSleep: clip('wolf_sleep', 1600),
  alphaWake: clip('alpha_wake', 4100),
  alphaSleep: clip('alpha_sleep', 1800),
  whiteWolfWake: clip('whitewolf_wake', 3600),
  whiteWolfSleep: clip('whitewolf_sleep', 1600),
  seerWake: clip('seer_wake', 2900),
  seerSleep: clip('seer_sleep', 1400),
  witchWake: clip('witch_wake', 4300),
  witchPoison: clip('witch_poison', 1900),
  witchSleep: clip('witch_sleep', 1300),
  psychicWake: clip('psychic_wake', 3600),
  psychicSleep: clip('psychic_sleep', 1500),
  // Các lời gọi vai mới chưa có file giọng: chỉ hiện chữ, thời lượng là ước lượng thời gian đọc.
  sorceressWake: clip('sorceress_wake', 3000),
  sorceressSleep: clip('sorceress_sleep', 1600),
  mediumWake: clip('medium_wake', 3000),
  mediumSleep: clip('medium_sleep', 1400),
  detectiveWake: clip('detective_wake', 3200),
  detectiveSleep: clip('detective_sleep', 1700),
  hang: { id: 'hang', text: '', sfx: 'hang', ms: 0, showMs: 0 } as CueDef,
};

export const totalMs = (cues: CueDef[]): number => cues.reduce((s, c) => s + c.ms, 0);
