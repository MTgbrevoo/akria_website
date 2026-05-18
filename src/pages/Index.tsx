"use client";

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, X } from 'lucide-react'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════
   SUPABASE ASSET HELPER
   ═══════════════════════════════════════════════════════════ */
const getSupabaseAssetUrl = (folder: string, filename: string) => {
    const baseUrl = "https://khizcgryvscakouefofc.supabase.co/storage/v1/object/public/Website%20Assets";
    return `${baseUrl}/${folder}/${encodeURIComponent(filename)}`;
};

/* ═══════════════════════════════════════════════════════════
   NOISE OVERLAY — SVG turbulence for texture
   ═══════════════════════════════════════════════════════════ */
function NoiseOverlay() {
    return (
        <svg className="noise-overlay hidden md:block" aria-hidden="true" xmlns="http://www.w3.org/2000/svg">
            <filter id="noiseFilter">
                <feTurbulence type="fractalNoise" baseFrequency="0.65" numOctaves="3" stitchTiles="stitch" />
            </filter>
            <rect width="100%" height="100%" filter="url(#noiseFilter)" />
        </svg>
    )
}

/* ═══════════════════════════════════════════════════════════
   HERO — The Opening Shot
   ═══════════════════════════════════════════════════════════ */
function Hero() {
    const heroRef = useRef<HTMLElement>(null)
    const textRef = useRef<HTMLDivElement>(null)
    const sunRef = useRef<HTMLDivElement>(null)
    const ctaRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const video = heroRef.current?.querySelector('video')

        const ctx = gsap.context(() => {
            // 1. Initial Intro
            const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            
            gsap.set(['.hero-line-1', '.hero-line-2', '.hero-line-3', '.hero-line-4', ctaRef.current], {
                opacity: 0,
                y: 40
            })

            introTl.to('.hero-logo', { scale: 1, opacity: 1, duration: 1.2, delay: 0.3 })
                   .to(['.hero-line-2', '.hero-line-3', '.hero-line-4'], { opacity: 1, y: 0, stagger: 0.1, duration: 1 }, "-=0.5")
                   .to('.hero-line-1', { opacity: 1, y: 0, duration: 0.8 }, "-=0.8")
                   .to(ctaRef.current, { y: 0, opacity: 1, duration: 1 }, "-=0.8")

            if (sunRef.current) {
                gsap.to(sunRef.current, {
                    scale: 1.1,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                })
            }

            // 2. Main Hero Scroll (Video scrubbing)
            ScrollTrigger.create({
                trigger: heroRef.current,
                start: 'top top',
                end: '+=200%', 
                pin: true,
                scrub: true, 
                anticipatePin: 1,
                onUpdate: (self) => {
                    if (video && video.duration) {
                        video.currentTime = video.duration * self.progress
                    }
                }
            })

            // 3. CTA TRANSFORMATION (From bottom-left to top-right sticky)
            const isMobile = window.innerWidth < 768;
            
            const ctaTl = gsap.timeline({
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: '+=80%',
                    scrub: 1.2,
                }
            })

            ctaTl.to(ctaRef.current, {
                position: 'fixed',
                top: isMobile ? '1.5rem' : '2.5rem',
                right: isMobile ? '1.5rem' : '4rem',
                left: 'auto',
                bottom: 'auto',
                x: 0,
                y: 0,
                scale: isMobile ? 0.75 : 0.85,
                zIndex: 100,
                boxShadow: '0 10px 40px rgba(254, 65, 0, 0.4)',
                padding: isMobile ? '0.7rem 1.4rem' : '1rem 2rem',
                ease: 'power2.inOut'
            })

            // 4. Hide CTA at the very end (Waitlist)
            ScrollTrigger.create({
                trigger: "#waitlist",
                start: "top center",
                onEnter: () => gsap.to(ctaRef.current, { autoAlpha: 0, scale: 0.5, duration: 0.4 }),
                onLeaveBack: () => gsap.to(ctaRef.current, { autoAlpha: 1, scale: isMobile ? 0.75 : 0.85, duration: 0.4 })
            });

        }, heroRef)

        if (video) {
            video.addEventListener('loadedmetadata', () => {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                }).catch(() => {});
            }, { once: true });
        }
        return () => ctx.revert();
    }, [])

    return (
        <section ref={heroRef} className="relative h-[100svh] w-full bg-primary" id="hero">
            <div className="hero-video-wrap absolute inset-0 w-full h-full overflow-hidden">
                <video autoPlay muted playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
                    <source src="/assets/hero-drone.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Logo — Top Left */}
            <div className="hero-logo absolute top-8 left-8 md:top-12 md:left-12 z-30 opacity-0 scale-90 transition-transform hover:scale-105">
                <img src="/assets/logo.png" alt="AKRIA" className="h-12 md:h-20 w-auto" />
            </div>

            {/* Sun Illustration — Top Right */}
            <div ref={sunRef} className="absolute top-12 right-12 md:top-20 md:right-20 w-20 md:w-32 z-30 pointer-events-none">
                <img src={getSupabaseAssetUrl('Illustrations', 'sun.png')} alt="" className="w-full h-auto" />
            </div>

            {/* Hero Content — Pushed to Bottom Left */}
            <div ref={textRef} className="absolute inset-0 flex flex-col justify-end z-20 px-8 pb-16 md:px-24 md:pb-32 text-left">
                <div className="max-w-4xl">
                    <p className="hero-line-1 font-display text-sm md:text-lg font-bold tracking-[0.25em] uppercase text-white mb-4 drop-shadow-lg">
                        Extra Natives Olivenöl aus der Mani
                    </p>
                    <h1 className="mb-8 md:mb-12">
                        <span className="hero-line-2 block font-display font-800 text-6xl md:text-7xl lg:text-[6rem] tracking-tight text-white leading-none">
                            Höchste
                        </span>
                        <span className="hero-line-3 block font-serif italic font-900 text-7xl md:text-9xl lg:text-[11rem] tracking-tight text-accent leading-[0.8] mt-2">
                            Stufe.
                        </span>
                    </h1>
                    
                    {/* The CTA — Initially here, then fixed */}
                    <div ref={ctaRef} className="hero-cta-container relative inline-block">
                        <Link to="/waitlist" className="btn-magnetic btn-accent text-lg py-4 px-12 block whitespace-nowrap shadow-[0_0_30px_rgba(254,65,0,0.3)]">
                            Jetzt sichern
                            <ArrowRight className="ml-3 w-6 h-6 inline-block transition-transform group-hover:translate-x-1" />
                        </Link>
                    </div>

                    <div className="hero-scroll-hint mt-12 flex items-center gap-4 text-white/40 animate-pulse">
                        <ChevronDown className="w-5 h-5" />
                        <span className="text-xs tracking-widest uppercase">Scroll zum Entdecken</span>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   CLAIM SET 1 — Sequential scroll reveals + Oil Video
   ═══════════════════════════════════════════════════════════ */
function ClaimSet1() {
    const sectionRef = useRef<HTMLElement>(null)
    const claims = [
        {
            title: '300 Sonnentage / Jahr',
            desc: 'In der Mani scheint fast immer die Sonne. Das gibt unseren Oliven die nötige Energie für den perfekten Geschmack.',
        },
        {
            title: 'Berge & Meer',
            desc: 'Die steilen Berge der Mani fallen direkt ins Meer. Diese mineralischen Böden schmeckst du in jedem Tropfen.',
        },
        {
            title: 'Weltklasse Qualität',
            desc: 'Wir ernten früh und pressen sofort. Das Ergebnis ist ein Öl mit extrem niedriger Säure und maximalem Aroma.',
        },
        {
            title: 'Direkt zu dir',
            desc: 'Keine Zwischenhändler, kein langes Lagern. Vom Baum direkt in deine Küche – frischer geht es nicht.',
        },
    ]

    useEffect(() => {
        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 1024;
            claims.forEach((_, i) => {
                gsap.set(`.claim-card-${i}`, { opacity: 0, y: 40 })
                if (i < claims.length - 1) {
                    gsap.set(`.claim-arrow-${i}`, { opacity: 0, strokeDashoffset: 200 })
                }
            })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: `+=${claims.length * 80}%`,
                    pin: true,
                    scrub: 1.5,
                    anticipatePin: 1,
                },
            })

            claims.forEach((_, i) => {
                const startTime = i * 1.5
                tl.to(`.claim-card-${i}`, { opacity: 1, y: 0, duration: 1, ease: 'power2.out' }, startTime)

                if (i < claims.length - 1) {
                    tl.to(`.claim-arrow-${i}`, { opacity: 1, strokeDashoffset: 0, duration: 0.6, ease: 'power2.inOut' }, startTime + 0.8)
                }
            })

            const video = sectionRef.current?.querySelector('video')
            if (video) video.play().catch(() => { })
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} id="herkunft" className="relative min-h-[100svh] w-full bg-primary overflow-hidden py-24 md:py-32">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-16 flex flex-col h-full">
                <h2 className="font-display text-3xl md:text-5xl font-bold mb-16 text-white leading-tight max-w-4xl">
                    Was <span className="font-serif italic text-accent">AKRIA</span> so besonders macht.
                </h2>
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-16 items-center flex-1">
                    <div className="relative flex flex-col gap-4">
                        {claims.map((claim, i) => (
                            <div key={i} className="relative">
                                <div className={`claim-card-${i} glass-card p-6 md:p-8 flex flex-col gap-2 hover:bg-white/10 transition-colors`}>
                                    <h3 className="font-display font-bold text-xl md:text-2xl text-white">{claim.title}</h3>
                                    <p className="text-white/60 text-sm md:text-base leading-relaxed">{claim.desc}</p>
                                </div>
                                {i < claims.length - 1 && (
                                    <div className="flex justify-center -my-4 relative z-10">
                                        <svg className={`claim-arrow-${i} w-12 h-12 text-accent`} viewBox="0 0 100 100" fill="none">
                                            <path d="M50 10 C 40 35, 60 45, 50 80 M 35 65 C 40 75, 50 85, 50 80 M 65 65 C 60 75, 50 85, 50 80" stroke="currentColor" strokeWidth="4" strokeLinecap="round" strokeLinejoin="round" />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>
                    <div className="relative aspect-[3/4] rounded-[3rem] overflow-hidden shadow-2xl">
                        <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                            <source src={getSupabaseAssetUrl('Vids_Images', 'Oil Flowing From Press.mp4')} type="video/mp4" />
                        </video>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   CLAIM SET 2 — Falling Cards Stacking Effect
   ═══════════════════════════════════════════════════════════ */
function ClaimSet2() {
    const sectionRef = useRef<HTMLElement>(null);
    const cards = [
        { headline: "100% Koroneiki-Oliven", desc: "Die Königin unter den Oliven. Klein, robust und unfassbar intensiv im Geschmack.", bg: "bg-primary", illustration: getSupabaseAssetUrl('Illustrations', 'Olive.png') },
        { headline: "Intensives Aroma", desc: "Gräser, Artischocken und eine leichte Schärfe im Abgang – so schmeckt echte Frische.", bg: "bg-primary", illustration: getSupabaseAssetUrl('Illustrations', 'Aroma.png') },
        { headline: "Voller Gesundmacher", desc: "Extrem hoher Polyphenol-Gehalt für dein Herz und dein Wohlbefinden.", bg: "bg-primary", illustration: getSupabaseAssetUrl('Illustrations', 'Herz.png') }
    ];

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${cards.length * 100}%`,
                    pin: true,
                    scrub: 1,
                }
            });
            cards.forEach((_, i) => {
                if (i === 0) { gsap.set(`.stack-card-0`, { zIndex: 10 }); return; }
                tl.fromTo(`.stack-card-${i}`, { y: "100vh", scale: 1.1 }, { y: "0vh", scale: 1, duration: 1.5, ease: "power2.inOut" }, `card-${i}`);
                for (let j = 0; j < i; j++) {
                    tl.to(`.stack-card-${j}`, { scale: 0.9, filter: "blur(10px)", opacity: 0.5, y: -40, duration: 1.5, ease: "power2.inOut" }, `card-${i}`);
                }
            });
        }, sectionRef);
        return () => ctx.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full h-[100svh] overflow-hidden bg-primary" id="qualitaet">
            <div className="relative w-full h-full flex items-center justify-center">
                {cards.map((card, i) => (
                    <div key={i} className={`stack-card-${i} absolute w-full max-w-5xl px-6 flex items-center justify-center`} style={{ zIndex: 10 + i }}>
                        <div className="w-full glass-card p-12 md:p-20 flex flex-col md:flex-row gap-12 items-center shadow-2xl border-white/5">
                            <div className="flex-1">
                                <h2 className="font-serif italic font-bold text-4xl md:text-7xl text-white mb-6">{card.headline}</h2>
                                <p className="text-white/70 text-lg md:text-xl leading-relaxed">{card.desc}</p>
                            </div>
                            <img src={card.illustration} className="w-40 md:w-64 h-auto object-contain" alt="" />
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════
   IMAGE GALLERY — Horizontal Scroll Carousel
   ═══════════════════════════════════════════════════════════ */
function ImageGallery() {
    const images = [
        getSupabaseAssetUrl('Vids_Images', 'DSCF4045.webp'),
        getSupabaseAssetUrl('Vids_Images', 'DSCF4042.webp'),
        getSupabaseAssetUrl('Vids_Images', 'DSCF4075.webp'),
        getSupabaseAssetUrl('Vids_Images', 'DSCF4085.webp'),
        getSupabaseAssetUrl('Vids_Images', 'DSCF4011.webp'),
        getSupabaseAssetUrl('Vids_Images', 'DSCF3997 (1).webp'),
        getSupabaseAssetUrl('Vids_Images', 'DJI_0340.webp'),
    ]

    return (
        <section className="py-24 bg-primary overflow-hidden">
            <div className="flex overflow-x-auto gap-6 px-12 scrollbar-hide">
                {images.map((src, idx) => (
                    <div key={idx} className="flex-none w-[80vw] md:w-[35vw] aspect-[4/3]">
                        <img src={src} alt="" className="w-full h-full object-cover rounded-[2rem] shadow-xl" loading="lazy" />
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   WAITLIST CTA — Unified Full-Bleed Design
   ═══════════════════════════════════════════════════════════ */
function WaitlistSection() {
    return (
        <section id="waitlist" className="relative min-h-[100svh] flex items-center justify-center bg-primary overflow-hidden">
            <div className="absolute inset-0 w-full h-full z-0">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <video autoPlay muted loop playsInline className="absolute inset-0 w-full h-full object-cover">
                    <source src={getSupabaseAssetUrl('Vids_Images', 'Strand Bus Phoneas.mp4')} type="video/mp4" />
                </video>
            </div>
            <div className="relative z-20 w-full max-w-7xl mx-auto px-8">
                <div className="max-w-2xl text-center md:text-left">
                    <p className="font-display text-sm font-semibold tracking-widest uppercase text-accent mb-4">Ernte 2026 / 2027</p>
                    <h2 className="font-serif italic font-bold text-5xl md:text-8xl text-white mb-8 leading-tight">Gönn dir das Beste.</h2>
                    <Link to="/waitlist" className="btn-magnetic btn-accent py-5 px-16 text-xl shadow-2xl">Jetzt reservieren</Link>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer({ onShowImpressum, onShowDatenschutz }: { onShowImpressum: () => void, onShowDatenschutz: () => void }) {
    return (
        <footer className="bg-[#041e3a] py-20 border-t border-white/5">
            <div className="max-w-7xl mx-auto px-8 grid grid-cols-1 md:grid-cols-4 gap-16">
                <div className="md:col-span-2">
                    <img src="/assets/logo.png" alt="AKRIA" className="h-10 mb-6" />
                    <p className="text-white/40 text-lg leading-relaxed max-w-md">Flüssiges Gold aus der Mani. Wir bringen die höchste Qualitätsstufe direkt zu dir nach Hause.</p>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Links</h4>
                    <a href="#hero" className="text-white/40 hover:text-white transition-colors">Start</a>
                    <a href="#herkunft" className="text-white/40 hover:text-white transition-colors">Herkunft</a>
                    <Link to="/waitlist" className="text-white/40 hover:text-white transition-colors">Warteliste</Link>
                </div>
                <div className="flex flex-col gap-4">
                    <h4 className="text-white font-bold uppercase tracking-widest text-sm mb-2">Rechtliches</h4>
                    <button onClick={onShowImpressum} className="text-white/40 hover:text-white text-left transition-colors">Impressum</button>
                    <button onClick={onShowDatenschutz} className="text-white/40 hover:text-white text-left transition-colors">Datenschutz</button>
                </div>
            </div>
        </footer>
    )
}

/* ═══════════════════════════════════════════════════════════
   INDEX PAGE — Main Composition
   ═══════════════════════════════════════════════════════════ */
export default function Index() {
    const [showImpressum, setShowImpressum] = useState(false)
    const [showDatenschutz, setShowDatenschutz] = useState(false)

    return (
        <div className="bg-primary min-h-screen">
            <NoiseOverlay />
            <main>
                <Hero />
                <ClaimSet1 />
                <ClaimSet2 />
                <ImageGallery />
                <WaitlistSection />
            </main>
            <Footer onShowImpressum={() => setShowImpressum(true)} onShowDatenschutz={() => setShowDatenschutz(true)} />
            
            {/* Simple Modals */}
            {showImpressum && (
                <div className="fixed inset-0 z-[300] bg-primary/95 flex items-center justify-center p-8 backdrop-blur-xl">
                    <button onClick={() => setShowImpressum(false)} className="absolute top-8 right-8 text-white"><X size={40} /></button>
                    <div className="max-w-2xl text-white">
                        <h2 className="font-serif italic text-5xl mb-8">Impressum</h2>
                        <p className="text-white/70 leading-relaxed">Meyer & Tiffert GbR<br />Hofwiese 27<br />79809 Weilheim<br /><br />E-Mail: meyertiffergbr@gmail.com</p>
                    </div>
                </div>
            )}
            {showDatenschutz && (
                <div className="fixed inset-0 z-[300] bg-primary/95 flex items-center justify-center p-8 backdrop-blur-xl">
                    <button onClick={() => setShowDatenschutz(false)} className="absolute top-8 right-8 text-white"><X size={40} /></button>
                    <div className="max-w-2xl text-white">
                        <h2 className="font-serif italic text-5xl mb-8">Datenschutz</h2>
                        <p className="text-white/70 leading-relaxed">Wir verarbeiten deine Daten nur zur Abwicklung deiner Reservierung. Deine Daten werden nicht an Dritte weitergegeben.</p>
                    </div>
                </div>
            )}
        </div>
    )
}