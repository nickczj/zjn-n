<template>
  <div>
    <div text-xl font-bold font-300 cursor-default>
      <p>
        Investments
      </p>
      <p>
        {{ formatCurrency(netWorth || 0) }}
      </p>
    </div>
    <div v-if="products.length !== 0" id="investments" class="flex justify-center p6">
      <div>
        <div
          v-for="product in products"
          :key="product.id"
        >
          <div href="#" class="grid grid-cols-6 gap-4 block p2 max-w-lg bg-white border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <div class="col-start-1 col-end-3">
              <div class="flex items-center space-x-4">
                <img class="w-8 h-8 rounded-full" :src="product.imgsrc" alt="">
                <p class="text-base font-bold tracking-tight text-gray-900 dark:text-white">
                  {{ product.name }}
                </p>
              </div>
            </div>
            <div class="col-start-5 col-end-7">
              <div class="space-y-0.5">
                <p class="font-normal text-gray-700 dark:text-gray-400">
                  {{ formatCurrency(product.total) }}
                </p>
                <p class="text-xs">
                  {{ formatCurrency(product.price) }} x {{ format2Dp(product.quantity) }}
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script lang="ts">
import { CryptoQuote } from '~/constants/quotes'
import { Product } from '~~/constants/networth'
import { useProductStore } from '~~/stores/store'

export default {
  name: 'ProductList',
  setup() {
    const productStore = useProductStore()

    const productsConfig: Product[] = JSON.parse('[{"name":"TSLA","quantity":69},{"name":"ARKK","quantity":10},{"name":"ARKX","quantity":30},{"name":"GME","quantity":15},{"name":"GRAB","quantity":40},{"name":"BTC","quantity":0.181605},{"name":"ETH","quantity":3.316928},{"name":"NANO","quantity":172.28},{"name":"BCH","quantity":0.1098},{"name":"CRO","quantity":6353.3},{"name":"USDC","quantity":1000},{"name":"UST","quantity":2195.127}]') // no type check, error handling?
    productsConfig.forEach(p => {
      p.total = 0
      p.imgsrc = `/product-logos/${p.name}.png`
    })

    productStore.$patch((state) => {
      state.products = productsConfig
    })

    const products = computed(() => productStore.products.sort((a, b) => b.total - a.total))
    const netWorth = computed(() => productStore.netWorth)
    const formatCurrency = computed(() => {
      return (value: number | bigint) => {
        return new Intl.NumberFormat('eb-SG', { style: 'currency', currency: 'SGD' }).format(value)
      }
    })
    const format2Dp = computed(() => {
      return (value: number | undefined) => {
        if (value) return value.toFixed(2)
      }
    })

    const backendWsConnected = useState('ws-connected', () => false)
    const config = useRuntimeConfig()

    // const { data: iexQuote, refresh } = useLazyFetch('https://cloud.iexapis.com/stable/stock/tsla/quote?token=pk_26244b01e52b42db895347905ca3448e')
    // handle us equity pricing for closing hours -> iexQuote.isUSMarketOpen, use extendedPrice as post trading hours price
    // handle us equity pricing for opening hours -> websocket finnhub

    onMounted(() => {
      const backend = new WebSocket(config.WS_URL)
      backend.onopen = () => backendWsConnected.value = true
      backend.onclose = () => backendWsConnected.value = false
      backend.onmessage = (message) => {
        try {
          const quotes: CryptoQuote[] = JSON.parse(message.data)
          productStore.updateTotal(quotes)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('Error parsing backend websocket message', e)
        }
      }
      // refresh()
    })

    return {
      products,
      netWorth,
      formatCurrency,
      format2Dp
    }
  },
}
</script>
