import { test, expect } from '@playwright/test'
import AxeBuilder from '@axe-core/playwright'

// Task 10 — gate de acessibilidade WCAG 2.2 AA. Roda axe-core em produção
// (webServer builda + `next start`, ver playwright.config.js) em cada rota
// pública e falha o teste se houver violação de impact critical/serious.
// Violações moderate/minor não bloqueiam o gate, mas ficam no relatório do
// Playwright (anexo "axe-violations") para triagem manual.

const TAGS = ['wcag2a', 'wcag2aa', 'wcag21aa', 'wcag22aa']
const ROUTES = ['/', '/politica-de-privacidade/', '/exclusao-de-conta/']

async function runAxe(page) {
  return new AxeBuilder({ page }).withTags(TAGS).analyze()
}

function seriousOf(results) {
  return results.violations.filter((v) => ['critical', 'serious'].includes(v.impact))
}

async function attachViolations(testInfo, results) {
  await testInfo.attach('axe-results', {
    body: JSON.stringify(results.violations, null, 2),
    contentType: 'application/json',
  })
}

for (const path of ROUTES) {
  test(`a11y ${path}`, async ({ page }, testInfo) => {
    await page.goto(path)
    // deixa o hero renderizar (fonte local via next/font, imagens priority)
    await page.waitForLoadState('networkidle')
    const results = await runAxe(page)
    await attachViolations(testInfo, results)
    expect(seriousOf(results), JSON.stringify(seriousOf(results), null, 2)).toEqual([])
  })
}

test('a11y — TestCta em estado de erro (validação client-side)', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const form = page.locator('#testar form')
  await form.getByRole('button', { name: /quero testar/i }).click()

  // aria-live do form deve anunciar o erro de validação (nome vazio)
  await expect(page.locator('#testar .form__status')).toHaveText(/preencha seu nome/i)

  const results = await runAxe(page)
  await attachViolations(testInfo, results)
  expect(seriousOf(results), JSON.stringify(seriousOf(results), null, 2)).toEqual([])
})

test('a11y — FeedbackForm em estado de erro (validação client-side)', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const form = page.locator('#feedback form')
  await form.getByRole('button', { name: /enviar feedback/i }).click()

  await expect(page.locator('#feedback .form__status')).toHaveText(/escolha o tipo/i)

  const results = await runAxe(page)
  await attachViolations(testInfo, results)
  expect(seriousOf(results), JSON.stringify(seriousOf(results), null, 2)).toEqual([])
})

test('a11y — FAQ com painel aberto', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  await page.locator('.faq__trigger').first().click()
  await expect(page.locator('.faq__trigger').first()).toHaveAttribute('aria-expanded', 'true')

  const results = await runAxe(page)
  await attachViolations(testInfo, results)
  expect(seriousOf(results), JSON.stringify(seriousOf(results), null, 2)).toEqual([])
})

test('a11y — overlay de convite (fallback pós-2500ms, aria-live)', async ({ page }, testInfo) => {
  // waitUntil:'domcontentloaded' — o script inline dispara location.href
  // pra um custom scheme (mylittle://…) assim que o DOM carrega; o evento
  // 'load' da página pode nunca disparar em Chromium headless quando essa
  // navegação pra scheme desconhecido fica pendente.
  await page.goto('/?token=teste-invite-token', { waitUntil: 'domcontentloaded' })
  await page.waitForSelector('#invite-overlay', { state: 'visible' })

  // fallback só aparece após o timeout de 2500ms definido em app/layout.js
  await page.waitForTimeout(2700)
  const fallback = page.locator('.invite-fallback')
  await expect(fallback).toBeVisible()
  await expect(fallback).toHaveAttribute('aria-live', 'polite')

  const results = await runAxe(page)
  await attachViolations(testInfo, results)
  expect(seriousOf(results), JSON.stringify(seriousOf(results), null, 2)).toEqual([])
})
