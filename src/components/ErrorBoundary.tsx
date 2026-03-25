import * as React from 'react'

interface State {
  hasError: boolean
  message: string
}

export class ErrorBoundary extends React.Component<{ children: React.ReactNode }, State> {
  state: State = { hasError: false, message: '' }

  static getDerivedStateFromError(error: unknown): State {
    return {
      hasError: true,
      message: error instanceof Error ? error.message : 'Errore sconosciuto',
    }
  }

  render() {
    if (this.state.hasError) {
      return (
        <div className="mx-auto max-w-4xl px-6 py-10">
          <div className="bg-error-container px-4 py-3 text-[14px] leading-[20px] tracking-[0.1px] font-medium text-on-error-container elevation-1 rounded-md">
            Si è verificato un errore inatteso: {this.state.message}
          </div>
        </div>
      )
    }
    return this.props.children
  }
}
