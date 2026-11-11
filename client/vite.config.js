import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  server: {
    port: 5173,
    proxy: {
      // Forward API calls to Express so the browser sees one origin.
      '/api': 'http://localhost:4000',
      // Chat (Socket.IO, used in M6) needs WebSocket forwarding too.
      '/socket.io': { target: 'http://localhost:4000', ws: true },
    },
  },
});
