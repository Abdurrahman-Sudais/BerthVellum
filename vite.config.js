import {defineConfig} from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig(({isSsrBuild}) => ({
  plugins: [react()],
  build: isSsrBuild ? {rollupOptions: {output: {entryFileNames: 'entry-server.js'}}} : {},
}));
