export function getCurrency(currency?: string): Currency | undefined {
  switch (currency) {
    case 'Dollars':
    case 'Tickets':
    case 'Levity':
      return currency
    default:
      return undefined
  }
}
