/* "use client"

import Script from "next/script"

declare global {
  interface Window {
    Weglot?: {
      initialize: (config: { api_key: string }) => void
    }
  }
}

export default function WeglotScript() {
  return (
    <Script
      src="https://cdn.weglot.com/weglot.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        if (window.Weglot) {
          window.Weglot.initialize({
            api_key: "wg_c94a0dce3d0d4ace070de57d7352b0304",
          })
        }
      }}
    />
  )
}
 */

"use client"

import Script from "next/script"
import { usePathname } from "next/navigation"
import { useEffect } from "react"

declare global {
  interface Window {
    Weglot?: any
  }
}

export default function WeglotScript() {
  const pathname = usePathname()

  useEffect(() => {
    if (window.Weglot) {
      window.Weglot.initialize({
        api_key: "wg_c94a0dce3d0d4ace070de57d7352b0304",
      })
    }
  }, [])

  useEffect(() => {
    const interval = setInterval(() => {
      if (window.Weglot && window.Weglot.initialized) {
        window.Weglot.reload()
        clearInterval(interval)
      }
    }, 300)

    return () => clearInterval(interval)
  }, [pathname])

  return (
    <Script
      src="https://cdn.weglot.com/weglot.min.js"
      strategy="afterInteractive"
    />
  )
}
