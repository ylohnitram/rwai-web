import { Check, X, FileEdit, File } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Project } from "@/types/project"

interface PendingProjectsTableProps {
  projects: Project[];
  isProcessing: boolean;
  onViewDetails: (project: Project) => void;
  onApprove: (id: string) => Promise<void>;
  onRequestChanges: (id: string) => void;
  onReject: (id: string) => Promise<void>;
}

export function PendingProjectsTable({ 
  projects, 
  isProcessing, 
  onViewDetails,
  onApprove, 
  onRequestChanges, 
  onReject 
}: PendingProjectsTableProps) {
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Pending Projects</CardTitle>
        <CardDescription>Review and approve new project submissions</CardDescription>
      </CardHeader>
      <CardContent>
        {projects.length > 0 ? (
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
                {projects.map((project) => (
                  <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                    <TableCell className="font-medium">
                      <div className="flex items-center gap-2">
                        {project.audit_document_path && (
                          <File className="h-4 w-4 text-blue-500" />
                        )}
                        {project.name}
                      </div>
                    </TableCell>
                    <TableCell>{project.type}</TableCell>
                    <TableCell>{project.blockchain}</TableCell>
                    <TableCell>
                      <Badge className="bg-blue-600 hover:bg-blue-700">{project.roi.toFixed(2)}%</Badge>
                    </TableCell>
                    <TableCell>
                      <div className="flex items-center gap-2">
                        <Button
                          size="sm"
                          variant="outline"
                          onClick={() => onViewDetails(project)}
                        >
                          View Details
                        </Button>
                        <Button
                          size="sm"
                          className="bg-green-600 hover:bg-green-700"
                          onClick={() => onApprove(project.id)}
                          disabled={isProcessing}
                        >
                          <Check className="h-4 w-4 mr-1" /> Approve
                        </Button>
                        <Button 
                          size="sm"
                          variant="outline"
                          className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                          onClick={() => onRequestChanges(project.id)}
                          disabled={isProcessing}
                        >
                          <FileEdit className="h-4 w-4 mr-1" /> Request Changes
                        </Button>
                        <Button 
                          size="sm" 
                          variant="destructive" 
                          onClick={() => onReject(project.id)}
                          disabled={isProcessing}
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
  )
}
