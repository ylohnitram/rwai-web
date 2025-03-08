import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  const projectId = params.id;
  console.log(`Approving project ID: ${projectId}`);

  try {
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
    
    // Update the project status to approved
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ status: 'approved' })
      .eq('id', projectId)
      .select();
    
    if (error) {
      console.error(`Error updating project: ${error.message}`);
      return NextResponse.json(
        { error: `Failed to approve project: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log(`Project approved successfully`);
    
    return NextResponse.json({
      success: true,
      message: "Project approved successfully",
      data
    });
  } catch (err: any) {
    console.error(`Unexpected error in approve: ${err.message}`);
    console.error(err.stack);
    
    return NextResponse.json(
      { error: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}
