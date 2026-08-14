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

// Reforço explícito do reducedMotion:'reduce' do playwright.config.js: em
// alguns runs o media feature emulado pelo Chromium ainda não estava
// disponível no exato instante em que o script inline de app/layout.js lê
// matchMedia('(prefers-reduced-motion: reduce)') logo no <head> (corrida
// entre a emulação via CDP e o parse do documento) — nesse caso a classe
// "reduced" não é adicionada, Lenis/GSAP entram no modo normal (com
// reveals scroll-triggered) e uma interação que arrasta o scroll pra perto
// do form de contato pode, em runs raros, deixar o axe escanear seções
// mais abaixo (ex.: FAQ) ainda em transição de opacidade. Chamar
// emulateMedia aqui, antes de cada goto, garante que o media feature já
// está setado no browser antes da navegação.
test.beforeEach(async ({ page }) => {
  await page.emulateMedia({ reducedMotion: 'reduce' })
})

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

test('a11y — ContactForm (intenção "testar") em estado de erro (validação client-side)', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const form = page.locator('#testar form')
  // "testar" é a intenção padrão do ContactForm — submete vazio direto.
  await form.getByRole('button', { name: /quero testar/i }).click()

  // aria-live do form deve anunciar o erro de validação (nome vazio)
  await expect(page.locator('#testar .form__status')).toHaveText(/preencha seu nome/i)

  const results = await runAxe(page)
  await attachViolations(testInfo, results)
  expect(seriousOf(results), JSON.stringify(seriousOf(results), null, 2)).toEqual([])
})

test('a11y — ContactForm (intenção "feedback") em estado de erro (validação client-side)', async ({ page }, testInfo) => {
  await page.goto('/')
  await page.waitForLoadState('networkidle')

  const form = page.locator('#testar form')
  // o radio real fica visualmente escondido (chip estilizado no <label>);
  // clicar no texto do label é o que um usuário faria e alterna o radio
  // nativamente, sem depender de "force" pra furar a checagem de
  // actionability do Playwright.
  await form.getByText('Enviar um feedback', { exact: true }).click()
  await form.getByRole('button', { name: /enviar feedback/i }).click()

  // aria-live do form deve anunciar o erro de validação (mensagem vazia)
  await expect(page.locator('#testar .form__status')).toHaveText(/escreva sua mensagem/i)

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
