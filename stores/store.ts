import { defineStore } from 'pinia'
import { Product } from '~~/constants/networth'
import { CryptoQuote } from '~~/constants/quotes'

export const useProductStore = defineStore('products', {
  state: () => {
    return {
      products: [] as Product[] | undefined,
      netWorth: 0,
    }
  },
  actions: {
    async updateTotal(cryptoQuotes: CryptoQuote[]) {
      cryptoQuotes.forEach(quote => {
        const match: Product = this.products.find((product: Product) => product.name === quote.name)
        if (match && match.price !== quote.sgdValue) {
          const currentTotal = match.total

          const d = new Date()
          const text = d.toISOString()
          console.log(`[${text}] Updating ${match.name} - Price(${match.price} -> ${quote.sgdValue}), Total(${currentTotal} -> ${quote.sgdValue * match.quantity}) | Net worth: ${this.netWorth}`)

          const newTotal = quote.sgdValue * match.quantity

          match.price = quote.sgdValue
          match.total = newTotal
          this.netWorth += newTotal - currentTotal
        }
      })
      // this.netWorth = this.products.map((p: { type: ProductType; total: number }) => {
      //   if (p.type === ProductType.Liability)
      //     return -p.total
      //   else
      //     return p.total
      // }).reduce((a: number, b: number) => a + b, 0)
    }
  },
})
