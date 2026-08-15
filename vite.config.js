import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,png}'],
  plugins: [
    tailwindcss(),
  ],
  server: {
    port: 5173,
  },
});