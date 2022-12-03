export type Foundation = {
  fieldId: string
  totalPrice: number
  closeOn: string
  supporter: number
}

type Schedule = {
  year: number
  month: number
  term: 'early' | 'middle' | 'late'
  termIndex: number
  text: string
  texts: string[]
  subText: string
}

export type Rule = {
  fieldId: string
  customSchedules: Array<{
    beginOn: string
    endOn: string
    deliverySchedule: string
  }>
  schedule: Schedule
}

export type Variant = {
  fieldId: string
  variantId: string
  variantName: string
  skus: {
    code: string
    name: string
    subName: string
    schedule: Omit<Schedule, 'texts'> | null
  }[]
  skuSelectable: number
}

export type Product = {
  id: string
  productCode: string
  productName: string
  variants?: Array<Variant>
  skuLabel?: string
  foundation: Foundation
  rule: Rule
}
