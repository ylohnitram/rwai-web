import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST(request: Request) {
  try {
    const requestData = await request.json();
    const { email, password } = requestData;

    // Validate inputs
    if (!email || !password) {
      return NextResponse.json(
        { error: 'Email and password are required' },
        { status: 400 }
      );
    }

    // Create a new cookie store for this request
    const cookieStore = cookies();
    
    // Use the route handler client which is optimized for API routes
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });

    // Attempt to sign in
    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) {
      console.error('Authentication error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 401 }
      );
    }

    if (!data.user || !data.session) {
      return NextResponse.json(
        { error: 'User not found or session not created' },
        { status: 404 }
      );
    }

    // Check if user is admin
    const { data: profileData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', data.user.id)
      .single();

    if (profileError) {
      console.error('Profile error:', profileError.message);
      return NextResponse.json(
        { error: 'Error retrieving user profile' },
        { status: 500 }
      );
    }

    if (profileData?.role !== 'admin') {
      // Sign out the user if not an admin
      await supabase.auth.signOut();
      
      return NextResponse.json(
        { error: 'Access denied. Only administrators can access this area.' },
        { status: 403 }
      );
    }

    // Return success response with session information
    return NextResponse.json({
      success: true,
      message: 'Authentication successful',
      user: {
        id: data.user.id,
        email: data.user.email,
        role: profileData.role
      },
      // Include session expiry information for client-side handling
      session: {
        expires_at: data.session.expires_at
      }
    });
  } catch (err: any) {
    console.error('Unexpected error in login route:', err);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
