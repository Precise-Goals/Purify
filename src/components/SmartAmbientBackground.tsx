"use client";

import React, { useEffect, useRef } from "react";

/**
 * Scroll-reactive, GPU-composited ambient gradient layer.
 * Renders subtle low-opacity warm orange liquid-glass washes with parallax drift
 * and subtle pointer response so gradients flow dynamically while scrolling.
 */
export const SmartAmbientBackground: React.FC = () => {
  const layerOneRef = useRef<HTMLDivElement>(null);
  const layerTwoRef = useRef<HTMLDivElement>(null);
  const layerAuraRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (typeof window === "undefined") return;

    const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (motionQuery.matches) return;

    let rafId = 0;
    let targetScroll = 0;
    let currentScroll = 0;
    let targetPtrX = 0.5;
    let targetPtrY = 0.3;
    let currentPtrX = 0.5;
    let currentPtrY = 0.3;
    const startTime = performance.now();

    const updateScrollTarget = () => {
      const maxScroll = Math.max(
        1,
        document.documentElement.scrollHeight - window.innerHeight
      );
      targetScroll = Math.min(1, Math.max(0, window.scrollY / maxScroll));
    };

    const handlePointerMove = (e: PointerEvent) => {
      targetPtrX = e.clientX / Math.max(1, window.innerWidth);
      targetPtrY = e.clientY / Math.max(1, window.innerHeight);
    };

    updateScrollTarget();
    window.addEventListener("scroll", updateScrollTarget, { passive: true });
    window.addEventListener("resize", updateScrollTarget, { passive: true });
    window.addEventListener("pointermove", handlePointerMove, { passive: true });

    const tick = (now: number) => {
      if (!document.hidden) {
        // Smooth damping prevents jarring jumps during fast wheel scrolls
        currentScroll += (targetScroll - currentScroll) * 0.06;
        currentPtrX += (targetPtrX - currentPtrX) * 0.04;
        currentPtrY += (targetPtrY - currentPtrY) * 0.04;

        const t = (now - startTime) * 0.00024;
        const pxOffset = (currentPtrX - 0.5) * 8;
        const pyOffset = (currentPtrY - 0.5) * 6;

        if (layerOneRef.current) {
          const x1 = Math.sin(t) * 5 + currentScroll * 8 + pxOffset * 0.4;
          const y1 = Math.cos(t * 0.8) * 4 - currentScroll * 20 + pyOffset * 0.3;
          const rot1 = currentScroll * 16 + Math.sin(t * 0.6) * 5;
          const scale1 = 1 + Math.sin(t * 0.5) * 0.04 + currentScroll * 0.08;
          layerOneRef.current.style.transform = `translate3d(${x1.toFixed(2)}vw, ${y1.toFixed(2)}vh, 0) rotate(${rot1.toFixed(2)}deg) scale(${scale1.toFixed(4)})`;
          layerOneRef.current.style.opacity = `${(0.88 - currentScroll * 0.25).toFixed(3)}`;
        }

        if (layerTwoRef.current) {
          const x2 = Math.cos(t * 0.9) * 6 - currentScroll * 12 - pxOffset * 0.35;
          const y2 = Math.sin(t * 0.7) * 4 + (currentScroll - 0.5) * 24 - pyOffset * 0.25;
          const rot2 = -currentScroll * 20 + Math.cos(t * 0.5) * 6;
          layerTwoRef.current.style.transform = `translate3d(${x2.toFixed(2)}vw, ${y2.toFixed(2)}vh, 0) rotate(${rot2.toFixed(2)}deg)`;
          layerTwoRef.current.style.opacity = `${(0.62 + Math.sin(currentScroll * Math.PI) * 0.26).toFixed(3)}`;
        }

        if (layerAuraRef.current) {
          const x3 = (currentPtrX - 0.5) * 16 + Math.sin(t * 1.1) * 5;
          const y3 = (currentPtrY - 0.5) * 12 + currentScroll * 14;
          const scale3 = 1 + Math.cos(t * 0.75) * 0.06;
          layerAuraRef.current.style.transform = `translate3d(${x3.toFixed(2)}vw, ${y3.toFixed(2)}vh, 0) scale(${scale3.toFixed(4)})`;
        }
      }

      rafId = window.requestAnimationFrame(tick);
    };

    rafId = window.requestAnimationFrame(tick);

    return () => {
      window.cancelAnimationFrame(rafId);
      window.removeEventListener("scroll", updateScrollTarget);
      window.removeEventListener("resize", updateScrollTarget);
      window.removeEventListener("pointermove", handlePointerMove);
    };
  }, []);

  return (
    <div className="ambient-liquid-container" aria-hidden="true">
      <div className="ambient-liquid-base" />
      <div ref={layerOneRef} className="smart-mesh-layer smart-mesh-one" />
      <div ref={layerTwoRef} className="smart-mesh-layer smart-mesh-two" />
      <div ref={layerAuraRef} className="smart-mesh-layer smart-mesh-aura" />
      <div className="ambient-bg-noise" />
    </div>
  );
};
