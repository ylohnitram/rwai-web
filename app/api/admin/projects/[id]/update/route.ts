import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const requestData = await request.json();
    const { approved } = requestData;
    
    // Create a Supabase client with the service role key
    const supabaseAdmin = createClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL || '',
      process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    );
    
    // Update the project using the admin client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ approved })
      .eq('id', params.id)
      .select()
      .single();
      
    if (error) {
      console.error('Project update error:', error);
      return NextResponse.json(
        { error: `Failed to update project: ${error.message}` },
        { status: 500 }
      );
    }
    
    return NextResponse.json({ data });
  } catch (err: any) {
    console.error('Unexpected error:', err);
    return NextResponse.json(
      { error: `An unexpected error occurred: ${err.message}` },
      { status: 500 }
    );
  }
}

// Import the createClient function at the top
import { createClient } from '@supabase/supabase-js';
