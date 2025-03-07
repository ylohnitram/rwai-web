"use client"

import { useState } from "react"
import { Check, X, LogOut } from "lucide-react"
import { Bar, BarChart, ResponsiveContainer, Tooltip, XAxis, YAxis } from "recharts"

import { Button } from "@/components/ui/button"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { projects } from "@/data/projects"
import { getSupabaseClient } from "@/lib/supabase"

export default function AdminPage() {
  const [pendingProjects, setPendingProjects] = useState(projects.filter((project) => !project.approved))
  const [isSigningOut, setIsSigningOut] = useState(false)

  const approveProject = (id: string) => {
    setPendingProjects((prev) => prev.filter((project) => project.id !== id))
  }

  const rejectProject = (id: string) => {
    setPendingProjects((prev) => prev.filter((project) => project.id !== id))
  }

  // Handle sign out with thorough session cleanup
  const handleSignOut = async () => {
    setIsSigningOut(true)
    try {
      const supabase = getSupabaseClient()
      
      // Complete server-side sign out
      await supabase.auth.signOut({ scope: 'global' })
      
      // Clear any cookies or local storage
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=")
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`
      })
      
      // Clear local storage items related to auth
      localStorage.removeItem('supabase.auth.token')
      localStorage.removeItem('supabase.auth.expires_at')
      localStorage.removeItem('supabase.auth.refresh_token')
      
      // Clear session storage as well
      sessionStorage.clear()
      
      // Force a full page reload to ensure all state is cleared
      window.location.href = '/login?signedout=true'
    } catch (error) {
      console.error("Error signing out:", error)
      setIsSigningOut(false)
    }
  }

  // Calculate statistics
  const totalProjects = projects.length
  const approvedProjects = projects.filter((project) => project.approved).length
  const pendingCount = pendingProjects.length

  // Calculate average ROI with proper formatting (4 decimal places)
  const averageRoi = (
    projects.filter((p) => p.approved).reduce((acc, project) => acc + project.roi, 0) / 
    (approvedProjects || 1)
  ).toFixed(4)

  // Count projects by blockchain
  const blockchainCounts = projects.reduce(
    (acc, project) => {
      if (project.approved) {
        acc[project.blockchain] = (acc[project.blockchain] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const blockchainData = Object.entries(blockchainCounts).map(([name, value]) => ({
    name,
    value,
  }))

  // Count projects by asset type
  const assetTypeCounts = projects.reduce(
    (acc, project) => {
      if (project.approved) {
        acc[project.type] = (acc[project.type] || 0) + 1
      }
      return acc
    },
    {} as Record<string, number>,
  )

  const assetTypeData = Object.entries(assetTypeCounts).map(([name, value]) => ({
    name,
    value,
  }))

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Manage directory projects and view platform statistics</p>
        </div>
        <Button 
          variant="outline" 
          className="flex items-center gap-2 border-gray-700 hover:border-red-500 hover:text-red-500"
          onClick={handleSignOut}
          disabled={isSigningOut}
        >
          <LogOut className="h-4 w-4" />
          {isSigningOut ? "Signing Out..." : "Sign Out"}
        </Button>
      </div>

      {/* Statistics Cards */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Total Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{totalProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Approved Projects</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-green-500">{approvedProjects}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Pending Review</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-yellow-500">{pendingCount}</div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl">Average ROI</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold text-blue-500">
              {averageRoi}%
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Projects by Blockchain</CardTitle>
            <CardDescription>Distribution of approved projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={blockchainData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Projects by Asset Type</CardTitle>
            <CardDescription>Distribution of approved projects</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={assetTypeData}>
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip contentStyle={{ backgroundColor: "#1f2937", borderColor: "#374151", color: "white" }} />
                  <Bar dataKey="value" fill="#10b981" radius={[4, 4, 0, 0]} />
                </BarChart>
              </ResponsiveContainer>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Pending Projects Table */}
      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Pending Projects</CardTitle>
          <CardDescription>Review and approve new project submissions</CardDescription>
        </CardHeader>
        <CardContent>
          {pendingProjects.length > 0 ? (
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
                  {pendingProjects.map((project) => (
                    <TableRow key={project.id} className="hover:bg-gray-800 border-gray-800">
                      <TableCell className="font-medium">{project.name}</TableCell>
                      <TableCell>{project.type}</TableCell>
                      <TableCell>{project.blockchain}</TableCell>
                      <TableCell>
                        <Badge className="bg-blue-600 hover:bg-blue-700">{project.roi.toFixed(2)}%</Badge>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          <Button
                            size="sm"
                            className="bg-green-600 hover:bg-green-700"
                            onClick={() => approveProject(project.id)}
                          >
                            <Check className="h-4 w-4 mr-1" /> Approve
                          </Button>
                          <Button size="sm" variant="destructive" onClick={() => rejectProject(project.id)}>
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
    </div>
  )
}
