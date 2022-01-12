export const format5Dp = (value: number | undefined) => {
  if (value) return value.toFixed(5)
  else return undefined
}
