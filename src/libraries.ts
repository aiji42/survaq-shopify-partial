import { Product } from './product'

const apiEndpoint =
  'https://survaq-api-production.aiji422990.workers.dev/products/'

let cache: Record<string, Product> = {}

const lang = document.documentElement.lang ?? 'ja'

export const fetchData = async (productId: string): Promise<Product> => {
  if (cache[productId]) return cache[productId]
  const data: Product = await fetch(`${apiEndpoint}${productId}`, {
    headers: { 'accept-language': lang }
  }).then((res) => res.json())
  cache[productId] = data

  return data
}

export const createDeliveryScheduleProperty = async (
  productId: string,
  target: HTMLElement
): Promise<HTMLDivElement> => {
  const data = await fetchData(productId)
  const div = document.createElement('div')
  const key = lang === 'en' ? 'Shipping' : '配送予定'
  const html = `
<input name="properties[${key}]" type="hidden" value="${data.rule.schedule.text}(${data.rule.schedule.subText})" />
`
  div.innerHTML = html
  target.appendChild(div)

  return div
}

export const createSKUSelects = async (
  productId: string,
  variantId: string,
  target: HTMLElement
): Promise<HTMLSelectElement[]> => {
  const data = await fetchData(productId)
  const variant = data.variants?.find(({ variantId: v }) => v === variantId)
  if (!variant) return []

  return Array(variant.skuSelectable)
    .fill(0)
    .map((_, index) => {
      const p = document.createElement('p')
      p.classList.add('product-form__item')
      const label = data.skuLabel
        ? data.skuLabel?.replace(/#/g, String(index + 1))
        : null
      if (label) p.innerHTML = `<label>${label}</label>`
      const select = document.createElement('select')
      select.classList.add('product-form__input')
      select.name = `properties[${label ?? `商品${index + 1}`}]`
      select.innerHTML = variant.skus
        .map((sku) => `<option value="${sku.name}">${sku.name}</option>`)
        .join('')
      p.appendChild(select)

      target.appendChild(p)

      return select
    })
}

export const replaceDeliveryScheduleInContent = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  const index = Number(target.dataset.index ?? 0)
  const short = !!target.dataset.short
  target.innerText =
    (short
      ? data.rule.schedule.texts[index]?.replace(/(\d{4}|年)/g, '')
      : data.rule.schedule.texts[index]) ?? ''
}
