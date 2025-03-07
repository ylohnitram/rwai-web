import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function LegalDisclaimer() {
  return (
    <Alert className="bg-amber-900/30 border-amber-800 my-4">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">Legal Disclaimer</AlertTitle>
      <AlertDescription className="text-amber-200">
        This platform serves purely informational purposes. We are not registered with any regulatory authority 
        (including the SEC or ESMA). While we perform automated scam checks (e.g., Chainabuse reports, OFAC sanctions), 
        we do not verify the legal status, legitimacy, or investment potential of listed tokens. 
        Users act at their own risk and must conduct their own due diligence.
        <Link href="/legal" className="block mt-2 text-amber-400 hover:underline">
          Read Full Disclaimer
        </Link>
      </AlertDescription>
    </Alert>
  );
}
