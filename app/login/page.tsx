"use client"

import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  const [isLoading, setIsLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  // Function to directly navigate to admin without authentication
  const handleDirectAccess = () => {
    setIsLoading(true)
    // Use setTimeout to simulate loading
    setTimeout(() => {
      window.location.href = '/admin'
    }, 1000)
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
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

            <div className="space-y-6">
              <Alert className="bg-amber-900/30 border-amber-800 text-amber-300">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Authentication Temporarily Disabled</AlertTitle>
                <AlertDescription>
                  Authentication service is undergoing maintenance. You can use the direct access button below.
                </AlertDescription>
              </Alert>

              <Button
                onClick={handleDirectAccess}
                className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900"
                disabled={isLoading}
              >
                {isLoading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Accessing Admin...
                  </>
                ) : (
                  "Direct Admin Access"
                )}
              </Button>
              
              <div className="text-center text-sm text-gray-400 pt-4">
                <p>If you continue to experience issues, please contact the system administrator.</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}
