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
  
  // Get risk level styles
  const getRiskStyles = () => {
    switch(riskLevel) {
      case "low": return {
        bg: "bg-green-900/20",
        border: "border-green-800/70",
        icon: <Shield className="h-5 w-5 text-green-500 mr-2" />,
        badgeBg: "bg-green-600"
      };
      case "high": return {
        bg: "bg-red-900/20",
        border: "border-red-800/70",
        icon: <Shield className="h-5 w-5 text-red-500 mr-2" />,
        badgeBg: "bg-red-600"
      };
      default: return {
        bg: "bg-amber-900/20",
        border: "border-amber-800/70",
        icon: <Shield className="h-5 w-5 text-amber-500 mr-2" />,
        badgeBg: "bg-amber-600"
      };
    }
  };
  
  const styles = getRiskStyles();
  
  return (
    <div className="space-y-4 mb-6">
      {/* Technical Security Checks with enhanced visual design */}
      <Alert className={`${styles.bg} ${styles.border} shadow-sm`}>
        <div className="flex items-start">
          {styles.icon}
          <div className="flex-1">
            <AlertTitle className="flex items-center mb-2">
              Project Security Assessment
              <Badge className={`ml-2 ${styles.badgeBg}`}>
                {riskLevel.toUpperCase()} RISK
              </Badge>
            </AlertTitle>
            <AlertDescription>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                <div className="flex items-center space-x-2 bg-black/20 p-2 rounded">
                  {scamReports === 0 ? 
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  }
                  <span>
                    <span className="font-medium">Scam Database:</span> {scamReports} reports
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-black/20 p-2 rounded">
                  {!sanctionDetected ? 
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                    <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
                  }
                  <span>
                    <span className="font-medium">Sanctions:</span> {sanctionDetected ? "Detected" : "None Found"}
                  </span>
                </div>
                
                <div className="flex items-center space-x-2 bg-black/20 p-2 rounded">
                  {auditVerified ? 
                    <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
                    <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
                  }
                  <span>
                    <span className="font-medium">Smart Contract:</span> {auditVerified ? "Verified" : "Self-Reported"}
                  </span>
                </div>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
      
      {/* Legal Disclaimer with enhanced visual design */}
      <Alert className="bg-[#2b1216] border-amber-800/50 shadow-sm">
        <div className="flex items-start">
          <Info className="h-5 w-5 text-amber-500 mr-2" />
          <div className="flex-1">
            <AlertTitle className="text-amber-500 mb-1">Investment Disclaimer</AlertTitle>
            <AlertDescription className="text-amber-100/90">
              <p>
                Always conduct your own due diligence. This token has not been legally validated. It may be regulated as a security 
                (SEC) or ART (MiCA) depending on your jurisdiction.
              </p>
              <div className="mt-2">
                <Link href="/legal" className="text-amber-400 hover:underline flex items-center">
                  <Info className="h-3 w-3 mr-1" />
                  Read Full Disclaimer
                </Link>
              </div>
            </AlertDescription>
          </div>
        </div>
      </Alert>
    </div>
  );
}
