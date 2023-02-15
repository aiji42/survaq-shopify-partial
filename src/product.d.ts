type Schedule = {
  year: number
  month: number
  term: 'early' | 'middle' | 'late'
  termIndex: number
  text: string
  texts: string[]
  subText: string
}

export type Variant = {
  variantId: string
  variantName: string
  skus: {
    code: string
    name: string
    subName: string
    schedule: Omit<Schedule, 'texts'> | null
  }[]
  skuSelectable: number
  skuLabel: string | null
  schedule: Omit<Schedule, 'texts'> | null
}

export type Product = {
  variants: Array<Variant>
  schedule: Schedule
}
