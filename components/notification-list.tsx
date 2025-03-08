"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { Check, X, Bell, Info, CircleAlert, ArrowUpRight } from "lucide-react"
import { getUserNotifications, markNotificationAsRead, markAllNotificationsAsRead } from "@/lib/services/notification-service"
import { Button } from "@/components/ui/button"
import { ScrollArea } from "@/components/ui/scroll-area"
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover"
import { Badge } from "@/components/ui/badge"
import { Notification } from "@/types/project"

export default function NotificationList() {
  const [notifications, setNotifications] = useState<Notification[]>([])
  const [unreadCount, setUnreadCount] = useState(0)
  const [isOpen, setIsOpen] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  // Load notifications when popover opens
  useEffect(() => {
    if (isOpen) {
      loadNotifications()
    }
  }, [isOpen])

  const loadNotifications = async () => {
    setIsLoading(true)
    
    try {
      const { data } = await getUserNotifications(10)
      setNotifications(data)
      setUnreadCount(data.filter(n => !n.read).length)
    } catch (error) {
      console.error("Error loading notifications:", error)
    } finally {
      setIsLoading(false)
    }
  }

  const handleMarkAsRead = async (id: string) => {
    try {
      await markNotificationAsRead(id)
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => n.id === id ? { ...n, read: true } : n)
      )
      
      setUnreadCount(prev => Math.max(0, prev - 1))
    } catch (error) {
      console.error("Error marking notification as read:", error)
    }
  }

  const handleMarkAllAsRead = async () => {
    try {
      await markAllNotificationsAsRead()
      
      // Update local state
      setNotifications(prev => 
        prev.map(n => ({ ...n, read: true }))
      )
      
      setUnreadCount(0)
    } catch (error) {
      console.error("Error marking all notifications as read:", error)
    }
  }

  // Helper to render the appropriate icon for notification type
  const getNotificationIcon = (type: string) => {
    switch (type) {
      case 'approval':
        return <Check className="h-4 w-4 text-green-500" />
      case 'rejection':
        return <X className="h-4 w-4 text-red-500" />
      case 'changes_requested':
        return <CircleAlert className="h-4 w-4 text-amber-500" />
      default:
        return <Info className="h-4 w-4 text-blue-500" />
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
        <div className="flex items-center justify-between p-4 border-b border-gray-800">
          <h4 className="font-medium">Notifications</h4>
          {notifications.some(n => !n.read) && (
            <Button 
              variant="ghost" 
              size="sm" 
              onClick={handleMarkAllAsRead}
              className="text-xs h-8"
            >
              Mark all as read
            </Button>
          )}
        </div>
        
        <ScrollArea className="h-80">
          {isLoading ? (
            <div className="flex items-center justify-center h-20">
              <p className="text-sm text-gray-400">Loading notifications...</p>
            </div>
          ) : notifications.length === 0 ? (
            <div className="flex flex-col items-center justify-center p-6 text-center">
              <Bell className="h-10 w-10 text-gray-500 mb-2" />
              <p className="text-sm text-gray-400">No notifications</p>
            </div>
          ) : (
            <div className="divide-y divide-gray-800">
              {notifications.map(notification => (
                <div 
                  key={notification.id}
                  className={`p-4 ${notification.read ? 'bg-gray-900' : 'bg-gray-800'}`}
                >
                  <div className="flex items-start">
                    <div className="mr-3 mt-0.5">
                      {getNotificationIcon(notification.type)}
                    </div>
                    <div className="flex-1">
                      <p className="text-sm">
                        {notification.message}
                      </p>
                      <div className="flex items-center justify-between mt-2">
                        <p className="text-xs text-gray-400">
                          {new Date(notification.created_at).toLocaleDateString()}
                        </p>
                        
                        {!notification.read && (
                          <Button 
                            variant="ghost" 
                            size="sm" 
                            onClick={() => handleMarkAsRead(notification.id)}
                            className="text-xs h-6"
                          >
                            Mark as read
                          </Button>
                        )}
                        
                        {notification.project_id && (
                          <Button 
                            variant="outline" 
                            size="sm"
                            className="text-xs h-6"
                            asChild
                          >
                            <Link href={`/projects/${notification.project_id}`}>
                              View <ArrowUpRight className="h-3 w-3 ml-1" />
                            </Link>
                          </Button>
                        )}
                      </div>
                    </div>
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
