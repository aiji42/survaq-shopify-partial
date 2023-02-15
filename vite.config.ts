import * as path from 'path'
import { defineConfig, loadEnv } from 'vite'

export default defineConfig(({ mode }) => {
  const { SURVAQ_API_ORIGIN } = loadEnv(mode, process.cwd(), '')

  return {
    build: {
      lib: {
        entry: path.resolve(__dirname, 'src/index.ts'),
        name: 'survaqShopify',
        fileName: (format) => `bundle.${format}.js`
      },
      rollupOptions: {}
    },
    define: {
      'process.env.SURVAQ_API_ORIGIN': JSON.stringify(SURVAQ_API_ORIGIN)
    }
  }
})
