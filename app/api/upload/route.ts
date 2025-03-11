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
    
    // Ensure the bucket exists (create if it doesn't)
    try {
      const { data: buckets } = await supabaseAdmin.storage.listBuckets();
      const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
      
      if (!bucketExists) {
        console.log(`Creating bucket: ${bucketName}`);
        const { error: createBucketError } = await supabaseAdmin.storage.createBucket(bucketName, {
          public: false,
          fileSizeLimit: 10485760, // 10MB
        });
        
        if (createBucketError) {
          console.error('Error creating bucket:', createBucketError);
          return NextResponse.json(
            { error: `Error creating bucket: ${createBucketError.message}` },
            { status: 500 }
          );
        }
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
    
    // Get public URL
    const { data: publicUrlData } = supabaseAdmin.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return NextResponse.json({
      success: true,
      filePath,
      publicUrl: publicUrlData.publicUrl
    });
  } catch (error: any) {
    console.error('Unexpected error in upload API route:', error);
    return NextResponse.json(
      { error: 'An unexpected error occurred' },
      { status: 500 }
    );
  }
}
