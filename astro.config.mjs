// astro.config.mjs
import { defineConfig } from 'astro/config';
import node from '@astrojs/node';
import path from 'path';

export default defineConfig({
  output: 'server',
  adapter: node({
    mode: 'middleware',
  }),
  vite: {
    resolve: {
      alias: {
        '@lib': path.resolve('./src/lib'),
        '@components': path.resolve('./src/components'),
        '@styles': path.resolve('./src/styles'),
      },
    },
  },
});
