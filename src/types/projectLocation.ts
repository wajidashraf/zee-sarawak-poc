import { getFormattedValue } from '../shared/powerPagesApi'

export interface ProjectLocationEntity {
  wa_projectlocationid: string
  wa_locationname: string
  wa_latitude?: number
  wa_longitude?: number
  wa_sarawakdivision?: number
  wa_district?: string
  wa_siteaddress?: string
  [key: string]: unknown
}

export interface ProjectLocation {
  id: string
  name: string
  latitude: number | null
  longitude: number | null
  division: string
  district: string
  siteAddress: string
}

export function mapProjectLocationEntity(
  entity: ProjectLocationEntity,
): ProjectLocation {
  return {
    id: entity.wa_projectlocationid,
    name: entity.wa_locationname?.trim() || 'Unnamed location',
    latitude: toCoordinate(entity.wa_latitude, -90, 90),
    longitude: toCoordinate(entity.wa_longitude, -180, 180),
    division:
      getFormattedValue(entity, 'wa_sarawakdivision') ?? 'Not specified',
    district: entity.wa_district?.trim() || 'Not specified',
    siteAddress: entity.wa_siteaddress?.trim() || 'Not specified',
  }
}

function toCoordinate(
  value: number | undefined,
  minimum: number,
  maximum: number,
) {
  return typeof value === 'number' &&
    Number.isFinite(value) &&
    value >= minimum &&
    value <= maximum
    ? value
    : null
}
