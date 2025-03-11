import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocumentSectionWarning() {
  return (
    <Alert className="bg-red-900/30 border-red-800 mb-6">
      <AlertTriangle className="h-4 w-4 text-red-500 mr-2" />
      <AlertTitle className="text-red-500">Document Disclaimer</AlertTitle>
      <AlertDescription className="text-red-200">
        The documents in this section are provided by third parties and have not been verified by us. 
        They may contain inaccuracies or violate local regulations. By downloading, 
        you acknowledge these risks.
      </AlertDescription>
    </Alert>
  );
}
