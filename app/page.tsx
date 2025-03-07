import Link from "next/link"
import { ArrowRight, BarChart3, Layers, Shield, ChevronDown } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import ProjectCard from "@/components/project-card"
import BlogCard from "@/components/blog-card"
import LegalDisclaimer from "@/components/legal-disclaimer"

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-[#0F172A] text-white">
      {/* Hero Section */}
      <section className="w-full py-20 md:py-32 lg:py-48 relative flex items-center justify-center">
        <div className="container px-4 md:px-6 relative z-10">
          <div className="flex flex-col items-center space-y-10 text-center">
            <div className="inline-flex px-4 py-1.5 rounded-full bg-amber-500/10 text-amber-500 font-medium text-sm">
              100+ audited projects
            </div>

            <div className="space-y-2">
              <h1 className="text-4xl font-bold tracking-tighter sm:text-5xl md:text-6xl lg:text-7xl max-w-4xl">
                <span className="text-amber-500">Invest</span> in Tokenized
                <br />
                Real-World Assets
              </h1>
              <p className="mx-auto max-w-[700px] text-gray-400 md:text-xl">
                Explore 100+ audited RWA projects with transparent data, global access, and institutional-grade
                analytics.
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
            <ProjectCard
              name="Manhattan Real Estate Fund"
              type="Real Estate"
              blockchain="Ethereum"
              roi={8.2}
              id="manhattan-fund"
            />
            <ProjectCard
              name="Renaissance Art Collection"
              type="Art"
              blockchain="Polygon"
              roi={9.5}
              id="renaissance-art"
            />
            <ProjectCard
              name="Global Commodity Index"
              type="Commodities"
              blockchain="Solana"
              roi={7.8}
              id="commodity-index"
            />
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
            <BlogCard
              title="The Evolution of Real World Assets on Blockchain"
              excerpt="How tokenization is transforming traditional investment markets and creating new opportunities for investors globally."
              slug="rwa-evolution"
              date="2023-05-15"
            />
            <BlogCard
              title="Regulatory Landscape for Tokenized Securities"
              excerpt="A comprehensive overview of the current regulatory frameworks governing tokenized securities across major jurisdictions."
              slug="regulatory-landscape"
              date="2023-06-02"
            />
            <BlogCard
              title="Institutional Adoption of RWAs in 2023"
              excerpt="Analysis of how major financial institutions are increasingly investing in tokenized real-world assets."
              slug="institutional-adoption"
              date="2023-07-10"
            />
          </div>
        </div>
      </section>
    </div>
  )
}
