// Génère landing/assets/og-image.jpg (1200×630) à partir de scripts/landing/og-image.html.
// Usage : node scripts/landing/build-og.mjs  (Playwright ; CHROMIUM_PATH pour utiliser un Chromium système)
import { chromium } from 'playwright'
import { fileURLToPath, pathToFileURL } from 'node:url'

const here = (p) => fileURLToPath(new URL(p, import.meta.url))
const browser = await chromium.launch(process.env.CHROMIUM_PATH ? { executablePath: process.env.CHROMIUM_PATH } : {})
const page = await browser.newPage({ viewport: { width: 1200, height: 630 } })
await page.goto(pathToFileURL(here('./og-image.html')).href, { waitUntil: 'networkidle' })
await page.evaluate(() => document.fonts.ready)
await page.screenshot({ path: here('../../landing/assets/og-image.jpg'), type: 'jpeg', quality: 86 })
await browser.close()
console.log('landing/assets/og-image.jpg')
