import { getSupabaseClient } from "@/lib/supabase";
import { Project } from "@/types/project";
import { BlockchainNetwork } from "@/types/network";

// Convert a string to a slug
export function slugify(str: string): string {
  return str
    .toLowerCase()
    .trim()
    .replace(/[^\w\s-]/g, "")
    .replace(/[\s_-]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

/**
 * Get all projects with filtering options
 */
export async function getProjects(options: {
  page?: number;
  limit?: number;
  assetType?: string;
  blockchain?: string;
  minRoi?: number;
  maxRoi?: number;
  status?: string;
  approved?: boolean;
} = {}) {
  try {
    const {
      page = 1,
      limit = 10,
      assetType,
      blockchain,
      minRoi,
      maxRoi,
      status = "approved",
      approved = true,
    } = options;

    const offset = (page - 1) * limit;

    let query = getSupabaseClient()
      .from("projects")
      .select("*", { count: "exact" });

    // Filter by status or approved flag (backwards compatibility)
    if (status) {
      query = query.eq("status", status);
    } else if (approved !== undefined) {
      query = query.eq("approved", approved);
    }

    // Apply filters if provided
    if (assetType) {
      query = query.eq("type", assetType);
    }

    if (blockchain) {
      query = query.eq("blockchain", blockchain);
    }

    if (minRoi !== undefined) {
      query = query.gte("roi", minRoi);
    }

    if (maxRoi !== undefined) {
      query = query.lte("roi", maxRoi);
    }

    // Apply pagination
    query = query.range(offset, offset + limit - 1).order("created_at", {
      ascending: false,
    });

    const { data, error, count } = await query;

    if (error) {
      console.error("Error fetching projects:", error);
      throw error;
    }

    return { data: data || [], count: count || 0 };
  } catch (error) {
    console.error("Error in getProjects:", error);
    throw error;
  }
}

/**
 * Get featured projects
 */
export async function getFeaturedProjects(limit = 6): Promise<Project[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("projects")
      .select("*")
      .eq("status", "approved")
      .eq("featured", true)
      .limit(limit);

    if (error) {
      console.error("Error fetching featured projects:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getFeaturedProjects:", error);
    throw error;
  }
}

/**
 * Get a project by ID
 */
export async function getProjectById(id: string): Promise<Project | null> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("projects")
      .select("*")
      .eq("id", id)
      .single();

    if (error) {
      if (error.code === "PGRST116") {
        // Record not found
        return null;
      }
      console.error("Error fetching project by ID:", error);
      throw error;
    }

    return data;
  } catch (error) {
    console.error("Error in getProjectById:", error);
    throw error;
  }
}

/**
 * Get a project by slug (URL-friendly name)
 */
export async function getProjectBySlug(
  slug: string
): Promise<Project | null> {
  try {
    // Use the original database query approach to find projects
    const { data, error } = await getSupabaseClient()
      .from("projects")
      .select("*");

    if (error) {
      console.error("Error fetching projects for slug check:", error);
      throw error;
    }

    // Find the project with a matching slug
    const project = data?.find(
      (p) => slugify(p.name) === slug.toLowerCase()
    );

    return project || null;
  } catch (error) {
    console.error("Error in getProjectBySlug:", error);
    throw error;
  }
}

/**
 * Get projects by asset type
 */
export async function getProjectsByType(
  assetType: string,
  limit = 3,
  excludeId?: string
): Promise<Project[]> {
  try {
    let query = getSupabaseClient()
      .from("projects")
      .select("*")
      .eq("status", "approved")
      .eq("type", assetType)
      .limit(limit);

    // Exclude a specific project (useful for "related projects" section)
    if (excludeId) {
      query = query.neq("id", excludeId);
    }

    const { data, error } = await query;

    if (error) {
      console.error("Error fetching projects by type:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProjectsByType:", error);
    throw error;
  }
}

/**
 * Get projects by blockchain
 */
export async function getProjectsByBlockchain(
  blockchain: string,
  limit = 3
): Promise<Project[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("projects")
      .select("*")
      .eq("status", "approved")
      .eq("blockchain", blockchain)
      .limit(limit);

    if (error) {
      console.error("Error fetching projects by blockchain:", error);
      throw error;
    }

    return data || [];
  } catch (error) {
    console.error("Error in getProjectsByBlockchain:", error);
    throw error;
  }
}

/**
 * Check if a project with the given name already exists
 * @param name Project name to check
 * @returns True if a project with this name exists
 */
export async function projectExists(name: string): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    
    // Check for projects with the same name (case-insensitive) that aren't rejected
    const { data, error, count } = await supabase
      .from("projects")
      .select("id", { count: "exact" })
      .ilike("name", name.trim())
      .not('status', 'eq', 'rejected'); // Exclude rejected projects
      
    if (error) {
      console.error("Error checking if project exists:", error);
      throw error;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    console.error("Error in projectExists:", error);
    throw error;
  }
}

/**
 * Check if a project with the given name and blockchain already exists
 * @param name Project name to check
 * @param blockchain Blockchain to check
 * @returns True if a project with this name and blockchain exists
 */
export async function projectExistsWithNameAndBlockchain(
  name: string, 
  blockchain: string
): Promise<boolean> {
  try {
    const supabase = getSupabaseClient();
    
    // Check for projects with the same name (case-insensitive) and blockchain that aren't rejected
    const { data, error, count } = await supabase
      .from("projects")
      .select("id", { count: "exact" })
      .ilike("name", name.trim())
      .eq("blockchain", blockchain)
      .not('status', 'eq', 'rejected'); // Exclude rejected projects
      
    if (error) {
      console.error("Error checking if project exists:", error);
      throw error;
    }
    
    return (count || 0) > 0;
  } catch (error) {
    console.error("Error in projectExistsWithNameAndBlockchain:", error);
    throw error;
  }
}

/**
 * Get distribution of projects by metric
 */
export async function getProjectDistribution(
  metric: "type" | "blockchain"
): Promise<{ name: string; value: number }[]> {
  try {
    const { data, error } = await getSupabaseClient()
      .from("projects")
      .select(metric)
      .eq("status", "approved");

    if (error) {
      console.error(`Error fetching project distribution by ${metric}:`, error);
      throw error;
    }

    // Count occurrences of each value
    const counts: Record<string, number> = {};
    data?.forEach((project) => {
      const value = project[metric] as string;
      if (value) {
        counts[value] = (counts[value] || 0) + 1;
      }
    });

    // Convert to array of { name, value } for easier consumption
    return Object.entries(counts).map(([name, value]) => ({
      name,
      value,
    }));
  } catch (error) {
    console.error("Error in getProjectDistribution:", error);
    throw error;
  }
}

/**
 * Get available blockchains with project counts
 */
export async function getBlockchainNetworks(): Promise<BlockchainNetwork[]> {
  try {
    // First, get raw distribution data
    const { data, error } = await getSupabaseClient()
      .from("projects")
      .select("blockchain")
      .eq("status", "approved");

    if (error) {
      console.error("Error fetching blockchain distribution:", error);
      throw error;
    }

    // Count projects per blockchain
    const counts: Record<string, number> = {};
    data?.forEach((project) => {
      const blockchain = project.blockchain;
      if (blockchain) {
        counts[blockchain] = (counts[blockchain] || 0) + 1;
      }
    });

    // Get network data from the networks table
    const { data: networks, error: networksError } = await getSupabaseClient()
      .from("networks")
      .select("*");

    if (networksError) {
      console.error("Error fetching networks:", networksError);
      throw networksError;
    }

    // Combine network data with project counts
    return (
      networks?.map((network) => ({
        ...network,
        projectCount: counts[network.name] || 0,
      })) || []
    );
  } catch (error) {
    console.error("Error in getBlockchainNetworks:", error);
    throw error;
  }
}
