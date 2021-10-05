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
  title: string,
  target: HTMLElement
): Promise<HTMLSelectElement[]> => {
  const data = await fetchData(productId)
  const variant = data.variants.find(({ variantId: v }) => v === variantId)
  if (!variant || data.skus.length < 2) return []
  const selects = Array(variant.itemCount)
    .fill(0)
    .map((_, index) => {
      const p = document.createElement('p')
      p.innerHTML = `<label>${title}（${index + 1}つ目）</label>`
      const select = document.createElement('select')
      select.innerHTML = data.skus
        .map((sku) => `<option value="${sku.skuCode}">${sku.skuName}</option>`)
        .join('')
      p.appendChild(select)

      target.appendChild(p)

      return select
    })

  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'properties[sku_quantity]'

  target.appendChild(input)
  // TODO: default value of input
  // TODO: readabel value for user

  const skus: Record<number, { sku: string; quantity: number }> = {}

  selects.forEach((select, index) => {
    select.addEventListener('change', ({ target }) => {
      if (!(target instanceof HTMLSelectElement)) return

      skus[index] = { sku: target.value, quantity: 1 }
      input.value = JSON.stringify(Object.values(skus))
    })
  })

  return selects
}

const propertiesTarget = document.getElementById('additionalProperties')
if (propertiesTarget)
  createDeliveryScheduleProperty('6580009205965', propertiesTarget)

const selectsTarget = document.getElementById('variationSelectors')
if (selectsTarget)
  createSKUSelects(
    '6580009205965',
    '39457079001293',
    'カラー×サイズ',
    selectsTarget
  )
