"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GeolocationWarning() {
  const [region, setRegion] = useState<"US" | "EU" | "OTHER" | null>(null);
  
  useEffect(() => {
    // This is a simplified example. In a real app, you would use a geolocation service
    // For now, we'll just simulate detection with a random value
    const regions = ["US", "EU", "OTHER"];
    const randomRegion = regions[Math.floor(Math.random() * regions.length)] as "US" | "EU" | "OTHER";
    setRegion(randomRegion);
  }, []);

  if (!region || region === "OTHER") return null;

  return (
    <Alert className="bg-amber-900/30 border-amber-800 my-4">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">Regional Warning</AlertTitle>
      <AlertDescription className="text-amber-200">
        {region === "US" && (
          "Warning: Tokens listed here may be considered securities under U.S. law. Consult a legal advisor before interaction."
        )}
        {region === "EU" && (
          "Warning: Some tokens may fall under MiCA regulation. We do not validate their compliance."
        )}
      </AlertDescription>
    </Alert>
  );
}
