"use client"

import Link from "next/link"
import { useRouter } from "next/navigation"
import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import DirectoryFilters from "@/components/directory-filters"
import Pagination from "@/components/pagination"
import Breadcrumbs from "@/components/breadcrumbs"
import LegalDisclaimer from "@/components/legal-disclaimer"
import { Card, CardContent } from "@/components/ui/card"
import { useEffect, useState } from "react"
import { Project } from "@/types/project"

interface DirectoryPageProps {
  searchParams: {
    page?: string
    assetType?: string
    blockchain?: string
    minRoi?: string
    maxRoi?: string
  }
}

export default function DirectoryPage({ searchParams }: DirectoryPageProps) {
  const router = useRouter()
  const [currentProjects, setCurrentProjects] = useState<Project[]>([])
  const [totalProjects, setTotalProjects] = useState(0)
  const [isLoading, setIsLoading] = useState(true)

  const page = Number.parseInt(searchParams.page || "1")
  const assetType = searchParams.assetType || ""
  const blockchain = searchParams.blockchain || ""
  const minRoi = searchParams.minRoi ? Number.parseFloat(searchParams.minRoi) : undefined
  const maxRoi = searchParams.maxRoi ? Number.parseFloat(searchParams.maxRoi) : undefined

  const projectsPerPage = 10
  
  useEffect(() => {
    async function fetchProjects() {
      setIsLoading(true)
      try {
        // Fetch projects from API
        const params = new URLSearchParams()
        params.set('page', page.toString())
        if (assetType) params.set('assetType', assetType)
        if (blockchain) params.set('blockchain', blockchain)
        if (minRoi !== undefined) params.set('minRoi', minRoi.toString())
        if (maxRoi !== undefined) params.set('maxRoi', maxRoi.toString())
        
        const response = await fetch(`/api/projects?${params.toString()}`)
        const data = await response.json()
        
        setCurrentProjects(data.data)
        setTotalProjects(data.meta.total)
      } catch (error) {
        console.error("Error fetching projects:", error)
      } finally {
        setIsLoading(false)
      }
    }
    
    fetchProjects()
  }, [page, assetType, blockchain, minRoi, maxRoi])
  
  const totalPages = Math.ceil(totalProjects / projectsPerPage)

  // Function to generate slug from project name
  function generateSlug(name: string): string {
    return name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "");
  }

  const navigateToProject = (project: Project) => {
    router.push(`/projects/${generateSlug(project.name)}`)
  }

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
      <section className="container py-8 px-4 md:px-6">
        <Breadcrumbs />
        <div className="flex flex-col md:flex-row md:items-center md:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold tracking-tighter mb-2">Project Directory</h1>
            <p className="text-gray-400">Browse and filter tokenized real-world assets</p>
          </div>
          <Button asChild variant="outline" className="mt-4 md:mt-0">
            <Link href="/submit">Submit Project</Link>
          </Button>
        </div>

        {/* Filters */}
        <DirectoryFilters />

        {/* Legal Disclaimer */}
        <LegalDisclaimer />

        {isLoading ? (
          <div className="text-center py-8">Loading projects...</div>
        ) : (
          <>
            {/* Desktop Table View - Hidden on mobile */}
            <div className="hidden md:block rounded-md border border-gray-800 overflow-hidden">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="hover:bg-gray-800 border-gray-800">
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Asset Type</TableHead>
                    <TableHead className="font-medium">Blockchain</TableHead>
                    <TableHead className="font-medium">ROI</TableHead>
                    <TableHead className="font-medium text-right">Details</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {currentProjects.length > 0 ? (
                    currentProjects.map((project) => (
                      <TableRow 
                        key={project.id} 
                        className="hover:bg-gray-800 border-gray-800 cursor-pointer"
                        onClick={() => navigateToProject(project)}
                      >
                        <TableCell className="font-medium">{project.name}</TableCell>
                        <TableCell>{project.type}</TableCell>
                        <TableCell>{project.blockchain}</TableCell>
                        <TableCell>
                          <Badge className="bg-blue-600 hover:bg-blue-700">{project.roi}%</Badge>
                        </TableCell>
                        <TableCell className="text-right">
                          <Button asChild size="sm" variant="outline">
                            <Link href={`/projects/${generateSlug(project.name)}`}>View</Link>
                          </Button>
                        </TableCell>
                      </TableRow>
                    ))
                  ) : (
                    <TableRow>
                      <TableCell colSpan={5} className="text-center py-8 text-gray-400">
                        No projects match your filter criteria
                      </TableCell>
                    </TableRow>
                  )}
                </TableBody>
              </Table>
            </div>
            
            {/* Mobile Card View - Shown only on mobile */}
            <div className="md:hidden space-y-4">
              {currentProjects.length > 0 ? (
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
                            <h3 className="font-medium text-lg">{project.name}</h3>
                            <Badge className="bg-blue-600">{project.roi}%</Badge>
                          </div>
                          <div className="grid grid-cols-2 gap-2 text-sm">
                            <div>
                              <p className="text-xs text-gray-400">Asset Type</p>
                              <p>{project.type}</p>
                            </div>
                            <div>
                              <p className="text-xs text-gray-400">Blockchain</p>
                              <p>{project.blockchain}</p>
                            </div>
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

        {/* Pagination */}
        {totalProjects > 0 && (
          <div className="mt-6">
            <Pagination totalPages={totalPages} />
          </div>
        )}
      </section>
    </div>
  )
}
