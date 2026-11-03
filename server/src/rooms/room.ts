import { DEFAULT_TIMINGS, EDITABLE_TIMINGS, EV, MAX_SEATS, ROLES } from '@ms/shared';
import type { ChatMsg, Cue, Fx, LobbySeat, RoleId, RoomState, Timings } from '@ms/shared';
import { Game } from '../game/game';

export type Emit = (socketId: string, event: string, payload: unknown) => void;

interface SeatInfo {
  sessionId: string;
  name: string;
  socketId: string | null;
  connected: boolean;
  /** Đang ngồi trong ván đang chạy. */
  inGame: boolean;
  /** Đã rời giữa ván, sẽ bị dọn khi ván xong. */
  left: boolean;
  graceTimer: ReturnType<typeof setTimeout> | null;
}

/**
 * Chỉ dùng khi thử nghiệm: đặt biến môi trường MS_DEBUG_ROLES="werewolf,villager,..." (theo thứ tự ghế)
 * để ép vai. Không đặt thì chia ngẫu nhiên như bình thường.
 */
function debugRoles(n: number): RoleId[] | undefined {
  const raw = process.env.MS_DEBUG_ROLES;
  if (!raw) return undefined;
  const list = raw.split(',').map((s) => s.trim());
  return list.length === n && list.every((r) => r in ROLES) ? (list as RoleId[]) : undefined;
}

export type JoinResult = { ok: true; seat: number } | { ok: false; error: string };

/** Ghế chờ: nếu mất kết nối ở bàn chờ quá lâu thì nhường ghế. */
const LOBBY_GRACE_MS = 20_000;

export class Room {
  readonly code: string;
  readonly settings: Timings;
  seats: (SeatInfo | null)[] = Array(MAX_SEATS).fill(null);
  hostSession: string | null = null;
  game: Game | null = null;
  countdownEndsAt: number | null = null;

  private countdownTimer: ReturnType<typeof setTimeout> | null = null;
  private emptyTimer: ReturnType<typeof setTimeout> | null = null;

  constructor(
    code: string,
    private emit: Emit,
    private onEmpty: (room: Room) => void,
    settings: Timings = DEFAULT_TIMINGS,
  ) {
    this.code = code;
    this.settings = { ...settings };
  }

  // ------------------------------------------------------------------ truy vấn

  seatOfSession(sessionId: string): number {
    return this.seats.findIndex((s) => s?.sessionId === sessionId);
  }

  get status(): RoomState['status'] {
    if (this.game) return 'IN_GAME';
    return this.countdownEndsAt !== null ? 'COUNTDOWN' : 'LOBBY';
  }

  private seated(): number[] {
    return this.seats.flatMap((s, i) => (s && !s.left ? [i] : []));
  }

  isEmpty(): boolean {
    return this.seats.every((s) => s === null || !s.connected);
  }

  // ----------------------------------------------------------------- vào / ra

  join(sessionId: string, name: string, socketId: string): JoinResult {
    this.clearEmptyTimer();
    const cleanName = name.trim().slice(0, 16) || 'Người chơi';

    const existing = this.seatOfSession(sessionId);
    if (existing >= 0) {
      const s = this.seats[existing]!;
      s.socketId = socketId;
      s.connected = true;
      s.left = false;
      if (s.graceTimer) clearTimeout(s.graceTimer);
      s.graceTimer = null;
      if (this.game && s.inGame) {
        const gs = this.game.seatOf(sessionId);
        if (gs >= 0) this.game.setConnected(gs, true);
      }
      this.broadcast();
      return { ok: true, seat: existing };
    }

    const free = this.seats.findIndex((s) => s === null);
    if (free < 0) return { ok: false, error: 'Phòng đã đầy.' };

    this.seats[free] = {
      sessionId,
      name: cleanName,
      socketId,
      connected: true,
      inGame: false,
      left: false,
      graceTimer: null,
    };
    if (!this.hostSession) this.hostSession = sessionId;
    this.broadcast();
    return { ok: true, seat: free };
  }

  /** Người chơi chủ động rời phòng. */
  leave(sessionId: string): void {
    const idx = this.seatOfSession(sessionId);
    if (idx < 0) return;
    const s = this.seats[idx]!;
    s.socketId = null;
    s.connected = false;
    this.dropOrMark(idx);
  }

  /** Mất kết nối (đóng tab, rớt mạng). */
  disconnect(socketId: string): void {
    const idx = this.seats.findIndex((s) => s?.socketId === socketId);
    if (idx < 0) return;
    const s = this.seats[idx]!;
    s.socketId = null;
    s.connected = false;

    if (this.game && s.inGame) {
      const gs = this.game.seatOf(s.sessionId);
      if (gs >= 0) this.game.setConnected(gs, false);
      this.afterPresenceChange();
      return;
    }
    // Ở bàn chờ: giữ ghế một lúc phòng khi chỉ chớp mạng.
    s.graceTimer = setTimeout(() => {
      if (this.seats[idx] === s && !s.connected) this.dropOrMark(idx);
    }, LOBBY_GRACE_MS);
    this.afterPresenceChange();
  }

  private dropOrMark(idx: number): void {
    const s = this.seats[idx];
    if (!s) return;
    if (this.game && s.inGame) {
      s.left = true;
      const gs = this.game.seatOf(s.sessionId);
      if (gs >= 0) this.game.setConnected(gs, false);
    } else {
      if (s.graceTimer) clearTimeout(s.graceTimer);
      this.seats[idx] = null;
      if (this.hostSession === s.sessionId) this.transferHost();
    }
    this.afterPresenceChange();
  }

  private transferHost(): void {
    const next = this.seats.find((s) => s && !s.left && s.connected);
    this.hostSession = next ? next.sessionId : null;
  }

  private afterPresenceChange(): void {
    const host = this.hostSession ? this.seatOfSession(this.hostSession) : -1;
    if (host < 0 || !this.seats[host]!.connected) this.transferHost();

    if (!this.game && this.countdownEndsAt !== null && this.seated().length < this.settings.minPlayers) {
      this.cancelCountdown();
    }
    this.broadcast();

    if (this.isEmpty() && !this.emptyTimer) {
      this.emptyTimer = setTimeout(() => this.onEmpty(this), this.settings.emptyRoomMs);
    }
  }

  private clearEmptyTimer(): void {
    if (this.emptyTimer) clearTimeout(this.emptyTimer);
    this.emptyTimer = null;
  }

  /** Chủ phòng mời một người ra khỏi bàn chờ. */
  kick(sessionId: string, seat: number): string | null {
    if (this.hostSession !== sessionId) return 'Chỉ chủ phòng mới mời người ra được.';
    if (this.status !== 'LOBBY') return 'Chỉ mời được khi chưa bắt đầu ván.';
    const s = this.seats[seat];
    if (!s) return 'Ghế này đang trống.';
    if (s.sessionId === sessionId) return 'Bạn không thể tự mời mình.';
    if (s.socketId) this.emit(s.socketId, EV.roomKicked, {});
    if (s.graceTimer) clearTimeout(s.graceTimer);
    this.seats[seat] = null;
    this.afterPresenceChange();
    return null;
  }

  /** Chủ phòng chỉnh các mốc thời gian (giây), áp dụng từ ván sau. */
  updateSettings(sessionId: string, patch: Record<string, unknown>): string | null {
    if (this.hostSession !== sessionId) return 'Chỉ chủ phòng mới chỉnh được.';
    if (this.status !== 'LOBBY') return 'Chỉ chỉnh được khi chưa bắt đầu ván.';
    for (const f of EDITABLE_TIMINGS) {
      const v = patch[f.key];
      if (typeof v !== 'number' || !Number.isFinite(v)) continue;
      const sec = Math.min(f.max, Math.max(f.min, Math.round(v)));
      (this.settings as unknown as Record<string, number>)[f.key] = sec * 1000;
    }
    this.broadcast();
    return null;
  }

  pause(sessionId: string): void {
    if (this.hostSession !== sessionId || !this.game) return;
    this.game.pause();
  }

  resume(sessionId: string): void {
    if (this.hostSession !== sessionId || !this.game) return;
    this.game.resume();
  }

  moveSeat(sessionId: string, to: number): void {
    if (this.status !== 'LOBBY') return;
    const from = this.seatOfSession(sessionId);
    if (from < 0 || to < 0 || to >= MAX_SEATS || this.seats[to] !== null) return;
    this.seats[to] = this.seats[from];
    this.seats[from] = null;
    this.broadcast();
  }

  // ---------------------------------------------------------------- bắt đầu

  /** Chủ phòng bấm Bắt đầu. */
  requestStart(sessionId: string): string | null {
    if (this.hostSession !== sessionId) return 'Chỉ chủ phòng mới bắt đầu được.';
    if (this.status !== 'LOBBY') return 'Ván đang chạy hoặc đang đếm ngược.';
    const n = this.seated().length;
    if (n < this.settings.minPlayers) {
      return `Cần ít nhất ${this.settings.minPlayers} người để bắt đầu.`;
    }
    if (n >= this.settings.maxPlayers) {
      this.startGame();
      return null;
    }
    this.countdownEndsAt = Date.now() + this.settings.countdownMs;
    this.countdownTimer = setTimeout(() => this.finishCountdown(), this.settings.countdownMs);
    this.broadcast();
    return null;
  }

  private finishCountdown(): void {
    this.countdownTimer = null;
    this.countdownEndsAt = null;
    if (this.seated().length < this.settings.minPlayers) {
      this.broadcast();
      return;
    }
    this.startGame();
  }

  private cancelCountdown(): void {
    if (this.countdownTimer) clearTimeout(this.countdownTimer);
    this.countdownTimer = null;
    this.countdownEndsAt = null;
  }

  private startGame(): void {
    this.cancelCountdown();
    const idxs = this.seated();
    for (const i of idxs) this.seats[i]!.inGame = true;

    this.game = new Game(
      idxs.map((i) => ({ sessionId: this.seats[i]!.sessionId, name: this.seats[i]!.name })),
      {
        timings: this.settings,
        roles: debugRoles(idxs.length),
        onChange: () => this.broadcastGame(),
        onCue: (cue) => this.broadcastCue(cue),
        onFx: (fx, audience) => this.sendToGameSeats(audience, EV.gameFx, fx),
        onChat: (msg, audience) => this.sendToGameSeats(audience, EV.chatWolf, msg),
        onEnd: () => this.endGame(),
      },
    );
    // Người đã mất kết nối từ trước khi bắt đầu thì đánh dấu ngay.
    idxs.forEach((seatIdx, gs) => {
      if (!this.seats[seatIdx]!.connected) this.game!.setConnected(gs, false);
    });
    this.broadcast();
    this.game.start();
  }

  private endGame(): void {
    this.game?.destroy();
    this.game = null;
    for (let i = 0; i < this.seats.length; i++) {
      const s = this.seats[i];
      if (!s) continue;
      s.inGame = false;
      if (s.left || !s.connected) {
        if (s.graceTimer) clearTimeout(s.graceTimer);
        this.seats[i] = null;
      }
    }
    this.afterPresenceChange();
  }

  /** Dọn hết hẹn giờ khi phòng bị xoá. */
  dispose(): void {
    this.cancelCountdown();
    this.clearEmptyTimer();
    this.game?.destroy();
    this.game = null;
    for (const s of this.seats) if (s?.graceTimer) clearTimeout(s.graceTimer);
  }

  // ------------------------------------------------------------------ gửi tin

  private roomStateFor(idx: number): RoomState {
    const s = this.seats[idx]!;
    const seats: (LobbySeat | null)[] = this.seats.map((x) =>
      x
        ? {
            name: x.name,
            connected: x.connected,
            isHost: x.sessionId === this.hostSession,
            inGame: x.inGame,
          }
        : null,
    );
    return {
      code: this.code,
      mySeat: idx,
      seats,
      status: this.status,
      countdownEndsAt: this.countdownEndsAt,
      serverNow: Date.now(),
      settings: this.settings,
      playing: s.inGame && !s.left,
    };
  }

  broadcast(): void {
    this.seats.forEach((s, i) => {
      if (s?.socketId) this.emit(s.socketId, EV.roomState, this.roomStateFor(i));
    });
    this.broadcastGame();
  }

  sendTo(sessionId: string): void {
    const i = this.seatOfSession(sessionId);
    const s = i >= 0 ? this.seats[i] : null;
    if (!s?.socketId) return;
    this.emit(s.socketId, EV.roomState, this.roomStateFor(i));
    this.sendGameView(s);
  }

  private sendGameView(s: SeatInfo): void {
    if (!this.game || !s.socketId || !s.inGame) return;
    const gs = this.game.seatOf(s.sessionId);
    if (gs < 0) return;
    this.emit(s.socketId, EV.gameView, this.game.viewFor(gs));
  }

  private broadcastGame(): void {
    if (!this.game) return;
    for (const s of this.seats) if (s) this.sendGameView(s);
  }

  /** Gửi một sự kiện cho một nhóm ghế trong ván (số ghế trong ván, không phải ghế ở bàn chờ). */
  private sendToGameSeats(gameSeats: number[], event: string, payload: Fx | ChatMsg): void {
    const game = this.game;
    if (!game) return;
    for (const gs of gameSeats) {
      const sessionId = game.players[gs]?.sessionId;
      const s = sessionId ? this.seats[this.seatOfSession(sessionId)] : null;
      if (s?.socketId) this.emit(s.socketId, event, payload);
    }
  }

  private broadcastCue(cue: Cue): void {
    for (const s of this.seats) {
      if (s?.socketId && s.inGame) this.emit(s.socketId, EV.gameCue, cue);
    }
  }
}
