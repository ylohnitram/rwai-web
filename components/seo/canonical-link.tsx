// components/seo/canonical-link.tsx
"use client";

import { usePathname } from "next/navigation";
import Head from "next/head";

export default function CanonicalLink() {
  const pathname = usePathname();
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app";
  const canonicalUrl = `${baseUrl}${pathname}`;

  return (
    <Head>
      <link rel="canonical" href={canonicalUrl} />
    </Head>
  );
}
