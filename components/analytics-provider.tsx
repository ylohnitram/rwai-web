"use client"

import { Suspense } from "react"
import dynamic from "next/dynamic"

// Dynamically import Google Analytics component with no SSR
const GoogleAnalytics = dynamic(() => import("./google-analytics"), {
  ssr: false,
})

export default function AnalyticsProvider({ GA_MEASUREMENT_ID }: { GA_MEASUREMENT_ID: string }) {
  return (
    <Suspense fallback={null}>
      <GoogleAnalytics GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />
    </Suspense>
  )
}
