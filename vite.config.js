import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  base: '/',
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      workbox: {
        skipWaiting: true,
        clientsClaim: true
      },
      includeAssets: ['apple-touch-icon.png', 'app-icon-192.png', 'app-icon-512.png', 'app-icon-1024.png'],
      manifest: {
        name: 'AI Ekonomi',
        short_name: 'Ekonomi',
        description: 'Premium Bütçe ve Harcama Takip Asistanı',
        theme_color: '#ffffff',
        background_color: '#F2F4F8',
        display: 'standalone',
        icons: [
          {
            src: 'app-icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: 'app-icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any maskable'
          },
          {
            src: 'app-icon-1024.png',
            sizes: '1024x1024',
            type: 'image/png',
            purpose: 'any'
          }
        ]
      }
    })
  ],
  server: {
    proxy: {
      '/api/truncgil': {
        target: 'https://finans.truncgil.com',
        changeOrigin: true,
        rewrite: (path) => path.replace(/^\/api\/truncgil/, '')
      }
    }
  }
})
