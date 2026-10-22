import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { defineConfig } from 'vite'

// GitHub Pages serves the app under /dresden-tour/
export default defineConfig({
  base: '/dresden-tour/',
  plugins: [react(), tailwindcss()],
})
