"use client";

import { useEffect, useState } from "react";
import Link from "next/link";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Button } from "@/components/ui/button";
import { useToast } from "@/hooks/use-toast";
import { FileText, Users, Activity, PlusCircle } from "lucide-react";
import { AssetTypeIcon } from "@/components/icons/asset-type-icon";

// Dummy data for demonstration
const STATS = {
  totalProjects: 42,
  pendingProjects: 5,
  totalUsers: 128,
  totalAssetTypes: 10
};

export default function AdminDashboardPage() {
  const { toast } = useToast();
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // Simulate data loading
    const timer = setTimeout(() => {
      setIsLoading(false);
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  if (isLoading) {
    return (
      <div className="container py-8 px-4 md:px-6 text-center">
        <p>Loading dashboard data...</p>
      </div>
    );
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Admin Dashboard</h1>
          <p className="text-gray-400">Welcome to the TokenDirectory admin panel</p>
        </div>
        <div className="flex space-x-3">
          <Button asChild>
            <Link href="/admin/projects/create">
              <PlusCircle className="h-4 w-4 mr-2" />
              New Project
            </Link>
          </Button>
        </div>
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <FileText className="h-5 w-5 mr-2 text-blue-500" />
              Projects
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{STATS.totalProjects}</div>
            <p className="text-gray-400 mt-1">
              {STATS.pendingProjects} pending approval
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Users className="h-5 w-5 mr-2 text-green-500" />
              Users
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{STATS.totalUsers}</div>
            <p className="text-gray-400 mt-1">
              Total registered users
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <AssetTypeIcon className="h-5 w-5 mr-2 text-amber-500" />
              Asset Types
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">{STATS.totalAssetTypes}</div>
            <p className="text-gray-400 mt-1">
              Available asset categories
            </p>
          </CardContent>
        </Card>
        
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader className="pb-2">
            <CardTitle className="text-xl flex items-center">
              <Activity className="h-5 w-5 mr-2 text-purple-500" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="text-4xl font-bold">24</div>
            <p className="text-gray-400 mt-1">
              Actions in last 24h
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Quick Actions */}
      <Card className="bg-gray-900 border-gray-800 mb-8">
        <CardHeader>
          <CardTitle>Quick Actions</CardTitle>
          <CardDescription>Common administrative tasks</CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
            <Button asChild variant="outline" className="h-auto py-4 justify-start flex-col items-center">
              <Link href="/admin/projects">
                <FileText className="h-10 w-10 mb-2" />
                <span>Manage Projects</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start flex-col items-center">
              <Link href="/admin/asset-types">
                <AssetTypeIcon className="h-10 w-10 mb-2" />
                <span>Manage Asset Types</span>
              </Link>
            </Button>
            <Button asChild variant="outline" className="h-auto py-4 justify-start flex-col items-center">
              <Link href="/admin/users">
                <Users className="h-10 w-10 mb-2" />
                <span>Manage Users</span>
              </Link>
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
