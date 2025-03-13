import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  getAssetTypes, 
  createAssetType, 
  assetTypeExists 
} from "@/lib/services/asset-type-service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * GET handler to fetch all asset types
 */
export async function GET() {
  try {
    const data = await getAssetTypes();
    
    return NextResponse.json({
      data,
      success: true
    });
  } catch (error: any) {
    console.error("Error in GET /api/asset-types:", error);
    return NextResponse.json(
      { error: "Failed to fetch asset types", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new asset type
 * Requires admin authentication
 */
export async function POST(request: Request) {
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
    
    // Parse request body
    const { name, description } = await request.json();
    
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid request", message: "Name is required" },
        { status: 400 }
      );
    }
    
    // Check if asset type already exists
    const exists = await assetTypeExists(name);
    if (exists) {
      return NextResponse.json(
        { error: "Conflict", message: "Asset type with this name already exists" },
        { status: 409 }
      );
    }
    
    // Create new asset type
    const assetType = await createAssetType(
      name,
      description || `Tokenized ${name.toLowerCase()} assets`
    );
    
    return NextResponse.json({
      data: assetType,
      success: true
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/asset-types:", error);
    return NextResponse.json(
      { error: "Failed to create asset type", message: error.message },
      { status: 500 }
    );
  }
}
