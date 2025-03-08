import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const { requestNotes } = await request.json();
    
    // Create a Supabase client with the service role key (admin privileges)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Update the project with review notes using the admin client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        review_notes: requestNotes,
        review_status: 'changes_requested' 
      })
      .eq('id', params.id)
      .select()
      .single();
      
    if (error) {
      console.error('Project request changes error:', error);
      return NextResponse.json(
        { error: `Failed to request changes: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true, data });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}
