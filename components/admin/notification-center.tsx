"use client"

import { useState, useEffect } from "react"
import { Bell } from "lucide-react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Separator } from "@/components/ui/separator"
import { ScrollArea } from "@/components/ui/scroll-area"
import { getSupabaseClient } from "@/lib/supabase"

interface Notification {
  id: string
  type: 'new_submission' | 'updated_project'
  project_id: string
  project_name: string
  timestamp: string
  read: boolean
}

export default function NotificationCenter() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [isOpen, setIsOpen] = useState(false)
  const [unreadCount, setUnreadCount] = useState(0)
  
  // Load notifications when component mounts and when popover opens
  useEffect(() => {
    if (isOpen) {
      fetchNotifications()
    }
  }, [isOpen])
  
  // Set up real-time subscription for new notifications
  useEffect(() => {
    const supabase = getSupabaseClient()
    
    // Subscribe to changes in the admin_notifications table
    const subscription = supabase
      .channel('admin_notifications')
      .on('postgres_changes', { 
        event: 'INSERT', 
        schema: 'public', 
        table: 'admin_notifications' 
      }, (payload) => {
        const newNotification = payload.new as Notification
        setNotifications(prev => [newNotification, ...prev])
        setUnreadCount(prev => prev + 1)
      })
      .subscribe()
    
    // Fetch initial notifications
    fetchNotifications()
    
    // Clean up subscription
    return () => {
      supabase.removeChannel(subscription)
    }
  }, [])
  
  const fetchNotifications = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Fetch recent notifications
      const { data, error } = await supabase
        .from('admin_notifications')
        .select('*')
        .order('timestamp', { ascending: false })
        .limit(20)
      
      if (error) {
        console.error('Error fetching notifications:', error)
        return
      }
      
      setNotifications(data || [])
      
      // Count unread notifications
      setUnreadCount(data?.filter(n => !n.read).length || 0)
    } catch (error) {
      console.error('Error in fetchNotifications:', error)
    }
  }
  
  const markAsRead = async (id: string) => {
    try {
      const supabase = getSupabaseClient()
      
      // Update notification as read
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('id', id)
      
      if (error) {
        console.error('Error marking notification as read:', error)
        return
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error('Error in markAsRead:', error)
    }
  }
  
  const markAllAsRead = async () => {
    try {
      const supabase = getSupabaseClient()
      
      // Update all notifications as read
      const { error } = await supabase
        .from('admin_notifications')
        .update({ read: true })
        .eq('read', false)
      
      if (error) {
        console.error('Error marking all notifications as read:', error)
        return
      }
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      
      setUnreadCount(0)
    } catch (error) {
      console.error('Error in markAllAsRead:', error)
    }
  }
  
  return (
    <Popover open={isOpen} onOpenChange={setIsOpen}>
      <PopoverTrigger asChild>
        <Button variant="ghost" size="icon" className="relative">
          <Bell className="h-5 w-5" />
          {unreadCount > 0 && (
            <Badge 
              className="absolute -top-1 -right-1 h-5 w-5 p-0 flex items-center justify-center rounded-full bg-red-600"
            >
              {unreadCount}
            </Badge>
          )}
        </Button>
      </PopoverTrigger>
      <PopoverContent className="w-80 p-0 bg-gray-900 border-gray-800">
        <div className="p-4 border-b border-gray-800 flex items-center justify-between">
          <h4 className="font-medium">Notifications</h4>
          {unreadCount > 0 && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={markAllAsRead}
              className="text-xs h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>
        <ScrollArea className="h-80">
          {notifications.length === 0 ? (
            <div className="p-4 text-center text-gray-400">
              No notifications
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map((notification) => (
                <div 
                  key={notification.id} 
                  className={`p-4 ${notification.read ? 'bg-gray-900' : 'bg-gray-800'}`}
                  onClick={() => !notification.read && markAsRead(notification.id)}
                >
                  <div className="flex items-center justify-between mb-1">
                    <span className="font-medium text-sm">
                      {notification.type === 'new_submission' ? 'New Submission' : 'Project Updated'}
                    </span>
                    <span className="text-xs text-gray-400">
                      {new Date(notification.timestamp).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm">{notification.project_name}</p>
                  <div className="flex justify-end mt-2">
                    <Button 
                      variant="outline" 
                      size="sm"
                      asChild
                      className="text-xs h-7"
                    >
                      <a href={`/admin?project=${notification.project_id}`}>
                        View
                      </a>
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </ScrollArea>
      </PopoverContent>
    </Popover>
  )
}
