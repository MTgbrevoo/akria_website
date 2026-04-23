"use client";

import React, { useEffect, useRef, useState, useMemo } from 'react';
import { gsap } from 'gsap';
import { ArrowLeft, ArrowRight, CheckCircle2, Loader2, Check } from 'lucide-react';
import { Link } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';
import { getStoredTrackingData } from '../hooks/useSourceTracking';

/* ═══════════════════════════════════════════════════════════
   NOISE OVERLAY — SVG turbulence for texture
   ═══════════════════════════════════════════════════════════ */
function NoiseOverlay() {
    return (
        <svg className="noise-overlay absolute inset-0 w-full h-full pointer-events-none opacity-[0.03] md:opacity-[0.05]" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
    )
}

export default function Waitlist() {
    const containerRef = useRef<HTMLDivElement>(null);
    const cardRef = useRef<HTMLDivElement>(null);
    const rightPathRef = useRef<SVGPathElement>(null);
    const leftPathRef = useRef<SVGPathElement>(null);
    
    const [dimensions, setDimensions] = useState({ w: 0, h: 0 });
    const [status, setStatus] = useState<'idle' | 'loading' | 'success' | 'error'>('idle');
    const [errorMessage, setErrorMessage] = useState('');
    const [marketingConsent, setMarketingConsent] = useState(false);
    
    const [formData, setFormData] = useState({
        firstname: '',
        lastname: '',
        email: '',
        location: '',
        notes: ''
    });

    // Calculate form progress (0 to 1)
    const progress = useMemo(() => {
        const requiredFields = [
            formData.firstname.trim().length > 0,
            formData.lastname.trim().length > 0,
            formData.email.trim().length > 3 && formData.email.includes('@'),
            formData.location.trim().length > 0,
            marketingConsent === true
        ];
        const filledCount = requiredFields.filter(Boolean).length;
        return filledCount / requiredFields.length;
    }, [formData, marketingConsent]);

    // Intro Animations
    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.waitlist-card', {
                y: 40,
                opacity: 0,
                duration: 1.2,
                ease: 'power3.out',
                delay: 0.2
            });
            
            gsap.from('.waitlist-element', {
                y: 20,
                opacity: 0,
                stagger: 0.1,
                duration: 0.8,
                ease: 'power3.out',
                delay: 0.5
            });
        }, containerRef);
        return () => ctx.revert();
    }, []);

    // Track precise pixel dimensions of the card for pixel-perfect SVG path mapping
    useEffect(() => {
        if (!cardRef.current) return;
        const observer = new ResizeObserver(() => {
            if (cardRef.current) {
                setDimensions({ 
                    w: cardRef.current.offsetWidth, 
                    h: cardRef.current.offsetHeight 
                });
            }
        });
        observer.observe(cardRef.current);
        return () => observer.disconnect();
    }, []);

    // Animate the split border progress precisely based on pixel length
    useEffect(() => {
        const paths = [rightPathRef.current, leftPathRef.current];
        if (dimensions.w === 0 || dimensions.h === 0) return;

        paths.forEach(path => {
            if (!path) return;
            const length = path.getTotalLength();
            
            // Add slight buffer to dasharray to prevent sub-pixel gaps
            gsap.set(path, { strokeDasharray: length + 2 });
            
            // If progress is 100%, force offset exactly to 0 for a perfect meet
            const targetOffset = progress === 1 ? 0 : length * (1 - progress);
            
            gsap.to(path, {
                strokeDashoffset: targetOffset,
                duration: progress === 1 ? 1.5 : 1.2,
                ease: progress === 1 ? 'power3.inOut' : 'power2.out',
                opacity: progress > 0 ? 1 : 0
            });
        });
    }, [progress, dimensions]); 

    const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
        setFormData(prev => ({ ...prev, [e.target.name]: e.target.value }));
    };

    const handleSubmit = async (e: React.FormEvent) => {
        e.preventDefault();
        
        if (!marketingConsent) {
            setStatus('error');
            setErrorMessage('Bitte stimme dem Newsletter-Empfang zu, um dich auf die Warteliste zu setzen.');
            return;
        }

        setStatus('loading');
        setErrorMessage('');

        const trackingData = getStoredTrackingData();

        try {
            const { error } = await supabase.auth.signInWithOtp({
                email: formData.email,
                options: {
                    emailRedirectTo: `${window.location.origin}/success`,
                    data: {
                        firstname: formData.firstname,
                        lastname: formData.lastname,
                        location: formData.location,
                        notes: formData.notes,
                        marketing_consent: marketingConsent,
                        acquisition_source_code: trackingData?.src || null,
                        acquisition_source_type: trackingData?.trigger || null,
                        source_captured_at: trackingData?.capturedAt || null
                    }
                }
            });

            if (error) throw error;

            setStatus('success');
            gsap.from('.success-message', {
                scale: 0.9,
                opacity: 0,
                duration: 0.5,
                ease: 'back.out(1.7)'
            });
        } catch (err: any) {
            console.error('Waitlist submission error:', err);
            setStatus('error');
            setErrorMessage(err.message || 'Etwas ist schief gelaufen. Bitte versuche es später erneut.');
        }
    };

    // Calculate exact SVG paths to match Tailwind rounded-[2.5rem] exactly (40px)
    const strokeWidth = 4;
    const inset = strokeWidth / 2; // Offset to perfectly center the stroke inside the border-box
    const outerRadius = 40; // 2.5rem
    const r = outerRadius - inset; // Inner radius for the path to perfectly parallel the CSS border
    
    const w = dimensions.w;
    const h = dimensions.h;
    const ew = w - inset;
    const eh = h - inset;

    let rightPathD = "";
    let leftPathD = "";

    if (w > 0 && h > 0) {
        // Top Center -> Right Edge -> Bottom Right Corner -> Bottom Center
        rightPathD = `M ${w/2},${inset} L ${ew - r},${inset} A ${r},${r} 0 0 1 ${ew},${inset + r} L ${ew},${eh - r} A ${r},${r} 0 0 1 ${ew - r},${eh} L ${w/2},${eh}`;
        // Top Center -> Left Edge -> Bottom Left Corner -> Bottom Center
        leftPathD = `M ${w/2},${inset} L ${inset + r},${inset} A ${r},${r} 0 0 0 ${inset},${inset + r} L ${inset},${eh - r} A ${r},${r} 0 0 0 ${inset + r},${eh} L ${w/2},${eh}`;
    }

    return (
        <div ref={containerRef} className="min-h-[100svh] w-full bg-primary relative flex items-center justify-center p-6 overflow-hidden">
            <NoiseOverlay />
            
            <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full relative z-10">
                <Link to="/" className="inline-flex items-center text-white/60 hover:text-white mb-8 transition-colors group">
                    <ArrowLeft className="mr-2 w-4 h-4 group-hover:-translate-x-1 transition-transform" />
                    Zurück zur Startseite
                </Link>

                <div ref={cardRef} className="waitlist-card glass-card p-8 md:p-12 rounded-[2.5rem] border border-white/10 shadow-2xl relative">
                    {/* Progressive Split Border Overlay (Pixel Perfect mapping, absolute position shifted by -1px to cover border) */}
                    {status !== 'success' && w > 0 && (
                        <svg 
                            className="absolute pointer-events-none z-50 overflow-visible" 
                            style={{ top: -1, left: -1, width: w, height: h }}
                            viewBox={`0 0 ${w} ${h}`}
                        >
                            <defs>
                                <filter id="glow-bold" x="-50%" y="-50%" width="200%" height="200%">
                                    <feGaussianBlur stdDeviation="3" result="coloredBlur" />
                                    <feMerge>
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="coloredBlur" />
                                        <feMergeNode in="SourceGraphic" />
                                    </feMerge>
                                </filter>
                            </defs>
                            
                            {/* Right Progress Line */}
                            <path
                                ref={rightPathRef}
                                d={rightPathD}
                                fill="none"
                                stroke="#fe4100"
                                strokeWidth={strokeWidth}
                                filter="url(#glow-bold)"
                                style={{ strokeLinecap: 'round' }}
                            />
                            
                            {/* Left Progress Line */}
                            <path
                                ref={leftPathRef}
                                d={leftPathD}
                                fill="none"
                                stroke="#fe4100"
                                strokeWidth={strokeWidth}
                                filter="url(#glow-bold)"
                                style={{ strokeLinecap: 'round' }}
                            />
                        </svg>
                    )}

                    {status === 'success' ? (
                        <div className="success-message text-center py-12">
                            <div className="flex justify-center mb-6">
                                <CheckCircle2 className="w-20 h-20 text-accent" />
                            </div>
                            <h2 className="font-serif italic font-bold text-3xl md:text-4xl text-white mb-4">
                                Bitte überprüfe deine E-Mails!
                            </h2>
                            <p className="text-white/70 text-lg mb-8 max-w-md mx-auto">
                                Wir haben dir einen Bestätigungslink gesendet. Bitte klicke auf den Link in der E-Mail, um deine Anmeldung zur Ernte 2026 abzuschließen.
                            </p>
                            <Link to="/" className="btn-magnetic btn-accent py-3 px-10 inline-flex items-center">
                                Zurück zur Übersicht
                            </Link>
                        </div>
                    ) : (
                        <>
                            <div className="waitlist-element mb-8">
                                <p className="font-display text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-2">
                                    Ernte 2026 / 2027
                                </p>
                                <h1 className="font-serif italic font-bold text-3xl md:text-4xl lg:text-5xl text-white leading-tight mb-4">
                                    Sicher dir deinen Platz.
                                </h1>
                                <p className="text-white/60 text-sm md:text-base leading-relaxed">
                                    Völlig unverbindlich. Du entscheidest erst zur Erntezeit im Herbst, ob du bestellen möchtest.
                                </p>
                            </div>

                            <form onSubmit={handleSubmit} className="space-y-6">
                                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                                    <div className="waitlist-element">
                                        <label htmlFor="firstname" className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2 ml-1">
                                            Vorname
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            id="firstname"
                                            name="firstname"
                                            value={formData.firstname}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all relative z-10"
                                            placeholder=""
                                        />
                                    </div>
                                    <div className="waitlist-element">
                                        <label htmlFor="lastname" className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2 ml-1">
                                            Nachname
                                        </label>
                                        <input
                                            required
                                            type="text"
                                            id="lastname"
                                            name="lastname"
                                            value={formData.lastname}
                                            onChange={handleChange}
                                            className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all relative z-10"
                                            placeholder=""
                                        />
                                    </div>
                                </div>

                                <div className="waitlist-element">
                                    <label htmlFor="email" className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2 ml-1">
                                        E-Mail Adresse
                                    </label>
                                    <input
                                        required
                                        type="email"
                                        id="email"
                                        name="email"
                                        value={formData.email}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all relative z-10"
                                        placeholder=""
                                    />
                                </div>

                                <div className="waitlist-element">
                                    <label htmlFor="location" className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2 ml-1">
                                        Wohnort
                                    </label>
                                    <input
                                        required
                                        type="text"
                                        id="location"
                                        name="location"
                                        value={formData.location}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all relative z-10"
                                        placeholder=""
                                    />
                                </div>

                                <div className="waitlist-element">
                                    <label htmlFor="notes" className="block text-xs font-semibold uppercase tracking-widest text-white/50 mb-2 ml-1">
                                        Anmerkungen (Optional)
                                    </label>
                                    <textarea
                                        id="notes"
                                        name="notes"
                                        rows={3}
                                        value={formData.notes}
                                        onChange={handleChange}
                                        className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:outline-none focus:ring-2 focus:ring-accent focus:border-accent transition-all resize-none relative z-10"
                                        placeholder="Was würdest Du gerne von uns sehen? Oder lass einfach Grüße da! :)"
                                    />
                                </div>

                                {status === 'error' && (
                                    <div className="waitlist-element p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-sm relative z-10">
                                        {errorMessage}
                                    </div>
                                )}

                                <label htmlFor="marketingConsent" className="waitlist-element flex items-start gap-4 mt-6 mb-8 cursor-pointer group relative z-10">
                                    <div className="relative flex items-center justify-center mt-1 shrink-0">
                                        <input
                                            id="marketingConsent"
                                            name="marketingConsent"
                                            type="checkbox"
                                            checked={marketingConsent}
                                            onChange={(e) => setMarketingConsent(e.target.checked)}
                                            className="sr-only"
                                            required
                                        />
                                        <div className={`w-6 h-6 rounded-md border flex items-center justify-center transition-all duration-300 ${marketingConsent ? 'bg-accent border-accent shadow-[0_0_10px_rgba(254,65,0,0.4)]' : 'bg-white/5 border-white/20 group-hover:border-white/40'}`}>
                                            <Check className={`w-4 h-4 text-white transition-transform duration-300 ${marketingConsent ? 'scale-100' : 'scale-0'}`} strokeWidth={3} />
                                        </div>
                                    </div>
                                    <div className="text-sm flex-1">
                                        <span className="font-medium text-white/90 text-base group-hover:text-white transition-colors">
                                            Ich stimme zu, kontaktiert zu werden.
                                        </span>
                                        <p className="text-white/50 text-xs mt-1.5 leading-relaxed">
                                            Ich möchte zur Ernte und allen weiteren relevanten Informationen benachrichtigt werden und willige in die Verarbeitung meiner Daten gemäß der Datenschutzerklärung ein.
                                        </p>
                                    </div>
                                </label>

                                <div className="waitlist-element pt-2 relative z-10">
                                    <button
                                        disabled={status === 'loading'}
                                        type="submit"
                                        className="w-full btn-magnetic btn-accent py-4 text-lg shadow-[0_0_30px_rgba(254,65,0,0.3)] disabled:opacity-50 disabled:cursor-not-allowed group"
                                    >
                                        {status === 'loading' ? (
                                            <>
                                                <Loader2 className="mr-2 w-5 h-5 animate-spin" />
                                                Wird gesendet...
                                            </>
                                        ) : (
                                            <>
                                                Auf die Gästeliste
                                                <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                            </>
                                        )}
                                    </button>
                                </div>
                            </form>
                        </>
                    )}
                </div>
            </div>
        </div>
    );
}