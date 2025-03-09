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
  
  // If we reach here, either Supabase is not configured or the user is an admin
  return renderSetupPage();
}

function renderSetupPage() {
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
                Create a <code>.env.local</code> file in the project&apos;s root directory and add the obtained values:
              </p>
              <pre className="bg-gray-800 p-3 rounded-md text-gray-300 overflow-x-auto">
                <code>
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co{"\n"}
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key{"\n"}
                  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key{"\n"}
                  REVALIDATION_TOKEN=choose-a-secure-random-token-here{"\n"}
                  IPINFO_TOKEN=your-ipinfo-token-if-using-geolocation
                </code>
              </pre>

              <h3 className="text-lg font-medium">4. Run database migrations</h3>
              <p className="text-gray-300">
                In the Supabase dashboard, go to "SQL Editor" and run the migrations in the correct order:
              </p>
              <ol className="list-decimal pl-5 text-gray-300 space-y-1">
                <li><code>supabase/schema.sql</code> - Basic user profiles setup</li>
                <li><code>supabase/migrations/01_create_projects.sql</code> - Projects table</li>
                <li><code>supabase/migrations/02_create_blog_posts.sql</code> - Blog posts table</li>
                <li><code>supabase/migrations/03_enhance_projects_schema.sql</code> - Project workflow fields</li>
                <li><code>supabase/migrations/04_fix_rls_policies.sql</code> - Fix permissions</li>
                <li><code>supabase/migrations/05_create_validation_results.sql</code> - Validation system</li>
              </ol>
              <p className="text-gray-300 mt-2">
                Alternatively, you can use the migration script with the service role key:
              </p>
              <pre className="bg-gray-800 p-3 rounded-md text-gray-300 overflow-x-auto">
                <code>npm run migrate</code>
              </pre>

              <h3 className="text-lg font-medium">5. Set up storage buckets</h3>
              <p className="text-gray-300">
                In the Supabase dashboard, go to "Storage" and create the following buckets:
              </p>
              <ul className="list-disc pl-5 text-gray-300 space-y-1">
                <li><strong>audit-documents</strong> - For project audit reports and documents</li>
              </ul>
              <p className="text-gray-300 mt-2">
                Set appropriate bucket policies for each:
              </p>
              <pre className="bg-gray-800 p-3 rounded-md text-gray-300 overflow-x-auto">
                <code>
                  // For audit-documents bucket{"\n"}
                  // Only admins can insert, but everyone can download public files{"\n"}
                  {"CREATE POLICY \"Authenticated users can upload\" ON storage.objects FOR INSERT TO authenticated WITH CHECK (bucket_id = 'audit-documents');"}
                </code>
              </pre>

              <h3 className="text-lg font-medium">6. Fix permissions for validation</h3>
              <p className="text-gray-300">
                Run the following SQL to ensure proper service role permissions for validation:
              </p>
              <pre className="bg-gray-800 p-3 rounded-md text-gray-300 overflow-x-auto">
                <code>
                  {"-- Grant necessary permissions to service_role\n"}
                  {"GRANT ALL PRIVILEGES ON ALL TABLES IN SCHEMA public TO service_role;\n"}
                  {"GRANT ALL PRIVILEGES ON ALL SEQUENCES IN SCHEMA public TO service_role;\n\n"}
                  {"-- Grant access to auth schema for user references\n"}
                  {"GRANT USAGE ON SCHEMA auth TO service_role;\n"}
                  {"GRANT SELECT ON auth.users TO service_role;\n\n"}
                  {"-- Create policy that allows service_role to bypass RLS on validation_results table\n"}
                  {"CREATE POLICY \"service_role can do all on validation_results\"\n"}
                  {"ON public.validation_results\n"}
                  {"FOR ALL\n"}
                  {"USING (auth.role() = 'service_role')\n"}
                  {"WITH CHECK (auth.role() = 'service_role');"}
                </code>
              </pre>

              <h3 className="text-lg font-medium">7. Create an admin account</h3>
              <p className="text-gray-300">To create an admin account:</p>
              <ol className="list-decimal pl-5 text-gray-300 space-y-1">
                <li>Go to the "Authentication" &gt; "Users" section in Supabase</li>
                <li>Click on "Invite" and enter an email address</li>
                <li>After the user signs up, access the "Table Editor" &gt; "profiles" table</li>
                <li>Find your user account and change the "role" field value from "user" to "admin"</li>
              </ol>

              <h3 className="text-lg font-medium">8. Set up notifications (optional)</h3>
              <p className="text-gray-300">
                For email notifications to work, add a third-party email service (e.g., SendGrid, Mailgun)
                integration and add their API keys to your environment variables.
              </p>

              <h3 className="text-lg font-medium">9. Set up geolocation (optional)</h3>
              <p className="text-gray-300">
                To enable geolocation for region-specific compliance notices:
              </p>
              <ol className="list-decimal pl-5 text-gray-300 space-y-1">
                <li>Sign up for an account at <a href="https://ipinfo.io/" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">IPInfo.io</a> or similar service</li>
                <li>Add your API token to the <code>IPINFO_TOKEN</code> environment variable</li>
              </ol>

              <h3 className="text-lg font-medium">10. Restart the application</h3>
              <p className="text-gray-300">After setting all environment variables and database settings, restart the application.</p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
