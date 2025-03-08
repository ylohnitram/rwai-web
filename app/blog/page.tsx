import Link from "next/link"
import { Calendar } from "lucide-react"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { getBlogPosts, getAllBlogTags } from "@/lib/services/blog-service"

export const metadata = {
  title: "Blog | TokenDirectory by RWA Investors",
  description: "Latest insights on RWA tokenization and investment opportunities in the real-world asset space.",
}

interface BlogPageProps {
  searchParams: {
    page?: string;
    tag?: string;
  }
}

export default async function BlogPage({ searchParams }: BlogPageProps) {
  const page = Number.parseInt(searchParams.page || "1")
  const tag = searchParams.tag || undefined
  
  // Fetch blog posts from database
  const blogPosts = await getBlogPosts({
    page,
    limit: 9,
    tag,
  })

  // Fetch all tags for filtering
  const allTags = await getAllBlogTags()

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Blog</h1>
          <p className="text-gray-400">Latest insights on RWA tokenization and investment</p>
        </div>
        
        {/* Tag filter dropdown could be added here */}
        {tag && (
          <div className="mt-4 md:mt-0">
            <Badge className="mr-2">{tag}</Badge>
            <Button asChild variant="outline" size="sm">
              <Link href="/blog">Clear Filter</Link>
            </Button>
          </div>
        )}
      </div>

      {/* Tags list */}
      {!tag && allTags.length > 0 && (
        <div className="mb-8">
          <div className="flex flex-wrap gap-2">
            {allTags.map((tagName) => (
              <Link key={tagName} href={`/blog?tag=${encodeURIComponent(tagName)}`}>
                <Badge variant="outline" className="bg-gray-800 hover:bg-gray-700 cursor-pointer">
                  {tagName}
                </Badge>
              </Link>
            ))}
          </div>
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
        {blogPosts.map((post) => (
          <Card key={post.slug} className="bg-gray-900 border-gray-800 overflow-hidden">
            <CardHeader>
              <div className="flex flex-wrap gap-2 mb-2">
                {post.tags.map((tag) => (
                  <Link key={tag} href={`/blog?tag=${encodeURIComponent(tag)}`}>
                    <Badge variant="outline" className="bg-gray-800 hover:bg-gray-700">
                      {tag}
                    </Badge>
                  </Link>
                ))}
              </div>
              <CardTitle className="text-xl">{post.title}</CardTitle>
              <CardDescription className="flex items-center text-gray-400">
                <Calendar className="h-3 w-3 mr-1" />
                {new Date(post.date).toLocaleDateString("en-US", {
                  year: "numeric",
                  month: "long",
                  day: "numeric",
                })}
              </CardDescription>
            </CardHeader>
            <CardContent className="pb-6">
              <p className="text-gray-300">{post.excerpt}</p>
            </CardContent>
            <CardFooter>
              <Button asChild variant="outline" className="w-full">
                <Link href={`/blog/${post.slug}`}>Read Article</Link>
              </Button>
            </CardFooter>
          </Card>
        ))}
      </div>
      
      {/* Pagination could be added here */}
      {blogPosts.length === 0 && (
        <div className="text-center py-12">
          <h3 className="text-xl font-semibold mb-2">No blog posts found</h3>
          {tag ? (
            <p className="text-gray-400 mb-4">No posts found with the tag "{tag}".</p>
          ) : (
            <p className="text-gray-400 mb-4">Check back soon for new content.</p>
          )}
          {tag && (
            <Button asChild>
              <Link href="/blog">View All Posts</Link>
            </Button>
          )}
        </div>
      )}
    </div>
  )
}
