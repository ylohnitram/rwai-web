import { CheckCircle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TokenCheckResultProps {
  scamReports?: number;
  sanctionDetected?: boolean;
  auditVerified?: boolean;
}

export default function TokenCheckResult({ 
  scamReports = 0, 
  sanctionDetected = false, 
  auditVerified = false 
}: TokenCheckResultProps) {
  // Determine if all checks passed
  const allChecksPassed = scamReports === 0 && !sanctionDetected && auditVerified;
  
  return (
    <Alert className={`my-4 ${allChecksPassed ? "bg-green-900/30 border-green-800" : "bg-amber-900/30 border-amber-800"}`}>
      <CheckCircle className="h-4 w-4 text-green-500 mr-2" />
      <AlertTitle className="text-green-500">✓ Automated Security Check</AlertTitle>
      <AlertDescription className="text-green-200">
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Scam database matches: {scamReports} reports</li>
          <li>Sanctioned addresses: {sanctionDetected ? "Detected" : "Not Detected"}</li>
          <li>Smart contract audit: {auditVerified ? "Verified" : "Unverified"}</li>
        </ul>
        <p className="mt-2">
          This token has not been legally validated. It may be regulated as a security (SEC) or 
          ART (MiCA). Always conduct your own due diligence before interacting with any token.
        </p>
      </AlertDescription>
    </Alert>
  );
}
