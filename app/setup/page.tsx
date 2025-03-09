import type { Metadata } from "next"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import Link from "next/link"
import { Button } from "@/components/ui/button"
import { ArrowLeft } from "lucide-react"

export const metadata: Metadata = {
  title: "Setup | TokenDirectory",
  description: "Supabase setup for TokenDirectory application",
}

export default function SetupPage() {
  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="mb-8">
        <Button asChild variant="outline" size="sm">
          <Link href="/">
            <ArrowLeft className="h-4 w-4 mr-1" />
            Back to Home
          </Link>
        </Button>
      </div>

      <div className="max-w-3xl mx-auto">
        <h1 className="text-3xl font-bold tracking-tighter mb-6">TokenDirectory Setup</h1>

        <div className="space-y-8">
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Supabase Connection Status</CardTitle>
              <CardDescription>
                Check if the application is properly connected to Supabase
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <p className="text-gray-300">The application requires the following environment variables:</p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                <li>
                  <code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL
                </li>
                <li>
                  <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Anonymous access key for Supabase
                </li>
                <li>
                  <code>SUPABASE_SERVICE_ROLE_KEY</code> - (Optional) Service role key for server operations
                </li>
              </ul>
            </CardContent>
          </Card>

          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Setup Process</CardTitle>
              <CardDescription>
                Complete guide for setting up Supabase and connecting it with the application
              </CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <h3 className="text-lg font-medium">1. Create a Supabase project</h3>
              <p className="text-gray-300">
                Sign up on Supabase and create a new project.
              </p>

              <h3 className="text-lg font-medium">2. Get access credentials</h3>
              <p className="text-gray-300">In the Supabase dashboard, go to "Project Settings" &gt; "API" and copy:</p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                <li>Project URL (NEXT_PUBLIC_SUPABASE_URL)</li>
                <li>anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)</li>
                <li>service_role key (SUPABASE_SERVICE_ROLE_KEY)</li>
              </ul>

              <h3 className="text-lg font-medium">3. Set up environment variables</h3>
              <p className="text-gray-300">
                Create a <code>.env.local</code> file in the project's root directory and add the obtained values.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
