"use client"

import Script from "next/script"

declare global {
  interface Window {
    Weglot?: any
  }
}

export default function WeglotScript() {
  return (
    <Script
      src="https://cdn.weglot.com/weglot.min.js"
      strategy="afterInteractive"
      onLoad={() => {
        window.Weglot.initialize({
          api_key: "wg_198fe66593c57ca32991fd1e418925e9"
        })
      }}
    />
  )
}
