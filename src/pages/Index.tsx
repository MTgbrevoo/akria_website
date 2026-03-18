"use client";

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, X } from 'lucide-react'
import { Link } from 'react-router-dom'

gsap.registerPlugin(ScrollTrigger)

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

    useEffect(() => {
        const video = heroRef.current?.querySelector('video')

        const ctx = gsap.context(() => {
            // Initial animation for Logo, Sun, and CTA
            const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            
            gsap.set(['.hero-line-1', '.hero-line-2', '.hero-line-3', '.hero-line-4', '.hero-cta'], {
                opacity: 0,
                y: 30
            })

            introTl.to('.hero-logo', { scale: 1, opacity: 1, duration: 1.2, delay: 0.3 })
                   .to('.hero-cta', { y: 0, opacity: 1, duration: 1 }, "-=0.8")

            if (sunRef.current) {
                gsap.to(sunRef.current, {
                    scale: 1.1,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                })
            }

            // Scroll hint is visible initially, then fades as soon as user scrolls
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
                    end: '+=200%', // Scroll distance
                    pin: true,
                    scrub: true, 
                    anticipatePin: 1,
                    onUpdate: (self) => {
                        if (video && video.duration) {
                            // Video Scrubbing
                            video.currentTime = video.duration * self.progress
                        }
                    }
                }
            })

            // Staggered reveal linked to scroll
            scrollTl
                .to('.hero-line-2', { opacity: 1, y: 0, duration: 1 }, 0.1) // "Upgrade"
                .to('.hero-line-3.small-line', { opacity: 0.7, y: 0, duration: 1 }, 0.2) // "für"
                .to('.hero-line-4', { opacity: 1, y: 0, duration: 1 }, 0.3) // "alles."
                .to('.hero-line-1', { opacity: 1, y: 0, duration: 1 }, 0.5) // Subclaim 1

        }, heroRef)

        // Ensure video metadata is loaded for scrubbing
        if (video) {
            video.addEventListener('loadedmetadata', () => {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                }).catch(err => console.log("Video priming failed", err));
            }, { once: true });

            if (video.readyState >= 2) {
                video.play().then(() => {
                    video.pause();
                    video.currentTime = 0;
                }).catch(err => console.log("Video priming failed", err));
            }

            return () => {
                ctx.revert();
            };
        }

        return () => ctx.revert();
    }, [])

    return (
        <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden bg-primary" id="hero">
            {/* Background Video */}
            <div className="hero-video-wrap absolute inset-0 w-full h-full">
                <video
                    autoPlay
                    muted
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/assets/hero-drone.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Sun Illustration — top right */}
            <div ref={sunRef} className="absolute top-12 md:top-16 lg:top-20 right-6 md:right-12 lg:right-16 w-16 md:w-24 lg:w-32 z-30 pointer-events-none">
                <img src="/assets/sun.png" alt="" className="w-full h-auto" />
            </div>

            {/* Hero Content — Centered Layout */}
            <div ref={textRef} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center">
                <div className="max-w-4xl flex flex-col items-center">
                    {/* Centered Logo */}
                    <div className="hero-logo mb-6 md:mb-8 lg:mb-10 transform hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-24 md:h-32 lg:h-44 w-auto" />
                    </div>

                    <p className="hero-line-1 font-display text-sm md:text-base lg:text-lg font-bold tracking-[0.25em] uppercase text-white mb-3 md:mb-4 drop-shadow-lg">
                        Extra Natives Olivenöl aus der Mani
                    </p>
                    <h1 className="mb-6 md:mb-8 text-center flex flex-col items-center">
                        <span className="hero-line-2 block font-display font-800 text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1]">
                            Upgrade
                        </span>
                        <span className="hero-line-3 small-line block font-display font-800 text-3xl md:text-4xl lg:text-5xl tracking-tight text-white leading-none py-2">
                            für
                        </span>
                        <span className="hero-line-4 block font-serif italic font-900 text-6xl md:text-8xl lg:text-[9.5rem] tracking-tight text-accent leading-[0.8]">
                            alles.
                        </span>
                    </h1>
                    
                    <Link to="/waitlist" className="hero-cta btn-magnetic btn-accent text-base py-3 md:py-4 px-10 relative z-30">
                        Hol es dir
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </Link>

                    {/* Scroll hint — now under CTA/Logo area */}
                    <div className="hero-scroll-hint mt-8 flex flex-col items-center text-white/60 animate-bounce z-30">
                        <span className="text-[10px] md:text-xs tracking-widest uppercase mb-1">Scroll</span>
                        <ChevronDown className="w-3 h-3 md:w-4 md:h-4" />
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
            icon: <img src="/assets/sun.png" alt="" className="w-full h-full object-contain" />,
            title: '300 Sonnentage/ Jahr',
            desc: 'Die Mani in Griechenland ist rau, trocken und voller Olivenbäume. Viel Sonne, nix regen.',
        },
        {
            icon: <img src="/assets/mountains.png" alt="" className="w-full h-full object-contain scale-[1.5]" />,
            title: 'Berge & Meer',
            desc: 'Berge, Meer und eine salzige Meerbrise. Nicht gemütlich für viele Pflanzen. Aber ziemlich gut für Oliven.',
        },
        {
            icon: <img src="/assets/illustrations/Pokal.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Weltklasse Qualität',
            desc: 'Jede Charge geht ins Labor. Getestet und zertifiziert von einem vom International Olive Council anerkannten Institut.',
        },
        {
            icon: <img src="/assets/illustrations/Present.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Direkt zu dir',
            desc: 'Wir bringen den Sommer in deine Küche! Schluss mit Ratlosigkeit vor dem Supermarkt-Regal. Wir holen echtes Handwerk aus Griechenland und machen es für dich verfügbar.',
        },
    ]

    useEffect(() => {
        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 1024;

            // Initial setup
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

            // Timeline with Pinning
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
            if (video) {
                video.play().catch(() => { })
            }
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="herkunft"
            className="relative min-h-[100svh] w-full bg-primary overflow-hidden pt-10 md:pt-32 pb-16"
        >
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col h-full">
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-8 md:mb-16 text-white/95 text-center lg:text-left leading-[1.1] max-w-5xl tracking-tight">
                    Du hast dich schon immer gefragt, wo Du <span className="font-serif italic text-accent">weltklasse</span> Olivenöl bekommst? <br className="hidden md:block" />
                    Wir bringen es von der Mani zu dir!
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-start lg:items-center flex-1">
                    <div className="relative flex flex-col gap-2 md:gap-3 order-1">
                        {claims.map((claim, i) => (
                            <div key={i} className="relative">
                                <div
                                    className={`claim-card-${i} glass-card p-3 md:p-4 flex items-center gap-4 group hover:bg-white/10`}
                                >
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
                                            xmlns="http://www.w3.org/2000/center"
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

                    <div className="oil-video-container relative flex items-center justify-center lg:justify-end order-2">
                        <div className="video-mask w-full max-w-sm lg:max-w-md aspect-[3/4] relative overflow-hidden shadow-2xl rounded-3xl">
                            <video
                                autoPlay
                                muted
                                loop
                                playsInline
                                preload="auto"
                                className="absolute inset-0 w-full h-full object-cover"
                            >
                                <source src="/assets/oil-flow.mov" type="video/quicktime" />
                                <source src="/assets/oil-flow.mov" type="video/mp4" />
                            </video>
                        </div>
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
    const containerRef = useRef<HTMLDivElement>(null);

    const cards = [
        {
            headline: "100% Koroneiki-Oliven",
            desc: "Koroneiki-Oliven sind klein, wachsen gut im trockenen Klima der Mani und gehören zu den Sorten mit besonders vielen naturally vorkommenden Polyphenolen.",
            bg: "bg-[#0c5eaf]",
            illustration: "/assets/illustrations/Olive.png"
        },
        {
            headline: "Intensives Aroma",
            desc: "Vergiss fades Supermarktöl, das nichts zum Kochen beiträgt. Unser Öl hat Charakter und macht ein trockenes Brot mit Salz zu einem Geschmackshighlight.",
            bg: "bg-[#0c5eaf]",
            illustration: "/assets/illustrations/Aroma.png"
        },
        {
            headline: "Reich an Gesundmachern",
            desc: "Vollgepackt mit Polyphenolen, Vitamin E und Antioxidantien. Unser Olivenöl ist nicht nur lecker. Es tut dir auch richtig gut.",
            bg: "bg-[#0c5eaf]",
            illustration: "/assets/illustrations/Herz.png"
        }
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
                    anticipatePin: 1
                }
            });

            cards.forEach((_, i) => {
                if (i === 0) {
                    gsap.set(`.stack-card-0`, { zIndex: 10 });
                    return;
                }

                tl.fromTo(`.stack-card-${i}`,
                    {
                        y: "-100vh",
                        rotateX: 15,
                        scale: 1.1,
                        zIndex: 10 + i
                    },
                    {
                        y: "0vh",
                        rotateX: 0,
                        scale: 1,
                        duration: 1.5,
                        ease: "power2.inOut"
                    },
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
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full h-[100svh] overflow-hidden bg-primary" id="qualitaet">
            <div ref={containerRef} className="relative w-full h-full flex items-center justify-center">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={`stack-card-${i} absolute w-full max-w-4xl px-4 md:px-0 flex items-center justify-center`}
                        style={{ zIndex: 10 + i }}
                    >
                        <div className={`w-full ${card.bg} rounded-[2.5rem] p-8 md:p-12 lg:p-16 shadow-[-20px_40px_80px_rgba(0,0,0,0.4)] border border-white/10 flex flex-col md:flex-row gap-6 md:gap-12 lg:gap-16 items-center`}>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="font-serif italic font-900 text-3xl md:text-5xl lg:text-6xl text-white mb-4 md:mb-6 leading-tight">
                                    {card.headline}
                                </h2>
                                <p className="text-white/70 text-sm md:text-base lg:text-lg font-light leading-relaxed mb-4">
                                    {card.desc}
                                </p>
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
   WAITLIST CTA — Unified Full-Bleed Design
   ═══════════════════════════════════════════════════════════ */
function WaitlistSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            gsap.from('.waitlist-content > *', {
                y: 60,
                opacity: 0,
                stagger: 0.12,
                duration: 1,
                ease: 'power3.out',
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 70%',
                    toggleActions: 'play none none reverse',
                },
            })

            const video = sectionRef.current?.querySelector('video')
            if (video) {
                video.play().catch(() => { })
            }
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    return (
        <section
            ref={sectionRef}
            id="waitlist"
            className="relative h-[100svh] w-full flex items-center justify-center bg-black overflow-hidden"
        >
            {/* Background Video — Force Full Bleed */}
            <div className="absolute inset-0 w-full h-full z-0 pointer-events-none overflow-hidden">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 min-w-full min-h-full w-auto h-auto object-cover"
                    style={{ minWidth: '100%', minHeight: '100%' }}
                >
                    <source src="/assets/beach-video.mp4" type="video/mp4" />
                </video>
            </div>

            {/* Content Overlay */}
            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex items-center h-full">
                <div className="waitlist-content w-full lg:w-1/2 text-center lg:text-left py-12">
                    <p className="font-display text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">
                        Ernte 2026 / 2027
                    </p>
                    <h2 className="font-serif italic font-bold text-4xl lg:text-5xl xl:text-7xl text-white mb-6 leading-tight drop-shadow-2xl">
                        Sicher dir deinen Platz.
                    </h2>
                    <p className="text-white/90 text-base lg:text-lg xl:text-xl max-w-md mx-auto lg:mx-0 leading-relaxed mb-8 lg:mb-10 font-light drop-shadow-lg">
                        Trag dich für die nächste Ernte ein! Wir informieren dich, sobald der erste Tropfen fließt.
                    </p>

                    <div className="flex justify-center lg:justify-start">
                        <Link
                            to="/waitlist"
                            className="btn-magnetic btn-accent py-4 px-12 text-lg lg:text-xl shadow-[0_0_40px_rgba(254,65,0,0.5)]"
                        >
                            Warteliste
                            <ArrowRight className="ml-3 w-5 h-5 flex-shrink-0" />
                        </Link>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   IMPRESSUM OVERLAY
   ═══════════════════════════════════════════════════════════ */
function Impressum({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, {
                opacity: 1,
                visibility: 'visible',
                duration: 0.5,
                ease: 'power3.out'
            })
            document.body.style.overflow = 'hidden'
        } else {
            gsap.to(overlayRef.current, {
                opacity: 0,
                duration: 0.4,
                ease: 'power3.inOut',
                onComplete: () => {
                    gsap.set(overlayRef.current, { visibility: 'hidden' })
                }
            })
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] bg-primary flex items-center justify-center p-6 md:p-12 opacity-0 invisible"
        >
            <NoiseOverlay />

            <button
                onClick={onClose}
                className="absolute top-8 right-8 text-white/60 hover:text-white transition-colors p-2"
                aria-label="Schließen"
            >
                <X size={32} />
            </button>

            <div className="max-w-3xl w-full text-white text-center md:text-left overflow-y-auto max-h-full py-12">
                <h2 className="font-serif italic font-bold text-4xl md:text-6xl mb-12 text-accent">Impressum</h2>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-12 text-white/80 font-light leading-relaxed">
                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4">Angaben gemäß § 5 TMG</h3>
                        <p>
                            Meyer & Tiffert GbR<br />
                            Hofwiese 27<br />
                            79809 Weilheim<br />
                            Deutschland
                        </p>

                        <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4 mt-8">Kontakt</h3>
                        <p>
                            E-Mail: <a href="mailto:meyertiffergbr@gmail.com" className="text-accent hover:underline">meyertiffergbr@gmail.com</a>
                        </p>
                    </div>

                    <div>
                        <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4">Vertreten durch</h3>
                        <p>
                            Denis Tiffert und Zeno Meyer
                        </p>

                        <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4 mt-8">Umsatzsteuer-ID</h3>
                        <p>
                            Umsatzsteuer-Identifikationsnummer gemäß § 27a UStG:<br />
                            DE457997438
                        </p>

                        <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4 mt-8">Steuernummer</h3>
                        <p>
                            20005/29606
                        </p>
                    </div>
                </div>

                <div className="mt-12 pt-12 border-t border-white/10">
                    <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4">Verantwortlich für den Inhalt nach § 18 Abs. 2 MStV</h3>
                    <p className="text-white/80 font-light">
                        Denis Tiffert und Zeno Meyer<br />
                        Hofwiese 27<br />
                        79809 Weilheim<br />
                        Deutschland
                    </p>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   DATENSCHUTZ OVERLAY
   ═══════════════════════════════════════════════════════════ */
function Datenschutz({ isOpen, onClose }: { isOpen: boolean, onClose: () => void }) {
    const overlayRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: 'power3.out' })
            document.body.style.overflow = 'hidden'
        } else {
            gsap.to(overlayRef.current, {
                opacity: 0, duration: 0.4, ease: 'power3.inOut',
                onComplete: () => { gsap.set(overlayRef.current, { visibility: 'hidden' }) }
            })
            document.body.style.overflow = 'auto'
        }
    }, [isOpen])

    return (
        <div
            ref={overlayRef}
            className="fixed inset-0 z-[100] bg-primary flex items-start justify-center p-6 md:p-12 opacity-0 invisible overflow-y-auto"
        >
            <NoiseOverlay />
            <button
                onClick={onClose}
                className="fixed top-8 right-8 text-white/60 hover:text-white transition-colors p-2 z-10"
                aria-label="Schließen"
            >
                <X size={32} />
            </button>

            <div className="max-w-3xl w-full text-white py-16">
                <h2 className="font-serif italic font-bold text-4xl md:text-6xl mb-4 text-accent">Datenschutz&shy;erklärung</h2>
                <p className="text-white/50 text-sm mb-12">Stand: März 2026</p>

                {[
                    {
                        title: '1. Verantwortlicher',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Verantwortlich im Sinne der DSGVO:<br />
                                <strong className="text-white font-semibold">Meyer & Tiffert GbR</strong><br />
                                Hofwiese 27<br />
                                79809 Weilheim<br />
                                Deutschland<br /><br />
                                E-Mail: <a href="mailto:meyertiffergbr@gmail.com" className="text-accent hover:underline">meyertiffergbr@gmail.com</a>
                            </p>
                        )
                    },
                    {
                        title: '2. Hosting & Server-Logs',
                        content: (
                            <>
                                <p className="text-white/70 font-light leading-relaxed mb-4">
                                    Diese Website wird bei <strong className="text-white font-semibold">Vercel Inc.</strong>
                                    , 340 Pine Street, Suite 701, San Francisco, CA 94104, USA, gehostet.
                                </p>
                            </>
                        )
                    },
                    {
                        title: '3. Warteliste',
                        content: (
                            <>
                                <p className="text-white/70 font-light leading-relaxed mb-4">
                                    Wenn du dich in unsere Warteliste einträgst, erheben wir deinen <strong className="text-white font-semibold">Vor- und Nachnamen, deine E-Mail-Adresse</strong> sowie deinen <strong className="text-white font-semibold">Wohnort</strong>.
                                </p>
                            </>
                        )
                    },
                    {
                        title: '4. Schriftarten (Fonts)',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Diese Website verwendet Schriftarten, die lokal von unserem eigenen server ausgeliefert werden.
                            </p>
                        )
                    },
                    {
                        title: '5. Cookies & Tracking',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Diese Website setzt keine Marketing- oder Tracking-Cookies ein.
                            </p>
                        )
                    },
                    {
                        title: '6. Deine Rechte',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Du hast das Recht auf Auskunft, Berichtigung, Löschung und Widerspruch.
                            </p>
                        )
                    },
                    {
                        title: '7. Aktualität & Änderungen',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren.
                            </p>
                        )
                    },
                ].map((section, i) => (
                    <div key={i} className="mb-10 pb-10 border-b border-white/10 last:border-0">
                        <h3 className="text-white font-semibold uppercase tracking-widest text-sm mb-4">{section.title}</h3>
                        {section.content}
                    </div>
                ))}
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer({ onShowImpressum, onShowDatenschutz }: { onShowImpressum: () => void, onShowDatenschutz: () => void }) {
    return (
        <footer className="bg-[#041e3a] border-t border-white/5 py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    <div className="md:col-span-2">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-8 md:h-10 w-auto mb-4" />
                        <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                            Extra natives Olivenöl der höchsten Stufe, direkt aus der Mani-Region Griechenlands. Premium Qualität, fair und direkt.
                        </p>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Navigation</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#hero" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Start</a>
                            <a href="#herkunft" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Herkunft</a>
                            <a href="#qualitaet" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Qualität</a>
                            <Link to="/waitlist" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Warteliste</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Rechtliches</h4>
                        <div className="flex flex-col gap-2">
                            <button onClick={onShowImpressum} className="text-white/40 hover:text-white text-sm hover-lift transition-colors text-left">Impressum</button>
                            <button onClick={onShowDatenschutz} className="text-white/40 hover:text-white text-sm hover-lift transition-colors text-left">Datenschutz</button>
                            <a href="#" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">AGB</a>
                        </div>
                    </div>
                </div>

                <div className="mt-12 pt-6 border-t border-white/5 flex flex-col md:flex-row items-center justify-between gap-4">
                    <p className="text-white/30 text-xs">
                        © 2026 AKRIA. Alle Rechte vorbehalten.
                    </p>
                    <p className="text-white/20 text-xs">
                        Handgemacht mit ❤️ in Deutschland & Griechenland
                    </p>
                </div>
            </div>
        </footer>
    )
}

/* ═══════════════════════════════════════════════════════════
   COOKIE BANNER — GDPR-compliant consent notification
   ═══════════════════════════════════════════════════════════ */
function CookieBanner({ onShowDatenschutz }: { onShowDatenschutz: () => void }) {
    const [visible, setVisible] = useState(false)
    const bannerRef = useRef<HTMLDivElement>(null)

    useEffect(() => {
        const consent = localStorage.getItem('akria-cookie-consent')
        if (!consent) {
            const timer = setTimeout(() => setVisible(true), 800)
            return () => clearTimeout(timer)
        }
    }, [])

    useEffect(() => {
        if (!bannerRef.current || !visible) return
        gsap.fromTo(
            bannerRef.current,
            { y: 60, opacity: 0 },
            { y: 0, opacity: 1, duration: 0.6, ease: 'power3.out' }
        )
    }, [visible])

    const dismiss = (choice: string) => {
        localStorage.setItem('akria-cookie-consent', choice)
        gsap.to(bannerRef.current, {
            y: 60,
            opacity: 0,
            duration: 0.4,
            ease: 'power3.inOut',
            onComplete: () => setVisible(false),
        })
    }

    if (!visible) return null

    return (
        <div
            ref={bannerRef}
            className="fixed bottom-4 left-4 right-4 md:left-auto md:right-6 md:bottom-6 md:max-w-md z-[200]"
            style={{ opacity: 0 }}
        >
            <div className="bg-[#041e3a]/95 backdrop-blur-xl border border-white/10 rounded-2xl p-5 md:p-6 shadow-[0_8px_60px_rgba(0,0,0,0.5)]">
                <div className="flex items-center gap-3 mb-3">
                    <span className="text-2xl" role="img" aria-label="Cookie">🫒</span>
                    <p className="font-display font-bold text-white text-sm uppercase tracking-widest">
                        Hinweis zu Cookies
                    </p>
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-5">
                    Diese Website verwendet ausschließlich technisch notwendige Cookies für den Betrieb der Seite.{' '}
                    <button
                        onClick={onShowDatenschutz}
                        className="text-accent underline hover:text-accent/80 transition-colors"
                    >
                        Mehr erfahren
                    </button>
                </p>

                <div className="flex gap-3">
                    <button
                        onClick={() => dismiss('accepted')}
                        className="btn-magnetic btn-accent flex-1 py-3 text-sm shadow-[0_0_20px_rgba(254,65,0,0.25)]"
                    >
                        Verstanden
                    </button>
                    <button
                        onClick={() => dismiss('declined')}
                        className="flex-1 py-3 text-sm font-display font-semibold tracking-wide text-white/50 hover:text-white border border-white/10 hover:border-white/20 rounded-full transition-all duration-200"
                    >
                        Ablehnen
                    </button>
                </div>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   INDEX PAGE — Main Composition
   ═══════════════════════════════════════════════════════════ */
export default function Index() {
    const [showImpressum, setShowImpressum] = useState(false)
    const [showDatenschutz, setShowDatenschutz] = useState(false)

    useEffect(() => {
        const timeout = setTimeout(() => {
            ScrollTrigger.refresh()
        }, 500)
        return () => clearTimeout(timeout)
    }, [])

    return (
        <div className="bg-primary min-h-screen">
            <NoiseOverlay />
            <Impressum isOpen={showImpressum} onClose={() => setShowImpressum(false)} />
            <Datenschutz isOpen={showDatenschutz} onClose={() => setShowDatenschutz(true)} />
            <CookieBanner onShowDatenschutz={() => setShowDatenschutz(true)} />
            <main>
                <Hero />
                <ClaimSet1 />
                <ClaimSet2 />
                <WaitlistSection />
            </main>
            <Footer onShowImpressum={() => setShowImpressum(true)} onShowDatenschutz={() => setShowDatenschutz(true)} />
        </div>
    )
}