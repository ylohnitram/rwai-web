import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import Link from "next/link"

interface BlogCardProps {
  title: string
  excerpt: string
  slug: string
  date: string
}

export default function BlogCard({ title, excerpt, slug, date }: BlogCardProps) {
  // Format date
  const formattedDate = new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })

  return (
    <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm hover:border-amber-500/30 transition-all overflow-hidden">
      <CardHeader className="pb-2">
        <CardTitle className="text-xl">{title}</CardTitle>
        <CardDescription className="flex items-center text-gray-400">
          <Calendar className="h-3 w-3 mr-1" />
          {formattedDate}
        </CardDescription>
      </CardHeader>
      <CardContent className="pb-6">
        <p className="text-gray-300">{excerpt}</p>
      </CardContent>
      <CardFooter>
        <Button
          asChild
          variant="outline"
          className="w-full border-gray-700 hover:border-amber-500 hover:text-amber-500"
        >
          <Link href={`/blog/${slug}`}>Read More</Link>
        </Button>
      </CardFooter>
    </Card>
  )
}

