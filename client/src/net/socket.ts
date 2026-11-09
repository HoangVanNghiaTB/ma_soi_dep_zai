import { io } from 'socket.io-client';
import { EV } from '@ms/shared';
import type { Ack, ChatMsg, Cue, Fx, GameView, RoleId, RoomState } from '@ms/shared';
import { playCue, preloadAudio } from '../audio/audio';
import { getState, setState } from '../state/store';

function makeSessionId(): string {
  const bytes = new Uint8Array(16);
  crypto.getRandomValues(bytes);
  return Array.from(bytes, (b) => b.toString(16).padStart(2, '0')).join('');
}

/** sessionStorage: mỗi tab một phiên, để thử nhiều người trên một máy. */
function loadSession(): string {
  try {
    let id = sessionStorage.getItem('ms.session');
    if (!id) {
      id = makeSessionId();
      sessionStorage.setItem('ms.session', id);
    }
    return id;
  } catch {
    return makeSessionId();
  }
}

export const sessionId = loadSession();

interface SavedRoom {
  code: string;
  name: string;
}

function saveRoom(r: SavedRoom | null): void {
  try {
    if (r) sessionStorage.setItem('ms.room', JSON.stringify(r));
    else sessionStorage.removeItem('ms.room');
  } catch {
    /* bỏ qua */
  }
}

function savedRoom(): SavedRoom | null {
  try {
    const raw = sessionStorage.getItem('ms.room');
    return raw ? (JSON.parse(raw) as SavedRoom) : null;
  } catch {
    return null;
  }
}

export const socket = io({ autoConnect: false });

socket.on('connect', () => {
  setState({ connected: true, error: null });
  const saved = savedRoom();
  if (saved) {
    socket.emit(EV.roomJoin, { ...saved, sessionId }, (a: Ack) => {
      if (!a.ok) {
        saveRoom(null);
        setState({ room: null, view: null });
      }
    });
  }
});

socket.on('disconnect', () => setState({ connected: false }));

socket.on(EV.roomState, (rs: RoomState) => {
  const patch: Partial<ReturnType<typeof getState>> = {
    room: rs,
    clockOffset: rs.serverNow - Date.now(),
  };
  if (!rs.playing) {
    patch.view = null;
    patch.pointing = [];
    patch.wolfChat = [];
  }
  setState(patch);
});

socket.on(EV.gameView, (v: GameView) => {
  const prev = getState().view;
  const patch: Partial<ReturnType<typeof getState>> = {
    view: v,
    clockOffset: v.serverNow - Date.now(),
  };
  // Hết lượt (hoặc sang lượt khác) thì bỏ lựa chọn cục bộ chưa chốt.
  const samePrompt =
    v.prompt && prev?.prompt && v.prompt.kind === prev.prompt.kind && v.phase === prev.phase && v.night === prev.night;
  if (!samePrompt) patch.pointing = [];
  // Sang đêm mới thì xoá chat Sói cũ.
  if (v.night !== prev?.night) patch.wolfChat = [];
  setState(patch);
});

socket.on(EV.gameCue, (cue: Cue) => {
  setState({ cue: { ...cue, until: Date.now() + cue.showMs } });
  playCue(cue);
});

socket.on(EV.gameFx, (fx: Fx) => {
  const now = Date.now();
  const live = getState().fx.filter((f) => f.until > now);
  setState({ fx: [...live, { ...fx, at: now, until: now + 2500 }] });
});

socket.on(EV.chatWolf, (m: ChatMsg) => {
  setState({ wolfChat: [...getState().wolfChat, m].slice(-60) });
});

socket.on(EV.roomKicked, () => {
  saveRoom(null);
  setState({
    room: null,
    view: null,
    pointing: [],
    wolfChat: [],
    error: 'Bạn đã bị chủ phòng mời ra khỏi phòng.',
  });
});

export function connect(): void {
  if (!socket.connected) socket.connect();
  preloadAudio();
}

function request(event: string, payload: unknown): Promise<Ack<{ code: string }>> {
  return new Promise((resolve) => {
    socket.timeout(8000).emit(event, payload, (err: Error | null, a: Ack<{ code: string }>) => {
      resolve(err ? { ok: false, error: 'Không kết nối được tới server.' } : a);
    });
  });
}

export async function createRoom(name: string): Promise<string | null> {
  const a = await request(EV.roomCreate, { name, sessionId });
  if (!a.ok || !a.data) return a.error ?? 'Không tạo được phòng.';
  saveRoom({ code: a.data.code, name });
  return null;
}

export async function joinRoom(code: string, name: string): Promise<string | null> {
  const a = await request(EV.roomJoin, { code, name, sessionId });
  if (!a.ok || !a.data) return a.error ?? 'Không vào được phòng.';
  saveRoom({ code: a.data.code, name });
  return null;
}

export function leaveRoom(): void {
  socket.emit(EV.roomLeave);
  saveRoom(null);
  setState({ room: null, view: null, pointing: [], wolfChat: [] });
}

export async function startGame(): Promise<string | null> {
  const a = await request(EV.gameStart, {});
  return a.ok ? null : (a.error ?? 'Không bắt đầu được.');
}

export async function kickSeat(seat: number): Promise<string | null> {
  const a = await request(EV.roomKick, { seat });
  return a.ok ? null : (a.error ?? 'Không mời ra được.');
}

export async function updateSettings(patch: Record<string, number>): Promise<string | null> {
  const a = await request(EV.roomSettings, patch);
  return a.ok ? null : (a.error ?? 'Không chỉnh được.');
}

export async function updateOptions(patch: { intro?: boolean; roles?: RoleId[] }): Promise<string | null> {
  const a = await request(EV.roomOptions, patch);
  return a.ok ? null : (a.error ?? 'Không chỉnh được.');
}

/** Ngồi vào ghế xem: máy này chỉ phát lời quản trò, không chơi. */
export function watchSeat(slot: number): void {
  socket.emit(EV.seatWatch, { slot });
}

export function moveSeat(seat: number): void {
  socket.emit(EV.seatMove, { seat });
}

export function pauseGame(): void {
  socket.emit(EV.gamePause);
}

export function resumeGame(): void {
  socket.emit(EV.gameResume);
}

/**
 * Chạm vào một người để chỉ (chưa chốt). Vai chọn một người thì thay lựa chọn;
 * vai chọn hai người thì chạm lần nữa để bỏ chọn, tối đa hai người.
 */
export function chooseSeat(seat: number): void {
  const { view, pointing } = getState();
  const prompt = view?.prompt;
  if (!prompt || prompt.pick === 0 || !prompt.targets.includes(seat)) return;
  let next: number[];
  if (prompt.pick === 1) next = [seat];
  else next = pointing.includes(seat) ? pointing.filter((s) => s !== seat) : [...pointing, seat].slice(-2);
  setState({ pointing: next });
  socket.emit(EV.gamePointer, { target: next.length > 0 ? next[next.length - 1] : null });
}

/** Bấm nút chốt. Chốt rồi không đổi ý được. */
export function sendAct(kind: string, targets: number[]): void {
  socket.emit(EV.gameAct, { kind, targets });
  setState({ pointing: [] });
}

export function sendSkip(): void {
  socket.emit(EV.gameSkip);
  setState({ pointing: [] });
}

export function sendSkipDiscuss(): void {
  socket.emit(EV.gameSkipDiscuss);
}

export function sendWolfChat(text: string): void {
  socket.emit(EV.chatWolf, { text });
}
