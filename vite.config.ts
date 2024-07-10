import { fileURLToPath, URL } from 'node:url'

import { defineConfig } from 'vite'
import vue from '@vitejs/plugin-vue'
import vueDevTools from 'vite-plugin-vue-devtools'

// https://vitejs.dev/config/
export default defineConfig({
  plugins: [
    vue(),
    vueDevTools(),
  ],
  resolve: {
    alias: {
      '@': fileURLToPath(new URL('./src', import.meta.url)),
      // '@gala-chain/connect': fileURLToPath(
      //   new URL('C:/Users/india/Documents/sdk/chain-connect/src', import.meta.url)
      // ),
      // '@gala-chain/api': fileURLToPath(
      //   new URL('C:/Users/india/Documents/sdk/chain-api/src', import.meta.url)
      // ),
    },
    preserveSymlinks: true,
  },
  optimizeDeps: {
    include: ['@gala-chain/api', '@gala-chain/connect'],
  },
  build: {
    commonjsOptions: {
      include: [/node_modules\/@gala-chain\/api/, /node_modules/, /node_modules\/@gala-chain\/connect/],
    },
  },
})
