import type { Metadata } from "next";
import Link from "next/link";
import { Button } from "@/components/ui/button";
import { ArrowLeft } from "lucide-react";

export const metadata: Metadata = {
  title: "Setup | TokenDirectory",
  description: "Supabase setup for TokenDirectory application",
};

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
          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Supabase Connection Status</h2>
            <p className="text-sm text-gray-400 mb-4">Check if the application is properly connected to Supabase</p>
            
            <p className="text-gray-300 mb-4">The application requires the following environment variables:</p>
            <ul className="list-disc pl-5 text-gray-300 space-y-1 mb-4">
              <li><code>NEXT_PUBLIC_SUPABASE_URL</code> - Your Supabase project URL</li>
              <li><code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Anonymous access key for Supabase</li>
              <li><code>SUPABASE_SERVICE_ROLE_KEY</code> - (Optional) Service role key for server operations</li>
            </ul>

            <div className="bg-green-900/30 border border-green-800 text-green-300 p-4 rounded-md">
              <div className="flex items-center mb-2">
                <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="mr-2"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"></path><polyline points="22 4 12 14.01 9 11.01"></polyline></svg>
                <span className="font-bold">Connection Successful</span>
              </div>
              <p>All required environment variables are set and Supabase connection is working.</p>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Setup Process</h2>
            <p className="text-sm text-gray-400 mb-4">Complete guide for setting up Supabase and connecting it with the application</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">1. Create a Supabase project</h3>
                <p className="text-gray-300">
                  Sign up on <a href="https://supabase.com" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">Supabase</a> and create a new project.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">2. Get access credentials</h3>
                <p className="text-gray-300 mb-2">In the Supabase dashboard, go to "Project Settings" &gt; "API" and copy:</p>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  <li>Project URL (NEXT_PUBLIC_SUPABASE_URL)</li>
                  <li>anon public key (NEXT_PUBLIC_SUPABASE_ANON_KEY)</li>
                  <li>service_role key (SUPABASE_SERVICE_ROLE_KEY)</li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">3. Set up environment variables</h3>
                <p className="text-gray-300 mb-2">
                  Create a <code>.env.local</code> file in the project's root directory and add the obtained values:
                </p>
                <div className="bg-gray-800 p-3 rounded-md text-gray-300 overflow-x-auto">
                  NEXT_PUBLIC_SUPABASE_URL=https://your-project-id.supabase.co<br/>
                  NEXT_PUBLIC_SUPABASE_ANON_KEY=your-anon-key<br/>
                  SUPABASE_SERVICE_ROLE_KEY=your-service-role-key
                </div>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">4. Create database tables</h3>
                <p className="text-gray-300">
                  In the Supabase dashboard, go to "SQL Editor" and run the SQL code from the file <code>supabase/schema.sql</code>.
                </p>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">5. Create an admin account</h3>
                <p className="text-gray-300 mb-2">
                  Follow these steps to create an administrator account:
                </p>
                <ol className="list-decimal pl-5 text-gray-300 space-y-2">
                  <li>Go to the Supabase dashboard for your project</li>
                  <li>Navigate to "Authentication" &gt; "Users"</li>
                  <li>Click "Invite" and enter an email for the admin account</li>
                  <li>The user will receive an email with an invitation link to set a password</li>
                  <li>After the user creates their account, go to "Table Editor" &gt; "profiles"</li>
                  <li>Find the user record and change the "role" value from "user" to "admin"</li>
                </ol>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">6. Optional: IP geolocation setup</h3>
                <p className="text-gray-300 mb-2">
                  To enable regional compliance notices, set up a geolocation API:
                </p>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  <li>Sign up for a service like <a href="https://ipinfo.io" target="_blank" rel="noopener noreferrer" className="text-amber-500 hover:underline">ipinfo.io</a></li>
                  <li>Get an API token and add it to your environment variables as <code>IPINFO_TOKEN</code></li>
                </ul>
              </div>

              <div>
                <h3 className="text-lg font-medium mb-2">7. Restart the application</h3>
                <p className="text-gray-300">
                  After setting all environment variables, restart the application to apply the changes.
                </p>
              </div>

              <div className="bg-blue-900/30 border border-blue-800 rounded-md p-4">
                <h4 className="text-blue-300 font-medium mb-2">Pro Tip: Database Migrations</h4>
                <p className="text-blue-100 mb-2">
                  For advanced setup, you can use the migration scripts in the <code>supabase/migrations</code> folder.
                  Run them in sequence to set up all database tables with the correct permissions and relationships:
                </p>
                <div className="bg-gray-800 p-2 rounded-md text-gray-300">
                  npm run migrate
                </div>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Troubleshooting</h2>
            <p className="text-sm text-gray-400 mb-4">Common issues and their solutions</p>
            
            <div className="space-y-6">
              <div>
                <h3 className="text-lg font-medium mb-2">Authentication issues</h3>
                <p className="text-gray-300 mb-2">
                  If you're having trouble logging in with admin credentials:
                </p>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  <li>Verify the "role" field in the profiles table is set to "admin"</li>
                  <li>Check that all required environment variables are properly set</li>
                  <li>Clear browser cookies and cache, then try logging in again</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Missing admin links</h3>
                <p className="text-gray-300 mb-2">
                  If the Admin and Setup links are not appearing in the navbar after login:
                </p>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  <li>Verify you're logged in with an account that has the admin role</li>
                  <li>Try refreshing the page after login</li>
                  <li>Check browser console for any authentication errors</li>
                </ul>
              </div>
              
              <div>
                <h3 className="text-lg font-medium mb-2">Database permissions</h3>
                <p className="text-gray-300 mb-2">
                  If you encounter permission errors when accessing data:
                </p>
                <ul className="list-disc pl-5 text-gray-300 space-y-1">
                  <li>Run the migration <code>04_fix_rls_policies.sql</code> to update Row Level Security</li>
                  <li>Check that the service role key has the correct permissions</li>
                </ul>
              </div>
            </div>
          </div>

          <div className="bg-gray-900 border border-gray-800 rounded-lg p-6">
            <h2 className="text-xl font-bold mb-4">Security Recommendations</h2>
            <p className="text-sm text-gray-400 mb-4">Best practices for secure deployment</p>
            
            <ul className="list-disc pl-5 text-gray-300 space-y-2">
              <li>Never expose your <code>SUPABASE_SERVICE_ROLE_KEY</code> in client-side code</li>
              <li>Enable Two-Factor Authentication for your Supabase account</li>
              <li>Regularly rotate API keys, especially if you suspect they may have been compromised</li>
              <li>Set up proper Row Level Security policies to restrict data access</li>
              <li>Consider enabling IP restrictions in Supabase for administrator access</li>
              <li>Keep your application and dependencies up to date</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  );
}
