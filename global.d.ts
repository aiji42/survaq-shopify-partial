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

declare namespace NodeJS {
  interface ProcessEnv {
    readonly SURVAQ_API_ORIGIN: string
  }
}
