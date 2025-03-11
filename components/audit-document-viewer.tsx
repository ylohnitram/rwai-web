import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { ExternalLink, File, FileText } from "lucide-react"

interface AuditDocumentViewerProps {
  auditDocumentPath?: string
  auditUrl?: string
  projectName: string
}

export default function AuditDocumentViewer({
  auditDocumentPath,
  auditUrl,
  projectName
}: AuditDocumentViewerProps) {
  const documentUrl = auditDocumentPath ? 
    `/api/documents/audit/${projectName.toLowerCase().replace(/\s+/g, "-")}` : 
    auditUrl;

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <FileText className="h-5 w-5 mr-2 text-blue-500" />
          Audit Report
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="p-4 border border-gray-800 rounded-md bg-gray-800/50">
          <div className="flex items-center justify-between">
            <div className="flex items-center">
              <File className="h-5 w-5 mr-2 text-blue-500" />
              <div>
                <p className="font-medium">{projectName} Audit Report</p>
                <p className="text-sm text-gray-400">Security and compliance verification</p>
              </div>
            </div>
            {documentUrl && (
              <Button asChild variant="outline">
                <a 
                  href={documentUrl}
                  target="_blank" 
                  rel="noopener noreferrer"
                >
                  <ExternalLink className="h-4 w-4 mr-2" />
                  View Audit
                </a>
              </Button>
            )}
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
