"use client"

import { useState } from "react"
import { Loader2, AlertCircle } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import Link from "next/link"

export default function LoginPage() {
  return (
    <div className="container flex items-center justify-center min-h-[calc(100vh-170px)] py-8">
      <div className="w-full max-w-md">
        <div className="bg-gray-900 border border-gray-800 rounded-lg overflow-hidden">
          <div className="p-6">
            <h2 className="text-2xl font-bold mb-1">Admin Login</h2>
            <p className="text-gray-400 mb-6">Sign in to manage TokenDirectory</p>
            
            <div className="bg-amber-900/30 border border-amber-800 rounded-md p-4 mb-6">
              <p className="text-amber-300 font-medium mb-1">Authentication Temporarily Disabled</p>
              <p className="text-amber-200">
                Authentication service is undergoing maintenance. Use the links below for direct access.
              </p>
            </div>

            <div className="space-y-4">
              <a 
                href="/admin" 
                className="block w-full bg-amber-500 hover:bg-amber-600 text-gray-900 py-2 px-4 rounded text-center font-medium"
              >
                Direct Admin Access
              </a>
              
              <a 
                href="/admin" 
                target="_blank" 
                className="block w-full bg-blue-600 hover:bg-blue-700 text-white py-2 px-4 rounded text-center font-medium"
              >
                Open in New Tab
              </a>
              
              <form action="/admin" method="get" className="mt-4">
                <button 
                  type="submit" 
                  className="w-full bg-green-600 hover:bg-green-700 text-white py-2 px-4 rounded font-medium"
                >
                  Form Submit to Admin
                </button>
              </form>
              
              <div className="mt-4 text-center text-sm text-gray-400">
                <p>If you continue to experience issues, please contact the system administrator.</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
