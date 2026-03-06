"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PreloaderProps {
  isLoaded: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ isLoaded }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    if (isLoaded) {
      const ctx = gsap.context(() => {
        const tl = gsap.timeline({
          onComplete: () => {
            if (containerRef.current) {
              containerRef.current.style.display = 'none';
            }
          }
        });

        tl.to(logoRef.current, {
          opacity: 0,
          y: -20,
          duration: 0.6,
          ease: "power3.in"
        })
        .to(containerRef.current, {
          opacity: 0,
          duration: 0.8,
          ease: "power4.inOut"
        });
      }, containerRef);

      return () => ctx.revert();
    }
  }, [isLoaded]);

  return (
    <div 
      ref={containerRef}
      className="fixed inset-0 z-[9999] bg-primary flex flex-col items-center justify-center p-6"
    >
      <div className="relative w-full max-w-xs md:max-w-md flex flex-col items-center">
        <img 
          ref={logoRef}
          src="/assets/logo.png" 
          alt="AKRIA" 
          className="h-16 md:h-24 w-auto animate-pulse-slow"
        />
        
        <div className="mt-8 font-display text-[10px] md:text-xs tracking-[0.4em] uppercase text-white/30 animate-pulse">
          Mani — Griechenland
        </div>
      </div>
    </div>
  );
};

export default Preloader;