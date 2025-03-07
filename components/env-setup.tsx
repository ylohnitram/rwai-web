"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Button } from "@/components/ui/button"
import { AlertCircle, CheckCircle } from "lucide-react"

export default function EnvSetup() {
  const [status, setStatus] = useState<"checking" | "success" | "error">("checking")

  useEffect(() => {
    // Automaticky zkontrolovat proměnné prostředí při načtení komponenty
    checkEnvVariables()
  }, [])

  const checkEnvVariables = () => {
    // Kontrola, zda jsou nastaveny potřebné proměnné prostředí
    const supabaseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL
    const supabaseAnonKey = process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (supabaseUrl && supabaseAnonKey) {
      setStatus("success")
    } else {
      setStatus("error")
    }
  }

  return (
    <Card className="bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle>Supabase Setup</CardTitle>
        <CardDescription>
          Environment variables for Supabase need to be set for the application to work properly
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-4">
        <p className="text-gray-300">The application requires the following environment variables:</p>
        <ul className="list-disc pl-5 text-gray-300 space-y-1">
          <li>
            <code>NEXT_PUBLIC_SUPABASE_URL</code> - URL vašeho Supabase projektu
          </li>
          <li>
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> - Anonymní klíč pro přístup k Supabase
          </li>
          <li>
            <code>SUPABASE_SERVICE_ROLE_KEY</code> - (Volitelné) Servisní klíč pro serverové operace
          </li>
        </ul>

        <Button onClick={checkEnvVariables} className="bg-amber-500 hover:bg-amber-600 text-gray-900">
          Check Settings
        </Button>

        {status === "success" && (
          <Alert className="bg-green-900/30 border-green-800 text-green-300">
            <CheckCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Settings are correct</AlertTitle>
            <AlertDescription>All required environment variables are set.</AlertDescription>
          </Alert>
        )}

        {status === "error" && (
          <Alert className="bg-red-900/30 border-red-800 text-red-300">
            <AlertCircle className="h-4 w-4 mr-2" />
            <AlertTitle>Missing environment variables</AlertTitle>
            <AlertDescription>
              <p className="mb-2">
                Some required environment variables are not set. Please follow the documentation in the SETUP.md file.
              </p>
              <p>The application will work, but administrative functions will not be available.</p>
            </AlertDescription>
          </Alert>
        )}
      </CardContent>
    </Card>
  )
}

