import { useState, useEffect } from "react"
import { Clock, AlertCircle, FileEdit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Project } from "@/types/project"
import { getSupabaseClient } from "@/lib/supabase"

export function RequestQueue({ 
  onViewProject,
  refreshTrigger = 0
}: { 
  onViewProject: (project: Project) => void,
  refreshTrigger?: number
}) {
  const [pendingProjects, setPendingProjects] = useState<Project[]>([])
  const [changesProjects, setChangesProjects] = useState<Project[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchProjects()
    
    // Set up real-time subscription for project changes
    const supabase = getSupabaseClient()
    const subscription = supabase
      .channel('queue-projects')
      .on('postgres_changes', {
        event: '*',
        schema: 'public',
        table: 'projects',
        filter: `status=in.(pending,changes_requested)`
      }, () => {
        fetchProjects()
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [refreshTrigger])
  
  const fetchProjects = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      // Fetch pending projects
      const { data: pendingData, error: pendingError } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "pending")
        .order("created_at", { ascending: false })
      
      if (pendingError) {
        console.error("Error fetching pending projects:", pendingError)
      } else {
        setPendingProjects(pendingData || [])
      }
      
      // Fetch projects with requested changes
      const { data: changesData, error: changesError } = await supabase
        .from("projects")
        .select("*")
        .eq("status", "changes_requested")
        .order("updated_at", { ascending: false })
      
      if (changesError) {
        console.error("Error fetching changes requested projects:", changesError)
      } else {
        setChangesProjects(changesData || [])
      }
    } catch (error) {
      console.error("Error fetching projects:", error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Format date for display
  const formatDate = (isoDate: string) => {
    if (!isoDate) return "N/A"
    return new Date(isoDate).toLocaleString()
  }
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Clock className="h-5 w-5 mr-2 text-amber-500" />
          Request Queue
        </CardTitle>
        <CardDescription>Submissions awaiting review or updates</CardDescription>
      </CardHeader>
      <CardContent>
        <Tabs defaultValue="pending">
          <TabsList className="bg-gray-800 border border-gray-700 mb-4">
            <TabsTrigger value="pending">
              New Submissions
              {pendingProjects.length > 0 && (
                <Badge className="ml-2 bg-yellow-600">{pendingProjects.length}</Badge>
              )}
            </TabsTrigger>
            <TabsTrigger value="changes">
              Updates in Progress
              {changesProjects.length > 0 && (
                <Badge className="ml-2 bg-blue-600">{changesProjects.length}</Badge>
              )}
            </TabsTrigger>
          </TabsList>
          
          <TabsContent value="pending">
            {isLoading ? (
              <div className="text-center py-8">Loading projects...</div>
            ) : pendingProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No pending submissions</div>
            ) : (
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-900">
                    <TableRow className="hover:bg-gray-800 border-gray-800">
                      <TableHead className="font-medium">Project Name</TableHead>
                      <TableHead className="font-medium">Type</TableHead>
                      <TableHead className="font-medium">Submitted</TableHead>
                      <TableHead className="font-medium">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {pendingProjects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.type}</TableCell>
                        <TableCell>{formatDate(project.created_at || '')}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewProject(project)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
          
          <TabsContent value="changes">
            {isLoading ? (
              <div className="text-center py-8">Loading projects...</div>
            ) : changesProjects.length === 0 ? (
              <div className="text-center py-8 text-gray-400">No projects with requested changes</div>
            ) : (
              <div className="rounded-md border border-gray-800 overflow-hidden">
                <Table>
                  <TableHeader className="bg-gray-900">
                    <TableRow className="hover:bg-gray-800 border-gray-800">
                      <TableHead className="font-medium">Project Name</TableHead>
                      <TableHead className="font-medium">Type</TableHead>
                      <TableHead className="font-medium">Status Changed</TableHead>
                      <TableHead className="font-medium">Action</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {changesProjects.map((project) => (
                      <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                        <TableCell className="font-medium">
                          <div className="flex items-center">
                            <FileEdit className="h-4 w-4 text-amber-500 mr-2" />
                            {project.name}
                          </div>
                        </TableCell>
                        <TableCell>{project.type}</TableCell>
                        <TableCell>{formatDate(project.reviewed_at || '')}</TableCell>
                        <TableCell>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => onViewProject(project)}
                          >
                            Review
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            )}
          </TabsContent>
        </Tabs>
      </CardContent>
    </Card>
  )
}
