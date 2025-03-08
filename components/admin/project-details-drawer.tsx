import { File, AlertTriangle, CheckCircle, Shield, Check, X, FileEdit } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Drawer, DrawerContent, DrawerDescription, DrawerHeader, DrawerTitle } from "@/components/ui/drawer"
import { Project } from "@/types/project"

interface ProjectDetailsDrawerProps {
  project: Project | null;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  documentUrl: string | null;
  isProcessing: boolean;
  onApprove: (id: string) => Promise<void>;
  onRequestChanges: (id: string) => void;
  onReject: (id: string) => Promise<void>;
}

export function ProjectDetailsDrawer({ 
  project, 
  isOpen, 
  onOpenChange, 
  documentUrl,
  isProcessing,
  onApprove,
  onRequestChanges,
  onReject
}: ProjectDetailsDrawerProps) {
  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      <DrawerContent className="bg-gray-900 border-gray-800 max-h-[90vh]">
        <DrawerHeader>
          <DrawerTitle className="text-xl">Project Review: {project?.name}</DrawerTitle>
          <DrawerDescription>Review project details and automated checks before making a decision</DrawerDescription>
        </DrawerHeader>
        <div className="p-6 overflow-auto">
          {project && (
            <div className="space-y-6">
              {/* Project basic info */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <CardTitle>Project Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <p className="text-sm text-gray-400">Project Name</p>
                      <p className="text-lg font-medium">{project.name}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Asset Type</p>
                      <p className="text-lg font-medium">{project.type}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Blockchain</p>
                      <p className="text-lg font-medium">{project.blockchain}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Expected ROI</p>
                      <p className="text-lg font-medium text-blue-500">{project.roi}%</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">TVL</p>
                      <p className="text-lg font-medium">{project.tvl}</p>
                    </div>
                    <div>
                      <p className="text-sm text-gray-400">Submission Date</p>
                      <p className="text-lg font-medium">
                        {project.created_at ? new Date(project.created_at).toLocaleDateString() : "Unknown"}
                      </p>
                    </div>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Description</p>
                    <p className="mt-1 text-gray-300">{project.description}</p>
                  </div>
                  
                  <div>
                    <p className="text-sm text-gray-400">Website</p>
                    <a 
                      href={project.website} 
                      target="_blank" 
                      rel="noopener noreferrer"
                      className="text-blue-500 hover:underline"
                    >
                      {project.website}
                    </a>
                  </div>
                </CardContent>
              </Card>
              
              {/* Automated Security Checks */}
              <Card className="bg-gray-800 border-gray-700">
                <CardHeader>
                  <div className="flex items-center">
                    <Shield className="h-5 w-5 mr-2 text-amber-500" />
                    <CardTitle>Automated Security Checks</CardTitle>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {/* Mock data for demonstration - in a real implementation, these would come from the project data */}
                    <div className="flex items-start">
                      <div className="p-2 rounded-full mr-3 bg-green-900/30">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Scam Database</p>
                        <p className="text-sm text-gray-400">No matches found</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 rounded-full mr-3 bg-green-900/30">
                        <CheckCircle className="h-5 w-5 text-green-500" />
                      </div>
                      <div>
                        <p className="font-medium">Sanctions Check</p>
                        <p className="text-sm text-gray-400">No sanctions detected</p>
                      </div>
                    </div>
                    
                    <div className="flex items-start">
                      <div className="p-2 rounded-full mr-3 bg-yellow-900/30">
                        <AlertTriangle className="h-5 w-5 text-yellow-500" />
                      </div>
                      <div>
                        <p className="font-medium">Smart Contract Audit</p>
                        <p className="text-sm text-gray-400">
                          {project.audit_document_path ? "Provided" : "Not provided"}
                        </p>
                      </div>
                    </div>
                  </div>
                </CardContent>
              </Card>
              
              {/* Document Preview */}
              {project.audit_document_path && (
                <Card className="bg-gray-800 border-gray-700">
                  <CardHeader>
                    <div className="flex items-center">
                      <File className="h-5 w-5 mr-2 text-blue-500" />
                      <CardTitle>Audit Document</CardTitle>
                    </div>
                  </CardHeader>
                  <CardContent>
                    {documentUrl ? (
                      <div className="space-y-4">
                        <div className="p-4 border border-gray-700 rounded-md flex items-center justify-between bg-gray-900">
                          <div className="flex items-center">
                            <File className="h-8 w-8 mr-3 text-blue-500" />
                            <div>
                              <p className="font-medium">{project.name} Audit Document</p>
                              <p className="text-sm text-gray-400">
                                {project.audit_document_path.split('.').pop()?.toUpperCase() || 'Document'}
                              </p>
                            </div>
                          </div>
                          <div className="flex gap-2">
                            <Button asChild variant="outline" size="sm">
                              <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                                View
                              </a>
                            </Button>
                            <Button asChild variant="default" size="sm">
                              <a href={documentUrl} download>
                                Download
                              </a>
                            </Button>
                          </div>
                        </div>
                        
                        {/* If it's a PDF, we can show an embedded preview */}
                        {documentUrl.toLowerCase().endsWith('.pdf') && (
                          <div className="h-96 border border-gray-700 rounded-md overflow-hidden">
                            <iframe
                              src={`${documentUrl}#toolbar=0&navpanes=0`}
                              className="w-full h-full"
                              title={`${project.name} Audit Document`}
                            />
                          </div>
                        )}
                      </div>
                    ) : (
                      <div className="text-center py-8 text-gray-400">
                        Document exists but cannot be accessed
                      </div>
                    )}
                  </CardContent>
                </Card>
              )}
              
              {/* Action Buttons */}
              <div className="flex justify-end gap-3 pt-4">
                <Button 
                  variant="outline" 
                  onClick={() => onOpenChange(false)}
                >
                  Close
                </Button>
                <Button 
                  variant="destructive" 
                  onClick={() => {
                    onReject(project.id);
                    onOpenChange(false);
                  }}
                  disabled={isProcessing}
                >
                  <X className="h-4 w-4 mr-1" /> Reject
                </Button>
                <Button 
                  variant="outline"
                  className="border-amber-500 text-amber-500 hover:bg-amber-500/10"
                  onClick={() => {
                    onRequestChanges(project.id);
                    onOpenChange(false);
                  }}
                  disabled={isProcessing}
                >
                  <FileEdit className="h-4 w-4 mr-1" /> Request Changes
                </Button>
                <Button 
                  className="bg-green-600 hover:bg-green-700"
                  onClick={() => {
                    onApprove(project.id);
                    onOpenChange(false);
                  }}
                  disabled={isProcessing}
                >
                  <Check className="h-4 w-4 mr-1" /> Approve
                </Button>
              </div>
            </div>
          )}
        </div>
      </DrawerContent>
    </Drawer>
  )
}
