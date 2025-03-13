import { NextResponse } from "next/server";
import { getSupabaseClient } from "@/lib/supabase";
import { 
  getNetworks, 
  createNetwork, 
  networkExists 
} from "@/lib/services/network-service";
import { createRouteHandlerClient } from "@supabase/auth-helpers-nextjs";
import { cookies } from "next/headers";

/**
 * GET handler to fetch all networks
 */
export async function GET() {
  try {
    const data = await getNetworks();
    
    return NextResponse.json({
      data,
      success: true
    });
  } catch (error: any) {
    console.error("Error in GET /api/networks:", error);
    return NextResponse.json(
      { error: "Failed to fetch networks", message: error.message },
      { status: 500 }
    );
  }
}

/**
 * POST handler to create a new network
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
    const { name, description, icon } = await request.json();
    
    if (!name || typeof name !== "string") {
      return NextResponse.json(
        { error: "Invalid request", message: "Name is required" },
        { status: 400 }
      );
    }
    
    // Check if network already exists
    const exists = await networkExists(name);
    if (exists) {
      return NextResponse.json(
        { error: "Conflict", message: "Network with this name already exists" },
        { status: 409 }
      );
    }
    
    // Create new network
    const network = await createNetwork(
      name,
      description || `${name} blockchain network`,
      icon
    );
    
    return NextResponse.json({
      data: network,
      success: true
    }, { status: 201 });
  } catch (error: any) {
    console.error("Error in POST /api/networks:", error);
    return NextResponse.json(
      { error: "Failed to create network", message: error.message },
      { status: 500 }
    );
  }
}
