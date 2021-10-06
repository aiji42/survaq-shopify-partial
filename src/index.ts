import { Product } from './product'

const apiEndpoint =
  'https://xrm524o5j2.execute-api.us-east-1.amazonaws.com/production/v2/products/'

let cache: Record<string, Product> = {}

const fetchData = async (productId: string): Promise<Product> => {
  if (cache[productId]) return cache[productId]
  const data: Product = await fetch(`${apiEndpoint}${productId}`).then((res) =>
    res.json()
  )
  cache[productId] = data

  return data
}

const createDeliveryScheduleProperty = async (
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

const createSKUSelects = async (
  productId: string,
  variantId: string,
  target: HTMLElement
): Promise<HTMLSelectElement[]> => {
  const data = await fetchData(productId)
  const variant = data.variants.find(({ variantId: v }) => v === variantId)
  if (!variant) return []
  const selects =
    data.skus.length < 2
      ? []
      : Array(variant.itemCount)
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
            select.name = `properties[${label ?? `selected_sku_${index + 1}`}]`
            select.innerHTML = data.skus
              .map(
                (sku) =>
                  `<option value="${sku.skuName}">${sku.skuName}</option>`
              )
              .join('')
            p.appendChild(select)

            target.appendChild(p)

            return select
          })

  const skuQuantityInput = document.createElement('input')
  skuQuantityInput.type = 'hidden'
  skuQuantityInput.name = 'properties[sku_quantity]'
  skuQuantityInput.value = JSON.stringify([
    { sku: data.skus[0].skuCode, quantity: variant.itemCount }
  ])
  target.appendChild(skuQuantityInput)

  selects.forEach((select, index) => {
    select.addEventListener('change', () => {
      const codesByName = data.skus.reduce<Record<string, string>>(
        (res, { skuName, skuCode }) => ({ ...res, [skuName]: skuCode }),
        {}
      )
      skuQuantityInput.value = JSON.stringify(
        selects.map((s) => ({
          sku: codesByName[s.value] ?? 'unknown',
          quantity: 1
        }))
      )
    })
  })

  return selects
}

const createFundingPriceContents = async (
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

const createFundingSupportersContents = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  target.innerHTML = `${data.foundation.supporter?.toLocaleString() ?? '- '}人`
}

const createFundingStatusContents = async (
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

const replaceDeliveryScheduleInContent = async (
  productId: string,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
  const data = await fetchData(productId)
  target.innerText = data.rule.schedule.text
}

const productId: string = (window as any).ShopifyAnalytics.meta.product.id
const [, variantId] = document.location.search.match(/variant=(\d+)/) ?? []

let currentValiantId: string =
  variantId ?? (window as any).ShopifyAnalytics.meta.selectedVariantId

fetchData(productId).then(() => {
  const propertiesTarget = document.getElementById('additionalProperties')
  if (propertiesTarget)
    createDeliveryScheduleProperty(productId, propertiesTarget)

  const selectsTarget = document.getElementById('variationSelectors')
  if (selectsTarget) {
    createSKUSelects(productId, currentValiantId, selectsTarget)

    document.addEventListener(
      'change',
      () => {
        if (
          currentValiantId ===
          (window as any).ShopifyAnalytics.meta.selectedVariantId
        )
          return
        currentValiantId = (window as any).ShopifyAnalytics.meta
          .selectedVariantId
        selectsTarget.innerHTML = ''
        createSKUSelects(productId, currentValiantId, selectsTarget)
      },
      false
    )
  }

  const fundingPriceTarget = document.getElementById('fundingsPrice')
  if (fundingPriceTarget)
    createFundingPriceContents(productId, fundingPriceTarget)
  const fundingsSupportersTarget = document.getElementById('fundingsSupporters')
  if (fundingsSupportersTarget)
    createFundingSupportersContents(productId, fundingsSupportersTarget)
  const fundingsStatusTarget = document.getElementById('fundingsRemainDays')
  if (fundingsStatusTarget)
    createFundingStatusContents(productId, fundingsStatusTarget)

  Array.from(
    document.querySelectorAll<HTMLSpanElement>('.delivery-schedule')
  ).forEach((t) => {
    replaceDeliveryScheduleInContent(productId, t)
  })
})
