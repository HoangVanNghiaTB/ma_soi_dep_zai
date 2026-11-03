// Chạy thử thật qua mạng: 5 "người chơi" vào phòng, chơi đến sáng đầu tiên.
// Cách dùng: bật server (npm run dev -w server) rồi chạy `node scripts/smoke.mjs`.
import { io } from 'socket.io-client';

const URL = process.env.URL ?? 'http://localhost:3100';
const N = 5;
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const log = (...a) => console.log(new Date().toISOString().slice(11, 19), ...a);

function client(i) {
  const socket = io(URL, { transports: ['websocket'] });
  const c = { i, socket, view: null, room: null, cues: [] };
  socket.on('room:state', (r) => (c.room = r));
  socket.on('game:view', (v) => (c.view = v));
  socket.on('game:cue', (q) => c.cues.push(q.id));
  return c;
}

const ask = (c, ev, payload) =>
  new Promise((res) => c.socket.timeout(5000).emit(ev, payload, (e, a) => res(e ? { ok: false, error: String(e) } : a)));

const clients = Array.from({ length: N }, (_, i) => client(i));
await Promise.all(clients.map((c) => new Promise((r) => c.socket.on('connect', r))));

const made = await ask(clients[0], 'room:create', { name: 'Chu', sessionId: 'session-0-aaaaaaaa' });
if (!made.ok) throw new Error('create: ' + made.error);
const code = made.data.code;
log('Phong', code);
for (let i = 1; i < N; i++) {
  const r = await ask(clients[i], 'room:join', { code, name: `P${i}`, sessionId: `session-${i}-aaaaaaaa` });
  if (!r.ok) throw new Error('join: ' + r.error);
}

const started = await ask(clients[0], 'game:start', {});
if (!started.ok) throw new Error('start: ' + started.error);
log('Dem nguoc bat dau (15s)...');

async function until(pred, ms, what) {
  const t0 = Date.now();
  while (Date.now() - t0 < ms) {
    if (pred()) return;
    await sleep(100);
  }
  throw new Error('het gio cho: ' + what);
}

await until(() => clients.every((c) => c.view), 25_000, 'view dau tien');
log('Ván bắt đầu. Vai:', clients.map((c) => c.view.me.role).join(', '));

// Mỗi người chỉ thấy vai của mình.
for (const c of clients) {
  const leaks = c.view.players.filter(
    (p) => p.seat !== c.view.me.seat && p.icon && p.icon !== 'wolf' && p.icon !== 'tomb',
  );
  if (leaks.length) throw new Error('lo vai!');
  if (c.view.roles) throw new Error('lo bang vai!');
}
log('OK: khong lo vai trong view');

const wolf = clients.find((c) => c.view.me.role === 'werewolf');
await until(() => wolf.view.prompt?.kind === 'bite', 20_000, 'luot soi');
const others = clients.filter((c) => c !== wolf);
if (others.some((c) => c.view.prompt)) throw new Error('nguoi khac co nut cat!');
log('OK: chi Soi co nut cat; awake =', clients.map((c) => c.view.awake).join(','));

const victim = wolf.view.prompt.targets[0];
wolf.socket.emit('game:pointer', { target: victim });
await sleep(300);
wolf.socket.emit('game:act', { kind: 'bite', targets: [victim] });
log('Soi can ghe', victim);

await until(() => wolf.view.phase === 'DAWN', 20_000, 'troi sang');
log('Troi sang:', wolf.view.announce, '| icon nan nhan:', wolf.view.players[victim].icon);
if (wolf.view.players[victim].icon !== 'tomb') throw new Error('nan nhan khong thanh bia mo');

await until(() => clients[0].view.phase === 'DAY_DISCUSS', 15_000, 'thao luan');
log('OK: sang giai doan thao luan. Cues da nhan:', [...new Set(clients[0].cues)].join(', '));

for (const c of clients) c.socket.close();
log('SMOKE TEST DAT');
process.exit(0);
