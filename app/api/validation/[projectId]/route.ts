import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

// Create a Supabase client with service role for server-side usage
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function GET(
  request: Request,
  { params }: { params: { projectId: string } }
) {
  try {
    const projectId = params.projectId;
    
    if (!projectId) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }
    
    // Fetch validation results for the project
    const { data, error } = await supabaseServer
      .from("validation_results")
      .select("*")
      .eq("project_id", projectId)
      .single();
    
    if (error) {
      if (error.code === "PGRST116") {
        // Record not found - return null but with 200 status
        return NextResponse.json({
          success: true,
          data: null
        });
      }
      
      throw error;
    }
    
    if (!data) {
      return NextResponse.json({
        success: true,
        data: null
      });
    }
    
    // Transform to expected validation format
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
    };
    
    return NextResponse.json({
      success: true,
      data: validation
    });
  } catch (error: any) {
    console.error("Error fetching validation:", error);
    return NextResponse.json(
      { error: "Failed to fetch validation results", message: error.message },
      { status: 500 }
    );
  }
}
