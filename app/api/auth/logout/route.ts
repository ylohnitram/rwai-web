import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { NextResponse } from 'next/server';

export async function POST() {
  try {
    // Create a new cookie store
    const cookieStore = cookies();
    
    // Use the Supabase route handler client
    const supabase = createRouteHandlerClient({ cookies: () => cookieStore });
    
    // Sign out the user
    const { error } = await supabase.auth.signOut({ scope: 'global' });
    
    if (error) {
      console.error('Logout error:', error.message);
      return NextResponse.json(
        { error: error.message },
        { status: 500 }
      );
    }
    
    // Clear all cookies related to authentication
    const allCookies = cookieStore.getAll();
    for (const cookie of allCookies) {
      if (cookie.name.includes('supabase') || cookie.name.includes('auth')) {
        cookieStore.delete(cookie.name);
      }
    }
    
    return NextResponse.json({
      success: true,
      message: 'Logged out successfully'
    });
  } catch (error) {
    console.error('Unexpected error in logout route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred during logout' },
      { status: 500 }
    );
  }
}
