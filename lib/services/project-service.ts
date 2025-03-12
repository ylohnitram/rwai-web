import { getSupabaseClient } from "@/lib/supabase";
import { Project, ProjectReview, ProjectStatus } from "@/types/project";

export async function getProjects(options?: {
  page?: number;
  limit?: number;
  assetType?: string;
  blockchain?: string;
  minRoi?: number;
  maxRoi?: number;
  approved?: boolean;
  status?: ProjectStatus;
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
    status,
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

  // Handle both the old 'approved' field and new 'status' field
  if (approved !== undefined) {
    query = query.eq("approved", approved);
  }

  if (status !== undefined) {
    query = query.eq("status", status);
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

// Function to get project by slug
export async function getProjectBySlug(slug: string): Promise<Project | null> {
  const { data: projects } = await getProjects({ limit: 100 });
  
  // Helper function to generate slug from project name
  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }
  
  return projects.find(project => generateSlug(project.name) === slug) || null;
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
    .eq("status", "approved")
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
  
  // Make sure we're using the correct column name for auditUrl
  const projectData = {
    ...project,
    // Ensure we're using the right field name (audit_url) for the database
    audit_url: project.auditUrl || project.audit_url,
  };
  
  // Remove any fields that might not exist in the database schema
  if ('auditUrl' in projectData) {
    delete projectData['auditUrl'];
  }
  
  const { data, error } = await supabase
    .from("projects")
    .insert(projectData)
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

// Enhanced review functions
export async function reviewProject(
  id: string, 
  review: ProjectReview
): Promise<Project> {
  const supabase = getSupabaseClient();
  
  // Get current user session for reviewer ID
  const { data: { session } } = await supabase.auth.getSession();
  
  if (!session) {
    throw new Error("No active session found. Please log in.");
  }
  
  // Add reviewer info and timestamp
  const reviewData = {
    ...review,
    reviewer_id: session.user.id,
    reviewed_at: new Date().toISOString(),
  };
  
  // Update the project
  const { data, error } = await supabase
    .from("projects")
    .update(reviewData)
    .eq("id", id)
    .select()
    .single();

  if (error) {
    console.error("Error reviewing project:", error);
    throw new Error(`Error reviewing project: ${error.message}`);
  }

  return data as Project;
}

export async function approveProject(id: string, notes?: string): Promise<Project> {
  return reviewProject(id, { 
    id,
    status: 'approved', 
    review_notes: notes 
  });
}

export async function rejectProject(id: string, notes?: string): Promise<Project> {
  return reviewProject(id, { 
    id,
    status: 'rejected', 
    review_notes: notes 
  });
}

export async function requestChanges(id: string, notes: string): Promise<Project> {
  if (!notes || notes.trim() === '') {
    throw new Error("Notes are required when requesting changes");
  }
  
  return reviewProject(id, { 
    id,
    status: 'changes_requested', 
    review_notes: notes 
  });
}

export async function getProjectsByStatus(status: ProjectStatus, limit: number = 10): Promise<Project[]> {
  const { data } = await getProjects({ 
    status, 
    limit,
  });
  
  return data;
}

export async function getPendingProjects(limit: number = 10): Promise<Project[]> {
  return getProjectsByStatus('pending', limit);
}

export async function getProjectStats(): Promise<{
  total: number;
  approved: number;
  pending: number;
  rejected: number;
  changesRequested: number;
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

  // Get counts by status
  const { data: statusCounts, error: statusError } = await supabase
    .from("projects")
    .select("status");

  if (statusError) {
    console.error("Error fetching project statuses:", statusError);
    throw new Error(`Error fetching project statuses: ${statusError.message}`);
  }

  // Count each status
  const counts = {
    approved: 0,
    pending: 0,
    rejected: 0,
    changes_requested: 0
  };

  statusCounts.forEach(project => {
    if (project.status) {
      counts[project.status as keyof typeof counts]++;
    }
  });

  // Get average ROI
  const { data: roiData, error: roiError } = await supabase
    .from("projects")
    .select("roi")
    .eq("status", "approved");

  if (roiError) {
    console.error("Error fetching ROI data:", roiError);
    throw new Error(`Error fetching ROI data: ${roiError.message}`);
  }

  const averageRoi = roiData.length > 0
    ? parseFloat((roiData.reduce((sum, project) => sum + (project.roi || 0), 0) / roiData.length).toFixed(4))
    : 0;

  return { 
    total: total || 0, 
    approved: counts.approved, 
    pending: counts.pending,
    rejected: counts.rejected,
    changesRequested: counts.changes_requested,
    averageRoi 
  };
}

// Checks if a project with the same name already exists
export async function projectExists(name: string): Promise<boolean> {
  const supabase = getSupabaseClient();
  
  const { data, error, count } = await supabase
    .from("projects")
    .select("*", { count: "exact", head: true })
    .ilike("name", name);
    
  if (error) {
    console.error("Error checking if project exists:", error);
    throw new Error(`Error checking if project exists: ${error.message}`);
  }
  
  return (count || 0) > 0;
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
    .eq("status", "approved");

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

export async function getProjectsByType(type: string, limit: number = 3, excludeId?: string): Promise<Project[]> {
  const supabase = getSupabaseClient();
  
  let query = supabase
    .from("projects")
    .select("*")
    .eq("status", "approved")
    .eq("type", type)
    .limit(limit);
    
  // Exclude the current project if ID is provided
  if (excludeId) {
    query = query.neq("id", excludeId);
  }
  
  const { data, error } = await query;

  if (error) {
    console.error("Error fetching projects by type:", error);
    return [];
  }

  return data as Project[];
}

export async function getProjectsByFilters(
  assetType?: string,
  blockchain?: string,
  minRoi?: number,
  maxRoi?: number,
  page: number = 1,
  limit: number = 10
): Promise<{ projects: Project[], total: number }> {
  const { data: projects, count: total } = await getProjects({
    page,
    limit,
    assetType,
    blockchain,
    minRoi,
    maxRoi,
    status: 'approved', // Only get approved projects
  });

  return { projects, total };
}
