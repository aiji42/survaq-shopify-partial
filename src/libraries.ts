import type {Product, Schedule, SKU} from './product'

const apiEndpoint = (id: string) =>
  `${process.env.SURVAQ_API_ORIGIN}/products/${id}`

const lang = document.documentElement.lang ?? 'ja'

export const fetchData = async (productId: string): Promise<Product> => {
  return await fetch(apiEndpoint(productId), {
    headers: {'accept-language': lang}
  }).then((res) => res.json())
}

const getSKUsByGroupCode = (code: string, product: Product): SKU[] => {
  const skuCodes = product.skuGroups[code]!
  return skuCodes.map((code) => product.skus[code]!)
}

export const createSkuCodesProperty = (
  data: Product,
  variantId: string,
  target: HTMLElement
) => {
  const div = document.createElement('div')
  const variant = data.variants.find((v) => v.variantId === variantId)!

  const values = [
    ...variant.skus,
    ...variant.skuGroups.map(({ skuGroupCode }) => getSKUsByGroupCode(skuGroupCode, data)[0]?.code ?? '')
  ]
  const input = document.createElement('input')
  input.type = 'hidden'
  input.name = 'properties[_skus]'
  input.value = JSON.stringify(values)
  div.appendChild(input)

  target.appendChild(div)

  return input
}

export const createSKUSelects = (
  data: Product,
  variantId: string,
  skusInput: HTMLInputElement | null,
  target: HTMLElement
) => {
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
    
    if (skusInput) skusInput.value = JSON.stringify(selectedSkuCodes)
  }

  variant.skuGroups.forEach(({ label, skuGroupCode }) => {
    const p = document.createElement('p')
    p.classList.add('product-form__item')
    if (label) p.innerHTML = `<label>${label}</label>`
    const select = document.createElement('select')
    select.classList.add('product-form__input', skusClassName)
    select.innerHTML = getSKUsByGroupCode(skuGroupCode, data)
      .map((sku) => `<option value="${sku.code}">${sku.name}</option>`)
      .join('')
    p.appendChild(select)

    const hidden = document.createElement('input')
    hidden.type = 'hidden'
    hidden.name = `properties[${label}]`
    hidden.value = data.skus[select.value]?.name ?? ''
    p.appendChild(hidden)

    select.addEventListener('change', () => {
      updateDeliverySchedule()
      updateSelectedSkuCodes()
      hidden.value = data.skus[select.value]?.name ?? ''
    })

    target.appendChild(p)

    return select
  })

  updateDeliverySchedule()
  updateSelectedSkuCodes()
  target.appendChild(messageArea)
}

export const replaceDeliveryScheduleInContent = (
  data: Product,
  target: HTMLDivElement | HTMLParagraphElement | HTMLSpanElement
) => {
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
