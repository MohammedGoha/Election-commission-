import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
export default defineConfig({
  plugins: [react(),tailwindcss(),],
  optimizeDeps: {
    include: ['@visx/shape', '@visx/group', '@visx/scale', '@visx/axis', '@visx/responsive']
  }
})
