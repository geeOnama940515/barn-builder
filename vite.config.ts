import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    host: '0.0.0.0', // allow container-wide access
    port: 9007,       // or whatever your container exposes
    strictPort: true,
    allowedHosts: ['barn-demo.gregdoesdev.xyz'], // 👈 important
  },
});
