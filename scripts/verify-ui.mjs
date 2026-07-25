import axeCore from 'axe-core'
import { chromium } from 'playwright'
import { mkdir } from 'node:fs/promises'
import path from 'node:path'

const baseUrl = process.env.UI_TEST_BASE_URL ?? 'http://127.0.0.1:4173'
const channel = process.env.PLAYWRIGHT_CHANNEL ?? 'msedge'
const screenshotDir = process.env.UI_SCREENSHOT_DIR
const projectId = '11111111-1111-4111-8111-111111111111'

const projects = [
  {
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
  },
  {
    wa_projectid: '12222222-2222-4222-8222-222222222222',
    wa_projectname: 'Miri Waterfront Renewal',
    wa_projecttype: 127620004,
    'wa_projecttype@OData.Community.Display.V1.FormattedValue':
      'Renovation or Upgrading',
    wa_projecthealth: 127620001,
    'wa_projecthealth@OData.Community.Display.V1.FormattedValue': 'Amber',
    wa_plannedcompletiondate: '2027-08-15',
    wa_approvedbudget: 92000000,
    wa_actualcost: 53200000,
    wa_currentphysicalprogresspercentage: 61,
    _wa_contractor_value: '21111111-1111-4111-8111-111111111111',
    '_wa_contractor_value@OData.Community.Display.V1.FormattedValue':
      'Borneo Build Sdn Bhd',
    _wa_projectlocationid_value: '32222222-2222-4222-8222-222222222222',
    '_wa_projectlocationid_value@OData.Community.Display.V1.FormattedValue':
      'Miri',
  },
  {
    wa_projectid: '13333333-3333-4333-8333-333333333333',
    wa_projectname: 'Sibu Affordable Housing',
    wa_projecttype: 127620003,
    'wa_projecttype@OData.Community.Display.V1.FormattedValue':
      'Residential Development',
    wa_projecthealth: 127620002,
    'wa_projecthealth@OData.Community.Display.V1.FormattedValue': 'Red',
    wa_plannedcompletiondate: '2027-03-31',
    wa_approvedbudget: 146000000,
    wa_actualcost: 87900000,
    wa_currentphysicalprogresspercentage: 54,
    _wa_contractor_value: '21111111-1111-4111-8111-111111111111',
    '_wa_contractor_value@OData.Community.Display.V1.FormattedValue':
      'Borneo Build Sdn Bhd',
    _wa_projectlocationid_value: '33333333-3333-4333-8333-333333333333',
    '_wa_projectlocationid_value@OData.Community.Display.V1.FormattedValue':
      'Sibu',
  },
  {
    wa_projectid: '14444444-4444-4444-8444-444444444444',
    wa_projectname: 'Bintulu Regional Facility',
    wa_projecttype: 127620001,
    'wa_projecttype@OData.Community.Display.V1.FormattedValue':
      'Government Building',
    wa_projecthealth: 127620000,
    'wa_projecthealth@OData.Community.Display.V1.FormattedValue': 'Green',
    wa_plannedcompletiondate: '2028-04-30',
    wa_approvedbudget: 228000000,
    wa_actualcost: 45600000,
    wa_currentphysicalprogresspercentage: 27,
    _wa_contractor_value: '21111111-1111-4111-8111-111111111111',
    '_wa_contractor_value@OData.Community.Display.V1.FormattedValue':
      'Borneo Build Sdn Bhd',
    _wa_projectlocationid_value: '34444444-4444-4444-8444-444444444444',
    '_wa_projectlocationid_value@OData.Community.Display.V1.FormattedValue':
      'Bintulu',
  },
]

const project = projects[0]

const projectLocations = [
  {
    wa_projectlocationid: '31111111-1111-4111-8111-111111111111',
    wa_locationname: 'Kuching',
    wa_latitude: 1.5533,
    wa_longitude: 110.3592,
    wa_sarawakdivision: 127620003,
    'wa_sarawakdivision@OData.Community.Display.V1.FormattedValue': 'Kuching',
    wa_district: 'Kuching',
    wa_siteaddress: 'Kuching city centre',
  },
  {
    wa_projectlocationid: '32222222-2222-4222-8222-222222222222',
    wa_locationname: 'Miri',
    wa_latitude: 4.3995,
    wa_longitude: 113.9914,
    wa_sarawakdivision: 127620005,
    'wa_sarawakdivision@OData.Community.Display.V1.FormattedValue': 'Miri',
    wa_district: 'Miri',
    wa_siteaddress: 'Miri waterfront',
  },
  {
    wa_projectlocationid: '33333333-3333-4333-8333-333333333333',
    wa_locationname: 'Sibu',
    wa_latitude: 2.2873,
    wa_longitude: 111.8305,
    wa_sarawakdivision: 127620010,
    'wa_sarawakdivision@OData.Community.Display.V1.FormattedValue': 'Sibu',
    wa_district: 'Sibu',
    wa_siteaddress: 'Sibu town',
  },
  {
    wa_projectlocationid: '34444444-4444-4444-8444-444444444444',
    wa_locationname: 'Bintulu',
    wa_latitude: 3.1664,
    wa_longitude: 113.036,
    wa_sarawakdivision: 127620001,
    'wa_sarawakdivision@OData.Community.Display.V1.FormattedValue': 'Bintulu',
    wa_district: 'Bintulu',
    wa_siteaddress: 'Bintulu town',
  },
]

const routes = [
  {
    path: '/',
    title: 'Sarawak Project Monitoring Portal',
    heading: 'Project command centre',
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

    await page.route('https://*.tile.openstreetmap.org/**', (route) =>
      route.abort(),
    )
    await page.route('**/_api/wa_projects*', (route) => {
      const isDetail = new URL(route.request().url()).pathname.includes(
        'wa_projects(',
      )
      return route.fulfill({
        contentType: 'application/json',
        body: JSON.stringify(
          isDetail
            ? project
            : { value: projects, '@odata.count': projects.length },
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
          value: projectLocations,
          '@odata.count': projectLocations.length,
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

      if (route.path === '/') {
        await page.locator('.project-map').waitFor()
        await page.locator('.dashboard-chart-card canvas').first().waitFor()
        await page.locator('.leaflet-marker-icon').first().hover()
        await page.locator('.leaflet-tooltip').filter({
          hasText: 'Kuching Civic Centre',
        }).waitFor()
      }

      const structure = await page.evaluate((expected) => {
        const primaryNav = document.querySelector(
          'nav[aria-label="Primary navigation"]',
        )
        const activeLink = primaryNav?.querySelector('[aria-current="page"]')
        const navLinks = [...(primaryNav?.querySelectorAll('a') ?? [])]
        const analyticsGrid = document.querySelector(
          '.dashboard-analytics-grid',
        )
        const mapPanel = document.querySelector('.project-map-panel')
        const computedGrid = analyticsGrid
          ? getComputedStyle(analyticsGrid)
          : null
        const computedMap = mapPanel ? getComputedStyle(mapPanel) : null

        return {
          title: document.title,
          heading: document.querySelector('main h1')?.textContent?.trim(),
          headerCount: document.querySelectorAll('header.site-header').length,
          footerCount: document.querySelectorAll('footer.site-footer').length,
          mainCount: document.querySelectorAll('main#main-content').length,
          navLabels: navLinks.map((link) => link.textContent?.trim()),
          activeLink: activeLink?.textContent?.trim(),
          accountTriggerCount: document.querySelectorAll(
            'button.auth-menu__trigger',
          ).length,
          accountTriggerHeight:
            document
              .querySelector('button.auth-menu__trigger')
              ?.getBoundingClientRect().height ?? 0,
          minNavLinkHeight: Math.min(
            ...navLinks.map((link) => link.getBoundingClientRect().height),
          ),
          hasHorizontalOverflow:
            document.documentElement.scrollWidth >
            document.documentElement.clientWidth,
          homeKpiCount: document.querySelectorAll('.kpi-card').length,
          homeChartCount: document.querySelectorAll(
            '.dashboard-chart-card canvas',
          ).length,
          homeMapCount: document.querySelectorAll('.project-map').length,
          homeMarkerCount: document.querySelectorAll(
            '.leaflet-marker-icon',
          ).length,
          homeBoundaryPathCount: document.querySelectorAll(
            '.leaflet-overlay-pane path',
          ).length,
          homeGridColumnCount:
            computedGrid?.gridTemplateColumns
              .trim()
              .split(/\s+/)
              .filter(Boolean).length ?? 0,
          homeMapGridColumnStart: computedMap?.gridColumnStart,
          homeMapGridRowStart: computedMap?.gridRowStart,
          homeMapGridRowEnd: computedMap?.gridRowEnd,
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
      if (structure.accountTriggerCount !== 1) {
        structuralIssues.push('signed-in account menu')
      }
      if (structure.accountTriggerHeight < 44) {
        structuralIssues.push('account menu touch target')
      }
      if (structure.minNavLinkHeight < 44) {
        structuralIssues.push('navigation touch target')
      }
      if (structure.hasHorizontalOverflow) {
        structuralIssues.push('horizontal overflow')
      }
      if (route.path === '/') {
        const expectedColumnCount =
          viewport.width >= 1024 ? 4 : viewport.width > 375 ? 2 : 1
        if (structure.homeKpiCount !== 4) {
          structuralIssues.push('four KPI cards')
        }
        if (structure.homeChartCount !== 3) {
          structuralIssues.push('three Chart.js charts')
        }
        if (structure.homeMapCount !== 1) {
          structuralIssues.push('single Leaflet map')
        }
        if (structure.homeMarkerCount !== projects.length) {
          structuralIssues.push('project map pins')
        }
        if (structure.homeBoundaryPathCount < 1) {
          structuralIssues.push('Sarawak boundary line')
        }
        if (structure.homeGridColumnCount !== expectedColumnCount) {
          structuralIssues.push('responsive dashboard columns')
        }
        if (
          viewport.width >= 1024 &&
          (structure.homeMapGridColumnStart !== '2' ||
            structure.homeMapGridRowStart !== '1' ||
            structure.homeMapGridRowEnd !== '4')
        ) {
          structuralIssues.push('desktop map grid span')
        }
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

    await page.goto(`${baseUrl}/?auth=anonymous`, {
      waitUntil: 'networkidle',
      timeout: 15_000,
    })
    await page.getByRole('dialog', { name: 'Sign in to continue' }).waitFor()

    if (
      screenshotDir &&
      ['mobile', 'wide-desktop'].includes(viewport.name)
    ) {
      await page.screenshot({
        fullPage: true,
        path: path.join(screenshotDir, `sign-in-${viewport.name}.png`),
      })
    }

    const signedOutStructure = await page.evaluate(() => {
      const button = document.querySelector('button.microsoft-sign-in-button')
      return {
        title: document.title,
        dialogCount: document.querySelectorAll(
          '[data-testid="sign-in-dialog"]',
        ).length,
        heading: document.querySelector('[role="dialog"] h1')?.textContent?.trim(),
        signInLabel: button?.textContent?.trim(),
        signInButtonHeight: button?.getBoundingClientRect().height ?? 0,
        signInButtonFocused: document.activeElement === button,
        protectedMainCount: document.querySelectorAll('main#main-content').length,
        hasHorizontalOverflow:
          document.documentElement.scrollWidth >
          document.documentElement.clientWidth,
      }
    })

    await page.emulateMedia({ reducedMotion: 'reduce' })
    const reducedMotionApplied = await page.evaluate(
      () =>
        getComputedStyle(document.querySelector('.sign-in-dialog')).animationName ===
        'none',
    )
    await page.emulateMedia({ reducedMotion: 'no-preference' })

    await page.addScriptTag({ content: axeCore.source })
    const signedOutAccessibility = await page.evaluate(async () => {
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

    const signedOutIssues = []
    if (
      signedOutStructure.title !==
      'Sign in — Sarawak Project Monitoring Portal'
    ) {
      signedOutIssues.push('sign-in document title')
    }
    if (signedOutStructure.dialogCount !== 1) {
      signedOutIssues.push('single sign-in dialog')
    }
    if (signedOutStructure.heading !== 'Sign in to continue') {
      signedOutIssues.push('sign-in heading')
    }
    if (signedOutStructure.signInLabel !== 'Sign in with Microsoft') {
      signedOutIssues.push('Microsoft sign-in action')
    }
    if (signedOutStructure.signInButtonHeight < 44) {
      signedOutIssues.push('sign-in touch target')
    }
    if (!signedOutStructure.signInButtonFocused) {
      signedOutIssues.push('sign-in initial focus')
    }
    if (!reducedMotionApplied) {
      signedOutIssues.push('reduced-motion dialog behavior')
    }
    if (signedOutStructure.protectedMainCount !== 0) {
      signedOutIssues.push('protected app shell mounted while signed out')
    }
    if (signedOutStructure.hasHorizontalOverflow) {
      signedOutIssues.push('sign-in horizontal overflow')
    }

    const seriousSignedOutViolations = signedOutAccessibility.violations.filter(
      (violation) =>
        violation.impact === 'critical' || violation.impact === 'serious',
    )
    if (
      signedOutIssues.length > 0 ||
      seriousSignedOutViolations.length > 0
    ) {
      failed = true
    }

    results.push({
      viewport: viewport.name,
      route: 'auth:anonymous',
      structuralIssues: signedOutIssues,
      accessibility: signedOutAccessibility,
    })

    await page
      .getByRole('button', { name: 'Sign in with Microsoft' })
      .click()
    await page.waitForURL((url) => !url.searchParams.has('auth'))
    await page.locator('header.site-header').waitFor()

    await page.close()
  }
} finally {
  await browser.close()
}

console.log(JSON.stringify(results, null, 2))

if (failed) process.exitCode = 1
