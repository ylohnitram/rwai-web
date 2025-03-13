import { getSupabaseClient } from "@/lib/supabase";

export type AssetType = {
  id: number;
  name: string;
  description: string;
  created_at: string;
  updated_at: string;
};

/**
 * Gets all asset types from the database
 * @returns Array of asset types
 */
export async function getAssetTypes(): Promise<AssetType[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("asset_types")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching asset types:", error);
    throw new Error(`Error fetching asset types: ${error.message}`);
  }
  
  return data as AssetType[];
}

/**
 * Gets a single asset type by ID
 * @param id The ID of the asset type
 * @returns The asset type or null if not found
 */
export async function getAssetTypeById(id: number): Promise<AssetType | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("asset_types")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    if (error.code === "PGRST116") {
      // Record not found
      return null;
    }
    console.error("Error fetching asset type:", error);
    throw new Error(`Error fetching asset type: ${error.message}`);
  }
  
  return data as AssetType;
}

/**
 * Creates a new asset type
 * @param name The name of the asset type
 * @param description Description of the asset type
 * @returns The created asset type
 */
export async function createAssetType(name: string, description: string): Promise<AssetType> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("asset_types")
    .insert({ name, description })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating asset type:", error);
    throw new Error(`Error creating asset type: ${error.message}`);
  }
  
  return data as AssetType;
}

/**
 * Updates an existing asset type
 * @param id The ID of the asset type to update
 * @param updates The fields to update
 * @returns The updated asset type
 */
export async function updateAssetType(
  id: number, 
  updates: { name?: string; description?: string }
): Promise<AssetType> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("asset_types")
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating asset type:", error);
    throw new Error(`Error updating asset type: ${error.message}`);
  }
  
  return data as AssetType;
}

/**
 * Deletes an asset type
 * @param id The ID of the asset type to delete
 * @returns True if deleted successfully
 */
export async function deleteAssetType(id: number): Promise<boolean> {
  // Note: This may fail if there are projects using this asset type
  // due to foreign key constraints
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from("asset_types")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting asset type:", error);
    throw new Error(`Error deleting asset type: ${error.message}`);
  }
  
  return true;
}

/**
 * Checks if an asset type with the given name already exists
 * @param name The name to check
 * @returns True if the asset type exists, false otherwise
 */
export async function assetTypeExists(name: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  const { count, error } = await supabase
    .from("asset_types")
    .select("*", { count: "exact", head: true })
    .ilike("name", name);
    
  if (error) {
    console.error("Error checking if asset type exists:", error);
    throw new Error(`Error checking if asset type exists: ${error.message}`);
  }
  
  return (count || 0) > 0;
}
