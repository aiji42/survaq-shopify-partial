import {
  fetchData,
  createSKUSelects,
  replaceDeliveryScheduleInContent,
  createSkuCodesProperty
} from './libraries'

const main = (productId: string, initValiantId: string) => {
  let currentValiantId: string = initValiantId

  fetchData(productId).then((data) => {
    const propertiesTarget = document.getElementById('additionalProperties')
    let skuCodesInput: HTMLInputElement | null = null
    if (propertiesTarget) skuCodesInput = createSkuCodesProperty(data, initValiantId, propertiesTarget)

    const selectsTarget = document.getElementById('variationSelectors')
    if (selectsTarget) {
      createSKUSelects(data, currentValiantId, skuCodesInput, selectsTarget)

      document.addEventListener(
        'change',
        () => {
          if (
            currentValiantId === window.ShopifyAnalytics.meta.selectedVariantId
          )
            return
          currentValiantId = window.ShopifyAnalytics.meta.selectedVariantId
          selectsTarget.innerHTML = ''
          createSKUSelects(data, currentValiantId, skuCodesInput, selectsTarget)
        },
        false
      )
    }

    Array.from(
      document.querySelectorAll<HTMLSpanElement>('.delivery-schedule')
    ).forEach((t) => {
      replaceDeliveryScheduleInContent(data, t)
    })
  })
}

fetch('https://api.survaq.com/webhook/bundle-js-usage', {
  method: 'POST',
  headers: {
    'Content-Type': 'application/json'
  },
  body: JSON.stringify({
    referrer: window.location.href
  })
})

window.customScriptSurvaq = main
