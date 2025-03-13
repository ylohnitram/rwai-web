"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { PlusCircle, FileText, BarChart3, Files, Clock, Globe } from "lucide-react";
import { AssetTypeIcon } from "@/components/icons/asset-type-icon";
import { getSupabaseClient } from "@/lib/supabase";

export default function AdminDashboardPage() {
  const [stats, setStats] = useState({
    totalProjects: 0,
    pendingProjects: 0,
    approvedProjects: 0,
    assetTypes: 0,
    networks: 0,
    changesRequested: 0
  });
  const [isLoading, setIsLoading] = useState(true);
  const [recentActivity, setRecentActivity] = useState<any[]>([]);

  useEffect(() => {
    async function fetchDashboardData() {
      setIsLoading(true);
      try {
        const supabase = getSupabaseClient();
        
        // Count projects by status
        const [
          { count: totalCount }, 
          { count: pendingCount },
          { count: approvedCount },
          { count: changesRequestedCount }
        ] = await Promise.all([
          supabase.from("projects").select("*", { count: "exact", head: true }),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "pending"),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "approved"),
          supabase.from("projects").select("*", { count: "exact", head: true }).eq("status", "changes_requested")
        ]);
        
        // Count asset types and networks
        const [{ count: assetTypesCount }, { count: networksCount }] = await Promise.all([
          supabase.from("asset_types").select("*", { count: "exact", head: true }),
          supabase.from("networks").select("*", { count: "exact", head: true })
        ]);
        
        // Fetch recent activities
        const { data: activities } = await supabase
          .from('admin_activities')
          .select('*')
          .order('timestamp', { ascending: false })
          .limit(5);
        
        setStats({
          totalProjects: totalCount || 0,
          pendingProjects: pendingCount || 0,
          approvedProjects: approvedCount || 0,
          assetTypes: assetTypesCount || 0,
          networks: networksCount || 0,
          changesRequested: changesRequestedCount || 0
        });
        
        setRecentActivity(activities || []);
      } catch (error) {
        console.error("Error fetching dashboard data:", error);
      } finally {
        setIsLoading(false);
      }
    }
    
    fetchDashboardData();
  }, []);

  // Format date for recent activity
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString();
  };

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome to the TokenDirectory admin panel</p>
        </div>
        <Button asChild>
          <Link href="/admin/projects/create">
            <PlusCircle className="h-4 w-4 mr-2" />
            New Project
          </Link>
        </Button>
      </div>

      {/* Project Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-5 gap-6 mb-8">
        <Link href="/admin/projects" className="block">
          <Card className="bg-gray-900 border-gray-800 transition-colors hover:border-amber-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <FileText className="h-5 w-5 mr-2 text-blue-500" />
                  Projects
                </h3>
              </div>
              <div className="text-4xl font-bold">{isLoading ? "..." : stats.totalProjects}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400">
                  {isLoading ? "..." : stats.pendingProjects} pending approval
                </p>
                <Badge className="bg-blue-600">{isLoading ? "..." : stats.approvedProjects} live</Badge>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/projects" className="block">
          <Card className="bg-gray-900 border-gray-800 transition-colors hover:border-amber-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Clock className="h-5 w-5 mr-2 text-amber-500" />
                  Pending Review
                </h3>
              </div>
              <div className="text-4xl font-bold">{isLoading ? "..." : stats.pendingProjects}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400">
                  Projects awaiting approval
                </p>
                {stats.pendingProjects > 0 && (
                  <Badge className="bg-amber-500 text-black">Action needed</Badge>
                )}
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/projects" className="block">
          <Card className="bg-gray-900 border-gray-800 transition-colors hover:border-amber-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Files className="h-5 w-5 mr-2 text-green-500" />
                  Changes Requested
                </h3>
              </div>
              <div className="text-4xl font-bold">{isLoading ? "..." : stats.changesRequested}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400">
                  Awaiting updates
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/asset-types" className="block">
          <Card className="bg-gray-900 border-gray-800 transition-colors hover:border-amber-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <AssetTypeIcon className="h-5 w-5 mr-2 text-purple-500" />
                  Asset Types
                </h3>
              </div>
              <div className="text-4xl font-bold">{isLoading ? "..." : stats.assetTypes}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400">
                  Available categories
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
        
        <Link href="/admin/networks" className="block">
          <Card className="bg-gray-900 border-gray-800 transition-colors hover:border-amber-500/50">
            <CardContent className="p-6">
              <div className="flex items-center justify-between mb-4">
                <h3 className="text-lg font-medium flex items-center">
                  <Globe className="h-5 w-5 mr-2 text-green-500" />
                  Networks
                </h3>
              </div>
              <div className="text-4xl font-bold">{isLoading ? "..." : stats.networks}</div>
              <div className="flex items-center justify-between mt-2">
                <p className="text-gray-400">
                  Blockchain platforms
                </p>
              </div>
            </CardContent>
          </Card>
        </Link>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900 border-gray-800 mb-8">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Quick Actions</h2>
          <div className="grid grid-cols-1 sm:grid-cols-4 gap-4">
            <Link href="/admin/projects">
              <Button variant="outline" className="w-full h-auto py-4 justify-center flex-col items-center">
                <FileText className="h-10 w-10 mb-2" />
                <span>Manage Projects</span>
              </Button>
            </Link>
            
            <Link href="/admin/asset-types">
              <Button variant="outline" className="w-full h-auto py-4 justify-center flex-col items-center">
                <AssetTypeIcon className="h-10 w-10 mb-2" />
                <span>Manage Asset Types</span>
              </Button>
            </Link>
            
            <Link href="/admin/networks">
              <Button variant="outline" className="w-full h-auto py-4 justify-center flex-col items-center">
                <Globe className="h-10 w-10 mb-2" />
                <span>Manage Networks</span>
              </Button>
            </Link>
            
            <Link href="/admin/analytics">
              <Button variant="outline" className="w-full h-auto py-4 justify-center flex-col items-center">
                <BarChart3 className="h-10 w-10 mb-2" />
                <span>View Analytics</span>
              </Button>
            </Link>
          </div>
        </CardContent>
      </Card>

      {/* Recent Activity */}
      <Card className="bg-gray-900 border-gray-800">
        <CardContent className="p-6">
          <h2 className="text-xl font-bold mb-4">Recent Activity</h2>
          {isLoading ? (
            <p className="text-center py-4 text-gray-400">Loading activity data...</p>
          ) : recentActivity.length > 0 ? (
            <div className="space-y-4">
              {recentActivity.map((activity) => (
                <div key={activity.id} className="flex items-start p-3 rounded-md bg-gray-800/50">
                  <div className="flex-1">
                    <div className="flex justify-between">
                      <p className="font-medium">{activity.project_name}</p>
                      <p className="text-sm text-gray-400">{formatDate(activity.timestamp)}</p>
                    </div>
                    <p className="text-sm text-gray-300 capitalize mt-1">
                      {activity.action.replace('_', ' ')}
                      {activity.admin_email && ` by ${activity.admin_email}`}
                    </p>
                  </div>
                </div>
              ))}
              
              <Link href="/admin/activities" className="block text-center">
                <Button variant="outline" size="sm">
                  View All Activity
                </Button>
              </Link>
            </div>
          ) : (
            <p className="text-center py-4 text-gray-400">No recent activity</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
