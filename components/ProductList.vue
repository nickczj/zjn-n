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
                <img class="w-8 h-8 rounded-full" :src="product.imgsrc">
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
                  {{ formatCurrency(product.price) }} x {{ product.quantity }}
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
import { watchSyncEffect } from '@vue/runtime-dom'
import { ProductType } from '~/constants/networth'
import { CryptoQuote } from '~/constants/quotes'

export default {
  name: 'ProductList',
  setup() {
    const cryptoQuotes = reactive(new Map())

    const productsConfig = useState('config-products', () => { return '[{"name":"TSLA","quantity":69},{"name":"ARKK","quantity":10},{"name":"ARKX","quantity":30},{"name":"GME","quantity":15},{"name":"GRAB","quantity":40},{"name":"BTC","quantity":0.181605},{"name":"ETH","quantity":3.316928},{"name":"NANO","quantity":172.28},{"name":"BCH","quantity":0.1098},{"name":"CRO","quantity":6353.3},{"name":"USDC","quantity":1000},{"name":"UST","quantity":2195.127}]' })
    const productsConfigObj = JSON.parse(productsConfig.value)
    productsConfigObj.forEach(p => p.total = 0)
    const productsRef = reactive(productsConfigObj) // no type check, error handling?
    const products = readonly(productsRef)

    const formatCurrency = computed(() => {
      return (value: number | bigint) => {
        return new Intl.NumberFormat('eb-SG', { style: 'currency', currency: 'SGD' }).format(value)
      }
    })

    const netWorth = computed(() => {
      return products.map((p) => {
        if (p.type === ProductType.Liability)
          return -p.total
        else
          return p.total
      }).reduce((a, b) => a + b, 0)
    })

    const backendWsConnected = useState('ws-connected', () => false)
    const config = useRuntimeConfig()


    onMounted(() => {
      const backend = new WebSocket(config.WS_URL)
      backend.onopen = () => backendWsConnected.value = true
      backend.onclose = () => backendWsConnected.value = false
      backend.onmessage = (message) => {
        try {
          const quotes: CryptoQuote[] = JSON.parse(message.data)
          quotes.forEach((quote) => {
            cryptoQuotes.set(quote.name, quote)
          })

          watchSyncEffect(
            () => {
              cryptoQuotes.forEach(q => q.sgdValue)
              cryptoQuotes.forEach((quote) => {
                const matchedProduct = productsRef.find(product => product.name === quote.name)
                if (matchedProduct) {
                  matchedProduct.total = quote.sgdValue * matchedProduct.quantity
                  matchedProduct.price = quote.sgdValue
                }
              })
            })
        }
        catch (e) {
          console.log('Error parsing backend websocket message', e)
        }
      }
      refresh()
    })

    return { products, formatCurrency, netWorth, cryptoQuotes }
  },
}
</script>
