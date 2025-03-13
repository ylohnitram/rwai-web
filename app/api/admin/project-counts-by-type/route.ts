import { NextResponse } from "next/server";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

export async function GET() {
  try {
    // Check admin authentication
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session } } = await supabase.auth.getSession();
    
    if (!session) {
      return NextResponse.json(
        { error: "Unauthorized", message: "Authentication required" },
        { status: 401 }
      );
    }
    
    // Check if user is admin
    const { data: profile } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
      
    if (!profile || profile.role !== "admin") {
      return NextResponse.json(
        { error: "Forbidden", message: "Admin role required" },
        { status: 403 }
      );
    }
    
    // Get all projects and count by type
    const { data: projects, error } = await supabase
      .from("projects")
      .select("type");
      
    if (error) {
      throw error;
    }
    
    // Count projects per asset type
    const counts: Record<string, number> = {};
    
    projects.forEach(project => {
      if (project.type) {
        counts[project.type] = (counts[project.type] || 0) + 1;
      }
    });
    
    return NextResponse.json({
      success: true,
      data: counts
    });
  } catch (error: any) {
    console.error("Error in project counts by type:", error);
    return NextResponse.json(
      { error: "Failed to get project counts", message: error.message },
      { status: 500 }
    );
  }
}
