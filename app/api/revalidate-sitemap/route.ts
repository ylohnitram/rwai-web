import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")

  // Check for valid authorization
  if (authHeader !== `Bearer ${process.env.REVALIDATION_TOKEN}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Revalidate the sitemap
    revalidatePath("/sitemap.xml")

    return NextResponse.json({
      revalidated: true,
      message: "Sitemap revalidated successfully",
    })
  } catch (error) {
    return NextResponse.json(
      {
        revalidated: false,
        message: "Error revalidating sitemap",
      },
      { status: 500 },
    )
  }
}

