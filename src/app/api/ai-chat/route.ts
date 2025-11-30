import { NextRequest, NextResponse } from "next/server";
import { PollinationsService } from "@/services/pollinationsApi";

export async function POST(request: NextRequest) {
  try {
    const { messages } = await request.json();

    const pollinations = new PollinationsService();

    // Filter out error messages from previous failed attempts
    const validMessages = messages.filter(
      (msg: any) =>
        msg.content &&
        !msg.content.includes("Pollinations API error") &&
        !msg.content.includes("Sorry, something went wrong")
    );

    // Build enriched messages with crypto context
    const enrichedMessages = validMessages.map((msg: any) => {
      let content = String(msg.content);

      // Build context helper function
      const buildCryptoContext = (crypto: any) => {
        const contextParts = [
          `Name: ${crypto.name}`,
          `Symbol: ${crypto.symbol.toUpperCase()}`,
          `Current Price: $${crypto.current_price?.toLocaleString()}`,
          crypto.high_24h
            ? `24h High: $${crypto.high_24h.toLocaleString()}`
            : null,
          crypto.low_24h
            ? `24h Low: $${crypto.low_24h.toLocaleString()}`
            : null,
          crypto.price_change_24h
            ? `24h Price Change: $${crypto.price_change_24h.toLocaleString()}`
            : null,
          crypto.price_change_percentage_24h
            ? `24h Change: ${crypto.price_change_percentage_24h.toFixed(2)}%`
            : null,
          crypto.price_change_percentage_1h_in_currency
            ? `1h Change: ${crypto.price_change_percentage_1h_in_currency.toFixed(
                2
              )}%`
            : null,
          crypto.price_change_percentage_7d
            ? `7d Change: ${crypto.price_change_percentage_7d.toFixed(2)}%`
            : null,
          crypto.price_change_percentage_30d
            ? `30d Change: ${crypto.price_change_percentage_30d.toFixed(2)}%`
            : null,
          crypto.price_change_percentage_1y
            ? `1y Change: ${crypto.price_change_percentage_1y.toFixed(2)}%`
            : null,
          `Market Cap: $${crypto.market_cap?.toLocaleString()}`,
          crypto.market_cap_rank
            ? `Market Cap Rank: #${crypto.market_cap_rank}`
            : null,
          crypto.fully_diluted_valuation
            ? `Fully Diluted Valuation: $${crypto.fully_diluted_valuation.toLocaleString()}`
            : null,
          crypto.total_volume
            ? `24h Trading Volume: $${crypto.total_volume.toLocaleString()}`
            : null,
          crypto.market_cap_change_24h
            ? `24h Market Cap Change: $${crypto.market_cap_change_24h.toLocaleString()}`
            : null,
          crypto.market_cap_change_percentage_24h
            ? `24h Market Cap Change %: ${crypto.market_cap_change_percentage_24h.toFixed(
                2
              )}%`
            : null,
          crypto.circulating_supply
            ? `Circulating Supply: ${crypto.circulating_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}`
            : null,
          crypto.total_supply
            ? `Total Supply: ${crypto.total_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}`
            : null,
          crypto.max_supply
            ? `Max Supply: ${crypto.max_supply.toLocaleString()} ${crypto.symbol.toUpperCase()}`
            : "Max Supply: Unlimited",
          crypto.ath ? `All-Time High: $${crypto.ath.toLocaleString()}` : null,
          crypto.ath_change_percentage
            ? `ATH Change: ${crypto.ath_change_percentage.toFixed(2)}%`
            : null,
          crypto.ath_date
            ? `ATH Date: ${new Date(crypto.ath_date).toLocaleDateString()}`
            : null,
          crypto.atl ? `All-Time Low: $${crypto.atl.toLocaleString()}` : null,
          crypto.atl_change_percentage
            ? `ATL Change: ${crypto.atl_change_percentage.toFixed(2)}%`
            : null,
          crypto.atl_date
            ? `ATL Date: ${new Date(crypto.atl_date).toLocaleDateString()}`
            : null,
          crypto.last_updated
            ? `Last Updated: ${new Date(crypto.last_updated).toLocaleString()}`
            : null,
        ].filter(Boolean);

        return contextParts.join("\n");
      };

      // If this message has multiple crypto contexts, enrich the content with all of them
      if (msg.cryptoContexts && msg.cryptoContexts.length > 0) {
        const allContexts = msg.cryptoContexts
          .map((crypto: any) => {
            return `\n\n[Crypto Context for ${
              crypto.symbol
            }:\n${buildCryptoContext(crypto)}\n]`;
          })
          .join("");

        content += allContexts;
      } else if (msg.cryptoContext) {
        // Backward compatibility: single crypto context
        const crypto = msg.cryptoContext;
        const contextInfo = `\n\n[Crypto Context for ${
          crypto.symbol
        }:\n${buildCryptoContext(crypto)}\n]`;
        content += contextInfo;
      }

      return {
        role: msg.role === "assistant" ? "assistant" : "user",
        content,
      };
    });

    const response = await pollinations.chatCompletion({
      model: "openai",
      messages: [
        {
          role: "system",
          content:
            "You are a helpful AI assistant for CryptoSpy, a cryptocurrency tracking application. Help users with crypto-related questions, market analysis, and general inquiries. When crypto context is provided in brackets, use that information to give accurate, up-to-date answers about the cryptocurrency. You may receive context for multiple cryptocurrencies in a single message - use all provided contexts to compare and analyze them. Keep responses concise and friendly.\n\nIMPORTANT FORMATTING RULES:\n- ALWAYS use + symbol for positive price changes (e.g., +5.2%, +$1,500)\n- ALWAYS use - symbol for negative price changes (e.g., -3.8%, -$500)\n- Format prices with dollar signs (e.g., $45,230.50)\n- Use uppercase for crypto symbols (e.g., BTC, ETH, SOL)\n- Be consistent with these symbols throughout your response\n- When comparing multiple cryptocurrencies, present information clearly and organized",
        },
        ...enrichedMessages,
      ],
      max_tokens: 500,
      stream: false,
    });

    return NextResponse.json({
      message: response.choices[0].message.content,
    });
  } catch (error: any) {
    console.error("AI Chat Error:", error);

    return NextResponse.json(
      {
        message: "Sorry, something went wrong. Please try again later.",
      },
      { status: 200 }
    );
  }
}
