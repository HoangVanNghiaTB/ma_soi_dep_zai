import { useSyncExternalStore } from 'react';
import type { ChatMsg, Cue, Fx, GameView, RoomState } from '@ms/shared';

export type ActiveFx = Fx & { at: number; until: number };

export interface State {
  connected: boolean;
  room: RoomState | null;
  view: GameView | null;
  /** Các ghế mình đang chỉ (chưa chốt): 1 người, hoặc 2 người cho vai chọn đôi. */
  pointing: number[];
  error: string | null;
  /** Lời quản trò đang hiện chữ giữa bàn. */
  cue: (Cue & { until: number }) | null;
  /** Hiệu ứng hình ảnh đang chạy (đạn, bình thuốc). */
  fx: ActiveFx[];
  /** Tin chat Sói của đêm hiện tại. */
  wolfChat: ChatMsg[];
  /** serverNow - Date.now() */
  clockOffset: number;
  narrationOn: boolean;
}

let state: State = {
  connected: false,
  room: null,
  view: null,
  pointing: [],
  error: null,
  cue: null,
  fx: [],
  wolfChat: [],
  clockOffset: 0,
  narrationOn: true,
};

const listeners = new Set<() => void>();

export function getState(): State {
  return state;
}

export function setState(patch: Partial<State>): void {
  state = { ...state, ...patch };
  for (const l of listeners) l();
}

function subscribe(l: () => void): () => void {
  listeners.add(l);
  return () => listeners.delete(l);
}

export function useStore<T>(selector: (s: State) => T): T {
  return useSyncExternalStore(
    subscribe,
    () => selector(state),
    () => selector(state),
  );
}

/** Giờ server ước tính ở máy này. */
export function serverNow(): number {
  return Date.now() + state.clockOffset;
}
