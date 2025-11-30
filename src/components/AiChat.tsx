"use client";

import { useAiChat } from "@/hooks/useAiChat";
import { useState, useRef, useEffect } from "react";
import { Cryptocurrency } from "@/types/crypto";

interface Message {
  id: string;
  role: "user" | "assistant";
  content: string;
  isTyping?: boolean;
  cryptoContext?: Cryptocurrency;
  cryptoContexts?: Cryptocurrency[];
}

export default function AiChat() {
  const [isExpanded, setIsExpanded] = useState(false);
  const [inputValue, setInputValue] = useState("");
  const messagesEndRef = useRef<HTMLDivElement>(null);
  const {
    messages,
    isLoading,
    isFetchingCrypto,
    sendMessage,
    resetConversation,
  } = useAiChat();

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: "smooth" });
  };

  useEffect(() => {
    scrollToBottom();
  }, [messages]);

  const handleSend = async () => {
    if (!inputValue.trim() || isLoading || isFetchingCrypto) return;

    const message = inputValue;
    setInputValue("");
    await sendMessage(message);
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  return (
    <>
      {/* Floating Button */}
      <button
        onClick={() => setIsExpanded(!isExpanded)}
        className="ai-chat-button"
        aria-label="Toggle AI Chat"
        style={{
          position: "fixed",
          bottom: "var(--spacing-lg)",
          right: "var(--spacing-lg)",
          width: "3.5rem",
          height: "3.5rem",
          borderRadius: "var(--radius-full)",
          background: "var(--color-primary)",
          color: "var(--text-inverted)",
          border: "none",
          boxShadow: "var(--shadow-hover)",
          cursor: "pointer",
          display: isExpanded ? "none" : "flex",
          alignItems: "center",
          justifyContent: "center",
          zIndex: 999,
          transition: "all var(--transition-base)",
        }}
      >
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="24"
          height="24"
          viewBox="0 0 24 24"
          fill="none"
          stroke="currentColor"
          strokeWidth="2"
          strokeLinecap="round"
          strokeLinejoin="round"
        >
          <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
          <path d="M8 10h.01M12 10h.01M16 10h.01" />
        </svg>
      </button>

      {/* Expanded Chat Window */}
      <div
        className="ai-chat-window"
        style={{
          position: "fixed",
          bottom: "var(--spacing-lg)",
          right: "var(--spacing-lg)",
          width: isExpanded ? "400px" : "0",
          height: isExpanded ? "600px" : "0",
          maxWidth: "calc(100vw - 2rem)",
          maxHeight: "calc(100vh - 2rem)",
          background: "var(--bg-card)",
          backdropFilter: "blur(12px)",
          border: "1px solid var(--border-primary)",
          borderRadius: "var(--radius-card)",
          boxShadow: "var(--shadow-hover)",
          zIndex: 998,
          display: "flex",
          flexDirection: "column",
          overflow: "hidden",
          opacity: isExpanded ? 1 : 0,
          transform: isExpanded ? "scale(1)" : "scale(0.9)",
          transformOrigin: "bottom right",
          transition: "all var(--transition-base)",
          pointerEvents: isExpanded ? "auto" : "none",
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: "var(--spacing-card)",
            borderBottom: "1px solid var(--border-primary)",
            display: "flex",
            alignItems: "center",
            justifyContent: "space-between",
          }}
        >
          <div
            style={{
              display: "flex",
              alignItems: "center",
              gap: "var(--spacing-sm)",
            }}
          >
            <div
              style={{
                width: "8px",
                height: "8px",
                borderRadius: "50%",
                background: "var(--color-success)",
                animation: "pulse 2s cubic-bezier(0.4, 0, 0.6, 1) infinite",
              }}
            />
            <h3
              style={{
                margin: 0,
                fontSize: "1rem",
                fontWeight: 600,
                color: "var(--text-primary)",
              }}
            >
              AI Assistant
            </h3>
          </div>
          <div style={{ display: "flex", gap: "var(--spacing-xs)" }}>
            {messages.length > 0 && (
              <button
                onClick={resetConversation}
                style={{
                  background: "transparent",
                  border: "none",
                  color: "var(--text-secondary)",
                  cursor: "pointer",
                  padding: "var(--spacing-xs)",
                  borderRadius: "var(--radius-sm)",
                  transition: "all var(--transition-fast)",
                  display: "flex",
                  alignItems: "center",
                  justifyContent: "center",
                  position: "relative",
                  zIndex: 1,
                }}
                onMouseEnter={(e) => {
                  e.currentTarget.style.background = "var(--bg-overlay)";
                  e.currentTarget.style.color = "var(--text-primary)";
                }}
                onMouseLeave={(e) => {
                  e.currentTarget.style.background = "transparent";
                  e.currentTarget.style.color = "var(--text-secondary)";
                }}
                title="Reset conversation"
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="18"
                  height="18"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="2"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                >
                  <path d="M3 12a9 9 0 0 1 9-9 9.75 9.75 0 0 1 6.74 2.74L21 8" />
                  <path d="M21 3v5h-5" />
                  <path d="M21 12a9 9 0 0 1-9 9 9.75 9.75 0 0 1-6.74-2.74L3 16" />
                  <path d="M3 21v-5h5" />
                </svg>
              </button>
            )}
            <button
              onClick={() => setIsExpanded(false)}
              style={{
                background: "transparent",
                border: "none",
                color: "var(--text-secondary)",
                cursor: "pointer",
                padding: "var(--spacing-xs)",
                borderRadius: "var(--radius-sm)",
                transition: "all var(--transition-fast)",
                display: "flex",
                alignItems: "center",
                justifyContent: "center",
                position: "relative",
                zIndex: 1,
              }}
              onMouseEnter={(e) => {
                e.currentTarget.style.background = "var(--bg-overlay)";
                e.currentTarget.style.color = "var(--text-primary)";
              }}
              onMouseLeave={(e) => {
                e.currentTarget.style.background = "transparent";
                e.currentTarget.style.color = "var(--text-secondary)";
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="M18 6 6 18M6 6l12 12" />
              </svg>
            </button>
          </div>
        </div>

        {/* Messages Container */}
        <div
          style={{
            flex: 1,
            overflowY: "auto",
            padding: "var(--spacing-card)",
            display: "flex",
            flexDirection: "column",
            gap: "var(--spacing-base)",
          }}
          className="messages-container"
        >
          {messages.length === 0 ? (
            <div
              style={{
                display: "flex",
                flexDirection: "column",
                alignItems: "stretch",
                justifyContent: "flex-start",
                height: "100%",
                gap: "var(--spacing-base)",
                padding: "var(--spacing-sm)",
              }}
            >
              <div
                style={{
                  textAlign: "center",
                  color: "var(--text-primary)",
                  marginBottom: "var(--spacing-sm)",
                }}
              >
                <svg
                  xmlns="http://www.w3.org/2000/svg"
                  width="48"
                  height="48"
                  viewBox="0 0 24 24"
                  fill="none"
                  stroke="currentColor"
                  strokeWidth="1.5"
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  style={{
                    opacity: 0.7,
                    margin: "0 auto var(--spacing-sm)",
                    color: "var(--color-primary)",
                  }}
                >
                  <path d="M21 15a2 2 0 0 1-2 2H7l-4 4V5a2 2 0 0 1 2-2h14a2 2 0 0 1 2 2z" />
                  <path d="M8 10h.01M12 10h.01M16 10h.01" />
                </svg>
                <h4
                  style={{
                    margin: 0,
                    fontSize: "1rem",
                    fontWeight: 600,
                    marginBottom: "var(--spacing-xs)",
                  }}
                >
                  AI Assistant
                </h4>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                    marginBottom: "var(--spacing-xs)",
                  }}
                >
                  Ask me anything about cryptocurrencies
                </p>
                <p
                  style={{
                    margin: 0,
                    fontSize: "0.75rem",
                    color: "var(--text-muted)",
                    fontStyle: "italic",
                  }}
                >
                  💡 Tip: Use symbols (BTC, ETH) instead of names
                </p>
              </div>

              <div
                style={{
                  display: "flex",
                  flexDirection: "column",
                  gap: "var(--spacing-sm)",
                }}
              >
                <p
                  style={{
                    fontSize: "0.75rem",
                    fontWeight: 600,
                    color: "var(--text-secondary)",
                    margin: 0,
                    textTransform: "uppercase",
                    letterSpacing: "0.05em",
                  }}
                >
                  💬 Try asking:
                </p>

                <button
                  onClick={() =>
                    setInputValue("What is the current price of BTC?")
                  }
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "var(--radius-base)",
                    padding: "var(--spacing-sm) var(--spacing-base)",
                    fontSize: "0.875rem",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-overlay)";
                    e.currentTarget.style.borderColor = "var(--border-primary)";
                  }}
                >
                  "What is the current price of BTC?"
                </button>

                <button
                  onClick={() => setInputValue("Compare ETH and SOL")}
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "var(--radius-base)",
                    padding: "var(--spacing-sm) var(--spacing-base)",
                    fontSize: "0.875rem",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-overlay)";
                    e.currentTarget.style.borderColor = "var(--border-primary)";
                  }}
                >
                  "Compare ETH and SOL"
                </button>

                <button
                  onClick={() => setInputValue("Explain what market cap means")}
                  style={{
                    background: "var(--bg-overlay)",
                    border: "1px solid var(--border-primary)",
                    borderRadius: "var(--radius-base)",
                    padding: "var(--spacing-sm) var(--spacing-base)",
                    fontSize: "0.875rem",
                    color: "var(--text-primary)",
                    cursor: "pointer",
                    textAlign: "left",
                    transition: "all var(--transition-fast)",
                  }}
                  onMouseEnter={(e) => {
                    e.currentTarget.style.background = "var(--bg-card)";
                    e.currentTarget.style.borderColor = "var(--color-primary)";
                  }}
                  onMouseLeave={(e) => {
                    e.currentTarget.style.background = "var(--bg-overlay)";
                    e.currentTarget.style.borderColor = "var(--border-primary)";
                  }}
                >
                  "Explain what market cap means"
                </button>
              </div>
            </div>
          ) : (
            messages.map((message) => (
              <MessageBubble key={message.id} message={message} />
            ))
          )}
          {isFetchingCrypto && (
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-sm)",
                alignItems: "center",
                padding: "var(--spacing-sm)",
                background: "var(--bg-overlay)",
                borderRadius: "var(--radius-base)",
                border: "1px solid var(--border-primary)",
                fontSize: "0.875rem",
                color: "var(--text-secondary)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="16"
                height="16"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: "spin 1s linear infinite",
                }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
              <span>Fetching crypto data...</span>
            </div>
          )}
          {isLoading && (
            <div
              style={{
                display: "flex",
                gap: "var(--spacing-sm)",
                alignItems: "flex-start",
              }}
            >
              <div
                style={{
                  background: "var(--bg-overlay)",
                  padding: "var(--spacing-sm) var(--spacing-base)",
                  borderRadius: "var(--radius-base)",
                  maxWidth: "80%",
                  display: "flex",
                  alignItems: "center",
                  gap: "var(--spacing-sm)",
                }}
              >
                <ThinkingIndicator />
                <span
                  style={{
                    fontSize: "0.875rem",
                    color: "var(--text-secondary)",
                  }}
                >
                  AI is thinking...
                </span>
              </div>
            </div>
          )}
          <div ref={messagesEndRef} />
        </div>

        {/* Input Area */}
        <div
          style={{
            padding: "var(--spacing-card)",
            borderTop: "1px solid var(--border-primary)",
            display: "flex",
            gap: "var(--spacing-sm)",
          }}
        >
          <input
            type="text"
            value={inputValue}
            onChange={(e) => setInputValue(e.target.value)}
            onKeyPress={handleKeyPress}
            placeholder="Type your message..."
            disabled={isLoading || isFetchingCrypto}
            style={{
              flex: 1,
              padding: "var(--spacing-sm) var(--spacing-base)",
              border: "1px solid var(--border-primary)",
              borderRadius: "var(--radius-base)",
              background: "var(--bg-card)",
              color: "var(--text-primary)",
              fontSize: "0.875rem",
              outline: "none",
              transition: "all var(--transition-fast)",
              opacity: isLoading || isFetchingCrypto ? 0.6 : 1,
            }}
            onFocus={(e) => {
              e.currentTarget.style.borderColor = "var(--color-primary)";
              e.currentTarget.style.boxShadow =
                "0 0 0 2px rgba(59, 130, 246, 0.1)";
            }}
            onBlur={(e) => {
              e.currentTarget.style.borderColor = "var(--border-primary)";
              e.currentTarget.style.boxShadow = "none";
            }}
          />
          <button
            onClick={handleSend}
            disabled={!inputValue.trim() || isLoading || isFetchingCrypto}
            style={{
              padding: "var(--spacing-sm) var(--spacing-base)",
              background:
                inputValue.trim() && !isLoading && !isFetchingCrypto
                  ? "var(--color-primary)"
                  : "var(--bg-overlay)",
              color:
                inputValue.trim() && !isLoading && !isFetchingCrypto
                  ? "var(--text-inverted)"
                  : "var(--text-muted)",
              border: "none",
              borderRadius: "var(--radius-base)",
              cursor:
                inputValue.trim() && !isLoading && !isFetchingCrypto
                  ? "pointer"
                  : "not-allowed",
              transition: "all var(--transition-fast)",
              display: "flex",
              alignItems: "center",
              justifyContent: "center",
            }}
          >
            {isLoading || isFetchingCrypto ? (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
                style={{
                  animation: "spin 1s linear infinite",
                }}
              >
                <path d="M21 12a9 9 0 1 1-6.219-8.56" />
              </svg>
            ) : (
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="18"
                height="18"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <path d="m22 2-7 20-4-9-9-4Z" />
                <path d="M22 2 11 13" />
              </svg>
            )}
          </button>
        </div>
      </div>

      <style jsx>{`
        @keyframes spin {
          from {
            transform: rotate(0deg);
          }
          to {
            transform: rotate(360deg);
          }
        }

        .messages-container::-webkit-scrollbar {
          width: 6px;
        }

        .messages-container::-webkit-scrollbar-track {
          background: transparent;
        }

        .messages-container::-webkit-scrollbar-thumb {
          background: var(--border-secondary);
          border-radius: var(--radius-full);
        }

        .messages-container::-webkit-scrollbar-thumb:hover {
          background: var(--text-muted);
        }

        @media (max-width: 640px) {
          .ai-chat-window {
            width: ${isExpanded ? "calc(100vw - 2rem)" : "0"} !important;
            height: ${isExpanded ? "calc(100vh - 2rem)" : "0"} !important;
          }
        }
      `}</style>
    </>
  );
}

function FormattedText({ text }: { text: string }) {
  // Format the text with styling rules
  const formatText = (content: string) => {
    const parts: React.ReactNode[] = [];
    let lastIndex = 0;
    let key = 0;

    // Regex patterns for different formatting rules
    const patterns = [
      // Price pattern: $xxx,xxx.xx or $xxx.xx (must come before positive/negative)
      {
        regex: /\$[\d,]+\.?\d*/g,
        format: (match: string) => (
          <strong
            key={`price-${key++}`}
            style={{ fontWeight: 600, color: "inherit" }}
          >
            {match}
          </strong>
        ),
      },
      // Positive percentage/change: +x.xx% or +x.xx (including with $ for price changes)
      {
        regex: /\+\$?[\d,.]+%?/g,
        format: (match: string) => (
          <span
            key={`positive-${key++}`}
            style={{ color: "#10b981", fontWeight: 600 }}
          >
            {match}
          </span>
        ),
      },
      // Negative percentage/change: -x.xx% or -x.xx (including with $ for price changes)
      {
        regex: /\-\$?[\d,.]+%?/g,
        format: (match: string) => (
          <span
            key={`negative-${key++}`}
            style={{ color: "#ef4444", fontWeight: 600 }}
          >
            {match}
          </span>
        ),
      },
      // Crypto symbols: 2-6 uppercase letters (BTC, ETH, etc.)
      {
        regex: /\b[A-Z]{2,6}\b(?!\w)/g,
        format: (match: string) => {
          // Exclude common non-crypto words
          const excludeWords = [
            "USD",
            "EUR",
            "GBP",
            "JPY",
            "API",
            "FAQ",
            "USA",
            "UK",
            "IT",
            "AI",
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
          if (excludeWords.includes(match)) {
            return match;
          }
          return (
            <strong key={`crypto-${key++}`} style={{ fontWeight: 600 }}>
              {match}
            </strong>
          );
        },
      },
    ];

    // Create a combined regex to find all matches
    const combinedRegex = new RegExp(
      patterns.map((p) => `(${p.regex.source})`).join("|"),
      "g"
    );

    let match;
    const matches: Array<{ index: number; text: string; type: number }> = [];

    // Find all matches and their positions
    while ((match = combinedRegex.exec(content)) !== null) {
      const matchedText = match[0];
      const matchIndex = match.index;

      // Determine which pattern matched
      let patternIndex = -1;
      for (let i = 0; i < patterns.length; i++) {
        if (new RegExp(patterns[i].regex).test(matchedText)) {
          patternIndex = i;
          break;
        }
      }

      matches.push({
        index: matchIndex,
        text: matchedText,
        type: patternIndex,
      });
    }

    // Build the formatted content
    matches.forEach((match, i) => {
      // Add plain text before this match
      if (match.index > lastIndex) {
        parts.push(content.substring(lastIndex, match.index));
      }

      // Add the formatted match
      if (match.type >= 0) {
        parts.push(patterns[match.type].format(match.text));
      }

      lastIndex = match.index + match.text.length;
    });

    // Add remaining plain text
    if (lastIndex < content.length) {
      parts.push(content.substring(lastIndex));
    }

    return parts.length > 0 ? parts : content;
  };

  return <>{formatText(text)}</>;
}

function MessageBubble({ message }: { message: Message }) {
  const isUser = message.role === "user";

  return (
    <div
      style={{
        display: "flex",
        flexDirection: "column",
        alignItems: isUser ? "flex-end" : "flex-start",
        animation: "slideIn 0.3s ease-out",
        gap: "var(--spacing-xs)",
      }}
    >
      {/* Show crypto context badges if available */}
      {message.cryptoContexts && message.cryptoContexts.length > 0 ? (
        <div
          style={{
            display: "flex",
            gap: "var(--spacing-xs)",
            flexWrap: "wrap",
            alignItems: "center",
          }}
        >
          {message.cryptoContexts.map((crypto, index) => (
            <div
              key={`${crypto.id}-${index}`}
              style={{
                fontSize: "0.75rem",
                color: "var(--text-muted)",
                display: "flex",
                alignItems: "center",
                gap: "var(--spacing-xs)",
                padding: "2px 8px",
                background: "var(--bg-overlay)",
                borderRadius: "var(--radius-sm)",
                border: "1px solid var(--border-primary)",
              }}
            >
              <svg
                xmlns="http://www.w3.org/2000/svg"
                width="12"
                height="12"
                viewBox="0 0 24 24"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
                strokeLinecap="round"
                strokeLinejoin="round"
              >
                <circle cx="12" cy="12" r="10" />
                <path d="M12 6v6l4 2" />
              </svg>
              <span>Context: {crypto.symbol}</span>
            </div>
          ))}
        </div>
      ) : message.cryptoContext ? (
        <div
          style={{
            fontSize: "0.75rem",
            color: "var(--text-muted)",
            display: "flex",
            alignItems: "center",
            gap: "var(--spacing-xs)",
            padding: "2px 8px",
            background: "var(--bg-overlay)",
            borderRadius: "var(--radius-sm)",
            border: "1px solid var(--border-primary)",
          }}
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="12"
            height="12"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <circle cx="12" cy="12" r="10" />
            <path d="M12 6v6l4 2" />
          </svg>
          <span>Context: {message.cryptoContext.symbol}</span>
        </div>
      ) : null}
      <div
        style={{
          background: isUser ? "var(--color-primary)" : "var(--bg-overlay)",
          color: isUser ? "var(--text-inverted)" : "var(--text-primary)",
          padding: "var(--spacing-sm) var(--spacing-base)",
          borderRadius: "var(--radius-base)",
          maxWidth: "80%",
          wordWrap: "break-word",
          fontSize: "0.875rem",
          lineHeight: "1.5",
        }}
      >
        {message.isTyping ? (
          <TypingText text={message.content} isUser={isUser} />
        ) : isUser ? (
          message.content
        ) : (
          <FormattedText text={message.content} />
        )}
      </div>
      <style jsx>{`
        @keyframes slideIn {
          from {
            opacity: 0;
            transform: translateY(10px);
          }
          to {
            opacity: 1;
            transform: translateY(0);
          }
        }
      `}</style>
    </div>
  );
}

function TypingText({ text, isUser }: { text: string; isUser: boolean }) {
  const [displayedText, setDisplayedText] = useState("");
  const [currentIndex, setCurrentIndex] = useState(0);

  useEffect(() => {
    if (currentIndex < text.length) {
      const timeout = setTimeout(() => {
        setDisplayedText((prev) => prev + text[currentIndex]);
        setCurrentIndex((prev) => prev + 1);
      }, 30); // Adjust speed here (lower = faster)

      return () => clearTimeout(timeout);
    }
  }, [currentIndex, text]);

  // For assistant messages, apply formatting to the typed text
  return isUser ? (
    <span>{displayedText}</span>
  ) : (
    <FormattedText text={displayedText} />
  );
}

function ThinkingIndicator() {
  return (
    <div style={{ display: "flex", gap: "4px", alignItems: "center" }}>
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "var(--text-muted)",
          animation: "bounce 1.4s infinite ease-in-out both",
          animationDelay: "-0.32s",
        }}
      />
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "var(--text-muted)",
          animation: "bounce 1.4s infinite ease-in-out both",
          animationDelay: "-0.16s",
        }}
      />
      <div
        style={{
          width: "8px",
          height: "8px",
          borderRadius: "50%",
          background: "var(--text-muted)",
          animation: "bounce 1.4s infinite ease-in-out both",
        }}
      />
      <style jsx>{`
        @keyframes bounce {
          0%,
          80%,
          100% {
            transform: scale(0);
            opacity: 0.5;
          }
          40% {
            transform: scale(1);
            opacity: 1;
          }
        }
      `}</style>
    </div>
  );
}
