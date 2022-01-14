import { defineStore } from 'pinia'
import { Product, ProductType } from '~~/constants/networth'
import { CryptoQuote } from '~~/constants/quotes'
import { format5Dp } from '~~/utils/utils'

export const useProductStore = defineStore('products', {
  state: () => {
    return {
      products: [] as Product[] | undefined,
      netWorth: 0,
      logs: [] as string [],
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
    },
    async updateTotal(cryptoQuotes: CryptoQuote[]) {
      cryptoQuotes.forEach(quote => {
        const match: Product = this.products.find((product: Product) => product.name === quote.name)
        if (match && match.price !== quote.sgdValue) {
          const currentTotal = match.total
          const newTotal = quote.sgdValue * match.quantity

          const now = new Date()
          if (this.logs.length === 5) this.logs.pop()
          this.logs.unshift(`[${now.toISOString()}] Updating ${match.name} - Price(${format5Dp(match.price)} -> ${format5Dp(quote.sgdValue)}), Total(${format5Dp(currentTotal)} -> ${format5Dp(quote.sgdValue * match.quantity)}) | Net worth: ${this.netWorth}`)

          match.price = quote.sgdValue
          match.total = newTotal
          this.netWorth += newTotal - currentTotal
        }
      })
    },
    async updateProductsFromConfig(products: Product[]) {
      this.products = products
    }
  },
})