import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/services/email-service';
import { projectExists } from '@/lib/services/project-service';

// Create a Supabase client for server-side API routes
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

export async function PUT(request: Request) {
  console.log("Project update endpoint called");
  
  try {
    const { projectId, contactEmail, updatedData } = await request.json();
    console.log("Update request received:", { projectId, contactEmail, updatedData });
    
    // Validation - require either projectId or contactEmail
    if (!projectId && !contactEmail) {
      console.log("Missing identifier for project update");
      return NextResponse.json(
        { error: "Project ID or contact email is required" },
        { status: 400 }
      );
    }
    
    // Validate the updated data
    if (!updatedData || Object.keys(updatedData).length === 0) {
      console.log("No update data provided");
      return NextResponse.json(
        { error: "No update data provided" },
        { status: 400 }
      );
    }
    
    // Ensure the contact_email can't be changed if using it as identifier
    if (contactEmail && updatedData.contact_email && updatedData.contact_email !== contactEmail) {
      console.log("Cannot change contact email when using it as identifier");
      return NextResponse.json(
        { error: "Cannot change contact email when using it as identifier" },
        { status: 400 }
      );
    }
    
    // Start a query based on the provided identifier
    let query = supabaseAdmin.from('projects').select('*');
    
    if (projectId) {
      query = query.eq('id', projectId);
    } else if (contactEmail) {
      query = query.eq('contact_email', contactEmail);
    }
    
    // Check if project exists
    const { data: existingProject, error: fetchError } = await query.single();
    
    if (fetchError || !existingProject) {
      console.error('Error fetching project:', fetchError);
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    console.log("Found existing project:", existingProject);
    
    // Don't allow updates if project is already approved
    if (existingProject.status === 'approved') {
      console.log("Cannot update approved project");
      return NextResponse.json(
        { error: "Cannot update project that has already been approved" },
        { status: 403 }
      );
    }
    
    // If the name is being changed, check if the new name already exists for a different project
    if (updatedData.name && updatedData.name !== existingProject.name) {
      try {
        // We need to check if another project (not this one) has the same name
        const { data, count, error } = await supabaseAdmin
          .from('projects')
          .select('*', { count: 'exact' })
          .neq('id', existingProject.id) // Exclude current project
          .ilike('name', updatedData.name);
          
        if (error) {
          throw error;
        }
        
        if ((count || 0) > 0) {
          console.log(`Project with name "${updatedData.name}" already exists`);
          return NextResponse.json(
            { error: `A project with the name "${updatedData.name}" already exists. Please use a different name.` },
            { status: 409 }
          );
        }
      } catch (checkError) {
        console.error("Error checking if project name exists:", checkError);
        // Continue even if the check fails
      }
    }
    
    // Don't allow changing certain fields
    const safeUpdates = { ...updatedData };
    delete safeUpdates.id;
    delete safeUpdates.status;
    delete safeUpdates.approved;
    delete safeUpdates.featured;
    delete safeUpdates.created_at;
    delete safeUpdates.updated_at;
    delete safeUpdates.reviewer_id;
    delete safeUpdates.reviewed_at;
    
    // Preserve existing audit document if not provided
    if (!safeUpdates.audit_document_path) {
      delete safeUpdates.audit_document_path;
      
      // Keep original audit_url if it exists
      if (!safeUpdates.audit_url && existingProject.audit_url) {
        safeUpdates.audit_url = existingProject.audit_url;
      }
    }
    
    // If submitting in response to changes_requested, change status back to pending
    if (existingProject.status === 'changes_requested') {
      safeUpdates.status = 'pending';
      
      // Store old review notes in a comment field instead
      if (existingProject.review_notes) {
        // If this field doesn't exist, we'll store the information in the review_notes field
        // by prefixing it with "Previous feedback: "
        const oldNotes = existingProject.review_notes;
        safeUpdates.review_notes = `[Updated] Previous feedback: ${oldNotes}`;
      } else {
        // Clear the current review notes
        safeUpdates.review_notes = null;
      }
    }
    
    // Remove fields that don't exist in the database schema
    delete safeUpdates.previous_feedback;
    delete safeUpdates.previous_review_notes;
    
    console.log("Updating project with data:", safeUpdates);
    
    // Update the project
    const { data: updatedProject, error: updateError } = await supabaseAdmin
      .from('projects')
      .update(safeUpdates)
      .eq('id', existingProject.id)
      .select()
      .single();
    
    if (updateError) {
      console.error('Error updating project:', updateError);
      return NextResponse.json(
        { error: `Error updating project: ${updateError.message}` },
        { status: 500 }
      );
    }
    
    console.log("Project updated successfully:", updatedProject);
    
    // Send email notification to admin that project was updated
    try {
      const adminEmail = process.env.ADMIN_EMAIL || 'admin@rwa-directory.com';
      const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rwa-directory.vercel.app';
      
      await sendEmail(
        adminEmail,
        `Project Updated: ${updatedProject.name}`,
        `
        <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
          <h2 style="color: #333;">Project Updated</h2>
          <p>A project has been updated in response to your feedback:</p>
          <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
            <li><strong>Project Name:</strong> ${updatedProject.name}</li>
            <li><strong>Contact Email:</strong> ${updatedProject.contact_email}</li>
            <li><strong>Status:</strong> ${updatedProject.status}</li>
          </ul>
          <div style="margin: 30px 0;">
            <a href="${siteUrl}/admin" 
               style="background-color: #F59E0B; color: #0F172A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
              Review Updated Project
            </a>
          </div>
        </div>
        `
      );
      console.log("Admin notification email sent");
    } catch (emailError) {
      console.error('Error sending admin notification email:', emailError);
      // Continue even if email fails
    }
    
    // Send confirmation to the project owner
    if (updatedProject.contact_email) {
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rwa-directory.vercel.app';
        
        await sendEmail(
          updatedProject.contact_email,
          `Project Update Received: ${updatedProject.name}`,
          `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Project Update Received</h2>
            <p>Thank you for updating your project <strong>${updatedProject.name}</strong>.</p>
            <p>Our team will review your updated submission. You will receive another email when the review is complete.</p>
            <h3 style="color: #333; margin-top: 30px;">Project Details:</h3>
            <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
              <li><strong>Project Name:</strong> ${updatedProject.name}</li>
              <li><strong>Asset Type:</strong> ${updatedProject.type}</li>
              <li><strong>Blockchain:</strong> ${updatedProject.blockchain}</li>
              <li><strong>Expected ROI:</strong> ${updatedProject.roi}%</li>
            </ul>
            <p style="font-size: 12px; color: #666; margin-top: 40px;">
              You're receiving this email because you updated a project on TokenDirectory.
            </p>
          </div>
          `
        );
        console.log("Project owner confirmation email sent");
      } catch (emailError) {
        console.error('Error sending project owner confirmation email:', emailError);
        // Continue even if email fails
      }
    }
    
    return NextResponse.json({
      success: true,
      data: updatedProject,
      message: 'Project updated successfully!'
    });
  } catch (error: any) {
    console.error('Unexpected error in update API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
