import { Shield, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import Link from "next/link";

interface ProjectSecuritySummaryProps {
  scamReports?: number;
  sanctionDetected?: boolean;
  auditVerified?: boolean;
  riskLevel?: "low" | "medium" | "high";
}

export default function ProjectSecuritySummary({
  scamReports = 0,
  sanctionDetected = false,
  auditVerified = false,
  riskLevel = "medium"
}: ProjectSecuritySummaryProps) {
  // Determine if all checks passed
  const allChecksPassed = scamReports === 0 && !sanctionDetected;
  
  return (
    <div className="space-y-4 mb-6">
      {/* Technical Security Checks */}
      <Alert className={`${allChecksPassed ? "bg-green-900/30 border-green-800" : "bg-amber-900/30 border-amber-800"}`}>
        <Shield className="h-4 w-4 text-amber-500 mr-2" />
        <AlertTitle className="flex items-center">
          Security Check
          <Badge className={`ml-2 ${
            riskLevel === "low" ? "bg-green-600" : 
            riskLevel === "medium" ? "bg-amber-600" : "bg-red-600"
          }`}>
            {riskLevel.toUpperCase()} RISK
          </Badge>
        </AlertTitle>
        <AlertDescription>
          <ul className="list-disc pl-5 space-y-1 mt-2">
            <li className="flex items-center">
              {scamReports === 0 ? 
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
              }
              Scam database: {scamReports} reports
            </li>
            <li className="flex items-center">
              {!sanctionDetected ? 
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                <XCircle className="h-3 w-3 text-red-500 mr-1" />
              }
              Sanctions check: {sanctionDetected ? "Detected" : "Not Detected"}
            </li>
            <li className="flex items-center">
              {auditVerified ? 
                <CheckCircle className="h-3 w-3 text-green-500 mr-1" /> : 
                <AlertTriangle className="h-3 w-3 text-amber-500 mr-1" />
              }
              Smart contract audit: {auditVerified ? "Verified" : "Unverified"}
            </li>
          </ul>
        </AlertDescription>
      </Alert>
      
      {/* Legal Disclaimer - Red Warning */}
      <Alert className="bg-red-900/30 border-red-800">
        <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
        <AlertDescription className="text-red-200">
          <p>This token has not been legally validated. It may be regulated as a security (SEC) or ART (MiCA). Always conduct your own due diligence.</p>
          <p className="mt-2 text-sm">
            This platform serves purely informational purposes. We perform automated scam checks but do not verify legal status or investment potential.
            <Link href="/legal" className="text-red-400 hover:underline ml-1">
              Read Full Disclaimer
            </Link>
          </p>
        </AlertDescription>
      </Alert>
    </div>
  );
}
