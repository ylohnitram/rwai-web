"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { 
  LayoutDashboard, 
  FileText, 
  Settings, 
  BarChart3, 
  Mail,
  Layers,
  Globe
} from "lucide-react";
import { AssetTypeIcon } from "@/components/icons/asset-type-icon";

export default function AdminSidebar() {
  const pathname = usePathname();
  
  const isActive = (path: string) => {
    return pathname === path || pathname.startsWith(`${path}/`);
  };
  
  const navItems = [
    {
      href: "/admin",
      icon: <LayoutDashboard className="h-5 w-5" />,
      text: "Dashboard",
      exact: true
    },
    {
      href: "/admin/projects",
      icon: <FileText className="h-5 w-5" />,
      text: "Projects"
    },
    {
      href: "/admin/asset-types",
      icon: <AssetTypeIcon className="h-5 w-5" />,
      text: "Asset Types"
    },
    {
      href: "/admin/networks",
      icon: <Globe className="h-5 w-5" />,
      text: "Networks"
    },
    {
      href: "/admin/analytics",
      icon: <BarChart3 className="h-5 w-5" />,
      text: "Analytics"
    },
    {
      href: "/admin/email-preview",
      icon: <Mail className="h-5 w-5" />,
      text: "Email Templates"
    },
    {
      href: "/admin/settings",
      icon: <Settings className="h-5 w-5" />,
      text: "Settings"
    }
  ];
  
  return (
    <aside className="w-64 bg-gray-900 border-r border-gray-800 hidden md:flex flex-col h-screen sticky top-0">
      <div className="p-6 border-b border-gray-800">
        <div className="font-bold text-xl flex items-center">
          <Layers className="h-6 w-6 mr-2 text-amber-500" />
          Admin Panel
        </div>
      </div>
      <nav className="flex-1 overflow-y-auto py-4">
        <ul className="space-y-1 px-2">
          {navItems.map((item) => (
            <li key={item.href}>
              <Link
                href={item.href}
                className={`flex items-center px-4 py-3 rounded-md transition-colors ${
                  isActive(item.href) && !(item.exact && pathname !== item.href)
                    ? "bg-gray-800 text-white"
                    : "text-gray-400 hover:text-white hover:bg-gray-800"
                }`}
              >
                {item.icon}
                <span className="ml-3">{item.text}</span>
              </Link>
            </li>
          ))}
        </ul>
      </nav>
      <div className="p-4 border-t border-gray-800 text-xs text-gray-500">
        Version 1.0.0 &copy; RWA Directory
      </div>
    </aside>
  );
}
