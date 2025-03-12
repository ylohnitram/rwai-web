import { AlertTriangle, FileText, Info } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function DocumentSectionWarning() {
  return (
    <Alert className="bg-blue-900/20 border-blue-800/50 mb-6 flex items-start">
      <AlertTriangle className="h-5 w-5 text-blue-500 mr-2 mt-0.5" />
      <div>
        <AlertTitle className="flex items-center text-blue-400">
          <FileText className="h-4 w-4 mr-1" />
          Document Disclaimer
        </AlertTitle>
        <AlertDescription className="text-blue-200">
          The following documents are provided by the project team and verified by our security process.
          While we've performed basic checks, you should review them carefully before making investment decisions.
        </AlertDescription>
      </div>
    </Alert>
  );
}
