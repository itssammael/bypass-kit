import { defineConfig, normalizePath } from 'vite';
import { viteStaticCopy } from 'vite-plugin-static-copy';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { resolve } from 'path'; 

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    tailwindcss(),
    viteStaticCopy({
      targets: [
        {
          src: normalizePath(path.resolve(__dirname, './.env')),
          dest: './.vite/build'
        }
      ]
    }),
  ],
   build: {
    rollupOptions: {
      input: {
        settings: resolve(__dirname, 'src/windows/modal_windows/tool_floater.html') // Point to your new HTML file
      }
    }
  }
});
