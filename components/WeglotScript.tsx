"use client"

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
