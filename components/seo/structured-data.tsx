"use client";

import { useEffect } from "react";
import Script from "next/script";

interface StructuredDataProps {
  data: any;
  id: string;
}

export default function StructuredData({ data, id }: StructuredDataProps) {
  return (
    <Script
      id={id}
      type="application/ld+json"
      dangerouslySetInnerHTML={{ __html: JSON.stringify(data) }}
    />
  );
}

export function WebsiteSchema() {
  const websiteSchema = {
    "@context": "https://schema.org",
    "@type": "WebSite",
    "@id": "#website",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app/",
    "name": "TokenDirectory by RWA Investors",
    "description": "Discover 100+ professionally audited tokenized asset projects with transparent on-chain data and global access.",
    "publisher": {
      "@type": "Organization",
      "@id": "#organization",
      "name": "RWA Investors",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/public/placeholder-logo.svg`,
        "width": 215,
        "height": 48
      }
    }
  };

  return <StructuredData data={websiteSchema} id="website-schema" />;
}

export function OrganizationSchema() {
  const orgSchema = {
    "@context": "https://schema.org",
    "@type": "Organization",
    "@id": "#organization",
    "name": "RWA Investors",
    "url": process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app/",
    "logo": {
      "@type": "ImageObject",
      "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/public/placeholder-logo.svg`,
      "width": 215,
      "height": 48
    },
    "sameAs": [
      "https://twitter.com/rwainvestors",
      "https://linkedin.com/company/rwa-investors",
      "https://facebook.com/rwainvestors"
    ],
    "contactPoint": {
      "@type": "ContactPoint",
      "telephone": "+1-555-555-5555",
      "contactType": "customer service",
      "email": "support@rwa-directory.com"
    }
  };

  return <StructuredData data={orgSchema} id="organization-schema" />;
}

export function ProjectSchema({ project }: { project: any }) {
  const projectSchema = {
    "@context": "https://schema.org",
    "@type": "Product",
    "name": project.name,
    "description": project.description,
    "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/projects/${project.id}`,
    "brand": {
      "@type": "Brand",
      "name": project.name
    },
    "offers": {
      "@type": "Offer",
      "priceCurrency": "USD",
      "price": "0",
      "availability": "https://schema.org/InStock"
    },
    "aggregateRating": {
      "@type": "AggregateRating",
      "ratingValue": "4.5",
      "reviewCount": "89"
    }
  };

  return <StructuredData data={projectSchema} id="project-schema" />;
}

export function BlogPostSchema({ post }: { post: any }) {
  const blogSchema = {
    "@context": "https://schema.org",
    "@type": "BlogPosting",
    "headline": post.title,
    "description": post.excerpt,
    "author": {
      "@type": "Person",
      "name": post.author
    },
    "datePublished": post.date,
    "dateModified": post.updated_at || post.date,
    "publisher": {
      "@type": "Organization",
      "name": "RWA Investors",
      "logo": {
        "@type": "ImageObject",
        "url": `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/public/placeholder-logo.svg`,
        "width": 215,
        "height": 48
      }
    },
    "mainEntityOfPage": {
      "@type": "WebPage",
      "@id": `${process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"}/blog/${post.slug}`
    }
  };

  return <StructuredData data={blogSchema} id="blog-schema" />;
}

export function FAQSchema() {
  const faqSchema = {
    "@context": "https://schema.org",
    "@type": "FAQPage",
    "mainEntity": [
      {
        "@type": "Question",
        "name": "What are tokenized real-world assets (RWAs)?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "Tokenized real-world assets are physical assets like real estate, art, or commodities that have been represented as digital tokens on a blockchain. This allows for fractional ownership, increased liquidity, and programmable compliance."
        }
      },
      {
        "@type": "Question",
        "name": "How are projects verified on this platform?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "All projects undergo a thorough verification process that includes legal compliance checks, security audits, and verification of the underlying assets. Only projects that meet our strict criteria receive the \"Verified\" badge."
        }
      },
      {
        "@type": "Question",
        "name": "Are the ROI figures guaranteed?",
        "acceptedAnswer": {
          "@type": "Answer",
          "text": "No, the ROI figures listed are expected returns based on historical performance or project projections. All investments carry risk, and actual returns may vary. Always conduct your own research before investing."
        }
      }
    ]
  };

  return <StructuredData data={faqSchema} id="faq-schema" />;
}

export function BreadcrumbSchema({ items }: { items: {name: string, url: string}[] }) {
  const breadcrumbSchema = {
    "@context": "https://schema.org",
    "@type": "BreadcrumbList",
    "itemListElement": items.map((item, index) => ({
      "@type": "ListItem",
      "position": index + 1,
      "name": item.name,
      "item": item.url
    }))
  };

  return <StructuredData data={breadcrumbSchema} id="breadcrumb-schema" />;
}
