"use client"

import { Card, CardContent, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import Link from "next/link"

interface ProjectCardProps {
  name: string
  type: string
  blockchain: string
  roi: number
  id: string
}

export default function ProjectCard({ name, type, blockchain, roi, id }: ProjectCardProps) {
  // Generate slug from project name
  const slug = name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
  
  return (
    <Link href={`/projects/${slug}`} className="block h-full">
      <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm hover:border-amber-500/30 transition-all h-full flex flex-col">
        <CardHeader className="pb-2">
          <div className="flex justify-between items-start">
            <CardTitle className="text-xl">{name}</CardTitle>
            <Badge className="bg-amber-500 hover:bg-amber-600 text-gray-900">{roi}% ROI</Badge>
          </div>
        </CardHeader>
        <CardContent className="pb-2 flex-grow">
          <div className="grid grid-cols-2 gap-2">
            <div>
              <p className="text-xs font-medium text-gray-400">Asset Type</p>
              <p className="text-sm">{type}</p>
            </div>
            <div>
              <p className="text-xs font-medium text-gray-400">Blockchain</p>
              <p className="text-sm">{blockchain}</p>
            </div>
          </div>
        </CardContent>
      </Card>
    </Link>
  )
}
