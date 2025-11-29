"use client";

interface CryptoCardSkeletonProps {
  className?: string;
}

export default function CryptoCardSkeleton({
  className = "",
}: CryptoCardSkeletonProps) {
  return (
    <div className="unified-card !p-3 loading-pulse">
      <div className="flex items-center gap-3">
        {/* Left: Icon + Name */}
        <div className="flex items-center gap-2 flex-1 min-w-0">
          <div
            className="w-8 h-8 rounded-full flex-shrink-0"
            style={{ background: "var(--border-secondary)" }}
          />
          <div className="flex-1 min-w-0 space-y-2">
            <div
              className="h-3 rounded w-20"
              style={{ background: "var(--border-secondary)" }}
            />
            <div
              className="h-2 rounded w-12"
              style={{ background: "var(--border-secondary)" }}
            />
          </div>
        </div>

        {/* Center: Mini Chart */}
        <div className="flex items-end gap-0.5 h-8 w-20">
          {[...Array(8)].map((_, i) => (
            <div
              key={i}
              className="flex-1 rounded-sm"
              style={{
                height: `${Math.random() * 70 + 30}%`,
                background: "var(--border-secondary)",
              }}
            />
          ))}
        </div>

        {/* Right: Price + Change */}
        <div className="text-right flex-shrink-0 min-w-[80px] space-y-2">
          <div
            className="h-3 rounded w-16 ml-auto"
            style={{ background: "var(--border-secondary)" }}
          />
          <div
            className="h-2 rounded w-12 ml-auto"
            style={{ background: "var(--border-secondary)" }}
          />
        </div>
      </div>
    </div>
  );
}
