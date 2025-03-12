"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { ChevronRight, Home } from "lucide-react"

export default function Breadcrumbs() {
  const pathname = usePathname()

  if (pathname === "/") return null

  const pathSegments = pathname.split("/").filter(Boolean)

  // Create breadcrumb items with proper labels and redirects
  const breadcrumbs = pathSegments.map((segment, index) => {
    // Special case for "projects" to redirect to "directory"
    let href = index === 0 && segment === "projects" ? "/directory" : `/${pathSegments.slice(0, index + 1).join("/")}`
    
    // Format the segment for display (capitalize, replace hyphens)
    let label = segment.replace(/-/g, " ")
    label = label.charAt(0).toUpperCase() + label.slice(1)
    
    // Special case for "projects" label
    if (segment === "projects") {
      label = "Directory"
    }

    return { href, label }
  })

  return (
    <nav className="flex items-center text-sm text-gray-400 mb-6" aria-label="Breadcrumb">
      <ol className="flex items-center space-x-2" itemScope itemType="https://schema.org/BreadcrumbList">
        <li itemProp="itemListElement" itemScope itemType="https://schema.org/ListItem">
          <Link href="/" className="hover:text-white transition-colors flex items-center" itemProp="item">
            <Home className="h-4 w-4" />
            <span className="sr-only" itemProp="name">Home</span>
            <meta itemProp="position" content="1" />
          </Link>
        </li>

        {breadcrumbs.map((breadcrumb, index) => (
          <li 
            key={breadcrumb.href} 
            className="flex items-center"
            itemProp="itemListElement" 
            itemScope 
            itemType="https://schema.org/ListItem"
          >
            <ChevronRight className="h-4 w-4 mx-1" />
            {index === breadcrumbs.length - 1 ? (
              <span className="text-white font-medium" itemProp="name">{breadcrumb.label}</span>
            ) : (
              <Link href={breadcrumb.href} className="hover:text-white transition-colors" itemProp="item">
                <span itemProp="name">{breadcrumb.label}</span>
              </Link>
            )}
            <meta itemProp="position" content={(index + 2).toString()} />
          </li>
        ))}
      </ol>
    </nav>
  )
}
