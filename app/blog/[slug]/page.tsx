import Link from "next/link"
import { ArrowLeft, Calendar, User } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card } from "@/components/ui/card"
import { blogPosts } from "@/data/blog-posts"
import type { Metadata } from "next"

interface BlogPostPageProps {
  params: {
    slug: string
  }
}

export function generateMetadata({ params }: BlogPostPageProps): Metadata {
  const post = blogPosts.find((post) => post.slug === params.slug)

  if (!post) {
    return {
      title: "Blog Post Not Found | TokenDirectory",
    }
  }

  return {
    title: `${post.title} | TokenDirectory by RWA Investors`,
    description: post.excerpt,
  }
}

export default function BlogPostPage({ params }: BlogPostPageProps) {
  const post = blogPosts.find((post) => post.slug === params.slug)

  if (!post) {
    return (
      <div className="container py-16 px-4 md:px-6 text-center">
        <h1 className="text-3xl font-bold mb-4">Blog Post Not Found</h1>
        <p className="text-gray-400 mb-8">The article you are looking for does not exist or has been removed.</p>
        <Button asChild>
          <Link href="/blog">
            <ArrowLeft className="mr-2 h-4 w-4" />
            Back to Blog
          </Link>
        </Button>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mx-auto max-w-3xl">
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
              <Badge key={tag} variant="outline" className="bg-gray-800 hover:bg-gray-700">
                {tag}
              </Badge>
            ))}
          </div>
          <h1 className="text-3xl md:text-4xl font-bold">{post.title}</h1>
          <div className="flex items-center gap-4 mt-4 text-gray-400">
            <div className="flex items-center">
              <Calendar className="h-4 w-4 mr-1" />
              {new Date(post.date).toLocaleDateString("en-US", {
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </div>
            <div className="flex items-center">
              <User className="h-4 w-4 mr-1" />
              {post.author}
            </div>
          </div>
        </div>

        <Card className="p-8 bg-gray-900 border-gray-800">
          <div className="prose prose-invert max-w-none">
            {post.content.split("\n\n").map((paragraph, i) => {
              if (paragraph.startsWith("# ")) {
                return (
                  <h1 key={i} className="text-3xl font-bold mt-8 mb-4">
                    {paragraph.substring(2)}
                  </h1>
                )
              } else if (paragraph.startsWith("## ")) {
                return (
                  <h2 key={i} className="text-2xl font-bold mt-6 mb-3">
                    {paragraph.substring(3)}
                  </h2>
                )
              } else if (paragraph.startsWith("### ")) {
                return (
                  <h3 key={i} className="text-xl font-bold mt-5 mb-2">
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
          </div>
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
      </div>
    </div>
  )
}
