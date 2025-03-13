"use client"

import { useEffect, useState } from "react"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { AssetType } from "@/lib/services/asset-type-service"

interface AssetTypeSelectorProps {
  value: string
  onValueChange: (value: string) => void
  disabled?: boolean
  placeholder?: string
  includeAllOption?: boolean
  allOptionLabel?: string
  allOptionValue?: string
  className?: string
}

export default function AssetTypeSelector({ 
  value, 
  onValueChange, 
  disabled = false,
  placeholder = "Select asset type",
  includeAllOption = false,
  allOptionLabel = "All Types",
  allOptionValue = "all-types",
  className = "bg-gray-800 border-gray-700"
}: AssetTypeSelectorProps) {
  const [assetTypes, setAssetTypes] = useState<AssetType[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function loadAssetTypes() {
      try {
        setLoading(true)
        const response = await fetch('/api/asset-types')
        
        if (!response.ok) {
          throw new Error(`Failed to load asset types: ${response.status}`)
        }
        
        const data = await response.json()
        
        if (data.success) {
          setAssetTypes(data.data)
        } else {
          throw new Error(data.error || 'Failed to load asset types')
        }
      } catch (err) {
        console.error("Error loading asset types:", err)
        setError(err instanceof Error ? err.message : 'Failed to load asset types')
      } finally {
        setLoading(false)
      }
    }
    
    loadAssetTypes()
  }, [])
  
  return (
    <Select 
      value={value} 
      onValueChange={onValueChange} 
      disabled={disabled || loading}
    >
      <SelectTrigger className={className}>
        <SelectValue placeholder={loading ? "Loading asset types..." : placeholder} />
      </SelectTrigger>
      <SelectContent className={className}>
        {error ? (
          <SelectItem value="error" disabled>Error loading asset types</SelectItem>
        ) : (
          <>
            {includeAllOption && (
              <SelectItem value={allOptionValue}>{allOptionLabel}</SelectItem>
            )}
            {assetTypes.map((type) => (
              <SelectItem key={type.id} value={type.name}>
                {type.name}
              </SelectItem>
            ))}
          </>
        )}
      </SelectContent>
    </Select>
  )
}
