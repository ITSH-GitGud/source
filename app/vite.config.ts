// vite.config.ts
import { defineConfig } from 'vite';
import tspaths from 'vite-tsconfig-paths';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import react from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';

export default defineConfig({
  server: {
    port: 80,
  },
  plugins: [
    tspaths(),
    tanstackStart({
      spa: {
        enabled: true,
        prerender: { enabled: false },
      },
      sitemap: { enabled: false },
      prerender: { enabled: false },
      client: {
        entry: './src/main.tsx',
      },
      server: {
        entry: './src/main.server.tsx',
      },
      router: {
        generatedRouteTree: '../gen/routeTree.gen.ts',
        quoteStyle: 'single',
      },
    }),
    nitro({
      config: {
        preset: 'node-server',
      },
    }),
    react(),
  ],
});
