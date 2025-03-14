import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Project Directory | TokenDirectory by RWA Investors",
  description: "Browse and filter tokenized real-world assets from our curated directory of audited RWA investment projects.",
  openGraph: {
    title: "Project Directory | TokenDirectory by RWA Investors",
    description: "Browse and filter tokenized real-world assets from our curated directory of audited RWA investment projects.",
    images: ['/og-images/projects.jpg'],
  },
  twitter: {
    card: 'summary_large_image',
    title: "Project Directory | TokenDirectory by RWA Investors", 
    description: "Browse and filter tokenized real-world assets from our curated directory of audited RWA investment projects.",
    images: ['/og-images/projects.jpg'],
  }
}

export default function DirectoryLayout({
  children,
}: Readonly<{
  children: React.ReactNode
}>) {
  return (
    <>
      {children}
    </>
  )
}
