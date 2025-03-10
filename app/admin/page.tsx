'use client'

import { useState, useEffect } from "react";
import { LogOut } from "lucide-react";
import { useToast } from "@/hooks/use-toast";

import { Button } from "@/components/ui/button";
import { Project } from "@/types/project";
import { approveProject, rejectProject, requestChanges, saveProjectValidation, fetchValidationResults } from "../actions";
import { Toaster } from "@/components/ui/toaster";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { getSupabaseClient } from "@/lib/supabase";

// Import validation services
import { 
  validateProject, 
  ProjectValidation 
} from "@/lib/services/validation-service";

// Import our components
import { StatsCards } from "@/components/admin/stats-cards";
import { DistributionCharts } from "@/components/admin/distribution-charts";
import { PendingProjectsTable } from "@/components/admin/pending-projects-table";
import { AuditLog } from "@/components/admin/audit-log";
import { ProjectDetailsDrawer } from "@/components/admin/project-details-drawer";
import { RequestChangesDialog } from "@/components/admin/request-changes-dialog";

export default function AdminPage() {
  const { toast } = useToast();
  const [pendingProjects, setPendingProjects] = useState<Project[]>([]);
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
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
  
  // For request changes dialog
  const [requestChangesOpen, setRequestChangesOpen] = useState(false);
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null);
  const [requestNotes, setRequestNotes] = useState("");
  const [isProcessing, setIsProcessing] = useState(false);
  
  // For project details drawer
  const [selectedProject, setSelectedProject] = useState<Project | null>(null);
  const [isDetailsOpen, setIsDetailsOpen] = useState(false);
  const [documentUrl, setDocumentUrl] = useState<string | null>(null);
  const [whitepaperUrl, setWhitepaperUrl] = useState<string | null>(null);
  
  // For validation
  const [validations, setValidations] = useState<Record<string, ProjectValidation | null>>({});
  const [currentValidation, setCurrentValidation] = useState<ProjectValidation | null>(null);
  const [isValidating, setIsValidating] = useState(false);
  
  // For audit log
  const [auditLog, setAuditLog] = useState<Array<{
    id: string;
    timestamp: string;
    projectId: string;
    projectName: string;
    action: string;
    notes?: string;
  }>>([]);

  // Fetch pending projects from Supabase
  const fetchPendingProjects = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Get pending projects by status column instead of approved column
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "pending");
        
      if (error) {
        console.error("Error fetching pending projects:", error);
        return [];
      }
      
      // For each project, try to fetch its validation results using the server action
      const projectValidations: Record<string, ProjectValidation | null> = {};
      
      await Promise.all(
        data.map(async (project) => {
          try {
            const { success, data: validation, error } = await fetchValidationResults(project.id);
            
            if (success && validation) {
              projectValidations[project.id] = validation;
            } else if (error) {
              console.error(`Error fetching validation for project ${project.id}:`, error);
            }
          } catch (error) {
            console.error(`Error fetching validation for project ${project.id}:`, error);
          }
        })
      );
      
      // Update validations state
      setValidations(projectValidations);
      
      return data as Project[];
    } catch (error) {
      console.error("Error fetching pending projects:", error);
      return [];
    }
  };

  // Fetch project stats
  const fetchProjectStats = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Get total count
      const { count: total } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true });

      // Get approved count (using status column)
      const { count: approved } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "approved");

      // Get pending count (using status column)
      const { count: pending } = await supabase
        .from("projects")
        .select("*", { count: "exact", head: true })
        .eq("status", "pending");

      // Get average ROI for approved projects
      const { data: roiData } = await supabase
        .from("projects")
        .select("roi")
        .eq("status", "approved");

      const averageRoi = roiData && roiData.length > 0
        ? parseFloat((roiData.reduce((sum, project) => sum + (project.roi || 0), 0) / roiData.length).toFixed(1))
        : 0;
      
      return { 
        total: total || 0, 
        approved: approved || 0, 
        pending: pending || 0, 
        averageRoi 
      };
    } catch (error) {
      console.error("Error fetching project stats:", error);
      return { total: 0, approved: 0, pending: 0, averageRoi: 0 };
    }
  };

  // Fetch project distributions
  const fetchProjectDistribution = async () => {
    try {
      const supabase = getSupabaseClient();
      
      // Fetch all approved projects
      const { data } = await supabase
        .from("projects")
        .select("blockchain, type")
        .eq("status", "approved");

      if (!data) {
        return { byBlockchain: [], byAssetType: [] };
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
    } catch (error) {
      console.error("Error fetching project distribution:", error);
      return { byBlockchain: [], byAssetType: [] };
    }
  };

  // Function to log actions to the audit log
  const logAction = (projectId: string, projectName: string, action: string, notes?: string) => {
    const logEntry = {
      id: Date.now().toString(),
      timestamp: new Date().toISOString(),
      projectId,
      projectName,
      action,
      notes
    };
    
    setAuditLog(prev => [logEntry, ...prev]);
    
    // Also save to localStorage for persistence
    try {
      const existingLog = JSON.parse(localStorage.getItem('adminAuditLog') || '[]');
      localStorage.setItem('adminAuditLog', JSON.stringify([logEntry, ...existingLog]));
    } catch (error) {
      console.error("Error saving to localStorage:", error);
    }
  };

  // Function to validate a project
  const handleValidateProject = async (id: string) => {
    setIsValidating(true);
    try {
      // Find the project
      const project = pendingProjects.find(p => p.id === id);
      if (!project) {
        throw new Error('Project not found');
      }
      
      // Run validation
      const validationResult = await validateProject(project);
      
      // Save validation results using the server action
      const saveResult = await saveProjectValidation(id, validationResult);
      
      if (!saveResult.success) {
        throw new Error(`Failed to save validation: ${saveResult.error}`);
      }
      
      // Update state
      setCurrentValidation(validationResult);
      setValidations(prev => ({
        ...prev,
        [id]: validationResult
      }));
      
      // Log the validation action
      logAction(
        id, 
        project.name, 
        "validated", 
        `Risk level: ${validationResult.riskLevel}, Overall: ${validationResult.overallPassed ? 'Passed' : 'Failed'}`
      );
      
      // Show appropriate toast based on validation result
      if (!validationResult.overallPassed) {
        toast({
          title: "Validation Failed",
          description: "This project has failed critical validation checks and should be rejected.",
          variant: "destructive",
        });
      } else {
        toast({
          title: "Validation Complete",
          description: `Risk level: ${validationResult.riskLevel.toUpperCase()}`,
          className: "bg-green-800 border-green-700 text-white",
        });
      }
    } catch (error) {
      console.error("Error validating project:", error);
      toast({
        title: "Validation failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsValidating(false);
    }
  };

  // Open project details drawer
  const openProjectDetails = async (project: Project) => {
    setSelectedProject(project);
    setIsDetailsOpen(true);
    setCurrentValidation(null);
    setWhitepaperUrl(null);
    
    // If the project has an audit document, get a URL for it
    if (project.audit_document_path) {
      try {
        const supabase = getSupabaseClient();
        const { data } = supabase.storage
          .from('audit-documents')
          .getPublicUrl(project.audit_document_path);
        
        setDocumentUrl(data.publicUrl);
      } catch (error) {
        console.error('Error getting document URL:', error);
        setDocumentUrl(null);
      }
    } else {
      setDocumentUrl(null);
    }
    
    // Try to get whitepaper URL from project website
    if (project.website) {
      // Simplified approach - in a real implementation, you would 
      // have more project-specific information or metadata
      const whitepaper = `${project.website.replace(/\/$/, '')}/whitepaper`;
      setWhitepaperUrl(whitepaper);
    }
    
    // Try to fetch existing validation results
    try {
      // First check if we already have it in state
      if (validations[project.id]) {
        setCurrentValidation(validations[project.id]);
      } else {
        // Fetch from database using server action
        const { success, data: validation } = await fetchValidationResults(project.id);
        
        if (success && validation) {
          setCurrentValidation(validation);
          // Also update the validations state
          setValidations(prev => ({
            ...prev,
            [project.id]: validation
          }));
        }
      }
    } catch (error) {
      console.error('Error fetching validation results:', error);
      setCurrentValidation(null);
    }
  };

  // Function to refresh stats after any action
  const refreshStats = async () => {
    try {
      // Refresh stats
      const statsData = await fetchProjectStats();
      setStats(statsData);

      // Refresh distribution data
      const distributionData = await fetchProjectDistribution();
      setDistribution(distributionData);
    } catch (error) {
      console.error("Error refreshing stats:", error);
    }
  };

  // Open request changes dialog
  const openRequestChangesDialog = (id: string) => {
    setSelectedProjectId(id);
    setRequestNotes("");
    setRequestChangesOpen(true);
  };

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true);
      try {
        // Load pending projects
        const pendingData = await fetchPendingProjects();
        setPendingProjects(pendingData);

        // Load stats
        const statsData = await fetchProjectStats();
        setStats(statsData);

        // Load distribution data
        const distributionData = await fetchProjectDistribution();
        setDistribution(distributionData);
        
        // Load audit log from localStorage if available
        try {
          const savedLog = localStorage.getItem('adminAuditLog');
          if (savedLog) {
            setAuditLog(JSON.parse(savedLog));
          }
        } catch (error) {
          console.error("Error loading audit log:", error);
        }
      } catch (error) {
        console.error("Error loading admin data:", error);
        toast({
          title: "Error loading data",
          description: "Failed to load dashboard data. Please refresh the page.",
          variant: "destructive",
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadData();
  }, []);

  const handleApproveProject = async (id: string) => {
    setIsProcessing(true);
    try {
      // Find the project name before we filter it out
      const project = pendingProjects.find(p => p.id === id);
      const projectName = project?.name || "Unknown project";
      
      const result = await approveProject(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to approve project');
      }
      
      // Update the UI immediately
      setPendingProjects((prev) => prev.filter((project) => project.id !== id));
      
      // Refresh stats from the server
      await refreshStats();
      
      // Log the action to audit log
      logAction(id, projectName, "approved");
      
      toast({
        title: `Project approved: ${projectName}`,
        description: "The project has been successfully approved and is now listed in the directory.",
        className: "bg-green-800 border-green-700 text-white",
      });
    } catch (error) {
      console.error("Error approving project:", error);
      toast({
        title: "Approval failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRejectProject = async (id: string) => {
    setIsProcessing(true);
    try {
      // Find the project name before we filter it out
      const project = pendingProjects.find(p => p.id === id);
      const projectName = project?.name || "Unknown project";
      
      const result = await rejectProject(id);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to reject project');
      }
      
      // Update the UI immediately
      setPendingProjects((prev) => prev.filter((project) => project.id !== id));
      
      // Refresh stats from the server
      await refreshStats();
      
      // Log the action to audit log
      logAction(id, projectName, "rejected");
      
      toast({
        title: `Project rejected: ${projectName}`,
        description: "The project has been rejected and will not be listed in the directory.",
        className: "bg-red-800 border-red-700 text-white",
      });
    } catch (error) {
      console.error("Error rejecting project:", error);
      toast({
        title: "Rejection failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  const handleRequestChanges = async () => {
    if (!selectedProjectId || !requestNotes.trim()) {
      toast({
        title: "Input required",
        description: "Please provide feedback notes before submitting",
        variant: "destructive",
      });
      return;
    }

    setIsProcessing(true);
    try {
      // Find the project name before we filter it out
      const project = pendingProjects.find(p => p.id === selectedProjectId);
      const projectName = project?.name || "Unknown project";
      
      const result = await requestChanges(selectedProjectId, requestNotes);
      
      if (!result.success) {
        throw new Error(result.error || 'Failed to request changes');
      }
      
      // Close dialog and reset fields
      setRequestChangesOpen(false);
      setSelectedProjectId(null);
      setRequestNotes("");
      
      // Update the UI immediately
      setPendingProjects((prev) => prev.filter((project) => project.id !== selectedProjectId));
      
      // Refresh stats from the server
      await refreshStats();
      
      // Log the action to audit log
      logAction(selectedProjectId, projectName, "requested changes", requestNotes);
      
      toast({
        title: `Changes requested: ${projectName}`,
        description: "Feedback has been sent to the project owner.",
        className: "bg-amber-800 border-amber-700 text-white",
      });
    } catch (error) {
      console.error("Error requesting changes:", error);
      toast({
        title: "Request failed",
        description: error instanceof Error ? error.message : "An unknown error occurred",
        variant: "destructive",
      });
    } finally {
      setIsProcessing(false);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = getSupabaseClient();
      
      // Complete server-side sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear any cookies or local storage
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      // Clear local storage items related to auth
      localStorage.removeItem('supabase.auth.token');
      localStorage.removeItem('supabase.auth.expires_at');
      localStorage.removeItem('supabase.auth.refresh_token');
      
      // Clear session storage as well
      sessionStorage.clear();
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Force a full page reload to ensure all state is cleared
      setTimeout(() => {
        window.location.href = '/login?signedout=true';
      }, 1000);
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
      setIsSigningOut(false);
    }
  };

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 text-center">
        <p>Loading admin dashboard...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <Toaster />
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage directory projects and view platform statistics</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-gray-700 hover:border-red-500 hover:text-red-500"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>

      {/* Stats Cards */}
      <StatsCards 
        total={stats.total}
        approved={stats.approved}
        pending={stats.pending}
        averageRoi={stats.averageRoi}
      />

      {/* Tabs for Projects and Audit Log */}
      <Tabs defaultValue="projects" className="mb-8">
        <TabsList className="bg-gray-900 border border-gray-800">
          <TabsTrigger value="projects">Projects</TabsTrigger>
          <TabsTrigger value="audit">Audit Log</TabsTrigger>
        </TabsList>
        
        <TabsContent value="projects">
          {/* Charts */}
          <DistributionCharts 
            byBlockchain={distribution.byBlockchain}
            byAssetType={distribution.byAssetType}
          />

          {/* Pending Projects Table */}
          <PendingProjectsTable 
            projects={pendingProjects}
            validations={validations}
            isProcessing={isProcessing}
            onViewDetails={openProjectDetails}
            onApprove={handleApproveProject}
            onRequestChanges={openRequestChangesDialog}
            onReject={handleRejectProject}
          />
        </TabsContent>
        
        <TabsContent value="audit">
          {/* Audit Log */}
          <AuditLog logEntries={auditLog} />
        </TabsContent>
      </Tabs>

      {/* Project Details Drawer */}
      <ProjectDetailsDrawer 
        project={selectedProject}
        isOpen={isDetailsOpen}
        onOpenChange={setIsDetailsOpen}
        documentUrl={documentUrl}
        whitepaperUrl={whitepaperUrl}
        validation={currentValidation}
        isValidating={isValidating}
        isProcessing={isProcessing}
        onValidate={handleValidateProject}
        onApprove={handleApproveProject}
        onRequestChanges={openRequestChangesDialog}
        onReject={handleRejectProject}
      />

      {/* Request Changes Dialog */}
      <RequestChangesDialog 
        isOpen={requestChangesOpen}
        onOpenChange={setRequestChangesOpen}
        requestNotes={requestNotes}
        onNotesChange={setRequestNotes}
        onSubmit={handleRequestChanges}
        isProcessing={isProcessing}
      />
    </div>
  );
}
