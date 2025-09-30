import { NextResponse } from "next/server";

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

    // Construct full CoinGecko URL
    const cgUrl = `https://api.coingecko.com/api/v3/${endpoint}`;

    console.log(`Proxying request to: ${cgUrl}`);

    const controller = new AbortController();
    const timeoutId = setTimeout(() => controller.abort(), 15000); // 15 second timeout

    try {
      const res = await fetch(cgUrl, {
        signal: controller.signal,
        headers: {
          Accept: "application/json",
          "User-Agent": "CryptoSpy/1.0",
          ...(process.env.COINGECKO_API_KEY && {
            "x-cg-demo-api-key": process.env.COINGECKO_API_KEY,
          }),
        },
      });

      clearTimeout(timeoutId);

      if (!res.ok) {
        console.error(`CoinGecko API error: ${res.status} - ${res.statusText}`);
        return NextResponse.json(
          { error: `CoinGecko API returned ${res.status}: ${res.statusText}` },
          { status: res.status }
        );
      }

      const data = await res.json();
      return NextResponse.json(data);
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
    return NextResponse.json(
      { error: error.message || "Unknown error" },
      { status: 500 }
    );
  }
}
