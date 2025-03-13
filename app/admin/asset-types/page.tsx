"use client"

import { useState, useEffect } from "react"
import { zodResolver } from "@hookform/resolvers/zod"
import { useForm } from "react-hook-form"
import { z } from "zod"
import { Plus, Edit, Trash2, Check, X, AlertCircle, RefreshCw } from "lucide-react"
import { AssetType } from "@/lib/services/asset-type-service"

import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { Form, FormControl, FormDescription, FormField, FormItem, FormLabel, FormMessage } from "@/components/ui/form"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Badge } from "@/components/ui/badge"
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from "@/components/ui/dialog"
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert"
import { useToast } from "@/hooks/use-toast"

const formSchema = z.object({
  name: z.string().min(2, {
    message: "Asset type name must be at least 2 characters.",
  }),
  description: z.string().min(10, {
    message: "Description must be at least 10 characters.",
  }),
})

export default function AssetTypesPage() {
  const { toast } = useToast()
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isDialogOpen, setIsDialogOpen] = useState(false)
  const [isEditMode, setIsEditMode] = useState(false)
  const [selectedAssetType, setSelectedAssetType] = useState<AssetType | null>(null)
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [deleteId, setDeleteId] = useState<number | null>(null)
  const [projectCounts, setProjectCounts] = useState<Record<string, number>>({})

  const form = useForm<z.infer<typeof formSchema>>({
    resolver: zodResolver(formSchema),
    defaultValues: {
      name: "",
      description: "",
    },
  })

  // Load asset types
  const fetchAssetTypes = async () => {
    try {
      setIsLoading(true)
      setError(null)
      
      const response = await fetch('/api/asset-types')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch asset types: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setAssetTypes(data.data)
        
        // Fetch project counts for each asset type
        await fetchProjectCounts(data.data)
      } else {
        throw new Error(data.error || 'Failed to fetch asset types')
      }
    } catch (err) {
      console.error('Error fetching asset types:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch asset types')
    } finally {
      setIsLoading(false)
    }
  }

  // Fetch project counts for each asset type
  const fetchProjectCounts = async (types: AssetType[]) => {
    try {
      const response = await fetch('/api/admin/project-counts-by-type')
      
      if (!response.ok) {
        throw new Error(`Failed to fetch project counts: ${response.status}`)
      }
      
      const data = await response.json()
      
      if (data.success) {
        setProjectCounts(data.data)
      }
    } catch (err) {
      console.error('Error fetching project counts:', err)
      // Don't set an error, just log it - this is not critical
    }
  }

  // Load asset types on component mount
  useEffect(() => {
    fetchAssetTypes()
  }, [])

  // Open create dialog
  const handleCreate = () => {
    form.reset({
      name: "",
      description: "",
    })
    setIsEditMode(false)
    setSelectedAssetType(null)
    setIsDialogOpen(true)
  }

  // Open edit dialog
  const handleEdit = (assetType: AssetType) => {
    form.reset({
      name: assetType.name,
      description: assetType.description,
    })
    setIsEditMode(true)
    setSelectedAssetType(assetType)
    setIsDialogOpen(true)
  }

  // Handle form submission (create or edit)
  const onSubmit = async (values: z.infer<typeof formSchema>) => {
    try {
      setIsSubmitting(true)
      
      if (isEditMode && selectedAssetType) {
        // Update existing asset type
        const response = await fetch(`/api/asset-types/${selectedAssetType.id}`, {
          method: 'PUT',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to update asset type: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Update local state
        setAssetTypes(prev => 
          prev.map(at => at.id === selectedAssetType.id ? data.data : at)
        )
        
        toast({
          title: "Asset type updated",
          description: `Successfully updated "${values.name}"`,
        })
      } else {
        // Create new asset type
        const response = await fetch('/api/asset-types', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
          },
          body: JSON.stringify(values),
        })
        
        if (!response.ok) {
          const errorData = await response.json()
          throw new Error(errorData.message || `Failed to create asset type: ${response.status}`)
        }
        
        const data = await response.json()
        
        // Update local state
        setAssetTypes(prev => [...prev, data.data])
        
        toast({
          title: "Asset type created",
          description: `Successfully created "${values.name}"`,
        })
      }
      
      // Close dialog and reset form
      setIsDialogOpen(false)
      form.reset()
    } catch (err) {
      console.error('Error submitting asset type:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to save asset type',
        variant: "destructive",
      })
    } finally {
      setIsSubmitting(false)
    }
  }

  // Handle delete confirmation
  const handleDeleteConfirm = (id: number) => {
    setDeleteId(id)
  }

  // Handle actual deletion
  const handleDelete = async () => {
    if (!deleteId) return
    
    try {
      setIsDeleting(true)
      
      const response = await fetch(`/api/asset-types/${deleteId}`, {
        method: 'DELETE',
      })
      
      if (!response.ok) {
        const errorData = await response.json()
        
        // Special handling for foreign key constraint errors
        if (errorData.code === '23503') {
          throw new Error('Cannot delete this asset type because it is being used by existing projects')
        }
        
        throw new Error(errorData.message || `Failed to delete asset type: ${response.status}`)
      }
      
      // Update local state
      setAssetTypes(prev => prev.filter(at => at.id !== deleteId))
      
      toast({
        title: "Asset type deleted",
        description: "Successfully deleted asset type",
      })
    } catch (err) {
      console.error('Error deleting asset type:', err)
      toast({
        title: "Error",
        description: err instanceof Error ? err.message : 'Failed to delete asset type',
        variant: "destructive",
      })
    } finally {
      setIsDeleting(false)
      setDeleteId(null)
    }
  }

  return (
    <div className="container py-8 px-4 md:px-6">
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-3xl font-bold tracking-tighter mb-2">Asset Types</h1>
          <p className="text-gray-400">Manage asset type categories for tokenized projects</p>
        </div>
        <Button onClick={handleCreate}>
          <Plus className="h-4 w-4 mr-2" />
          Add Asset Type
        </Button>
      </div>

      {error && (
        <Alert className="mb-6" variant="destructive">
          <AlertCircle className="h-4 w-4" />
          <AlertTitle>Error</AlertTitle>
          <AlertDescription>{error}</AlertDescription>
        </Alert>
      )}

      <Card className="bg-gray-900 border-gray-800">
        <CardHeader>
          <CardTitle>Available Asset Types</CardTitle>
          <CardDescription>
            Asset types are used to categorize projects in the directory
          </CardDescription>
        </CardHeader>
        <CardContent>
          {isLoading ? (
            <div className="py-8 text-center">
              <RefreshCw className="h-8 w-8 mx-auto animate-spin text-gray-400 mb-2" />
              <p className="text-gray-400">Loading asset types...</p>
            </div>
          ) : assetTypes.length === 0 ? (
            <div className="py-8 text-center">
              <p className="text-gray-400">No asset types found</p>
              <Button className="mt-4" onClick={handleCreate}>
                <Plus className="h-4 w-4 mr-2" />
                Add First Asset Type
              </Button>
            </div>
          ) : (
            <div className="rounded-md border border-gray-800">
              <Table>
                <TableHeader className="bg-gray-900">
                  <TableRow className="hover:bg-gray-800 border-gray-800">
                    <TableHead className="font-medium">Name</TableHead>
                    <TableHead className="font-medium">Description</TableHead>
                    <TableHead className="font-medium">Projects</TableHead>
                    <TableHead className="font-medium text-right">Actions</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {assetTypes.map((assetType) => (
                    <TableRow key={assetType.id} className="hover:bg-gray-800 border-gray-800">
                      <TableCell className="font-medium">{assetType.name}</TableCell>
                      <TableCell className="max-w-md truncate">{assetType.description}</TableCell>
                      <TableCell>
                        <Badge variant="outline" className="bg-gray-800">
                          {projectCounts[assetType.name] || 0} projects
                        </Badge>
                      </TableCell>
                      <TableCell className="text-right">
                        <div className="flex justify-end gap-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => handleEdit(assetType)}
                          >
                            <Edit className="h-4 w-4 mr-1" />
                            Edit
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => handleDeleteConfirm(assetType.id)}
                            disabled={!!projectCounts[assetType.name]}
                          >
                            <Trash2 className="h-4 w-4 mr-1" />
                            Delete
                          </Button>
                        </div>
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Create/Edit Asset Type Dialog */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>{isEditMode ? "Edit Asset Type" : "Create Asset Type"}</DialogTitle>
            <DialogDescription>
              {isEditMode 
                ? "Update the details of an existing asset type" 
                : "Add a new asset type for categorizing projects"}
            </DialogDescription>
          </DialogHeader>
          
          <Form {...form}>
            <form onSubmit={form.handleSubmit(onSubmit)} className="space-y-6">
              <FormField
                control={form.control}
                name="name"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Name *</FormLabel>
                    <FormControl>
                      <Input
                        placeholder="e.g., Real Estate"
                        {...field}
                        className="bg-gray-800 border-gray-700"
                      />
                    </FormControl>
                    <FormDescription>
                      A concise name for this asset type
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <FormField
                control={form.control}
                name="description"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Description *</FormLabel>
                    <FormControl>
                      <Textarea
                        placeholder="e.g., Tokenized real estate assets including commercial and residential properties"
                        {...field}
                        className="resize-none bg-gray-800 border-gray-700"
                      />
                    </FormControl>
                    <FormDescription>
                      A brief description of what this asset type represents
                    </FormDescription>
                    <FormMessage />
                  </FormItem>
                )}
              />
              
              <DialogFooter>
                <Button 
                  type="button" 
                  variant="outline" 
                  onClick={() => setIsDialogOpen(false)} 
                  disabled={isSubmitting}
                >
                  Cancel
                </Button>
                <Button 
                  type="submit" 
                  disabled={isSubmitting}
                >
                  {isSubmitting ? (
                    <>
                      <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                      {isEditMode ? "Updating..." : "Creating..."}
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      {isEditMode ? "Update" : "Create"}
                    </>
                  )}
                </Button>
              </DialogFooter>
            </form>
          </Form>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <Dialog open={deleteId !== null} onOpenChange={(open) => !open && setDeleteId(null)}>
        <DialogContent className="bg-gray-900 border-gray-800">
          <DialogHeader>
            <DialogTitle>Confirm Deletion</DialogTitle>
            <DialogDescription>
              Are you sure you want to delete this asset type? This action cannot be undone.
            </DialogDescription>
          </DialogHeader>
          
          <DialogFooter>
            <Button 
              variant="outline" 
              onClick={() => setDeleteId(null)} 
              disabled={isDeleting}
            >
              Cancel
            </Button>
            <Button 
              variant="destructive" 
              onClick={handleDelete} 
              disabled={isDeleting}
            >
              {isDeleting ? (
                <>
                  <RefreshCw className="h-4 w-4 mr-2 animate-spin" />
                  Deleting...
                </>
              ) : (
                <>
                  <Trash2 className="h-4 w-4 mr-2" />
                  Delete
                </>
              )}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}
