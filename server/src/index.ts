import { existsSync } from 'node:fs';
import { createServer } from 'node:http';
import path from 'node:path';
import { fileURLToPath } from 'node:url';
import express from 'express';
import { Server } from 'socket.io';
import { attachSockets } from './net/socket';

const here = path.dirname(fileURLToPath(import.meta.url));
const clientDist = path.resolve(here, '../../client/dist');

const app = express();
app.get('/health', (_req, res) => {
  res.status(200).send('ok');
});

if (existsSync(clientDist)) {
  app.use(express.static(clientDist));
  app.get('*', (_req, res) => {
    res.sendFile(path.join(clientDist, 'index.html'));
  });
}

const httpServer = createServer(app);
const io = new Server(httpServer, {
  // Khi dev, Vite proxy tới đây nên không cần CORS rộng; vẫn cho phép để dễ thử.
  cors: { origin: true },
  maxHttpBufferSize: 10_000,
});
attachSockets(io);

const port = Number(process.env.PORT ?? 3100);
httpServer.listen(port, () => {
  console.log(`Ma Soi server dang chay o cong ${port}`);
  if (!existsSync(clientDist)) {
    console.log('(Chua co client/dist: dang o che do dev, hay chay client bang Vite.)');
  }
});
