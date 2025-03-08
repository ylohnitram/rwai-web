"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { Check, X, LogOut, FileText, AlertCircle, MessageSquare } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Textarea } from "@/components/ui/textarea"
import { Alert, AlertTitle, AlertDescription } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase"
import { Project, ProjectStatus } from "@/types/project"
import { 
  getProjects, 
  getProjectStats, 
  getProjectDistribution,
  approveProject, 
  rejectProject,
  requestChanges,
  getPendingProjects
} from "@/lib/services/project-service"

export default function AdminPage() {
  const router = useRouter()
  const [projects, setProjects] = useState<{
    pending: Project[];
    changesRequested: Project[];
    recent: Project[];
  }>({
    pending: [],
    changesRequested: [],
    recent: []
  })
  
  const [isSigningOut, setIsSigningOut] = useState(false)
  const [stats, setStats] = useState({
    total: 0,
    approved: 0,
    pending: 0,
    rejected: 0,
    changesRequested: 0,
    averageRoi: 0
  })
  
  const [distribution, setDistribution] = useState({
    byBlockchain: [] as { name: string; value: number }[],
    byAssetType: [] as { name: string; value: number }[]
  })
  
  const [isLoading, setIsLoading] = useState(true)
  const [authError, setAuthError] = useState<string | null>(null)
  
  // Dialog state for project actions
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [dialogAction, setDialogAction] = useState<"approve" | "reject" | "request_changes">("approve")
  const [selectedProject, setSelectedProject] = useState<Project | null>(null)
  const [reviewNotes, setReviewNotes] = useState("")

  // Check authentication status
  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch('/api/admin/auth/check');
        
        if (!response.ok) {
          const data = await response.json();
          setAuthError(data.message || 'Authentication failed');
          
          // Redirect to login after a delay
          setTimeout(() => {
            router.push('/login');
          }, 3000);
          
          return false;
        }
        
        return true;
      } catch (error) {
        console.error('Auth check error:', error);
        setAuthError('Failed to verify authentication status');
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        
        return false;
      }
    };
    
    checkAuth();
  }, [router]);

  // Load data on component mount
  useEffect(() => {
    const loadData = async () => {
      setIsLoading(true)
      try {
        // First check authentication
        const response = await fetch('/api/admin/auth/check');
        if (!response.ok) {
          const data = await response.json();
          setAuthError(data.message || 'Authentication failed');
          setIsLoading(false);
          return;
        }
        
        // Load projects by status
        const { data: pendingData } = await getProjects({ status: 'pending' })
        const { data: changesRequestedData } = await getProjects({ status: 'changes_requested' })
        const { data: recentData } = await getProjects({ limit: 5 })
        
        setProjects({
          pending: pendingData,
          changesRequested: changesRequestedData,
          recent: recentData
        })

        // Load stats
        const statsData = await getProjectStats()
        setStats(statsData)

        // Load distribution data
        const distributionData = await getProjectDistribution()
        setDistribution(distributionData)
      } catch (error) {
        console.error("Error loading admin data:", error)
      } finally {
        setIsLoading(false)
      }
    }

    loadData()
  }, [])

  // Open dialog for project action
  const openActionDialog = (project: Project, action: "approve" | "reject" | "request_changes") => {
    setSelectedProject(project)
    setDialogAction(action)
    setReviewNotes("")
    setIsDialogOpen(true)
  }

  // Handle dialog submission
  const handleDialogSubmit = async () => {
    if (!selectedProject) return
    
    try {
      // First check authentication
      const authResponse = await fetch('/api/admin/auth/check');
      if (!authResponse.ok) {
        const authData = await authResponse.json();
        setAuthError(authData.message || 'Session expired. Please log in again.');
        setIsDialogOpen(false);
        
        // Redirect to login after a delay
        setTimeout(() => {
          router.push('/login');
        }, 3000);
        return;
      }
      
      // Use the API endpoint for project reviews instead of direct service calls
      const response = await fetch(`/api/admin/projects/${selectedProject.id}/review`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: dialogAction === "approve" ? "approved" : 
                 dialogAction === "reject" ? "rejected" : "changes_requested",
          review_notes: reviewNotes
        }),
      });
      
      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Failed to update project');
      }
      
      // Update UI based on action
      switch (dialogAction) {
        case "approve":
          // Remove from pending list
          setProjects(prev => ({
            ...prev,
            pending: prev.pending.filter(p => p.id !== selectedProject.id)
          }))
          break
        case "reject":
          // Remove from all lists
          setProjects(prev => ({
            ...prev,
            pending: prev.pending.filter(p => p.id !== selectedProject.id),
            changesRequested: prev.changesRequested.filter(p => p.id !== selectedProject.id)
          }))
          break
        case "request_changes":
          if (!reviewNotes.trim()) {
            alert("Please provide notes when requesting changes")
            return
          }
          // Move from pending to changes requested
          setProjects(prev => ({
            ...prev,
            pending: prev.pending.filter(p => p.id !== selectedProject.id),
            changesRequested: [
              { ...selectedProject, status: 'changes_requested' as ProjectStatus, review_notes: reviewNotes },
              ...prev.changesRequested
            ]
          }))
          break
      }
      
      // Update stats
      setStats(prev => {
        const newStats = { ...prev }
        
        if (dialogAction === "approve") {
          newStats.pending--
          newStats.approved++
        } else if (dialogAction === "reject") {
          if (selectedProject?.status === "pending") {
            newStats.pending--
          } else if (selectedProject?.status === "changes_requested") {
            newStats.changesRequested--
          }
          newStats.rejected++
        } else if (dialogAction === "request_changes") {
          newStats.pending--
          newStats.changesRequested++
        }
        
        return newStats
      })
      
      setIsDialogOpen(false)
    } catch (error) {
      console.error(`Error ${dialogAction} project:`, error)
      alert(`Failed to ${dialogAction.replace('_', ' ')} project: ${error instanceof Error ? error.message : 'Unknown error'}`)
    }
  }

  // Handle sign out with thorough session cleanup using the API
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      // Create a Supabase client
      const supabase = getSupabaseClient()
      
      // Use our server-side route to sign out
      const response = await fetch('/api/auth/logout', {
        method: 'POST',
      });
      
      if (!response.ok) {
        throw new Error('Logout failed');
      }
      
      // Additional client-side cleanup
      
      // Clear any cookies
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
      
      // Clear local storage items related to auth
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('supabase.auth.expires_at')
      localStorage.removeItem('supabase.auth.refresh_token')
      
      // Clear session storage
      sessionStorage.clear()
      
      // Force a full page reload to ensure all state is cleared
      window.location.href = '/login?signedout=true'
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
      
      // Try direct client-side signout as a fallback
      try {
        const supabase = getSupabaseClient()
        await supabase.auth.signOut({ scope: 'global' })
        window.location.href = '/login?signedout=true'
      } catch (fallbackError) {
        console.error("Fallback signout failed:", fallbackError)
      }
    }
  }

  // Helper to generate status badge
  const getStatusBadge = (status: ProjectStatus) => {
    switch (status) {
      case 'approved':
        return <Badge className="bg-green-600 hover:bg-green-700">Approved</Badge>
      case 'pending':
        return <Badge className="bg-yellow-600 hover:bg-yellow-700">Pending</Badge>
      case 'rejected':
        return <Badge className="bg-red-600 hover:bg-red-700">Rejected</Badge>
      case 'changes_requested':
        return <Badge className="bg-blue-600 hover:bg-blue-700">Changes Requested</Badge>
      default:
        return <Badge className="bg-gray-600 hover:bg-gray-700">{status}</Badge>
    }
  }

  if (authError) {
    return (
      <div className="container py-8 px-4 md:px-6">
        <Alert className="mb-8 bg-red-900/30 border-red-800">
          <AlertCircle className="h-4 w-4 text-red-500" />
          <AlertTitle className="text-red-300">Authentication Error</AlertTitle>
          <AlertDescription className="text-red-300">
            {authError}. Redirecting to login page...
          </AlertDescription>
        </Alert>
      </div>
    )
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
      <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-4 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.total}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Approved</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-green-500">{stats.approved}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Pending</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-yellow-500">{stats.pending}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Changes Req.</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-blue-500">{stats.changesRequested}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Rejected</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-red-500">{stats.rejected}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-lg">Avg. ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold text-amber-500">
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

      {/* Projects Tabs */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Project Management</CardTitle>
          <CardDescription>Review, approve, or request changes to submitted projects</CardDescription>
        </CardHeader>
        <CardContent>
          <Tabs defaultValue="pending" className="w-full">
            <TabsList className="grid grid-cols-3 mb-6">
              <TabsTrigger value="pending">
                Pending Review
                {stats.pending > 0 && (
                  <Badge className="ml-2 bg-yellow-600">{stats.pending}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="changes">
                Changes Requested
                {stats.changesRequested > 0 && (
                  <Badge className="ml-2 bg-blue-600">{stats.changesRequested}</Badge>
                )}
              </TabsTrigger>
              <TabsTrigger value="recent">Recent Activity</TabsTrigger>
            </TabsList>
            
            {/* Pending Tab */}
            <TabsContent value="pending">
              {projects.pending.length > 0 ? (
                <div className="rounded-md border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow className="hover:bg-gray-800 border-gray-800">
                        <TableHead className="font-medium">Project Name</TableHead>
                        <TableHead className="font-medium">Asset Type</TableHead>
                        <TableHead className="font-medium">Blockchain</TableHead>
                        <TableHead className="font-medium">ROI</TableHead>
                        <TableHead className="font-medium">Contact</TableHead>
                        <TableHead className="font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.pending.map((project) => (
                        <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.type}</TableCell>
                          <TableCell>{project.blockchain}</TableCell>
                          <TableCell>
                            <Badge className="bg-blue-600 hover:bg-blue-700">{project.roi.toFixed(2)}%</Badge>
                          </TableCell>
                          <TableCell>
                            {project.contact_email ? (
                              <a href={`mailto:${project.contact_email}`} className="text-blue-400 hover:underline">
                                {project.contact_email}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openActionDialog(project, "approve")}
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="outline"
                                className="border-blue-500 text-blue-500 hover:bg-blue-500/10"
                                onClick={() => openActionDialog(project, "request_changes")}
                              >
                                <MessageSquare className="h-4 w-4 mr-1" /> Request Changes
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => openActionDialog(project, "reject")}
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
            </TabsContent>
            
            {/* Changes Requested Tab */}
            <TabsContent value="changes">
              {projects.changesRequested.length > 0 ? (
                <div className="rounded-md border border-gray-800 overflow-hidden">
                  <Table>
                    <TableHeader className="bg-gray-900">
                      <TableRow className="hover:bg-gray-800 border-gray-800">
                        <TableHead className="font-medium">Project Name</TableHead>
                        <TableHead className="font-medium">Asset Type</TableHead>
                        <TableHead className="font-medium">Review Notes</TableHead>
                        <TableHead className="font-medium">Contact</TableHead>
                        <TableHead className="font-medium">Actions</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {projects.changesRequested.map((project) => (
                        <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                          <TableCell className="font-medium">{project.name}</TableCell>
                          <TableCell>{project.type}</TableCell>
                          <TableCell>
                            <div className="max-w-md truncate">
                              {project.review_notes || "No notes provided"}
                            </div>
                          </TableCell>
                          <TableCell>
                            {project.contact_email ? (
                              <a href={`mailto:${project.contact_email}`} className="text-blue-400 hover:underline">
                                {project.contact_email}
                              </a>
                            ) : (
                              <span className="text-gray-400">Not provided</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Button
                                size="sm"
                                className="bg-green-600 hover:bg-green-700"
                                onClick={() => openActionDialog(project, "approve")}
                              >
                                <Check className="h-4 w-4 mr-1" /> Approve
                              </Button>
                              <Button 
                                size="sm" 
                                variant="destructive" 
                                onClick={() => openActionDialog(project, "reject")}
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
                <div className="text-center py-8 text-gray-400">No projects with requested changes</div>
              )}
            </TabsContent>
            
            {/* Recent Activity Tab */}
            <TabsContent value="recent">
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-900">
                    <TableRow className="hover:bg-gray-800 border-gray-800">
                      <TableHead className="font-medium">Project Name</TableHead>
                      <TableHead className="font-medium">Asset Type</TableHead>
                      <TableHead className="font-medium">Status</TableHead>
                      <TableHead className="font-medium">ROI</TableHead>
                      <TableHead className="font-medium">Last Updated</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {projects.recent.map((project) => (
                      <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.type}</TableCell>
                        <TableCell>{getStatusBadge(project.status)}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-600 hover:bg-blue-700">{project.roi.toFixed(2)}%</Badge>
                        </TableCell>
                        <TableCell>
                          {project.updated_at ? new Date(project.updated_at).toLocaleString() : 'Unknown'}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </TabsContent>
          </Tabs>
        </CardContent>
      </Card>
      
      {/* Action Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>
              {dialogAction === "approve" 
                ? "Approve Project" 
                : dialogAction === "reject" 
                  ? "Reject Project" 
                  : "Request Changes"}
            </DialogTitle>
            <DialogDescription>
              {dialogAction === "approve" 
                ? "The project will be listed in the public directory." 
                : dialogAction === "reject" 
                  ? "The project will be rejected and the submitter will be notified." 
                  : "Specify what changes are needed for approval."}
            </DialogDescription>
          </DialogHeader>
          
          <div className="space-y-4 py-2">
            <div className="flex space-x-2 items-center">
              <span className="font-medium">Project:</span>
              <span>{selectedProject?.name}</span>
            </div>
            
            <div>
              <label className="block text-sm font-medium mb-1">
                {dialogAction === "approve" 
                  ? "Approval Notes (Optional)" 
                  : dialogAction === "reject" 
                    ? "Rejection Reason" 
                    : "Requested Changes"}
              </label>
              <Textarea
                value={reviewNotes}
                onChange={(e) => setReviewNotes(e.target.value)}
                placeholder={dialogAction === "approve" 
                  ? "Any additional notes for the project submitter" 
                  : dialogAction === "reject" 
                    ? "Explain why this project is being rejected" 
                    : "Specify the changes needed for approval"}
                className="bg-gray-800 border-gray-700"
                rows={4}
              />
              {dialogAction === "request_changes" && (
                <p className="text-sm text-gray-400 mt-1">
                  <AlertCircle className="inline h-3 w-3 mr-1" />
                  This feedback will be sent directly to the project submitter
                </p>
              )}
            </div>
          </div>
          
          <DialogFooter>
            <Button 
              variant="ghost" 
              onClick={() => setIsDialogOpen(false)}
            >
              Cancel
            </Button>
            <Button 
              onClick={handleDialogSubmit}
              className={
                dialogAction === "approve" 
                  ? "bg-green-600 hover:bg-green-700" 
                  : dialogAction === "reject" 
                    ? "bg-red-600 hover:bg-red-700" 
                    : "bg-blue-600 hover:bg-blue-700"
              }
            >
              {dialogAction === "approve" 
                ? "Approve Project" 
                : dialogAction === "reject" 
                  ? "Reject Project" 
                  : "Send Request"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
