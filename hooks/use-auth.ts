// hooks/use-auth.ts

import { useState, useEffect } from 'react'
import { getSupabaseClient } from '@/lib/supabase'
import type { User } from '@/types/auth'

export function useAuth() {
  const [user, setUser] = useState<User | null>(null)
  const [isAdmin, setIsAdmin] = useState(false)
  const [isLoading, setIsLoading] = useState(true)

  useEffect(() => {
    const checkAuth = async () => {
      setIsLoading(true)
      try {
        const supabase = getSupabaseClient()
        
        // Check session
        const { data: { session } } = await supabase.auth.getSession()
        
        if (!session) {
          setUser(null)
          setIsAdmin(false)
          return
        }
        
        // Get user profile with role
        const { data: profile, error } = await supabase
          .from('profiles')
          .select('id, email, role')
          .eq('id', session.user.id)
          .single()
          
        if (error || !profile) {
          console.error('Error fetching user profile:', error)
          setUser(null)
          setIsAdmin(false)
          return
        }
        
        setUser(profile as User)
        setIsAdmin(profile.role === 'admin')
      } catch (error) {
        console.error('Auth error:', error)
        setUser(null)
        setIsAdmin(false)
      } finally {
        setIsLoading(false)
      }
    }
    
    checkAuth()
    
    // Set up auth state change listener
    const supabase = getSupabaseClient()
    const { data: { subscription } } = supabase.auth.onAuthStateChange(() => {
      checkAuth()
    })
    
    return () => {
      subscription.unsubscribe()
    }
  }, [])
  
  return { user, isAdmin, isLoading }
}
