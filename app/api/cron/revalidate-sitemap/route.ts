import { NextResponse } from "next/server"
import { revalidatePath } from "next/cache"

// Protect this route from unauthorized access
export const runtime = 'edge'

export async function GET(request: Request) {
  const authHeader = request.headers.get("authorization")
  const cron_secret = process.env.CRON_SECRET

  // Verify secret to prevent unauthorized access
  if (authHeader !== `Bearer ${cron_secret}`) {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 })
  }

  try {
    // Revalidate the sitemap
    revalidatePath("/sitemap.xml")
    
    // Log successful revalidation
    console.log('Sitemap revalidated at:', new Date().toISOString())
    
    return NextResponse.json({
      revalidated: true,
      message: "Sitemap revalidated successfully",
      timestamp: new Date().toISOString()
    })
  } catch (error) {
    console.error('Error revalidating sitemap:', error)
    return NextResponse.json(
      {
        revalidated: false,
        message: "Error revalidating sitemap",
        error: String(error)
      },
      { status: 500 }
    )
  }
}
