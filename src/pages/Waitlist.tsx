import { useRef, useEffect } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft } from 'lucide-react';
import { Link } from 'react-router-dom';
import { WaitlistForm } from '@/components/WaitlistForm';

export default function Waitlist() {
  const containerRef = useRef<HTMLDivElement>(null);
  const cardRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const ctx = gsap.context(() => {
      gsap.from(cardRef.current, {
        y: 40,
        opacity: 0,
        duration: 0.8,
        ease: 'power3.out',
      });
    }, containerRef);
    return () => ctx.revert();
  }, []);

  return (
    <div 
      ref={containerRef}
      className="min-h-[100svh] w-full bg-primary flex flex-col items-center justify-center p-6 relative overflow-hidden"
    >
      {/* Background elements */}
      <div className="absolute top-[-10%] left-[-5%] w-[40%] h-[40%] bg-accent/10 blur-[120px] rounded-full pointer-events-none" />
      <div className="absolute bottom-[-10%] right-[-5%] w-[40%] h-[40%] bg-blue-500/10 blur-[120px] rounded-full pointer-events-none" />
      
      {/* Back button */}
      <Link 
        to="/" 
        className="absolute top-8 left-8 flex items-center gap-2 text-white/40 hover:text-white transition-colors group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-1 transition-transform" />
        <span className="text-sm font-medium">Zurück</span>
      </Link>

      <div ref={cardRef} className="w-full max-w-xl z-10">
        <div className="text-center mb-10 space-y-4">
          <div className="inline-block">
            <img src="/assets/logo.png" alt="AKRIA" className="h-16 w-auto mb-6" />
          </div>
          <h1 className="text-4xl md:text-5xl font-serif italic font-bold text-white leading-tight">
            Warteliste
          </h1>
          <p className="text-white/60 text-lg md:text-xl font-light leading-relaxed max-w-md mx-auto">
            Trag dich ein und sichere dir ein Öl aus der Ernte 2026! 
            Die Plätze sind begrenzt, da die Ernte in der Mani jedes Jahr limitiert ist.
          </p>
        </div>

        <div className="glass-card p-8 md:p-12 border border-white/10 shadow-2xl">
          <WaitlistForm />
        </div>

        <div className="mt-12 text-center">
          <p className="text-white/30 text-xs">
            © 2026 AKRIA. Sicherer Datentransfer. Deine Daten werden nicht an Dritte weitergegeben.
          </p>
        </div>
      </div>
    </div>
  );
}
