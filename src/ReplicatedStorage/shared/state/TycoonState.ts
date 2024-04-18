import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'

export interface TycoonState {
  readonly owner?: number
}

export type TycoonsState = {
  readonly [tycoonName in TycoonName]: TycoonState
}

export const findTycoonNameOwnedBy = (
  tycoonsState: TycoonsState,
  userId: number,
) =>
  Object.entries(tycoonsState).find(
    ([_name, tycoon]) => tycoon?.owner === userId,
  )?.[0] as TycoonName | undefined

const initialState: TycoonsState = {
  Tycoon1: {
    owner: undefined,
  },
  Tycoon2: {
    owner: undefined,
  },
  Tycoon3: {
    owner: undefined,
  },
  Tycoon4: {
    owner: undefined,
  },
  Tycoon5: {
    owner: undefined,
  },
  Tycoon6: {
    owner: undefined,
  },
  Tycoon7: {
    owner: undefined,
  },
  Tycoon8: {
    owner: undefined,
  },
}

export const tycoonsSlice = createProducer(initialState, {
  claimTycoon: (state, name: TycoonName, userId?: number) => {
    const prevTycoon = state[name]
    if (
      !prevTycoon ||
      prevTycoon.owner === userId ||
      (userId && prevTycoon.owner) ||
      Object.values(state).some((tycoon) => tycoon?.owner === userId)
    ) {
      return state
    }
    return {
      ...state,
      [name]: { ...prevTycoon, owner: userId },
    }
  },

  resetPlayerTycoon: (state, userId: number) => {
    const name = findTycoonNameOwnedBy(state, userId)
    return name ? { ...state, [name]: { ...initialState[name] } } : state
  },

  resetTycoon: (state, name: TycoonName) => {
    return {
      ...state,
      [name]: { ...initialState[name] },
    }
  },

  resetTycoons: () => ({ ...initialState }),
})
