import { defineNuxtConfig } from '@nuxt/bridge-edge'

export default defineNuxtConfig({
  buildModules: [
    '@unocss/nuxt',
    '@vueuse/core/nuxt',
    '@nuxt/bridge-edge',
    '@pinia/nuxt',
  ],
  modules: [
    'nuxt-socket-io',
  ],
  meta: [
    { link: [{ rel: 'icon', href: 'favicon.ico' }] },
  ],
  head: {
    meta: [
      { name: 'viewport', content: 'width=device-width, initial-scale=1' },
    ]
  },
  css: [
    '@unocss/reset/tailwind.css',
    '~/styles/main.css',
  ],
  target: 'static',
  components: true,
  bridge: {
    // vite: true, // doesn't work with pinia currently: https://github.com/vuejs/pinia/issues/917#issuecomment-999390686
  },
  unocss: {
    shortcuts: [
      ['btn', 'px-4 py-1 rounded inline-block bg-teal-600 text-white cursor-pointer hover:bg-teal-700 disabled:cursor-default disabled:bg-gray-600 disabled:opacity-50'],
    ],
    uno: true,
    attributify: true,
    icons: {
      scale: 1.2,
    },
  },
  publicRuntimeConfig: {
    WS_URL: process.env.WS_URL,
    QUOTES_API: process.env.QUOTES_API,
  },
})
