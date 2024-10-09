import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'

export default defineConfig({
  plugins: [react()],
  server: {
    proxy: {
      '/socket.io': {
        target: 'https://chatapp-react-node-ylfg.onrender.com',
        ws: true
      }
    }
  }
})
