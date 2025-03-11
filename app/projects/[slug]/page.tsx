import Link from "next/link"
import { ArrowLeft, CheckCircle, ExternalLink, FileText } from "lucide-react"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Breadcrumbs from "@/components/breadcrumbs"
import ProjectSecuritySummary from "@/components/project-security-summary"
import AuditDocumentViewer from "@/components/audit-document-viewer"
import DocumentSectionWarning from "@/components/document-section-warning"
import { getProjectBySlug, getProjects } from "@/lib/services/project-service"
import { notFound } from "next/navigation"

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export async function generateStaticParams() {
  // Fetch all approved projects for static generation
  const { data: projects } = await getProjects({ status: 'approved', limit: 100 })

  return projects.map((project) => ({
    slug: generateSlug(project.name),
  }))
}

// Helper function to generate slug from project name
function generateSlug(name: string): string {
  return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)

  if (!project) {
    return {
      title: "Project Not Found | TokenDirectory by RWA Investors",
    }
  }

  return {
    title: `${project.name} | TokenDirectory by RWA Investors`,
    description: project.description,
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(project.name)}`],
      type: "website",
      title: `${project.name} | TokenDirectory by RWA Investors`,
      description: project.description,
    },
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(params.slug)

  if (!project || project.status !== 'approved') {
    notFound()
  }

  // Determine risk level based on project information
  const riskLevel = project.audit_document_path ? "low" : "medium";
  const auditVerified = !!project.audit_document_path;

  return (
    <div className="container py-8 px-4 md:px-6">
      <Breadcrumbs />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div className="flex items-center gap-2">
          <Button asChild variant="outline" size="sm">
            <Link href="/directory">
              <ArrowLeft className="h-4 w-4 mr-1" />
              Back
            </Link>
          </Button>
          <h1 className="text-3xl font-bold tracking-tighter">{project.name}</h1>
          <Badge className="bg-green-600 hover:bg-green-700">
            <CheckCircle className="h-3 w-3 mr-1" /> Verified
          </Badge>
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <a href={project.website} target="_blank" rel="noopener noreferrer">
              Visit Project <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </div>

      {/* Simplified Security Summary (no geolocation) */}
      <ProjectSecuritySummary
        scamReports={0}
        sanctionDetected={false}
        auditVerified={auditVerified}
        riskLevel={riskLevel as any}
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        <div className="md:col-span-2">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Description</CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-gray-300">{project.description}</p>
            </CardContent>
          </Card>

          {/* Documents Section */}
          {(project.audit_document_path || project.audit_url || project.whitepaper_document_path || project.whitepaper_url) && (
            <div className="mt-6">
              {/* Single document warning for all documents */}
              <DocumentSectionWarning />
              
              {/* Audit Document Viewer */}
              {(project.audit_document_path || project.audit_url) && (
                <AuditDocumentViewer 
                  auditDocumentPath={project.audit_document_path}
                  auditUrl={project.audit_url}
                  projectName={project.name}
                />
              )}
              
              {/* Whitepaper Document Section (if available) */}
              {(project.whitepaper_document_path || project.whitepaper_url) && (
                <Card className="bg-gray-900 border-gray-800 mt-6">
                  <CardHeader>
                    <CardTitle>Project Whitepaper</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="p-4 border border-gray-800 rounded-md bg-gray-800/50">
                      <div className="flex items-center justify-between">
                        <div className="flex items-center">
                          <FileText className="h-5 w-5 mr-2 text-blue-500" />
                          <div>
                            <p className="font-medium">{project.name} Whitepaper</p>
                            <p className="text-sm text-gray-400">Project documentation</p>
                          </div>
                        </div>
                        <Button asChild variant="outline">
                          <a 
                            href={project.whitepaper_url || 
                                  (project.whitepaper_document_path ? 
                                    `/api/documents/whitepaper/${project.id}` : 
                                    `${project.website}/whitepaper`)}
                            target="_blank" 
                            rel="noopener noreferrer"
                          >
                            <ExternalLink className="h-4 w-4 mr-2" />
                            View Whitepaper
                          </a>
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}
            </div>
          )}
        </div>

        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <p className="text-sm font-medium text-gray-400">Asset Type</p>
                  <p className="text-lg font-semibold">{project.type}</p>
                  <Separator className="my-2 bg-gray-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Blockchain</p>
                  <p className="text-lg font-semibold">{project.blockchain}</p>
                  <Separator className="my-2 bg-gray-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Expected ROI</p>
                  <p className="text-lg font-semibold text-blue-500">{project.roi}%</p>
                  <Separator className="my-2 bg-gray-800" />
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Total Value Locked</p>
                  <p className="text-lg font-semibold">{project.tvl}</p>
                </div>
                <div>
                  <p className="text-sm font-medium text-gray-400">Status</p>
                  <Badge className="bg-green-600 hover:bg-green-700 mt-1">
                    Approved & Listed
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="mt-6 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Official Links</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={project.website} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Website
                  </a>
                </Button>
                
                {(project.whitepaper_url || project.whitepaper_document_path) && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a 
                      href={project.whitepaper_url || 
                            (project.whitepaper_document_path ? 
                              `/api/documents/whitepaper/${project.id}` : 
                              `${project.website}/whitepaper`)}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Whitepaper
                    </a>
                  </Button>
                )}
                
                {(project.audit_url || project.audit_document_path) && (
                  <Button asChild variant="outline" className="w-full justify-start">
                    <a 
                      href={project.audit_url ||
                            (project.audit_document_path ? 
                              `/api/documents/audit/${project.id}` : 
                              "#")}
                      target="_blank" 
                      rel="noopener noreferrer"
                    >
                      <ExternalLink className="h-4 w-4 mr-2" />
                      Audit Report
                    </a>
                  </Button>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
