import { getSupabaseClient } from "@/lib/supabase";

/**
 * Uploads a file to Supabase Storage
 * @param bucketName The storage bucket name
 * @param filePath The path where the file will be stored
 * @param file The file to upload
 * @returns The public URL of the uploaded file
 */
export async function uploadFile(
  bucketName: string,
  filePath: string,
  file: File
): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    // Create bucket if it doesn't exist
    const { data: buckets } = await supabase.storage.listBuckets();
    const bucketExists = buckets?.some(bucket => bucket.name === bucketName);
    
    if (!bucketExists) {
      const { error: createBucketError } = await supabase.storage.createBucket(bucketName, {
        public: false, // Make it private for security
      });
      
      if (createBucketError) {
        throw new Error(`Error creating bucket: ${createBucketError.message}`);
      }
    }
    
    // Upload the file
    const { error: uploadError } = await supabase.storage
      .from(bucketName)
      .upload(filePath, file, {
        cacheControl: '3600',
        upsert: true,
      });
    
    if (uploadError) {
      throw new Error(`Error uploading file: ${uploadError.message}`);
    }
    
    // Get public URL
    const { data: publicUrlData } = supabase.storage
      .from(bucketName)
      .getPublicUrl(filePath);
    
    return publicUrlData.publicUrl;
  } catch (error) {
    console.error('Error in uploadFile:', error);
    throw error;
  }
}

/**
 * Downloads a file from Supabase Storage
 * @param bucketName The storage bucket name
 * @param filePath The path of the file to download
 * @returns The file data and content type
 */
export async function downloadFile(
  bucketName: string,
  filePath: string
): Promise<{ data: Blob; contentType: string }> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .download(filePath);
    
    if (error) {
      throw new Error(`Error downloading file: ${error.message}`);
    }
    
    if (!data) {
      throw new Error('File not found');
    }
    
    // Get content type
    const contentType = data.type;
    
    return { data, contentType };
  } catch (error) {
    console.error('Error in downloadFile:', error);
    throw error;
  }
}

/**
 * Gets a signed URL for privately sharing files
 * @param bucketName The storage bucket name
 * @param filePath The path of the file
 * @param expiresIn Expiration time in seconds (default: 60 minutes)
 * @returns Signed URL with temporary access
 */
export async function getSignedUrl(
  bucketName: string,
  filePath: string,
  expiresIn: number = 3600
): Promise<string> {
  try {
    const supabase = getSupabaseClient();
    
    const { data, error } = await supabase.storage
      .from(bucketName)
      .createSignedUrl(filePath, expiresIn);
    
    if (error) {
      throw new Error(`Error creating signed URL: ${error.message}`);
    }
    
    if (!data || !data.signedUrl) {
      throw new Error('Could not generate signed URL');
    }
    
    return data.signedUrl;
  } catch (error) {
    console.error('Error in getSignedUrl:', error);
    throw error;
  }
}

/**
 * Deletes a file from Supabase Storage
 * @param bucketName The storage bucket name
 * @param filePath The path of the file to delete
 */
export async function deleteFile(bucketName: string, filePath: string): Promise<void> {
  try {
    const supabase = getSupabaseClient();
    
    const { error } = await supabase.storage
      .from(bucketName)
      .remove([filePath]);
    
    if (error) {
      throw new Error(`Error deleting file: ${error.message}`);
    }
  } catch (error) {
    console.error('Error in deleteFile:', error);
    throw error;
  }
}
