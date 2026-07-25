import axeCore from 'axe-core'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const baseUrl = process.env.UI_TEST_BASE_URL ?? 'http://127.0.0.1:4173'
const channel = process.env.PLAYWRIGHT_CHANNEL ?? 'msedge'
const screenshotDir = process.env.UI_SCREENSHOT_DIR
const projectId = '11111111-1111-4111-8111-111111111111'

const project = {
  wa_projectid: projectId,
  wa_projectname: 'Kuching Civic Centre',
  wa_projecttype: 127620001,
  'wa_projecttype@OData.Community.Display.V1.FormattedValue':
    'Government Building',
  wa_projecthealth: 127620000,
  'wa_projecthealth@OData.Community.Display.V1.FormattedValue': 'Green',
  wa_plannedcompletiondate: '2027-11-30',
  wa_approvedbudget: 185000000,
  wa_actualcost: 61400000,
  wa_currentphysicalprogresspercentage: 42,
  _wa_contractor_value: '21111111-1111-4111-8111-111111111111',
  '_wa_contractor_value@OData.Community.Display.V1.FormattedValue':
    'Borneo Build Sdn Bhd',
  _wa_primarycontractor_value: '21111111-1111-4111-8111-111111111111',
  '_wa_primarycontractor_value@OData.Community.Display.V1.FormattedValue':
    'Borneo Build Sdn Bhd',
  _wa_projectlocationid_value: '31111111-1111-4111-8111-111111111111',
  '_wa_projectlocationid_value@OData.Community.Display.V1.FormattedValue':
    'Kuching',
}

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
  {
    path: '/projects/new',
    title: 'Create project — Sarawak Project Monitoring Portal',
    heading: 'Create new project',
    activeLink: 'Projects',
  },
  {
    path: `/projects/${projectId}`,
    title: 'Kuching Civic Centre — Sarawak Project Monitoring Portal',
    heading: 'Kuching Civic Centre',
    activeLink: 'Projects',
  },
]

const viewports = [
  { name: 'mobile', width: 375, height: 812 },
  { name: 'mobile-landscape', width: 812, height: 375 },
  { name: 'tablet', width: 768, height: 1024 },
  { name: 'desktop', width: 1024, height: 800 },
  { name: 'wide-desktop', width: 1440, height: 900 },
]

const browser = await chromium.launch({ channel, headless: true })
const results = []
let failed = false

try {
  if (screenshotDir) await mkdir(screenshotDir, { recursive: true })

  for (const viewport of viewports) {
    const page = await browser.newPage({ viewport })

    await page.route('**/_api/wa_projects*', (route) => {
      const isDetail = new URL(route.request().url()).pathname.includes(
        'wa_projects(',
      )
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(
          isDetail ? project : { value: [project], '@odata.count': 1 },
        ),
      })
    })
    await page.route('**/_api/wa_contractors*', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          value: [
            {
              wa_contractorid: '21111111-1111-4111-8111-111111111111',
              wa_contractorname: 'Borneo Build Sdn Bhd',
            },
          ],
          '@odata.count': 1,
        }),
      }),
    )
    await page.route('**/_api/wa_projectlocations*', (route) =>
      route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify({
          value: [
            {
              wa_projectlocationid: '31111111-1111-4111-8111-111111111111',
              wa_locationname: 'Kuching',
            },
          ],
          '@odata.count': 1,
        }),
      }),
    )

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
          hasHorizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          expected,
        }
      }, route)

      if (
        screenshotDir &&
        route.path === '/projects' &&
        ['mobile', 'wide-desktop'].includes(viewport.name)
      ) {
        await page.screenshot({
          fullPage: true,
          path: path.join(screenshotDir, `projects-${viewport.name}.png`),
        })
      }

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

if (failed) process.exitCode = 1
