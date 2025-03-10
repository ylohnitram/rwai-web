import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { sendEmail } from '@/lib/services/email-service';

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

export async function POST(request: Request) {
  console.log("Project submission endpoint called");
  
  try {
    const projectData = await request.json();
    console.log("Project data received:", projectData);
    
    // Validate the project data
    if (!projectData.name || !projectData.type || !projectData.blockchain || 
        !projectData.description || !projectData.website || !projectData.tvl) {
      console.log("Missing required fields in project data");
      return NextResponse.json(
        { error: "Missing required fields" },
        { status: 400 }
      );
    }
    
    // Set status to pending and approved to false by default
    const projectToInsert = {
      ...projectData,
      status: 'pending',
      approved: false,
      featured: false,
    };
    
    console.log("Inserting project into database:", projectToInsert);
    
    // Use the admin client to bypass RLS
    const { data, error } = await supabaseAdmin
      .from('projects')
      .insert(projectToInsert)
      .select()
      .single();
    
    if (error) {
      console.error('Error submitting project:', error);
      return NextResponse.json(
        { error: `Error submitting project: ${error.message}` },
        { status: 500 }
      );
    }
    
    console.log("Project inserted successfully:", data);
    
    // Send confirmation email if contact email is provided
    if (projectData.contact_email) {
      console.log("Preparing to send confirmation email to:", projectData.contact_email);
      
      try {
        const siteUrl = process.env.NEXT_PUBLIC_SITE_URL || 'https://rwa-directory.vercel.app';
        const emailSubject = `Project Submission Received: ${projectData.name}`;
        const emailContent = `
          <div style="font-family: Arial, sans-serif; max-width: 600px; margin: 0 auto;">
            <h2 style="color: #333;">Project Submission Received</h2>
            <p>Thank you for submitting your project <strong>${projectData.name}</strong> to TokenDirectory.</p>
            <p>Our team will review your submission and get back to you soon. The review process typically takes 3-5 business days.</p>
            <h3 style="color: #333; margin-top: 30px;">Project Details:</h3>
            <ul style="background-color: #f9f9f9; padding: 15px; border-radius: 5px;">
              <li><strong>Project Name:</strong> ${projectData.name}</li>
              <li><strong>Asset Type:</strong> ${projectData.type}</li>
              <li><strong>Blockchain:</strong> ${projectData.blockchain}</li>
              <li><strong>Expected ROI:</strong> ${projectData.roi}%</li>
            </ul>
            <p>You'll receive another email when the review is complete. If you have any questions in the meantime, please contact us.</p>
            <div style="margin: 30px 0;">
              <a href="${siteUrl}" 
                 style="background-color: #F59E0B; color: #0F172A; padding: 12px 24px; text-decoration: none; border-radius: 4px; font-weight: bold;">
                Visit TokenDirectory
              </a>
            </div>
            <p style="font-size: 12px; color: #666; margin-top: 40px;">
              You're receiving this email because you submitted a project to TokenDirectory.
              If you didn't submit this project, please ignore this email.
            </p>
          </div>
        `;
        
        console.log("Sending email with subject:", emailSubject);
        
        const emailResult = await sendEmail(
          projectData.contact_email,
          emailSubject,
          emailContent
        );
        
        console.log("Email sending result:", emailResult);
      } catch (emailError) {
        console.error('Error sending submission confirmation email:', emailError);
        // Continue even if email fails - don't block the submission
      }
    } else {
      console.log("No contact email provided, skipping confirmation email");
    }
    
    return NextResponse.json({
      success: true,
      data,
      message: 'Project submitted successfully!'
    });
  } catch (error: any) {
    console.error('Unexpected error in submit API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
