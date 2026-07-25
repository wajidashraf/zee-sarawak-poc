import type { Project } from '../../types/project'
import type { ProjectLocation } from '../../types/projectLocation'

export interface CategoryCount {
  label: string
  value: number
}

export interface MappedProject {
  id: string
  name: string
  health: Project['health']
  healthLabel: string
  typeLabel: string
  progress: number
  locationName: string
  division: string
  district: string
  latitude: number
  longitude: number
}

export interface DashboardMetrics {
  totalProjects: number
  approvedBudget: number
  actualCost: number
  averageProgress: number
  atRiskProjects: number
  healthCounts: CategoryCount[]
  typeCounts: CategoryCount[]
  mappedProjects: MappedProject[]
  unmappedProjects: number
}

const healthOrder: Project['health'][] = ['green', 'amber', 'red']

export function buildDashboardMetrics(
  projects: Project[],
  locations: ProjectLocation[],
): DashboardMetrics {
  const locationById = new Map(locations.map((location) => [location.id, location]))
  const healthCounts = new Map<Project['health'], number>(
    healthOrder.map((health) => [health, 0]),
  )
  const typeCounts = new Map<string, number>()

  let approvedBudget = 0
  let actualCost = 0
  let progressTotal = 0
  const mappedProjects: MappedProject[] = []

  projects.forEach((project) => {
    approvedBudget += project.approvedBudget ?? 0
    actualCost += project.actualCost ?? 0
    progressTotal += project.progress
    healthCounts.set(project.health, (healthCounts.get(project.health) ?? 0) + 1)
    typeCounts.set(project.typeLabel, (typeCounts.get(project.typeLabel) ?? 0) + 1)

    const location = project.locationId
      ? locationById.get(project.locationId)
      : undefined

    if (
      location?.latitude !== null &&
      location?.latitude !== undefined &&
      location.longitude !== null
    ) {
      mappedProjects.push({
        id: project.id,
        name: project.name,
        health: project.health,
        healthLabel: project.healthLabel,
        typeLabel: project.typeLabel,
        progress: project.progress,
        locationName: location.name,
        division: location.division,
        district: location.district,
        latitude: location.latitude,
        longitude: location.longitude,
      })
    }
  })

  return {
    totalProjects: projects.length,
    approvedBudget,
    actualCost,
    averageProgress:
      projects.length > 0 ? Math.round(progressTotal / projects.length) : 0,
    atRiskProjects:
      (healthCounts.get('amber') ?? 0) + (healthCounts.get('red') ?? 0),
    healthCounts: healthOrder.map((health) => ({
      label: health[0].toUpperCase() + health.slice(1),
      value: healthCounts.get(health) ?? 0,
    })),
    typeCounts: groupSmallCategories(typeCounts),
    mappedProjects,
    unmappedProjects: projects.length - mappedProjects.length,
  }
}

function groupSmallCategories(counts: Map<string, number>) {
  const sorted = [...counts.entries()].sort(
    ([labelA, valueA], [labelB, valueB]) =>
      valueB - valueA || labelA.localeCompare(labelB),
  )
  const primary = sorted.slice(0, 5).map(([label, value]) => ({ label, value }))
  const remaining = sorted
    .slice(5)
    .reduce((sum, [, value]) => sum + value, 0)

  return remaining > 0
    ? [...primary, { label: 'Other types', value: remaining }]
    : primary
}
