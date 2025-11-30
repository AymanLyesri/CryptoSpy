"use client";

import { useState, useCallback } from "react";
import { getCryptoBySymbol } from "@/services/coinGeckoApi";
import { Cryptocurrency } from "@/types/crypto";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
  cryptoContext?: Cryptocurrency;
  cryptoContexts?: Cryptocurrency[];
}

export function useAiChat() {
  const [messages, setMessages] = useState<Message[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [isFetchingCrypto, setIsFetchingCrypto] = useState(false);

  // Detect crypto abbreviations in text (e.g., BTC, ETH, etc.)
  const detectCryptoSymbols = (text: string): string[] => {
    // Common crypto abbreviations pattern: 2-6 uppercase letters, potentially preceded by $
    const cryptoPattern = /\$?\b([A-Z]{2,6})\b/g;
    const matches = text.match(cryptoPattern);

    if (matches) {
      // Filter out common words that might match the pattern
      const excludeWords = [
        "USD",
        "EUR",
        "GBP",
        "JPY",
        "AI",
        "API",
        "FAQ",
        "USA",
        "UK",
        "IT",
        "THE",
        "AND",
        "FOR",
        "NOT",
        "BUT",
        "ARE",
        "WAS",
        "ALL",
        "CAN",
        "ONE",
        "TWO",
        "NEW",
        "GET",
        "HAS",
        "HAD",
        "MAY",
        "USE",
        "ITS",
        "NOW",
        "WAY",
      ];
      const filtered = matches
        .map((m) => m.replace("$", ""))
        .filter((m) => !excludeWords.includes(m));

      // Remove duplicates
      return [...new Set(filtered)];
    }

    return [];
  };

  const sendMessage = useCallback(
    async (content: string) => {
      // Detect all crypto symbols in user message
      const detectedSymbols = detectCryptoSymbols(content);
      let cryptoContexts: Cryptocurrency[] = [];

      // Fetch crypto data for all detected symbols
      if (detectedSymbols.length > 0) {
        setIsFetchingCrypto(true);
        try {
          // Fetch all crypto data in parallel
          const cryptoPromises = detectedSymbols.map((symbol) =>
            getCryptoBySymbol(symbol).catch((error) => {
              console.error(`Error fetching ${symbol}:`, error);
              return null;
            })
          );

          const cryptoResults = await Promise.all(cryptoPromises);

          // Filter out null results and add to contexts
          cryptoContexts = cryptoResults.filter(
            (crypto): crypto is Cryptocurrency => crypto !== null
          );
        } catch (error) {
          console.error("Error fetching crypto contexts:", error);
        } finally {
          setIsFetchingCrypto(false);
        }
      }

      // Add user message immediately
      const userMessage: Message = {
        id: `user-${Date.now()}`,
        role: "user",
        content,
        cryptoContexts: cryptoContexts.length > 0 ? cryptoContexts : undefined,
        // Keep backward compatibility
        cryptoContext:
          cryptoContexts.length > 0 ? cryptoContexts[0] : undefined,
      };

      setMessages((prev) => [...prev, userMessage]);
      setIsLoading(true);

      try {
        const response = await fetch("/api/ai-chat", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            messages: [...messages, userMessage].map(
              ({ role, content, cryptoContext, cryptoContexts }) => ({
                role,
                content,
                cryptoContext,
                cryptoContexts,
              })
            ),
          }),
        });

        if (!response.ok) {
          throw new Error("Failed to get response");
        }

        const data = await response.json();

        // Add AI response with typing effect
        const aiMessage: Message = {
          id: `assistant-${Date.now()}`,
          role: "assistant",
          content: data.message,
          isTyping: true,
        };

        setMessages((prev) => [...prev, aiMessage]);
      } catch (error) {
        console.error("Error sending message:", error);

        // Add error message
        const errorMessage: Message = {
          id: `error-${Date.now()}`,
          role: "assistant",
          content: "Sorry, I encountered an error. Please try again.",
          isTyping: false,
        };

        setMessages((prev) => [...prev, errorMessage]);
      } finally {
        setIsLoading(false);
      }
    },
    [messages]
  );

  const resetConversation = useCallback(() => {
    setMessages([]);
  }, []);

  return {
    messages,
    isLoading,
    isFetchingCrypto,
    sendMessage,
    resetConversation,
  };
}
