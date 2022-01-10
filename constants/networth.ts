export enum ProductType {
  Asset,
  Liability
}

export interface Assets {
  cash: number
  cpf: number
  home: number
  investments: number
  otherAssets: number
  srs: number
}

export interface Cpf {
  oa: number
  ma: number
  sa: number
  ra: number
}

export interface Product {
  id: number
  name: string
  type: ProductType
  category: string
  quantity: number
  total: number
  imgsrc: string
}

export interface Liabilities {
  creditCard: number
  loans: number
  otherLiabilities: number
}

export interface Breakdown {
  cpf: Cpf
  products: Product[]
}

export interface NetWorth {
  netWorth: number
  assets: Assets
  liabilities: Liabilities
  breakdown: Breakdown
}
