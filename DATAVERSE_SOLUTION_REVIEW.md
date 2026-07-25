# Sarawak POC Dataverse solution review

Reviewed: 2026-07-26

## Review scope

This is a read-only review of the unmanaged Dataverse solution package for the
Sarawak project-monitoring data model. It records the schema that actually
exists so frontend and Power Pages integration code does not rely on suggested
logical names from the original business brief.

## Solution identity

| Property | Value |
| --- | --- |
| Solution unique name | `SarawakPOC` |
| Friendly name | Sarawak POC |
| Solution ID | `a04ae5a3-3288-f111-ab0f-6045bd1f5fcb` |
| Version | `1.0.0.1` |
| Type | Unmanaged |
| Publisher | `WajidAshraf` |
| Publisher ID | `cb93d3e2-cc11-ee11-8f6e-002248595bba` |
| Customization prefix | `wa` |
| Option-value prefix | `12762` |
| Source environment | `DevEnv` (`2b4baf42-e625-ee92-ae14-c36d82d1359b`) |

The versioned package filename `SarawakPOC_1_0_0_1` refers to this solution;
the Dataverse unique name remains `SarawakPOC`.

## Root components

The package has ten root components:

- Eight Dataverse tables
- One model-driven app, `Sarawak Project Monitoring`
- One model-driven app sitemap

It also contains Microsoft Plan Designer artifacts under `msdyn_plans`.

The package contains no Power Pages website, website language, compiled SPA
assets, Power Pages site settings, web roles, table permissions, Power
Automate cloud flows, connection references, environment variable
definitions, Dataverse security roles, or field security profiles.

Therefore, this is a data-model/model-driven-app solution, not a complete
Power Pages ALM package for the deployed `sarawak-poc` website.

## Table inventory

All eight tables are user/team owned. Change tracking is enabled for the six
portal business tables and disabled for the two additional Plan Designer
tables. Entity-level auditing is disabled for every table even though many
individual columns are marked as audited.

| Table | Entity set | Primary ID | Primary name | Business columns |
| --- | --- | --- | --- | ---: |
| `wa_contractor` | `wa_contractors` | `wa_contractorid` | `wa_contractorname` | 10 |
| `wa_progressupdate` | `wa_progressupdates` | `wa_progressupdateid` | `wa_updatetitle` | 10 |
| `wa_project` | `wa_projects` | `wa_projectid` | `wa_projectname` | 12 |
| `wa_projectissueandrisk` | `wa_projectissueandrisks` | `wa_projectissueandriskid` | `wa_projectissueandrisk1` | 9 |
| `wa_projectlocation` | `wa_projectlocations` | `wa_projectlocationid` | `wa_locationname` | 8 |
| `wa_projectmilestone` | `wa_projectmilestones` | `wa_projectmilestoneid` | `wa_projectmilestone1` | 9 |
| `wa_milestone` | `wa_milestones` | `wa_milestoneid` | `wa_milestonename` | 3 |
| `wa_projectplan` | `wa_projectplans` | `wa_projectplanid` | `wa_planname` | 4 |

The first six are the confirmed tables for the Power Pages SPA.
`wa_milestone` and `wa_projectplan` are additional Plan Designer tables and
aren't part of the approved six-table portal contract.

## Confirmed relationships

| Referencing lookup | Target | Requirement | Delete behavior |
| --- | --- | --- | --- |
| `wa_project.wa_contractor` | `wa_contractor` | Required | Remove link |
| `wa_project.wa_primarycontractor` | `wa_contractor` | Optional | Remove link |
| `wa_project.wa_projectlocationid` | `wa_projectlocation` | Optional | Remove link |
| `wa_projectmilestone.wa_project` | `wa_project` | Required | Remove link |
| `wa_progressupdate.wa_projectid` | `wa_project` | Optional | Remove link |
| `wa_projectissueandrisk.wa_project` | `wa_project` | Optional | Remove link |
| `wa_milestone.wa_projectplan` | `wa_projectplan` | Optional | Remove link |

All custom relationships use `NoCascade` for assign, share, and reparent.

## Actual choice values

These are the verified Dataverse integers. Frontend code must centralize these
values and must not scatter the integers through components.

### Contractor

- `wa_contractorcategory`: `127620000` Main Contractor,
  `127620001` Subcontractor, `127620002` Consultant,
  `127620003` Architect, `127620004` Engineer, `127620005` Supplier,
  `127620006` Other
- `wa_contractorstatus`: `127620000` Active, `127620001` Inactive,
  `127620002` Suspended, `127620003` Blacklisted
- `wa_riskprofile`: `127620000` Low, `127620001` Medium,
  `127620002` High, `127620003` Critical

### Project

- `wa_projecthealth`: `127620000` Green, `127620001` Amber,
  `127620002` Red
- `wa_projecttype`: `127620000` Government Quarters,
  `127620001` Government Building, `127620002` Commercial Building,
  `127620003` Residential Development,
  `127620004` Renovation or Upgrading, `127620005` Infrastructure,
  `127620006` Investment Project, `127620007` Maintenance Project,
  `127620008` Other

### Project location

- `wa_sarawakdivision`: `127620000` Betong, `127620001` Bintulu,
  `127620002` Kapit, `127620003` Kuching, `127620004` Limbang,
  `127620005` Miri, `127620006` Mukah, `127620007` Samarahan,
  `127620008` Sarikei, `127620009` Serian, `127620010` Sibu,
  `127620011` Sri Aman

### Project milestone

- `wa_milestonecategory`: `127620000` Design, `127620001` Approval,
  `127620002` Tender, `127620003` Site Possession,
  `127620004` Foundation, `127620005` Structural Works,
  `127620006` Architectural Works,
  `127620007` Mechanical and Electrical,
  `127620008` Testing and Commissioning,
  `127620009` Practical Completion, `127620010` Handover,
  `127620011` Other

### Progress update

- `wa_reviewstatus`: `127620000` Draft, `127620001` Submitted,
  `127620002` Reviewed, `127620003` Rejected

### Project issue and risk

- `wa_category`: `127620000` Schedule, `127620001` Cost,
  `127620002` Quality, `127620003` Safety, `127620004` Contractor,
  `127620005` Land, `127620006` Approval, `127620007` Design,
  `127620008` Procurement, `127620009` Weather, `127620010` Other
- `wa_issuestatus`: `127620000` Open, `127620001` Under Review,
  `127620002` Action in Progress, `127620003` Resolved,
  `127620004` Closed
- `wa_recordtype`: `127620000` Risk, `127620001` Issue,
  `127620002` Delay, `127620003` Decision Required
- `wa_severity`: `127620000` Low, `127620001` Medium,
  `127620002` High, `127620003` Critical

## Findings

### Critical for Power Pages ALM

1. The solution doesn't contain website record
   `88ce7959-af6b-4fc6-bd56-1cf3424fc7f1`, website language, SPA assets,
   site settings, web roles, or table permissions. Importing this package
   alone will not deploy or secure the Power Pages SPA.
2. There are no Power Pages table permissions. Enabling Web API site settings
   without separately creating least-privilege permissions would leave the
   integration incomplete.

### High-priority data-model gaps

1. `wa_project` has no separate business Project ID/autonumber. Its
   `wa_projectid` is the Dataverse GUID primary key.
2. `wa_projectlocation.wa_locationid` is required text, not the requested
   `LOC-{SEQNUM:0000}` autonumber. No alternate keys were found.
3. `wa_projectlocationid` on Project is optional, though the portal contract
   requires it.
4. The Project lookup on Progress Update and the Project lookup on Issue/Risk
   are optional, though both are required by the business rules.
5. Project Milestone has no Responsible Person lookup.
6. Project Issue and Risk has no required Action Owner lookup.
7. No notes/annotation relationship or Dataverse file/image column is packaged
   for Progress Update or Project Issue and Risk, so the attachment
   requirements aren't implemented.
8. Physical progress, financial progress, milestone completion, and project
   physical progress use unconstrained 32-bit integers rather than `0..100`.
9. Contractor performance score allows approximately
   `-100000000000..100000000000`, not `0..5`.
10. Latitude and longitude have six decimal places but allow approximately
    `-100000000000..100000000000`, not geographic ranges.

### Schema-quality issues to resolve

1. Project contains two Contractor lookups:
   - Required `wa_contractor`, displayed as `Contractor1`
   - Optional `wa_primarycontractor`, displayed as `Contractor`

   The approved relationship is the optional Primary Contractor lookup.
   Confirm which lookup is authoritative and retire or repurpose the duplicate
   before frontend integration.
2. Project Location has both `wa_siteaddress` and `wa_siteaddress1`.
3. Narrative fields including work completed, current activities, next
   activities, constraints, mitigation/action, and remarks are single-line
   text limited to 100 characters rather than useful multiline fields.
4. Contractor and Project Location are user/team owned, while the business
   brief specifies organization ownership for these reference tables.
5. Entity-level auditing is disabled on all eight tables. Column audit flags
   don't provide effective audit history until table auditing is enabled.
6. `wa_milestone` and `wa_projectplan` overlap with the approved
   `wa_projectmilestone` model and aren't used by the Power Pages route
   contract.

### Portability and dependency findings

The model-driven app declares three dependencies:

1. `msdyn_/Images/AppModule_Default_Icon.png` from
   `AppModuleWebResources (2.5)`
2. `AppChannel` setting definition from
   `msdyn_AppFrameworkInfraExtensions (1.0.0.18)`
3. `IsAppGeneratedByPlanDesigner` setting definition from
   `msdyn_AppFrameworkInfraExtensions (1.0.0.18)`

The target environment must contain compatible Microsoft dependencies if the
model-driven app remains in this solution. If this solution is intended only
as the Power Pages data foundation, consider separating the eight-table schema
from the Plan Designer app and its `msdyn_plans` artifacts.

## Recommended sequence

1. Approve the data-model corrections above before building Web API services.
2. Decide whether the model-driven app and the two Plan Designer tables belong
   in the portal's ALM boundary.
3. Correct required lookups, numeric ranges, autonumbers, narrative columns,
   ownership, attachments, and auditing in the source environment.
4. Add Power Pages Web API site settings only for approved columns.
5. Create and test least-privilege web roles and table permissions.
6. Run the Power Pages ALM planner, then add the website, language, site
   components, required tables, flows, connection references, and environment
   variables to the approved solution structure.

No solution was imported, modified, or repackaged during this review.
