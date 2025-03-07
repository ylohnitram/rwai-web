"use client"

import { useState } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Check, Info, Loader2 } from "lucide-react"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"

const formSchema = z.object({
  projectName: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  assetType: z.string({
    required_error: "Please select an asset type.",
  }),
  blockchain: z.string({
    required_error: "Please select a blockchain.",
  }),
  roi: z.coerce
    .number()
    .min(0, {
      message: "ROI must be a positive number.",
    })
    .max(100, {
      message: "ROI cannot exceed 100%.",
    }),
  url: z.string().url({
    message: "Please enter a valid URL.",
  }),
  description: z
    .string()
    .min(50, {
      message: "Description must be at least 50 characters.",
    })
    .max(1000, {
      message: "Description cannot exceed 1000 characters.",
    }),
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

export default function SubmitPage() {
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      projectName: "",
      description: "",
      roi: 0,
      url: "",
      contactEmail: "",
    },
  })

  async function onSubmit(values: z.infer<typeof formSchema>) {
    setIsSubmitting(true)

    // Simulate API call
    await new Promise((resolve) => setTimeout(resolve, 1500))

    console.log(values)
    setIsSubmitting(false)
    setIsSubmitted(true)
  }

  if (isSubmitted) {
    return (
      <div className="container py-12 px-4 md:px-6">
        <Card className="max-w-2xl mx-auto bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <Check className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">Project Submitted Successfully</CardTitle>
            </div>
            <CardDescription>Thank you for submitting your project to the RWA Investment Directory.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Our team will review your submission within the next 3-5 business days. You will receive a notification
              via email once the review is complete.
            </p>
            <p className="text-gray-300">
              If additional information is needed, we will reach out to you using the contact email you provided.
            </p>
            <div className="flex justify-center mt-4">
              <Button onClick={() => setIsSubmitted(false)}>Submit Another Project</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Submit Your Project</h1>
          <p className="text-gray-400">Add your tokenized real-world asset to our global directory</p>
        </div>

        <Alert className="mb-8 bg-gray-800 border-blue-700">
          <Info className="h-4 w-4 text-blue-500" />
          <AlertTitle>Before you submit</AlertTitle>
          <AlertDescription>
            All submissions undergo a thorough review process to ensure they meet our quality standards. Please ensure
            your project has proper documentation, auditing, and legal compliance before submitting.
          </AlertDescription>
        </Alert>

        <Card className="bg-gray-900 border-gray-800">
          <CardHeader>
            <CardTitle>Project Information</CardTitle>
            <CardDescription>Fields marked with an asterisk (*) are required.</CardDescription>
          </CardHeader>
          <CardContent>
            <Form {...form}>
              <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
                <FormField
                  control={form.control}
                  name="projectName"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Name *</FormLabel>
                      <FormControl>
                        <Input
                          placeholder="Enter your project name"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="assetType"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Asset Type *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Select asset type" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Real Estate">Real Estate</SelectItem>
                            <SelectItem value="Art">Art</SelectItem>
                            <SelectItem value="Commodities">Commodities</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="blockchain"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Blockchain *</FormLabel>
                        <Select onValueChange={field.onChange} defaultValue={field.value}>
                          <FormControl>
                            <SelectTrigger className="bg-gray-800 border-gray-700">
                              <SelectValue placeholder="Select blockchain" />
                            </SelectTrigger>
                          </FormControl>
                          <SelectContent className="bg-gray-800 border-gray-700">
                            <SelectItem value="Ethereum">Ethereum</SelectItem>
                            <SelectItem value="Polygon">Polygon</SelectItem>
                            <SelectItem value="Solana">Solana</SelectItem>
                          </SelectContent>
                        </Select>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <FormField
                    control={form.control}
                    name="roi"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Expected ROI (%) *</FormLabel>
                        <FormControl>
                          <Input type="number" step="0.1" {...field} className="bg-gray-800 border-gray-700" />
                        </FormControl>
                        <FormDescription>Annual expected return on investment</FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={form.control}
                    name="url"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project URL *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="bg-gray-800 border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                </div>

                <FormField
                  control={form.control}
                  name="description"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Project Description *</FormLabel>
                      <FormControl>
                        <Textarea
                          placeholder="Provide a detailed description of your project..."
                          className="resize-none min-h-[150px] bg-gray-800 border-gray-700"
                          {...field}
                        />
                      </FormControl>
                      <FormDescription>
                        Include key information about the asset, its tokenization structure, and investment benefits.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Separator className="bg-gray-800" />

                <FormField
                  control={form.control}
                  name="contactEmail"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Contact Email *</FormLabel>
                      <FormControl>
                        <Input
                          type="email"
                          placeholder="your@email.com"
                          {...field}
                          className="bg-gray-800 border-gray-700"
                        />
                      </FormControl>
                      <FormDescription>
                        We'll contact you at this email address regarding your submission.
                      </FormDescription>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                <Button type="submit" disabled={isSubmitting} className="w-full">
                  {isSubmitting ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                      Submitting...
                    </>
                  ) : (
                    "Submit for Review"
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

