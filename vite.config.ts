import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig({
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',  // força atualização mais agressiva após deploys (evita ficar preso em bundle antigo com voz robótica)
      includeAssets: ['/favicon-32.png', '/apple-touch-icon.png', '/icon-192.png', '/icon-512.png'],
      manifest: {
        name: 'Alfafa - O Alfabeto Mágico',
        short_name: 'Alfafa',
        description: 'Aprenda o alfabeto brincando com o Alfafa, o elefantinho mais fofo do mundo!',
        theme_color: '#a855f7',
        background_color: '#fff7ed',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        scope: '/',
        lang: 'pt-BR',
        icons: [
          {
            src: '/icon-192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any'
          },
          {
            src: '/icon-512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable'
          }
        ]
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
        // Força o SW a ativar imediatamente após novo deploy
        skipWaiting: true,
        clientsClaim: true,
        runtimeCaching: [
          {
            // Cache de áudio gerado por SpeechSynthesis (não se aplica diretamente, mas preparamos)
            urlPattern: /^https:\/\/.*\.(mp3|wav|ogg)$/,
            handler: 'CacheFirst',
            options: {
              cacheName: 'audio-cache',
              expiration: {
                maxEntries: 200,
                maxAgeSeconds: 60 * 60 * 24 * 30 // 30 dias
              }
            }
          }
        ]
      }
    })
  ],
  server: {
    port: 5173,
    host: true
  }
})