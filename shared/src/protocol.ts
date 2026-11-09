import type { RoleId } from './roles';
import type { Timings } from './config';

export type Phase =
  | 'INTRO'
  | 'NIGHT'
  | 'DAWN'
  | 'DAY_DISCUSS'
  | 'DAY_VOTE'
  | 'EXECUTION'
  | 'HUNTER'
  | 'END';

export type Winner = 'village' | 'wolf' | 'jester' | 'whitewolf' | 'aborted';

/** Biểu tượng nổi trên đầu một người. 'wolf' là biểu tượng Sói chung. */
export type IconId = RoleId | 'wolf' | 'heart' | 'tomb';

export type PromptKind =
  | 'bite'
  | 'vote'
  | 'pair'
  | 'protect'
  | 'convert'
  | 'killWolf'
  | 'see'
  | 'heal'
  | 'poison'
  | 'compare'
  | 'findSeer'
  | 'sense'
  | 'scan'
  | 'shoot';

export interface Prompt {
  kind: PromptKind;
  label: string;
  skipLabel: string;
  /** Số người cần chỉ trước khi bấm chốt: 0 (chỉ hỏi có / không), 1 hoặc 2. */
  pick: 0 | 1 | 2;
  /** Các ghế được phép chọn. */
  targets: number[];
  /** Thông tin kèm theo (ví dụ "Đêm nay A sẽ chết"). */
  info?: string;
}

export interface PlayerView {
  seat: number;
  name: string;
  alive: boolean;
  connected: boolean;
  icon: IconId | null;
  /** Biểu tượng phụ (trái tim cặp đôi). */
  mark: IconId | null;
  /** Số phiếu vote hoặc số lượt cắn (khi được phép thấy). */
  count: number | null;
  /** Đang cầm súng (Thợ Săn đến lượt bắn). */
  armed: boolean;
}

export interface GameView {
  version: number;
  phase: Phase;
  night: number;
  serverNow: number;
  phaseEndsAt: number | null;
  paused: boolean;
  /** Mốc giờ server khi nút "Bỏ qua thảo luận" hiện ra. */
  skipDiscussAt: number | null;
  hasSkippedDiscuss: boolean;
  /** Màn hình mình có sáng không (ban đêm chỉ vai được gọi mới sáng). */
  awake: boolean;
  announce: string | null;
  winner: Winner | null;
  me: { seat: number; role: RoleId; alive: boolean };
  players: PlayerView[];
  /** Con trỏ mình được phép thấy: ghế -> ghế đang chỉ. */
  pointers: Record<number, number | null>;
  prompt: Prompt | null;
  /** Kết quả riêng của mình (Tiên Tri, Nhà Ngoại Cảm...). */
  notes: string[];
  /** Mình đang được dùng chat Sói (đúng lượt bầy Sói, còn sống). */
  canChat: boolean;
  /** Chỉ người chết ban đêm: ai làm gì đêm nay. */
  feed: string[] | null;
  /** Bộ vai của ván này (ai cũng thấy, không nói vai nào của ai), xếp theo thứ tự bảng vai. */
  deck: RoleId[];
  /** Chỉ có khi hết ván: vai thật của mọi người. */
  roles: Record<number, RoleId> | null;
}

export interface Cue {
  seq: number;
  id: string;
  text: string;
  /** Tên file giọng (không đuôi), ví dụ gm_wolf_wake. */
  audio?: string;
  /** Tên file hiệu ứng (không đuôi), ví dụ wolf_howl. */
  sfx?: string;
  showMs: number;
}

/** Hiệu ứng hình ảnh ngắn trong cảnh 3D. */
export interface Fx {
  seq: number;
  kind: 'shoot' | 'potion';
  from: number;
  to: number;
  color: string;
}

export interface ChatMsg {
  seat: number;
  name: string;
  text: string;
}

export interface LobbySeat {
  name: string;
  /** Bot do máy điều khiển (chỉ để chơi thử). */
  bot?: boolean;
  connected: boolean;
  isHost: boolean;
  inGame: boolean;
}

/** Tuỳ chọn của chủ phòng cho ván sau. */
export interface RoomOptions {
  /** Có dành thời gian đọc vai trước khi vào đêm đầu không. */
  intro: boolean;
  /** Danh sách vai chọn tay; rỗng nghĩa là chia ngẫu nhiên cân bằng. */
  roles: RoleId[];
}

export interface RoomState {
  code: string;
  /** Ghế chơi của mình, -1 nếu đang ngồi ghế xem. */
  mySeat: number;
  seats: (LobbySeat | null)[];
  /** Các ghế xem: chỉ nghe quản trò, không chơi. */
  watchSeats: (LobbySeat | null)[];
  /** Chỉ số ghế xem của mình, -1 nếu không ngồi ghế xem. */
  myWatch: number;
  status: 'LOBBY' | 'COUNTDOWN' | 'IN_GAME';
  countdownEndsAt: number | null;
  serverNow: number;
  settings: Timings;
  options: RoomOptions;
  /** Mình đang ngồi trong ván hay đang chờ ván sau. */
  playing: boolean;
}

export interface Ack<T = unknown> {
  ok: boolean;
  error?: string;
  data?: T;
}

export const EV = {
  roomCreate: 'room:create',
  roomJoin: 'room:join',
  roomLeave: 'room:leave',
  roomKick: 'room:kick',
  roomKicked: 'room:kicked',
  roomSettings: 'room:settings',
  roomOptions: 'room:options',
  seatMove: 'seat:move',
  seatWatch: 'seat:watch',
  gameStart: 'game:start',
  gamePause: 'game:pause',
  gameResume: 'game:resume',
  gamePointer: 'game:pointer',
  gameAct: 'game:act',
  gameSkip: 'game:skip',
  gameSkipDiscuss: 'game:skipDiscuss',
  chatWolf: 'chat:wolf',
  roomState: 'room:state',
  gameView: 'game:view',
  gameCue: 'game:cue',
  gameFx: 'game:fx',
} as const;
