import exchangeConstants from 'ReplicatedStorage/shared/constants/exchange.json'
import {
  selectPlayerCurrency,
  selectTycoonsState,
} from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import { store } from 'ServerScriptService/store'

export const EXCHANGE = exchangeConstants as Record<
  keyof typeof exchangeConstants,
  Exchange
>

export function executeExchange(userId: number, exchange?: Exchange) {
  const state = store.getState()
  if (exchange?.Requires === 'Tycoon') {
    if (!findTycoonNameOwnedBy(selectTycoonsState()(state), userId))
      return false
  }

  const cost = exchange?.Cost ?? 0
  const currency = getCurrency(exchange?.Currency)
  if (cost > 0 && currency) {
    const newState = store.addPlayerCurrency(userId, currency, -cost)
    const currencySelector = selectPlayerCurrency(userId, currency)
    if (currencySelector(newState) === currencySelector(state)) return false
  }

  const pays = exchange?.Pays ?? 0
  const paysCurrency = getCurrency(exchange?.PaysCurrency)
  if (pays > 0 && paysCurrency)
    store.addPlayerCurrency(userId, paysCurrency, pays)

  return true
}
