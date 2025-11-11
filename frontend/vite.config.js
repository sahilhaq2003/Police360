import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'

// https://vite.dev/config/
// Set `base` so the built assets reference the correct path when
// hosted on GitHub Pages (https://<user>.github.io/Police360/).
// When developing locally NODE_ENV !== 'production' so base stays '/'.
export default defineConfig({
  base: process.env.NODE_ENV === 'production' ? '/Police360/' : '/',
  plugins: [react(), tailwindcss()],
})
