import { Product, Variant } from './product'

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
<input name="properties[${key}]" type="hidden" value="${data.rule.schedule.text}(${data.rule.schedule.subText})" id="propertiesDelivery" />
`
  div.innerHTML = html
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
  if (!variant) return []
  const messageArea = document.createElement('p')
  messageArea.setAttribute('style', 'text-align:center;margin-top:4px;')

  Array.from({ length: variant.skuSelectable }).forEach((_, index) => {
    const p = document.createElement('p')
    p.classList.add('product-form__item')
    const label = data.skuLabel
      ? data.skuLabel?.replace(/#/g, String(index + 1))
      : null
    if (label) p.innerHTML = `<label>${label}</label>`
    const select = document.createElement('select')
    select.classList.add('product-form__input', 'skus')
    select.name = `properties[${label ?? `商品${index + 1}`}]`
    select.innerHTML = variant.skus
      .map((sku) => `<option value="${sku.name}">${sku.name}</option>`)
      .join('')
    p.appendChild(select)

    const updateDeliverySchedule = () => {
      const selects = Array.from(
        document.querySelectorAll<HTMLInputElement>('.skus')
      )
      const values = selects.map((el) => el.value)
      const selectedSkus = variant.skus.filter((sku) =>
        values.includes(sku.name)
      )
      const schedule = latest([
        data.rule.schedule,
        ...selectedSkus.map(({ schedule }) => schedule)
      ])

      const propertiesDelivery = document.querySelector<HTMLInputElement>(
        '#propertiesDelivery'
      )
      if (!propertiesDelivery) throw new Error()
      propertiesDelivery.value = `${schedule.text}(${schedule.subText})`

      if (data.rule.schedule.text !== schedule.text) {
        messageArea.innerHTML = `ご選択いただいた商品の中に品薄のものが含まれております。<br />配送時期は${schedule.text.replace(
          /(\d{4}|年)/g,
          ''
        )}を予定しております。`
      } else {
        messageArea.innerText = ''
      }
    }

    select.addEventListener('change', updateDeliverySchedule)
    updateDeliverySchedule()

    target.appendChild(p)

    return select
  })

  target.appendChild(messageArea)
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

type DeliverySchedule = Exclude<Variant['skus'][number]['schedule'], null>

export const latest = (
  schedules: Array<Product['rule']['schedule'] | DeliverySchedule | null>
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
    })[0]
}
