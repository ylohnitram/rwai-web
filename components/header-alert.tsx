"use client";

import { useState } from "react";
import { AlertTriangle, X } from "lucide-react";
import { Alert, AlertDescription } from "@/components/ui/alert";
import Link from "next/link";

export default function HeaderAlert() {
  const [dismissed, setDismissed] = useState(false);

  if (dismissed) return null;

  return (
    <Alert className="rounded-none border-t-0 border-x-0 border-b border-amber-800 bg-amber-900/30 py-2">
      <div className="container flex items-center justify-between">
        <div className="flex items-center">
          <AlertTriangle className="h-4 w-4 text-amber-500 mr-2" />
          <AlertDescription className="text-amber-200 text-sm">
            This platform performs automated scam checks but does not guarantee legitimacy. 
            <Link href="/legal" className="ml-1 text-amber-400 hover:underline">
              Read full disclaimer.
            </Link>
          </AlertDescription>
        </div>
        <button 
          onClick={() => setDismissed(true)}
          className="text-amber-400 hover:text-amber-300"
          aria-label="Dismiss"
        >
          <X className="h-4 w-4" />
        </button>
      </div>
    </Alert>
  );
}
