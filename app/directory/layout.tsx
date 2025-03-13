import type { Metadata } from "next"

export const metadata: Metadata = {
  title: "Project Directory | TokenDirectory by RWA Investors",
  description: "Browse and filter tokenized real-world assets from our curated directory of audited RWA investment projects.",
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
