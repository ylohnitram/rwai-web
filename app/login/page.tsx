"use client"

import { useState, useEffect } from "react"
import { useRouter } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Loader2, AlertCircle } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { getSupabaseClient } from "@/lib/supabase"

const formSchema = z.object({
  email: z.string().email({ message: "Zadejte platnou e-mailovou adresu" }),
  password: z.string().min(6, { message: "Heslo musí mít alespoň 6 znaků" }),
})

export default function LoginPage() {
  const [error, setError] = useState<string | null>(null)
  const [isLoading, setIsLoading] = useState(false)
  const [isSupabaseConfigured, setIsSupabaseConfigured] = useState(true)
  const router = useRouter()

  useEffect(() => {
    // Kontrola, zda jsou nastaveny proměnné prostředí pro Supabase
    if (!process.env.NEXT_PUBLIC_SUPABASE_URL || !process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY) {
      setIsSupabaseConfigured(false)
    }
  }, [])

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      email: "",
      password: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    if (!isSupabaseConfigured) {
      setError("Supabase není nakonfigurován. Nastavte proměnné prostředí.")
      return
    }

    setIsLoading(true)
    setError(null)

    try {
      const supabase = getSupabaseClient()

      const { data, error } = await supabase.auth.signInWithPassword({
        email: values.email,
        password: values.password,
      })

      if (error) {
        setError(error.message)
        setIsLoading(false)
        return
      }

      // Check if user is admin
      const { data: profileData } = await supabase.from("profiles").select("role").eq("id", data.user.id).single()

      if (profileData?.role !== "admin") {
        setError("Pouze administrátoři mají přístup")
        // Sign out the user
        await supabase.auth.signOut()
        setIsLoading(false)
        return
      }

      router.push("/admin")
      router.refresh()
    } catch (err) {
      console.error("Login error:", err)
      setError("Došlo k chybě při přihlašování")
    } finally {
      setIsLoading(false)
    }
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
            {!isSupabaseConfigured && (
              <Alert className="mb-6 bg-red-900/30 border-red-800 text-red-300">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Supabase is not configured</AlertTitle>
                <AlertDescription>
                  <p className="mb-2">
                    Supabase needs to be configured for login. Go to the Setup page and follow the instructions.
                  </p>
                  <Button asChild variant="outline" size="sm" className="mt-2 border-red-800 hover:bg-red-900/30">
                    <a href="/setup">Go to Setup</a>
                  </Button>
                </AlertDescription>
              </Alert>
            )}

            {error && (
              <Alert className="mb-6 bg-red-900/30 border-red-800 text-red-300">
                <AlertCircle className="h-4 w-4 mr-2" />
                <AlertTitle>Login Error</AlertTitle>
                <AlertDescription>{error}</AlertDescription>
              </Alert>
            )}

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
                          disabled={isLoading || !isSupabaseConfigured}
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
                          disabled={isLoading || !isSupabaseConfigured}
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />
                <Button
                  type="submit"
                  className="w-full bg-amber-500 hover:bg-amber-600 text-gray-900"
                  disabled={isLoading || !isSupabaseConfigured}
                >
                  {isLoading ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Signing in...
                    </>
                  ) : (
                    "Sign in"
                  )}
                </Button>
              </form>
            </Form>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

