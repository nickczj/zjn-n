import { defineStore } from 'pinia'
import type { Preferences, Product, ProductType } from '~~/constants/networth'
import type { Quote } from '~~/constants/quotes'
import { format5Dp } from '~~/utils/utils'

export const useProductStore = defineStore('products', {
  state: () => {
    return {
      products: [] as Product[] | undefined,
      netWorth: 0,
      currencies: [] as Quote[],
      logs: [] as string[],
      backendWs: undefined as WebSocket,
      backendWsConnected: false as boolean,
      preferences: undefined as Preferences | undefined
    }
  },
  getters: {
    netWorthCurrency() {
      if (this.preferences && this.preferences.netWorthCurrency) return this.preferences.netWorthCurrency
      else return 'USD'
    },
    stocksCurrency() {
      if (this.preferences && this.preferences.stocksCurrency) return this.preferences.stocksCurrency
      else return 'USD'
    },
    cpfCurrency() {
      if (this.preferences && this.preferences.cpfCurrency) return this.preferences.cpfCurrency
      else return 'SGD'
    },
  },
  actions: {
    initializeStore(wsUrl: string) {
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

      if (!localStorage.getItem('realtime-update-enabled')) localStorage.setItem('realtime-update-enabled', 'true')
      if (localStorage.getItem('realtime-update-enabled')) this.openWs(wsUrl)

      if (localStorage.getItem('preferences')) this.preferences = JSON.parse(localStorage.getItem('preferences'))
      if (!localStorage.getItem('preferences')) {
        this.preferences = <Preferences>({
          netWorthCurrency: 'USD',
          stocksCurrency: 'USD',
          cpfCurrency: 'SGD'
        })
        localStorage.setItem('preferences', JSON.stringify(this.preferences))
      }
    },
    async openWs(wsUrl: string) {
      this.backendWs = new WebSocket(wsUrl)

      this.backendWs.onopen = () => this.backendWsConnected = true
      this.backendWs.onclose = () => this.backendWsConnected = false
      this.backendWs.onmessage = (message) => {
        try {
          const quote: Quote = JSON.parse(message.data)
          // eslint-disable-next-line no-console
          // console.log(quote)
          this.updateTotal(quote)
        } catch (e) {
          // eslint-disable-next-line no-console
          console.log('Error parsing backend websocket message', e)
        }
      }
    },
    async closeWs() {
      this.backendWs.close()
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
    async toggleRealtimeUpdates(wsUrl: string) {
      const realtimeUpdateEnabled = localStorage.getItem('realtime-update-enabled') === 'true'
      localStorage.setItem('realtime-update-enabled', (!realtimeUpdateEnabled).toString())
      if (realtimeUpdateEnabled) this.closeWs()
      else this.openWs(wsUrl)
    },
    async updatePreference(preference: string, value: string) {
      if (this.preferences) {
        this.preferences[preference] = value
        localStorage.setItem('preferences', JSON.stringify(this.preferences))
      }
    }
  },
})
