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
          <div href="#" class="grid grid-cols-6 gap-4 block p1.5 max-w-lg bg-white border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <div class="col-start-1 col-end-5">
              <div class="flex items-center space-x-3">
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
                <p v-if="product.category === 'us-equity' || product.category === 'crypto'" class="text-xs">
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
import { useProductStore } from '~~/stores/store'

export default {
  name: 'ProductList',
  setup() {
    const productStore = useProductStore()
    productStore.$subscribe((_, state) => {
      if (state.products) localStorage.setItem('product-store', JSON.stringify(state.products))
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

    onMounted(() => {
      productStore.initializeStore()

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
