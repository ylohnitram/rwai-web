import { NextResponse } from "next/server"
import { projects } from "@/data/projects"

export async function GET(req: Request) {
  const { searchParams } = new URL(req.url)
  const page = Number.parseInt(searchParams.get("page") || "1")
  const limit = Number.parseInt(searchParams.get("limit") || "10")
  const assetType = searchParams.get("assetType")
  const blockchain = searchParams.get("blockchain")
  const minRoi = Number.parseFloat(searchParams.get("minRoi") || "0")
  const maxRoi = Number.parseFloat(searchParams.get("maxRoi") || "100")

  // Filter projects
  const filteredProjects = projects.filter((project) => {
    const matchesAssetType = !assetType || assetType === "all-types" || project.type === assetType
    const matchesBlockchain = !blockchain || blockchain === "all-blockchains" || project.blockchain === blockchain
    const matchesRoi = project.roi >= minRoi && project.roi <= maxRoi
    return matchesAssetType && matchesBlockchain && matchesRoi && project.approved
  })

  // Paginate
  const startIndex = (page - 1) * limit
  const endIndex = startIndex + limit
  const paginatedProjects = filteredProjects.slice(startIndex, endIndex)

  return NextResponse.json({
    data: paginatedProjects,
    meta: {
      total: filteredProjects.length,
      page,
      limit,
      totalPages: Math.ceil(filteredProjects.length / limit),
    },
  })
}

