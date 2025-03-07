"use client"

<<<<<<< HEAD
import { useState } from "react"
=======
import { useState, useRef } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
>>>>>>> c6ea9faafc728760f27f05b4f4ff8a36069ee3aa
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
<<<<<<< HEAD
=======
  const [diagnosticInfo, setDiagnosticInfo] = useState<string | null>(null)
  const timeoutRef = useRef<NodeJS.Timeout | null>(null)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    // Clear any existing timeout
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current)
    }
    
    setIsLoading(true)
    setError(null)
    setDiagnosticInfo("Starting authentication...")

    // Set timeout for request
    timeoutRef.current = setTimeout(() => {
      setIsLoading(false)
      setError("Authentication request timed out. Please try again.")
      setDiagnosticInfo("Timed out after 15 seconds")
    }, 15000)
>>>>>>> c6ea9faafc728760f27f05b4f4ff8a36069ee3aa

  // Pure emergency bypass that doesn't use any Supabase code
  function emergencyBypass() {
    try {
<<<<<<< HEAD
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
=======
      const supabase = getSupabaseClient()

      setDiagnosticInfo("Sending authentication request to Supabase...")
      
      // Simplified login - just try to authenticate
      const { data, error: signInError } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }

      if (signInError) {
        setError(signInError.message)
        setDiagnosticInfo(`Auth error: ${signInError.message}`)
        setIsLoading(false)
        return
      }

      setDiagnosticInfo(`Auth successful. User ID: ${data.user?.id}. Checking profile...`)

      // Check admin status
      try {
        const { data: profileData, error: profileError } = await supabase
          .from("profiles")
          .select("role")
          .eq("id", data.user.id)
          .single()

        if (profileError) {
          setError(`Profile error: ${profileError.message}`)
          setDiagnosticInfo(`Profile error: ${profileError.message}`)
          setIsLoading(false)
          return
        }

        setDiagnosticInfo(`Profile retrieved. Role: ${profileData?.role}`)

        if (profileData?.role !== "admin") {
          setError("Only administrators have access")
          setDiagnosticInfo("Access denied: User is not an admin")
          setIsLoading(false)
          return
        }

        // Success - redirect
        setDiagnosticInfo("Authentication successful! Redirecting to admin page...")
        window.location.href = '/admin'
      } catch (profileErr: any) {
        setError(`Profile check error: ${profileErr.message}`)
        setDiagnosticInfo(`Profile check exception: ${profileErr.message}`)
        setIsLoading(false)
      }
    } catch (err: any) {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current)
        timeoutRef.current = null
      }
      
      setError(`Unexpected error: ${err.message}`)
      setDiagnosticInfo(`Exception caught: ${err.message}`)
      setIsLoading(false)
    }
  }

  function handleDirectAccess() {
    window.location.href = '/admin'
>>>>>>> c6ea9faafc728760f27f05b4f4ff8a36069ee3aa
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

<<<<<<< HEAD
            <div className="space-y-4">
              <p className="text-amber-500 font-medium">Authentication is currently unavailable.</p>
              <p className="text-gray-300 mb-4">This is a temporary emergency access page. Please try one of the options below:</p>
              
              <div className="space-y-3">
                <Button 
                  onClick={emergencyBypass}
=======
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="email"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Email</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="your@email.com"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <FormField
                  control={form.control}
                  name="password"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Password</FormLabel>
                      <FormControl>
                        <Input
                          type="password"
                          placeholder="••••••••"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                          disabled={isLoading}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
>>>>>>> c6ea9faafc728760f27f05b4f4ff8a36069ee3aa
                  className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900"
                >
                  Emergency Form Submission
                </Button>
<<<<<<< HEAD
                
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
=======

                {/* Emergency direct access button - for testing only */}
                <div className="mt-8 pt-6 border-t border-gray-800">
                  <p className="text-sm text-gray-400 mb-4">If you're having trouble logging in, you can try direct access for troubleshooting:</p>
                  <Button 
                    type="button"
                    onClick={handleDirectAccess}
                    variant="outline"
                    className="w-full border-red-800 hover:bg-red-900/30 text-red-400"
                  >
                    Emergency Direct Access (Testing Only)
                  </Button>
                </div>
              </form>
            </Form>
>>>>>>> c6ea9faafc728760f27f05b4f4ff8a36069ee3aa
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
