"use client";

import { useEffect, useRef, useState } from "react";

export default function AnimatedBackground() {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const mouseRef = useRef({ x: 0, y: 0 });
  const targetRef = useRef({ x: 0, y: 0 });
  const [isDark, setIsDark] = useState(false);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Check initial theme
    const checkTheme = () => {
      setIsDark(document.documentElement.classList.contains("dark"));
    };
    checkTheme();

    // Listen for theme changes
    const themeObserver = new MutationObserver(checkTheme);
    themeObserver.observe(document.documentElement, {
      attributes: true,
      attributeFilter: ["class"],
    });

    // Helper to get CSS variable value
    const getCSSVar = (variable: string): string => {
      return getComputedStyle(document.documentElement)
        .getPropertyValue(variable)
        .trim();
    };

    // Get theme-reactive colors from CSS variables
    const getThemeColors = () => {
      const primaryColor = getCSSVar("--color-primary");
      const isDarkMode = document.documentElement.classList.contains("dark");

      // Convert HSL to RGBA with opacity
      const hslToRgba = (hsl: string, opacity: number): string => {
        // Parse HSL values
        const match = hsl.match(/hsl\((\d+),\s*(\d+)%,\s*(\d+)%\)/);
        if (!match) {
          // Fallback colors
          return isDarkMode
            ? `rgba(147, 197, 253, ${opacity})`
            : `rgba(59, 130, 246, ${opacity})`;
        }

        const h = parseInt(match[1]);
        const s = parseInt(match[2]) / 100;
        const l = parseInt(match[3]) / 100;

        const c = (1 - Math.abs(2 * l - 1)) * s;
        const x = c * (1 - Math.abs(((h / 60) % 2) - 1));
        const m = l - c / 2;

        let r = 0,
          g = 0,
          b = 0;

        if (h >= 0 && h < 60) {
          r = c;
          g = x;
          b = 0;
        } else if (h >= 60 && h < 120) {
          r = x;
          g = c;
          b = 0;
        } else if (h >= 120 && h < 180) {
          r = 0;
          g = c;
          b = x;
        } else if (h >= 180 && h < 240) {
          r = 0;
          g = x;
          b = c;
        } else if (h >= 240 && h < 300) {
          r = x;
          g = 0;
          b = c;
        } else if (h >= 300 && h < 360) {
          r = c;
          g = 0;
          b = x;
        }

        r = Math.round((r + m) * 255);
        g = Math.round((g + m) * 255);
        b = Math.round((b + m) * 255);

        return `rgba(${r}, ${g}, ${b}, ${opacity})`;
      };

      return {
        particleColor: hslToRgba(primaryColor, isDarkMode ? 0.5 : 0.6),
        lineColor: hslToRgba(primaryColor, isDarkMode ? 0.2 : 0.25),
        glowColor: hslToRgba(primaryColor, isDarkMode ? 0.25 : 0.3),
      };
    };

    // Set canvas size
    const resizeCanvas = () => {
      canvas.width = window.innerWidth;
      canvas.height = window.innerHeight;
    };
    resizeCanvas();
    window.addEventListener("resize", resizeCanvas);

    // Mouse move handler
    const handleMouseMove = (e: MouseEvent) => {
      targetRef.current = {
        x: e.clientX,
        y: e.clientY,
      };
    };
    window.addEventListener("mousemove", handleMouseMove);

    // Particles
    const particles: Array<{
      x: number;
      y: number;
      vx: number;
      vy: number;
      size: number;
    }> = [];

    // Initialize particles
    const particleCount = 50;
    for (let i = 0; i < particleCount; i++) {
      particles.push({
        x: Math.random() * canvas.width,
        y: Math.random() * canvas.height,
        vx: (Math.random() - 0.5) * 0.5,
        vy: (Math.random() - 0.5) * 0.5,
        size: Math.random() * 2 + 1,
      });
    }

    // Animation loop
    let animationId: number;
    const animate = () => {
      ctx.clearRect(0, 0, canvas.width, canvas.height);

      // Smoothly interpolate mouse position
      mouseRef.current.x += (targetRef.current.x - mouseRef.current.x) * 0.1;
      mouseRef.current.y += (targetRef.current.y - mouseRef.current.y) * 0.1;

      // Get theme-reactive colors
      const colors = getThemeColors();

      // Update and draw particles
      particles.forEach((particle, i) => {
        // Mouse interaction
        const dx = mouseRef.current.x - particle.x;
        const dy = mouseRef.current.y - particle.y;
        const distance = Math.sqrt(dx * dx + dy * dy);
        const maxDistance = 200;

        if (distance < maxDistance) {
          const force = (maxDistance - distance) / maxDistance;
          particle.vx -= (dx / distance) * force * 0.2;
          particle.vy -= (dy / distance) * force * 0.2;
        }

        // Apply velocity
        particle.x += particle.vx;
        particle.y += particle.vy;

        // Damping
        particle.vx *= 0.95;
        particle.vy *= 0.95;

        // Wrap around edges
        if (particle.x < 0) particle.x = canvas.width;
        if (particle.x > canvas.width) particle.x = 0;
        if (particle.y < 0) particle.y = canvas.height;
        if (particle.y > canvas.height) particle.y = 0;

        // Draw particle
        ctx.beginPath();
        ctx.arc(particle.x, particle.y, particle.size, 0, Math.PI * 2);
        ctx.fillStyle = colors.particleColor;
        ctx.fill();

        // Draw connections
        particles.slice(i + 1).forEach((otherParticle) => {
          const dx = particle.x - otherParticle.x;
          const dy = particle.y - otherParticle.y;
          const distance = Math.sqrt(dx * dx + dy * dy);

          if (distance < 120) {
            ctx.beginPath();
            ctx.moveTo(particle.x, particle.y);
            ctx.lineTo(otherParticle.x, otherParticle.y);
            ctx.strokeStyle = colors.lineColor;
            ctx.lineWidth = 1;
            ctx.stroke();
          }
        });
      });

      // Draw subtle glow around mouse
      const gradient = ctx.createRadialGradient(
        mouseRef.current.x,
        mouseRef.current.y,
        0,
        mouseRef.current.x,
        mouseRef.current.y,
        150
      );
      gradient.addColorStop(0, colors.glowColor);
      gradient.addColorStop(1, "rgba(0, 0, 0, 0)");
      ctx.fillStyle = gradient;
      ctx.fillRect(0, 0, canvas.width, canvas.height);

      animationId = requestAnimationFrame(animate);
    };
    animate();

    // Cleanup
    return () => {
      window.removeEventListener("resize", resizeCanvas);
      window.removeEventListener("mousemove", handleMouseMove);
      themeObserver.disconnect();
      cancelAnimationFrame(animationId);
    };
  }, []);

  return (
    <canvas
      ref={canvasRef}
      className="fixed inset-0 pointer-events-none z-0"
      style={{ opacity: isDark ? 0.6 : 0.8 }}
    />
  );
}
