import type { MetadataRoute } from "next"
import { createClient } from '@supabase/supabase-js'
import { getBlogPosts } from "@/lib/services/blog-service"
import { getProjects } from "@/lib/services/project-service"

// Create a Supabase client for server operations
const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL || ''
const supabaseKey = process.env.SUPABASE_SERVICE_ROLE_KEY || ''
const supabase = createClient(supabaseUrl, supabaseKey, {
  auth: { persistSession: false }
})

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const baseUrl = process.env.NEXT_PUBLIC_SITE_URL || "https://rwa-directory.vercel.app"
  
  // Get all approved projects from the database
  const { data: projects } = await getProjects({ 
    status: 'approved',
    limit: 1000  // Adjust limit as needed
  })
  
  const projectUrls = projects.map((project) => {
    // Format the project name to create the slug
    const slug = project.name.toLowerCase().replace(/\s+/g, "-").replace(/[^a-z0-9-]/g, "")
    
    return {
      url: `${baseUrl}/projects/${slug}`,
      lastModified: project.updated_at ? new Date(project.updated_at) : new Date(),
      changeFrequency: "weekly" as const,
      priority: 0.8,
    }
  })

  // Get all blog posts from the database
  const blogPosts = await getBlogPosts({ limit: 1000 })
  
  const blogPostUrls = blogPosts.map((post) => ({
    url: `${baseUrl}/blog/${post.slug}`,
    lastModified: new Date(post.date),
    changeFrequency: "monthly" as const,
    priority: 0.7,
  }))

  // Add the blog index page
  const blogIndexUrl = {
    url: `${baseUrl}/blog`,
    lastModified: blogPosts.length > 0 
      ? new Date(Math.max(...blogPosts.map(post => new Date(post.date).getTime())))
      : new Date(),
    changeFrequency: "weekly" as const,
    priority: 0.7,
  }

  // Static pages with appropriate priorities
  const staticPages = [
    {
      url: baseUrl,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 1,
    },
    {
      url: `${baseUrl}/directory`,
      lastModified: new Date(),
      changeFrequency: "daily" as const,
      priority: 0.9,
    },
    {
      url: `${baseUrl}/faq`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/about`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
    {
      url: `${baseUrl}/legal`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/privacy`,
      lastModified: new Date(),
      changeFrequency: "yearly" as const,
      priority: 0.4,
    },
    {
      url: `${baseUrl}/contact`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.5,
    },
    {
      url: `${baseUrl}/submit`,
      lastModified: new Date(),
      changeFrequency: "monthly" as const,
      priority: 0.6,
    },
  ]

  return [
    ...staticPages,
    ...projectUrls,
    blogIndexUrl,
    ...blogPostUrls,
  ]
}
