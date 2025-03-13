"use client"

import { useRouter, usePathname, useSearchParams } from "next/navigation"
import { useState, useEffect } from "react"
import { Filter } from "lucide-react"

import { Select, SelectContent, SelectGroup, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Slider } from "@/components/ui/slider"
import AssetTypeSelector from "@/components/asset-type-selector"

export default function DirectoryFilters() {
  const router = useRouter()
  const pathname = usePathname()
  const searchParams = useSearchParams()

  const [assetType, setAssetType] = useState<string>(searchParams?.get("assetType") || "all-types")
  const [blockchain, setBlockchain] = useState<string>(searchParams?.get("blockchain") || "all-blockchains")
  const [roiRange, setRoiRange] = useState<number[]>([
    Number.parseFloat(searchParams?.get("minRoi") || "0"),
    Number.parseFloat(searchParams?.get("maxRoi") || "30"),
  ])

  // Initialize filters from URL on component mount
  useEffect(() => {
    if (searchParams) {
      setAssetType(searchParams.get("assetType") || "all-types")
      setBlockchain(searchParams.get("blockchain") || "all-blockchains")
      setRoiRange([
        Number.parseFloat(searchParams.get("minRoi") || "0"),
        Number.parseFloat(searchParams.get("maxRoi") || "30"),
      ])
    }
  }, [searchParams])

  // Apply filters with debounce for ROI slider
  const applyFilters = () => {
    const params = new URLSearchParams(searchParams?.toString() || "")

    // Reset to page 1 when filters change
    params.set("page", "1")

    // Set filter params
    if (assetType && assetType !== "all-types") {
      params.set("assetType", assetType)
    } else {
      params.delete("assetType")
    }

    if (blockchain && blockchain !== "all-blockchains") {
      params.set("blockchain", blockchain)
    } else {
      params.delete("blockchain")
    }

    params.set("minRoi", roiRange[0].toString())
    params.set("maxRoi", roiRange[1].toString())

    router.push(`${pathname}?${params.toString()}`)
  }

  // Handle ROI range change with debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      applyFilters()
    }, 300) // Debounce for 300ms

    return () => clearTimeout(timer)
  }, [roiRange])

  // Handle other filter changes immediately
  useEffect(() => {
    if (searchParams) {
      // Only apply if assetType or blockchain changes, not on initial load
      const currentAssetType = searchParams.get("assetType") || "all-types"
      const currentBlockchain = searchParams.get("blockchain") || "all-blockchains"
      
      if (currentAssetType !== assetType || currentBlockchain !== blockchain) {
        applyFilters()
      }
    }
  }, [assetType, blockchain])

  return (
    <Card className="mb-8 bg-gray-900 border-gray-800">
      <CardHeader>
        <CardTitle className="text-xl flex items-center">
          <Filter className="h-5 w-5 mr-2" />
          Filters
        </CardTitle>
        <CardDescription>Refine your search by applying filters</CardDescription>
      </CardHeader>
      <CardContent>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
          <div className="space-y-2">
            <label className="text-sm font-medium">Asset Type</label>
            <AssetTypeSelector 
              value={assetType} 
              onValueChange={setAssetType}
              includeAllOption={true}
              allOptionLabel="All Types"
              allOptionValue="all-types"
            />
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">Blockchain</label>
            <Select value={blockchain} onValueChange={setBlockchain}>
              <SelectTrigger className="bg-gray-800 border-gray-700">
                <SelectValue placeholder="All Blockchains" />
              </SelectTrigger>
              <SelectContent className="bg-gray-800 border-gray-700">
                <SelectGroup>
                  <SelectItem value="all-blockchains">All Blockchains</SelectItem>
                  <SelectItem value="Ethereum">Ethereum</SelectItem>
                  <SelectItem value="Polygon">Polygon</SelectItem>
                  <SelectItem value="Solana">Solana</SelectItem>
                </SelectGroup>
              </SelectContent>
            </Select>
          </div>
          <div className="space-y-2">
            <label className="text-sm font-medium">
              ROI Range: {roiRange[0]}% - {roiRange[1]}%
            </label>
            <Slider value={roiRange} min={0} max={30} step={0.5} onValueChange={setRoiRange} className="py-4" />
          </div>
        </div>
      </CardContent>
    </Card>
  )
}
