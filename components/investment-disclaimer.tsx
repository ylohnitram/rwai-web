import Link from "next/link";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function InvestmentDisclaimer() {
  return (
    <Alert className="bg-[#2b1216] border-amber-800/50 mb-6">
      <div className="flex items-start">
        <AlertTriangle className="h-5 w-5 text-amber-500 mr-2" />
        <div className="flex-1">
          <AlertTitle className="text-amber-500 mb-1">Investment Disclaimer</AlertTitle>
          <AlertDescription className="text-amber-100/90">
            <p>
              Always conduct your own due diligence. This token has not been legally validated. It may be regulated as a security 
              (SEC) or ART (MiCA) depending on your jurisdiction.
            </p>
            <div className="mt-2">
              <Link href="/legal" className="text-amber-400 hover:underline flex items-center">
                <AlertTriangle className="h-3 w-3 mr-1" />
                Read Full Disclaimer
              </Link>
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  );
}
