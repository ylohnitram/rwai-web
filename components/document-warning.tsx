import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocumentWarning() {
  return (
    <Alert className="bg-amber-900/30 border-amber-800 mb-4">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">Document Disclaimer</AlertTitle>
      <AlertDescription className="text-amber-200">
        This document is provided by third parties and has not been verified by us. 
        It may contain inaccuracies or violate local regulations. By downloading, 
        you acknowledge these risks.
      </AlertDescription>
    </Alert>
  );
}
