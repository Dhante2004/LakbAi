import tailwindcss from '@tailwindcss/vite';
import react from '@vitejs/plugin-react';
import path from 'path';
import { defineConfig, loadEnv } from 'vite';
import { VitePWA } from 'vite-plugin-pwa';

export default defineConfig(({mode}) => {
  const env = loadEnv(mode, '.', '');
  return {
    plugins: [
      react(), 
      tailwindcss(),
      VitePWA({
        registerType: 'autoUpdate',
        devOptions: {
          enabled: true 
        },
        workbox: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,jpg,jpeg}'],
          navigateFallback: '/index.html',
          // NEW: Increase cache limit to 30MB to allow your massive hero-bg.jpg to be cached
          maximumFileSizeToCacheInBytes: 30000000, 
        },
        manifest: {
          name: 'LakbAi - AI Tourism',
          short_name: 'LakbAi',
          description: 'Offline-First AI Tourism Information System',
          theme_color: '#2E7D32',
          icons: [
            {
              src: '/icon-192.jpg',
              sizes: '192x192',
              type: 'image/jpg'
            },
            {
              src: '/icon-512.jpg',
              sizes: '512x512',
              type: 'image/jpg'
            }
          ]
        }
      })
    ],
    define: {
      'process.env.GEMINI_API_KEY': JSON.stringify(env.GEMINI_API_KEY),
    },
    resolve: {
      alias: {
        '@': path.resolve(__dirname, './src'),
      },
    },
    server: {
      hmr: process.env.DISABLE_HMR !== 'true',
      proxy: {
        '/api': {
          target: 'http://localhost:3000', 
          changeOrigin: true,
        }
      }
    },
  };
});