import type React from "react"
import type { Metadata } from "next"
import { Inter } from "next/font/google"
import "./globals.css"
import NavWrapper from "@/app/nav-wrapper"
import Footer from "@/components/footer"

const inter = Inter({ subsets: ["latin"] })

export const metadata: Metadata = {
  title: "TokenDirectory | Audited RWA Projects for Investors",
  description: "TokenDirectory by RWA Investors – Discover 100+ professionally audited tokenized asset projects with transparent on-chain data and global access.",
  generator: 'v0.dev'
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
      </body>
    </html>
  )
}
