'use server'

import { createClient } from '@supabase/supabase-js'
import { revalidatePath } from 'next/cache'
import { ProjectValidation } from '@/lib/services/validation-service'
import { 
  sendProjectApprovalEmail, 
  sendProjectRejectionEmail, 
  sendRequestChangesEmail 
} from '@/lib/services/email-service';

// Create a Supabase admin client with the service role key
const supabaseAdmin = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
)

// Function to log admin actions
async function logAdminAction(
  action: string,
  projectId: string,
  projectName: string,
  adminId: string,
  status?: string
) {
  try {
    await supabaseAdmin
      .from('admin_activities')
      .insert({
        action,
        project_id: projectId,
        project_name: projectName,
        admin_id: adminId,
        status
      })
  } catch (error) {
    console.error('Error logging admin action:', error)
    // Continue even if logging fails
  }
}

export async function approveProject(id: string) {
  try {
    console.log(`Approving project ${id} with server action`)
    
    // First get project info to get contact email
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('name, contact_email')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching project info:', fetchError)
      return { success: false, error: fetchError.message }
    }
    
    // Get current user session for admin ID
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    const adminId = session?.user?.id;
    
    // Update the project with the admin client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'approved',
        approved: true, // For backwards compatibility
        reviewed_at: new Date().toISOString(),
        reviewer_id: adminId
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error approving project:', error)
      return { success: false, error: error.message }
    }
    
    // Log the admin action
    if (adminId && project) {
      await logAdminAction('approved', id, project.name, adminId, 'approved')
    }
    
    // Send email notification if project has contact email
    if (project && project.contact_email) {
      try {
        await sendProjectApprovalEmail(project.contact_email, project.name);
      } catch (emailError) {
        console.error('Error sending approval email:', emailError);
        // Continue even if email fails
      }
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
    
    // First get project info to get contact email
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('name, contact_email')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching project info:', fetchError)
      return { success: false, error: fetchError.message }
    }
    
    // Get current user session for admin ID
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    const adminId = session?.user?.id;
    
    // Update the project with the admin client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'rejected',
        approved: false, // For backwards compatibility
        reviewed_at: new Date().toISOString(),
        reviewer_id: adminId
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error rejecting project:', error)
      return { success: false, error: error.message }
    }
    
    // Log the admin action
    if (adminId && project) {
      await logAdminAction('rejected', id, project.name, adminId, 'rejected')
    }
    
    // Send email notification if project has contact email
    if (project && project.contact_email) {
      try {
        await sendProjectRejectionEmail(project.contact_email, project.name);
      } catch (emailError) {
        console.error('Error sending rejection email:', emailError);
        // Continue even if email fails
      }
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
    
    // First get project info to get contact email
    const { data: project, error: fetchError } = await supabaseAdmin
      .from('projects')
      .select('name, contact_email')
      .eq('id', id)
      .single();
    
    if (fetchError) {
      console.error('Error fetching project info:', fetchError)
      return { success: false, error: fetchError.message }
    }
    
    // Get current user session for admin ID
    const { data: { session } } = await supabaseAdmin.auth.getSession();
    const adminId = session?.user?.id;
    
    // Update the project with the admin client
    const { data, error } = await supabaseAdmin
      .from('projects')
      .update({ 
        status: 'changes_requested',
        approved: false, // For backwards compatibility
        review_notes: notes,
        reviewed_at: new Date().toISOString(),
        reviewer_id: adminId
      })
      .eq('id', id)
      .select()
    
    if (error) {
      console.error('Error requesting changes:', error)
      return { success: false, error: error.message }
    }
    
    // Log the admin action
    if (adminId && project) {
      await logAdminAction('requested_changes', id, project.name, adminId, 'changes_requested')
    }
    
    // Send email notification if project has contact email
    if (project && project.contact_email) {
      try {
        // Pass the project ID to the email function so it can be included in the edit URL
        await sendRequestChangesEmail(project.contact_email, project.name, notes, id);
      } catch (emailError) {
        console.error('Error sending changes request email:', emailError);
        // Continue even if email fails
      }
    }
    
    // Revalidate the admin path to refresh the UI
    revalidatePath('/admin')
    
    return { success: true, data }
  } catch (error: any) {
    console.error('Error in requestChanges:', error)
    return { success: false, error: error.message }
  }
}

// Add a new action to save project validation
export async function saveProjectValidation(projectId: string, validation: ProjectValidation) {
  try {
    console.log(`Saving validation for project ${projectId} with server action`)
    
    // Use the admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('validation_results')
      .upsert({
        project_id: projectId,
        scam_check_passed: validation.scamCheck.passed,
        scam_check_details: validation.scamCheck.details,
        sanctions_check_passed: validation.sanctionsCheck.passed,
        sanctions_check_details: validation.sanctionsCheck.details,
        audit_check_passed: validation.auditCheck.passed,
        audit_check_details: validation.auditCheck.details,
        risk_level: validation.riskLevel,
        overall_passed: validation.overallPassed,
        validated_at: new Date().toISOString()
      })
    
    if (error) {
      console.error('Error saving validation results:', error)
      return { success: false, error: error.message }
    }
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in saveProjectValidation:', error)
    return { success: false, error: error.message }
  }
}

// Add this new action to save manual validation overrides
export async function saveManualValidationOverride(
  projectId: string, 
  validation: ProjectValidation
) {
  try {
    console.log(`Saving manual validation override for project ${projectId}`)
    
    // Use the admin client to bypass RLS
    const { error } = await supabaseAdmin
      .from('validation_results')
      .upsert({
        project_id: projectId,
        scam_check_passed: validation.scamCheck.passed,
        scam_check_details: validation.scamCheck.details,
        sanctions_check_passed: validation.sanctionsCheck.passed,
        sanctions_check_details: validation.sanctionsCheck.details,
        audit_check_passed: validation.auditCheck.passed,
        audit_check_details: validation.auditCheck.details,
        risk_level: validation.riskLevel,
        overall_passed: validation.overallPassed,
        validated_at: new Date().toISOString(),
        // Add fields for manual review
        manually_reviewed: validation.manuallyReviewed,
        reviewer_id: validation.reviewedBy,
        reviewed_at: validation.reviewedAt,
        scam_check_override: validation.scamCheck.manualOverride || false,
        scam_check_notes: validation.scamCheck.manualNotes,
        sanctions_check_override: validation.sanctionsCheck.manualOverride || false,
        sanctions_check_notes: validation.sanctionsCheck.manualNotes,
        audit_check_override: validation.auditCheck.manualOverride || false,
        audit_check_notes: validation.auditCheck.manualNotes
      })
    
    if (error) {
      console.error('Error saving validation override:', error)
      return { success: false, error: error.message }
    }
    
    // Log the admin action
    try {
      await supabaseAdmin
        .from('admin_activities')
        .insert({
          action: 'manual_validation',
          project_id: projectId,
          project_name: `Project ID: ${projectId}`, // We don't have the name here, could fetch it
          admin_id: validation.reviewedBy,
          status: validation.overallPassed ? 'approved' : 'manual_review'
        })
    } catch (logError) {
      console.error('Error logging admin action:', logError)
      // Continue even if logging fails
    }
    
    // Revalidate the admin path to refresh the UI
    revalidatePath('/admin')
    
    return { success: true }
  } catch (error: any) {
    console.error('Error in saveManualValidationOverride:', error)
    return { success: false, error: error.message }
  }
}

// Action to fetch validation results with service role
export async function fetchValidationResults(projectId: string) {
  try {
    console.log(`Fetching validation for project ${projectId} with server action`)
    
    const { data, error } = await supabaseAdmin
      .from('validation_results')
      .select('*')
      .eq('project_id', projectId)
      .single()
    
    if (error) {
      if (error.code === 'PGRST116') {
        // Record not found
        return { success: true, data: null }
      }
      console.error('Error fetching validation results:', error)
      return { success: false, error: error.message }
    }
    
    if (!data) {
      return { success: true, data: null }
    }
    
    // Transform to expected validation format with manual review info
    const validation = {
      scamCheck: {
        passed: data.scam_check_passed,
        details: data.scam_check_details,
        manualOverride: data.scam_check_override || false,
        manualNotes: data.scam_check_notes
      },
      sanctionsCheck: {
        passed: data.sanctions_check_passed,
        details: data.sanctions_check_details,
        manualOverride: data.sanctions_check_override || false,
        manualNotes: data.sanctions_check_notes
      },
      auditCheck: {
        passed: data.audit_check_passed,
        details: data.audit_check_details,
        manualOverride: data.audit_check_override || false,
        manualNotes: data.audit_check_notes
      },
      riskLevel: data.risk_level,
      overallPassed: data.overall_passed,
      manuallyReviewed: data.manually_reviewed || false,
      reviewedBy: data.reviewer_id,
      reviewedAt: data.reviewed_at
    }
    
    return { success: true, data: validation }
  } catch (error: any) {
    console.error('Error in fetchValidationResults:', error)
    return { success: false, error: error.message }
  }
}
