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
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({ defaults: { ease: 'power3.out' } })

            tl.from('.hero-logo', { scale: 0.8, opacity: 0, duration: 1.2, delay: 0.3 })
                .from('.hero-line-1', { y: 30, opacity: 0, duration: 1 }, '-=0.8')
                .from('.hero-line-2', { y: 40, opacity: 0, duration: 1 }, '-=0.7')
                .from('.hero-line-3', { y: 40, opacity: 0, duration: 1 }, '-=0.7')
                .from('.hero-cta', { y: 30, opacity: 0, duration: 0.8 }, '-=0.6')
                .from('.hero-scroll-hint', { y: 20, opacity: 0, duration: 0.6 }, '-=0.5')

            // Sun pulsation via GSAP (pulsate only, no rotation)
            if (sunRef.current) {
                gsap.to(sunRef.current, {
                    scale: 1.1,
                    duration: 2.5,
                    repeat: -1,
                    yoyo: true,
                    ease: 'power1.inOut',
                })
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
        }, heroRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={heroRef} className="relative h-[100svh] w-full overflow-hidden" id="hero">
            {/* Background Video */}
            <div className="hero-video-wrap absolute inset-0 w-full h-full">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                    poster="/assets/hero-photo.jpg"
                >
                    <source src="/assets/hero-drone.mp4" type="video/mp4" />
                </video>

            </div>

            {/* Sun Illustration — top right */}
            <div ref={sunRef} className="absolute top-16 md:top-20 right-6 md:right-16 w-24 md:w-40 lg:w-52 z-10 pointer-events-none">
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
                    <h1 className="mb-6 md:mb-8 text-center">
                        <span className="hero-line-2 block font-display font-800 text-5xl md:text-7xl lg:text-8xl tracking-tight text-white leading-[1.1]">
                            Höchste
                        </span>
                        <span className="hero-line-3 block font-serif italic font-900 text-6xl md:text-9xl lg:text-[12rem] tracking-tight text-accent leading-[0.9]">
                            Stufe.
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
                {/* Scroll hint - hidden on small mobile to avoid overlap */}
                <div className="hero-scroll-hint hidden md:flex absolute bottom-6 left-1/2 -translate-x-1/2 flex-col items-center text-white/40 animate-bounce">
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
            icon: <HandDrawnIcon.Badge className="w-10 h-10 md:w-14 md:h-14" />,
            title: 'Weltklasse Qualität',
            desc: 'Nicht wir sagen das. Die Laborwerte sagen das. Polyphenolgehalt, Säuregrad, Geschmacksprofil: alles auf höchstem Niveau.',
            illustration: null,
        },
        {
            icon: <HandDrawnIcon.Box className="w-10 h-10 md:w-14 md:h-14" />,
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
                        end: `+=${claims.length * 100}%`,
                        pin: true,
                        scrub: 1,
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
                    <div className="relative flex flex-col gap-3 md:gap-4">
                        <h2 className="font-display text-2xl md:text-3xl font-bold mb-4 md:mb-8 text-white/90">
                            Von der Mani zu dir.
                        </h2>
                        {claims.map((claim, i) => (
                            <div key={i} className="relative">
                                <div
                                    className={`claim-card-${i} glass-card p-4 md:p-5 flex items-center gap-5 group hover:bg-white/10`}
                                >
                                    <div className="flex-shrink-0 w-12 h-12 md:w-16 md:h-16 flex items-center justify-center">
                                        {claim.icon}
                                    </div>
                                    <div className="flex-1">
                                        <h3 className="font-display font-bold text-lg md:text-2xl text-white mb-1">
                                            {claim.title}
                                        </h3>
                                        <p className="text-white/60 text-sm md:text-base leading-relaxed">
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
                                            className={`claim-arrow-${i} w-12 h-12 md:w-24 md:h-24 mx-auto my-[-0.5rem] md:my-[-1rem] text-accent z-20`}
                                            viewBox="0 0 100 100"
                                            fill="none"
                                            xmlns="http://www.w3.org/2000/svg"
                                        >
                                            <path
                                                d="M50 10 C 45 35, 55 45, 50 80 M 35 65 C 40 75, 50 85, 50 80 M 65 65 C 60 75, 50 85, 50 80"
                                                stroke="currentColor"
                                                strokeWidth="3"
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
   CLAIM SET 2 — Stacking Full-Screen Cards
   100% Koroneiki → Intensives Aroma → Reich an Gesundmachern
   ═══════════════════════════════════════════════════════════ */
function ClaimSet2() {
    const sectionRef = useRef(null)
    const cardsRef = useRef(null)

    const cards = [
        {
            title: '100% Koroneiki-Oliven',
            subtitle: 'Eine Sorte. Die Beste.',
            desc: 'Koroneiki-Oliven sind klein, aber haben es in sich. Intensiver Geschmack und der höchste Polyphenolgehalt aller Sorten. Deswegen nehmen wir auch nur die.',
            icon: <HandDrawnIcon.Droplet className="w-12 h-12 md:w-16 md:h-16" />,
            bg: 'bg-primary',
            accent: 'text-accent',
            illustration: '/assets/waves.png',
        },
        {
            title: 'Intensives Aroma',
            subtitle: 'Vergiss Supermarktöl.',
            desc: 'Scharf, fruchtig, mit einem Finish, das im Hals kitzelt. So muss gutes Olivenöl schmecken. Einmal probiert, willst du nichts anderes mehr.',
            icon: <HandDrawnIcon.Flame className="w-12 h-12 md:w-16 md:h-16" />,
            bg: 'from-[#0a4d8f] to-primary-dark',
            accent: 'text-orange-300',
            illustration: '/assets/mountains.png',
        },
        {
            title: 'Reich an Gesundmachern',
            subtitle: 'Flüssiges Gold. Wortwörtlich.',
            desc: 'Vollgepackt mit Polyphenolen, Vitamin E und Antioxidantien. Unser Olivenöl ist nicht nur lecker. Es tut dir auch richtig gut.',
            icon: <HandDrawnIcon.Heart className="w-12 h-12 md:w-16 md:h-16" />,
            bg: 'from-primary-dark to-[#062d54]',
            accent: 'text-emerald-300',
            illustration: '/assets/sun.png',
        },
    ]

    useEffect(() => {
        const ctx = gsap.context(() => {
            const cardElements = gsap.utils.toArray('.stack-card-inner')

            // Force 1-swipe = 1-card by normalizing scroll behavior
            ScrollTrigger.normalizeScroll(true)

            cardElements.forEach((card, i) => {
                if (i < cardElements.length - 1) {
                    ScrollTrigger.create({
                        trigger: card,
                        start: 'top top',
                        end: 'bottom top',
                        pin: true,
                        pinSpacing: false,
                        snap: {
                            snapTo: 1,
                            duration: 0.3,
                            delay: 0,
                            ease: 'power2.inOut'
                        },
                        onUpdate: (self) => {
                            const progress = self.progress
                            const isMobile = window.innerWidth < 768
                            gsap.to(card, {
                                scale: 1 - progress * 0.15,
                                filter: isMobile ? 'none' : `blur(${progress * 15}px)`,
                                opacity: 1 - progress * 0.7,
                                duration: 0.1,
                                ease: 'none'
                            })
                        },
                    })
                }
            })

            // Animate card content on enter
            cardElements.forEach((card, i) => {
                const content = card.querySelector('.card-content')
                gsap.from(content.children, {
                    y: 60,
                    opacity: 0,
                    stagger: 0.1,
                    duration: 1,
                    ease: 'power3.out',
                    scrollTrigger: {
                        trigger: card,
                        start: 'top 60%',
                        toggleActions: 'play none none reverse',
                    },
                })
            })
        }, sectionRef)

        return () => ctx.revert()
    }, [])

    return (
        <section ref={sectionRef} id="qualitaet" className="relative bg-primary-dark">
            <div ref={cardsRef}>
                {cards.map((card, i) => (
                    <div
                        key={i}
                        className={`stack-card-inner min-h-[100svh] w-full ${card.bg} flex items-center justify-center relative overflow-hidden 
                        ${i > 0 ? 'shadow-[0_-20px_50px_rgba(0,0,0,0.3)] rounded-t-[3rem] md:rounded-t-[4rem]' : ''}`}
                    >

                        {/* Decorative illustration */}
                        <img
                            src={card.illustration}
                            alt=""
                            className="absolute right-0 top-1/2 -translate-y-1/2 w-64 md:w-96 pointer-events-none"
                        />

                        <div className="card-content relative z-10 max-w-4xl mx-auto px-6 md:px-16 text-center">
                            <div className={`inline-flex items-center justify-center w-20 h-20 md:w-24 md:h-24 rounded-3xl bg-white/5 backdrop-blur-sm border border-white/10 mb-8 ${card.accent}`}>
                                {card.icon}
                            </div>
                            <p className="text-white/50 font-display text-sm md:text-base font-semibold tracking-[0.15em] uppercase mb-3">
                                {card.subtitle}
                            </p>
                            <h2 className="font-serif italic font-bold text-4xl md:text-6xl lg:text-7xl text-white mb-6 md:mb-8 leading-tight">
                                {card.title}
                            </h2>
                            <p className="text-white/60 text-lg md:text-xl max-w-2xl mx-auto leading-relaxed font-light">
                                {card.desc}
                            </p>
                        </div>

                        {/* Card number */}
                        <div className="absolute bottom-8 left-8 md:left-16 font-display font-bold text-7xl md:text-9xl text-white/[0.03]">
                            0{i + 1}
                        </div>
                    </div>
                ))}
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   WAITLIST CTA
   ═══════════════════════════════════════════════════════════ */
function Waitlist() {
    const sectionRef = useRef(null)
    const [email, setEmail] = useState('')
    const [submitted, setSubmitted] = useState(false)

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
        }, sectionRef)
        return () => ctx.revert()
    }, [])

    const handleSubmit = (e) => {
        e.preventDefault()
        if (email) setSubmitted(true)
    }

    return (
        <section
            ref={sectionRef}
            id="waitlist"
            className="relative min-h-[100svh] flex items-center justify-center py-24 md:py-32 bg-primary overflow-hidden"
        >
            {/* Background Video (Olive Trees) */}
            <div className="absolute inset-0 w-full h-full">
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src="/assets/hero-drone.mp4" type="video/mp4" />
                </video>
            </div>

            <div className="waitlist-content relative z-20 max-w-3xl mx-auto px-6 md:px-12 py-16 md:py-20 text-center backdrop-blur-xl bg-black/30 rounded-[3rem] border border-white/10 shadow-2xl">
                <p className="font-display text-sm md:text-base font-semibold tracking-[0.2em] uppercase text-accent mb-4">
                    Ernte 2026 / 2027
                </p>
                <h2 className="font-serif italic font-bold text-4xl md:text-6xl lg:text-7xl text-white mb-6 leading-tight">
                    Bald ist es soweit.
                </h2>
                <p className="text-white/60 text-lg md:text-xl max-w-xl mx-auto leading-relaxed mb-10 font-light">
                    Trag dich ein und sei unter den Ersten, die unser Olivenöl probieren. Kein Spam, versprochen. Nur ein kurzes Heads-up, wenn's losgeht.
                </p>

                {!submitted ? (
                    <form onSubmit={handleSubmit} className="flex flex-col sm:flex-row items-center gap-3 max-w-md mx-auto">
                        <input
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            placeholder="Deine E-Mail Adresse"
                            required
                            className="flex-1 w-full sm:w-auto px-6 py-4 rounded-full bg-white/10 backdrop-blur-sm border border-white/20 text-white placeholder-white/40 text-base focus:outline-none focus:border-accent/60 focus:ring-2 focus:ring-accent/20 transition-all"
                        />
                        <button
                            type="submit"
                            className="btn-magnetic btn-accent w-full sm:w-auto py-4 px-8 text-base"
                        >
                            Ich bin dabei
                            <ArrowRight className="ml-2 w-5 h-5" />
                        </button>
                    </form>
                ) : (
                    <div className="glass-card p-8 max-w-md mx-auto">
                        <div className="text-accent text-4xl mb-4">🫒</div>
                        <h3 className="font-display font-bold text-xl text-white mb-2">Du bist auf der Liste!</h3>
                        <p className="text-white/60">Wir melden uns, sobald die frische Ernte da ist.</p>
                    </div>
                )}

                <p className="text-white/30 text-xs mt-6">
                    Wir verwenden deine E-Mail nur, um dich über die Ernte zu informieren. Kein Spam.
                </p>
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
