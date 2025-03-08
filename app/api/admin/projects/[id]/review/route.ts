import { NextResponse } from "next/server";
import { createRouteHandlerClient } from '@supabase/auth-helpers-nextjs';
import { cookies } from 'next/headers';
import { ProjectStatus } from "@/types/project";
import { sendEmailNotification } from "@/lib/services/notification-service";

export async function POST(
  request: Request,
  { params }: { params: { id: string } }
) {
  try {
    const projectId = params.id;
    const requestData = await request.json();
    const { status, review_notes } = requestData;
    
    // Validate the status
    if (!['approved', 'rejected', 'changes_requested'].includes(status)) {
      return NextResponse.json(
        { error: "Invalid status value" },
        { status: 400 }
      );
    }
    
    // If requesting changes, notes are required
    if (status === 'changes_requested' && (!review_notes || review_notes.trim() === '')) {
      return NextResponse.json(
        { error: "Notes are required when requesting changes" },
        { status: 400 }
      );
    }

    // Get the authenticated user (admin)
    const supabase = createRouteHandlerClient({ cookies });
    const { data: { session }, error: authError } = await supabase.auth.getSession();
    
    if (authError || !session) {
      return NextResponse.json(
        { error: "Unauthorized - Authentication required" },
        { status: 401 }
      );
    }
    
    // Get user role to verify they are an admin
    const { data: userData, error: profileError } = await supabase
      .from('profiles')
      .select('role')
      .eq('id', session.user.id)
      .single();
      
    if (profileError || userData?.role !== 'admin') {
      return NextResponse.json(
        { error: "Forbidden - Admin access required" },
        { status: 403 }
      );
    }
    
    // Get the project first to check if it exists and get contact email
    const { data: project, error: projectFetchError } = await supabase
      .from('projects')
      .select('*')
      .eq('id', projectId)
      .single();
    
    if (projectFetchError || !project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    // Update the project with the review
    const { data: updatedProject, error: updateError } = await supabase
      .from('projects')
      .update({
        status,
        review_notes,
        reviewer_id: session.user.id,
        reviewed_at: new Date().toISOString()
      })
      .eq('id', projectId)
      .select()
      .single();
    
    if (updateError) {
      return NextResponse.json(
        { error: `Failed to update project: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    // Send email notification if we have a contact email
    if (project.contact_email) {
      try {
        let subject = '';
        let message = '';
        
        switch(status) {
          case 'approved':
            subject = `Your project "${project.name}" has been approved!`;
            message = `Congratulations! Your project "${project.name}" has been approved and is now listed on TokenDirectory.

${review_notes ? `Review notes: ${review_notes}` : ''}

You can view your project at: ${process.env.NEXT_PUBLIC_SITE_URL || 'https://tokendirectory.example.com'}/projects/${project.name.toLowerCase().replace(/\s+/g, '-').replace(/[^a-z0-9-]/g, '')}`;
            break;
            
          case 'rejected':
            subject = `Your project "${project.name}" submission update`;
            message = `We regret to inform you that your project "${project.name}" has been rejected.

Reason: ${review_notes || 'Did not meet our listing criteria'}

If you believe this is in error or would like more information, please contact our support team.`;
            break;
            
          case 'changes_requested':
            subject = `Action Required: Changes requested for "${project.name}"`;
            message = `Our review team has requested changes to your project "${project.name}" before it can be approved:

${review_notes}

Please update your submission with these changes. You can do so by submitting a new application and referencing this review.`;
            break;
        }
        
        await sendEmailNotification(project.contact_email, subject, message);
      } catch (emailError) {
        console.error('Error sending email notification:', emailError);
        // Continue with the response despite email error
      }
    }
    
    return NextResponse.json({
      message: `Project ${status.replace('_', ' ')} successfully`,
      project: updatedProject
    });
    
  } catch (error: any) {
    console.error('Error processing project review:', error);
    
    return NextResponse.json(
      { error: 'Internal server error', message: error.message },
      { status: 500 }
    );
  }
}
