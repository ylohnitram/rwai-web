"use client"

import { useState, useEffect } from "react"
import { FileText, Download, AlertCircle, ExternalLink } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSignedUrl } from "@/lib/services/storage-service"
import DocumentWarning from "@/components/document-warning"

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
  const [documentUrl, setDocumentUrl] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    // If we have a stored document path, fetch a signed URL
    if (auditDocumentPath) {
      const fetchDocumentUrl = async () => {
        setIsLoading(true)
        setError(null)
        
        try {
          const url = await getSignedUrl("audit-documents", auditDocumentPath, 3600) // 1 hour expiry
          setDocumentUrl(url)
        } catch (err) {
          console.error("Error fetching document URL:", err)
          setError("Could not retrieve the audit document. It may have been removed or access is restricted.")
        } finally {
          setIsLoading(false)
        }
      }
      
      fetchDocumentUrl()
    } else if (auditUrl) {
      // Use the legacy audit URL if available and no document path
      setDocumentUrl(auditUrl)
    }
  }, [auditDocumentPath, auditUrl])

  const isExternalLink = documentUrl && !documentUrl.includes("audit-documents")

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Audit Report</CardTitle>
        <CardDescription>Security and legal audit information</CardDescription>
      </CardHeader>
      <CardContent>
        <DocumentWarning />

        {error ? (
          <Alert className="bg-red-900/30 border-red-800">
            <AlertCircle className="h-4 w-4 text-red-500" />
            <AlertTitle className="text-red-300">Error loading document</AlertTitle>
            <AlertDescription className="text-red-300">
              {error}
            </AlertDescription>
          </Alert>
        ) : isLoading ? (
          <div className="p-6 border border-gray-800 rounded-md text-center">
            <p>Loading document...</p>
          </div>
        ) : documentUrl ? (
          <div>
            <div className="p-6 border border-gray-800 rounded-md flex items-center justify-between">
              <div className="flex items-center">
                <FileText className="h-8 w-8 mr-3 text-blue-500" />
                <div>
                  <p className="font-medium">{projectName} Audit Report</p>
                  <p className="text-sm text-gray-400">
                    {isExternalLink ? 'External document' : 'PDF Document'}
                  </p>
                </div>
              </div>
              <div className="flex gap-2">
                {isExternalLink ? (
                  <Button asChild variant="outline">
                    <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                      <ExternalLink className="h-4 w-4 mr-2" />
                      View Report
                    </a>
                  </Button>
                ) : (
                  <>
                    <Button asChild variant="outline">
                      <a href={documentUrl} target="_blank" rel="noopener noreferrer">
                        <ExternalLink className="h-4 w-4 mr-2" />
                        View
                      </a>
                    </Button>
                    <Button asChild variant="default">
                      <a href={documentUrl} download={`${projectName.replace(/\s+/g, '_')}_Audit_Report.pdf`}>
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </a>
                    </Button>
                  </>
                )}
              </div>
            </div>
            
            {/* Optional preview for PDFs */}
            {documentUrl && documentUrl.endsWith('.pdf') && !isExternalLink && (
              <div className="mt-4 border border-gray-800 rounded-md overflow-hidden h-96">
                <iframe
                  src={`${documentUrl}#toolbar=0&navpanes=0`}
                  className="w-full h-full"
                  title={`${projectName} Audit Report`}
                />
              </div>
            )}
          </div>
        ) : (
          <div className="p-6 border border-gray-800 rounded-md text-center">
            <p className="text-gray-400">No audit document available for this project.</p>
          </div>
        )}
      </CardContent>
    </Card>
  )
}
