export interface ProjectLocationEntity {
  wa_projectlocationid: string
  wa_locationname: string
}

export interface ProjectLocation {
  id: string
  name: string
}

export function mapProjectLocationEntity(
  entity: ProjectLocationEntity,
): ProjectLocation {
  return {
    id: entity.wa_projectlocationid,
    name: entity.wa_locationname,
  }
}
