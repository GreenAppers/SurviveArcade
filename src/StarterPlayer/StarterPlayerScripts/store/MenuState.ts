import { createProducer } from '@rbxts/reflex'

export interface MenuState {
  readonly guideText: string
  readonly music: boolean
  readonly open: boolean
  readonly page: MenuPage
  readonly playerListOpen: boolean
  readonly transition: {
    readonly direction: 'left' | 'right'
    readonly counter: number
  }
}

export type MenuPage = 'support' | 'home'

export const MENU_PAGES: readonly MenuPage[] = ['support', 'home'] as const

const initialState: MenuState = {
  guideText: 'Welcome to the arcade!',
  music: true,
  open: true,
  page: 'home',
  playerListOpen: false,
  transition: {
    direction: 'left',
    counter: 0,
  },
}

export const menuSlice = createProducer(initialState, {
  setGuideText: (state, guideText: string) => ({
    ...state,
    guideText,
  }),

  setMenuPage: (state, page: MenuPage) => ({
    ...state,
    page,
    transition: {
      direction: getMenuDirection(state.page, page),
      counter: state.transition.counter + 1,
    },
  }),

  setMenuOpen: (state, open: boolean) => ({
    ...state,
    open,
  }),

  setMenuMusic: (state, music: boolean) => ({
    ...state,
    music,
  }),

  setPlayerList: (state, open: boolean) => ({
    ...state,
    playerListOpen: open,
  }),

  togglePlayerList: (state) => ({
    ...state,
    playerListOpen: !state.playerListOpen,
  }),
})

/**
 * Returns the direction of the transition from one menu page to
 * another. Used for animating navigation fluidly.
 */
export function getMenuDirection(from: MenuPage, to: MenuPage) {
  const fromIndex = MENU_PAGES.indexOf(from)
  const toIndex = MENU_PAGES.indexOf(to)
  if (fromIndex === -1 || toIndex === -1) {
    throw `Invalid menu page: ${from} -> ${to}`
  }
  return fromIndex < toIndex ? 'right' : 'left'
}
