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
    
    // Instead of deleting, update status to "rejected" 
    const { error } = await supabaseAdmin
      .from('projects')
      .update({ status: "rejected" })
      .eq('id', params.id);
      
    if (error) {
      console.error('Project rejection error:', error);
      return NextResponse.json(
        { error: `Failed to reject project: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ success: true });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}
