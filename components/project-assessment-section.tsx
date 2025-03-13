import Link from "next/link";
import { Shield, CheckCircle, AlertTriangle, XCircle, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

interface ProjectAssessmentSectionProps {
  scamReports?: number;
  sanctionDetected?: boolean;
  auditVerified?: boolean;
  riskLevel?: "low" | "medium" | "high";
  validationData?: any; // Add validation data
}

export default function ProjectAssessmentSection({
  scamReports = 0,
  sanctionDetected = false,
  auditVerified = false,
  riskLevel = "medium",
  validationData = null
}: ProjectAssessmentSectionProps) {
  // Check for manual review info
  const manuallyReviewed = validationData?.manuallyReviewed || false;
  
  // Get risk level styles
  const getRiskStyles = () => {
    switch(riskLevel) {
      case "low": return {
        bg: "bg-green-900/30",
        border: "border-green-800",
        icon: <Shield className="h-5 w-5 text-green-500 mr-2" />,
        badgeBg: "bg-green-600",
        badgeText: "LOW RISK"
      };
      case "high": return {
        bg: "bg-red-900/30",
        border: "border-red-800",
        icon: <Shield className="h-5 w-5 text-red-500 mr-2" />,
        badgeBg: "bg-red-600",
        badgeText: "HIGH RISK"
      };
      default: return {
        bg: "bg-amber-900/30",
        border: "border-amber-800",
        icon: <Shield className="h-5 w-5 text-amber-500 mr-2" />,
        badgeBg: "bg-amber-600",
        badgeText: "MEDIUM RISK"
      };
    }
  };
  
  const styles = getRiskStyles();
  
  return (
    <Card className={`${styles.bg} ${styles.border} shadow-sm mb-6`}>
      <CardHeader className="pb-2">
        <div className="flex items-center justify-between">
          <CardTitle className="flex items-center">
            {styles.icon}
            Project Security Assessment
          </CardTitle>
          <div className="flex items-center gap-2">
            {manuallyReviewed && (
              <Badge className="bg-blue-600">VERIFIED</Badge>
            )}
            <Badge className={styles.badgeBg}>
              {styles.badgeText}
            </Badge>
          </div>
        </div>
      </CardHeader>
      <CardContent>
        {/* Security checks grid */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-4">
          <div className="flex items-center space-x-2 bg-black/20 p-3 rounded">
            {scamReports === 0 ? 
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            }
            <span>
              <span className="font-medium">Scam Database:</span> {scamReports} reports
            </span>
          </div>
          
          <div className="flex items-center space-x-2 bg-black/20 p-3 rounded">
            {!sanctionDetected ? 
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
              <XCircle className="h-4 w-4 text-red-500 flex-shrink-0" />
            }
            <span>
              <span className="font-medium">Sanctions:</span> {sanctionDetected ? "Detected" : "None Found"}
            </span>
          </div>
          
          <div className="flex items-center space-x-2 bg-black/20 p-3 rounded">
            {auditVerified ? 
              <CheckCircle className="h-4 w-4 text-green-500 flex-shrink-0" /> : 
              <AlertTriangle className="h-4 w-4 text-amber-500 flex-shrink-0" />
            }
            <span>
              <span className="font-medium">Smart Contract:</span> {auditVerified ? "Verified" : "Self-Reported"}
            </span>
          </div>
        </div>
        
        {/* Disclaimer section */}
        <Separator className="my-4 bg-gray-700/50" />
        
        <div className="mt-4 bg-black/30 p-4 rounded border border-gray-700/50">
          <div className="flex items-start">
            <Info className="h-5 w-5 text-blue-400 mr-2 mt-0.5" />
            <div>
              <h3 className="text-sm font-medium text-blue-400 mb-1">Important Information</h3>
              <p className="text-sm text-gray-300">
                {manuallyReviewed ? 
                  "This project has been reviewed by our security team. While it has passed our verification process, always conduct your own research before investing." :
                  "This is an automated assessment based on our security processes. While this project has passed our basic checks, always conduct your own research and due diligence before investing."
                }
              </p>
              <div className="mt-2 flex items-center">
                <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
                <p className="text-sm text-amber-400">
                  This token has not been legally validated. It may be regulated as a security (SEC) or ART (MiCA) 
                  depending on your jurisdiction.
                </p>
              </div>
              <div className="mt-2">
                <Link href="/legal" className="text-amber-400 text-sm hover:underline flex items-center">
                  Read Full Disclaimer
                </Link>
              </div>
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
