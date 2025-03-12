// app/directory/layout.tsx
import type { Metadata } from "next"
import CanonicalLink from "@/components/seo/canonical-link"

export const metadata: Metadata = {
  title: "Project Directory | TokenDirectory by RWA Investors",
  description: "Browse and filter tokenized real-world assets from our curated directory of audited RWA investment projects.",
  openGraph: {
    title: "Project Directory | TokenDirectory by RWA Investors",
    description: "Browse and filter tokenized real-world assets from our curated directory of audited RWA investment projects.",
    url: `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/directory`,
    type: "website",
  },
  twitter: {
    card: "summary_large_image",
    title: "Project Directory | TokenDirectory by RWA Investors",
    description: "Browse and filter tokenized real-world assets from our curated directory.",
  },
}

export default function DirectoryLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <>
      <CanonicalLink />
      {children}
    </>
  )
}
