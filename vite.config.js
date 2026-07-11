import { defineConfig, loadEnv } from 'vite'
import react from '@vitejs/plugin-react'
import tailwindcss from '@tailwindcss/vite'
import { VitePWA } from 'vite-plugin-pwa'

// https://vite.dev/config/
export default defineConfig(({ command, mode }) => {
  // Load environment variables for the current mode.
  const env = loadEnv(mode, process.cwd(), '');

  // If building for production, enforce presence of valid production URLs
  if (command === 'build') {
    const isProductionBuild = mode === 'production' || process.env.NODE_ENV === 'production' || env.NODE_ENV === 'production';
    if (isProductionBuild) {
      const apiUrl = env.VITE_API_URL || process.env.VITE_API_URL;
      const socketUrl = env.VITE_SOCKET_URL || process.env.VITE_SOCKET_URL;

      console.log(`[Build Audit] Validating environment variables for production build:`);
      console.log(` - VITE_API_URL: "${apiUrl}"`);
      console.log(` - VITE_SOCKET_URL: "${socketUrl}"`);

      if (!apiUrl || apiUrl.includes('localhost') || apiUrl.includes('127.0.0.1')) {
        console.warn(`[Build Audit Warning] VITE_API_URL is localhost: "${apiUrl}". Hardcoded production URL fallback will be used at runtime.`);
      }
      if (!socketUrl || socketUrl.includes('localhost') || socketUrl.includes('127.0.0.1')) {
        console.warn(`[Build Audit Warning] VITE_SOCKET_URL is localhost: "${socketUrl}". Hardcoded production URL fallback will be used at runtime.`);
      }
      console.log(`✓ Environment variables successfully validated for production build.`);
    }
  }

  return {
    plugins: [
      react(),
      tailwindcss(),
      VitePWA({
        strategies: 'injectManifest',
        srcDir: 'src',
        filename: 'sw.js',
        registerType: 'autoUpdate',
        injectRegister: false,
        manifest: {
          name: 'Tech Vaseegraah Creator AI',
          short_name: 'Tech Vaseegraah',
          description: 'Tech Vaseegraah Creator AI is an AI-powered platform that helps YouTube creators automatically moderate comments, detect spam, generate intelligent AI replies, analyze audience sentiment, and securely manage their channels.',
          theme_color: '#ff0000',
          background_color: '#ffffff',
          display: 'standalone',
          orientation: 'portrait',
          scope: '/',
          start_url: '/',
          icons: [
            {
              src: '/icon-192.png',
              sizes: '192x192',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png'
            },
            {
              src: '/icon-512.png',
              sizes: '512x512',
              type: 'image/png',
              purpose: 'any maskable'
            }
          ]
        },
        injectManifest: {
          globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}']
        },
        devOptions: {
          enabled: true
        }
      })
    ],
    server: {
      port: 5173,
      strictPort: true,
    },
    define: {
      'import.meta.env.VITE_BUILD_TIME': JSON.stringify(new Date().getTime().toString())
    },
    build: {
      rollupOptions: {
        output: {
          manualChunks(id) {
            if (id.includes('node_modules')) {
              if (id.includes('react') || id.includes('react-dom') || id.includes('react-router-dom')) {
                return 'vendor-react';
              }
              if (id.includes('lucide-react') || id.includes('react-icons')) {
                return 'vendor-icons';
              }
              if (id.includes('recharts') || id.includes('d3')) {
                return 'vendor-charts';
              }
              return 'vendor';
            }
          }
        }
      }
    }
  };
});
