import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'

export interface TycoonState {
  readonly owner?: number
  readonly color: BrickColor
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
    color: new BrickColor('Really red'),
    owner: undefined,
  },
  Tycoon2: {
    color: new BrickColor('Neon orange'),
    owner: undefined,
  },
  Tycoon3: {
    color: new BrickColor('Deep orange'),
    owner: undefined,
  },
  Tycoon4: {
    color: new BrickColor('Lime green'),
    owner: undefined,
  },
  Tycoon5: {
    color: new BrickColor('Really blue'),
    owner: undefined,
  },
  Tycoon6: {
    color: new BrickColor('Cyan'),
    owner: undefined,
  },
  Tycoon7: {
    color: new BrickColor('Royal purple'),
    owner: undefined,
  },
  Tycoon8: {
    color: new BrickColor('Hot pink'),
    owner: undefined,
  },
}

export const tycoonTemplateColor = initialState.Tycoon1.color

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
