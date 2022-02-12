<template>
  <div>
    <div text-xl font-bold font-300 cursor-default>
      <p>Investments</p>
      <p>{{ formatCurrency(usdToSgd(netWorth)) }}</p>
    </div>
    <div>
      <div v-if="products.length !== 0" id="investments" class="p6">
        <div
          v-for="product in products"
          :key="product.id"
          class="flex justify-center"
        >
          <div href="#" class="grid grid-cols-7 gap-4 p1.5 w-full w-full lg:w-2/3 bg-white border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
            <div class="col-span-3 flex items-center space-x-3">
              <img class="w-6 h-6 lg:w-8 lg:h-8 rounded-full" :src="product.imgsrc" alt="">
              <p class="text-sm md:text-base lg:text-base font-bold tracking-tight text-gray-900 dark:text-white">
                {{ product.name }}
              </p>
            </div>
            <div class="col-span-1"></div>
            <div class="col-span-3 flex justify-end items-center">
              <div v-if="product.category === 'us-equity' || product.category === 'crypto'" class="space-y-0.5 text-center">
                <p class="text-sm md:text-base lg:text-base font-normal text-gray-700 dark:text-gray-400">
                  {{ formatCurrency(usdToSgd(product.total)) }}
                </p>
                <p class="text-xs">
                  {{ formatCurrency(usdToSgd(product.price)) }} x {{ format2Dp(product.quantity) }}
                </p>
              </div>
              <div v-if="product.category === 'cpf'">
                <p class="text-sm md:text-base lg:text-base py-2 font-normal text-gray-700 dark:text-gray-400">
                  {{ formatCurrency(product.total) }}
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
import { Quote } from '~/constants/quotes'
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
    const usdToSgd = computed(() => {
      return (value: number) => {
        const sgdQuote = productStore.currencies.find(currency => currency.name === 'SGD')
        if (sgdQuote && sgdQuote.value) {
          return value / sgdQuote.value
        } else {
          return 0
        }
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

      fetch(config.QUOTES_API)
        .then(result => {
          result.json().then(quotes => {
            // eslint-disable-next-line no-console
            // console.log(quotes)
            quotes.forEach((quote: Quote) => {
              productStore.updateTotal(quote)
            })
          }).catch(e => {
            // eslint-disable-next-line no-console
            console.log('Error parsing backend websocket message', e)
          })
        })

      const backend = new WebSocket(config.WS_URL)
      backend.onopen = () => backendWsConnected.value = true
      backend.onclose = () => backendWsConnected.value = false
      backend.onmessage = (message) => {
        if (productStore.realtimeUpdateEnabled) {
          try {
            const quote: Quote = JSON.parse(message.data)
            // eslint-disable-next-line no-console
            // console.log(quote)
            productStore.updateTotal(quote)
          } catch (e) {
            // eslint-disable-next-line no-console
            console.log('Error parsing backend websocket message', e)
          }
        }
      }
    })

    return {
      products,
      netWorth,
      formatCurrency,
      usdToSgd,
      format2Dp
    }
  },
}
</script>
