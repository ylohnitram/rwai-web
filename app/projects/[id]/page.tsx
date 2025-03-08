import Link from "next/link"
import { ArrowLeft, CheckCircle, ExternalLink, FileText } from "lucide-react"
import type { Metadata } from "next"

import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Breadcrumbs from "@/components/breadcrumbs"
import TokenWarning from "@/components/token-warning"
import DocumentWarning from "@/components/document-warning"
import GeolocationWarning from "@/components/geolocation-warning"
import LegalDisclaimer from "@/components/legal-disclaimer"
import RiskSummary from "@/components/risk-summary"
import { getProjectById, getProjects } from "@/lib/services/project-service"
import { notFound } from "next/navigation"
import TokenCheckResult from "@/components/token-check-result";

interface ProjectPageProps {
  params: {
    id: string
  }
}

export async function generateStaticParams() {
  // Fetch all approved projects for static generation
  const { data: projects } = await getProjects({ approved: true, limit: 100 })
  
  return projects.map((project) => ({
    id: project.id,
  }))
}

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectById(params.id)

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
  const project = await getProjectById(params.id)

  if (!project || !project.approved) {
    notFound()
  }

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
          {project.approved && (
            <Badge className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-3 w-3 mr-1" /> Verified
            </Badge>
          )}
        </div>
        <div className="mt-4 md:mt-0">
          <Button asChild>
            <a href={project.website} target="_blank" rel="noopener noreferrer">
              Visit Project <ExternalLink className="h-4 w-4 ml-1" />
            </a>
          </Button>
        </div>
      </div>

      {/* Risk Summary Component */}
      <RiskSummary 
        projectId={project.id}
        riskLevel="low"
        scamReports={0}
        sanctionDetected={false}
        auditVerified={true}
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

          <Card className="mt-6 bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Audit Report</CardTitle>
              <CardDescription>Security and legal audit information</CardDescription>
            </CardHeader>
            <CardContent>
              {/* Document Warning Component */}
              <DocumentWarning />
              
              <div className="p-6 border border-gray-800 rounded-md flex items-center justify-between">
                <div className="flex items-center">
                  <FileText className="h-8 w-8 mr-3 text-blue-500" />
                  <div>
                    <p className="font-medium">Project Audit Report</p>
                    <p className="text-sm text-gray-400">PDF Document - Last updated 3 months ago</p>
                  </div>
                </div>
                <Button asChild variant="outline">
                  <a href={project.auditUrl || '#'} target="_blank" rel="noopener noreferrer">
                    View Report
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>

        <div>
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Key Metrics</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
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
                    <FileText className="h-4 w-4 mr-2" />
                    Whitepaper
                  </a>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
      
      {/* Add Token Warning and Geolocation Warning at the bottom */}
      <div className="mt-8">
        <TokenCheckResult 
          scamReports={0} 
          sanctionDetected={false} 
          auditVerified={true} 
        />
        <GeolocationWarning />
        <LegalDisclaimer />
      </div>
    </div>
  )
}
