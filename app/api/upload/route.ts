import { NextResponse } from "next/server";
import { createClient } from '@supabase/supabase-js';

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
    const formData = await request.formData();
    const file = formData.get('file') as File;
    const bucketName = formData.get('bucket') as string;
    const filePath = formData.get('path') as string;
    
    if (!file || !bucketName || !filePath) {
      return NextResponse.json(
        { error: "Missing required parameters" },
        { status: 400 }
      );
    }
    
    console.log(`Processing upload for bucket: ${bucketName}, path: ${filePath}`);
    
    // Ensure the bucket exists before attempting to upload
    try {
      // Try to force create the bucket (this will fail if it already exists, but that's OK)
      try {
        console.log(`Attempting to create bucket: ${bucketName}`);
        
        await supabaseAdmin.storage.createBucket(bucketName, {
          public: true,
          fileSizeLimit: 10485760, // 10MB
          allowedMimeTypes: [
            'application/pdf',
            'application/msword',
            'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
          ]
        });
        
        console.log(`Successfully created bucket: ${bucketName}`);
      } catch (createError: any) {
        // Check if error is because bucket already exists - that's OK
        if (createError.message && createError.message.includes('already exists')) {
          console.log(`Bucket ${bucketName} already exists, continuing with upload`);
        } else {
          console.error('Error creating bucket:', createError);
          // Continue anyway, bucket might exist despite the error
        }
      }
      
      // Verify bucket exists by trying to get its details
      const { data: bucketDetails, error: bucketError } = await supabaseAdmin.storage.getBucket(bucketName);
      
      if (bucketError || !bucketDetails) {
        console.error(`Bucket ${bucketName} verification failed:`, bucketError);
        return NextResponse.json(
          { error: `Bucket ${bucketName} does not exist and could not be created` },
          { status: 500 }
        );
      }
      
      console.log(`Confirmed bucket ${bucketName} exists:`, bucketDetails);
      
      // Force bucket to be public
      try {
        await supabaseAdmin.storage.updateBucket(bucketName, {
          public: true
        });
        console.log(`Updated bucket ${bucketName} to be public`);
      } catch (updateError) {
        console.error('Error updating bucket to public:', updateError);
        // Continue anyway
      }
    } catch (bucketError) {
      console.error('Error checking/creating bucket:', bucketError);
      return NextResponse.json(
        { error: "Failed to ensure bucket exists" },
        { status: 500 }
      );
    }
    
    // Convert the file to ArrayBuffer
    const arrayBuffer = await file.arrayBuffer();
    const buffer = new Uint8Array(arrayBuffer);
    
    console.log(`Uploading file to ${bucketName}/${filePath}, size: ${buffer.length} bytes`);
    
    // Upload the file using admin client
    const { data, error: uploadError } = await supabaseAdmin.storage
      .from(bucketName)
      .upload(filePath, buffer, {
        contentType: file.type,
        cacheControl: '3600',
        upsert: true,
      });
      
    if (uploadError) {
      console.error('Error uploading file:', uploadError);
      return NextResponse.json(
        { error: `Error uploading file: ${uploadError.message}` },
        { status: 500 }
      );
    }
    
    console.log(`File uploaded successfully:`, data);
    
    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    console.log(`Generated public URL:`, publicUrlData.publicUrl);
    
    return NextResponse.json({
      success: true,
      filePath,
      publicUrl: publicUrlData.publicUrl
    });
  } catch (error: any) {
    console.error('Unexpected error in upload API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred: ' + (error.message || 'Unknown error') },
      { status: 500 }
    );
  }
}
