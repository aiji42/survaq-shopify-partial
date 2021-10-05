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
<input name="properties[配送予定]" value="${data.rule.schedule.text}(${data.rule.schedule.subText})" />
<input name="properties[delivery_schedule]" value="${data.rule.schedule.year}-(${data.rule.schedule.month}-${data.rule.schedule.term})" />
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
    .map(() => {
      const p = document.createElement('p')
      p.innerHTML = `<label>${title}</label>`
      const select = document.createElement('select')
      data.skus.forEach((sku) => {
        const option = document.createElement('option')
        option.value = sku.skuCode
        option.innerText = sku.skuName
        select.appendChild(option)
      })
      p.appendChild(select)

      target.appendChild(select)

      return select
    })

  return selects
}
