import { EV } from '@ms/shared';
import type { Ack } from '@ms/shared';
import type { Server, Socket } from 'socket.io';
import { RoomManager } from '../rooms/manager';
import type { Room } from '../rooms/room';

interface SocketData {
  sessionId?: string;
  code?: string;
}

type AckFn = (a: Ack) => void;

function respond(cb: unknown, a: Ack): void {
  if (typeof cb === 'function') (cb as AckFn)(a);
}

/** Giới hạn tốc độ rất đơn giản mỗi kết nối: tối đa N sự kiện mỗi giây. */
function makeLimiter(perSecond: number): () => boolean {
  let windowStart = Date.now();
  let count = 0;
  return () => {
    const now = Date.now();
    if (now - windowStart >= 1000) {
      windowStart = now;
      count = 0;
    }
    return ++count <= perSecond;
  };
}

function isInt(n: unknown): n is number {
  return typeof n === 'number' && Number.isInteger(n);
}

export function attachSockets(io: Server): RoomManager {
  const manager = new RoomManager((socketId, event, payload) => {
    io.to(socketId).emit(event, payload);
  });

  io.on('connection', (socket: Socket) => {
    const data = socket.data as SocketData;
    const allow = makeLimiter(40);

    const roomOf = (): Room | undefined => (data.code ? manager.get(data.code) : undefined);

    function bind(room: Room, sessionId: string): void {
      data.sessionId = sessionId;
      data.code = room.code;
    }

    socket.on(EV.roomCreate, (p: { name?: string; sessionId?: string; bots?: unknown }, cb) => {
      if (!allow()) return;
      if (!p || typeof p.sessionId !== 'string' || p.sessionId.length < 8) {
        return respond(cb, { ok: false, error: 'Thiếu mã phiên.' });
      }
      const room = manager.create();
      const r = room.join(p.sessionId, String(p.name ?? ''), socket.id);
      if (!r.ok) return respond(cb, { ok: false, error: r.error });
      bind(room, p.sessionId);
      if (isInt(p.bots) && p.bots > 0) room.addBots(p.bots);
      respond(cb, { ok: true, data: { code: room.code } });
      room.sendTo(p.sessionId);
    });

    socket.on(EV.roomJoin, (p: { code?: string; name?: string; sessionId?: string }, cb) => {
      if (!allow()) return;
      if (!p || typeof p.sessionId !== 'string' || p.sessionId.length < 8) {
        return respond(cb, { ok: false, error: 'Thiếu mã phiên.' });
      }
      const room = manager.get(String(p.code ?? ''));
      if (!room) return respond(cb, { ok: false, error: 'Không tìm thấy phòng.' });
      const r = room.join(p.sessionId, String(p.name ?? ''), socket.id);
      if (!r.ok) return respond(cb, { ok: false, error: r.error });
      bind(room, p.sessionId);
      respond(cb, { ok: true, data: { code: room.code } });
      room.sendTo(p.sessionId);
    });

    socket.on(EV.roomLeave, () => {
      const room = roomOf();
      if (room && data.sessionId) room.leave(data.sessionId);
      data.code = undefined;
    });

    socket.on(EV.seatMove, (p: { seat?: unknown }) => {
      if (!allow()) return;
      const room = roomOf();
      if (room && data.sessionId && isInt(p?.seat)) room.moveSeat(data.sessionId, p.seat);
    });

    socket.on(EV.seatWatch, (p: { slot?: unknown }) => {
      if (!allow()) return;
      const room = roomOf();
      if (room && data.sessionId && isInt(p?.slot)) room.moveToWatch(data.sessionId, p.slot);
    });

    socket.on(EV.gameStart, (_p, cb) => {
      if (!allow()) return;
      const room = roomOf();
      if (!room || !data.sessionId) return respond(cb, { ok: false, error: 'Chưa vào phòng.' });
      const err = room.requestStart(data.sessionId);
      respond(cb, err ? { ok: false, error: err } : { ok: true });
    });

    /** Lấy ghế trong ván của người gửi, hoặc null nếu không đang chơi. */
    function gameSeat(): { room: Room; seat: number } | null {
      const room = roomOf();
      if (!room?.game || !data.sessionId) return null;
      const seat = room.game.seatOf(data.sessionId);
      return seat >= 0 ? { room, seat } : null;
    }

    socket.on(EV.gamePointer, (p: { target?: unknown }) => {
      if (!allow()) return;
      const g = gameSeat();
      if (!g) return;
      const target = p?.target === null ? null : isInt(p?.target) ? p.target : undefined;
      if (target === undefined) return;
      g.room.game!.pointer(g.seat, target);
    });

    socket.on(EV.gameAct, (p: { kind?: unknown; targets?: unknown }) => {
      if (!allow()) return;
      const g = gameSeat();
      if (!g || typeof p?.kind !== 'string' || !Array.isArray(p.targets)) return;
      if (!p.targets.every(isInt)) return;
      g.room.game!.act(g.seat, p.kind, p.targets as number[]);
    });

    socket.on(EV.gameSkip, () => {
      if (!allow()) return;
      const g = gameSeat();
      if (g) g.room.game!.skip(g.seat);
    });

    socket.on(EV.chatWolf, (p: { text?: unknown }) => {
      if (!allow()) return;
      const g = gameSeat();
      if (g && typeof p?.text === 'string') g.room.game!.chatWolf(g.seat, p.text);
    });

    socket.on(EV.gamePause, () => {
      const room = roomOf();
      if (room && data.sessionId) room.pause(data.sessionId);
    });

    socket.on(EV.gameResume, () => {
      const room = roomOf();
      if (room && data.sessionId) room.resume(data.sessionId);
    });

    socket.on(EV.roomKick, (p: { seat?: unknown }, cb) => {
      if (!allow()) return;
      const room = roomOf();
      if (!room || !data.sessionId || !isInt(p?.seat)) return respond(cb, { ok: false });
      const err = room.kick(data.sessionId, p.seat);
      respond(cb, err ? { ok: false, error: err } : { ok: true });
    });

    socket.on(EV.roomSettings, (p: Record<string, unknown>, cb) => {
      if (!allow()) return;
      const room = roomOf();
      if (!room || !data.sessionId) return respond(cb, { ok: false });
      const err = room.updateSettings(data.sessionId, p ?? {});
      respond(cb, err ? { ok: false, error: err } : { ok: true });
    });

    socket.on(EV.roomOptions, (p: { intro?: unknown; roles?: unknown }, cb) => {
      if (!allow()) return;
      const room = roomOf();
      if (!room || !data.sessionId) return respond(cb, { ok: false });
      const err = room.updateOptions(data.sessionId, p ?? {});
      respond(cb, err ? { ok: false, error: err } : { ok: true });
    });

    socket.on(EV.gameSkipDiscuss, () => {
      if (!allow()) return;
      const g = gameSeat();
      if (g) g.room.game!.skipDiscuss(g.seat);
    });

    socket.on('disconnect', () => {
      const room = roomOf();
      if (room) room.disconnect(socket.id);
    });
  });

  return manager;
}
