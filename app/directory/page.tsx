"use client"

import Link from "next/link"
import { useRouter, useSearchParams } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import DirectoryFilters from "@/components/directory-filters"
import Breadcrumbs from "@/components/breadcrumbs"
import LegalDisclaimer from "@/components/legal-disclaimer"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState, Suspense, useCallback } from "react"
import { Project } from "@/types/project"
import { Globe, Clipboard, BarChart4, CheckCircle, Database, Shield, FileText } from "lucide-react"
import { BlockchainIcon } from "@/components/icons/blockchain-icon"
import { formatTVL } from "@/lib/utils"
import Pagination from "@/components/pagination"

// Create a separate component for the directory content that uses useSearchParams
function DirectoryContent() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const [currentProjects, setCurrentProjects] = useState<Project[]>([])
  const [totalProjects, setTotalProjects] = useState(0)
  const [isLoading, setIsLoading] = useState(true)
  const [totalPages, setTotalPages] = useState(1)

  // Get the query parameters directly, so we can watch for changes
  const assetType = searchParams?.get("assetType") || ""
  const blockchain = searchParams?.get("blockchain") || ""
  const minRoi = searchParams?.get("minRoi") ? Number.parseFloat(searchParams.get("minRoi") || "0") : 0
  const maxRoi = searchParams?.get("maxRoi") ? Number.parseFloat(searchParams.get("maxRoi") || "30") : 30
  const currentPage = Number.parseInt(searchParams?.get("page") || "1")
  
  // Function to fetch projects (extracted to be reusable)
  const fetchProjects = useCallback(async () => {
    setIsLoading(true)
    try {
      // Fetch projects from API
      const params = new URLSearchParams()
      params.set('page', currentPage.toString())
      if (assetType) params.set('assetType', assetType)
      if (blockchain) params.set('blockchain', blockchain)
      params.set('minRoi', minRoi.toString())
      params.set('maxRoi', maxRoi.toString())
      
      const response = await fetch(`/api/projects?${params.toString()}`)
      const data = await response.json()
      
      setCurrentProjects(data.data || [])
      setTotalProjects(data.meta?.total || 0)
      setTotalPages(Math.ceil((data.meta?.total || 0) / 10))
    } catch (error) {
      console.error("Error fetching projects:", error)
      setCurrentProjects([])
      setTotalProjects(0)
      setTotalPages(1)
    } finally {
      setIsLoading(false)
    }
  }, [assetType, blockchain, minRoi, maxRoi, currentPage])
  
  // Fetch projects when any query parameter changes
  useEffect(() => {
    fetchProjects()
  }, [fetchProjects])
  
  // Handle page change
  const handlePageChange = useCallback((newPage: number) => {
    if (newPage < 1 || newPage > totalPages) return
    
    // Create a new URLSearchParams instance
    const params = new URLSearchParams(searchParams.toString())
    params.set("page", newPage.toString())
    
    // Navigate to the new URL which will trigger the useEffect to fetch new data
    router.push(`/directory?${params.toString()}`)
  }, [router, searchParams, totalPages])
  
  // Function to generate slug from project name
  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  const navigateToProject = (project: Project) => {
    if (project && project.name) {
      router.push(`/projects/${generateSlug(project.name)}`)
    }
  }

  // Get blockchain icon based on blockchain name
  const getBlockchainIcon = (blockchain: string) => {
    if (!blockchain) return <BlockchainIcon className="h-4 w-4 mr-2 text-blue-400" />;
    
    switch(blockchain.toLowerCase()) {
      case 'ethereum': 
        return <div className="w-4 h-4 bg-blue-500 rounded-full mr-2"></div>;
      case 'polygon': 
        return <div className="w-4 h-4 bg-purple-500 rounded-full mr-2"></div>;
      case 'solana': 
        return <div className="w-4 h-4 bg-green-500 rounded-full mr-2"></div>;
      default:
        return <BlockchainIcon className="h-4 w-4 mr-2 text-blue-400" />;
    }
  };

  return (
    <>
      <Breadcrumbs />
      <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Project Directory</h1>
          <p className="text-gray-400">Browse and filter tokenized real-world assets</p>
        </div>
        <Button asChild variant="outline" className="mt-4 md:mt-0">
          <Link href="/submit">
            <Clipboard className="h-4 w-4 mr-2" />
            Submit Project
          </Link>
        </Button>
      </div>

      {/* Filters */}
      <DirectoryFilters />

      {/* Legal Disclaimer */}
      <LegalDisclaimer />

      {isLoading ? (
        <div className="text-center py-8">
          <div className="animate-pulse flex flex-col items-center">
            <div className="h-10 w-10 bg-gray-700 rounded-full mb-4"></div>
            <div className="h-4 w-48 bg-gray-700 rounded mb-3"></div>
            <div className="h-3 w-36 bg-gray-700 rounded"></div>
          </div>
        </div>
      ) : (
        <>
          {/* Desktop Table View - Hidden on mobile */}
          <div className="hidden md:block rounded-md border border-gray-800 overflow-hidden">
            <Table>
              <TableHeader className="bg-gray-900">
                <TableRow className="hover:bg-gray-800 border-gray-800">
                  <TableHead className="font-medium">Project</TableHead>
                  <TableHead className="font-medium">Asset Type</TableHead>
                  <TableHead className="font-medium">Blockchain</TableHead>
                  <TableHead className="font-medium">ROI</TableHead>
                  <TableHead className="font-medium">TVL</TableHead>
                  <TableHead className="font-medium text-right">Action</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {currentProjects && currentProjects.length > 0 ? (
                  currentProjects.map((project) => (
                    <TableRow 
                      key={project.id} 
                      className="hover:bg-gray-800 border-gray-800 cursor-pointer"
                      onClick={() => navigateToProject(project)}
                    >
                      <TableCell className="font-medium">
                        <div className="flex items-center">
                          <Shield className="h-4 w-4 mr-2 text-amber-500" />
                          {project.name}
                          {project.audit_document_path && (
                            <Badge variant="outline" className="ml-2 text-xs bg-green-900/20 text-green-400 border-green-500/30">
                              <CheckCircle className="h-3 w-3 mr-1" />
                              Audited
                            </Badge>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-800">
                          {project.type}
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          {getBlockchainIcon(project.blockchain)}
                          {project.blockchain}
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className="bg-green-600 hover:bg-green-700">
                          <BarChart4 className="h-3 w-3 mr-1" />
                          {project.roi}%
                        </Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center">
                          <Database className="h-4 w-4 mr-1 text-blue-400" />
                          {formatTVL(project.tvl)}
                        </div>
                      </TableCell>
                      <TableCell className="text-right">
                        <Button asChild size="sm" variant="outline">
                          <Link href={`/projects/${generateSlug(project.name)}`}>
                            View Details
                          </Link>
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                ) : (
                  <TableRow>
                    <TableCell colSpan={6} className="text-center py-8 text-gray-400">
                      No projects match your filter criteria
                    </TableCell>
                  </TableRow>
                )}
              </TableBody>
            </Table>
          </div>
          
          {/* Mobile Card View - Shown only on mobile */}
          <div className="md:hidden space-y-4">
            {currentProjects && currentProjects.length > 0 ? (
              currentProjects.map((project) => (
                <div 
                  key={project.id}
                  className="block"
                  onClick={() => navigateToProject(project)}
                >
                  <Card className="bg-gray-900/60 border-gray-800 hover:border-amber-500/30 transition-all cursor-pointer">
                    <CardContent className="p-4">
                      <div className="flex flex-col space-y-3">
                        <div className="flex justify-between items-center">
                          <h3 className="font-medium text-lg flex items-center">
                            <Shield className="h-4 w-4 mr-1 text-amber-500" />
                            {project.name}
                          </h3>
                          <Badge className="bg-green-600">
                            <BarChart4 className="h-3 w-3 mr-1" />
                            {project.roi}%
                          </Badge>
                        </div>
                        
                        <div className="grid grid-cols-3 gap-2 text-sm">
                          <div className="flex flex-col items-center p-2 bg-gray-800 rounded-md">
                            <span className="text-xs text-gray-400 mb-1">Asset Type</span>
                            <Badge variant="outline">{project.type}</Badge>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-800 rounded-md">
                            <span className="text-xs text-gray-400 mb-1">Blockchain</span>
                            <div className="flex items-center">
                              {getBlockchainIcon(project.blockchain)}
                              <span className="text-sm">{project.blockchain}</span>
                            </div>
                          </div>
                          <div className="flex flex-col items-center p-2 bg-gray-800 rounded-md">
                            <span className="text-xs text-gray-400 mb-1">TVL</span>
                            <span className="text-sm font-medium">{formatTVL(project.tvl)}</span>
                          </div>
                        </div>
                        
                        <div className="pt-2 mt-1 border-t border-gray-800 flex justify-between items-center">
                          <div className="flex">
                            {project.audit_document_path && (
                              <Badge variant="outline" className="mr-2 text-xs bg-green-900/20 text-green-400 border-green-500/30">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Audited
                              </Badge>
                            )}
                            {project.whitepaper_document_path && (
                              <Badge variant="outline" className="text-xs bg-blue-900/20 text-blue-400 border-blue-500/30">
                                <FileText className="h-3 w-3 mr-1" />
                                Whitepaper
                              </Badge>
                            )}
                          </div>
                          <Button asChild size="sm" variant="outline">
                            <Link href={project.website} target="_blank" rel="noopener noreferrer">
                              <Globe className="h-3 w-3 mr-1" />
                              Website
                            </Link>
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              ))
            ) : (
              <div className="text-center py-8 text-gray-400 bg-gray-900/60 border border-gray-800 rounded-md">
                No projects match your filter criteria
              </div>
            )}
          </div>
        </>
      )}

      {/* Pagination - using the separate component */}
      {totalProjects > 0 && (
        <div className="mt-6">
          <Pagination 
            totalPages={totalPages} 
            currentPage={currentPage}
            onPageChange={handlePageChange}
          />
        </div>
      )}
    </>
  );
}

// Main page component with Suspense boundary
export default function DirectoryPage() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
      <section className="container py-8 px-4 md:px-6">
        <Suspense fallback={
          <div className="text-center py-8">
            <div className="animate-pulse flex flex-col items-center">
              <div className="h-10 w-10 bg-gray-700 rounded-full mb-4"></div>
              <div className="h-4 w-48 bg-gray-700 rounded mb-3"></div>
              <div className="h-3 w-36 bg-gray-700 rounded"></div>
            </div>
          </div>
        }>
          <DirectoryContent />
        </Suspense>
      </section>
    </div>
  )
}
