import { defineStore } from 'pinia'
import { Product, ProductType } from '~~/constants/networth'
import { Quote } from '~~/constants/quotes'
import { format5Dp } from '~~/utils/utils'

export const useProductStore = defineStore('products', {
  state: () => {
    return {
      products: [] as Product[] | undefined,
      netWorth: 0,
      currencies: [] as Quote[],
      logs: [] as string[],
      realtimeUpdateEnabled: undefined as boolean
    }
  },
  actions: {
    initializeStore() {
      if (localStorage.getItem('product-store')) {
        const productsLC = JSON.parse(localStorage.getItem('product-store'))
        productsLC.forEach((p: Product) => {
          if (!p.total) p.total = 0
          if (!p.price) p.price = 0
          p.imgsrc = `/product-logos/${p.name}.png`
        })
        this.products = productsLC
        this.netWorth = productsLC.map((p: { type: ProductType; total: number }) => p.total).reduce((a: number, b: number) => a + b, 0)
      }

      if (!localStorage.getItem('realtime-update-enabled')) {
        localStorage.setItem('realtime-update-enabled', 'true')
      }
    },
    async updateTotal(quote: Quote) {
      if (quote.source === 'fx') {
        const matchFx: Quote = this.currencies.find(currency => currency.name === quote.name)
        if (matchFx && matchFx.value !== quote.value) {
          matchFx.value = quote.value
        } else {
          this.currencies.push(quote)
        }
        return
      }

      const match: Product = this.products.find((product: Product) => product.name === quote.name)
      if (match && match.price !== quote.value) {
        const currentTotal = match.total
        const newTotal = quote.value * match.quantity

        const now = new Date()
        if (this.logs.length === 5) this.logs.pop()
        this.logs.unshift(`[${now.toISOString()}] Updating ${match.name} - Price(${format5Dp(match.price)} -> ${format5Dp(quote.sgdValue)}), Total(${format5Dp(currentTotal)} -> ${format5Dp(quote.sgdValue * match.quantity)}) | Net worth: ${this.netWorth}`)

        match.price = quote.value
        match.total = newTotal
        this.netWorth += newTotal - currentTotal
      }
    },
    async updateProductsFromConfig(products: Product[]) {
      this.products = products
    },
    async toggleRealtimeUpdates() {
      console.log(localStorage.getItem('realtime-update-enabled'))
      const x = !(localStorage.getItem('realtime-update-enabled') === 'true')
      this.realtimeUpdateEnabled = x
      localStorage.setItem('realtime-update-enabled', x.toString())
    }
  },
})
