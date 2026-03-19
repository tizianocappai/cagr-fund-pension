import { useEffect } from 'react'

const BASE_TITLE = 'Gennaro — Il detective del tuo fondo pensione'

export function useMeta(title: string, description: string) {
  useEffect(() => {
    document.title = title ? `${title} | Gennaro` : BASE_TITLE

    const desc = document.querySelector('meta[name="description"]')
    if (desc) desc.setAttribute('content', description)

    const ogTitle = document.querySelector('meta[property="og:title"]')
    if (ogTitle) ogTitle.setAttribute('content', title ? `${title} | Gennaro` : BASE_TITLE)

    const ogDesc = document.querySelector('meta[property="og:description"]')
    if (ogDesc) ogDesc.setAttribute('content', description)

    return () => {
      document.title = BASE_TITLE
    }
  }, [title, description])
}
