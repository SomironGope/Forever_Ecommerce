import { defineConfig } from 'vite'
import tailwindcss from '@tailwindcss/vite'

export default defineConfig({
  content: ['./index.html', './src/**/*.{js,ts,jsx,tsx,png}'],
  server: {
   port: 5173,
  },
  
  plugins: [
    tailwindcss(),
  ],

});




