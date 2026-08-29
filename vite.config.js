import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

const pkg = JSON.parse(readFileSync(fileURLToPath(new URL('./package.json', import.meta.url)), 'utf8'))

function gitShortSha() {
  try { return execSync('git rev-parse --short HEAD').toString().trim() } catch { return null }
}

export default defineConfig({
  // Numéro de version, SHA de commit et date de build affichés dans l'app (Paramètres, À propos)
  // — sources uniques : package.json / git / heure du build.
  define: {
    __APP_VERSION__: JSON.stringify(pkg.version),
    __BUILD_DATE__: JSON.stringify(new Date().toISOString()),
    __GIT_SHA__: JSON.stringify(gitShortSha()),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Enregistrement manuel via virtual:pwa-register (src/pwaUpdate.js) : permet un contrôle
      // explicite du cycle de mise à jour (vérification périodique + bouton "Vérifier les mises à jour").
      injectRegister: false,
      includeAssets: ['favicon.svg', 'icon-192.png', 'icon-512.png'],
      manifest: {
        name: 'Astror',
        short_name: 'Astror',
        description: 'Compagnon d\'observation astronomique',
        theme_color: '#04060e',
        background_color: '#04060e',
        display: 'standalone',
        orientation: 'portrait',
        start_url: '/',
        icons: [
          { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
          { src: '/icon-512.png', sizes: '512x512', type: 'image/png', purpose: 'any maskable' },
          { src: '/favicon.svg', sizes: 'any', type: 'image/svg+xml' },
        ],
      },
      workbox: {
        globPatterns: ['**/*.{js,css,html,ico,png,svg,woff2}'],
      },
    }),
  ],
  test: {
    environment: 'jsdom',
    setupFiles: ['./src/test-setup.js'],
    globals: true,
  },
})
