import { NextResponse } from "next/server";
import { headers } from "next/headers";

export async function GET() {
  try {
    const headersList = headers();
    const ip = 
      headersList.get('x-forwarded-for') || 
      headersList.get('x-real-ip') || 
      '127.0.0.1';
    
    const firstIp = ip.split(',')[0].trim();
    
    // Use a reliable geolocation API service
    // Options include: ipapi.co, ipstack.com, ipinfo.io, ip-api.com
    // Here's an example with ipinfo.io which offers 50k requests/month in their free tier
    const apiToken = process.env.IPINFO_TOKEN; // Store this in your environment variables
    
    const apiUrl = apiToken 
      ? `https://ipinfo.io/${firstIp}?token=${apiToken}` 
      : `https://ipinfo.io/${firstIp}/json`;
    
    const response = await fetch(apiUrl);
    
    if (!response.ok) {
      throw new Error('Failed to fetch geolocation data');
    }
    
    // The response includes country, region, city, etc.
    const data = await response.json();
    
    return NextResponse.json({
      country: data.country, // Two-letter country code (US, GB, DE, etc.)
      region: data.region,   // Region or state
      city: data.city,       // City name
      timezone: data.timezone // Timezone
    });
  } catch (error) {
    console.error('Geolocation API error:', error);
    
    // Return a generic response to avoid exposing errors
    return NextResponse.json(
      { error: 'Geolocation service unavailable' },
      { status: 500 }
    );
  }
}
