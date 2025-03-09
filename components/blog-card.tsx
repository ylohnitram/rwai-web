import { Calendar } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
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
    <Link href={`/blog/${slug}`} className="block h-full">
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm hover:border-amber-500/30 transition-all h-full flex flex-col">
        <CardHeader className="pb-2">
          <CardTitle className="text-xl">{title}</CardTitle>
          <CardDescription className="flex items-center text-gray-400">
            <Calendar className="h-3 w-3 mr-1" />
            {formattedDate}
          </CardDescription>
        </CardHeader>
        <CardContent className="pb-6 flex-grow">
          <p className="text-gray-300">{excerpt}</p>
        </CardContent>
      </Card>
    </Link>
  )
}
