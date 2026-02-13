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
    if (window.Weglot && window.Weglot.refresh) {
      window.Weglot.refresh()
    }
  }, [pathname])

  return (
    <Script
      src="https://cdn.weglot.com/weglot.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.Weglot.initialize({
          api_key: 'wg_198fe66593c57ca32991fd1e418925e92',
        })
      }}
    />
  )
}
