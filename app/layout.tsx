import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import NavWrapper from "@/app/nav-wrapper"
import Footer from "@/components/footer"
import AnalyticsProvider from "@/components/analytics-provider"

const inter = Inter({ subsets: ["latin"] })

// Get measurement ID from environment variable
const GA_MEASUREMENT_ID = process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID || ''

export const metadata: Metadata = {
  title: {
    default: "TokenDirectory | Audited RWA Projects for Investors",
    template: "%s | TokenDirectory by RWA Investors"
  },
  description: "TokenDirectory by RWA Investors – Discover 100+ professionally audited tokenized asset projects with transparent on-chain data and global access.",
  generator: 'v0.dev',
  applicationName: 'TokenDirectory',
  keywords: ['RWA', 'tokenized assets', 'real world assets', 'blockchain investments', 'RWA directory', 'tokenized real estate', 'tokenized art', 'tokenized commodities'],
  authors: [{ name: 'RWA Investors Team' }],
  creator: 'RWA Investors',
  publisher: 'RWA Investors',
  formatDetection: {
    email: false,
    address: false,
    telephone: false,
  },
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || 'https://rwa-directory.vercel.app'),
  alternates: {
    canonical: '/',
  },
  openGraph: {
    title: 'TokenDirectory | Audited RWA Projects for Investors',
    description: 'Discover 100+ professionally audited tokenized asset projects with transparent on-chain data and global access.',
    url: process.env.NEXT_PUBLIC_SITE_URL || 'https://rwa-directory.vercel.app',
    siteName: 'TokenDirectory',
    images: [
      {
        url: '/api/og?title=TokenDirectory',
        width: 1200,
        height: 630,
        alt: 'TokenDirectory - Tokenized Real-World Assets',
      },
    ],
    locale: 'en_US',
    type: 'website',
  },
  twitter: {
    card: 'summary_large_image',
    title: 'TokenDirectory | Audited RWA Projects for Investors',
    description: 'Discover 100+ professionally audited tokenized asset projects with transparent on-chain data.',
    images: ['/api/og?title=TokenDirectory'],
    creator: '@rwainvestors',
  },
  viewport: {
    width: 'device-width',
    initialScale: 1,
    maximumScale: 5,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: {
      index: true,
      follow: true,
      'max-image-preview': 'large',
      'max-video-preview': -1,
      'max-snippet': -1,
    },
  },
  verification: {
    // Add verification IDs when available
    google: 'google-site-verification-id-here',
    yandex: 'yandex-verification-id-here',
    yahoo: 'yahoo-verification-id-here',
    other: {
      me: ['support@rwa-directory.com'],
    },
  },
}

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} min-h-screen bg-[#0F172A] text-white`}>
        <NavWrapper />
        {children}
        <Footer />
        {GA_MEASUREMENT_ID && <AnalyticsProvider GA_MEASUREMENT_ID={GA_MEASUREMENT_ID} />}
      </body>
    </html>
  )
}
