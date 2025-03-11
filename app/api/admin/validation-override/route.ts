import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { ProjectValidation } from "@/lib/services/validation-service";

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
);

export async function POST(request: Request) {
  try {
    const { projectId, validation } = await request.json();
    
    if (!projectId || !validation) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    // First check if a record already exists
    const { data: existingRecord, error: fetchError } = await supabaseAdmin
      .from('validation_results')
      .select('id')
      .eq('project_id', projectId)
      .single();
    
    let result;
    
    if (existingRecord) {
      // Update existing record
      result = await supabaseAdmin
        .from('validation_results')
        .update({
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
        .eq('project_id', projectId);
    } else {
      // Insert new record
      result = await supabaseAdmin
        .from('validation_results')
        .insert({
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
        });
    }
    
    if (result.error) {
      console.error('Error updating validation results:', result.error);
      return NextResponse.json(
        { error: result.error.message },
        { status: 500 }
      );
    }
    
    // Log the admin action
    try {
      await supabaseAdmin
        .from('admin_activities')
        .insert({
          action: 'manual_validation',
          project_id: projectId,
          project_name: `Project ID: ${projectId}`,
          admin_id: validation.reviewedBy,
          status: validation.overallPassed ? 'approved' : 'manual_review'
        });
    } catch (logError) {
      console.error('Error logging admin action:', logError);
      // Continue even if logging fails
    }
    
    return NextResponse.json({
      success: true,
      message: 'Validation override saved successfully'
    });
  } catch (error: any) {
    console.error('Error in validation override API:', error);
    return NextResponse.json(
      { error: error.message || 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
