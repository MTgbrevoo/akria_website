import { useEffect, useState, useRef } from 'react'
import { BrowserRouter, Routes, Route } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, X } from 'lucide-react'

// Components
import Preloader from './components/Preloader'

gsap.registerPlugin(ScrollTrigger)

const ASSETS = [
    '/assets/logo.png',
    '/assets/sun.png',
    '/assets/mountains.png',
    '/assets/illustrations/Pokal.png',
    '/assets/illustrations/Present.png',
    '/assets/waves.png',
    '/assets/illustrations/Olive.png',
    '/assets/illustrations/Aroma.png',
    '/assets/illustrations/Herz.png',
    '/assets/hero-drone.mp4',
    '/assets/oil-flow.mov',
    '/assets/beach-video.mp4'
]

/* ═══════════════════════════════════════════════════════════
   NOISE OVERLAY
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
function Hero({ isLoaded }) {
    const heroRef = useRef(null)
    const textRef = useRef(null)
    const sunRef = useRef(null)

    useEffect(() => {
        if (!isLoaded) return;

        const video = heroRef.current?.querySelector('video')
        if (video) {
            video.pause();
        }

        const ctx = gsap.context(() => {
            // Initial animation for Logo and Sun
            const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            introTl.from('.hero-logo', { scale: 0.8, opacity: 0, duration: 1.2, delay: 0.8 })

            if (sunRef.current) {
                gsap.to(sunRef.current, {
                    scale: 1.1,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                })
            }

            // Set initial states for text
            gsap.set(['.hero-line-1', '.hero-line-2', '.hero-line-3', '.hero-line-4', '.hero-cta'], {
                opacity: 0,
                y: 30
            })

            // Scroll hint is visible initially
            gsap.to('.hero-scroll-hint', {
                opacity: 0,
                y: -20,
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: '20%',
                    scrub: true
                }
            })

            // Scroll-Synced Timeline
            const scrollTl = gsap.timeline({
                scrollTrigger: {
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
                }
            })

            scrollTl
                .to('.hero-line-2', { opacity: 1, y: 0, duration: 1 }, 0.1)
                .to('.hero-line-3.small-line', { opacity: 0.7, y: 0, duration: 1 }, 0.2)
                .to('.hero-line-4', { opacity: 1, y: 0, duration: 1 }, 0.3)
                .to('.hero-line-1', { opacity: 0.7, y: 0, duration: 1 }, 0.5)
                .to('.hero-line-3.desc-line', { opacity: 0.6, y: 0, duration: 1 }, 0.6)
                .to('.hero-cta', { opacity: 1, y: 0, duration: 1 }, 0.8)

        }, heroRef)

        return () => ctx.revert();
    }, [isLoaded])

    return (
        <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-primary" id="hero">
            <div className="hero-video-wrap absolute inset-0 w-full h-full">
                <video
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/assets/hero-drone.mp4" type="video/mp4" />
                </video>
            </div>

            <div ref={sunRef} className="absolute top-12 md:top-16 lg:top-20 right-6 md:right-12 lg:right-16 w-16 md:w-24 lg:w-32 z-30 pointer-events-none">
                <img src="/assets/sun.png" alt="" className="w-full h-auto" />
            </div>

            <div ref={textRef} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center">
                <div className="max-w-4xl flex flex-col items-center">
                    <div className="hero-logo mb-6 md:mb-8 lg:mb-10 transform hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-24 md:h-32 lg:h-44 w-auto" />
                    </div>

                    <p className="hero-line-1 font-display text-sm md:text-base lg:text-lg font-semibold tracking-[0.2em] uppercase text-white/90 mb-3 md:mb-4">
                        Extra Natives Olivenöl aus der Mani
                    </p>
                    <h1 className="mb-4 md:mb-6 text-center flex flex-col items-center">
                        <span className="hero-line-2 block font-display font-800 text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1]">
                            Upgrade
                        </span>
                        <span className="hero-line-3 small-line block font-display font-800 text-3xl md:text-4xl lg:text-5xl tracking-tight text-white/90 leading-none py-2">
                            für
                        </span>
                        <span className="hero-line-4 block font-serif italic font-900 text-6xl md:text-8xl lg:text-[9.5rem] tracking-tight text-accent leading-[0.8]">
                            alles.
                        </span>
                    </h1>
                    <p className="hero-line-3 desc-line text-white/80 text-base md:text-lg lg:text-xl max-w-2xl mb-6 md:mb-8 font-light leading-relaxed">
                        Wir bringen Olivenöl der besten Qualität zu einem fairen Preis in deine Küche.
                    </p>
                    <a href="#waitlist" className="hero-cta btn-magnetic btn-accent text-base py-3 md:py-4 px-10 relative z-10">
                        Auf die Warteliste
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </a>

                    <div className="hero-scroll-hint mt-6 flex flex-col items-center text-white/60 animate-bounce z-30">
                        <span className="text-[10px] md:text-xs tracking-widest uppercase mb-1">Scroll</span>
                        <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   CLAIM SET 1
   ═══════════════════════════════════════════════════════════ */
function ClaimSet1({ isLoaded }) {
    const sectionRef = useRef(null)
    const claims = [
        {
            icon: <img src="/assets/sun.png" alt="" className="w-full h-full object-contain" />,
            title: '300 Sonnentage / Jahr',
            desc: 'Die Mani ist ein Solarium für Oliven bäume. Keine wässrigen Kompromisse, sondern eine absolute Aromen-Explosion auf deinem Teller.',
        },
        {
            icon: <img src="/assets/mountains.png" alt="" className="w-full h-full object-contain scale-[1.5]" />,
            title: 'Berge & Meer',
            desc: 'Salzige Meeresluft trifft auf rauen Bergboden. Das sorgt für ein Öl, das nicht langweilig und flach schmeckt.',
        },
        {
            icon: <img src="/assets/illustrations/Pokal.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Weltklasse Qualität',
            desc: 'Unsere Laborwerte zeigen schwarz auf weiß: Extrem niedrige Säure für weichen Geschmack und hohe Polyphenole.',
        },
        {
            icon: <img src="/assets/illustrations/Present.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Direkt zu dir',
            desc: 'Wir bringen den Sommer in deine Küche! Wir holen echtes Handwerk aus Griechenland und machen es für dich verfügbar.',
        },
    ]

    useEffect(() => {
        if (!isLoaded) return;

        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 1024;

            claims.forEach((_, i) => {
                gsap.set(`.claim-card-${i}`, { 
                    opacity: 0, 
                    x: isMobile ? 0 : (i % 2 === 0 ? -40 : 40), 
                    y: isMobile ? 40 : 0 
                })
                if (i < claims.length - 1) {
                    gsap.set(`.claim-arrow-${i}`, { opacity: 0, strokeDashoffset: 200 })
                }
            })

            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top top',
                    end: `+=${claims.length * 100}%`,
                    pin: true,
                    scrub: 1.5,
                    anticipatePin: 1,
                },
            })

            claims.forEach((_, i) => {
                const startTime = i * 1.5
                tl.to(`.claim-card-${i}`, {
                    opacity: 1,
                    x: 0,
                    y: 0,
                    duration: 1,
                    ease: 'power2.out',
                }, startTime)

                if (i < claims.length - 1) {
                    tl.to(`.claim-arrow-${i}`, {
                        opacity: 1,
                        strokeDashoffset: 0,
                        duration: 0.6,
                        ease: 'power2.inOut',
                    }, startTime + 0.8)
                }
            })

            const video = sectionRef.current?.querySelector('video')
            if (video) video.play().catch(() => { })
        }, sectionRef)

        return () => ctx.revert()
    }, [isLoaded])

    return (
        <section ref={sectionRef} id="herkunft" className="relative min-h-[100svh] w-full bg-primary overflow-hidden pt-20 md:pt-32 pb-16">
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col h-full">
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl font-bold mb-8 md:mb-16 text-white/90 text-center lg:text-left">
                    Von der Mani zu dir.
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center flex-1">
                    <div className="relative flex flex-col gap-2 md:gap-3 order-2 lg:order-1">
                        {claims.map((claim, i) => (
                            <div key={i} className="relative">
                                <div className={`claim-card-${i} glass-card p-3 md:p-4 flex items-center gap-4 group hover:bg-white/10`}>
                                    <div className="flex-shrink-0 w-10 h-10 md:w-14 md:h-14 flex items-center justify-center">
                                        {claim.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold text-base md:text-xl text-white mb-0.5">
                                            {claim.title}
                                        </h3>
                                        <p className="text-white/60 text-xs md:text-sm leading-tight md:leading-relaxed">
                                            {claim.desc}
                                        </p>
                                    </div>
                                </div>

                                {i < claims.length - 1 && (
                                    <div className="py-2 md:py-0">
                                        <svg
                                            className={`claim-arrow-${i} w-10 h-10 md:w-20 md:h-20 mx-auto my-[-1.5rem] md:my-[-2rem] text-accent z-20 ${i % 2 === 0 ? 'lg:translate-x-[0.5rem] lg:rotate-[15deg]' : 'lg:translate-x-[-0.5rem] lg:rotate-[-15deg]'}`}
                                            viewBox="0 0 100 100"
                                            fill="none"
                                        >
                                            <path
                                                d="M50 10 C 40 35, 60 45, 50 80 M 35 65 C 40 75, 50 85, 50 80 M 65 65 C 60 75, 50 85, 50 80"
                                                stroke="currentColor"
                                                strokeWidth="4"
                                                strokeLinecap="round"
                                                strokeLinejoin="round"
                                            />
                                        </svg>
                                    </div>
                                )}
                            </div>
                        ))}
                    </div>

                    <div className="oil-video-container relative flex items-center justify-center lg:justify-end order-1 lg:order-2">
                        <div className="video-mask w-full max-w-[280px] md:max-w-sm lg:max-w-md xl:max-w-lg aspect-[3/4] relative overflow-hidden shadow-2xl rounded-3xl">
                            <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
                                <source src="/assets/oil-flow.mov" type="video/quicktime" />
                                <source src="/assets/oil-flow.mov" type="video/mp4" />
                            </video>
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                        </div>
                        <img src="/assets/waves.png" alt="" className="absolute -bottom-8 -right-8 w-24 md:w-48 opacity-20 pointer-events-none" />
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   CLAIM SET 2
   ═══════════════════════════════════════════════════════════ */
function ClaimSet2({ isLoaded }) {
    const sectionRef = useRef(null);
    const cards = [
        {
            headline: "100% Koroneiki-Oliven",
            desc: "Koroneiki-Oliven sind klein, aber haben es in sich. Intensiver Geschmack und einer der höchsten Polyphenolgehalte aller Sorten.",
            illustration: "/assets/illustrations/Olive.png"
        },
        {
            headline: "Intensives Aroma",
            desc: "Vergiss fades Öl, das nur fettig ist. Unser Öl hat echten Charakter und macht sogar trockenes Brot zum Highlight.",
            illustration: "/assets/illustrations/Aroma.png"
        },
        {
            headline: "Reich an Gesundmachern",
            desc: "Vollgepackt mit Polyphenolen, Vitamin E und Antioxidantien. Unser Olivenöl ist nicht nur lecker. Es tut dir auch richtig gut.",
            illustration: "/assets/illustrations/Herz.png"
        }
    ];

    useEffect(() => {
        if (!isLoaded) return;

        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: "top top",
                    end: `+=${cards.length * 100}%`,
                    pin: true,
                    scrub: 1,
                    anticipatePin: 1
                }
            });

            cards.forEach((_, i) => {
                if (i === 0) {
                    gsap.set(`.stack-card-0`, { zIndex: 10 });
                    return;
                }

                tl.fromTo(`.stack-card-${i}`,
                    { y: "-100vh", rotateX: 15, scale: 1.1, zIndex: 10 + i },
                    { y: "0vh", rotateX: 0, scale: 1, duration: 1.5, ease: "power2.inOut" },
                    `card-${i}`
                );

                for (let j = 0; j < i; j++) {
                    tl.to(`.stack-card-${j}`, {
                        scale: 0.9 - (i - j) * 0.05,
                        filter: `blur(${(i - j) * 5}px)`,
                        opacity: 0.6 / (i - j),
                        y: -20 * (i - j),
                        duration: 1.5,
                        ease: "power2.inOut"
                    }, `card-${i}`);
                }
            });
        }, sectionRef);

        return () => ctx.revert();
    }, [isLoaded]);

    return (
        <section ref={sectionRef} className="relative w-full h-[100svh] overflow-hidden bg-primary" id="qualitaet">
            <div className="relative w-full h-full flex items-center justify-center">
                {cards.map((card, i) => (
                    <div key={i} className={`stack-card-${i} absolute w-full max-w-4xl px-4 md:px-0 flex items-center justify-center`} style={{ zIndex: 10 + i }}>
                        <div className={`w-full bg-[#0c5eaf] rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-[-20px_40px_80px_rgba(0,0,0,0.4)] border border-white/10 flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-16 items-center`}>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="font-serif italic font-900 text-3xl md:text-5xl lg:text-6xl text-white mb-4 md:mb-6 leading-tight">{card.headline}</h2>
                                <p className="text-white/70 text-sm md:text-base lg:text-lg font-light leading-relaxed mb-4">{card.desc}</p>
                            </div>
                            <div className="w-32 h-32 md:w-56 md:h-56 lg:w-64 lg:h-64 relative">
                                <div className="absolute inset-0 bg-accent/10 rounded-full blur-3xl animate-pulse" />
                                <div className="relative z-10 w-full h-full flex items-center justify-center">
                                    <img src={card.illustration} className="w-full h-auto object-contain max-h-full" alt="" />
                                </div>
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </section>
    );
}

/* ═══════════════════════════════════════════════════════════
   WAITLIST
   ═══════════════════════════════════════════════════════════ */
function Waitlist({ isLoaded }) {
    const sectionRef = useRef(null)

    useEffect(() => {
        if (!isLoaded) return;
        const ctx = gsap.context(() => {
            gsap.from('.waitlist-content > *', {
                y: 60, opacity: 0, stagger: 0.12, duration: 1, ease: 'power3.out',
                scrollTrigger: { trigger: sectionRef.current, start: 'top 70%', toggleActions: 'play none none reverse' },
            })
            const video = sectionRef.current?.querySelector('video')
            if (video) video.play().catch(() => { })
        }, sectionRef)
        return () => ctx.revert()
    }, [isLoaded])

    return (
        <section ref={sectionRef} id="waitlist" className="relative min-h-[100svh] flex items-center justify-center py-16 md:py-24 bg-primary overflow-hidden">
            <div className="hidden lg:flex w-full h-full items-center max-w-7xl mx-auto px-12 lg:px-16">
                <div className="w-1/2 waitlist-content relative z-20 text-left py-12 pr-12">
                    <p className="font-display text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">Ernte 2026 / 2027</p>
                    <h2 className="font-serif italic font-bold text-4xl lg:text-5xl xl:text-6xl text-white mb-6 leading-tight">Sicher dir deinen Platz.</h2>
                    <p className="text-white/60 text-base lg:text-lg xl:text-xl max-w-md leading-relaxed mb-8 lg:mb-10 font-light">Trag dich für die nächste Ernte ein!</p>
                    <div className="flex justify-start">
                        <a href="https://deine-warteliste-url.de" target="_blank" rel="noopener noreferrer" className="btn-magnetic btn-accent py-3 px-10 lg:py-4 lg:px-12 text-lg lg:text-xl shadow-[0_0_30px_rgba(254,65,0,0.3)]">
                            Warteliste <ArrowRight className="ml-3 w-5 h-5 flex-shrink-0" />
                        </a>
                    </div>
                </div>
                <div className="w-1/2 h-[60vh] lg:h-[70vh] relative">
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl">
                        <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
                            <source src="/assets/beach-video.mp4" type="video/mp4" />
                        </video>
                    </div>
                    <img src="/assets/waves.png" alt="" className="absolute -bottom-10 -right-10 w-48 opacity-30 pointer-events-none" />
                </div>
            </div>
            <div className="lg:hidden absolute inset-0 w-full h-full flex items-center justify-center px-6">
                <div className="absolute inset-0 w-full h-full">
                    <video autoPlay muted loop playsInline preload="auto" className="absolute inset-0 w-full h-full object-cover">
                        <source src="/assets/beach-video.mp4" type="video/mp4" />
                    </video>
                </div>
                <div className="waitlist-content relative z-20 w-full max-w-md py-12 px-8 text-center backdrop-blur-md bg-black/20 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="font-display text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">Ernte 2026 / 2027</p>
                    <h2 className="font-serif italic font-bold text-3xl text-white mb-4 leading-tight">Sicher dir deinen Platz.</h2>
                    <p className="text-white/60 text-base leading-relaxed mb-8 font-light">Trag dich für die nächste Ernte ein!</p>
                    <div className="flex justify-center">
                        <a href="https://deine-warteliste-url.de" target="_blank" rel="noopener noreferrer" className="btn-magnetic btn-accent py-4 px-10 text-lg shadow-[0_0_30px_rgba(254,65,0,0.25)]">
                            Warteliste <ArrowRight className="ml-3 w-5 h-5 flex-shrink-0" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   MODALS
   ═══════════════════════════════════════════════════════════ */
function Impressum({ isOpen, onClose }) {
    const overlayRef = useRef(null)
    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: 'power3.out' })
            document.body.style.overflow = 'hidden'
        } else {
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => gsap.set(overlayRef.current, { visibility: 'hidden' }) })
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6 md:p-12 opacity-0 invisible">
            <NoiseOverlay />
            <button onClick={onClose} className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors p-2"><X size={32} /></button>
            <div className="max-w-3xl w-full text-white text-center md:text-left overflow-y-auto max-h-full py-12">
                <h2 className="font-serif italic font-bold text-4xl md:text-6xl mb-12 text-accent">Impressum</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white/80 font-light">
                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4">Angaben gemäß § 5 TMG</h3>
                        <p>Meyer & Tiffert GbR<br />Hofwiese 27<br />79809 Weilheim</p>
                    </div>
                </div>
            </div>
        </div>
    )
}

function Datenschutz({ isOpen, onClose }) {
    const overlayRef = useRef(null)
    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: 'power3.out' })
            document.body.style.overflow = 'hidden'
        } else {
            gsap.to(overlayRef.current, { opacity: 0, duration: 0.4, ease: 'power3.inOut', onComplete: () => gsap.set(overlayRef.current, { visibility: 'hidden' }) })
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    return (
        <div ref={overlayRef} className="fixed inset-0 z-[100] bg-primary flex items-start justify-center p-6 md:p-12 opacity-0 invisible overflow-y-auto">
            <NoiseOverlay />
            <button onClick={onClose} className="fixed top-8 right-8 text-white/60 hover:text-white transition-colors p-2 z-10"><X size={32} /></button>
            <div className="max-w-3xl w-full text-white py-16">
                <h2 className="font-serif italic font-bold text-4xl md:text-6xl mb-4 text-accent">Datenschutz</h2>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer({ onShowImpressum, onShowDatenschutz }) {
    return (
        <footer className="bg-[#041e3a] border-t border-white/5 py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="md:col-span-2">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-8 md:h-10 w-auto mb-4" />
                        <p className="text-white/40 text-sm max-w-sm leading-relaxed">Extra natives Olivenöl der höchsten Stufe, direkt aus der Mani-Region Griechenlands.</p>
                    </div>
                    <div>
                        <h4 className="font-display font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Navigation</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#hero" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Start</a>
                        </div>
                    </div>
                    <div>
                        <h4 className="font-display font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Rechtliches</h4>
                        <div className="flex flex-col gap-2">
                            <button onClick={onShowImpressum} className="text-white/40 hover:text-white text-sm hover-lift text-left">Impressum</button>
                            <button onClick={onShowDatenschutz} className="text-white/40 hover:text-white text-sm hover-lift text-left">Datenschutz</button>
                        </div>
                    </div>
                </div>
            </div>
        </footer>
    )
}

/* ═══════════════════════════════════════════════════════════
   MAIN PAGE
   ═══════════════════════════════════════════════════════════ */
function Index() {
    const [loadingProgress, setLoadingProgress] = useState(0)
    const [isLoaded, setIsLoaded] = useState(false)
    const [showImpressum, setShowImpressum] = useState(false)
    const [showDatenschutz, setShowDatenschutz] = useState(false)

    useEffect(() => {
        let loadedCount = 0;
        const totalAssets = ASSETS.length;

        const updateProgress = () => {
            loadedCount++;
            const progress = (loadedCount / totalAssets) * 100;
            setLoadingProgress(progress);
            if (loadedCount === totalAssets) {
                // Small delay for smooth transition
                setTimeout(() => {
                    setIsLoaded(true);
                    ScrollTrigger.refresh();
                }, 500);
            }
        };

        ASSETS.forEach(path => {
            if (path.endsWith('.mp4') || path.endsWith('.mov')) {
                const video = document.createElement('video');
                video.src = path;
                video.preload = 'auto';
                video.oncanplaythrough = updateProgress;
                video.onerror = updateProgress; // Don't block on error
            } else {
                const img = new Image();
                img.src = path;
                img.onload = updateProgress;
                img.onerror = updateProgress;
            }
        });
    }, []);

    return (
        <>
            <Preloader progress={loadingProgress} isLoaded={isLoaded} />
            <NoiseOverlay />
            <Impressum isOpen={showImpressum} onClose={() => setShowImpressum(false)} />
            <Datenschutz isOpen={showDatenschutz} onClose={() => setShowDatenschutz(false)} />
            <main>
                <Hero isLoaded={isLoaded} />
                <ClaimSet1 isLoaded={isLoaded} />
                <ClaimSet2 isLoaded={isLoaded} />
                <Waitlist isLoaded={isLoaded} />
            </main>
            <Footer onShowImpressum={() => setShowImpressum(true)} onShowDatenschutz={() => setShowDatenschutz(true)} />
        </>
    )
}

/* ═══════════════════════════════════════════════════════════
   APP ROOT
   ═══════════════════════════════════════════════════════════ */
export default function App() {
    return (
        <BrowserRouter>
            <Routes>
                <Route path="/" element={<Index />} />
            </Routes>
        </BrowserRouter>
    )
}