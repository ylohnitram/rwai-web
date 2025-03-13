import { NextResponse } from "next/server";
import { 
  getAssetTypeById, 
  updateAssetType, 
  deleteAssetType, 
  assetTypeExists 
} from "@/lib/services/asset-type-service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

// Helper function to check if user is admin
async function checkAdmin() {
  const supabase = createRouteHandlerClient({ cookies });
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    return { isAdmin: false, error: "Unauthorized", status: 401 };
  }
  
  const { data: profile, error } = await supabase
    .from("profiles")
    .select("role")
    .eq("id", session.user.id)
    .single();
    
  if (error || !profile) {
    return { isAdmin: false, error: "Error fetching profile", status: 500 };
  }
  
  if (profile.role !== "admin") {
    return { isAdmin: false, error: "Admin access required", status: 403 };
  }
  
  return { isAdmin: true, userId: session.user.id };
}

/**
 * GET handler to fetch a single asset type by ID
 */
export async function GET(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    const assetType = await getAssetTypeById(id);
    
    if (!assetType) {
      return NextResponse.json(
        { error: "Asset type not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      data: assetType,
      success: true
    });
  } catch (error: any) {
    console.error(`Error in GET /api/asset-types/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch asset type", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update an asset type
 * Requires admin authentication
 */
export async function PUT(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const { isAdmin, error, status, userId } = await checkAdmin();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error, message: "Authentication failed" },
        { status }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // Check if asset type exists
    const existingType = await getAssetTypeById(id);
    
    if (!existingType) {
      return NextResponse.json(
        { error: "Asset type not found" },
        { status: 404 }
      );
    }
    
    // Parse request body
    const { name, description } = await request.json();
    
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    // Check if new name conflicts with existing asset type (but not itself)
    if (name !== existingType.name) {
      const exists = await assetTypeExists(name);
      if (exists) {
        return NextResponse.json(
          { error: "Asset type with this name already exists" },
          { status: 409 }
        );
      }
    }
    
    // Update asset type
    const assetType = await updateAssetType(id, {
      name,
      description: description || existingType.description
    });
    
    return NextResponse.json({
      data: assetType,
      success: true
    });
  } catch (error: any) {
    console.error(`Error in PUT /api/asset-types/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update asset type", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove an asset type
 * Requires admin authentication
 */
export async function DELETE(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Check admin authentication
    const { isAdmin, error, status } = await checkAdmin();
    
    if (!isAdmin) {
      return NextResponse.json(
        { error, message: "Authentication failed" },
        { status }
      );
    }
    
    const id = parseInt(params.id);
    
    if (isNaN(id)) {
      return NextResponse.json(
        { error: "Invalid ID format" },
        { status: 400 }
      );
    }
    
    // Check if asset type exists
    const existingType = await getAssetTypeById(id);
    
    if (!existingType) {
      return NextResponse.json(
        { error: "Asset type not found" },
        { status: 404 }
      );
    }
    
    // Delete asset type
    await deleteAssetType(id);
    
    return NextResponse.json({
      success: true,
      message: "Asset type deleted successfully"
    });
  } catch (error: any) {
    console.error(`Error in DELETE /api/asset-types/${params.id}:`, error);
    
    // Handle database constraint errors (in case the asset type is being used)
    if (error.code === '23503') {
      return NextResponse.json(
        { 
          error: "Cannot delete this asset type because it is being used by existing projects",
          code: error.code,
          message: error.message
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete asset type", message: error.message },
      { status: 500 }
    );
  }
}
