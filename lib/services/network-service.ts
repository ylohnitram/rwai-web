import { getSupabaseClient } from "@/lib/supabase";

export type Network = {
  id: number;
  name: string;
  description: string;
  icon?: string;
  created_at: string;
  updated_at: string;
};

/**
 * Gets all networks from the database
 * @returns Array of networks
 */
export async function getNetworks(): Promise<Network[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("networks")
    .select("*")
    .order("name");
  
  if (error) {
    console.error("Error fetching networks:", error);
    throw new Error(`Error fetching networks: ${error.message}`);
  }
  
  return data as Network[];
}

/**
 * Gets a single network by ID
 * @param id The ID of the network
 * @returns The network or null if not found
 */
export async function getNetworkById(id: number): Promise<Network | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("networks")
    .select("*")
    .eq("id", id)
    .single();
    
  if (error) {
    if (error.code === "PGRST116") {
      // Record not found
      return null;
    }
    console.error("Error fetching network:", error);
    throw new Error(`Error fetching network: ${error.message}`);
  }
  
  return data as Network;
}

/**
 * Creates a new network
 * @param name The name of the network
 * @param description Description of the network
 * @param icon Optional icon identifier
 * @returns The created network
 */
export async function createNetwork(name: string, description: string, icon?: string): Promise<Network> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("networks")
    .insert({ name, description, icon })
    .select()
    .single();
    
  if (error) {
    console.error("Error creating network:", error);
    throw new Error(`Error creating network: ${error.message}`);
  }
  
  return data as Network;
}

/**
 * Updates an existing network
 * @param id The ID of the network to update
 * @param updates The fields to update
 * @returns The updated network
 */
export async function updateNetwork(
  id: number, 
  updates: { name?: string; description?: string; icon?: string }
): Promise<Network> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("networks")
    .update({ 
      ...updates, 
      updated_at: new Date().toISOString() 
    })
    .eq("id", id)
    .select()
    .single();
    
  if (error) {
    console.error("Error updating network:", error);
    throw new Error(`Error updating network: ${error.message}`);
  }
  
  return data as Network;
}

/**
 * Deletes a network
 * @param id The ID of the network to delete
 * @returns True if deleted successfully
 */
export async function deleteNetwork(id: number): Promise<boolean> {
  // Note: This may fail if there are projects using this network
  // due to foreign key constraints
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from("networks")
    .delete()
    .eq("id", id);
    
  if (error) {
    console.error("Error deleting network:", error);
    throw new Error(`Error deleting network: ${error.message}`);
  }
  
  return true;
}

/**
 * Checks if a network with the given name already exists
 * @param name The name to check
 * @returns True if the network exists, false otherwise
 */
export async function networkExists(name: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  const { count, error } = await supabase
    .from("networks")
    .select("*", { count: "exact", head: true })
    .ilike("name", name);
    
  if (error) {
    console.error("Error checking if network exists:", error);
    throw new Error(`Error checking if network exists: ${error.message}`);
  }
  
  return (count || 0) > 0;
}
