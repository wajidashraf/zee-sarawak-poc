import axeCore from 'axe-core'
import { chromium } from 'playwright'

const baseUrl = process.env.UI_TEST_BASE_URL ?? 'http://127.0.0.1:4173'
const channel = process.env.PLAYWRIGHT_CHANNEL ?? 'msedge'

const routes = [
  {
    path: '/',
    title: 'Sarawak Project Monitoring Portal',
    heading: 'Monitor every project with clarity.',
    activeLink: 'Home',
  },
  {
    path: '/projects',
    title: 'Projects — Sarawak Project Monitoring Portal',
    heading: 'Projects',
    activeLink: 'Projects',
  },
]

const viewports = [
  { name: 'desktop', width: 1280, height: 800 },
  { name: 'mobile', width: 375, height: 812 },
]

const browser = await chromium.launch({ channel, headless: true })
const results = []
let failed = false

try {
  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport })

    for (const route of routes) {
      await page.goto(`${baseUrl}${route.path}`, {
        waitUntil: 'networkidle',
        timeout: 15_000,
      })
      await page.waitForFunction(
        (expectedTitle) => document.title === expectedTitle,
        route.title,
      )

      const structure = await page.evaluate((expected) => {
        const primaryNav = document.querySelector(
          'nav[aria-label="Primary navigation"]',
        )
        const activeLink = primaryNav?.querySelector('[aria-current="page"]')
        const navLinks = [...(primaryNav?.querySelectorAll('a') ?? [])]
        const hasHorizontalOverflow =
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth

        return {
          title: document.title,
          heading: document.querySelector('main h1')?.textContent?.trim(),
          headerCount: document.querySelectorAll('header.site-header').length,
          footerCount: document.querySelectorAll('footer.site-footer').length,
          mainCount: document.querySelectorAll('main#main-content').length,
          navLabels: navLinks.map((link) => link.textContent?.trim()),
          activeLink: activeLink?.textContent?.trim(),
          minNavLinkHeight: Math.min(
            ...navLinks.map((link) => link.getBoundingClientRect().height),
          ),
          hasHorizontalOverflow,
          expected,
        }
      }, route)

      await page.addScriptTag({ content: axeCore.source })
      const accessibility = await page.evaluate(async () => {
        const audit = await window.axe.run(document, {
          runOnly: {
            type: 'tag',
            values: [
              'wcag2a',
              'wcag2aa',
              'wcag21a',
              'wcag21aa',
              'wcag22aa',
            ],
          },
        })

        return {
          violations: audit.violations.map((violation) => ({
            id: violation.id,
            impact: violation.impact,
            description: violation.description,
          })),
          passes: audit.passes.length,
          incomplete: audit.incomplete.length,
        }
      })

      const structuralIssues = []

      if (structure.title !== route.title) structuralIssues.push('document title')
      if (structure.heading !== route.heading) structuralIssues.push('page heading')
      if (structure.headerCount !== 1) structuralIssues.push('shared header')
      if (structure.footerCount !== 1) structuralIssues.push('shared footer')
      if (structure.mainCount !== 1) structuralIssues.push('main landmark')
      if (structure.navLabels.join(',') !== 'Home,Projects') {
        structuralIssues.push('primary navigation labels')
      }
      if (structure.activeLink !== route.activeLink) {
        structuralIssues.push('active navigation state')
      }
      if (structure.minNavLinkHeight < 44) {
        structuralIssues.push('navigation touch target')
      }
      if (structure.hasHorizontalOverflow) {
        structuralIssues.push('horizontal overflow')
      }

      const seriousViolations = accessibility.violations.filter(
        (violation) =>
          violation.impact === 'critical' || violation.impact === 'serious',
      )

      if (structuralIssues.length > 0 || seriousViolations.length > 0) {
        failed = true
      }

      results.push({
        viewport: viewport.name,
        route: route.path,
        structuralIssues,
        accessibility,
      })
    }

    await page.close()
  }
} finally {
  await browser.close()
}

console.log(JSON.stringify(results, null, 2))

if (failed) {
  process.exitCode = 1
}
