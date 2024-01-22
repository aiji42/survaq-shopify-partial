import {
  fetchData,
  createSKUSelects,
  replaceDeliveryScheduleInContent,
  createSkuCodesProperty
} from './libraries'

const main = (productId: string, initValiantId: string) => {
  let currentValiantId: string = initValiantId

  fetchData(productId).then(() => {
    const propertiesTarget = document.getElementById('additionalProperties')
    if (propertiesTarget) createSkuCodesProperty(productId, initValiantId, propertiesTarget)

    const selectsTarget = document.getElementById('variationSelectors')
    if (selectsTarget) {
      createSKUSelects(productId, currentValiantId, selectsTarget)

      document.addEventListener(
        'change',
        () => {
          if (
            currentValiantId === window.ShopifyAnalytics.meta.selectedVariantId
          )
            return
          currentValiantId = window.ShopifyAnalytics.meta.selectedVariantId
          selectsTarget.innerHTML = ''
          createSKUSelects(productId, currentValiantId, selectsTarget)
        },
        false
      )
    }

    Array.from(
      document.querySelectorAll<HTMLSpanElement>('.delivery-schedule')
    ).forEach((t) => {
      replaceDeliveryScheduleInContent(productId, t)
    })
  })
}

window.customScriptSurvaq = main
