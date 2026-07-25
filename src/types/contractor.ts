export interface ContractorEntity {
  wa_contractorid: string
  wa_contractorname?: string
  [key: string]: unknown
}

export interface Contractor {
  id: string
  name: string
}

export function mapContractorEntity(entity: ContractorEntity): Contractor {
  return {
    id: entity.wa_contractorid,
    name: entity.wa_contractorname?.trim() || 'Unnamed contractor',
  }
}
