/** Thời gian tối đa (ms) mỗi vai được thao tác sau lời gọi. Theo werewolf/narration.js. */
export interface Windows {
  cupid: number;
  guard: number;
  wolf: number;
  alpha: number;
  whitewolf: number;
  seer: number;
  witch: number;
  witchPoison: number;
  psychic: number;
}

export interface Timings {
  minPlayers: number;
  maxPlayers: number;
  countdownMs: number;
  /** Số người thật tối thiểu để ván tiếp tục. */
  minRealPlayers: number;
  /** Nghỉ sau "Trời tối rồi" cho mọi người kịp nhắm mắt. */
  startPauseMs: number;
  /** Thời gian đọc vai ở đầu ván (nếu chủ phòng bật). */
  introMs: number;
  /** Nghỉ sau lời gọi dậy, trước khi mở khung thao tác. */
  cueGapMs: number;
  /** Nghỉ sau lời gọi ngủ, trước vai kế tiếp. */
  sleepGapMs: number;
  windows: Windows;
  /** Vai không ai thao tác được (đã chết, hết bình...): chờ ngẫu nhiên trong khoảng này. */
  idleMinMs: number;
  idleMaxMs: number;
  lastGlowMs: number;
  dawnAnnounceMs: number;
  discussMs: number;
  skipDiscussAfterMs: number;
  voteMs: number;
  executionMs: number;
  hunterMs: number;
  resultMs: number;
  reconnectMs: number;
  maxGameMs: number;
  emptyRoomMs: number;
}

export const MAX_SEATS = 10;

/** Số ghế xem (chỉ nghe quản trò, không chơi). */
export const MAX_WATCH = 2;

export const DEFAULT_TIMINGS: Timings = {
  minPlayers: 5,
  maxPlayers: 10,
  countdownMs: 15_000,
  minRealPlayers: 3,
  startPauseMs: 1_500,
  introMs: 20_000,
  cueGapMs: 600,
  sleepGapMs: 800,
  windows: {
    cupid: 10_000,
    guard: 8_000,
    wolf: 20_000,
    alpha: 8_000,
    whitewolf: 8_000,
    seer: 8_000,
    witch: 10_000,
    witchPoison: 8_000,
    psychic: 10_000,
  },
  idleMinMs: 5_000,
  idleMaxMs: 10_000,
  lastGlowMs: 5_000,
  dawnAnnounceMs: 7_000,
  discussMs: 120_000,
  skipDiscussAfterMs: 60_000,
  voteMs: 30_000,
  executionMs: 5_000,
  hunterMs: 15_000,
  resultMs: 25_000,
  reconnectMs: 60_000,
  maxGameMs: 40 * 60_000,
  emptyRoomMs: 10 * 60_000,
};

/** Các mốc thời gian chủ phòng được chỉnh ở bàn chờ, kèm giới hạn (giây). */
export const EDITABLE_TIMINGS: { key: keyof Timings; label: string; min: number; max: number }[] = [
  { key: 'discussMs', label: 'Thảo luận ban ngày', min: 30, max: 600 },
  { key: 'skipDiscussAfterMs', label: 'Hiện nút "Bỏ qua thảo luận" sau', min: 10, max: 600 },
  { key: 'voteMs', label: 'Bỏ phiếu', min: 10, max: 120 },
  { key: 'hunterMs', label: 'Thợ Săn chọn người bắn', min: 5, max: 60 },
  { key: 'introMs', label: 'Thời gian đọc vai đầu ván', min: 5, max: 60 },
  { key: 'countdownMs', label: 'Đếm ngược bắt đầu', min: 5, max: 60 },
];
