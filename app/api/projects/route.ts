import { NextResponse } from "next/server"
import { getProjects } from "@/lib/services/project-service"

export async function GET(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const page = Number.parseInt(searchParams.get("page") || "1")
    const limit = Number.parseInt(searchParams.get("limit") || "10")
    const assetType = searchParams.get("assetType") || undefined
    const blockchain = searchParams.get("blockchain") || undefined
    const minRoi = searchParams.get("minRoi") ? Number.parseFloat(searchParams.get("minRoi") || "0") : undefined
    const maxRoi = searchParams.get("maxRoi") ? Number.parseFloat(searchParams.get("maxRoi") || "100") : undefined

    // Fetch projects using the service
    const { data: projects, count: total } = await getProjects({
      page,
      limit,
      assetType,
      blockchain,
      minRoi,
      maxRoi,
      approved: true, // Only return approved projects in the API
    })

    return NextResponse.json({
      data: projects,
      meta: {
        total,
        page,
        limit,
        totalPages: Math.ceil(total / limit),
      },
    })
  } catch (error) {
    console.error("Error in projects API route:", error)
    return NextResponse.json(
      { error: "Failed to fetch projects" },
      { status: 500 }
    )
  }
}
