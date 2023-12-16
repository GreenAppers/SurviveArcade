import Roact from '@rbxts/roact'
import { ErrorBoundary } from 'StarterPlayer/StarterPlayerScripts/Gui/components/ErrorBoundary'
import { ErrorPage } from 'StarterPlayer/StarterPlayerScripts/Gui/components/ErrorPage'

interface ErrorHandlerProps extends Roact.PropsWithChildren {}

export function ErrorHandler({ children }: ErrorHandlerProps) {
  return (
    <ErrorBoundary
      fallback={(message) => {
        return <ErrorPage message={message} />
      }}
    >
      {children}
    </ErrorBoundary>
  )
}
