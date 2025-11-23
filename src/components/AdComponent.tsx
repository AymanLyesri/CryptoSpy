import React, { useEffect, useState, useRef } from "react";
import { unifiedStyles } from "@/utils/themeUtils";

interface AdComponentProps {
  adSlot: string;
  adFormat?: string;
  adLayout?: string;
  style?: React.CSSProperties;
  className?: string;
  fallback?: React.ReactNode;
}

const AdComponent: React.FC<AdComponentProps> = ({
  adSlot,
  adFormat = "auto",
  adLayout = "",
  style,
  className = "",
  fallback,
}) => {
  const [adLoaded, setAdLoaded] = useState(false);
  const [adError, setAdError] = useState(false);
  const adRef = useRef<HTMLModElement>(null);

  useEffect(() => {
    const loadAd = () => {
      try {
        // Check if AdSense script is loaded
        if (typeof window === "undefined" || !(window as any).adsbygoogle) {
          console.warn("AdSense script not loaded");
          setAdError(true);
          return;
        }

        // Initialize adsbygoogle array if not exists
        (window as any).adsbygoogle = (window as any).adsbygoogle || [];

        // Push the ad configuration
        (window as any).adsbygoogle.push({});

        setAdLoaded(true);

        // Check if ad was actually filled after a short delay
        setTimeout(() => {
          if (adRef.current) {
            const adDisplay = window.getComputedStyle(adRef.current).display;
            if (adDisplay === "none" || adRef.current.children.length === 0) {
              console.warn("Ad might be blocked or not filled");
              setAdError(true);
            }
          }
        }, 1000);
      } catch (error) {
        console.error("Error loading ad:", error);
        setAdError(true);
      }
    };

    // Load ad after a small delay to ensure DOM is ready
    const timer = setTimeout(loadAd, 100);

    return () => clearTimeout(timer);
  }, [adSlot]);

  // Show fallback if ad failed to load and fallback is provided
  if (adError && fallback) {
    return <>{fallback}</>;
  }

  return (
    <div className={`ad-container ${className}`} style={style}>
      <ins
        ref={adRef}
        className="adsbygoogle"
        style={{
          display: "block",
          minHeight: "100px",
          ...style,
        }}
        data-ad-client="ca-pub-8579370544297692"
        data-ad-slot={adSlot}
        data-ad-format={adFormat}
        data-ad-layout={adLayout}
        data-full-width-responsive="true"
      />
      {!adLoaded && !adError && (
        <div className="ad-loading flex items-center justify-center p-4 bg-gray-100 dark:bg-gray-800 rounded">
          <span className="text-sm text-gray-500 dark:text-gray-400">
            Loading ad...
          </span>
        </div>
      )}
    </div>
  );
};

export default AdComponent;
