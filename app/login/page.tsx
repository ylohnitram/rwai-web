"use client"

import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)

  // Pure emergency bypass that doesn't use any Supabase code
  function emergencyBypass() {
    try {
      setDiagnosticInfo("Attempting emergency bypass...")
      
      // Create a form submission that goes directly to /admin
      const form = document.createElement('form')
      form.method = 'GET'
      form.action = '/admin'
      document.body.appendChild(form)
      form.submit()
    } catch (err: any) {
      setError(`Emergency bypass failed: ${err.message}`)
    }
  }

  // Hard navigation direct to admin
  function hardNavigation() {
    setDiagnosticInfo("Using hard navigation to /admin...")
    window.location.replace('/admin')
  }

  // Open in new tab
  function openInNewTab() {
    setDiagnosticInfo("Opening admin in new tab...")
    window.open('/admin', '_blank')
  }

  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-170px)] py-8">
      <div className="w-full max-w-md">
        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle className="text-2xl">Admin Login</CardTitle>
            <CardDescription>Sign in to manage TokenDirectory</CardDescription>
          </CardHeader>
          <CardContent>
            {error && (
              <Alert className="mb-6 bg-red-900/30 border-red-800 text-red-300">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            {diagnosticInfo && (
              <Alert className="mb-6 bg-blue-900/30 border-blue-800 text-blue-300">
                <AlertTitle>Diagnostic Info</AlertTitle>
                <AlertDescription>{diagnosticInfo}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-4">
              <p className="text-amber-500 font-medium">Authentication is currently unavailable.</p>
              <p className="text-gray-300 mb-4">This is a temporary emergency access page. Please try one of the options below:</p>
              
              <div className="space-y-3">
                <Button 
                  onClick={emergencyBypass}
                  className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900"
                >
                  Emergency Form Submission
                </Button>
                
                <Button 
                  onClick={hardNavigation}
                  className="w-full bg-blue-600 hover:bg-blue-700"
                >
                  Direct URL Navigation
                </Button>
                
                <Button 
                  onClick={openInNewTab}
                  className="w-full bg-green-600 hover:bg-green-700"
                >
                  Open Admin in New Tab
                </Button>
                
                <div className="pt-4 border-t border-gray-800 mt-4">
                  <p className="text-gray-400 text-sm mb-2">Direct links:</p>
                  <ul className="space-y-2">
                    <li>
                      <a 
                        href="/admin" 
                        className="text-blue-400 hover:underline block p-2 bg-gray-800 rounded"
                      >
                        Regular Link to /admin
                      </a>
                    </li>
                    <li>
                      <a 
                        href="/admin" 
                        target="_blank" 
                        rel="noopener noreferrer" 
                        className="text-green-400 hover:underline block p-2 bg-gray-800 rounded"
                      >
                        Open in New Tab
                      </a>
                    </li>
                  </ul>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
