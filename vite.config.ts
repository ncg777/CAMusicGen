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
            purpose: 'any',
          },
          {
            src: '/CAMusicGen/web-app-manifest-512x512.png',
            sizes: '512x512',
            type: 'image/png',
            purpose: 'any',
          },
        ],
        screenshots: [
          {
            src: '/CAMusicGen/screenshot-desktop-main.png',
            sizes: '1920x1020', // Common desktop screenshot resolution
            type: 'image/png',
            form_factor: 'wide', // <--- IMPORTANT: Specifies it's for wide screens
            label: 'Main configuration and visualization',
          },
          {
            src: '/CAMusicGen/screenshot-mobile-main.png',
            sizes: '424x869', // Common mobile portrait resolution
            type: 'image/png',
            form_factor: 'narrow', // For narrower screens (phones)
            label: 'Mobile view of the generator',
          },
          // You can add more screenshots as needed
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
