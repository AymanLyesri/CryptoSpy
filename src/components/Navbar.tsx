"use client";

import {
  useState,
  useEffect,
  useRef,
  forwardRef,
  useImperativeHandle,
} from "react";
import { useRouter } from "next/navigation";
import CryptoSearch, { CryptoSearchRef } from "./CryptoSearch";
import ThemeToggle from "./ThemeToggle";
import { Cryptocurrency } from "@/types/crypto";

interface NavbarProps {
  showSearch?: boolean;
  onCryptoSelect?: (crypto: Cryptocurrency) => void;
}

export interface NavbarRef {
  focusSearch: () => void;
}

const Navbar = forwardRef<NavbarRef, NavbarProps>(function Navbar(
  { showSearch = true, onCryptoSelect }: NavbarProps,
  ref
) {
  const router = useRouter();
  const [isScrolled, setIsScrolled] = useState(false);
  const searchRef = useRef<CryptoSearchRef>(null);

  // Expose focusSearch method to parent components
  useImperativeHandle(ref, () => ({
    focusSearch: () => {
      searchRef.current?.focus();
    },
  }));

  // Handle scroll to transition navbar state
  useEffect(() => {
    const handleScroll = () => {
      const scrollY = window.scrollY;
      setIsScrolled(scrollY > 80);
    };

    // Check initial scroll position
    handleScroll();

    window.addEventListener("scroll", handleScroll, { passive: true });
    return () => window.removeEventListener("scroll", handleScroll);
  }, []);

  const handleCryptoSelect = (crypto: Cryptocurrency) => {
    if (onCryptoSelect) {
      onCryptoSelect(crypto);
    } else {
      router.push(`/${crypto.symbol.toLowerCase()}`);
    }
  };

  const handleHomeClick = () => {
    router.push("/");
  };

  return (
    <nav
      id="navbar"
      className={`
        fixed top-0 left-0 right-0 z-50
        transition-all
        ${
          isScrolled
            ? "backdrop-blur-2xl shadow-sm border-b py-2"
            : "bg-transparent py-4"
        }
      `}
      style={{
        background: isScrolled ? "var(--bg-card)" : "transparent",
        borderColor: isScrolled ? "var(--border-primary)" : "transparent",
        transitionDuration: "var(--transition-base)",
      }}
    >
      <div className="flex items-center justify-between gap-3 sm:gap-4 px-4">
        {/* Logo/Brand */}
        <div className="flex-shrink-0">
          <button
            onClick={handleHomeClick}
            className={`
                group relative
                font-bold
                focus:outline-none rounded-lg
                ${
                  isScrolled
                    ? "text-lg sm:text-xl px-2 py-1"
                    : "text-xl sm:text-2xl md:text-3xl px-2 py-1"
                }
              `}
            style={{
              color: "var(--text-primary)",
              transition: "var(--transition-base)",
            }}
          >
            <span className="relative inline-flex items-center gap-1.5">
              <span
                className="group-hover:opacity-80"
                style={{ transition: "var(--transition-base)" }}
              >
                Crypto Spy
              </span>
            </span>
            <span
              className="absolute bottom-0 left-2 right-2 h-0.5 scale-x-0 group-hover:scale-x-100 origin-left rounded-full"
              style={{
                background: "var(--color-primary)",
                transition: "var(--transition-base)",
              }}
            ></span>
          </button>
        </div>

        {/* Search Component */}
        {showSearch && (
          <div
            className={`
              flex-1 max-w-3xl
              transition-all duration-500 ease-out
              ${isScrolled ? "opacity-100" : "opacity-100"}
            `}
          >
            <CryptoSearch
              ref={searchRef}
              onSelect={handleCryptoSelect}
              placeholder={
                isScrolled ? "Search..." : "Search cryptocurrencies..."
              }
              compact={isScrolled}
            />
          </div>
        )}

        {/* Theme Toggle */}
        <div className="flex-shrink-0">
          <ThemeToggle />
        </div>
      </div>
    </nav>
  );
});

export default Navbar;
