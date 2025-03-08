import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

// API endpoint to check if the user is authenticated and has admin privileges
export async function GET() {
  try {
    // Create a Supabase client for the server route handler
    const supabase = createRouteHandlerClient({ cookies });
    
    // Get the current session
    const { data: { session }, error: sessionError } = await supabase.auth.getSession();
    
    if (sessionError) {
      console.error('Session error:', sessionError);
      return NextResponse.json(
        { authenticated: false, error: 'Session error', message: sessionError.message },
        { status: 401 }
      );
    }
    
    if (!session) {
      return NextResponse.json(
        { authenticated: false, error: 'No active session', message: 'Please log in' },
        { status: 401 }
      );
    }
    
    // Check if the user has admin privileges
    const { data: userData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
    
    if (profileError) {
      console.error('Profile error:', profileError);
      return NextResponse.json(
        { authenticated: false, error: 'Profile error', message: 'Could not verify admin privileges' },
        { status: 500 }
      );
    }
    
    if (userData?.role !== 'admin') {
      return NextResponse.json(
        { authenticated: false, error: 'Insufficient privileges', message: 'Admin access required' },
        { status: 403 }
      );
    }
    
    // If we reach here, the user is authenticated and has admin privileges
    return NextResponse.json({
      authenticated: true,
      user: {
        id: session.user.id,
        email: session.user.email,
        role: userData.role
      }
    });
  } catch (error) {
    console.error('Unexpected error in auth check route:', error);
    return NextResponse.json(
      { authenticated: false, error: 'Server error', message: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
