export type Schedule = {
  year: number
  month: number
  term: 'early' | 'middle' | 'late'
  termIndex: number
  text: string
  texts: string[] | never
  subText: string
}

export type SKU = {
  code: string
  name: string
  subName: string
  schedule: Omit<Schedule, 'texts'> | null
}

export type Variant = {
  variantId: string
  variantName: string
  skuSelectable: number
  skuLabel: string | null
  baseSKUs: SKU[]
  selectableSKUs: SKU[]
  defaultSchedule: Omit<Schedule, 'texts'> | null
}

export type Product = {
  variants: Array<Variant>
  schedule: Schedule
}
