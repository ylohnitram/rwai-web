'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'
import { createClient } from '@supabase/supabase-js'

// Create a Supabase admin client that bypasses RLS
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || ''
)

export async function approveProject(id: string) {
  try {
    console.log(`Approving project ${id} with server action`)
    
    // Use the admin client instead of the server component client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'approved',
        approved: true, // For backwards compatibility
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error approving project:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate the admin path to refresh the UI
    revalidatePath('/admin')
    
    return { success: true, data }
  } catch (error: any) {
    console.error('Error in approveProject:', error)
    return { success: false, error: error.message }
  }
}

export async function rejectProject(id: string) {
  try {
    console.log(`Rejecting project ${id} with server action`)
    
    // Use the admin client instead of the server component client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'rejected',
        approved: false, // For backwards compatibility
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error rejecting project:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate the admin path to refresh the UI
    revalidatePath('/admin')
    
    return { success: true, data }
  } catch (error: any) {
    console.error('Error in rejectProject:', error)
    return { success: false, error: error.message }
  }
}

export async function requestChanges(id: string, notes: string) {
  try {
    console.log(`Requesting changes for project ${id} with server action`)
    
    if (!notes || notes.trim() === '') {
      return { success: false, error: 'Notes are required for requesting changes' }
    }
    
    // Use the admin client instead of the server component client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'changes_requested',
        approved: false, // For backwards compatibility
        review_notes: notes,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error requesting changes:', error)
      return { success: false, error: error.message }
    }
    
    // Revalidate the admin path to refresh the UI
    revalidatePath('/admin')
    
    return { success: true, data }
  } catch (error: any) {
    console.error('Error in requestChanges:', error)
    return { success: false, error: error.message }
  }
}
