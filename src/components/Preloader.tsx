"use client";

import React, { useEffect, useRef } from 'react';
import { gsap } from 'gsap';

interface PreloaderProps {
  progress: number;
  isLoaded: boolean;
}

const Preloader: React.FC<PreloaderProps> = ({ progress, isLoaded }) => {
  const containerRef = useRef<HTMLDivElement>(null);
  const barRef = useRef<HTMLDivElement>(null);
  const logoRef = useRef<HTMLImageElement>(null);

  useEffect(() => {
    // Animate progress bar filling
    gsap.to(barRef.current, {
      width: `${progress}%`,
      duration: 0.3,
      ease: "power1.out"
    });
  }, [progress]);

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

        tl.to([logoRef.current, barRef.current], {
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
          className="h-16 md:h-24 w-auto mb-8 animate-pulse-slow"
        />
        
        <div className="w-full h-1 bg-white/10 rounded-full overflow-hidden">
          <div 
            ref={barRef}
            className="h-full bg-accent shadow-[0_0_15px_rgba(254,65,0,0.5)]"
            style={{ width: '0%' }}
          />
        </div>
        
        <div className="mt-4 font-display text-[10px] md:text-xs tracking-[0.3em] uppercase text-white/40">
          Wird geladen — {Math.round(progress)}%
        </div>
      </div>
    </div>
  );
};

export default Preloader;