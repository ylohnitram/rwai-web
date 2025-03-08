import { createClient } from '@supabase/supabase-js';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    // Create a Supabase client with the service role key (admin privileges)
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || ''
    );
    
    // Update the project using the admin client
    // Use status="approved" instead of approved=true
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ status: "approved" })
      .eq('id', params.id)
      .select()
      .single();
      
    if (error) {
      console.error('Project approval error:', error);
      return NextResponse.json(
        { error: `Failed to approve project: ${error.message}` },
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
