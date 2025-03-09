import type { Metadata } from "next";
import EnvSetup from "@/components/env-setup";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";
import { cookies } from "next/headers";
import { createServerComponentClient } from "@supabase/auth-helpers-nextjs";
import { redirect } from "next/navigation";

export const metadata: Metadata = {
  title: "Setup | TokenDirectory",
  description: "Supabase setup for TokenDirectory application",
};

export default async function SetupPage() {
  // Server-side admin check
  const cookieStore = cookies();
  const supabase = createServerComponentClient({ cookies: () => cookieStore });
  
  // Check if Supabase is configured
  const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL;
  const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY;
  
  // If Supabase is configured, perform auth check
  if (supabaseUrl && supabaseAnonKey) {
    const { data: { session } } = await supabase.auth.getSession();
    
    // If not logged in, redirect to login
    if (!session) {
      redirect("/login?from=/setup");
    }
    
    // Check if user is admin
    const { data: userData } = await supabase
      .from("profiles")
      .select("role")
      .eq("id", session.user.id)
      .single();
    
    // If not admin, redirect to home
    if (userData?.role !== "admin") {
      redirect("/");
    }
  }
  // If Supabase is not configured, we allow access to setup page
  
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
          <EnvSetup />

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
                Sign up on{" "}
                
                  href="https://supabase.com"
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-amber-500 hover:underline"
                >
                  Supabase
                </a>{" "}
                and create a new project.
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
                Create a <code>.env.local</code> file in the project's root directory and add the obtained values:
              </p>
              <pre className="bg-gray-800 p-3 rounded-md text-gray-300 overflow-x-auto">
                <code>
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co{"\n"}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key{"\n"}
                  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
                </code>
              </pre>

              <h3 className="text-lg font-medium">4. Create database tables</h3>
              <p className="text-gray-300">
                In the Supabase dashboard, go to "SQL Editor" and run the SQL code from the file{" "}
                <code>supabase/schema.sql</code>.
              </p>

              <h3 className="text-lg font-medium">5. Create an admin account</h3>
              <p className="text-gray-300">
                Follow the instructions in the SETUP.md file to create an administrator account.
              </p>

              <h3 className="text-lg font-medium">6. Restart the application</h3>
              <p className="text-gray-300">After setting all environment variables, restart the application.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
