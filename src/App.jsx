import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowRight, ChevronDown, Leaf, Sun, Mountain, Truck, Droplets, Flame, Heart } from 'lucide-react'

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
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            tl.from('.hero-logo', { scale: 0.8, opacity: 0, duration: 1.2, delay: 0.3 })
                .from('.hero-line-1', { y: 30, opacity: 0, duration: 1 }, '-=0.8')
                .from('.hero-line-2', { y: 40, opacity: 0, duration: 1 }, '-=0.7')
                .from('.hero-line-3', { y: 40, opacity: 0, duration: 1 }, '-=0.7')
                .from('.hero-line-4', { y: 40, opacity: 0, duration: 1 }, '-=0.7')
                .from('.hero-cta', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
                .from('.hero-scroll-hint', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')

            // Sun pulsation
            if (sunRef.current) {
                gsap.to(sunRef.current, {
                    scale: 1.1,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                })
            }

            // Video Slowdown Logic
            if (video) {
                // Ensure video doesn't loop
                video.loop = false;

                const handleEnded = () => {
                    video.pause();
                    video.currentTime = video.duration;
                };
                video.addEventListener('ended', handleEnded);

                // Slow down as it approaches the end
                const checkTime = () => {
                    if (video.duration) {
                        const timeLeft = video.duration - video.currentTime;
                        // Start slowing down in the last 2 seconds
                        if (timeLeft < 2 && timeLeft > 0) {
                            const newRate = Math.max(0.1, timeLeft / 2);
                            video.playbackRate = newRate;
                        }
                    }
                    requestAnimationFrame(checkTime);
                };
                requestAnimationFrame(checkTime);
            }

            // Parallax on scroll
            gsap.to('.hero-video-wrap', {
                yPercent: 20,
                ease: 'none',
                scrollTrigger: {
                    trigger: heroRef.current,
                    start: 'top top',
                    end: 'bottom top',
                    scrub: true,
                },
            })

            if (video) {
                video.playbackRate = 1.0;
                video.play().catch(() => {
                    console.log('Autoplay blocked')
                })
            }
        }, heroRef)

        return () => ctx.revert()
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
            <div ref={sunRef} className="absolute top-16 md:top-20 right-6 md:right-16 w-24 md:w-40 lg:w-52 z-30 pointer-events-none">
                <img src="/assets/sun.png" alt="" className="w-full h-auto" />
            </div>

            {/* Hero Content — Centered Layout */}
            <div ref={textRef} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center">
                <div className="max-w-4xl flex flex-col items-center">
                    {/* Centered Logo */}
                    <div className="hero-logo mb-12 transform hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-32 md:h-48 lg:h-56 w-auto" />
                    </div>

                    <p className="hero-line-1 font-display text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-white/70 mb-4 md:mb-6">
                        Extra Natives Olivenöl aus der Mani
                    </p>
                    <h1 className="mb-6 md:mb-8 text-center flex flex-col items-center">
                        <span className="hero-line-2 block font-display font-800 text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[1.1]">
                            Upgrade
                        </span>
                        <span className="hero-line-3 block font-display font-800 text-3xl md:text-5xl lg:text-6xl tracking-tight text-white/90 leading-[0.9] -mt-2">
                            für
                        </span>
                        <span className="hero-line-4 block font-serif italic font-900 text-6xl md:text-9xl lg:text-[12rem] tracking-tight text-accent leading-[0.8] -mt-2">
                            alles.
                        </span>
                    </h1>
                    <p className="hero-line-3 text-white/60 text-base md:text-xl max-w-xl mb-10 font-light leading-relaxed">
                        Wir bringen Olivenöl der besten Qualität zu einem fairen Preis in deine Küche.
                    </p>
                    <a href="#waitlist" className="hero-cta btn-magnetic btn-accent text-base md:text-lg py-4 px-10 relative z-10">
                        Auf die Warteliste
                        <ArrowRight className="ml-2 w-5 h-5" />
                    </a>
                </div>
                {/* Scroll hint */}
                <div className="hero-scroll-hint absolute bottom-6 left-1/2 -translate-x-1/2 flex flex-col items-center text-white/40 animate-bounce z-30">
                    <span className="text-xs tracking-widest uppercase mb-1">Scroll</span>
                    <ChevronDown className="w-4 h-4" />
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
            desc: 'Die Mani-Halbinsel ist quasi ein einziger Sonnendeck. Über 300 Tage im Jahr knallt hier die Sonne auf die Olivenbäume. Besser geht nicht.',
            illustration: null,
        },
        {
            icon: <img src="/assets/mountains.png" alt="" className="w-full h-full object-contain scale-[1.5]" />,
            title: 'Berge & Meer',
            desc: 'Berge, die über 2.400 Meter aus dem Meer ragen. Mineralreiche Böden, Meeresluft und krasse Höhenunterschiede. Das schmeckst du in jedem Tropfen.',
            illustration: null,
        },
        {
            icon: <img src="/assets/illustrations/Pokal.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Weltklasse Qualität',
            desc: 'Nicht wir sagen das. Die Laborwerte sagen das. Polyphenolgehalt, Säuregrad, Geschmacksprofil: alles auf höchstem Niveau.',
            illustration: null,
        },
        {
            icon: <img src="/assets/illustrations/Present.png" alt="" className="w-12 h-12 md:w-16 md:h-16 object-contain" />,
            title: 'Direkt zu dir',
            desc: 'Kein Zwischenhändler, kein Aufschlag, kein Bullshit. Vom Olivenbauern in der Mani direkt in deine Küche.',
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
                                    className={`claim-card-${i} glass-card p-3 md:p-4 flex items-center gap-4 group hover:bg-white/10 ${i % 2 === 0 ? 'md:translate-x-[-1rem]' : 'md:translate-x-[1rem]'}`}
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
            desc: "Koroneiki-Oliven sind klein, aber haben es in sich. Intensiver Geschmack und der höchste Polyphenolgehalt aller Sorten. Deswegen nehmen wir auch nur die.",
            bg: "bg-[#0c5eaf]",
            illustration: "/assets/illustrations/Olive.png"
        },
        {
            headline: "Intensives Aroma",
            desc: "Scharf, fruchtig, mit einem Finish, das im Hals kitzelt. So muss gutes Olivenöl schmecken. Einmal probiert, willst du nichts anderes mehr.",
            bg: "bg-[#0a4d8f]", // Slightly darker blue
            illustration: "/assets/illustrations/Aroma.png"
        },
        {
            headline: "Reich an Gesundmachern",
            desc: "Vollgepackt mit Polyphenolen, Vitamin E und Antioxidantien. Unser Olivenöl ist nicht nur lecker. Es tut dir auch richtig gut.",
            bg: "bg-[#083b6e]", // Even darker blue
            illustration: "/assets/illustrations/Herz.png"
        }
    ];

    useEffect(() => {
        const mm = gsap.matchMedia();

        mm.add("(max-width: 767px)", () => {
            // Mobile: Sequential animation as we scroll
            cards.forEach((_, i) => {
                gsap.from(`.stack-card-${i}`, {
                    y: 100,
                    opacity: 0,
                    rotateX: -10,
                    duration: 1,
                    ease: "power3.out",
                    scrollTrigger: {
                        trigger: `.stack-card-${i}`,
                        start: "top 80%",
                    }
                });
            });
        });

        mm.add("(min-width: 768px)", () => {
            // Desktop: Pinned Stacking Effect
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
        });

        return () => mm.revert();
    }, []);

    return (
        <section ref={sectionRef} className="relative w-full min-h-[100svh] md:h-screen overflow-x-hidden md:overflow-hidden bg-primary py-24 md:py-0" id="qualitaet">
            <div ref={containerRef} className="relative w-full h-full flex flex-col md:flex-row items-center justify-center gap-12 md:gap-0">
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={`stack-card-${i} relative md:absolute w-full max-w-4xl px-6 md:px-0 flex items-center justify-center`}
                        style={{ zIndex: 10 + i }}
                    >
                        <div className={`w-full ${card.bg} rounded-[2.5rem] p-10 md:p-20 shadow-[-20px_40px_80px_rgba(0,0,0,0.4)] border border-white/10 flex flex-col md:flex-row gap-10 md:gap-16 items-center`}>
                            <div className="flex-1 text-center md:text-left">
                                <h2 className="font-serif italic font-900 text-5xl md:text-7xl text-white mb-6 leading-tight">
                                    {card.headline}
                                </h2>
                                <p className="text-white/70 text-lg md:text-xl font-light leading-relaxed mb-4">
                                    {card.desc}
                                </p>
                            </div>
                            <div className="hidden md:block w-72 h-72 relative">
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
            className="relative min-h-[100svh] flex items-center justify-center py-24 md:py-32 bg-primary overflow-hidden"
        >
            {/* Desktop Side-by-Side */}
            <div className="hidden lg:flex w-full h-full items-center max-w-7xl mx-auto px-16">
                {/* Left: Content */}
                <div className="w-1/2 waitlist-content relative z-20 text-left py-16 pr-12">
                    <p className="font-display text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">
                        Ernte 2026 / 2027
                    </p>
                    <h2 className="font-serif italic font-bold text-5xl xl:text-6xl text-white mb-6 leading-tight">
                        Sicher dir deinen Platz.
                    </h2>
                    <p className="text-white/60 text-lg xl:text-xl max-w-md leading-relaxed mb-10 font-light">
                        Trag dich für die nächste Ernte ein! Wir informieren dich, sobald der erste Tropfen fließt.
                    </p>

                    <div className="flex justify-start">
                        <a
                            href="https://deine-warteliste-url.de"
                            target="_blank"
                            rel="noopener noreferrer"
                            className="btn-magnetic btn-accent py-4 px-12 text-xl shadow-[0_0_30px_rgba(254,65,0,0.3)]"
                        >
                            Warteliste
                            <ArrowRight className="ml-3 w-5 h-5 flex-shrink-0" />
                        </a>
                    </div>
                </div>

                {/* Right: Video in a mask */}
                <div className="w-1/2 h-[70vh] relative">
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
                        <div className="absolute inset-0 bg-gradient-to-t from-primary/30 to-transparent" />
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
                    <div className="absolute inset-0 bg-black/40" />
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
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer() {
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
                            <a href="#" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Impressum</a>
                            <a href="#" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Datenschutz</a>
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
   APP — Main Composition
   ═══════════════════════════════════════════════════════════ */
export default function App() {
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
            <main>
                <Hero />
                <ClaimSet1 />
                <ClaimSet2 />
                <Waitlist />
            </main>
            <Footer />
        </>
    )
}
