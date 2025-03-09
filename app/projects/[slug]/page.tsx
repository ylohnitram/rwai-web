"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { ArrowLeft, CheckCircle, ExternalLink } from "lucide-react"
import { useParams } from "next/navigation"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Breadcrumbs from "@/components/breadcrumbs"
import ProjectSecuritySummary from "@/components/project-security-summary"
import AuditDocumentViewer from "@/components/audit-document-viewer"
import { getProjectBySlug } from "@/lib/services/project-service"
import { Project } from "@/types/project"

export default function ProjectPage() {
  const params = useParams<{ slug: string }>()
  const [project, setProject] = useState<Project | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [userRegion, setUserRegion] = useState<"US" | "EU" | null>(null)

  useEffect(() => {
    const fetchProject = async () => {
      if (!params.slug) return
      
      try {
        const projectData = await getProjectBySlug(params.slug as string)
        setProject(projectData)
      } catch (error) {
        console.error("Error fetching project:", error)
      } finally {
        setIsLoading(false)
      }
    }

    const fetchUserRegion = async () => {
      try {
        // Call your existing geolocation API
        const response = await fetch('/api/geolocation')
        const data = await response.json()
        
        if (data.country) {
          // EU countries list
          const euCountries = [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
          ]
          
          if (data.country === 'US') {
            setUserRegion('US')
          } else if (euCountries.includes(data.country)) {
            setUserRegion('EU')
          } else {
            setUserRegion(null)
          }
        }
      } catch (error) {
        console.error("Error fetching user region:", error)
      }
    }

    fetchProject()
    fetchUserRegion()
  }, [params.slug])

  if (isLoading) {
    return <div className="container py-8 px-4 md:px-6">Loading project details...</div>
  }

  if (!project || project.status !== 'approved') {
    return <div className="container py-8 px-4 md:px-6">Project not found</div>
  }

  // Determine risk level based on project information
  const riskLevel = project.audit_document_path ? "low" : "medium"
  const auditVerified = !!project.audit_document_path

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

      {/* Consolidated Security Summary */}
      <ProjectSecuritySummary
        scamReports={0}
        sanctionDetected={false}
        auditVerified={auditVerified}
        riskLevel={riskLevel as any}
        showRegionalNotice={!!userRegion}
        region={userRegion}
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

          {/* Audit Document Viewer */}
          <AuditDocumentViewer 
            auditDocumentPath={project.audit_document_path}
            auditUrl={project.auditUrl}
            projectName={project.name}
          />
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
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={`${project.website}/whitepaper`} target="_blank" rel="noopener noreferrer">
                    <ExternalLink className="h-4 w-4 mr-2" />
                    Whitepaper
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}
