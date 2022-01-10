<template>
  <div>
    <div text-xl font-bold font-300 cursor-default>
      <p>
        Net Worth
      </p>
      <p>
        {{ formatCurrency(netWorth || 0) }}
      </p>
    </div>
    <div id="investments" class="flex justify-center p6">
      <div>
        <div
          v-for="(product, index) in products"
          :key="index"
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
                  {{ formatCurrency(product.total || 0) }}
                </p>
                <p class="text-xs">
                  Qty: {{ product.quantity }}
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
import { defineComponent } from '@nuxtjs/composition-api'
import { Product, ProductType } from '~/constants/networth'

export default defineComponent({
  name: 'ProductList',
  setup() {
    const productsConfig = useState('config-products', () => { return '[{"name":"TSLA","quantity":69},{"name":"ARKK","quantity":10},{"name":"ARKX","quantity":30},{"name":"GME","quantity":15},{"name":"GRAB","quantity":40},{"name":"BTC","quantity":0.181605},{"name":"ETH","quantity":3.316928},{"name":"NANO","quantity":172.28},{"name":"BCH","quantity":0.1098},{"name":"CRO","quantity":6338.19},{"name":"USDC","quantity":1000},{"name":"UST","quantity":2195.127}]' })
    const products: Product[] = JSON.parse(productsConfig.value)

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

    const connected = useState('ws-connected', () => false)
    const config = useRuntimeConfig()

    onMounted(() => {
      const socket = new WebSocket(config.WS_URL)

      socket.onopen = () => {
        connected.value = true
      }

      socket.onclose = () => {
        connected.value = false
      }

      socket.onmessage = (message) => {
        console.log(message)
      }
    })

    return { products, formatCurrency, netWorth }
  },
})
</script>
