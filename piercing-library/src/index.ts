export * from './piercing-fragment-outlet'
export * from './piercing-fragment-host'
export * from './piercing-gateway'

// @ts-ignore
import piercingFragmentHostInlineScriptRaw from '../dist/piercing-fragment-host-inline.js?raw'
export const piercingFragmentHostInlineScript = `<script>(() => {${piercingFragmentHostInlineScriptRaw}})();</script>`
