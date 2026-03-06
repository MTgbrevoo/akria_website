import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, Leaf, Sun, Mountain, Truck, Droplets, Flame, Heart, X } from 'lucide-react'

gsap.registerPlugin(ScrollTrigger)

/* ═══════════════════════════════════════════════════════════
   HAND-DRAWN ICONS SYSTEM
   ═══════════════════════════════════════════════════════════ */
const HandDrawnIcon = {
    Sun: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 7c-2.76 0-5 2.24-5 5s2.24 5 5 5 5-2.24 5-5-2.24-5-5-5z" />
            <path d="M12 2v2M12 20v2M4.22 4.22l1.42 1.42M18.36 18.36l1.42 1.42M2 12h2M20 12h2M4.22 19.78l1.42-1.42M18.36 5.64l1.42-1.42" />
        </svg>
    ),
    Mountain: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="m8 3 4 8 5-5 5 15H2L8 3z" />
        </svg>
    ),
    Leaf: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M11 20A7 7 0 0 1 9.8 6.1C15.5 5 17 4.48 19 2c1 2 2 3.5 1 8s-3 12-10 10c-4.012 0-7.305-3.044-7.928-7" />
            <path d="M7 22l5-5" />
        </svg>
    ),
    Truck: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M14 18V6a2 2 0 0 0-2-2H4a2 2 0 0 0-2 2v11a1 1 0 0 0 1 1h2" />
            <path d="M15 18H9" />
            <path d="M19 18h2a1 1 0 0 0 1-1v-5l-4-4h-3v10a2 2 0 0 0 2 2Z" />
            <circle cx="7" cy="18" r="2" />
            <circle cx="17" cy="18" r="2" />
        </svg>
    ),
    Badge: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M3.85 8.62a4 4 0 0 1 4.77-4.77 4 4 0 0 1 6.76 0 4 4 0 0 1 4.77 4.77 4 4 0 0 1 0 6.76 4 4 0 0 1-4.77 4.77 4 4 0 0 1-6.76 0 4 4 0 0 1-4.77-4.77 4 4 0 0 1 0-6.76Z" />
            <path d="m9 12 2 2 4-4" />
        </svg>
    ),
    Box: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M21 8a2 2 0 0 0-1-1.73l-7-4a2 2 0 0 0-2 0l-7 4A2 2 0 0 0 3 8v8a2 2 0 0 0 1 1.73l7 4a2 2 0 0 0 2 0l7-4A2 2 0 0 0 21 16Z" />
            <path d="m3.3 7 8.7 5 8.7-5" />
            <path d="M12 22V12" />
        </svg>
    ),
    Droplet: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M12 22a7 7 0 0 0 7-7c0-2-1-3.9-3-5.5s-4-4-4-4-2 2.4-4 4-3 3.5-3 5.5a7 7 0 0 0 7 7z" />
        </svg>
    ),
    Flame: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M8.5 14.5A2.5 2.5 0 0 0 11 12c0-1.38-.56-2.63-1.46-3.53l-.04-.04c-.38-.38-.6-.94-.6-2.43 0-2.81 3.12-4.56 5.25-2.75l.17.14c.45.39.71.95.71 1.55 0 1.25-.79 2.43-1.84 3.03l-.11.05c-1.1.54-1.14 2-.11 2.6l.3.17c1.32.74 2.13 2.1 2.13 3.58a5 5 0 0 1-5 5H11a5 5 0 0 1-5-5v-2c0-.55.45-1 1-1h1.5z" />
        </svg>
    ),
    Heart: ({ className }) => (
        <svg viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="1.5" strokeLinecap="round" strokeLinejoin="round" className={className}>
            <path d="M19 14c1.49-1.46 3-3.21 3-5.5A5.5 5.5 0 0 0 16.5 3c-1.76 0-3 .5-4.5 2-1.5-1.5-2.74-2-4.5-2A5.5 5.5 0 0 0 2 8.5c0 2.3 1.51 4.05 3 5.5l7 7Z" />
        </svg>
    ),
}

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
    const heroRef = useRef(null)
    const textRef = useRef(null)
    const sunRef = useRef(null)

    useEffect(() => {
        const video = heroRef.current?.querySelector('video')

        const ctx = gsap.context(() => {
            // Initial animation for Logo and Sun
            const introTl = gsap.timeline({ defaults: { ease: 'power3.out' } })
            introTl.from('.hero-logo', { scale: 0.8, opacity: 0, duration: 1.2, delay: 0.3 })

            if (sunRef.current) {
                gsap.to(sunRef.current, {
                    scale: 1.1,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                })
            }

            // Hide other elements initially
            gsap.set(['.hero-line-1', '.hero-line-2', '.hero-line-3', '.hero-line-4', '.hero-cta'], {
                opacity: 0,
                y: 30
            })

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
                    scrub: true, // Use boolean scrub for most responsive mobile behavior
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
                .to('.hero-line-1', { opacity: 0.7, y: 0, duration: 1 }, 0.5) // Subclaim 1
                .to('.hero-line-3.desc-line', { opacity: 0.6, y: 0, duration: 1 }, 0.6) // Subclaim 2
                .to('.hero-cta', { opacity: 1, y: 0, duration: 1 }, 0.8)

        }, heroRef)

        // Ensure video metadata is loaded for scrubbing
        if (video) {
            // Prime the video for mobile browsers
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
            <div ref={sunRef} className="absolute top-12 md:top-16 lg:top-20 right-6 md:right-12 lg:right-16 w-20 md:w-32 lg:w-44 z-30 pointer-events-none">
                <img src="/assets/sun.png" alt="" className="w-full h-auto" />
            </div>

            {/* Hero Content — Centered Layout */}
            <div ref={textRef} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center">
                <div className="max-w-4xl flex flex-col items-center">
                    {/* Centered Logo */}
                    <div className="hero-logo mb-6 md:mb-8 lg:mb-10 transform hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-20 md:h-24 lg:h-32 w-auto" />
                    </div>

                    <p className="hero-line-1 font-display text-xs md:text-sm lg:text-base font-semibold tracking-[0.2em] uppercase text-white/70 mb-3 md:mb-4">
                        Extra Natives Olivenöl aus der Mani
                    </p>
                    <h1 className="mb-4 md:mb-6 text-center flex flex-col items-center">
                        <span className="hero-line-2 block font-display font-800 text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1]">
                            Upgrade
                        </span>
                        <span className="hero-line-3 small-line block font-display font-800 text-3xl md:text-4xl lg:text-5xl tracking-tight text-white/90 leading-[0.9] -mt-1 md:-mt-2">
                            für
                        </span>
                        <span className="hero-line-4 block font-serif italic font-900 text-6xl md:text-8xl lg:text-[9rem] tracking-tight text-accent leading-[0.8] -mt-1 md:-mt-2">
                            alles.
                        </span>
                    </h1>
                    <p className="hero-line-3 desc-line text-white/80 text-base md:text-lg lg:text-xl max-w-xl mb-6 md:mb-8 font-light leading-relaxed">
                        Wir bringen Olivenöl der besten Qualität zu einem fairen Preis in deine Küche.
                    </p>
                    <a href="#waitlist" className="hero-cta btn-magnetic btn-accent text-sm md:text-base py-3 md:py-4 px-8 md:px-10 relative z-10">
                        Auf die Warteliste
                        <ArrowRight className="ml-2 w-4 h-4 md:w-5 md:h-5" />
                    </a>

                    {/* Scroll hint — now under CTA/Logo area */}
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
   CLAIM SET 1 — Sequential scroll reveals + Oil Video
   300 Sonnentage → Berge & Meer → Weltklasse Qualität → Direkt zu dir
   ═══════════════════════════════════════════════════════════ */
function ClaimSet1() {
    const sectionRef = useRef(null)
    const claims = [
        {
            icon: <img src="/assets/sun.png" alt="" className="w-full h-full object-contain" />,
            title: '300 Sonnentage / Jahr',
            desc: 'Die Mani ist ein Solarium für Olivenbäume. Keine wässrigen Kompromisse, sondern eine absolute Aromen-Explosion auf deinem Teller. So muss Sommer schmecken.',
            illustration: null,
        },
        {
            icon: <img src="/assets/mountains.png" alt="" className="w-full h-full object-contain scale-[1.5]" />,
            title: 'Berge & Meer',
            desc: 'Salzige Meeresluft trifft auf rauen Bergboden. Das sorgt für ein Öl, das nicht langweilig und flach schmeckt, sondern Ecken, Kanten und ordentlich Würze hat.',
            illustration: null,
        },
        {
            icon: <img src="/assets/illustrations/Pokal.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Weltklasse Qualität',
            desc: 'Unsere Laborwerte zeigen schwarz auf weiß: Extrem niedrige Säure für weichen Geschmack und hohe Polyphenole für den gesunden Kick.',
            illustration: null,
        },
        {
            icon: <img src="/assets/illustrations/Present.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Direkt zu dir',
            desc: 'Wir bringen den Sommer in deine Küche! Schluss mit Ratlosigkeit vor dem Supermarkt-Regal. Wir holen echtes Handwerk aus Griechenland und machen es für dich verfügbar.',
            illustration: null,
        },
    ]

    useEffect(() => {
        const ctx = gsap.context(() => {
            const isMobile = window.innerWidth < 768

            // Hide all claims and arrows initially
            claims.forEach((_, i) => {
                gsap.set(`.claim-card-${i}`, { opacity: 0, x: isMobile ? 0 : -40, y: isMobile ? 40 : 0 })
                if (i < claims.length - 1) {
                    gsap.set(`.claim-arrow-${i}`, { opacity: 0 })
                }
            })

            if (isMobile) {
                // Mobile: Natural scroll with simple reveal
                claims.forEach((_, i) => {
                    gsap.to(`.claim-card-${i}`, {
                        opacity: 1,
                        y: 0,
                        duration: 0.8,
                        ease: 'power2.out',
                        scrollTrigger: {
                            trigger: `.claim-card-${i}`,
                            start: 'top 85%',
                        }
                    })
                    if (i < claims.length - 1) {
                        gsap.to(`.claim-arrow-${i}`, {
                            opacity: 1,
                            duration: 0.8,
                            ease: 'power2.inOut',
                            scrollTrigger: {
                                trigger: `.claim-arrow-${i}`,
                                start: 'top 90%',
                            }
                        })
                    }
                })
            } else {
                // Desktop: Pinned sequential reveal
                const tl = gsap.timeline({
                    scrollTrigger: {
                        trigger: sectionRef.current,
                        start: 'top top',
                        end: `+=${claims.length * 150}%`,
                        pin: true,
                        scrub: 2,
                        anticipatePin: 1,
                    },
                })

                claims.forEach((_, i) => {
                    const startTime = i * 1.5
                    tl.to(`.claim-card-${i}`, {
                        opacity: 1,
                        x: 0,
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
            }

            // Force play video
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
            className="relative min-h-[100svh] w-full bg-primary overflow-hidden py-16 md:py-24 flex items-center"
        >
            <div className="flex items-center justify-center">
                <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 grid grid-cols-1 lg:grid-cols-2 gap-8 lg:gap-16 items-start lg:items-center">
                    {/* Left: Claims */}
                    <div className="relative flex flex-col gap-2 md:gap-3">
                        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-white/90">
                            Von der Mani zu dir.
                        </h2>
                        {claims.map((claim, i) => (
                            <div key={i} className="relative">
                                <div
                                    className={`claim-card-${i} glass-card p-4 md:p-6 flex items-center gap-4 md:gap-6 group hover:bg-white/10 ${i % 2 === 0 ? 'md:translate-x-[-1rem]' : 'md:translate-x-[1rem]'}`}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                                        {claim.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold text-lg md:text-2xl text-white mb-1">
                                            {claim.title}
                                        </h3>
                                        <p className="text-white/80 text-sm md:text-base leading-snug md:leading-relaxed">
                                            {claim.desc}
                                        </p>
                                    </div>
                                    {claim.illustration && (
                                        <img
                                            src={claim.illustration}
                                            alt=""
                                            className="hidden md:block absolute -right-4 top-1/2 -translate-y-1/2 w-16 h-auto pointer-events-none"
                                        />
                                    )}
                                </div>

                                {/* Hand-drawn arrow SVG between claims */}
                                {i < claims.length - 1 && (
                                    <div className="py-2 md:py-0">
                                        <svg
                                            className={`claim-arrow-${i} w-10 h-10 md:w-20 md:h-20 mx-auto my-[-1.5rem] md:my-[-2rem] text-accent z-20 ${i % 2 === 0 ? 'md:translate-x-[0.5rem] md:rotate-[15deg]' : 'md:translate-x-[-0.5rem] md:rotate-[-15deg]'}`}
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

                    {/* Right: Oil flowing video */}
                    <div className="oil-video-container relative flex items-center justify-center lg:justify-end">
                        <div className="video-mask w-full max-w-[280px] md:max-w-md aspect-[3/4] relative overflow-hidden shadow-2xl">
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
                            <div className="absolute inset-0 bg-gradient-to-t from-primary/40 to-transparent" />
                        </div>
                        {/* Decorative waves illustration */}
                        <img
                            src="/assets/waves.png"
                            alt=""
                            className="absolute -bottom-8 -right-8 w-32 md:w-48 opacity-20 pointer-events-none"
                        />
                    </div>
                </div>
            </div>
        </section>
    )
}


/* ═══════════════════════════════════════════════════════════
   CLAIM SET 2 — Falling Cards Stacking Effect
   100% Koroneiki-Oliven → Intensives Aroma → Reich an Gesundmachern
   ═══════════════════════════════════════════════════════════ */
function ClaimSet2() {
    const sectionRef = useRef(null);
    const containerRef = useRef(null);

    const cards = [
        {
            headline: "100% Koroneiki-Oliven",
            desc: "Koroneiki-Oliven sind klein, aber haben es in sich. Intensiver Geschmack und einer der höchsten Polyphenolgehalte aller Sorten.",
            bg: "bg-[#0c5eaf]",
            illustration: "/assets/illustrations/Olive.png"
        },
        {
            headline: "Intensives Aroma",
            desc: "Vergiss fades Öl, das nur fettig ist. Unser Öl hat echten Charakter und macht sogar trockenes Brot zum Highlight.",
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
            // Pinned Stacking Effect for all devices
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
                    // First card is already there or enters normally
                    gsap.set(`.stack-card-0`, { zIndex: 10 });
                    return;
                }

                // Card falls from above
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

                // Previous cards effect (Scale down, blur, fade)
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
                                {/* Abstract shape or illustration background */}
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
   WAITLIST CTA
   ═══════════════════════════════════════════════════════════ */
function Waitlist() {
    const sectionRef = useRef(null)

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

            // Force play video
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
            className="relative min-h-[100svh] flex items-center justify-center py-16 md:py-24 bg-primary overflow-hidden"
        >
            {/* Desktop Side-by-Side */}
            <div className="hidden lg:flex w-full h-full items-center max-w-7xl mx-auto px-12 lg:px-16">
                {/* Left: Content */}
                <div className="w-1/2 waitlist-content relative z-20 text-left py-12 pr-12">
                    <p className="font-display text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">
                        Ernte 2026 / 2027
                    </p>
                    <h2 className="font-serif italic font-bold text-4xl lg:text-5xl xl:text-6xl text-white mb-6 leading-tight">
                        Sicher dir deinen Platz.
                    </h2>
                    <p className="text-white/60 text-base lg:text-lg xl:text-xl max-w-md leading-relaxed mb-8 lg:mb-10 font-light">
                        Trag dich für die nächste Ernte ein! Wir informieren dich, sobald der erste Tropfen fließt.
                    </p>

                    <div className="flex justify-start">
                        <a
                            href="https://deine-warteliste-url.de"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-magnetic btn-accent py-3 px-10 lg:py-4 lg:px-12 text-lg lg:text-xl shadow-[0_0_30px_rgba(254,65,0,0.3)]"
                        >
                            Warteliste
                            <ArrowRight className="ml-3 w-5 h-5 flex-shrink-0" />
                        </a>
                    </div>
                </div>

                {/* Right: Video in a mask */}
                <div className="w-1/2 h-[60vh] lg:h-[70vh] relative">
                    <div className="absolute inset-0 rounded-[3rem] overflow-hidden shadow-2xl">
                        <video
                            autoPlay
                            muted
                            loop
                            playsInline
                            preload="auto"
                            className="absolute inset-0 w-full h-full object-cover"
                        >
                            <source src="/assets/beach-video.mp4" type="video/mp4" />
                        </video>
                        {/* Overlay removed as requested */}
                    </div>
                    {/* Decorative waves for desktop */}
                    <img
                        src="/assets/waves.png"
                        alt=""
                        className="absolute -bottom-10 -right-10 w-48 opacity-30 pointer-events-none"
                    />
                </div>
            </div>

            {/* Mobile Overlay */}
            <div className="lg:hidden absolute inset-0 w-full h-full flex items-center justify-center px-6">
                <div className="absolute inset-0 w-full h-full">
                    <video
                        autoPlay
                        muted
                        loop
                        playsInline
                        preload="auto"
                        className="absolute inset-0 w-full h-full object-cover"
                    >
                        <source src="/assets/beach-video.mp4" type="video/mp4" />
                    </video>
                    {/* Overlay removed as requested */}
                </div>

                <div className="waitlist-content relative z-20 w-full max-w-md py-12 px-8 text-center backdrop-blur-md bg-black/20 rounded-[2.5rem] border border-white/5 shadow-xl">
                    <p className="font-display text-xs font-semibold tracking-[0.2em] uppercase text-accent mb-3">
                        Ernte 2026 / 2027
                    </p>
                    <h2 className="font-serif italic font-bold text-3xl text-white mb-4 leading-tight">
                        Sicher dir deinen Platz.
                    </h2>
                    <p className="text-white/60 text-base leading-relaxed mb-8 font-light">
                        Trag dich für die nächste Ernte ein!
                    </p>

                    <div className="flex justify-center">
                        <a
                            href="https://deine-warteliste-url.de"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-magnetic btn-accent py-4 px-10 text-lg shadow-[0_0_30px_rgba(254,65,0,0.3)]"
                        >
                            Warteliste
                            <ArrowRight className="ml-3 w-5 h-5 flex-shrink-0" />
                        </a>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   IMPRESSUM OVERLAY
   ═══════════════════════════════════════════════════════════ */
function Impressum({ isOpen, onClose }) {
    const overlayRef = useRef(null)

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
            {/* Noise Overlay specifically for the Impressum */}
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
function Datenschutz({ isOpen, onClose }) {
    const overlayRef = useRef(null)

    useEffect(() => {
        if (isOpen) {
            gsap.to(overlayRef.current, { opacity: 1, visibility: 'visible', duration: 0.5, ease: 'power3.out' })
            document.body.style.overflow = 'hidden'
        } else {
            gsap.to(overlayRef.current, {
                opacity: 0, duration: 0.4, ease: 'power3.inOut',
                onComplete: () => gsap.set(overlayRef.current, { visibility: 'hidden' })
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

                {/* Section helper */}
                {[
                    {
                        title: '1. Verantwortlicher',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Verantwortlich im Sinne der DSGVO:<br />
                                <strong className="text-white font-semibold">Meyer &amp; Tiffert GbR</strong><br />
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
                                    Beim Aufruf der Website erhebt Vercel automatisch sogenannte Server-Logfiles, die dein Browser übermittelt.
                                    Dies umfasst: Browsertyp und -version, Betriebssystem, Referrer-URL, Hostname des zugreifenden Rechners, Uhrzeit der Serveranfrage und IP-Adresse.
                                </p>
                                <p className="text-white/70 font-light leading-relaxed mb-4">
                                    Diese Daten sind nicht bestimmten Personen zuordenbar und werden nicht mit anderen Datenquellen zusammengeführt.
                                    Rechtsgrundlage ist Art. 6 Abs. 1 lit. f DSGVO (berechtigtes Interesse am sicheren Betrieb der Website).
                                </p>
                                <p className="text-white/70 font-light leading-relaxed">
                                    Vercel kann außerdem anonymisierte Nutzungsstatistiken erheben. Weitere Informationen findest du in der
                                    Datenschutzerklärung von Vercel:{' '}
                                    <a href="https://vercel.com/legal/privacy-policy" target="_blank" rel="noopener noreferrer" className="text-accent hover:underline">vercel.com/legal/privacy-policy</a>.
                                    Mit Vercel besteht ein Auftragsverarbeitungsvertrag gemäß Art. 28 DSGVO.
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
                                    Diese Daten werden ausschließlich dazu verwendet, dich über die Verfügbarkeit unseres Olivenöls zu informieren.
                                </p>
                                <p className="text-white/70 font-light leading-relaxed mb-4">
                                    Die Daten werden in einer Google Sheets-Tabelle gespeichert, die auf unserem Google Drive liegt.
                                    Anbieter: <strong className="text-white font-semibold">Google Ireland Ltd.</strong>, Gordon House, Barrow Street, Dublin 4, Irland.
                                    Google kann diese Daten auf Servern in den USA verarbeiten. Mit Google besteht ein Standardvertragsklausel-Vertrag gemäß Art. 46 Abs. 2 lit. c DSGVO.
                                </p>
                                <p className="text-white/70 font-light leading-relaxed">
                                    Rechtsgrundlage der Verarbeitung ist deine Einwilligung gemäß Art. 6 Abs. 1 lit. a DSGVO.
                                    Du kannst deine Einwilligung jederzeit widerrufen, indem du uns eine E-Mail schickst.
                                    Die Daten werden gelöscht, sobald sie für den genannten Zweck nicht mehr benötigt werden.
                                </p>
                            </>
                        )
                    },
                    {
                        title: '4. Schriftarten (Fonts)',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Diese Website verwendet Schriftarten (Inter, Outfit, Playfair Display), die lokal von unserem eigenen Server ausgeliefert werden.
                                Es findet dabei keine Verbindung zu externen Servern (z. B. Google Fonts) statt. Es werden keine personenbezogenen Daten durch die Schriftarten an Dritte übertragen.
                            </p>
                        )
                    },
                    {
                        title: '5. Cookies & Tracking',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Diese Website setzt keine Marketing- oder Tracking-Cookies ein. Vercel kann technisch notwendige Cookies für den Betrieb der Infrastruktur nutzen.
                                Analysen werden ausschließlich über die anonymisierten Statistiken von Vercel durchgeführt — ohne Verbindung zu deiner Person.
                            </p>
                        )
                    },
                    {
                        title: '6. Deine Rechte',
                        content: (
                            <>
                                <p className="text-white/70 font-light leading-relaxed mb-3">
                                    Du hast gemäß DSGVO folgende Rechte gegenüber uns:
                                </p>
                                <ul className="text-white/70 font-light leading-relaxed list-disc list-inside space-y-1 mb-4">
                                    <li>Recht auf Auskunft (Art. 15 DSGVO)</li>
                                    <li>Recht auf Berichtigung (Art. 16 DSGVO)</li>
                                    <li>Recht auf Löschung (Art. 17 DSGVO)</li>
                                    <li>Recht auf Einschränkung der Verarbeitung (Art. 18 DSGVO)</li>
                                    <li>Recht auf Datenübertragbarkeit (Art. 20 DSGVO)</li>
                                    <li>Recht auf Widerspruch (Art. 21 DSGVO)</li>
                                    <li>Recht auf Widerruf der Einwilligung (Art. 7 Abs. 3 DSGVO)</li>
                                </ul>
                                <p className="text-white/70 font-light leading-relaxed">
                                    Zur Ausübung deiner Rechte wende dich bitte an:{' '}
                                    <a href="mailto:meyertiffergbr@gmail.com" className="text-accent hover:underline">meyertiffergbr@gmail.com</a>.
                                    Außerdem hast du das Recht, dich bei einer Datenschutzaufsichtsbehörde zu beschweren.
                                </p>
                            </>
                        )
                    },
                    {
                        title: '7. Aktualität & Änderungen',
                        content: (
                            <p className="text-white/70 font-light leading-relaxed">
                                Wir behalten uns vor, diese Datenschutzerklärung zu aktualisieren. Die jeweils aktuelle Version ist auf dieser Website abrufbar.
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
function Footer({ onShowImpressum, onShowDatenschutz }) {
    return (
        <footer className="bg-[#041e3a] border-t border-white/5 py-12 md:py-16">
            <div className="max-w-7xl mx-auto px-6 md:px-16">
                <div className="grid grid-cols-1 md:grid-cols-4 gap-8 md:gap-12">
                    {/* Brand */}
                    <div className="md:col-span-2">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-8 md:h-10 w-auto mb-4" />
                        <p className="text-white/40 text-sm max-w-sm leading-relaxed">
                            Extra natives Olivenöl der höchsten Stufe, direkt aus der Mani-Region Griechenlands. Premium Qualität, fair und direkt.
                        </p>
                    </div>

                    {/* Navigation */}
                    <div>
                        <h4 className="font-display font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Navigation</h4>
                        <div className="flex flex-col gap-2">
                            <a href="#hero" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Start</a>
                            <a href="#herkunft" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Herkunft</a>
                            <a href="#qualitaet" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Qualität</a>
                            <a href="#waitlist" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Warteliste</a>
                        </div>
                    </div>

                    {/* Legal */}
                    <div>
                        <h4 className="font-display font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Rechtliches</h4>
                        <div className="flex flex-col gap-2">
                            <button onClick={onShowImpressum} className="text-white/40 hover:text-white text-sm hover-lift transition-colors text-left">Impressum</button>
                            <button onClick={onShowDatenschutz} className="text-white/40 hover:text-white text-sm hover-lift transition-colors text-left">Datenschutz</button>
                            <a href="#" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">AGB</a>
                        </div>
                    </div>
                </div>

                {/* Bottom bar */}
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
function CookieBanner({ onShowDatenschutz }) {
    const [visible, setVisible] = useState(false)
    const bannerRef = useRef(null)

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

    const dismiss = (choice) => {
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
   APP — Main Composition
   ═══════════════════════════════════════════════════════════ */
export default function App() {
    const [showImpressum, setShowImpressum] = useState(false)
    const [showDatenschutz, setShowDatenschutz] = useState(false)

    useEffect(() => {
        // Refresh ScrollTrigger after all content loads
        const timeout = setTimeout(() => {
            ScrollTrigger.refresh()
        }, 500)
        return () => clearTimeout(timeout)
    }, [])

    return (
        <>
            <NoiseOverlay />
            <Impressum isOpen={showImpressum} onClose={() => setShowImpressum(false)} />
            <Datenschutz isOpen={showDatenschutz} onClose={() => setShowDatenschutz(false)} />
            <CookieBanner onShowDatenschutz={() => setShowDatenschutz(true)} />
            <main>
                <Hero />
                <ClaimSet1 />
                <ClaimSet2 />
                <Waitlist />
            </main>
            <Footer onShowImpressum={() => setShowImpressum(true)} onShowDatenschutz={() => setShowDatenschutz(true)} />
        </>
    )
}
