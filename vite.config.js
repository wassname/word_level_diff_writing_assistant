import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [react()],
  base: '/word_level_diff_writing_assistant/',
  build: {
    sourcemap: true,
    target: 'esnext',
  }
})
