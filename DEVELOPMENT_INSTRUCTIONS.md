# Sarawak Project Monitoring Portal - development instructions

Last reviewed: 2026-07-26

## 1. Purpose and authority

These instructions translate the business brief in `../CONTEXT.md` into the
development standard for the `sarawak-poc` Power Pages code-site SPA.

Before changing the project:

1. Read `PROJECT_MEMORY.md`.
2. Read this file.
3. Search the source for reusable components, hooks, services, types, and
   styles.
4. Use the Power Pages skill that matches the task.
5. For frontend or UX work, also use `ui-ux-pro-max` and the approved project
   design system when it exists.

When the business brief conflicts with the supported Power Pages code-site
model, this file controls implementation. Record every material decision in
`PROJECT_MEMORY.md`.

## 2. Product definition

- Product: **Sarawak Project Monitoring Portal**
- Purpose: give authorized internal users one operational and executive view of
  construction and property projects across Sarawak, Malaysia.
- Personas: executives, PMO administrators, project managers, site engineers,
  viewers, and auditors.
- Initial scale: approximately 15-30 demonstration projects.
- Initial language and currency: English and Malaysian ringgit (MYR).
- Experience: desktop-first and fully responsive, with strong support for
  data tables, charts, forms, and maps.

The portal must cover:

- Executive dashboard and KPIs
- Sarawak project map
- Project list and project details
- Milestones
- Progress updates and attachments
- Issues, risks, delays, and decisions
- Contractors and project locations
- Role-aware "My Actions"

## 3. Fixed architecture

Use the existing React 19, TypeScript, Vite, npm, and `dist/` production output.
Use React Router for client-side routing and route-level lazy loading once
multiple pages exist.

This is a Power Pages SPA/code site, not a traditional portal:

- Do not use Liquid, FetchXML templates, web templates, page templates, or
  content snippets to render the SPA.
- Do not depend on the Pages or Styling workspaces.
- Do not use out-of-the-box Power Pages lists or forms. Build typed React
  equivalents backed by the Power Pages Web API.
- Do not introduce Bootstrap by default. Use approved design tokens and shared
  components. Add a UI framework only after a dependency and bundle-size
  review.
- Do not switch framework or rendering model without user approval.

Choose the backend by responsibility:

- Power Pages Web API for normal Dataverse CRUD
- Power Pages Server Logic for secrets, privileged validation, external APIs,
  or trusted multi-record transactions
- Power Automate for asynchronous notifications, approvals, and schedules

Never put credentials, connection strings, private endpoints, or privileged API
keys in browser code or `VITE_*` variables.

## 4. Delivery sequence

Do not implement all features in one pass. Use these reviewable phases.

### Phase 0 - validate foundations

- Initialize local Git before material implementation.
- Confirm the code-site SPA architecture.
- Inspect the six existing Dataverse tables and record their actual logical
  names, entity set names, columns, relationship schema names, ownership, and
  choice integer values.
- Resolve the decisions in section 17 as they become relevant.
- Generate UI/UX Pro Max design-system candidates, review them with the user,
  and persist only the approved result as `design-system/sarawak-poc/MASTER.md`.
- Produce a component and route plan before implementation.

### Phase 1 - application shell and design foundation

- Add the router, providers, error boundary, authenticated app shell, top bar,
  responsive left navigation, page headers, feedback states, and design tokens.
- Use representative mock data first so layout and interaction can be reviewed
  without granting Dataverse access.
- Add responsive and accessibility tests for shared components.

### Phase 2 - read-only project intelligence

- Implement Projects, Project Details, Contractors, Locations, Milestones,
  Progress Updates, and Issues/Risks as read-only views.
- Add dashboard KPIs, charts, filtering, and the Sarawak map.
- Use typed Web API services only after metadata and least-privilege read
  permissions are approved.

### Phase 3 - controlled write workflows

- Add create/update experiences for progress updates, issues/risks, and
  milestones.
- Add validation, confirmation, authorization, conflict, and error handling.
- Add attachments only after their storage design and permissions are approved.

### Phase 4 - automation and roles

- Add submitted-progress, critical-risk, and scheduled-monitoring flows.
- Implement "My Actions" only after the portal Contact-to-responsible-user
  mapping is resolved.
- Configure and test authentication, web roles, and table permissions with
  their dedicated Power Pages skills.

### Phase 5 - release readiness

- Complete lint, type, unit, integration, route, responsive, accessibility,
  security, and production-build checks.
- Review the complete local site with the user.
- Confirm the target environment and site immediately before deployment.
- Deploy, activate, and runtime-test only with explicit approval.

## 5. Route contract

| Route | Page |
| --- | --- |
| `/` | Redirect to `/dashboard` |
| `/dashboard` | Executive dashboard |
| `/map` | Project map |
| `/projects` | Project list |
| `/projects/:projectId` | Project details |
| `/milestones` | Milestone portfolio |
| `/progress-updates` | Progress update portfolio |
| `/issues-risks` | Issues and risks |
| `/contractors` | Contractor list |
| `/contractors/:contractorId` | Contractor details |
| `/locations` | Project locations |
| `/my-actions` | Current user's actions |
| `/unauthorized` | Authenticated but unauthorized state |
| `*` | Not found |

Every route must:

- Set a meaningful document title.
- Support direct navigation and hard refresh in the deployed SPA.
- Render a route-level loading state when lazy loaded.
- Show an explicit unauthorized state instead of appearing empty.
- Preserve relevant list filters in the URL query string.

## 6. Source structure

Grow the project toward this structure:

```text
src/
  app/
    App.tsx
    router.tsx
    providers.tsx
  layouts/
    AppShell/
  pages/
    Dashboard/
    ProjectMap/
    Projects/
    ProjectDetails/
    Milestones/
    ProgressUpdates/
    IssuesRisks/
    Contractors/
    ContractorDetails/
    Locations/
    MyActions/
  components/
    ui/
    navigation/
    forms/
    data-display/
    feedback/
  features/
    projects/
    milestones/
    progress-updates/
    issues-risks/
    contractors/
    locations/
  services/
    powerPagesClient.ts
    projectsService.ts
    milestonesService.ts
    progressUpdatesService.ts
    issuesRisksService.ts
    contractorsService.ts
    locationsService.ts
    attachmentsService.ts
  hooks/
  config/
    choices.ts
    routes.ts
  types/
    dataverse.ts
    domain.ts
    power-pages.d.ts
  utils/
    currency.ts
    dates.ts
    health.ts
    validation.ts
  styles/
    tokens.css
    global.css
  test/
```

Pages compose features. Visual components do not call Dataverse directly.

## 7. Components and reuse

Before adding a component, search by responsibility and inspect existing call
sites. Extend a compatible component with typed variants, composition, or
slots. Do not create near-duplicate cards, badges, fields, tables, dialogs, or
error states.

Expected shared component families:

- `AppShell`, `TopBar`, `SideNav`, `Breadcrumbs`, `PageHeader`
- `Button`, `IconButton`, `LinkButton`, `Tabs`, `Dialog`, `ConfirmDialog`
- `FormField`, `TextInput`, `TextArea`, `Select`, `PercentageInput`,
  `CurrencyInput`, `DateInput`, `EntityLookup`, `AttachmentUploader`
- `FilterBar`, `SearchField`, `Pagination`, `ViewToggle`
- `DataTable`, `CardGrid`, `KpiCard`, `StatusBadge`, `HealthIndicator`,
  `ProgressBar`, `MoneyValue`, `DateValue`
- `ChartContainer`, chart wrappers, `ProjectMap`, `ProjectMarker`,
  `ProjectPopup`
- `LoadingSkeleton`, `EmptyState`, `ErrorState`, `UnauthorizedState`, `Toast`

Create a new abstraction only when it has a clear shared responsibility or a
pattern repeats. Keep one authoritative implementation for each visual pattern.

## 8. UI and design standard

The direction is a professional, trustworthy, accessible government-enterprise
operations dashboard: restrained, data-dense, and easy to scan.

UI/UX Pro Max produced this useful preliminary direction:

- professional blue as the primary family
- green for positive/action emphasis
- Lexend headings and Source Sans 3 body text
- dense dashboard spacing
- subtle motion

This is provisional and must not be persisted until the user approves it. The
generated "Exaggerated Minimalism" style is not suitable for dense operational
screens; do not use oversized editorial typography or excessive whitespace.

The approved design system must define semantic colors, typography, spacing,
sizing, radii, borders, elevation, motion, breakpoints, and table/form/card/
chart/map conventions.

Never communicate project health, priority, or severity by color alone. Pair
color with text and, where useful, icons or patterns. Support keyboard
operation, visible focus, screen readers, zoom, sufficient contrast, and
`prefers-reduced-motion`. Target WCAG 2.2 AA. Avoid scroll-reveal effects on
core dashboard data.

## 9. Dataverse contract

The six tables in the brief already exist. Do not recreate them:

1. `wa_projectlocation`
2. `wa_contractor`
3. `wa_project`
4. `wa_projectmilestone`
5. `wa_progressupdate`
6. `wa_projectissueandrisk`

Treat every logical name in the brief as unverified until inspected in the
target environment. Record each table's logical name, EntitySetName, primary
key/name, readable and writable columns, lookup navigation properties,
relationship schema names, date behavior, ownership, choices, and attachment
enablement.

Keep raw Web API DTOs separate from domain models. Convert lookups, formatted
values, choices, dates, currency, and nulls in explicit mappers. Centralize
verified choice values in `src/config/choices.ts`; never scatter numeric choices
through UI code.

## 10. Power Pages Web API rules

- Use one typed `powerPagesClient` for requests, anti-forgery tokens, JSON,
  timeouts, cancellation, and normalized errors.
- Use table logical names in Web API site settings and EntitySetNames in
  `/_api/...` URLs.
- Enable only required tables and fields. Do not use `*` for production fields.
- Apply `$select`, targeted `$expand`, `$filter`, `$orderby`, and pagination.
- Follow `@odata.nextLink`; never assume one response contains every record.
- Abort stale requests when filters or routes change.
- Encode identifiers and user-controlled filters.
- Show actionable but non-sensitive errors.
- Never call the Dataverse organization Web API directly from browser code.

For 15-30 projects, bounded client-side aggregation is acceptable after focused
paged reads. Avoid N+1 requests. If volume or complexity grows, move
aggregation to approved server logic, rollups, or reporting.

## 11. Authentication and authorization

- Use Microsoft Entra ID for the internal audience unless another provider is
  approved.
- Power Pages authenticated users are Dataverse Contact records.
- Use the Power Pages global user object only to tailor UI and routes.
- Enforce access through web roles, table permissions, and when needed column
  permissions.
- Hidden controls and route guards are not security boundaries.
- Start from no data access and grant minimum privileges and record scopes.
- Do not grant anonymous access to project data.

The proposed roles are a starting point: Portal Admin, PMO Admin, Project
Manager, Site Engineer, Project Viewer, Executive Viewer, and Auditor. Approve
a role-by-table CRUD/scope matrix before configuring permissions.

### My Actions security gate

The responsible-person and action-owner fields appear to reference Dataverse
System Users, while a signed-in Power Pages user is a Contact. Do not match them
by display name or email in browser code.

Before implementing `/my-actions`, approve one of:

- a stable Contact-to-business-user mapping in Dataverse
- an approved server-side resolver
- revised relationships from the business records to Contact

Verify exact behavior before relying on enhanced authorization or any internally
managed Power Pages System User representation.

## 12. Feature rules

### Dashboard

- Give each KPI one approved definition and show last-updated context.
- Give charts text summaries or accessible tabular equivalents.
- Apply shared filters consistently and preserve useful filter state in URLs.
- Calculate health through one tested utility.

### Project map

- Use stored latitude/longitude; do not add hidden address geocoding.
- Pair green/amber/red markers with accessible labels.
- List projects with missing or invalid coordinates.
- Keep popups concise and link to details.
- Approve map provider, licensing, CSP, token strategy, and tile usage first.

### Project details

- Lazy load overview, location, financial, milestones, progress, issues/risks,
  and notes tabs.
- Keep route identity stable while changing tabs.
- Reuse shared status, money, percentage, and date displays.

### Progress updates

- Validate reporting period, percentages, required narrative, and attachments.
- Treat Submitted as a controlled transition.
- Update project physical progress in trusted automation or server logic, not
  as an uncoordinated second browser request.
- Prevent repeat submission and duplicate downstream processing.

### Issues and risks

- Use shared severity and status definitions.
- Highlight high/critical items without color-only signaling.
- Trigger notifications on meaningful transitions and prevent duplicates.

### Milestones

- Derive overdue state through one tested rule.
- Require actual completion information at 100%.
- Define timezone and date-only behavior before comparisons.

### Attachments

- Build a custom React experience.
- Approve annotations/notes or a Dataverse file column as the storage model.
- For notes, configure parent and Annotation permissions, including Append and
  Append To, and verify portal visibility behavior.
- Define MIME types, extensions, size, quantity, delete rights, malware policy,
  retention, and storage location first.

## 13. Power Automate rules

Use a dedicated flow for each approved purpose:

1. Submitted progress update: update project physical progress and notify the
   approved recipients.
2. High/critical issue or risk: notify the approved audience.
3. Scheduled monitoring summary: send the agreed report by the agreed channel.

Every flow needs a narrow trigger, filtered attributes, transition checks,
idempotency, retry/terminal-error handling, and traceable run information. If
reliable idempotency requires a missing processing column, propose it and obtain
approval.

## 14. State, performance, and errors

- Prefer React state, focused context, and small hooks. Add a state/cache library
  only for demonstrated complexity.
- Cache stable contractor and location references with explicit invalidation.
- Debounce text filters and paginate operational lists.
- Lazy load routes, related tabs, charts, and the map where beneficial.
- Include loading, empty, validation, authorization, network failure, retry,
  and stale-data states.
- Avoid layout shifts and restore focus after dialogs and mutations.

## 15. Quality gates

For every material frontend change:

- run lint and TypeScript checks
- run the production build
- test changed routes and direct route refresh
- test keyboard navigation and visible focus
- test supported responsive widths
- run accessibility checks and fix critical/serious findings
- update tests for changed business logic

A feature is complete only when acceptance criteria and all feedback states are
implemented, data uses typed services, permissions pass allowed and denied-role
tests, no secret/environment URL is bundled, and reused components remain
consistent.

Before production, run source/dependency scanning, the full Power Pages security
review, and deployed runtime tests for authentication, authorization, Web API,
flows, attachments, and every route.

## 16. Deployment and ALM

- Keep editable source in local Git.
- Add `powerpages.config.json` only after site name and target confirmation.
- Use `compiledPath: "dist"` and `defaultLandingPage: "index.html"`.
- Keep `bundleFilePatterns` synchronized with Vite's content-hashed chunks.
- Use `power-pages:deploy-site`, not an ad hoc upload.
- Confirm the PAC profile, environment, website, runtime version, and JavaScript
  upload policy immediately before deployment.
- Never deploy, activate, create schema, or change security without the approval
  required by the relevant skill.
- Plan solution/pipeline ALM before promotion beyond development.

## 17. Decisions required

Record each answer in `PROJECT_MEMORY.md`:

1. Confirm React code-site SPA and replacement of Liquid/FetchXML requirements.
2. Provide or authorize inspection of the development environment and tables.
3. Approve the design system and brand assets.
4. Select a map provider and licensing/token approach.
5. Resolve Contact-to-System User mapping for `/my-actions`.
6. Approve the web-role/table-permission matrix.
7. Confirm attachment storage, limits, types, retention, and delete behavior.
8. Confirm progress submission and flow idempotency rules.
9. Confirm issue/risk recipients and repeat-notification policy.
10. Confirm scheduled-report recipients, cadence, format, and channel.
11. Confirm development, test, and production environments and release path.

## 18. Definition of done

The portal is done only when its approved pages and workflows follow the
approved design system, are responsive, accessible, typed, tested,
permission-secure, successfully built, reviewed locally, deployed with
approval, and smoke-tested in the confirmed Power Pages environment.

## Official references

- [Create and deploy a single-page application in Power Pages](https://learn.microsoft.com/en-us/power-pages/configure/create-code-sites)
- [Power Pages Web API overview](https://learn.microsoft.com/en-us/power-pages/configure/web-api-overview)
- [Power Pages security](https://learn.microsoft.com/en-us/power-pages/security/power-pages-security)
- [Configure notes as attachments](https://learn.microsoft.com/en-us/power-pages/configure/configure-notes)
