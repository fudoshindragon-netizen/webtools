import { defineConfig } from 'vite';
import { fileURLToPath, URL } from 'node:url';

// Multi-page build: emit both Study Hub (index.html) and Focus & Flow (focus-flow.html).
export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: fileURLToPath(new URL('./index.html', import.meta.url)),
        focusFlow: fileURLToPath(new URL('./focus-flow.html', import.meta.url)),
      },
    },
  },
});
