// @ts-check
import { defineConfig, devices } from '@playwright/test'

/**
 * Config mínima pro gate de a11y (Task 10). Sobe a app em produção
 * (build + start, porta 3000) via webServer e roda os specs em
 * tests/**. Só Chromium — auditoria axe não precisa de cross-browser.
 */
export default defineConfig({
  testDir: './tests',
  fullyParallel: false,
  workers: 1,
  reporter: [['list']],
  use: {
    baseURL: 'http://localhost:3000',
    trace: 'retain-on-failure',
    // Gate de a11y roda com prefers-reduced-motion: reduce — o inline
    // script de app/layout.js detecta isso e adiciona a classe "reduced",
    // que faz Landing.js pular Lenis/GSAP (ver app/globals.css:
    // `.reduced [data-animate]{opacity:1!important;...}`). Sem isso, o
    // axe pode escanear seções ainda no meio da timeline de entrada
    // (opacity animando de 0→1) e reportar falso-positivo de contraste.
    // Reduced-motion também é o estado real de usuários com sensibilidade
    // a movimento, então é uma configuração legítima pro gate, não só um
    // atalho de teste.
    reducedMotion: 'reduce',
  },
  projects: [
    { name: 'chromium', use: { ...devices['Desktop Chrome'] } },
  ],
  webServer: {
    command: 'npm run build && npm start',
    url: 'http://localhost:3000',
    reuseExistingServer: false,
    timeout: 180_000,
  },
})
