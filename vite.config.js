import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      includeAssets: ['favicon.ico', 'apple-touch-icon.png', 'pwa-icon.png'],
      manifest: {
        name: 'AI Ekonomi',
        short_name: 'Ekonomi',
        description: 'Premium Bütçe ve Harcama Takip Asistanı',
        theme_color: '#ffffff',
        background_color: '#F2F4F8',
        display: 'standalone',
        icons: [
          {
            src: 'pwa-icon.png',
            sizes: '1024x1024',
            type: 'image/png'
          },
          {
            src: 'pwa-icon.png',
            sizes: '512x512',
            type: 'image/png'
          },
          {
            src: 'pwa-icon.png',
            sizes: '192x192',
            type: 'image/png'
          }
        ]
      }
    })
  ],
})
