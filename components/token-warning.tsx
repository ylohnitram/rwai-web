import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

interface TokenWarningProps {
  scamReports?: number;
  sanctionDetected?: boolean;
  auditVerified?: boolean;
}

export default function TokenWarning({ 
  scamReports = 0, 
  sanctionDetected = false, 
  auditVerified = false 
}: TokenWarningProps) {
  return (
    <Alert className="bg-amber-900/30 border-amber-800 my-4">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">⚠️ Automated Risk Check</AlertTitle>
      <AlertDescription className="text-amber-200">
        <ul className="list-disc pl-5 space-y-1 mt-2">
          <li>Scam database matches: {scamReports} reports</li>
          <li>Sanctioned addresses: {sanctionDetected ? "Detected" : "Not Detected"}</li>
          <li>Smart contract audit: {auditVerified ? "Verified" : "Unverified"}</li>
        </ul>
        <p className="mt-2">
          This token has not been legally validated. It may be regulated as a security (SEC) or 
          ART (MiCA). Interact with caution.
        </p>
      </AlertDescription>
    </Alert>
  );
}
