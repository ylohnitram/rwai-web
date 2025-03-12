import type { MetadataRoute } from "next"

export default function robots(): MetadataRoute.Robots {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"
  const isProduction = process.env.NODE_ENV === "production"

  return {
    rules: {
      userAgent: "*",
      allow: isProduction ? "/" : [],
      disallow: isProduction 
        ? ["/admin/", "/api/", "/login", "/setup", "/edit"] 
        : ["/"],
    },
    sitemap: `${baseUrl}/sitemap.xml`,
    host: baseUrl,
  }
}
