import { cookies } from 'next/headers'
import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import Navbar from '@/components/navbar'

export default async function NavWrapper() {
  const cookieStore = cookies()
  const supabase = createServerComponentClient({ cookies: () => cookieStore })
  
  // Get session
  const { data: { session } } = await supabase.auth.getSession()
  
  let isAdmin = false
  
  // If session exists, check if user is admin
  if (session) {
    const { data } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single()
    
    isAdmin = data?.role === 'admin'
  }
  
  console.log('Server-side auth check: user is admin =', isAdmin)
  
  return <Navbar isAdmin={isAdmin} />
}
