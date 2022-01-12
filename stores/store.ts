import { defineStore } from 'pinia'
import { Product } from '~~/constants/networth'
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
    }
  },
})
