import Link from "next/link"
import { ArrowRight, BarChart3, Layers, Shield, ChevronDown } from "lucide-react"
import { WebsiteSchema, OrganizationSchema } from "@/components/seo/structured-data"
import { createClient } from '@supabase/supabase-js';

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectCard from "@/components/project-card"
import BlogCard from "@/components/blog-card"
import LegalDisclaimer from "@/components/legal-disclaimer"
import { getFeaturedProjects } from "@/lib/services/project-service"
import { getBlogPosts } from "@/lib/services/blog-service"

// Function to get the project count
async function getApprovedProjectCount() {
  // Create a Supabase client for server-side usage
  const supabaseServer = createClient(
    process.env.NEXT_PUBLIC_SUPABASE_URL || '',
    process.env.SUPABASE_SERVICE_ROLE_KEY || '',
    {
      auth: {
        autoRefreshToken: false,
        persistSession: false
      }
    }
  );
  
  try {
    // Get count of approved projects
    const { count, error } = await supabaseServer
      .from("projects")
      .select("*", { count: "exact", head: true })
      .eq("approved", true);
      
    if (error) {
      console.error("Error fetching project count:", error);
      return "20+"; // Fallback value if there's an error
    }
    
    // Round down to nearest 10 and add '+'
    const roundedCount = Math.floor((count || 0) / 10) * 10;
    return `${roundedCount}+`;
  } catch (err) {
    console.error("Error calculating project count:", err);
    return "20+"; // Fallback value if there's an error
  }
}

export default async function Home() {
  // Get the dynamic project count
  const projectCount = await getApprovedProjectCount();
  
  // Fetch featured projects from database
  const featuredProjects = await getFeaturedProjects(3);
  
  // Fetch latest blog posts from database
  const latestBlogPosts = await getBlogPosts({ limit: 3 });

  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
      {/* Add structured data */}
      <WebsiteSchema />
      <OrganizationSchema />
      
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-48 relative flex items-center justify-center">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="inline-flex px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-medium text-sm">
              {projectCount} audited projects
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
                <span className="text-amber-500">Invest</span> in Audited Tokenized
                <br />
                Real-World Assets
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                TokenDirectory by RWA Investors – Explore {projectCount} audited RWA projects with transparent data, global access, and institutional-grade analytics.
              </p>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6">
              <Button asChild size="lg" className="px-8 bg-amber-500 hover:bg-amber-600 text-gray-900">
                <Link href="/directory" className="flex items-center">
                  Browse Directory
                  <ArrowRight className="ml-2 h-4 w-4" />
                </Link>
              </Button>
              <Button asChild size="lg" variant="outline" className="px-8 border-gray-700">
                <Link href="/submit">Submit Project</Link>
              </Button>
            </div>

            <div className="text-gray-400 animate-bounce mt-16">
              <p className="mb-2">Scroll to explore</p>
              <ChevronDown className="h-6 w-6 mx-auto" />
            </div>
          </div>
        </div>

        {/* Background effect */}
        <div className="absolute inset-0 w-full h-full">
          <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[500px] h-[500px] rounded-full bg-amber-500/5 blur-3xl"></div>
          <div className="absolute bottom-0 left-0 right-0 h-px bg-gradient-to-r from-transparent via-amber-500/10 to-transparent"></div>
        </div>
      </section>

      {/* Value Cards */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm hover:border-amber-500/30 transition-all">
              <CardHeader className="pb-2">
                <Shield className="h-12 w-12 text-amber-500 mb-2" />
                <CardTitle className="text-xl">Audited Projects</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  All listed projects undergo rigorous security and legal audits to ensure compliance and investor
                  safety.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm hover:border-amber-500/30 transition-all">
              <CardHeader className="pb-2">
                <BarChart3 className="h-12 w-12 text-amber-500 mb-2" />
                <CardTitle className="text-xl">Institutional Grade</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Curated selection of projects that meet institutional investment requirements and standards.
                </CardDescription>
              </CardContent>
            </Card>
            <Card className="bg-gray-900/60 border-gray-800 backdrop-blur-sm hover:border-amber-500/30 transition-all">
              <CardHeader className="pb-2">
                <Layers className="h-12 w-12 text-amber-500 mb-2" />
                <CardTitle className="text-xl">Multi-Chain</CardTitle>
              </CardHeader>
              <CardContent>
                <CardDescription className="text-gray-400">
                  Diversified projects across multiple blockchains including Ethereum, Polygon, Solana and more.
                </CardDescription>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Featured Projects */}
      <section className="w-full py-12 md:py-24 lg:py-32 bg-gray-900/30">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Featured Projects</h2>
              <p className="text-gray-400">Discover top-performing real world assets</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="gap-1 border-gray-700 hover:border-amber-500 hover:text-amber-500"
            >
              <Link href="/directory">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {featuredProjects.map((project) => (
              <ProjectCard
                key={project.id}
                name={project.name}
                type={project.type}
                blockchain={project.blockchain}
                roi={project.roi}
                id={project.id}
                tvl={project.tvl}
              />
            ))}
          </div>
        </div>
      </section>

      {/* Legal Disclaimer Section */}
      <section className="w-full py-6 md:py-12">
        <div className="container px-4 md:px-6">
          <LegalDisclaimer />
        </div>
      </section>

      {/* Latest Blog Posts */}
      <section className="w-full py-12 md:py-24 lg:py-32">
        <div className="container px-4 md:px-6">
          <div className="flex flex-col items-start gap-4 md:flex-row md:justify-between md:items-center mb-8">
            <div>
              <h2 className="text-3xl font-bold tracking-tighter sm:text-4xl">Latest Blog Posts</h2>
              <p className="text-gray-400">Insights on RWA tokenization and investment</p>
            </div>
            <Button
              asChild
              variant="outline"
              className="gap-1 border-gray-700 hover:border-amber-500 hover:text-amber-500"
            >
              <Link href="/blog">
                View All
                <ArrowRight className="ml-2 h-4 w-4" />
              </Link>
            </Button>
          </div>
          <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3">
            {latestBlogPosts.map((post) => (
              <BlogCard
                key={post.slug}
                title={post.title}
                excerpt={post.excerpt}
                slug={post.slug}
                date={post.date}
              />
            ))}
          </div>
        </div>
      </section>
    </div>
  )
}
