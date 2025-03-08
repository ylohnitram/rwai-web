import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';

// Create a Supabase client with the service role key
// This bypasses RLS policies completely
const adminSupabase = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
);

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const requestData = await request.json();
    const { status, review_notes } = requestData;
    
    // Validate the status
    if (!['approved', 'rejected', 'changes_requested'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }
    
    // If requesting changes, notes are required
    if (status === 'changes_requested' && (!review_notes || review_notes.trim() === '')) {
      return NextResponse.json(
        { error: "Notes are required when requesting changes" },
        { status: 400 }
      );
    }

    // Verify that the user is authenticated and is an admin
    // We still do this check even though we're using the service role
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }
    
    const { data: userData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (profileError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
    
    // Get the project first to check if it exists and get contact email
    const { data: project, error: projectFetchError } = await adminSupabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectFetchError || !project) {
      return NextResponse.json(
        { error: projectFetchError ? projectFetchError.message : "Project not found" },
        { status: 404 }
      );
    }
    
    // Update the project using the service role client
    const { data: updatedProject, error: updateError } = await adminSupabase
      .from('projects')
      .update({
        status,
        review_notes,
        reviewer_id: session.user.id,
        reviewed_at: new Date().toISOString(),
        approved: status === 'approved' // For backward compatibility
      })
      .eq('id', projectId)
      .select()
      .single();
    
    if (updateError) {
      console.error("Update error details:", updateError);
      return NextResponse.json(
        { error: `Failed to update project: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    // Optional: Add notification logic here
    // But for now, just return success
    
    return NextResponse.json({
      message: `Project ${status.replace('_', ' ')} successfully`,
      project: updatedProject
    });
    
  } catch (error: any) {
    console.error('Error processing project update:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
