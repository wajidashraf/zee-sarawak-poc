# Sarawak POC — project context and memory

Last updated: 2026-07-26

## Project goal

Build a production-quality Power Pages code-site SPA for authorized internal
users to monitor construction and property projects across Sarawak, Malaysia.
The portal combines executive KPIs, operational lists, project details, a
Sarawak map, progress updates, issues/risks, milestones, contractors, locations,
and role-aware actions. It will eventually be uploaded, activated, tested,
secured, and promoted using Power Pages and Power Platform tooling.

## Confirmed decisions

- Project directory: `sarawak-poc/`
- Frontend: React 19, TypeScript, and Vite
- Package manager: npm
- Build output: `dist/`
- Power Pages plugin: `power-pages@power-platform-skills`
- Installed plugin version observed in this workspace: `2.6.2`
- UI/UX design skill: `ui-ux-pro-max`
- UI/UX skill source:
  `https://github.com/nextlevelbuilder/ui-ux-pro-max-skill`
- The plugin version check completed without returning an update or warning.
- This is a Power Pages SPA/code site, not a traditional Liquid-based portal.
- Product name: `Sarawak Project Monitoring Portal`
- Initial audience: authorized internal users
- Initial language and currency: English and MYR
- Initial demonstration scale: approximately 15-30 projects
- The business brief is stored at `../CONTEXT.md`.
- The translated implementation standard is
  `DEVELOPMENT_INSTRUCTIONS.md`.
- The six named Dataverse tables already exist and must be inspected rather
  than recreated.
- Microsoft documentation and the plugin workflow are the baseline for
  implementation and deployment decisions.
- Workspace frontend rules require UI/UX Pro Max for every UI/UX task, a
  persisted design system as the visual source of truth, inspection and reuse
  of existing components before creating new ones, and clean typed React code.

## Current state

- The original Vite demonstration page and its unused starter assets were
  removed.
- `src/App.tsx` currently renders only a centered `Welcome` heading.
- `src/index.css` contains only the minimal page-centering styles.
- The most recent `npm run build` and `npm run lint` both passed.
- Dependencies are installed locally and a `dist/` build exists.
- Python 3.14.6 and pip 26.1.2 are installed for the current Windows user.
  Their directories are configured in the user PATH; terminals and Codex
  sessions opened before installation must be restarted to pick up the change.
- UI/UX Pro Max is installed at
  `C:\Users\Administrator\.codex\skills\ui-ux-pro-max`. Its Claude-specific
  command paths were corrected for Codex. The bundled validator passed all 12
  design domains, 22 framework stacks, and the reasoning database. React stack
  lookup and design-system generation were also verified.
- UI/UX Pro Max was run against the supplied business brief. Its preliminary
  direction is a professional blue/green, trustworthy, accessible, data-dense
  dashboard with Lexend headings, Source Sans 3 body text, and subtle motion.
  No design system has been persisted because user approval is still required.
  Its generated "Exaggerated Minimalism" style was rejected as a poor fit for
  dense operational screens.
- No business pages, router, data model, authentication, Web API integration,
  Power Automate flow, server logic, SEO configuration, or tests exist yet.
- The business brief has been reviewed and durable development instructions
  now define the architecture, routes, source structure, components, phased
  delivery, data rules, security gates, UX standard, testing, and deployment
  gates.
- No `powerpages.config.json` exists yet.
- No `.powerpages-site/` deployment artifacts exist yet.
- The project directory is not currently a Git repository.
- No target Power Platform environment, site ID, site URL, or deployment
  approval has been recorded.

## Official Power Pages SPA model

- The SPA is client-side rendered and managed through source code and CLI
  tooling.
- Client routes take precedence. A hard refresh falls back to the SPA root and
  the client router renders the requested route.
- Traditional Power Pages Pages and Styling workspaces aren't used for SPA page
  construction or styling.
- Liquid templates aren't supported. Use React rendering and Power Pages Web
  APIs.
- Out-of-the-box Power Pages forms and lists aren't available in this model;
  create custom React interfaces backed by Web APIs.
- Localization must be implemented with client-side resources.
- SEO is more limited for a client-rendered SPA, so metadata, sitemap,
  crawlability, and route behavior must be planned deliberately.
- Keep the complete editable source in local Git. Power Pages deployments are
  based on compiled web assets and optional source upload.

## Prerequisites to verify before deployment

- Node.js 18 or later.
- PAC CLI installed and authenticated to the correct environment.
- Use PAC CLI 2.6.3 or later if Server Logic is required; this also exceeds the
  lower minimum documented for base code-site upload.
- Azure CLI signed into the same tenant when plugin workflows require it.
- A Power Platform environment with Power Pages enabled and adequate admin
  privileges.
- The Power Pages runtime is at least version 9.7.4.x.
- For localhost bearer authentication, the portal must be at least 9.7.6.6.
- JavaScript file uploads must be allowed in the Dataverse environment.
- Confirm the active PAC authentication profile and environment immediately
  before every deployment.

Do not store authentication tokens, tenant secrets, credentials, or private
connection strings in this file.

## Planned lifecycle

1. Confirm the unresolved architecture, data, identity, attachment, automation,
   map, security, environment, and design decisions listed in
   `DEVELOPMENT_INSTRUCTIONS.md`.
2. Turn the approved instructions into a component, route, data, integration,
   security, and deployment plan.
3. Run a live local preview before customization and keep it available during
   implementation.
4. Establish Git history and create small checkpoint commits for design
   foundations, each shared component, each page, routing, integrations, and
   security fixes.
5. Implement real pages and components with responsive behavior, a cohesive
   visual system, meaningful content, accessible landmarks, keyboard support,
   and visible focus states.
6. Choose the correct backend per feature:
   - Power Pages Web API for normal Dataverse CRUD.
   - Server Logic for secrets, external APIs, privileged validation, or
     multi-table operations that must not run in the browser.
   - Power Automate cloud flows for approvals, notifications, scheduled work,
     and asynchronous business processes.
7. Inspect and use the six existing Dataverse tables. Do not recreate them.
   Propose additions only when a requirement cannot be implemented safely with
   the confirmed schema, and obtain approval first.
8. Integrate Web APIs with typed services, anti-forgery-token handling, error
   handling, and least-privilege table permissions and web roles.
9. Add authentication appropriate to the audience. Microsoft Entra ID is the
   likely choice for internal/B2B users; Microsoft Entra External ID is the
   likely choice for customer-facing registration. This remains undecided.
10. Run linting, TypeScript checks, production builds, route verification, and
    WCAG 2.2 AA accessibility checks. Fix all critical and serious axe findings.
11. Review the full local site with the user before any deployment.
12. Use the Power Pages deployment skill to confirm the environment, build, and
    upload. Activate the site after its initial upload, then smoke-test the live
    URL.
13. Run a release-readiness security review before production.
14. Plan ALM promotion to test and production environments when the development
    site is accepted.

## Deployment configuration to add later

Add `powerpages.config.json` after the site name and deployment target are
confirmed. It should use the official schema and include:

- `siteName`
- `compiledPath: "dist"`
- `defaultLandingPage: "index.html"`
- `bundleFilePatterns` matching all Vite content-hashed JavaScript and CSS
  bundles
- `includeSource` only if source upload is intentionally required
- `sourceExcludePatterns` when source upload is enabled

Use route-level code splitting when it materially improves load performance.
Keep `bundleFilePatterns` synchronized with build output—prefer a post-build
script once multiple dynamic chunks exist—so repeated uploads remove stale
hashed bundles.

The normal upload mechanism is `pac pages upload-code-site`, but use
`power-pages:deploy-site` for this project so prerequisite, environment,
production-build, and upload checks remain coordinated. The first upload
creates an inactive site that must be activated; later uploads update the
existing active site.

## Security and engineering guardrails

- Apply least privilege to every Dataverse table permission and web role.
- Explicitly enable every table and column requested through the Power Pages Web
  API, including lookup properties such as `_lookup_value`.
- Obtain and send anti-forgery tokens for state-changing portal requests.
- Never rely on hidden buttons, client-side role checks, or route guards to
  protect data.
- Never expose API keys or privileged credentials in Vite environment variables
  bundled into client code.
- Validate inputs both in the UI and at the trusted server or Dataverse layer.
- Encode output and avoid unsafe HTML injection.
- Include loading, empty, validation, authorization, network-error, and retry
  states in data-driven interfaces.
- Use semantic landmarks, correct heading order, labels, alt text, sufficient
  contrast, keyboard operation, reduced-motion support, and responsive layouts.
- Review generated code, data models, permissions, and authentication proposals
  before approving or deploying them.
- Run source/dependency scanning during development and a full security review
  before production.

## Inputs still needed from the user

- Confirmation that the project remains a React code-site SPA and that the
  Liquid/FetchXML requirements are replaced by React and Power Pages Web API
  patterns
- Target development environment and authorization to inspect existing
  Dataverse metadata
- Verified table logical names, EntitySetNames, relationships, and choice
  integer values
- Approval of a persisted design system and any available brand assets
- Map provider, licensing, content security policy, and browser token approach
- Contact-to-System User mapping for responsible users and "My Actions"
- Final web roles and least-privilege table-permission matrix
- Attachment storage, limits, MIME types, retention, and delete policy
- Flow recipients, transitions, idempotency strategy, cadence, and channel
- Development, test, and production environments, domain, and release path

Do not start Dataverse schema creation, permission creation, authentication
configuration, deployment, activation, or production changes until the relevant
requirements and target environment are confirmed.

## Source references reviewed

- Microsoft Learn: [Get started with the Power Pages plugin for GitHub Copilot
  CLI and Claude Code](https://learn.microsoft.com/en-us/power-pages/configure/create-code-site-using-claude-code)
- Microsoft Learn: [Create and deploy a single-page application in Power
  Pages](https://learn.microsoft.com/en-us/power-pages/configure/create-code-sites)
- Microsoft Learn: [Power Pages Web API
  overview](https://learn.microsoft.com/en-us/power-pages/configure/web-api-overview)
- Microsoft Learn: [Power Pages
  security](https://learn.microsoft.com/en-us/power-pages/security/power-pages-security)
- Microsoft Learn: [Configure notes as
  attachments](https://learn.microsoft.com/en-us/power-pages/configure/configure-notes)
- Local Power Pages plugin skill:
  `power-pages@power-platform-skills` → `power-pages:create-site`

## Decision log

- 2026-07-26: The default Vite demo was removed and replaced with a minimal
  centered `Welcome` heading.
- 2026-07-26: React, TypeScript, and Vite were retained as the current SPA
  foundation.
- 2026-07-26: Official Power Pages SPA and plugin guidance was reviewed.
- 2026-07-26: Durable workspace instructions and this project memory were
  created.
- 2026-07-26: Python 3.14.6 and pip 26.1.2 were installed as prerequisites for
  the proposed UI/UX Pro Max design skill.
- 2026-07-26: UI/UX Pro Max was installed globally for Codex, corrected for
  Codex-compatible script paths, and validated successfully. No test design
  output was saved into the SPA project.
- 2026-07-26: Durable frontend rules were added to `AGENTS.md`. They require
  UI/UX Pro Max, consistent design tokens, component discovery and reuse,
  focused typed components, separation of UI/hooks/services, and frontend
  verification after every change.
- 2026-07-26: The Sarawak Project Monitoring Portal business brief was reviewed.
  `DEVELOPMENT_INSTRUCTIONS.md` was created as the durable implementation
  standard.
- 2026-07-26: Liquid, FetchXML templates, Power Pages out-of-box forms/lists,
  and the Pages/Styling workspaces were excluded because they are unsupported
  for this code-site SPA. Equivalent work will use React and the Power Pages
  Web API.
- 2026-07-26: "My Actions" was identified as blocked pending a safe mapping
  between authenticated Power Pages Contacts and the existing System User
  lookups. Display-name or email matching in browser code is prohibited.
- 2026-07-26: The six named Dataverse tables were accepted as existing inputs,
  but their metadata and choice values remain unverified.
