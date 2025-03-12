import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { getBlogPostBySlug, getBlogPosts } from "@/lib/services/blog-service"
import type { Metadata } from "next"
import { notFound } from "next/navigation"
import { BlogPostSchema, BreadcrumbSchema } from "@/components/seo/structured-data"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // Fetch all blog posts for static generation
  const blogPosts = await getBlogPosts({ limit: 100 });
  
  return blogPosts.map((post) => ({
    slug: post.slug,
  }));
}

export async function generateMetadata({ params }: BlogPostPageProps): Promise<Metadata> {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    return {
      title: "Blog Post Not Found | TokenDirectory",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app";
  const postUrl = `${baseUrl}/blog/${post.slug}`;

  return {
    title: `${post.title} | TokenDirectory by RWA Investors`,
    description: post.excerpt,
    authors: [{ name: post.author }],
    keywords: [...post.tags, "RWA", "tokenization", "blockchain", "investment"],
    alternates: {
      canonical: postUrl
    },
    openGraph: {
      title: post.title,
      description: post.excerpt,
      type: 'article',
      url: postUrl,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
      authors: [post.author],
      publishedTime: new Date(post.date).toISOString(),
      siteName: "TokenDirectory by RWA Investors",
      tags: post.tags,
    },
    twitter: {
      card: 'summary_large_image',
      title: post.title,
      description: post.excerpt,
      images: [`/api/og?title=${encodeURIComponent(post.title)}`],
      creator: '@rwainvestors',
    },
  }
}

export default async function BlogPostPage({ params }: BlogPostPageProps) {
  const post = await getBlogPostBySlug(params.slug);

  if (!post) {
    notFound();
  }

  // Generate breadcrumb items for structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app";
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Blog", url: `${baseUrl}/blog` },
    { name: post.title, url: `${baseUrl}/blog/${post.slug}` }
  ];

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mx-auto max-w-3xl">
        {/* Add structured data */}
        <BlogPostSchema post={post} />
        <BreadcrumbSchema items={breadcrumbItems} />

        <div className="mb-8">
          <Button asChild variant="outline" size="sm">
            <Link href="/blog">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back to Blog
            </Link>
          </Button>
        </div>

        <div className="mb-8">
          <div className="flex flex-wrap gap-2 mb-4">
            {post.tags.map((tag) => (
              <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                <Badge variant="outline" className="bg-gray-800 hover:bg-gray-700">
                  {tag}
                </Badge>
              </Link>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              <time dateTime={post.date}>
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </time>
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              <span itemProp="author">{post.author}</span>
            </div>
          </div>
        </div>

        <Card className="p-8 bg-gray-900 border-gray-800">
          <article className="prose prose-invert max-w-none">
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("# ")) {
                return (
                  <h1 key={i} className="text-3xl font-bold mt-8 mb-4" id={`heading-${i}`}>
                    {paragraph.substring(2)}
                  </h1>
                )
              } else if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-2xl font-bold mt-6 mb-3" id={`heading-${i}`}>
                    {paragraph.substring(3)}
                  </h2>
                )
              } else if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-xl font-bold mt-5 mb-2" id={`heading-${i}`}>
                    {paragraph.substring(4)}
                  </h3>
                )
              } else if (paragraph.startsWith("- ")) {
                return (
                  <ul key={i} className="list-disc pl-6 my-4">
                    {paragraph.split("\n- ").map((item, j) => (
                      <li key={j} className="mb-1">
                        {item.replace("- ", "")}
                      </li>
                    ))}
                  </ul>
                )
              } else if (paragraph.startsWith("1. ")) {
                return (
                  <ol key={i} className="list-decimal pl-6 my-4">
                    {paragraph.split("\n").map((item, j) => (
                      <li key={j} className="mb-1">
                        {item.replace(/^\d+\.\s/, "")}
                      </li>
                    ))}
                  </ol>
                )
              } else if (paragraph.startsWith("|")) {
                // Table rendering
                const rows = paragraph.split("\n")
                return (
                  <div key={i} className="overflow-x-auto my-6">
                    <table className="w-full border-collapse">
                      <thead>
                        <tr className="bg-gray-800 border-b border-gray-700">
                          {rows[0]
                            .split("|")
                            .filter(Boolean)
                            .map((cell, j) => (
                              <th key={j} className="py-2 px-4 text-left">
                                {cell.trim()}
                              </th>
                            ))}
                        </tr>
                      </thead>
                      <tbody>
                        {rows.slice(2).map((row, j) => (
                          <tr key={j} className="border-b border-gray-800 hover:bg-gray-800">
                            {row
                              .split("|")
                              .filter(Boolean)
                              .map((cell, k) => (
                                <td key={k} className="py-2 px-4">
                                  {cell.trim()}
                                </td>
                              ))}
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                )
              } else {
                return (
                  <p key={i} className="my-4">
                    {paragraph}
                  </p>
                )
              }
            })}
          </article>
        </Card>

        {/* Comments section */}
        <div className="mt-8">
          <h2 className="text-2xl font-bold mb-4">Comments</h2>
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <div className="text-center p-8">
              <p className="text-gray-400 mb-4">Comments are powered by Disqus</p>
              <Button variant="outline">Load Comments</Button>
            </div>
          </div>
        </div>

        {/* Related posts or share buttons section */}
        <div className="mt-8">
          <div className="flex flex-wrap gap-2 justify-center">
            <Button asChild variant="outline" size="sm">
              <a 
                href={`https://twitter.com/intent/tweet?text=${encodeURIComponent(post.title)}&url=${encodeURIComponent(`${baseUrl}/blog/${post.slug}`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Share on Twitter"
              >
                Share on Twitter
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a 
                href={`https://www.linkedin.com/sharing/share-offsite/?url=${encodeURIComponent(`${baseUrl}/blog/${post.slug}`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Share on LinkedIn"
              >
                Share on LinkedIn
              </a>
            </Button>
            <Button asChild variant="outline" size="sm">
              <a 
                href={`https://www.facebook.com/sharer/sharer.php?u=${encodeURIComponent(`${baseUrl}/blog/${post.slug}`)}`} 
                target="_blank" 
                rel="noopener noreferrer"
                aria-label="Share on Facebook"
              >
                Share on Facebook
              </a>
            </Button>
          </div>
        </div>
      </div>
    </div>
  )
}
