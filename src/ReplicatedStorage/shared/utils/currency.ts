import Abbreviator from '@rbxts/abbreviate'

export const abbreviator = new Abbreviator()
abbreviator.setSetting('stripTrailingZeroes', true)

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
