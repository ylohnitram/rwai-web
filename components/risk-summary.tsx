import { Shield, AlertTriangle, CheckCircle, XCircle } from "lucide-react"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"

interface RiskSummaryProps {
  projectId: string
  riskLevel?: "low" | "medium" | "high" | "unknown"
  scamReports?: number
  sanctionDetected?: boolean
  auditVerified?: boolean
}

export default function RiskSummary({
  projectId,
  riskLevel = "unknown",
  scamReports = 0,
  sanctionDetected = false,
  auditVerified = false,
}: RiskSummaryProps) {
  // Risk level colors and badges
  const riskColors = {
    low: "bg-green-600 text-white",
    medium: "bg-yellow-600 text-white",
    high: "bg-red-600 text-white",
    unknown: "bg-gray-600 text-white",
  }

  return (
    <Card className="bg-gray-900 border-gray-800 mb-6">
      <CardHeader>
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            <Shield className="h-5 w-5 mr-2 text-amber-500" />
            Automated Risk Assessment
          </CardTitle>
          <Badge className={riskColors[riskLevel]}>
            {riskLevel === "low" && "Low Risk"}
            {riskLevel === "medium" && "Medium Risk"}
            {riskLevel === "high" && "High Risk"}
            {riskLevel === "unknown" && "Risk Unknown"}
          </Badge>
        </div>
        <CardDescription>
          This assessment is based on automated checks and is not a guarantee of safety
        </CardDescription>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${scamReports > 0 ? "bg-red-900/30" : "bg-green-900/30"}`}>
                {scamReports > 0 ? (
                  <AlertTriangle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Scam Database</p>
                <p className="text-sm text-gray-400">
                  {scamReports > 0 ? `${scamReports} reports found` : "No matches found"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${sanctionDetected ? "bg-red-900/30" : "bg-green-900/30"}`}>
                {sanctionDetected ? (
                  <XCircle className="h-5 w-5 text-red-500" />
                ) : (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Sanctions Check</p>
                <p className="text-sm text-gray-400">
                  {sanctionDetected ? "Sanctioned addresses detected" : "No sanctions detected"}
                </p>
              </div>
            </div>
            
            <div className="flex items-start">
              <div className={`p-2 rounded-full mr-3 ${auditVerified ? "bg-green-900/30" : "bg-yellow-900/30"}`}>
                {auditVerified ? (
                  <CheckCircle className="h-5 w-5 text-green-500" />
                ) : (
                  <AlertTriangle className="h-5 w-5 text-yellow-500" />
                )}
              </div>
              <div>
                <p className="font-medium">Smart Contract Audit</p>
                <p className="text-sm text-gray-400">
                  {auditVerified ? "Verified" : "Unverified"}
                </p>
              </div>
            </div>
          </div>
          
          <div className="border-t border-gray-800 pt-4 mt-2">
            <p className="text-amber-400 flex items-center">
              <AlertTriangle className="h-4 w-4 mr-1" />
              Warning
            </p>
            <p className="text-sm text-gray-300 mt-1">
              This token has not been legally validated. It may be regulated as a security (SEC) or 
              ART (MiCA). Interact with caution.
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
