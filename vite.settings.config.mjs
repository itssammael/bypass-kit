import { defineConfig } from 'vite';
import tailwindcss from '@tailwindcss/vite';
import path from 'node:path';
import { resolve } from 'path'; 

// https://vitejs.dev/config
export default defineConfig({
  plugins: [
    tailwindcss(),
  ],
   build: {
    rollupOptions: {
      input: {
        settings: resolve(__dirname, 'src/windows/modal_windows/tool_floater.html') // Point to your new HTML file
      }
    }
  }
});
