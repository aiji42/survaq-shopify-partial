interface Window {
  ShopifyAnalytics: {
    meta: {
      product: {
        id: string
      }
      selectedVariantId: string
    }
  }
  customScriptSurvaq: (pId: string, vId: string) => void
}
