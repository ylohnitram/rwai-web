"use client";

import { useState, useEffect } from "react";
import { useToast } from "@/hooks/use-toast";
import { Project, ProjectValidation } from "@/types/project";
import { 
  approveProject, 
  rejectProject, 
  requestChanges 
} from "@/app/actions";
import { validateProject } from "@/lib/services/validation-service";
import { ProjectDetailsDrawer } from "@/components/admin/project-details-drawer";
import { RequestChangesDialog } from "@/components/admin/request-changes-dialog";
import { PendingProjectsTable } from "@/components/admin/pending-projects-table";
import { StatsCards } from "@/components/admin/stats-cards";
import { DistributionCharts } from "@/components/admin/distribution-charts";
import { RequestQueue } from "@/components/admin/request-queue";
import { getSupabaseClient } from "@/lib/supabase";

export default function AdminProjectsPage() {
  const { toast } = useToast();
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [isDrawerOpen, setIsDrawerOpen] = useState(false);
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [whitepaperUrl, setWhitepaperUrl] = useState<string | null>(null);
  const [auditUrl, setAuditUrl] = useState<string | null>(null);
  const [whitepaperDocumentUrl, setWhitepaperDocumentUrl] = useState<string | null>(null);
  const [isRequestChangesDialogOpen, setIsRequestChangesDialogOpen] = useState(false);
  const [projectForChanges, setProjectForChanges] = useState<string | null>(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    averageRoi: 0
  });
  const [distribution, setDistribution] = useState({
    byBlockchain: [] as { name: string; value: number }[],
    byAssetType: [] as { name: string; value: number }[]
  });
  const [validation, setValidation] = useState<ProjectValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  const [projectValidations, setProjectValidations] = useState<Record<string, ProjectValidation | null>>({});
  const [refreshTrigger, setRefreshTrigger] = useState(0);
  const [adminId, setAdminId] = useState<string | undefined>(undefined);

  useEffect(() => {
    const getCurrentUser = async () => {
      const supabase = getSupabaseClient();
      const { data } = await supabase.auth.getSession();
      if (data.session) {
        setAdminId(data.session.user.id);
      }
    };
    
    getCurrentUser();
  }, []);

  // Fetch pending projects
  useEffect(() => {
    const fetchPendingProjects = async () => {
      setIsLoading(true);
      setError(null);
      try {
        const supabase = getSupabaseClient();
        
        // Fetch projects with status 'pending'
        const { data, error } = await supabase
          .from("projects")
          .select("*")
          .eq("status", "pending")
          .order("created_at", { ascending: false });
          
        if (error) {
          throw error;
        }
        
        setPendingProjects(data as Project[]);
        
        // Perform automated validation for all projects
        const validationResults: Record<string, ProjectValidation | null> = {};
        
        for (const project of data) {
          try {
            const validation = await validateProject(project);
            validationResults[project.id] = validation;
          } catch (err) {
            console.error(`Error validating project ${project.id}:`, err);
            validationResults[project.id] = null;
          }
        }
        
        setProjectValidations(validationResults);
      } catch (err) {
        console.error("Error fetching pending projects:", err);
        setError(err instanceof Error ? err.message : "An unexpected error occurred");
      } finally {
        setIsLoading(false);
      }
    };
    
    const fetchStats = async () => {
      try {
        const supabase = getSupabaseClient();
        
        // Get counts by status
        const [
          { count: totalCount }, 
          { count: approvedCount }, 
          { count: pendingCount }
        ] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "pending")
        ]);
        
        // Get average ROI for approved projects
        const { data: roiData } = await supabase
          .from("projects")
          .select("roi")
          .eq("status", "approved");
          
        const avgRoi = roiData && roiData.length > 0
          ? roiData.reduce((sum, project) => sum + (project.roi || 0), 0) / roiData.length
          : 0;
          
        setStats({
          total: totalCount || 0,
          approved: approvedCount || 0,
          pending: pendingCount || 0,
          averageRoi: parseFloat(avgRoi.toFixed(2))
        });
        
        // Get distribution data
        const { data: allProjects } = await supabase
          .from("projects")
          .select("blockchain, type")
          .eq("status", "approved");
        
        if (allProjects) {
          // Count by blockchain
          const blockchainCounts: Record<string, number> = {};
          // Count by asset type
          const assetTypeCounts: Record<string, number> = {};
          
          allProjects.forEach(project => {
            if (project.blockchain) {
              blockchainCounts[project.blockchain] = (blockchainCounts[project.blockchain] || 0) + 1;
            }
            
            if (project.type) {
              assetTypeCounts[project.type] = (assetTypeCounts[project.type] || 0) + 1;
            }
          });
          
          setDistribution({
            byBlockchain: Object.entries(blockchainCounts).map(([name, value]) => ({ name, value })),
            byAssetType: Object.entries(assetTypeCounts).map(([name, value]) => ({ name, value }))
          });
        }
      } catch (err) {
        console.error("Error fetching stats:", err);
      }
    };
    
    fetchPendingProjects();
    fetchStats();
  }, [refreshTrigger]);

  // Handle viewing project details
  const handleViewDetails = async (project: Project) => {
    setSelectedProject(project);
    
    // Check if project has an audit document
    if (project.audit_document_path) {
      try {
        const supabase = getSupabaseClient();
        const { data } = supabase.storage
          .from('audit-documents')
          .getPublicUrl(project.audit_document_path);
        
        setDocumentUrl(data.publicUrl);
      } catch (err) {
        console.error("Error getting document URL:", err);
        setDocumentUrl(null);
      }
    } else {
      setDocumentUrl(null);
    }
    
    // Check if project has audit URL
    setAuditUrl(project.audit_url || null);
    
    // Check if project has whitepaper document
    if (project.whitepaper_document_path) {
      try {
        const supabase = getSupabaseClient();
        const { data } = supabase.storage
          .from('whitepaper-documents')
          .getPublicUrl(project.whitepaper_document_path);
        
        setWhitepaperDocumentUrl(data.publicUrl);
      } catch (err) {
        console.error("Error getting whitepaper document URL:", err);
        setWhitepaperDocumentUrl(null);
      }
    } else {
      setWhitepaperDocumentUrl(null);
    }
    
    // Check if project has whitepaper URL
    setWhitepaperUrl(project.whitepaper_url || null);
    
    // Get validation results
    setValidation(projectValidations[project.id] || null);
    
    setIsDrawerOpen(true);
  };

  // Handle validating a project
  const handleValidateProject = async (id: string) => {
    if (!selectedProject) return;
    
    setIsValidating(true);
    
    try {
      const validationResult = await validateProject(selectedProject);
      setValidation(validationResult);
      
      // Update projectValidations state
      setProjectValidations(prev => ({
        ...prev,
        [id]: validationResult
      }));
      
      toast({
        title: "Validation Complete",
        description: `Project validation completed with risk level: ${validationResult.riskLevel.toUpperCase()}`,
      });
    } catch (err) {
      console.error("Error validating project:", err);
      toast({
        title: "Validation Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Handle approving a project
  const handleApproveProject = async (id: string) => {
    setIsProcessing(true);
    
    try {
      const result = await approveProject(id);
      
      if (result.success) {
        toast({
          title: "Project Approved",
          description: "The project has been successfully approved and is now listed in the directory."
        });
        
        // Remove from pending projects
        setPendingProjects(prev => prev.filter(project => project.id !== id));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          approved: prev.approved + 1,
          pending: prev.pending - 1
        }));
        
        // Refresh the request queue
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(result.error || "Failed to approve project");
      }
    } catch (err) {
      console.error("Error approving project:", err);
      toast({
        title: "Approval Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle rejecting a project
  const handleRejectProject = async (id: string) => {
    setIsProcessing(true);
    
    try {
      const result = await rejectProject(id);
      
      if (result.success) {
        toast({
          title: "Project Rejected",
          description: "The project has been rejected."
        });
        
        // Remove from pending projects
        setPendingProjects(prev => prev.filter(project => project.id !== id));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1
        }));
        
        // Refresh the request queue
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(result.error || "Failed to reject project");
      }
    } catch (err) {
      console.error("Error rejecting project:", err);
      toast({
        title: "Rejection Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle opening request changes dialog
  const handleOpenRequestChanges = (id: string) => {
    setProjectForChanges(id);
    setRequestNotes("");
    setIsRequestChangesDialogOpen(true);
  };

  // Handle submitting request changes
  const handleSubmitRequestChanges = async () => {
    if (!projectForChanges || !requestNotes) return;
    
    setIsProcessing(true);
    
    try {
      const result = await requestChanges(projectForChanges, requestNotes);
      
      if (result.success) {
        toast({
          title: "Changes Requested",
          description: "The request for changes has been sent to the project owner."
        });
        
        // Remove from pending projects
        setPendingProjects(prev => prev.filter(project => project.id !== projectForChanges));
        
        // Update stats
        setStats(prev => ({
          ...prev,
          pending: prev.pending - 1
        }));
        
        // Close dialog
        setIsRequestChangesDialogOpen(false);
        
        // Refresh the request queue
        setRefreshTrigger(prev => prev + 1);
      } else {
        throw new Error(result.error || "Failed to request changes");
      }
    } catch (err) {
      console.error("Error requesting changes:", err);
      toast({
        title: "Request Error",
        description: err instanceof Error ? err.message : "An unexpected error occurred",
        variant: "destructive"
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle manual validation override
  const handleValidationOverride = async (updatedValidation: ProjectValidation) => {
    try {
      const response = await fetch(`/api/admin/validation-override`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: selectedProject?.id,
          validation: updatedValidation
        }),
      });
      
      if (!response.ok) {
        const data = await response.json();
        throw new Error(data.error || 'Failed to save validation override');
      }
      
      // Update local state
      setValidation(updatedValidation);
      
      // Update project validations
      if (selectedProject) {
        setProjectValidations(prev => ({
          ...prev,
          [selectedProject.id]: updatedValidation
        }));
      }
      
      toast({
        title: "Validation Updated",
        description: "The manual validation has been saved successfully."
      });
    } catch (err) {
      console.error('Error applying validation override:', err);
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save validation override',
        variant: "destructive",
      });
      throw err;
    }
  };

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Projects Management</h1>
          <p className="text-gray-400">Review, approve, and manage tokenized asset projects</p>
        </div>
      </div>

      {/* Stats Cards */}
      <StatsCards 
        total={stats.total} 
        approved={stats.approved} 
        pending={stats.pending}
        averageRoi={stats.averageRoi} 
      />

      {/* Request Queue */}
      <div className="mb-8">
        <RequestQueue 
          onViewProject={handleViewDetails}
          refreshTrigger={refreshTrigger}
        />
      </div>

      {/* Pending Projects Table */}
      <PendingProjectsTable 
        projects={pendingProjects}
        validations={projectValidations}
        isProcessing={isProcessing}
        onViewDetails={handleViewDetails}
        onApprove={handleApproveProject}
        onRequestChanges={handleOpenRequestChanges}
        onReject={handleRejectProject}
      />

      {/* Project Distribution Charts */}
      <DistributionCharts 
        byBlockchain={distribution.byBlockchain}
        byAssetType={distribution.byAssetType}
      />

      {/* Project Details Drawer */}
      <ProjectDetailsDrawer 
        project={selectedProject}
        isOpen={isDrawerOpen}
        onOpenChange={setIsDrawerOpen}
        documentUrl={documentUrl}
        whitepaperUrl={whitepaperUrl}
        whitepaperDocumentUrl={whitepaperDocumentUrl}
        auditUrl={auditUrl}
        validation={validation}
        isValidating={isValidating}
        isProcessing={isProcessing}
        onValidate={handleValidateProject}
        onApprove={handleApproveProject}
        onRequestChanges={handleOpenRequestChanges}
        onReject={handleRejectProject}
        onValidationOverride={handleValidationOverride}
        adminId={adminId}
      />

      {/* Request Changes Dialog */}
      <RequestChangesDialog
        isOpen={isRequestChangesDialogOpen}
        onOpenChange={setIsRequestChangesDialogOpen}
        requestNotes={requestNotes}
        onNotesChange={setRequestNotes}
        onSubmit={handleSubmitRequestChanges}
        isProcessing={isProcessing}
      />
    </div>
  );
}
