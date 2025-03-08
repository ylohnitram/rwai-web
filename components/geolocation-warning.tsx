"use client";

import { useEffect, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Alert, AlertDescription, AlertTitle } from "@/components/ui/alert";

export default function GeolocationWarning() {
  const [region, setRegion] = useState<"US" | "EU" | "OTHER" | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  
  useEffect(() => {
    async function detectUserRegion() {
      try {
        // Using a reliable IP geolocation service
        const response = await fetch('/api/geolocation');
        if (!response.ok) throw new Error('Geolocation service unavailable');
        
        const data = await response.json();
        if (data.country) {
          // EU countries list
          const euCountries = [
            'AT', 'BE', 'BG', 'HR', 'CY', 'CZ', 'DK', 'EE', 'FI', 'FR', 
            'DE', 'GR', 'HU', 'IE', 'IT', 'LV', 'LT', 'LU', 'MT', 'NL', 
            'PL', 'PT', 'RO', 'SK', 'SI', 'ES', 'SE'
          ];
          
          if (data.country === 'US') {
            setRegion('US');
          } else if (euCountries.includes(data.country)) {
            setRegion('EU');
          } else {
            setRegion('OTHER');
          }
        } else {
          setRegion('OTHER');
        }
      } catch (error) {
        console.error('Geolocation error:', error);
        setRegion('OTHER'); // Default fallback
      } finally {
        setIsLoading(false);
      }
    }
    
    detectUserRegion();
  }, []);

  // Don't show anything while loading or if region is OTHER
  if (isLoading || !region || region === "OTHER") return null;

  return (
    <Alert className="bg-amber-900/30 border-amber-800 my-4">
      <AlertTriangle className="h-4 w-4 text-amber-500" />
      <AlertTitle className="text-amber-500">Regional Notice</AlertTitle>
      <AlertDescription className="text-amber-200">
        {region === "US" && (
          "For US persons: Tokens listed here may be considered securities under U.S. law. Consult a legal advisor before interaction."
        )}
        {region === "EU" && (
          "For EU residents: Some tokens may fall under MiCA regulation. Their compliance status has not been validated."
        )}
      </AlertDescription>
    </Alert>
  );
}
