import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';

export default defineConfig({
  plugins: [react()],
  optimizeDeps: {
    exclude: ['lucide-react'],
  },
  preview: {
    host: true, // <-- this allows external access
    strictPort: false,
    allowedHosts: ['barn-demo.gregdoesdev.xyz'], // required for domain access
  },
});
