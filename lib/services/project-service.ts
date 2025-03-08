import { getSupabaseClient } from "@/lib/supabase";
import { Project } from "@/types/project";

export async function getProjects(options?: {
  page?: number;
  limit?: number;
  assetType?: string;
  blockchain?: string;
  minRoi?: number;
  maxRoi?: number;
  approved?: boolean;
}): Promise<{ data: Project[]; count: number }> {
  const supabase = getSupabaseClient();
  const {
    page = 1,
    limit = 10,
    assetType,
    blockchain,
    minRoi = 0,
    maxRoi = 100,
    approved,
  } = options || {};

  const offset = (page - 1) * limit;

  // Start with base query
  let query = supabase
    .from("projects")
    .select("*", { count: "exact" });

  // Apply filters
  if (assetType && assetType !== "all-types") {
    query = query.eq("type", assetType);
  }

  if (blockchain && blockchain !== "all-blockchains") {
    query = query.eq("blockchain", blockchain);
  }

  if (minRoi !== undefined) {
    query = query.gte("roi", minRoi);
  }

  if (maxRoi !== undefined) {
    query = query.lte("roi", maxRoi);
  }

  if (approved !== undefined) {
    query = query.eq("approved", approved);
  }

  // Apply pagination
  query = query.range(offset, offset + limit - 1);
  
  // Execute query
  const { data, error, count } = await query;

  if (error) {
    console.error("Error fetching projects:", error);
    throw new Error(`Error fetching projects: ${error.message}`);
  }

  return { 
    data: data as Project[], 
    count: count || 0 
  };
}

export async function getProjectById(id: string): Promise<Project | null> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("id", id)
    .single();

  if (error) {
    if (error.code === "PGRST116") {
      // Record not found
      return null;
    }
    console.error("Error fetching project:", error);
    throw new Error(`Error fetching project: ${error.message}`);
  }

  return data as Project;
}

export async function getProjectsByIds(ids: string[]): Promise<Project[]> {
  if (!ids.length) return [];
  
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .in("id", ids);

  if (error) {
    console.error("Error fetching projects by ids:", error);
    throw new Error(`Error fetching projects by ids: ${error.message}`);
  }

  return data as Project[];
}

export async function getFeaturedProjects(limit: number = 3): Promise<Project[]> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("projects")
    .select("*")
    .eq("approved", true)
    .eq("featured", true)
    .limit(limit);

  if (error) {
    console.error("Error fetching featured projects:", error);
    throw new Error(`Error fetching featured projects: ${error.message}`);
  }

  return data as Project[];
}

export async function createProject(project: Omit<Project, 'id'>): Promise<Project> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("projects")
    .insert(project)
    .select()
    .single();

  if (error) {
    console.error("Error creating project:", error);
    throw new Error(`Error creating project: ${error.message}`);
  }

  return data as Project;
}

export async function updateProject(id: string, updates: Partial<Project>): Promise<Project> {
  const supabase = getSupabaseClient();
  
  const { data, error } = await supabase
    .from("projects")
    .update(updates)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error updating project:", error);
    throw new Error(`Error updating project: ${error.message}`);
  }

  return data as Project;
}

export async function approveProject(id: string): Promise<Project> {
  return updateProject(id, { approved: true });
}

export async function rejectProject(id: string): Promise<void> {
  const supabase = getSupabaseClient();
  
  const { error } = await supabase
    .from("projects")
    .delete()
    .eq("id", id);

  if (error) {
    console.error("Error rejecting project:", error);
    throw new Error(`Error rejecting project: ${error.message}`);
  }
}

export async function getProjectStats(): Promise<{
  total: number;
  approved: number;
  pending: number;
  averageRoi: number;
}> {
  const supabase = getSupabaseClient();
  
  // Get total count
  const { count: total, error: totalError } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true });

  if (totalError) {
    console.error("Error fetching total projects:", totalError);
    throw new Error(`Error fetching total projects: ${totalError.message}`);
  }

  // Get approved count
  const { count: approved, error: approvedError } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("approved", true);

  if (approvedError) {
    console.error("Error fetching approved projects:", approvedError);
    throw new Error(`Error fetching approved projects: ${approvedError.message}`);
  }

  // Get pending count
  const { count: pending, error: pendingError } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .eq("approved", false);

  if (pendingError) {
    console.error("Error fetching pending projects:", pendingError);
    throw new Error(`Error fetching pending projects: ${pendingError.message}`);
  }

  // Get average ROI
  const { data: roiData, error: roiError } = await supabase
    .from("projects")
    .select("roi")
    .eq("approved", true);

  if (roiError) {
    console.error("Error fetching ROI data:", roiError);
    throw new Error(`Error fetching ROI data: ${roiError.message}`);
  }

  const averageRoi = roiData.length > 0
    ? parseFloat((roiData.reduce((sum, project) => sum + (project.roi || 0), 0) / roiData.length).toFixed(4))
    : 0;

  return { total: total || 0, approved: approved || 0, pending: pending || 0, averageRoi };
}

export async function getProjectDistribution(): Promise<{
  byBlockchain: { name: string; value: number }[];
  byAssetType: { name: string; value: number }[];
}> {
  const supabase = getSupabaseClient();
  
  // Fetch all approved projects to calculate distributions
  const { data, error } = await supabase
    .from("projects")
    .select("blockchain, type")
    .eq("approved", true);

  if (error) {
    console.error("Error fetching project distribution:", error);
    throw new Error(`Error fetching project distribution: ${error.message}`);
  }

  // Count by blockchain
  const blockchainCounts: Record<string, number> = {};
  
  // Count by asset type
  const assetTypeCounts: Record<string, number> = {};
  
  data.forEach(project => {
    if (project.blockchain) {
      blockchainCounts[project.blockchain] = (blockchainCounts[project.blockchain] || 0) + 1;
    }
    
    if (project.type) {
      assetTypeCounts[project.type] = (assetTypeCounts[project.type] || 0) + 1;
    }
  });

  // Convert to array format for charts
  const byBlockchain = Object.entries(blockchainCounts).map(([name, value]) => ({ name, value }));
  const byAssetType = Object.entries(assetTypeCounts).map(([name, value]) => ({ name, value }));

  return { byBlockchain, byAssetType };
}
