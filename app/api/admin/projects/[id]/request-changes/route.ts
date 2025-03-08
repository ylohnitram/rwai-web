import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  console.log(`Request changes for project ID: ${projectId}`);

  try {
    // Parse the request body
    const body = await request.json();
    const { requestNotes } = body;
    
    console.log(`Request notes: ${requestNotes}`);
    
    if (!requestNotes || requestNotes.trim() === '') {
      console.error('No request notes provided');
      return NextResponse.json(
        { error: "Request notes are required" },
        { status: 400 }
      );
    }

    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Get the project first to make sure it exists
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (fetchError) {
      console.error(`Error fetching project: ${fetchError.message}`);
      return NextResponse.json(
        { error: `Project not found: ${fetchError.message}` },
        { status: 404 }
      );
    }
    
    console.log(`Project found: ${project.name}`);
    
    // Update the project with status and review notes
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'changes_requested',
        review_notes: requestNotes
      })
      .eq('id', projectId)
      .select();
    
    if (error) {
      console.error(`Error updating project: ${error.message}`);
      return NextResponse.json(
        { error: `Failed to request changes: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Project updated successfully`);
    
    return NextResponse.json({
      success: true,
      message: "Changes requested successfully",
      data
    });
  } catch (err: any) {
    console.error(`Unexpected error in request-changes: ${err.message}`);
    console.error(err.stack);
    
    return NextResponse.json(
      { error: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}
