import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/CAMusicGen/', // Set the base URL
  build: {
    outDir: 'docs', // Output build to 'docs' folder
  },
  plugins: [
    vue(),
    VitePWA({
      registerType: 'autoUpdate',
      injectRegister: 'auto',
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,vue}'],
      },
      manifest: {
        name: 'Cellular Automata Music Generator',
        short_name: 'CAMusicGen',
        description:
          "Generate integer sequences for musical interpretation using Wolfram's 1D Cellular Automata.",
        start_url: '/CAMusicGen/',
        icons: [
          {
            src: '/CAMusicGen/web-app-manifest-192x192.png',
            sizes: '192x192',
            type: 'image/png',
            purpose: 'maskable',
          },
          {
            src: '/CAMusicGen/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'maskable',
          },
        ],
        theme_color: '#00ff00',
        background_color: '#000000',
        display: 'standalone',
      },
      devOptions: {
        enabled: true,
      },
    }),
  ],
})
