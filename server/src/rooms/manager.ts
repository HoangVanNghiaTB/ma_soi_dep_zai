import { Room } from './room';
import type { Emit } from './room';

/** Bỏ các ký tự dễ nhầm (0/O, 1/I). */
const ALPHABET = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789';

function randomCode(len = 5): string {
  let s = '';
  for (let i = 0; i < len; i++) s += ALPHABET[Math.floor(Math.random() * ALPHABET.length)];
  return s;
}

export class RoomManager {
  private rooms = new Map<string, Room>();

  constructor(private emit: Emit) {}

  create(): Room {
    let code = randomCode();
    while (this.rooms.has(code)) code = randomCode();
    const room = new Room(code, this.emit, (r) => this.remove(r));
    this.rooms.set(code, room);
    return room;
  }

  get(code: string): Room | undefined {
    return this.rooms.get(code.trim().toUpperCase());
  }

  remove(room: Room): void {
    room.dispose();
    this.rooms.delete(room.code);
  }

  get size(): number {
    return this.rooms.size;
  }
}
