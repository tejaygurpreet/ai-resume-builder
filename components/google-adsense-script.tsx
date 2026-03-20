"use client";

import Script from "next/script";

const ADSENSE_SRC =
  "https://pagead2.googlesyndication.com/pagead/js/adsbygoogle.js?client=ca-pub-7184226380752555";

/**
 * Google AdSense loader — production only. Async load; failures are non-blocking.
 */
export function GoogleAdSenseScript() {
  if (process.env.NODE_ENV !== "production") {
    return null;
  }

  return (
    <Script
      id="google-adsense"
      strategy="afterInteractive"
      src={ADSENSE_SRC}
      crossOrigin="anonymous"
      onError={() => {
        console.warn("[OptimaCV] Google AdSense failed to load (ignored, site continues normally).");
      }}
    />
  );
}
