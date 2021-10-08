import {
  fetchData,
  createFundingStatusContents,
  createFundingSupportersContents,
  createFundingPriceContents,
  createDeliveryScheduleProperty,
  createSKUSelects,
  replaceDeliveryScheduleInContent
} from './libraries'

const productId: string = window.ShopifyAnalytics.meta.product.id
const [, variantId] = document.location.search.match(/variant=(\d+)/) ?? []

let currentValiantId: string =
  variantId ?? window.ShopifyAnalytics.meta.selectedVariantId

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
