// app/edit/page.tsx

"use client"

import { useState, useEffect, Suspense } from "react"
import { useSearchParams } from "next/navigation"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Info, Loader2, CheckCircle, Search } from "lucide-react"
import Breadcrumbs from "@/components/breadcrumbs"

import { Button } from "@/components/ui/button"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Input } from "@/components/ui/input"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Textarea } from "@/components/ui/textarea"
import { Separator } from "@/components/ui/separator"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import DocumentUpload from "@/components/document-upload"
import { getSupabaseClient } from "@/lib/supabase"
import AssetTypeSelector from "@/components/asset-type-selector"

const searchFormSchema = z.object({
  contactEmail: z.string().email({
    message: "Please enter a valid email address.",
  }),
})

const editFormSchema = z.object({
  name: z.string().min(2, {
    message: "Project name must be at least 2 characters.",
  }),
  type: z.string({
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
  website: z.string().url({
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
  tvl: z.string().min(1, {
    message: "TVL is required.",
  }),
  // Make auditDocumentPath optional and allow null values
  auditDocumentPath: z.string().optional().nullable(),
  // Make whitepaperDocumentPath optional and allow null values
  whitepaperDocumentPath: z.string().optional().nullable(),
  // Smart contract audit URL
  auditUrl: z.string().url({
    message: "Please enter a valid URL for the smart contract audit."
  }).optional().or(z.literal("")),
  // Whitepaper URL
  whitepaperUrl: z.string().url({
    message: "Please enter a valid URL for the whitepaper."
  }).optional().or(z.literal("")),
})

type SearchFormValues = z.infer<typeof searchFormSchema>
type EditFormValues = z.infer<typeof editFormSchema>

// Component that uses searchParams
function EditProjectContent() {
  const searchParams = useSearchParams()
  const projectId = searchParams.get("id")
  const email = searchParams.get("email")
  
  const [isSearching, setIsSearching] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isSubmitted, setIsSubmitted] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [auditDocumentUrl, setAuditDocumentUrl] = useState<string | null>(null)
  const [whitepaperDocumentUrl, setWhitepaperDocumentUrl] = useState<string | null>(null)
  const [project, setProject] = useState<any | null>(null)
  const [feedbackMessage, setFeedbackMessage] = useState<string | null>(null)
  
  // Search form
  const searchForm = useForm<SearchFormValues>({
    resolver: zodResolver(searchFormSchema),
    defaultValues: {
      contactEmail: email || "",
    },
  })
  
  // Edit form
  const editForm = useForm<EditFormValues>({
    resolver: zodResolver(editFormSchema),
    // Default values will be set when project is loaded
    defaultValues: {
      name: "",
      description: "",
      type: "",
      blockchain: "",
      roi: 0,
      website: "",
      contactEmail: "",
      tvl: "",
      auditDocumentPath: null,
      whitepaperDocumentPath: null,
      auditUrl: "",
      whitepaperUrl: "",
    }
  })
  
  const handleAuditFileUploaded = (filePath: string, fileUrl: string) => {
    if (filePath && fileUrl) {
      editForm.setValue("auditDocumentPath", filePath);
      setAuditDocumentUrl(fileUrl);
      // Clear the URL field when a file is uploaded
      editForm.setValue("auditUrl", "");
    }
  }
  
  const handleWhitepaperFileUploaded = (filePath: string, fileUrl: string) => {
    if (filePath && fileUrl) {
      editForm.setValue("whitepaperDocumentPath", filePath);
      setWhitepaperDocumentUrl(fileUrl);
      // Clear the URL field when a file is uploaded
      editForm.setValue("whitepaperUrl", "");
    }
  }
  
  // Function to find project from email
  async function onSearch(values: SearchFormValues) {
    setIsSearching(true)
    setError(null)
    
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("contact_email", values.contactEmail)
        .eq("status", "changes_requested")
        .single()
        
      if (error) {
        if (error.code === "PGRST116") {
          throw new Error("No project found requiring changes for this email address")
        }
        throw new Error(error.message)
      }
      
      if (!data) {
        throw new Error("No project found requiring changes for this email address")
      }
      
      // Set the project and feedback message
      setProject(data)
      
      if (data.review_notes) {
        setFeedbackMessage(data.review_notes)
      }
      
      // Populate the edit form
      editForm.reset({
        name: data.name,
        type: data.type,
        blockchain: data.blockchain,
        roi: data.roi,
        website: data.website,
        description: data.description,
        contactEmail: data.contact_email,
        tvl: data.tvl,
        auditDocumentPath: data.audit_document_path || null,
        whitepaperDocumentPath: data.whitepaper_document_path || null,
        auditUrl: data.audit_url || "",
        whitepaperUrl: data.whitepaper_url || "",
      })
      
      // Set audit document URL if available
      if (data.audit_document_path) {
        const { data: urlData } = supabase.storage
          .from("audit-documents")
          .getPublicUrl(data.audit_document_path)
          
        setAuditDocumentUrl(urlData.publicUrl)
      }
      
      // Set whitepaper document URL if available
      if (data.whitepaper_document_path) {
        const { data: urlData } = supabase.storage
          .from("whitepaper-documents")
          .getPublicUrl(data.whitepaper_document_path)
          
        setWhitepaperDocumentUrl(urlData.publicUrl)
      }
    } catch (err) {
      console.error("Error finding project:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setProject(null)
    } finally {
      setIsSearching(false)
    }
  }
  
  // Load project directly from ID if provided
  const loadProjectFromId = async (id: string) => {
    setIsSearching(true)
    setError(null)
    
    try {
      const supabase = getSupabaseClient()
      
      const { data, error } = await supabase
        .from("projects")
        .select("*")
        .eq("id", id)
        .single()
        
      if (error) {
        throw new Error(error.message)
      }
      
      if (!data) {
        throw new Error("Project not found")
      }
      
      // Set the project and feedback message
      setProject(data)
      
      if (data.review_notes) {
        setFeedbackMessage(data.review_notes)
      }
      
      // Populate the edit form
      editForm.reset({
        name: data.name,
        type: data.type,
        blockchain: data.blockchain,
        roi: data.roi,
        website: data.website,
        description: data.description,
        contactEmail: data.contact_email,
        tvl: data.tvl,
        auditDocumentPath: data.audit_document_path || null,
        whitepaperDocumentPath: data.whitepaper_document_path || null,
        auditUrl: data.audit_url || "",
        whitepaperUrl: data.whitepaper_url || "",
      })
      
      // Set audit document URL if available
      if (data.audit_document_path) {
        const { data: urlData } = supabase.storage
          .from("audit-documents")
          .getPublicUrl(data.audit_document_path)
          
        setAuditDocumentUrl(urlData.publicUrl)
      }
      
      // Set whitepaper document URL if available
      if (data.whitepaper_document_path) {
        const { data: urlData } = supabase.storage
          .from("whitepaper-documents")
          .getPublicUrl(data.whitepaper_document_path)
          
        setWhitepaperDocumentUrl(urlData.publicUrl)
      }
    } catch (err) {
      console.error("Error loading project:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
      setProject(null)
    } finally {
      setIsSearching(false)
    }
  }
  
  // Use useEffect instead of useState for initialization
  useEffect(() => {
    if (projectId) {
      loadProjectFromId(projectId)
    }
  }, [projectId])
  
  // Submit updated project
  async function onSubmit(values: EditFormValues) {
    if (!project) {
      setError("No project loaded to update")
      return
    }
    
    setIsSubmitting(true)
    setError(null)
    
    try {
      // Prepare update data
      const updatedData: Record<string, any> = {
        name: values.name,
        type: values.type,
        blockchain: values.blockchain,
        roi: values.roi,
        description: values.description,
        website: values.website,
        tvl: values.tvl,
        contact_email: values.contactEmail,
      }

      // Only include audit_document_path if it exists and has changed
      if (values.auditDocumentPath && values.auditDocumentPath !== project.audit_document_path) {
        updatedData.audit_document_path = values.auditDocumentPath
      }
      
      // Only include whitepaper_document_path if it exists and has changed
      if (values.whitepaperDocumentPath && values.whitepaperDocumentPath !== project.whitepaper_document_path) {
        updatedData.whitepaper_document_path = values.whitepaperDocumentPath
      }
      
      // Include audit URL if specified
      if (values.auditUrl) {
        updatedData.audit_url = values.auditUrl
        // Clear document path if URL is provided instead
        if (project.audit_document_path) {
          updatedData.audit_document_path = null
        }
      } else if (values.auditUrl === "" && project.audit_url) {
        updatedData.audit_url = null
      }
      
      // Include whitepaper URL if specified
      if (values.whitepaperUrl) {
        updatedData.whitepaper_url = values.whitepaperUrl
        // Clear document path if URL is provided instead
        if (project.whitepaper_document_path) {
          updatedData.whitepaper_document_path = null
        }
      } else if (values.whitepaperUrl === "" && project.whitepaper_url) {
        updatedData.whitepaper_url = null
      }
      
      // Submit to API endpoint
      const response = await fetch('/api/projects/update', {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          projectId: project.id,
          contactEmail: project.contact_email,
          updatedData,
        }),
      })
      
      const result = await response.json()
      
      if (!response.ok) {
        // Special handling for conflict (duplicate name)
        if (response.status === 409) {
          // Check if this is a duplicate detection error
          if (result.duplicateDetected) {
            throw new Error(result.error || 'A project with this name and blockchain already exists. Please choose a different name or blockchain.');
          } else {
            throw new Error(result.error || 'A project with this name already exists. Please choose a different name.');
          }
        }
        throw new Error(result.error || 'Failed to update project')
      }
      
      setIsSubmitted(true)
    } catch (err) {
      console.error("Error updating project:", err)
      setError(err instanceof Error ? err.message : "An unexpected error occurred")
    } finally {
      setIsSubmitting(false)
    }
  }

  // Show success message after submission
  if (isSubmitted) {
    return (
      <div className="container py-12 px-4 md:px-6">
        <Card className="max-w-2xl mx-auto bg-gray-900 border-gray-800">
          <CardHeader>
            <div className="flex items-center gap-2">
              <div className="flex h-10 w-10 items-center justify-center rounded-full bg-green-500">
                <CheckCircle className="h-5 w-5 text-white" />
              </div>
              <CardTitle className="text-2xl">Project Updated Successfully</CardTitle>
            </div>
            <CardDescription>Thank you for updating your project in response to our feedback.</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <p className="text-gray-300">
              Our team will review your updated submission within the next 3-5 business days. You will receive a notification
              via email once the review is complete.
            </p>
            <p className="text-gray-300">
              If additional changes are needed, we will reach out to you using the contact email you provided.
            </p>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <Breadcrumbs />
      <div className="max-w-2xl mx-auto">
        <div className="mb-8">
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Update Your Project</h1>
          <p className="text-gray-400">Make changes to your project based on reviewer feedback</p>
        </div>
        
        {/* Show search form if no project loaded */}
        {!project && (
          <Card className="bg-gray-900 border-gray-800 mb-8">
            <CardHeader>
              <CardTitle>Find Your Project</CardTitle>
              <CardDescription>Enter the email address you used when submitting the project</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...searchForm}>
                <form onSubmit={searchForm.handleSubmit(onSearch)} className="space-y-6">
                  <FormField
                    control={searchForm.control}
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
                          Enter the email you used when submitting the project.
                        </FormDescription>
                        <FormMessage />
                      </FormItem>
                    )}
                  />
                  
                  <Button type="submit" disabled={isSearching} className="w-full">
                    {isSearching ? (
                      <>
                        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                        Searching...
                      </>
                    ) : (
                      <>
                        <Search className="mr-2 h-4 w-4" />
                        Find Project
                      </>
                    )}
                  </Button>
                </form>
              </Form>
              
              {error && (
                <Alert className="mt-6 bg-red-900/30 border-red-800">
                  <AlertTitle className="text-red-300">Error</AlertTitle>
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}

        {/* Show feedback if available */}
        {feedbackMessage && (
          <Alert className="mb-8 bg-amber-900/30 border-amber-800">
            <Info className="h-4 w-4 text-amber-500" />
            <AlertTitle>Reviewer Feedback</AlertTitle>
            <AlertDescription className="whitespace-pre-line">
              {feedbackMessage}
            </AlertDescription>
          </Alert>
        )}

        {/* Show edit form if project is loaded */}
        {project && (
          <Card className="bg-gray-900 border-gray-800">
            <CardHeader>
              <CardTitle>Update Project Information</CardTitle>
              <CardDescription>Fields marked with an asterisk (*) are required.</CardDescription>
            </CardHeader>
            <CardContent>
              <Form {...editForm}>
                <form onSubmit={editForm.handleSubmit(onSubmit)} className="space-y-6">
                  <FormField
                    control={editForm.control}
                    name="name"
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
                      control={editForm.control}
                      name="type"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Asset Type *</FormLabel>
                          <AssetTypeSelector
                            value={field.value}
                            onValueChange={field.onChange}
                            disabled={isSubmitting}
                            className="bg-gray-800 border-gray-700"
                          />
                          <FormDescription>Select the type of asset being tokenized</FormDescription>
                        <FormMessage />
                        </FormItem>
                      )}
                    />
                    <FormField
                      control={editForm.control}
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
                      control={editForm.control}
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
                      control={editForm.control}
                      name="tvl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Total Value Locked (TVL) *</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="$10M" 
                              {...field} 
                              className="bg-gray-800 border-gray-700" 
                            />
                          </FormControl>
                          <FormDescription>Current total value of assets</FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <FormField
                    control={editForm.control}
                    name="website"
                    render={({ field }) => (
                      <FormItem>
                        <FormLabel>Project Website *</FormLabel>
                        <FormControl>
                          <Input placeholder="https://..." {...field} className="bg-gray-800 border-gray-700" />
                        </FormControl>
                        <FormMessage />
                      </FormItem>
                    )}
                  />

                  <FormField
                    control={editForm.control}
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

                  {/* Audit Document Section */}
                  <div className="space-y-4 p-4 border border-gray-800 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Smart Contract Audit</h3>
                    
                    {/* Choose between upload or link */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-sm">Provide audit via:</div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="auditMethod" 
                          id="auditUpload" 
                          checked={!editForm.watch('auditUrl')}
                          onChange={() => editForm.setValue('auditUrl', '')}
                          className="cursor-pointer"
                        />
                        <label htmlFor="auditUpload" className="text-sm cursor-pointer">File Upload</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="auditMethod" 
                          id="auditUrl" 
                          checked={!!editForm.watch('auditUrl')}
                          onChange={() => editForm.setValue('auditDocumentPath', undefined)}
                          className="cursor-pointer"
                        />
                        <label htmlFor="auditUrl" className="text-sm cursor-pointer">External URL</label>
                      </div>
                    </div>
                    
                    {/* Audit Document Upload */}
                    <FormField
                      control={editForm.control}
                      name="auditDocumentPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audit Document (Optional)</FormLabel>
                          <FormControl>
                            <DocumentUpload
                              onFileUploaded={(filePath, fileUrl) => {
                                field.onChange(filePath); // Update the form field
                                setAuditDocumentUrl(fileUrl);
                                // Clear the URL field when a file is uploaded
                                editForm.setValue("auditUrl", "");
                              }}
                              label="Audit Report (Optional)"
                              description="You can upload a new audit document or keep your existing one"
                              bucketName="audit-documents"
                              filePath={`${Date.now()}_${editForm.getValues('name').replace(/\s+/g, '_')}_audit`}
                              initialFilePath={project?.audit_document_path || ""}
                              disabled={!!editForm.watch('auditUrl')}
                            />
                          </FormControl>
                          <FormDescription>
                            {project?.audit_document_path ? 
                            "You already have an audit document. Upload a new one only if you want to replace it." :
                            "Providing an audit document can speed up the review process but is not required."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="auditUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Audit URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://certik.com/projects/yourproject" 
                              {...field} 
                              className="bg-gray-800 border-gray-700"
                              disabled={!!editForm.watch('auditDocumentPath')}
                            />
                          </FormControl>
                          <FormDescription>
                            If you prefer not to upload a file, you can provide a link to your audit from firms like CertiK, PeckShield, or other recognized security auditors.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>
                  
                  {/* Whitepaper Document Section */}
                  <div className="space-y-4 p-4 border border-gray-800 rounded-lg">
                    <h3 className="font-medium text-lg mb-2">Project Whitepaper</h3>
                    
                    {/* Choose between upload or link */}
                    <div className="flex items-center space-x-4 mb-4">
                      <div className="text-sm">Provide whitepaper via:</div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="whitepaperMethod" 
                          id="whitepaperUpload" 
                          checked={!editForm.watch('whitepaperUrl')}
                          onChange={() => editForm.setValue('whitepaperUrl', '')}
                          className="cursor-pointer"
                        />
                        <label htmlFor="whitepaperUpload" className="text-sm cursor-pointer">File Upload</label>
                      </div>
                      <div className="flex items-center space-x-2">
                        <input 
                          type="radio" 
                          name="whitepaperMethod" 
                          id="whitepaperUrl" 
                          checked={!!editForm.watch('whitepaperUrl')}
                          onChange={() => editForm.setValue('whitepaperDocumentPath', undefined)}
                          className="cursor-pointer"
                        />
                        <label htmlFor="whitepaperUrl" className="text-sm cursor-pointer">External URL</label>
                      </div>
                    </div>
                    
                    {/* Whitepaper Document Upload */}
                    <FormField
                      control={editForm.control}
                      name="whitepaperDocumentPath"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Whitepaper Document (Optional)</FormLabel>
                          <FormControl>
                            <DocumentUpload
                              onFileUploaded={(filePath, fileUrl) => {
                                field.onChange(filePath); // Update the form field
                                setWhitepaperDocumentUrl(fileUrl);
                                // Clear the URL field when a file is uploaded
                                editForm.setValue("whitepaperUrl", "");
                              }}
                              label="Whitepaper (Optional)"
                              description="You can upload a new whitepaper document or keep your existing one"
                              bucketName="whitepaper-documents"
                              filePath={`${Date.now()}_${editForm.getValues('name').replace(/\s+/g, '_')}_whitepaper`}
                              initialFilePath={project?.whitepaper_document_path || ""}
                              disabled={!!editForm.watch('whitepaperUrl')}
                            />
                          </FormControl>
                          <FormDescription>
                            {project?.whitepaper_document_path ? 
                            "You already have a whitepaper document. Upload a new one only if you want to replace it." :
                            "Providing a whitepaper document can help reviewers better understand your project but is not required."}
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                    
                    <FormField
                      control={editForm.control}
                      name="whitepaperUrl"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Whitepaper URL</FormLabel>
                          <FormControl>
                            <Input 
                              placeholder="https://yourproject.com/whitepaper.pdf" 
                              {...field} 
                              className="bg-gray-800 border-gray-700"
                              disabled={!!editForm.watch('whitepaperDocumentPath')}
                            />
                          </FormControl>
                          <FormDescription>
                            If you prefer not to upload a file, you can provide a link to your whitepaper.
                          </FormDescription>
                          <FormMessage />
                        </FormItem>
                      )}
                    />
                  </div>

                  <Separator className="bg-gray-800" />

                  <FormField
                    control={editForm.control}
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
                          We'll contact you at this email address regarding your submission and review process.
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
                      "Update Project"
                    )}
                  </Button>
                </form>
              </Form>
              
              {error && (
                <Alert className="mt-6 bg-red-900/30 border-red-800">
                  <AlertTitle className="text-red-300">Error</AlertTitle>
                  <AlertDescription className="text-red-300">
                    {error}
                  </AlertDescription>
                </Alert>
              )}
            </CardContent>
          </Card>
        )}
      </div>
    </div>
  )
}

// Main component with Suspense boundary
export default function EditProjectPage() {
  return (
    <Suspense fallback={<div className="container py-8 px-4 md:px-6 text-center">Loading edit page...</div>}>
      <EditProjectContent />
    </Suspense>
  )
}
