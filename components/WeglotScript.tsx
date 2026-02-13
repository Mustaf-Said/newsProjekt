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
          api_key: "wg_c94a0dce3d0d4ace070de57d7352b0304",
        })
      }}
    />
  )
}
