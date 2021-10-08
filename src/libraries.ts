import { Product } from './product'

const apiEndpoint =
  'https://xrm524o5j2.execute-api.us-east-1.amazonaws.com/production/v2/products/'

let cache: Record<string, Product> = {}

export const fetchData = async (productId: string): Promise<Product> => {
  if (cache[productId]) return cache[productId]
  const data: Product = await fetch(`${apiEndpoint}${productId}`).then((res) =>
    res.json()
  )
  cache[productId] = data

  return data
}

export const createDeliveryScheduleProperty = async (
  productId: string,
  target: HTMLElement
): Promise<HTMLDivElement> => {
  const data = await fetchData(productId)
  const div = document.createElement('div')
  const html = `
<input name="properties[配送予定]" type="hidden" value="${data.rule.schedule.text}(${data.rule.schedule.subText})" />
<input name="properties[delivery_schedule]" type="hidden" value="${data.rule.schedule.year}-${data.rule.schedule.month}-${data.rule.schedule.term}" />
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
  const variant = data.variants.find(({ variantId: v }) => v === variantId)
  if (!variant) return []
  const codesByName = variant.skus.reduce<Record<string, string>>(
    (res, { name, code }) => ({ ...res, [name]: code }),
    {}
  )

  const selects = Array(variant.skuSelectable)
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

  const skuInput = document.createElement('input')
  skuInput.type = 'hidden'
  skuInput.name = 'properties[skus]'
  skuInput.value =
    selects.length === 0
      ? JSON.stringify(variant.skus.map(({ code }) => code))
      : JSON.stringify(selects.map((s) => codesByName[s.value] ?? 'unknown'))
  target.appendChild(skuInput)

  selects.forEach((select) => {
    select.addEventListener('change', () => {
      skuInput.value = JSON.stringify(
        selects.map((s) => codesByName[s.value] ?? 'unknown')
      )
    })
  })

  return selects
}

export const createFundingPriceContents = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  target.innerHTML =
    data.foundation.totalPrice?.toLocaleString('JP', {
      style: 'currency',
      currency: 'JPY'
    }) ?? '-'
}

export const createFundingSupportersContents = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  target.innerHTML = `${data.foundation.supporter?.toLocaleString() ?? '- '}人`
}

export const createFundingStatusContents = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  const remainDays = Math.ceil(
    (new Date(data.foundation.closeOn).getTime() - new Date().getTime()) /
      86400000
  )

  target.innerHTML =
    remainDays === 0 ? '最終日' : remainDays < 0 ? '販売中' : `${remainDays}日`
}

export const replaceDeliveryScheduleInContent = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  target.innerText = data.rule.schedule.text
}
