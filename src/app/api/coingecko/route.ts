import { NextResponse } from "next/server";

// Configure runtime for Vercel Edge Functions
export const runtime = 'nodejs';
export const maxDuration = 30; // Maximum duration for API routes on Vercel

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const endpoint = url.searchParams.get("endpoint"); // e.g., "coins/bitcoin/market_chart?vs_currency=usd&days=7"

    if (!endpoint) {
      return NextResponse.json(
        { error: 'Missing "endpoint" query parameter' },
        { status: 400 }
      );
    }

    // Validate endpoint to prevent SSRF attacks
    if (!endpoint.startsWith('coins/') && !endpoint.startsWith('simple/') && !endpoint.startsWith('search')) {
      return NextResponse.json(
        { error: 'Invalid endpoint path' },
        { status: 400 }
      );
    }

    // Construct full CoinGecko URL
    const cgUrl = `https://api.coingecko.com/api/v3/${endpoint}`;

    console.log(`Proxying request to: ${cgUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 25000); // 25 second timeout (less than Vercel's max)

    try {
      const headers: HeadersInit = {
        Accept: "application/json",
        "User-Agent": "CryptoSpy/1.0",
        // Add cache control headers
        "Cache-Control": "no-cache",
      };

      // Add API key if available
      if (process.env.COINGECKO_API_KEY) {
        headers["x-cg-demo-api-key"] = process.env.COINGECKO_API_KEY;
      }

      const res = await fetch(cgUrl, {
        signal: controller.signal,
        headers,
        // Add retry logic
        method: 'GET',
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error(`CoinGecko API error: ${res.status} - ${res.statusText}`);
        
        // Handle specific error codes
        if (res.status === 429) {
          return NextResponse.json(
            { error: "Rate limit exceeded. Please try again later." },
            { 
              status: 429,
              headers: {
                'Retry-After': '60',
                'Cache-Control': 'no-cache'
              }
            }
          );
        }
        
        if (res.status === 404) {
          return NextResponse.json(
            { error: "Cryptocurrency not found" },
            { status: 404 }
          );
        }
        
        return NextResponse.json(
          { error: `CoinGecko API returned ${res.status}: ${res.statusText}` },
          { status: res.status >= 500 ? 502 : res.status }
        );
      }

      const data = await res.json();
      
      // Add response headers for caching
      return NextResponse.json(data, {
        headers: {
          'Cache-Control': 'public, s-maxage=60, stale-while-revalidate=300',
          'CDN-Cache-Control': 'public, s-maxage=60',
          'Vercel-CDN-Cache-Control': 'public, s-maxage=60',
        },
      });
    } catch (fetchError: any) {
      clearTimeout(timeoutId);

      if (fetchError.name === "AbortError") {
        console.error("Request timeout");
        return NextResponse.json(
          { error: "Request timeout - CoinGecko API is slow to respond" },
          { status: 408 }
        );
      }

      throw fetchError;
    }
  } catch (error: any) {
    console.error("API route error:", error);
    
    // More specific error handling
    const errorMessage = error?.message || "Unknown error occurred";
    const statusCode = error?.status || 500;
    
    return NextResponse.json(
      { 
        error: errorMessage,
        timestamp: new Date().toISOString(),
        endpoint: new URL(req.url).searchParams.get("endpoint")
      },
      { 
        status: statusCode,
        headers: {
          'Cache-Control': 'no-cache'
        }
      }
    );
  }
}
