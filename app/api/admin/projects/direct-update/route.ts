import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(
  request: Request
) {
  try {
    // Get request data
    const data = await request.json();
    const { id, action, notes } = data;
    
    if (!id || !action) {
      return NextResponse.json({ 
        error: "Missing required parameters: id and action" 
      }, { status: 400 });
    }
    
    console.log(`Admin action for project ${id}, action: ${action}`);
    
    // Get the project first to check if it exists
    const { data: project, error: fetchError } = await supabaseAdmin
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching project: ${fetchError.message}`);
      return NextResponse.json(
        { error: `Project not found: ${fetchError.message}` },
        { status: 404 }
      );
    }
    
    console.log(`Project found: ${project.name}`);
    
    // Perform the action
    let result;
    
    switch (action) {
      case 'approve':
        result = await supabaseAdmin
          .from("projects")
          .update({ status: "approved" })
          .eq("id", id)
          .select()
          .single();
        break;
      
      case 'reject':
        result = await supabaseAdmin
          .from("projects")
          .update({ status: "rejected" })
          .eq("id", id)
          .select()
          .single();
        break;
      
      case 'request-changes':
        if (!notes) {
          return NextResponse.json({ 
            error: "Notes are required for request-changes action" 
          }, { status: 400 });
        }
        
        result = await supabaseAdmin
          .from("projects")
          .update({ 
            status: "changes_requested",
            review_notes: notes
          })
          .eq("id", id)
          .select()
          .single();
        break;
      
      default:
        return NextResponse.json({ 
          error: "Invalid action. Must be 'approve', 'reject', or 'request-changes'" 
        }, { status: 400 });
    }
    
    if (result.error) {
      console.error(`Error updating project: ${result.error.message}`);
      return NextResponse.json(
        { error: `Failed to ${action} project: ${result.error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Project ${action} successful`);
    
    // Return success
    return NextResponse.json({
      success: true,
      message: `Project ${action === 'approve' ? 'approved' : action === 'reject' ? 'rejected' : 'changes requested'} successfully`,
      data: result.data
    });
  } catch (err: any) {
    console.error(`Error in admin action: ${err.message}`);
    console.error(err.stack);
    
    return NextResponse.json({ 
      error: `Server error: ${err.message}` 
    }, { status: 500 });
  }
}
