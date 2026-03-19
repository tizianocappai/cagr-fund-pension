import * as React from 'react'

export function BmcWidget() {
  React.useEffect(() => {
    const script = document.createElement('script')
    script.src = 'https://cdnjs.buymeacoffee.com/1.0.0/widget.prod.min.js'
    script.setAttribute('data-name', 'BMC-Widget')
    script.setAttribute('data-cfasync', 'false')
    script.setAttribute('data-id', 'tcappai')
    script.setAttribute('data-description', 'Support me on Buy me a coffee!')
    script.setAttribute('data-message', '')
    script.setAttribute('data-color', '#40DCA5')
    script.setAttribute('data-position', 'Right')
    script.setAttribute('data-x_margin', '18')
    script.setAttribute('data-y_margin', '18')
    document.body.appendChild(script)
    return () => { document.body.removeChild(script) }
  }, [])
  return null
}
