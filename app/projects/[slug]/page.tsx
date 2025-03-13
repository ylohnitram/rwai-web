import Link from "next/link"
import { ArrowLeft, CheckCircle, ExternalLink, FileText, Globe, BarChart4, LandPlot, Database, ShieldCheck, Calendar, Clock, AlertTriangle, XCircle } from "lucide-react"
import type { Metadata } from "next"
import { BlockchainIcon } from "@/components/icons/blockchain-icon"
import { formatTVL } from "@/lib/utils"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Separator } from "@/components/ui/separator"
import Breadcrumbs from "@/components/breadcrumbs"
import AuditDocumentViewer from "@/components/audit-document-viewer"
import DocumentSectionWarning from "@/components/document-section-warning"
import ProjectDescriptionCard from "@/components/project-description-card"
import RelatedProjects from "@/components/related-projects"
import ProjectAssessmentSection from "@/components/project-assessment-section"
import { getProjectBySlug, getProjects, getProjectsByType } from "@/lib/services/project-service"
import { notFound } from "next/navigation"
import { ProjectSchema, BreadcrumbSchema } from "@/components/seo/structured-data"
import { createClient } from '@supabase/supabase-js';

interface ProjectPageProps {
  params: {
    slug: string
  }
}

export const dynamic = 'force-dynamic';

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

// Create a Supabase client with service role for server-side usage
const supabaseServer = createClient(
  process.env.NEXT_PUBLIC_SUPABASE_URL || '',
  process.env.SUPABASE_SERVICE_ROLE_KEY || '',
  {
    auth: {
      autoRefreshToken: false,
      persistSession: false
    }
  }
);

export async function generateMetadata({ params }: ProjectPageProps): Promise<Metadata> {
  const project = await getProjectBySlug(params.slug)

  if (!project) {
    return {
      title: "Project Not Found | TokenDirectory by RWA Investors",
    }
  }

  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app";
  const projectUrl = `${baseUrl}/projects/${params.slug}`;

  return {
    title: `${project.name} | TokenDirectory by RWA Investors`,
    description: project.description.substring(0, 160),
    authors: [{ name: "RWA Investors" }],
    keywords: [project.name, project.type, "tokenized assets", "RWA", project.blockchain, "investment"],
    alternates: {
      canonical: projectUrl,
    },
    openGraph: {
      images: [`/api/og?title=${encodeURIComponent(project.name)}`],
      type: "website",
      title: `${project.name} | TokenDirectory by RWA Investors`,
      description: project.description.substring(0, 160),
      url: projectUrl,
      siteName: "TokenDirectory by RWA Investors",
    },
    twitter: {
      card: "summary_large_image",
      title: `${project.name} | TokenDirectory by RWA Investors`,
      description: project.description.substring(0, 160),
      images: [`/api/og?title=${encodeURIComponent(project.name)}`],
    },
  }
}

async function fetchProjectValidation(projectId: string) {
  try {
    // Fetch validation results directly from the database
    const { data, error } = await supabaseServer
      .from("validation_results")
      .select("*")
      .eq("project_id", projectId)
      .single();
    
    if (error || !data) {
      return null;
    }
    
    // Transform to the expected validation format
    return {
      scamCheck: {
        passed: data.scam_check_passed,
        details: data.scam_check_details,
        manualOverride: data.scam_check_override || false,
        manualNotes: data.scam_check_notes
      },
      sanctionsCheck: {
        passed: data.sanctions_check_passed,
        details: data.sanctions_check_details,
        manualOverride: data.sanctions_check_override || false,
        manualNotes: data.sanctions_check_notes
      },
      auditCheck: {
        passed: data.audit_check_passed,
        details: data.audit_check_details,
        manualOverride: data.audit_check_override || false,
        manualNotes: data.audit_check_notes
      },
      riskLevel: data.risk_level,
      overallPassed: data.overall_passed,
      manuallyReviewed: data.manually_reviewed || false,
      reviewedBy: data.reviewer_id,
      reviewedAt: data.reviewed_at
    };
  } catch (error) {
    console.error('Error fetching validation:', error);
    return null;
  }
}

export default async function ProjectPage({ params }: ProjectPageProps) {
  const project = await getProjectBySlug(params.slug)

  if (!project || project.status !== 'approved') {
    notFound()
  }

  // Fetch validation results from the database
  const validationData = await fetchProjectValidation(project.id);

  // Determine audit status and risk level based on validation or fallback to project information
  let hasAudit = Boolean(project.audit_url || project.audit_document_path);
  let auditVerified = hasAudit;
  let sanctionDetected = false;
  let scamReports = 0;
  let riskLevel: "low" | "medium" | "high" = "medium";
  
  // If we have validation data, use it to determine status
  if (validationData) {
    auditVerified = validationData.auditCheck.passed;
    sanctionDetected = !validationData.sanctionsCheck.passed;
    scamReports = validationData.scamCheck.passed ? 0 : 1;
    riskLevel = validationData.riskLevel as "low" | "medium" | "high";
  } else {
    // Fallback to old logic
    riskLevel = hasAudit ? "low" : "medium";
  }
  
  // Get related projects of the same type
  const relatedProjects = await getProjectsByType(project.type, 3, project.id);

  // Format date for better display
  const formattedDate = project.created_at ? 
    new Date(project.created_at).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    }) : 'Unknown';

  // Generate breadcrumb items for structured data
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app";
  const breadcrumbItems = [
    { name: "Home", url: baseUrl },
    { name: "Directory", url: `${baseUrl}/directory` },
    { name: project.name, url: `${baseUrl}/projects/${params.slug}` }
  ];

  return (
    <div className="container py-8 px-4 md:px-6">
      <Breadcrumbs />
      
      {/* Add structured data */}
      <ProjectSchema project={project} />
      <BreadcrumbSchema items={breadcrumbItems} />
      
      {/* Project Header with Visual Badge */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-6">
        <div>
          <div className="flex items-center gap-2 mb-2">
            <Button asChild variant="outline" size="sm">
              <Link href="/directory">
                <ArrowLeft className="h-4 w-4 mr-1" />
                Back to Directory
              </Link>
            </Button>
            <Badge className="bg-green-600 hover:bg-green-700">
              <CheckCircle className="h-3 w-3 mr-1" /> Verified
            </Badge>
          </div>
          <h1 className="text-3xl font-bold tracking-tighter">{project.name}</h1>
          <p className="text-gray-400 mt-1 flex items-center">
            <Calendar className="h-4 w-4 mr-1" />
            Listed since {formattedDate}
          </p>
        </div>
        <div className="mt-4 md:mt-0 flex gap-2">
          <Button asChild variant="outline">
            <Link href={`/directory?assetType=${encodeURIComponent(project.type)}`}>
              <LandPlot className="h-4 w-4 mr-1" />
              Browse {project.type}
            </Link>
          </Button>
          <Button asChild>
            <a href={project.website} target="_blank" rel="noopener noreferrer">
              <Globe className="h-4 w-4 mr-1" />
              Visit Website
            </a>
          </Button>
        </div>
      </div>

      {/* Simplified Security Summary with updated styling */}
      <ProjectAssessmentSection
          scamReports={scamReports}
          sanctionDetected={sanctionDetected}
          auditVerified={auditVerified}
          riskLevel={riskLevel}
          validationData={validationData}
      />

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Main Content Area - 2/3 width on desktop */}
        <div className="lg:col-span-2 space-y-6">
          {/* Project Overview Card */}
          <Card className="bg-gray-900 border-gray-800 overflow-hidden">
            <CardHeader className="bg-gray-800/50 pb-2">
              <CardTitle className="flex items-center">
                <Database className="h-5 w-5 mr-2 text-amber-500" />
                Project Overview
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-6">
              <div className="prose prose-invert max-w-none">
                <div className="text-gray-300 break-words whitespace-pre-wrap max-w-full">
                  {project.description}
                </div>
              </div>
              
              {/* Key Features Section */}
              <div className="mt-6 pt-6 border-t border-gray-800">
                <h3 className="font-medium text-lg mb-4 flex items-center">
                  <CheckCircle className="h-5 w-5 mr-2 text-green-500" />
                  Key Project Features
                </h3>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-amber-500/10 mr-3">
                      <BlockchainIcon className="h-5 w-5 text-amber-500" />
                    </div>
                    <div>
                      <p className="font-medium">{project.blockchain} Network</p>
                      <p className="text-sm text-gray-400">Transaction Security</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-green-500/10 mr-3">
                      <BarChart4 className="h-5 w-5 text-green-500" />
                    </div>
                    <div>
                      <p className="font-medium">{project.roi}% Expected ROI</p>
                      <p className="text-sm text-gray-400">Annual Return Rate</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-blue-500/10 mr-3">
                      <Database className="h-5 w-5 text-blue-500" />
                    </div>
                    <div>
                      <p className="font-medium">{formatTVL(project.tvl)}</p>
                      <p className="text-sm text-gray-400">Total Value Locked</p>
                    </div>
                  </div>
                  <div className="flex items-start">
                    <div className="p-2 rounded-full bg-purple-500/10 mr-3">
                      <ShieldCheck className="h-5 w-5 text-purple-500" />
                    </div>
                    <div>
                      <p className="font-medium">{auditVerified ? 'Verified Audit' : 'Self-Reported'}</p>
                      <p className="text-sm text-gray-400">Security Status</p>
                    </div>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Documents Section with Visual Improvements */}
          {(project.audit_document_path || project.audit_url || project.whitepaper_document_path || project.whitepaper_url) && (
            <div>
              <h2 className="text-xl font-bold mb-4 flex items-center">
                <FileText className="h-5 w-5 mr-2 text-blue-500" />
                Project Documentation
              </h2>
              
              {/* Single document warning for all documents */}
              <DocumentSectionWarning />
              
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                {/* Audit Document Card */}
                {(project.audit_document_path || project.audit_url) && (
                  <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <ShieldCheck className="h-5 w-5 mr-2 text-blue-500" />
                        Security Audit
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4">
                        Technical verification of the project's security and code quality.
                      </p>
                      <div className="flex justify-between items-center mb-3">
                        <Badge className={auditVerified ? "bg-green-600" : "bg-yellow-600"}>
                          {auditVerified ? "Verified" : "Unverified"}
                        </Badge>
                      </div>
                      <Button asChild className="w-full">
                        <a 
                          href={project.audit_url || `/api/documents/audit/${project.id}`}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Audit Report
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
                
                {/* Whitepaper Document Card */}
                {(project.whitepaper_document_path || project.whitepaper_url) && (
                  <Card className="bg-gray-900 border-gray-800 hover:border-blue-500/50 transition-colors">
                    <CardHeader className="pb-2">
                      <CardTitle className="flex items-center text-lg">
                        <FileText className="h-5 w-5 mr-2 text-amber-500" />
                        Whitepaper
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <p className="text-sm text-gray-400 mb-4">
                        Detailed project documentation explaining tokenomics and technical aspects.
                      </p>
                      <Button asChild className="w-full">
                        <a 
                          href={project.whitepaper_url || 
                                (project.whitepaper_document_path ? 
                                  `/api/documents/whitepaper/${project.id}` : 
                                  `${project.website}/whitepaper`)}
                          target="_blank" 
                          rel="noopener noreferrer"
                        >
                          <FileText className="h-4 w-4 mr-2" />
                          View Whitepaper
                        </a>
                      </Button>
                    </CardContent>
                  </Card>
                )}
              </div>
            </div>
          )}
          
          {/* Related Projects Section */}
          {relatedProjects.length > 0 && (
            <RelatedProjects 
              projects={relatedProjects} 
              assetType={project.type} 
            />
          )}
        </div>

        {/* Sidebar - 1/3 width on desktop */}
        <div className="space-y-6">
          {/* Key Metrics Card with Visual Stats */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <BarChart4 className="h-5 w-5 mr-2 text-amber-500" />
                Key Metrics
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-4">
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/50">
                  <div className="flex items-center">
                    <LandPlot className="h-5 w-5 mr-3 text-blue-500" />
                    <span className="text-gray-400">Asset Type</span>
                  </div>
                  <Badge variant="outline" className="font-medium">{project.type}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/50">
                  <div className="flex items-center">
                    <BlockchainIcon className="h-5 w-5 mr-3 text-green-500" />
                    <span className="text-gray-400">Blockchain</span>
                  </div>
                  <Badge variant="outline" className="font-medium">{project.blockchain}</Badge>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/50">
                  <div className="flex items-center">
                    <BarChart4 className="h-5 w-5 mr-3 text-amber-500" />
                    <span className="text-gray-400">Expected ROI</span>
                  </div>
                  <span className="text-lg font-bold text-green-500">{project.roi}%</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/50">
                  <div className="flex items-center">
                    <Database className="h-5 w-5 mr-3 text-purple-500" />
                    <span className="text-gray-400">Total Value Locked</span>
                  </div>
                  <span className="text-lg font-bold">{formatTVL(project.tvl)}</span>
                </div>
                
                <div className="flex items-center justify-between p-3 rounded-md bg-gray-800/50">
                  <div className="flex items-center">
                    <Clock className="h-5 w-5 mr-3 text-blue-500" />
                    <span className="text-gray-400">Listed Date</span>
                  </div>
                  <span className="text-sm">{formattedDate}</span>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Risk Assessment Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2 bg-gray-800/50">
              <CardTitle className="flex items-center">
                <ShieldCheck className="h-5 w-5 mr-2 text-green-500" />
                Risk Assessment
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-3">
                <div className={`p-3 rounded-md ${riskLevel === 'low' ? 'bg-green-900/20' : riskLevel === 'medium' ? 'bg-amber-900/20' : 'bg-red-900/20'} flex items-center justify-between`}>
                  <span className="font-medium">Overall Risk Level</span>
                  <Badge className={riskLevel === 'low' ? 'bg-green-600' : riskLevel === 'medium' ? 'bg-amber-600' : 'bg-red-600'}>
                    {riskLevel.toUpperCase()}
                  </Badge>
                </div>
                
                <div className="grid grid-cols-1 gap-2">
                  <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                    <span className="text-sm flex items-center">
                      {scamReports === 0 ? 
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      }
                      Scam Reports
                    </span>
                    <span className={scamReports === 0 ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {scamReports === 0 ? "None Found" : `${scamReports} Found`}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                    <span className="text-sm flex items-center">
                      {!sanctionDetected ? 
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                        <XCircle className="h-3 w-3 text-red-500 mr-1" />
                      }
                      Sanctions Check
                    </span>
                    <span className={!sanctionDetected ? "text-green-500 font-medium" : "text-red-500 font-medium"}>
                      {!sanctionDetected ? "Passed" : "Failed"}
                    </span>
                  </div>
                  
                  <div className="flex items-center justify-between p-2 rounded bg-gray-800/50">
                    <span className="text-sm flex items-center">
                      {auditVerified ? 
                        <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                        <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
                      }
                      Audit Status
                    </span>
                    <span className={auditVerified ? "text-green-500 font-medium" : "text-amber-500 font-medium"}>
                      {auditVerified ? "Verified" : "Unverified"}
                    </span>
                  </div>
                </div>
              </div>
              
              <div className="border-t border-gray-800 mt-4 pt-4">
                <p className="text-xs text-gray-400">
                  This project has passed our automated security checks. Always conduct your own due diligence before investing.
                </p>
              </div>
            </CardContent>
          </Card>

          {/* Quick Actions Card */}
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader className="pb-2">
              <CardTitle className="flex items-center">
                <ExternalLink className="h-5 w-5 mr-2 text-blue-500" />
                Quick Links
              </CardTitle>
            </CardHeader>
            <CardContent className="pt-4">
              <div className="space-y-2">
                <Button asChild variant="outline" className="w-full justify-start">
                  <a href={project.website} target="_blank" rel="noopener noreferrer">
                    <Globe className="h-4 w-4 mr-2" />
                    Visit Official Website
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
                      <FileText className="h-4 w-4 mr-2" />
                      View Whitepaper
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
                      <ShieldCheck className="h-4 w-4 mr-2" />
                      Review Audit Report
                    </a>
                  </Button>
                )}
                
                <Button asChild variant="outline" className="w-full justify-start">
                  <Link href={`/directory?assetType=${encodeURIComponent(project.type)}`}>
                    <LandPlot className="h-4 w-4 mr-2" />
                    Browse More {project.type} Projects
                  </Link>
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
