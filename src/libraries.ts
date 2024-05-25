import type { Product, Schedule, SKU } from './product'

const apiEndpoint = (id: string) =>
  `${process.env.SURVAQ_API_ORIGIN}/products/${id}`

let cache: Record<string, Product> = {}

const lang = document.documentElement.lang ?? 'ja'

export const fetchData = async (productId: string): Promise<Product> => {
  const cached = cache[productId]
  if (cached) return cached
  const data: Product = await fetch(apiEndpoint(productId), {
    headers: { 'accept-language': lang }
  }).then((res) => res.json())
  cache[productId] = data

  return data
}

const propertiesSkuCodesId = 'propertiesSkuCodes'

const getSKUsByGroupCode = (code: string, product: Product): SKU[] => {
  const skuCodes = product.skuGroups[code]!
  return skuCodes.map((code) => product.skus[code]!)
}

export const createSkuCodesProperty = async (
  productId: string,
  variantId: string,
  target: HTMLElement
) => {
  const data = await fetchData(productId)
  const div = document.createElement('div')
  const variant = data.variants.find((v) => v.variantId === variantId)!

  const values = [
    ...variant.skus,
    ...variant.skuGroups.map(({ skuGroupCode }) => getSKUsByGroupCode(skuGroupCode, data)[0]?.code ?? '')
  ]

  div.innerHTML = `
<input name="properties[_skus]" type="hidden" value="${JSON.stringify(
    values
  )})" id="${propertiesSkuCodesId}" />
`
  target.appendChild(div)

  return div
}

export const createSKUSelects = async (
  productId: string,
  variantId: string,
  target: HTMLElement
) => {
  const data = await fetchData(productId)
  const variant = data.variants?.find(({ variantId: v }) => v === variantId)
  if (!variant) return
  const messageArea = document.createElement('p')
  messageArea.classList.add('product-form__description-message')
  const skusClassName = 'skus'

  const updateDeliverySchedule = () => {
    const selects = Array.from(
      document.querySelectorAll<HTMLInputElement>(`.${skusClassName}`)
    )
    const values = selects.map((el) => el.value)
    const selectedSkus = values.flatMap((value) => data.skus[value] ?? [])
    const schedule = latest([
      data.schedule,
      variant.defaultSchedule,
      ...selectedSkus.map(({ schedule }) => schedule)
    ])
    
    if (data.schedule.text !== schedule.text && lang === 'ja') {
      messageArea.innerHTML = `&quot;配送予定：${schedule.text.replace(
        /(\d{4}|年)/g,
        ''
      )}&quot;の商品が含まれております。<br />※2点以上ご注文の場合、全て揃った時点でまとめて発送`
    } else {
      messageArea.innerText = ''
    }
  }

  const updateSelectedSkuCodes = () => {
    const selects = Array.from(
      document.querySelectorAll<HTMLInputElement>(`.${skusClassName}`)
    )
    const selectedSkuCodes = [
      ...variant.skus,
      ...selects.flatMap((el) => data.skus[el.value]?.code ?? [])
    ]

    const propertiesSkuCodes = document.querySelector<HTMLInputElement>(
      `#${propertiesSkuCodesId}`
    )
    if (!propertiesSkuCodes) throw new Error()
    propertiesSkuCodes.value = JSON.stringify(selectedSkuCodes)
  }

  variant.skuGroups.forEach(({ label, skuGroupCode }, index) => {
    const p = document.createElement('p')
    p.classList.add('product-form__item')
    if (label) p.innerHTML = `<label>${label}</label>`
    const select = document.createElement('select')
    select.classList.add('product-form__input', skusClassName)
    select.name = `properties[${label ?? `商品${index + 1}`}]`
    select.innerHTML = getSKUsByGroupCode(skuGroupCode, data)
      .map((sku) => `<option value="${sku.code}">${sku.name}</option>`)
      .join('')
    p.appendChild(select)

    select.addEventListener('change', () => {
      updateDeliverySchedule()
      updateSelectedSkuCodes()
    })

    target.appendChild(p)

    return select
  })

  updateDeliverySchedule()
  updateSelectedSkuCodes()
  target.appendChild(messageArea)
}

export const replaceDeliveryScheduleInContent = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  const short = !!target.dataset['short']
  target.innerText =
    (short
      ? data.schedule.text.replace(/(\d{4}|年)/g, '')
      : data.schedule.text)
}

type DeliverySchedule = Exclude<SKU['schedule'], null>

export const latest = (
  schedules: Array<Schedule | DeliverySchedule | null>
): DeliverySchedule => {
  return schedules
    .filter((schedule): schedule is DeliverySchedule => !!schedule)
    .sort((a, b) => {
      const l = Number(
        `${a.year}${String(a.month).padStart(2, '0')}${a.termIndex}`
      )
      const r = Number(
        `${b.year}${String(b.month).padStart(2, '0')}${b.termIndex}`
      )
      return l > r ? -1 : l < r ? 1 : 0
    })[0]!
}
