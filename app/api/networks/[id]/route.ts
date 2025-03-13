import { NextResponse } from "next/server";
import { 
  getNetworkById, 
  updateNetwork, 
  deleteNetwork, 
  networkExists 
} from "@/lib/services/network-service";
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
 * GET handler to fetch a single network by ID
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
    
    const network = await getNetworkById(id);
    
    if (!network) {
      return NextResponse.json(
        { error: "Network not found" },
        { status: 404 }
      );
    }
    
    return NextResponse.json({
      data: network,
      success: true
    });
  } catch (error: any) {
    console.error(`Error in GET /api/networks/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to fetch network", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * PUT handler to update a network
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
    
    // Check if network exists
    const existingNetwork = await getNetworkById(id);
    
    if (!existingNetwork) {
      return NextResponse.json(
        { error: "Network not found" },
        { status: 404 }
      );
    }
    
    // Parse request body
    const { name, description, icon } = await request.json();
    
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Name is required" },
        { status: 400 }
      );
    }
    
    // Check if new name conflicts with existing network (but not itself)
    if (name !== existingNetwork.name) {
      const exists = await networkExists(name);
      if (exists) {
        return NextResponse.json(
          { error: "Network with this name already exists" },
          { status: 409 }
        );
      }
    }
    
    // Update network
    const network = await updateNetwork(id, {
      name,
      description: description || existingNetwork.description,
      icon
    });
    
    return NextResponse.json({
      data: network,
      success: true
    });
  } catch (error: any) {
    console.error(`Error in PUT /api/networks/${params.id}:`, error);
    return NextResponse.json(
      { error: "Failed to update network", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * DELETE handler to remove a network
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
    
    // Check if network exists
    const existingNetwork = await getNetworkById(id);
    
    if (!existingNetwork) {
      return NextResponse.json(
        { error: "Network not found" },
        { status: 404 }
      );
    }
    
    // Delete network
    await deleteNetwork(id);
    
    return NextResponse.json({
      success: true,
      message: "Network deleted successfully"
    });
  } catch (error: any) {
    console.error(`Error in DELETE /api/networks/${params.id}:`, error);
    
    // Handle database constraint errors (in case the network is being used)
    if (error.code === '23503') {
      return NextResponse.json(
        { 
          error: "Cannot delete this network because it is being used by existing projects",
          code: error.code,
          message: error.message
        },
        { status: 409 }
      );
    }
    
    return NextResponse.json(
      { error: "Failed to delete network", message: error.message },
      { status: 500 }
    );
  }
}
