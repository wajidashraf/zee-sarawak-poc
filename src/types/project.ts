import { getFormattedValue } from '../shared/powerPagesApi'

export const PROJECT_HEALTH = {
  green: 127620000,
  amber: 127620001,
  red: 127620002,
} as const

export const PROJECT_TYPE = {
  governmentQuarters: 127620000,
  governmentBuilding: 127620001,
  commercialBuilding: 127620002,
  residentialDevelopment: 127620003,
  renovationOrUpgrading: 127620004,
  infrastructure: 127620005,
  investmentProject: 127620006,
  maintenanceProject: 127620007,
  other: 127620008,
} as const

export type ProjectHealth = keyof typeof PROJECT_HEALTH
export type ProjectType = keyof typeof PROJECT_TYPE

export const PROJECT_HEALTH_LABELS: Record<ProjectHealth, string> = {
  green: 'Green',
  amber: 'Amber',
  red: 'Red',
}

export const PROJECT_TYPE_LABELS: Record<ProjectType, string> = {
  governmentQuarters: 'Government Quarters',
  governmentBuilding: 'Government Building',
  commercialBuilding: 'Commercial Building',
  residentialDevelopment: 'Residential Development',
  renovationOrUpgrading: 'Renovation or Upgrading',
  infrastructure: 'Infrastructure',
  investmentProject: 'Investment Project',
  maintenanceProject: 'Maintenance Project',
  other: 'Other',
}

const healthByValue = Object.fromEntries(
  Object.entries(PROJECT_HEALTH).map(([key, value]) => [value, key]),
) as Record<number, ProjectHealth>

const typeByValue = Object.fromEntries(
  Object.entries(PROJECT_TYPE).map(([key, value]) => [value, key]),
) as Record<number, ProjectType>

export interface ProjectEntity {
  wa_projectid: string
  wa_projectname?: string
  wa_projecttype?: number
  wa_projecthealth?: number
  wa_plannedcompletiondate?: string
  wa_approvedbudget?: number
  wa_actualcost?: number
  wa_currentphysicalprogresspercentage?: number
  _wa_contractor_value?: string
  _wa_primarycontractor_value?: string
  _wa_projectlocationid_value?: string
  [key: string]: unknown
}

export interface Project {
  id: string
  name: string
  type: ProjectType
  typeLabel: string
  health: ProjectHealth
  healthLabel: string
  plannedCompletionDate: string | null
  approvedBudget: number | null
  actualCost: number | null
  progress: number
  contractorId?: string
  contractorName: string
  primaryContractorId?: string
  primaryContractorName: string
  locationId?: string
  locationName: string
}

export interface CreateProjectInput {
  name: string
  type: ProjectType
  health: ProjectHealth
  plannedCompletionDate: string
  approvedBudget?: number
  contractorId: string
  primaryContractorId?: string
  locationId?: string
}

export function mapProjectEntity(entity: ProjectEntity): Project {
  const health = healthByValue[entity.wa_projecthealth ?? -1] ?? 'amber'
  const type = typeByValue[entity.wa_projecttype ?? -1] ?? 'other'
  const contractorName =
    getFormattedValue(entity, '_wa_contractor_value') ?? 'Not assigned'
  const primaryContractorName =
    getFormattedValue(entity, '_wa_primarycontractor_value') ?? contractorName

  return {
    id: entity.wa_projectid,
    name: entity.wa_projectname?.trim() || 'Untitled project',
    type,
    typeLabel:
      getFormattedValue(entity, 'wa_projecttype') ?? PROJECT_TYPE_LABELS[type],
    health,
    healthLabel:
      getFormattedValue(entity, 'wa_projecthealth') ??
      PROJECT_HEALTH_LABELS[health],
    plannedCompletionDate: entity.wa_plannedcompletiondate ?? null,
    approvedBudget: entity.wa_approvedbudget ?? null,
    actualCost: entity.wa_actualcost ?? null,
    progress: Math.min(
      100,
      Math.max(0, entity.wa_currentphysicalprogresspercentage ?? 0),
    ),
    contractorId: entity._wa_contractor_value,
    contractorName,
    primaryContractorId: entity._wa_primarycontractor_value,
    primaryContractorName,
    locationId: entity._wa_projectlocationid_value,
    locationName:
      getFormattedValue(entity, '_wa_projectlocationid_value') ?? 'Not set',
  }
}
