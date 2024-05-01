import exchangeConstants from 'ReplicatedStorage/shared/constants/exchange.json'
import {
  selectPlayerCurrency,
  selectTycoonsState,
} from 'ReplicatedStorage/shared/state'
import { findTycoonNameOwnedBy } from 'ReplicatedStorage/shared/state/TycoonState'
import { getCurrency } from 'ReplicatedStorage/shared/utils/currency'
import { formatMessage, MESSAGE } from 'ReplicatedStorage/shared/utils/messages'
import { sendAlert } from 'StarterPlayer/StarterPlayerScripts/alerts'
import { store } from 'StarterPlayer/StarterPlayerScripts/store'

export const EXCHANGE = exchangeConstants as Record<
  keyof typeof exchangeConstants,
  Exchange
>

export function testExchange(userId: number, exchange?: Exchange) {
  const state = store.getState()
  if (exchange?.Requires === 'Tycoon') {
    if (!findTycoonNameOwnedBy(selectTycoonsState()(state), userId)) {
      sendAlert({
        emoji: '🏗️',
        message: formatMessage(MESSAGE.TycoonNeeded),
      })
      return false
    }
  }

  const cost = exchange?.Cost ?? 0
  const currency = getCurrency(exchange?.Currency)
  if (cost > 0 && currency) {
    const currencySelector = selectPlayerCurrency(userId, currency)
    if (currencySelector(state) < cost) {
      sendAlert({
        emoji: '💰',
        message: formatMessage(MESSAGE.DollarsNeeded),
      })
      return false
    }
  }

  return true
}
