import {
  fetchData,
  createFundingStatusContents,
  createFundingSupportersContents,
  createFundingPriceContents,
  createDeliveryScheduleProperty,
  createSKUSelects,
  replaceDeliveryScheduleInContent
} from './libraries'

const main = (productId: string, initValiantId: string) => {
  let currentValiantId: string = initValiantId

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

    const fundingPriceTarget = document.getElementById('fundingsPrice')
    if (fundingPriceTarget)
      createFundingPriceContents(productId, fundingPriceTarget)
    const fundingsSupportersTarget =
      document.getElementById('fundingsSupporters')
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
}

window.customScriptSurvaq = main
