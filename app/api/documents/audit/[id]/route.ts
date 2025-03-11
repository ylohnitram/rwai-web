import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';
import { getProjectById } from "@/lib/services/project-service";

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
  { params }: { params: { id: string } }
) {
  try {
    const id = params.id;
    
    if (!id) {
      return NextResponse.json(
        { error: "Project ID is required" },
        { status: 400 }
      );
    }
    
    // Get the project to ensure it exists and is approved
    const project = await getProjectById(id);
    
    if (!project) {
      return NextResponse.json(
        { error: "Project not found" },
        { status: 404 }
      );
    }
    
    if (project.status !== 'approved') {
      return NextResponse.json(
        { error: "This document is not available" },
        { status: 403 }
      );
    }
    
    // Check if audit document path exists
    if (!project.audit_document_path) {
      // Try to fall back to audit URL if it exists
      if (project.audit_url) {
        return NextResponse.redirect(project.audit_url);
      }
      
      return NextResponse.json(
        { error: "No audit document available for this project" },
        { status: 404 }
      );
    }
    
    // Get a signed URL that expires in 1 hour (3600 seconds)
    const { data, error } = await supabaseServer.storage
      .from('audit-documents')
      .createSignedUrl(project.audit_document_path, 3600);
    
    if (error || !data?.signedUrl) {
      console.error('Error creating signed URL:', error);
      return NextResponse.json(
        { error: "Failed to generate document access URL" },
        { status: 500 }
      );
    }
    
    // Redirect to the signed URL
    return NextResponse.redirect(data.signedUrl);
  } catch (error) {
    console.error('Unexpected error:', error);
    return NextResponse.json(
      { error: "An unexpected error occurred" },
      { status: 500 }
    );
  }
}
