'use server'

import { createServerComponentClient } from '@supabase/auth-helpers-nextjs'
import { cookies } from 'next/headers'
import { revalidatePath } from 'next/cache'

export async function approveProject(id: string) {
  try {
    console.log(`Approving project ${id} with server action`)
    
    const supabase = createServerComponentClient({ cookies })
    
    // Update the project status
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'approved' })
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
    
    const supabase = createServerComponentClient({ cookies })
    
    // Update the project status
    const { data, error } = await supabase
      .from('projects')
      .update({ status: 'rejected' })
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
    
    const supabase = createServerComponentClient({ cookies })
    
    // Update the project status and add notes
    const { data, error } = await supabase
      .from('projects')
      .update({ 
        status: 'changes_requested',
        review_notes: notes
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
