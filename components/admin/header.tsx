"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Menu, Bell, User, LogOut } from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useToast } from "@/hooks/use-toast";
import { getSupabaseClient } from "@/lib/supabase";

export default function AdminHeader() {
  const { toast } = useToast();
  const router = useRouter();
  const [isSigningOut, setIsSigningOut] = useState(false);

  const toggleSidebar = () => {
    // This function would toggle a mobile sidebar in a real implementation
    console.log("Toggle sidebar");
  };

  const handleSignOut = async () => {
    setIsSigningOut(true);
    try {
      const supabase = getSupabaseClient();
      
      // Complete server-side sign out
      await supabase.auth.signOut({ scope: 'global' });
      
      // Clear any cookies or local storage
      document.cookie.split(";").forEach((cookie) => {
        const [name] = cookie.trim().split("=");
        document.cookie = `${name}=; expires=Thu, 01 Jan 1970 00:00:00 UTC; path=/;`;
      });
      
      toast({
        title: "Signed out",
        description: "You have been successfully signed out.",
      });
      
      // Redirect to login
      router.push('/login?signedout=true');
    } catch (error) {
      console.error("Error signing out:", error);
      toast({
        title: "Sign out failed",
        description: "There was a problem signing you out. Please try again.",
        variant: "destructive",
      });
      setIsSigningOut(false);
    }
  };

  return (
    <header className="bg-gray-900 border-b border-gray-800 py-3 px-6 flex items-center justify-between">
      <div className="flex items-center">
        <Button
          variant="ghost"
          size="icon"
          className="md:hidden mr-2"
          onClick={toggleSidebar}
        >
          <Menu className="h-5 w-5" />
          <span className="sr-only">Toggle sidebar</span>
        </Button>
        <Link href="/admin" className="text-xl font-medium">
          Admin Dashboard
        </Link>
      </div>
      <div className="flex items-center space-x-3">
        <Button variant="ghost" size="icon">
          <Bell className="h-5 w-5" />
        </Button>
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="ghost" size="icon">
              <User className="h-5 w-5" />
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent className="bg-gray-900 border-gray-800">
            <DropdownMenuItem className="cursor-pointer">
              Profile
            </DropdownMenuItem>
            <DropdownMenuItem className="cursor-pointer">
              Settings
            </DropdownMenuItem>
            <DropdownMenuSeparator className="bg-gray-800" />
            <DropdownMenuItem
              className="cursor-pointer text-red-500 focus:text-red-500"
              onClick={handleSignOut}
              disabled={isSigningOut}
            >
              <LogOut className="h-4 w-4 mr-2" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
        <Button asChild variant="outline" className="hidden sm:flex">
          <Link href="/" target="_blank" rel="noopener noreferrer">
            View Site
          </Link>
        </Button>
      </div>
    </header>
  );
}
