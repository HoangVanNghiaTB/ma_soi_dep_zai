import react from '@vitejs/plugin-react';
import { defineConfig } from 'vite';

export default defineConfig({
  plugins: [react()],
  server: {
    port: 5173,
    host: true, // cho điện thoại cùng Wi-Fi truy cập được
    proxy: {
      '/socket.io': { target: 'http://localhost:3100', ws: true },
    },
  },
  build: { chunkSizeWarningLimit: 1200 },
});
