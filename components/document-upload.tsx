// components/document-upload.tsx

import { useState, useRef, useEffect } from "react"
import { UploadCloud, File, AlertCircle, CheckCircle, X } from "lucide-react"
import { Button } from "@/components/ui/button"
import { uploadFile } from "@/lib/services/storage-service"
import { Progress } from "@/components/ui/progress"

interface DocumentUploadProps {
  onFileUploaded: (filePath: string, fileUrl: string) => void
  onError?: (error: Error) => void
  accept?: string
  maxSizeMB?: number
  label?: string
  description?: string
  bucketName?: string
  filePath?: string
  initialFilePath?: string
}

export default function DocumentUpload({
  onFileUploaded,
  onError,
  accept = ".pdf,.doc,.docx",
  maxSizeMB = 10,
  label = "Upload Audit Document",
  description = "Upload your project's audit report (PDF, DOC, or DOCX)",
  bucketName = "audit-documents",
  filePath = "",
  initialFilePath = "",
}: DocumentUploadProps) {
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
      setError("Please select a file to upload")
      return
    }

    setIsUploading(true)
    setUploadProgress(0)
    setError(null)

    try {
      // Create a unique file path
      const uniqueFilePath = filePath || `${Date.now()}_${file.name.replace(/\s+/g, '_')}`
      
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

      // Upload the file
      const fileUrl = await uploadFile(bucketName, uniqueFilePath, file)
      
      // Clear interval and set final progress
      clearInterval(progressInterval)
      setUploadProgress(100)
      
      // Call onFileUploaded callback
      onFileUploaded(uniqueFilePath, fileUrl)
      
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
          
          {isSuccess ? (
            <div className="flex items-center text-green-500 text-sm mt-2">
              <CheckCircle className="h-4 w-4 mr-1" />
              Document uploaded successfully
            </div>
          ) : hasExistingFile ? (
            <div className="flex items-center text-gray-300 text-sm mt-2">
              Using existing document - select a new file above to replace it
            </div>
          ) : file && !isUploading ? (
            <Button
              onClick={handleUpload}
              className="mt-2 w-full"
            >
              Upload Document
            </Button>
          ) : null}
          
          {isUploading && (
            <div className="flex items-center text-gray-300 text-sm mt-2">
              <svg className="animate-spin -ml-1 mr-2 h-4 w-4 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
              </svg>
              Uploading...
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
