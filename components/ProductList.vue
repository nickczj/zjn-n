<template>
  <div>
    <div text-xl font-bold font-300 cursor-default>
      <p>Investments</p>
      <p class="cursor-pointer" @click="toggleNetWorthCurrency">{{ formatCurrency(netWorth, netWorthCurrency) }}</p>
    </div>
    <div v-if="products.length !== 0" id="investments" class="p6">
      <div
        v-for="product in products"
        :key="product.id"
        class="flex justify-center"
      >
        <div href="#" class="grid grid-cols-7 gap-4 p1.5 w-full w-full md:w-1/2 lg:w-1/2 bg-white border border-gray-200 shadow-md hover:bg-gray-100 dark:bg-gray-800 dark:border-gray-700 dark:hover:bg-gray-700">
          <div class="col-span-3 flex items-center space-x-3">
            <img class="w-6 h-6 lg:w-8 lg:h-8 rounded-full" :src="product.imgsrc" alt="">
            <p class="text-sm md:text-base lg:text-base font-bold tracking-tight text-gray-900 dark:text-white">
              {{ product.name }}
            </p>
          </div>
          <div class="col-span-1" />
          <div class="col-span-3 flex justify-end items-center">
            <div v-if="product.category === 'us-equity' || product.category === 'crypto'" class="space-y-0.5 text-center">
              <p class="text-sm md:text-base lg:text-base font-normal text-gray-700 dark:text-gray-400 cursor-pointer" @click="toggleStocksCurrency">
                {{ formatCurrency(product.total, stocksCurrency) }}
              </p>
              <p class="text-xs cursor-pointer" @click="toggleStocksCurrency">
                {{ formatCurrency(product.price, stocksCurrency) }} x {{ format2Dp(product.quantity) }}
              </p>
            </div>
            <div v-if="product.category === 'cpf'">
              <p class="text-sm md:text-base lg:text-base py-2 font-normal text-gray-700 dark:text-gray-400 cursor-pointer" @click="toggleCpfCurrency">
                {{ formatCurrency(product.total, cpfCurrency) }}
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  </div>
</template>

<script setup lang="ts">
import type { Quote } from '~/constants/quotes'
import { useProductStore } from '~~/stores/store'

const productStore = useProductStore()
const config = useRuntimeConfig()

productStore.$subscribe((_, state) => {
  if (state.products) localStorage.setItem('product-store', JSON.stringify(state.products))
})

const products = computed(() => productStore.products.sort((a, b) => b.total - a.total))
const netWorth = computed(() => productStore.netWorth)

const netWorthCurrency = computed(() => productStore.netWorthCurrency)
const stocksCurrency = computed(() => productStore.stocksCurrency)
const cpfCurrency = computed(() => productStore.cpfCurrency)

const toggleNetWorthCurrency = () => productStore.updatePreference('netWorthCurrency', netWorthCurrency.value === 'USD' ? 'SGD' : 'USD')
const toggleStocksCurrency = () => productStore.updatePreference('stocksCurrency', stocksCurrency.value === 'USD' ? 'SGD' : 'USD')
const toggleCpfCurrency = () => productStore.updatePreference('cpfCurrency', cpfCurrency.value === 'USD' ? 'SGD' : 'USD')
const usdToSgd = (value: number) => {
  const sgdQuote = productStore.currencies.find(currency => currency.name === 'SGD')
  if (sgdQuote && sgdQuote.value) {
    return value / sgdQuote.value
  } else {
    return 0
  }
}
const formatCurrency = computed(() => {
  return (value: number, currencyStr: string) => {
    value = currencyStr === 'USD' ? value : usdToSgd(value)
    return new Intl.NumberFormat('eb-SG', { style: 'currency', currency: currencyStr, currencyDisplay: 'code' }).format(value)
  }
})
const format2Dp = computed(() => {
  return (value: number | undefined) => {
    if (value) return value.toFixed(2)
  }
})

onMounted(() => {
  productStore.initializeStore(config.WS_URL)
  fetch(config.QUOTES_API)
    .then(result => {
      result.json().then(quotes => {
        quotes.forEach((quote: Quote) => {
          productStore.updateTotal(quote)
        })
      }).catch(e => {
        // eslint-disable-next-line no-console
        console.log('Error parsing backend websocket message', e)
      })
    })
})
</script>
