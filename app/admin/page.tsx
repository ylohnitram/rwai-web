"use client"

import { useState, useEffect } from "react"
import { Check, X, LogOut, FileEdit } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { getSupabaseClient } from "@/lib/supabase"
import { Project } from "@/types/project"

export default function AdminPage() {
  const [pendingProjects, setPendingProjects] = useState<Project[]>([])
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [isLoading, setIsLoading] = useState(true)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    averageRoi: 0
  })
  const [distribution, setDistribution] = useState({
    byBlockchain: [] as { name: string; value: number }[],
    byAssetType: [] as { name: string; value: number }[]
  })
  
  // For request changes dialog
  const [requestChangesOpen, setRequestChangesOpen] = useState(false)
  const [selectedProjectId, setSelectedProjectId] = useState<string | null>(null)
  const [requestNotes, setRequestNotes] = useState("")

  // Correctly fetch pending projects from Supabase
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
      
      console.log("Fetched pending projects:", data); // Debug log
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

      console.log("Stats:", { total, approved, pending, averageRoi }); // Debug log
      
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

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
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
      } catch (error) {
        console.error("Error loading admin data:", error);
      } finally {
        setIsLoading(false);
      }
    }

    loadData();
  }, []);

  const handleApproveProject = async (id: string) => {
    try {
      console.log(`Approving project ${id} using direct API`);
      
      // Use the direct update API instead
      const response = await fetch(`/api/admin/projects/direct-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'approve'
        }),
      });
      
      // Log the raw response for debugging
      console.log(`Response status: ${response.status}`);
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to approve project');
      }
      
      // Update the UI
      setPendingProjects((prev) => prev.filter((project) => project.id !== id));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        total: prevStats.total,
        approved: prevStats.approved + 1,
        pending: prevStats.pending - 1
      }));
      
      // Show success message
      alert("Project approved successfully");
    } catch (error) {
      console.error("Error approving project:", error);
      alert(`Failed to approve project: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const handleRejectProject = async (id: string) => {
    try {
      console.log(`Rejecting project ${id} using direct API`);
      
      // Use the direct update API instead
      const response = await fetch(`/api/admin/projects/direct-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id,
          action: 'reject'
        }),
      });
      
      // Log the raw response for debugging
      console.log(`Response status: ${response.status}`);
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to reject project');
      }
      
      // Update the UI
      setPendingProjects((prev) => prev.filter((project) => project.id !== id));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        total: prevStats.total,
        approved: prevStats.approved,
        pending: prevStats.pending - 1,
        rejected: (prevStats.rejected || 0) + 1
      }));
      
      // Show success message
      alert("Project rejected successfully");
    } catch (error) {
      console.error("Error rejecting project:", error);
      alert(`Failed to reject project: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  const openRequestChangesDialog = (id: string) => {
    setSelectedProjectId(id);
    setRequestNotes("");
    setRequestChangesOpen(true);
  };

  const handleRequestChanges = async () => {
    if (!selectedProjectId || !requestNotes.trim()) {
      alert("Please provide feedback notes before submitting");
      return;
    }

    try {
      console.log(`Requesting changes for project ${selectedProjectId} with notes: ${requestNotes} using direct API`);
      
      // Use the direct update API instead
      const response = await fetch(`/api/admin/projects/direct-update`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          id: selectedProjectId,
          action: 'request-changes',
          notes: requestNotes
        }),
      });
      
      // Log the raw response for debugging
      console.log(`Response status: ${response.status}`);
      
      const result = await response.json();
      console.log('Response data:', result);
      
      if (!response.ok) {
        throw new Error(result.error || 'Failed to request changes');
      }
      
      // Close dialog and reset fields
      setRequestChangesOpen(false);
      setSelectedProjectId(null);
      setRequestNotes("");
      
      // Update the UI - optionally remove from pending list
      setPendingProjects((prev) => prev.filter((project) => project.id !== selectedProjectId));
      
      // Update stats
      setStats(prevStats => ({
        ...prevStats,
        pending: prevStats.pending - 1
      }));
      
      // Show success message
      alert("Changes requested successfully");
    } catch (error) {
      console.error("Error requesting changes:", error);
      alert(`Failed to request changes: ${error instanceof Error ? error.message : "Unknown error"}`);
    }
  };

  // Handle sign out
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = getSupabaseClient()
      
      // Complete server-side sign out
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear any cookies or local storage
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
      
      // Clear local storage items related to auth
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('supabase.auth.expires_at')
      localStorage.removeItem('supabase.auth.refresh_token')
      
      // Clear session storage as well
      sessionStorage.clear()
      
      // Force a full page reload to ensure all state is cleared
      window.location.href = '/login?signedout=true'
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 text-center">
        <p>Loading admin dashboard...</p>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
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

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Approved Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Average ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">
              {stats.averageRoi}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Projects by Blockchain</CardTitle>
            <CardDescription>Distribution of approved projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution.byBlockchain}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Projects by Asset Type</CardTitle>
            <CardDescription>Distribution of approved projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={distribution.byAssetType}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Projects Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Pending Projects</CardTitle>
          <CardDescription>Review and approve new project submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProjects.length > 0 ? (
            <div className="rounded-md border border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="hover:bg-gray-800 border-gray-800">
                    <TableHead className="font-medium">Project Name</TableHead>
                    <TableHead className="font-medium">Asset Type</TableHead>
                    <TableHead className="font-medium">Blockchain</TableHead>
                    <TableHead className="font-medium">ROI</TableHead>
                    <TableHead className="font-medium">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {pendingProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.type}</TableCell>
                      <TableCell>{project.blockchain}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600 hover:bg-blue-700">{project.roi.toFixed(2)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => handleApproveProject(project.id)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button 
                            size="sm"
                            variant="outline"
                            className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                            onClick={() => openRequestChangesDialog(project.id)}
                          >
                            <FileEdit className="h-4 w-4 mr-1" /> Request Changes
                          </Button>
                          <Button 
                            size="sm" 
                            variant="destructive" 
                            onClick={() => handleRejectProject(project.id)}
                          >
                            <X className="h-4 w-4 mr-1" /> Reject
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          ) : (
            <div className="text-center py-8 text-gray-400">No pending projects to review</div>
          )}
        </CardContent>
      </Card>

      {/* Request Changes Dialog */}
      <Dialog open={requestChangesOpen} onOpenChange={setRequestChangesOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Request Changes</DialogTitle>
            <DialogDescription>
              Provide feedback to the project owner about what needs to be changed.
            </DialogDescription>
          </DialogHeader>
          <Textarea
            placeholder="Enter your feedback here..."
            className="min-h-[150px] bg-gray-800 border-gray-700"
            value={requestNotes}
            onChange={(e) => setRequestNotes(e.target.value)}
          />
          <DialogFooter>
            <Button variant="outline" onClick={() => setRequestChangesOpen(false)}>
              Cancel
            </Button>
            <Button onClick={handleRequestChanges}>
              Send Feedback
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
