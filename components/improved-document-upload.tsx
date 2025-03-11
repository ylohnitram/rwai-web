import { useState, useRef, useEffect } from "react"
import { UploadCloud, File, Loader2, CheckCircle, AlertCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Progress } from "@/components/ui/progress"

interface ImprovedDocumentUploadProps {
  onFileUploaded: (filePath: string, fileUrl: string) => void
  onError?: (error: Error) => void
  accept?: string
  maxSizeMB?: number
  label?: string
  description?: string
  bucketName?: string
  filePath?: string
  initialFilePath?: string
  disabled?: boolean
}

export default function ImprovedDocumentUpload({
  onFileUploaded,
  onError,
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
  label = "Upload Document",
  description = "Upload your document (PDF, DOC, or DOCX)",
  bucketName = "audit-documents",
  filePath = "",
  initialFilePath = "",
  disabled = false
}: ImprovedDocumentUploadProps) {
  const [file, setFile] = useState<File | null>(null)
  const [uploadProgress, setUploadProgress] = useState(0)
  const [isUploading, setIsUploading] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [isSuccess, setIsSuccess] = useState(false)
  const [hasExistingFile, setHasExistingFile] = useState(false)
  const fileInputRef = useRef<HTMLInputElement>(null)

  const maxSizeBytes = maxSizeMB * 1024 * 1024 // Convert MB to bytes

  // Check for initial file on component mount
  useEffect(() => {
    if (initialFilePath && initialFilePath.length > 0) {
      setHasExistingFile(true)
    }
  }, [initialFilePath])

  // Upload file automatically when selected
  useEffect(() => {
    if (file && !isUploading && !isSuccess) {
      handleUpload()
    }
  }, [file])

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = e.target.files?.[0]
    if (!selectedFile) return

    // Reset states
    setError(null)
    setIsSuccess(false)
    
    // Validate file size
    if (selectedFile.size > maxSizeBytes) {
      setError(`File size exceeds the maximum allowed size (${maxSizeMB}MB)`)
      return
    }

    // Validate file type
    const fileType = selectedFile.type
    const acceptedTypes = accept.split(',').map(type => {
      // Convert file extensions to MIME types
      if (type.startsWith('.')) {
        if (type === '.pdf') return 'application/pdf'
        if (type === '.doc') return 'application/msword'
        if (type === '.docx') return 'application/vnd.openxmlformats-officedocument.wordprocessingml.document'
        return type
      }
      return type
    })

    const isValidType = acceptedTypes.some(type => 
      fileType.match(new RegExp(type.replace('*', '.*')))
    )

    if (!isValidType) {
      setError(`Invalid file type. Accepted types: ${accept}`)
      return
    }

    setFile(selectedFile)
    setHasExistingFile(false) // Clear existing file status when a new file is selected
  }

  const handleUpload = async () => {
    if (!file) {
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Create a unique file path
      const uniqueFilePath = filePath || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      
      // Create form data for the API request
      const formData = new FormData()
      formData.append('file', file)
      formData.append('bucket', bucketName)
      formData.append('path', uniqueFilePath)
      
      // Simulate upload progress
      const progressInterval = setInterval(() => {
        setUploadProgress(prev => {
          if (prev >= 90) {
            clearInterval(progressInterval)
            return prev
          }
          return prev + 10
        })
      }, 300)

      // Upload the file via our API route
      const response = await fetch('/api/upload', {
        method: 'POST',
        body: formData,
      })
      
      clearInterval(progressInterval)
      
      if (!response.ok) {
        const errorData = await response.json()
        throw new Error(errorData.error || 'Upload failed')
      }
      
      const result = await response.json()
      
      // Set final progress
      setUploadProgress(100)
      
      // Call onFileUploaded callback
      onFileUploaded(result.filePath, result.publicUrl)
      
      setIsSuccess(true)
      setHasExistingFile(false) // No longer using existing file
      setTimeout(() => {
        setUploadProgress(0)
      }, 1000)
    } catch (err) {
      console.error("Error uploading file:", err)
      setError(`Upload failed: ${err instanceof Error ? err.message : "Unknown error"}`)
      
      if (onError && err instanceof Error) {
        onError(err)
      }
    } finally {
      setIsUploading(false)
    }
  }

  const resetUpload = () => {
    setFile(null)
    setUploadProgress(0)
    setError(null)
    setIsSuccess(false)
    setHasExistingFile(false)
    if (fileInputRef.current) {
      fileInputRef.current.value = ""
    }
  }

  if (disabled) {
    return (
      <div className="w-full opacity-50 cursor-not-allowed">
        <div className="mb-2">
          <p className="text-sm font-medium">{label}</p>
          <p className="text-xs text-gray-400">{description}</p>
        </div>
        <div className="border rounded-md p-4 bg-gray-800 border-gray-700">
          <p className="text-sm text-gray-400">Upload disabled while URL is provided</p>
        </div>
      </div>
    )
  }

  return (
    <div className="w-full">
      <div className="mb-2">
        <p className="text-sm font-medium">{label}</p>
        <p className="text-xs text-gray-400">{description}</p>
      </div>

      {!file && !hasExistingFile && !isSuccess ? (
        <div 
          className={`border-2 border-dashed rounded-md p-6 flex flex-col items-center justify-center cursor-pointer ${
            error ? "border-red-500 bg-red-500/10" : "border-gray-700 hover:border-amber-500/50 hover:bg-gray-800"
          }`}
          onClick={() => fileInputRef.current?.click()}
        >
          <input
            type="file"
            className="hidden"
            ref={fileInputRef}
            onChange={handleFileChange}
            accept={accept}
          />
          
          <UploadCloud className="h-10 w-10 mb-2 text-gray-400" />
          <p className="text-sm font-medium mb-1">Click to upload or drag and drop</p>
          <p className="text-xs text-gray-400">
            {accept.split(',').join(', ')} (Max size: {maxSizeMB}MB)
          </p>
        </div>
      ) : (
        <div className="border rounded-md p-4 bg-gray-800 border-gray-700">
          <div className="flex items-start justify-between mb-2">
            <div className="flex items-center">
              <File className="h-8 w-8 mr-2 text-blue-400" />
              <div>
                {file && (
                  <>
                    <p className="text-sm font-medium">{file.name}</p>
                    <p className="text-xs text-gray-400">{(file.size / 1024 / 1024).toFixed(2)} MB</p>
                  </>
                )}
                {hasExistingFile && !file && (
                  <>
                    <p className="text-sm font-medium">Existing document</p>
                    <p className="text-xs text-gray-400">{initialFilePath.split('/').pop()}</p>
                  </>
                )}
                {isSuccess && !file && !hasExistingFile && (
                  <p className="text-sm font-medium">Document uploaded successfully</p>
                )}
              </div>
            </div>
            
            <Button 
              variant="ghost" 
              size="sm" 
              className="h-8 w-8 p-0"
              onClick={resetUpload}
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Remove</span>
            </Button>
          </div>
          
          {uploadProgress > 0 && (
            <div className="w-full mt-2">
              <Progress value={uploadProgress} className="h-2" />
            </div>
          )}
          
          {isUploading && (
            <div className="flex items-center text-gray-300 text-sm mt-2">
              <Loader2 className="animate-spin h-4 w-4 mr-2" />
              Uploading...
            </div>
          )}
          
          {isSuccess && (
            <div className="flex items-center text-green-500 text-sm mt-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              Document uploaded successfully
            </div>
          )}
        </div>
      )}

      {error && (
        <div className="flex items-center text-red-500 text-sm mt-2">
          <AlertCircle className="h-4 w-4 mr-1" />
          {error}
        </div>
      )}
    </div>
  )
}
