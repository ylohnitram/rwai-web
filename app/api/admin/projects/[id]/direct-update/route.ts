import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { createClient } from '@supabase/supabase-js';
import { Pool } from 'pg';

// Create a direct PostgreSQL connection pool
// This bypasses Supabase's RLS entirely
const pool = new Pool({
  connectionString: process.env.POSTGRES_CONNECTION_STRING,
  ssl: {
    rejectUnauthorized: false
  }
});

// Create a Supabase client with the service role key as fallback
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
    
    // First, try to use direct PostgreSQL connection
    try {
      // Get a client from the pool
      const client = await pool.connect();
      
      try {
        // Start a transaction
        await client.query('BEGIN');
        
        // Update the project directly with SQL to bypass all RLS
        const updateQuery = `
          UPDATE public.projects 
          SET 
            status = $1, 
            review_notes = $2, 
            reviewer_id = $3, 
            reviewed_at = NOW(),
            approved = $4
          WHERE id = $5
          RETURNING *;
        `;
        
        // Execute the update
        const result = await client.query(updateQuery, [
          status, 
          review_notes, 
          session.user.id,
          status === 'approved', // Set approved to true if status is 'approved'
          projectId
        ]);
        
        // Commit the transaction
        await client.query('COMMIT');
        
        // Check if any rows were updated
        if (result.rowCount === 0) {
          return NextResponse.json(
            { error: "Project not found" },
            { status: 404 }
          );
        }
        
        // Return the updated project
        return NextResponse.json({
          message: `Project ${status.replace('_', ' ')} successfully`,
          project: result.rows[0]
        });
      } catch (dbError: any) {
        // Rollback in case of error
        await client.query('ROLLBACK');
        console.error('Database operation error:', dbError);
        
        // Try fallback method if direct DB access fails
        throw dbError;
      } finally {
        // Release the client back to the pool
        client.release();
      }
    } catch (directDbError) {
      console.error('Direct DB access failed, trying Supabase service role:', directDbError);
      
      // Fallback to Supabase service role approach
      // Get the project first to check if it exists
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
      
      return NextResponse.json({
        message: `Project ${status.replace('_', ' ')} successfully using fallback method`,
        project: updatedProject
      });
    }
  } catch (error: any) {
    console.error('Error processing project update:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
