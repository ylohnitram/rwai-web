// components/admin/activity-feed.tsx
import { useState, useEffect } from "react"
import { Activity, CheckCircle, XCircle, FileEdit } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSupabaseClient } from "@/lib/supabase"

interface ActivityItem {
  id: string
  action: string
  project_name: string
  admin_email?: string
  timestamp: string
  status?: string
}

export function ActivityFeed() {
  const [activities, setActivities] = useState<ActivityItem[]>([])
  const [isLoading, setIsLoading] = useState(true)
  
  useEffect(() => {
    fetchActivities()
    
    // Set up real-time subscription
    const supabase = getSupabaseClient()
    const subscription = supabase
      .channel('admin-activities')
      .on('postgres_changes', {
        event: 'INSERT',
        schema: 'public',
        table: 'admin_activities'
      }, (payload) => {
        const newActivity = payload.new as ActivityItem
        setActivities(prev => [newActivity, ...prev.slice(0, 19)])
      })
      .subscribe()
    
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])
  
  const fetchActivities = async () => {
    setIsLoading(true)
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from('admin_activities')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20)
      
      if (error) {
        console.error('Error fetching activities:', error)
        return
      }
      
      setActivities(data || [])
    } catch (error) {
      console.error('Error in fetchActivities:', error)
    } finally {
      setIsLoading(false)
    }
  }
  
  // Function to render the appropriate icon for activity type
  const getActivityIcon = (action: string, status?: string) => {
    if (action === 'approved' || status === 'approved') {
      return <CheckCircle className="h-5 w-5 text-green-500" />
    }
    if (action === 'rejected' || status === 'rejected') {
      return <XCircle className="h-5 w-5 text-red-500" />
    }
    if (action === 'requested_changes' || status === 'changes_requested') {
      return <FileEdit className="h-5 w-5 text-amber-500" />
    }
    return <Activity className="h-5 w-5 text-blue-500" />
  }
  
  // Format date for display
  const formatDate = (isoDate: string) => {
    return new Date(isoDate).toLocaleString()
  }
  
  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="flex items-center">
          <Activity className="h-5 w-5 mr-2 text-blue-500" />
          Recent Activity
        </CardTitle>
        <CardDescription>Recent admin actions and system events</CardDescription>
      </CardHeader>
      <CardContent>
        {isLoading ? (
          <div className="text-center py-8">Loading activities...</div>
        ) : activities.length === 0 ? (
          <div className="text-center py-8 text-gray-400">No recent activities</div>
        ) : (
          <ScrollArea className="h-[300px]">
            <div className="space-y-4">
              {activities.map((activity) => (
                <div key={activity.id} className="flex items-start">
                  <div className="p-2 rounded-full bg-gray-800 mr-3">
                    {getActivityIcon(activity.action, activity.status)}
                  </div>
                  <div className="flex-1">
                    <div className="flex flex-col md:flex-row md:justify-between md:items-center">
                      <p className="font-medium">{activity.project_name}</p>
                      <p className="text-sm text-gray-400">{formatDate(activity.timestamp)}</p>
                    </div>
                    <p className="text-sm text-gray-300 capitalize">
                      {activity.action.replace('_', ' ')}
                      {activity.admin_email && ` by ${activity.admin_email}`}
                    </p>
                  </div>
                </div>
              ))}
            </div>
          </ScrollArea>
        )}
      </CardContent>
    </Card>
  )
}
