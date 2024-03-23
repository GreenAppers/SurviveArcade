import Object from '@rbxts/object-utils'
import { createProducer } from '@rbxts/reflex'

export interface TycoonState {
  readonly owner?: Player
}

export type TycoonsState = {
  readonly [tycoonName in TycoonName]: TycoonState | undefined
}

export const findTycoonNameOwnedBy = (
  tycoonsState: TycoonsState,
  userId: number,
) =>
  Object.entries(tycoonsState).find(
    ([_name, tycoon]) => tycoon?.owner?.UserId === userId,
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
}

export const tycoonsSlice = createProducer(initialState, {
  claimTycoon: (state, name: TycoonName, owner?: Player) => {
    const prevTycoon = state[name]
    return !prevTycoon ||
      prevTycoon.owner === owner ||
      (owner && prevTycoon.owner)
      ? state
      : {
          ...state,
          [name]: { ...prevTycoon, owner },
        }
  },

  resetTycoon: (state, name: TycoonName) => {
    return {
      ...state,
      [name]: { ...initialState[name] },
    }
  },

  resetTycoons: () => ({ ...initialState }),
})
