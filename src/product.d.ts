export type SKU = {
  fieldId: string
  skuCode: string
  skuName: string
  active: boolean
}

export type Foundation = {
  fieldId: string
  objectivePrice?: number
  totalPrice?: number
  closeOn: string
  supporter?: number
}

type Schedule = {
  year: number
  month: number
  term: 'early' | 'middle' | 'late'
  text: string
  subText: string
}

export type Rule = {
  fieldId: string
  leadDays: number
  bulkPurchase?: number
  cyclePurchase: {
    value: 'monthly' | 'triple'
    label: string
  }
  schedule: Schedule
}

export type Variant = {
  fieldId: string
  variantId: string
  variantName: string
  itemCount: number
}

export type Product = {
  id: string
  productCode: string
  productName: string
  variants: Array<Variant>
  skus: Array<SKU>
  foundation: Foundation
  rule: Rule
}
