export type Schedule = {
  year: number
  month: number
  term: 'early' | 'middle' | 'late'
  termIndex: number
  text: string
  subText: string
}

export type SKU = {
  code: string
  name: string
  displayName: string
  schedule: Schedule | null
  sortNumber: number
  skipDeliveryCalc: boolean
}

export type Variant = {
  variantId: string
  variantName: string
  skus: string[],
  skuGroups: { label: string; skuGroupCode: string }[]
  defaultSchedule: Schedule | null
}

export type Product = {
  productName: string
  variants: Array<Variant>
  skus: Record<string, SKU>
  skuGroups: Record<string, string[]>
  schedule: Schedule
}
