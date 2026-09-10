"use client";

import { useEffect, useRef, useState } from 'react'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { ArrowDown, ArrowRight, ChevronDown, X } from 'lucide-react'
import { Link } from 'react-router-dom'
import ProductSection from '../components/ProductSection'
import { getSupabaseAssetUrl } from '../lib/supabaseAssets'

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
   FLOATING CTA — The persistent action button
   Stays visible the whole time and docks seamlessly into the
   waitlist section slot once reached.
   ═══════════════════════════════════════════════════════════ */
function FloatingCTA() {
    const scaleRef = useRef<HTMLDivElement>(null);
    const containerRef = useRef<HTMLDivElement>(null);
    const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

    useEffect(() => {
        const getGap = () => (window.innerWidth < 768 ? 32 : 48);

        const updateDock = () => {
            const slot = document.getElementById('waitlist-cta-slot');
            const container = containerRef.current;
            if (!slot || !container) return;

            const gap = getGap();
            const btnHeight = container.offsetHeight;
            const fixedTop = window.innerHeight - gap - btnHeight;
            const slotTop = slot.getBoundingClientRect().top;

            if (slotTop <= fixedTop) {
                // Dock: lock the button onto the slot's document position (seamless)
                const docTop = window.scrollY + slot.getBoundingClientRect().top;
                container.style.position = 'absolute';
                container.style.top = `${docTop}px`;
                container.style.bottom = 'auto';
            } else {
                // Float: keep button fixed at the bottom of the viewport
                container.style.position = 'fixed';
                container.style.top = 'auto';
                container.style.bottom = '';
            }
        };

        const handleScroll = () => {
            // Shrink the button while scrolling
            if (scaleRef.current) {
                gsap.to(scaleRef.current, {
                    scale: 0.75,
                    duration: 0.3,
                    ease: "power2.out",
                    overwrite: "auto"
                });
            }

            // Return to original size after scroll stops (100ms inactivity)
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            timeoutRef.current = setTimeout(() => {
                if (scaleRef.current) {
                    gsap.to(scaleRef.current, {
                        scale: 1,
                        duration: 0.5,
                        ease: "back.out(1.7)",
                        overwrite: "auto"
                    });
                }
            }, 100);

            updateDock();
        };

        window.addEventListener('scroll', handleScroll, { passive: true });
        window.addEventListener('resize', updateDock);

        const productSection = document.getElementById('unser-produkt');
        const sectionObserver = productSection
            ? new IntersectionObserver(([entry]) => {
                const hidden = entry.isIntersecting;
                const container = containerRef.current;
                const button = scaleRef.current;
                if (!container || !button) return;

                container.style.pointerEvents = hidden ? 'none' : 'auto';
                container.setAttribute('aria-hidden', hidden ? 'true' : 'false');
                const link = container.querySelector('a');
                if (link) {
                    link.tabIndex = hidden ? -1 : 0;
                    if (hidden && document.activeElement === link) link.blur();
                }
                gsap.to(button, {
                    opacity: hidden ? 0 : 1,
                    y: hidden ? 16 : 0,
                    duration: window.matchMedia('(prefers-reduced-motion: reduce)').matches ? 0 : 0.35,
                    ease: 'power2.out',
                    overwrite: 'auto',
                });
            })
            : null;

        if (productSection && sectionObserver) sectionObserver.observe(productSection);

        // Initial positioning (after layout settles)
        const initTimeout = setTimeout(updateDock, 300);

        return () => {
            window.removeEventListener('scroll', handleScroll);
            window.removeEventListener('resize', updateDock);
            sectionObserver?.disconnect();
            if (scaleRef.current) gsap.killTweensOf(scaleRef.current);
            if (timeoutRef.current) clearTimeout(timeoutRef.current);
            clearTimeout(initTimeout);
        };
    }, []);

    return (
        <div ref={containerRef} className="fixed bottom-8 md:bottom-12 left-1/2 -translate-x-1/2 z-[70] hero-cta">
            <div ref={scaleRef} className="will-change-transform">
                <Link
                    to="/waitlist"
                    className="btn-magnetic btn-accent text-base py-3 md:py-4 px-10 whitespace-nowrap shadow-[0_15px_45px_rgba(254,65,0,0.5)] border border-white/10"
                >
                    Jetzt sichern
                    <ArrowRight className="ml-2 w-5 h-5" />
                </Link>
            </div>
        </div>
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
                .to('.hero-line-1', { opacity: 1, y: 0, duration: 1 }, 0.5)

        }, heroRef)

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

            <div ref={sunRef} className="absolute top-12 md:top-16 lg:top-20 right-6 md:right-12 lg:right-16 w-16 md:w-24 lg:w-32 z-30 pointer-events-none">
                <img src={getSupabaseAssetUrl('Illustrations', 'sun.png')} alt="" className="w-full h-auto" />
            </div>

            <div ref={textRef} className="absolute inset-0 flex flex-col items-center justify-center z-20 px-6 text-center">
                <div className="max-w-4xl flex flex-col items-center">
                    <div className="hero-logo mb-6 md:mb-8 lg:mb-10 transform hover:scale-[1.02] transition-transform duration-500 cursor-pointer">
                        <img src="/assets/logo.png" alt="AKRIA" className="h-24 md:h-32 lg:h-44 w-auto" />
                    </div>

                    <p className="hero-line-1 font-display text-sm md:text-base lg:text-lg font-bold tracking-[0.25em] uppercase text-white mb-3 md:mb-4 drop-shadow-lg">
                        Extra Natives Olivenöl aus dem tiefen Süden Griechenlands
                    </p>
                    <h1 className="mb-6 md:mb-8 text-center flex flex-col items-center">
                        <span className="hero-line-2 block font-display font-800 text-5xl md:text-6xl lg:text-7xl tracking-tight text-white leading-[1.1]">
                            Upgrade
                        </span>
                        <span className="hero-line-3 small-line block font-display font-800 text-3xl md:text-4xl lg:text-5xl tracking-tight text-white Kaltenbach-Bold py-2">
                            für
                        </span>
                        <span className="hero-line-4 block font-serif italic font-900 text-6xl md:text-8xl lg:text-[9.5rem] tracking-tight text-accent leading-[0.8]">
                            alles.
                        </span>
                    </h1>
                    
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
            phase: 'JETZT',
            title: 'Zugang zur Ernte 26/27 sichern',
            desc: 'Wir ernten nur einmal im Jahr.',
            descAfter: 'und wir informieren dich als Erstes, sobald die Vorbestellung für diese Saison startet.',
        },
        {
            phase: 'HERBST 2026',
            title: 'Vorbestellung öffnet',
            desc: 'Du erhältst eine E-Mail von uns und kannst deine gewünschte Menge verbindlich vorbestellen. Voraussichtlich 17–19 € pro Liter, abhängig von der Ernte.',
        },
        {
            phase: 'FRÜHJAHR 2027',
            title: 'Erhalte dein Olivenöl',
            desc: 'Per Post zu dir nach Hause oder bei unserem kostenlosen Abholevent mit Verkostung.',
        },
    ]

    useEffect(() => {
        const media = gsap.matchMedia()
        const ctx = gsap.context(() => {
            media.add('(min-width: 1024px)', () => {
                claims.forEach((_, i) => {
                    gsap.set(`.claim-card-${i}`, {
                        opacity: i === 0 ? 1 : 0,
                        x: i === 0 ? 0 : (i % 2 === 0 ? -40 : 40),
                        y: 0,
                    })
                    if (i < claims.length - 1) {
                        gsap.set(`.claim-arrow-${i}`, { opacity: 0, y: -6 })
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

                    if (i > 0) {
                        tl.to(`.claim-card-${i}`, {
                            opacity: 1,
                            x: 0,
                            duration: 1,
                            ease: 'power2.out',
                        }, startTime)
                    }

                    if (i < claims.length - 1) {
                        tl.to(`.claim-arrow-${i}`, {
                            opacity: 1,
                            y: 0,
                            duration: 0.3,
                            ease: 'sine.out',
                        }, startTime + 0.9)
                    }
                })
            })

            media.add('(max-width: 1023px)', () => {
                gsap.set('.claim-card-0', { opacity: 1, x: 0, y: 0 })

                claims.forEach((_, i) => {
                    if (i > 0) {
                        gsap.fromTo(`.claim-card-${i}`,
                            { opacity: 0, y: 32 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.65,
                                ease: 'power2.out',
                                scrollTrigger: {
                                    trigger: `.claim-card-${i}`,
                                    start: 'top 88%',
                                    once: true,
                                },
                            },
                        )
                    }

                    if (i < claims.length - 1) {
                        gsap.fromTo(`.claim-arrow-${i}`,
                            { opacity: 0, y: -6 },
                            {
                                opacity: 1,
                                y: 0,
                                duration: 0.3,
                                ease: 'sine.out',
                                scrollTrigger: {
                                    trigger: `.claim-arrow-${i}`,
                                    start: 'top 90%',
                                    once: true,
                                },
                            },
                        )
                    }
                })
            })

            const video = sectionRef.current?.querySelector('video')
            if (video) {
                video.play().catch(() => { })
            }
        }, sectionRef)

        return () => {
            media.revert()
            ctx.revert()
        }
    }, [])

    return (
        <section
            ref={sectionRef}
            id="herkunft"
            className="relative min-h-[100svh] w-full bg-primary overflow-visible lg:overflow-hidden pt-10 md:pt-32 pb-16"
        >
            <div className="w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex flex-col h-full">
                <h2 className="font-display text-2xl md:text-3xl lg:text-4xl xl:text-5xl font-bold mb-8 md:mb-16 text-white/95 text-center lg:text-left leading-[1.1] max-w-5xl tracking-tight">
                    In 3 Schritten von der Ernte zu deinem Olivenöl
                </h2>

                <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-16 items-start lg:items-center flex-1">
                    <div className="relative flex flex-col gap-2 md:gap-3 order-1">
                        {claims.map((claim, i) => (
                            <div key={i} className="relative pt-3 md:pt-4">
                                <div
                                    className={`claim-card-${i} glass-card relative p-5 md:p-8 flex flex-col gap-3 group hover:bg-white/10`}
                                >
                                    <p className="absolute -top-3 md:-top-4 left-5 md:left-8 z-10 font-display text-base md:text-lg font-bold tracking-[0.12em] uppercase text-accent">
                                        {claim.phase}
                                    </p>
                                    <h3 className="font-display font-bold text-lg md:text-2xl text-white">
                                        {claim.title}
                                    </h3>
                                    <p className="text-white/70 text-sm md:text-base leading-relaxed">
                                        {claim.desc}{' '}
                                        {claim.descAfter && (
                                            <>
                                                <Link
                                                    to="/waitlist"
                                                    className="font-semibold text-accent underline decoration-accent/60 underline-offset-4 transition-colors hover:text-white focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                                                >
                                                    Trag dich jetzt ein
                                                </Link>{' '}
                                                {claim.descAfter}
                                            </>
                                        )}
                                    </p>
                                </div>

                                {i < claims.length - 1 && (
                                    <div className="relative z-10 flex h-8 items-center justify-center md:h-10">
                                        <ArrowDown
                                            className={`claim-arrow-${i} h-6 w-6 text-accent md:h-7 md:w-7`}
                                            strokeWidth={2.5}
                                            aria-hidden="true"
                                        />
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
                                <source src={getSupabaseAssetUrl('Vids_Images', 'Oil Flowing From Press.mp4')} type="video/mp4" />
                            </video>
                        </div>
                    </div>
                </div>
            </div>
        </section>
    )
}

/* ═══════════════════════════════════════════════════════════
   WAITLIST CTA — Unified Full-Bleed Design
   ═══════════════════════════════════════════════════════════ */
function WaitlistSection() {
    const sectionRef = useRef<HTMLElement>(null)

    useEffect(() => {
        const ctx = gsap.context(() => {
            const tl = gsap.timeline({
                scrollTrigger: {
                    trigger: sectionRef.current,
                    start: 'top 60%',
                    toggleActions: 'play none none reverse',
                }
            });

            tl.from('.waitlist-content-items > *', {
                y: 40,
                opacity: 0,
                stagger: 0.15,
                duration: 0.8,
                ease: 'power3.out',
            })
            .to('.waitlist-glass-bg', {
                opacity: 1,
                duration: 1,
                ease: 'power2.inOut',
            }, "-=0.2");

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
            className="relative min-h-[100svh] flex items-center justify-center bg-primary overflow-hidden"
        >
            <div className="absolute inset-0 w-full h-full z-0">
                <div className="absolute inset-0 bg-black/40 z-10" />
                <video
                    autoPlay
                    muted
                    loop
                    playsInline
                    preload="auto"
                    className="absolute inset-0 w-full h-full object-cover"
                >
                    <source src={getSupabaseAssetUrl('Vids_Images', 'Strand Bus Phoneas.mp4')} type="video/mp4" />
                </video>
            </div>

            <div className="relative z-20 w-full max-w-7xl mx-auto px-6 md:px-12 lg:px-16 flex items-center justify-center h-full min-h-[100svh]">
                <div className="relative w-full max-w-2xl mx-auto p-8 md:p-12 lg:p-16 text-center">
                    <div className="waitlist-glass-bg absolute inset-0 glass-card rounded-[2.5rem] opacity-0" />
                    
                    <div className="waitlist-content-items relative z-10 flex flex-col items-center">
                        <p className="font-display text-xs lg:text-sm font-semibold tracking-[0.2em] uppercase text-accent mb-4">
                            Ernte 2026/27
                        </p>
                        <h2 className="font-serif italic font-bold text-4xl lg:text-5xl xl:text-6xl text-white mb-6 leading-tight drop-shadow-2xl">
                            Zugang zur Ernte 26/27 sichern
                        </h2>
                        <p className="text-white/80 text-base lg:text-lg max-w-md mx-auto leading-relaxed mb-8 font-light drop-shadow-lg">
                            Deine Anmeldung ist unverbindlich und reserviert keine Menge. Wir informieren dich im Herbst 2026, sobald die Vorbestellung startet.
                        </p>

                        {/* Slot where the persistent floating CTA docks into place */}
                        <div id="waitlist-cta-slot" className="mt-2 h-14 md:h-16 w-full flex justify-center" />
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
                            E-Mail: <a href="mailto:meyertiffertgbr@gmail.com" className="text-accent hover:underline">meyertiffertgbr@gmail.com</a>
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
   FOOTER
   ═══════════════════════════════════════════════════════════ */
function Footer({ onShowImpressum }: { onShowImpressum: () => void }) {
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
                            <a href="#unser-produkt" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Unser Produkt</a>
                            <Link to="/waitlist" className="text-white/40 hover:text-white text-sm hover-lift transition-colors">Warteliste</Link>
                        </div>
                    </div>

                    <div>
                        <h4 className="font-display font-semibold text-white/80 text-sm uppercase tracking-wider mb-4">Rechtliches</h4>
                        <div className="flex flex-col gap-2">
                            <button onClick={onShowImpressum} className="text-white/40 hover:text-white text-sm hover-lift transition-colors text-left focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Impressum</button>
                            <Link to="/datenschutz" className="text-white/40 hover:text-white text-sm hover-lift transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent">Datenschutz</Link>
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
   COOKIE BANNER
   ═══════════════════════════════════════════════════════════ */
function CookieBanner() {
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

    const dismiss = () => {
        localStorage.setItem('akria-cookie-consent', 'acknowledged')
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
                    <span className="text-2xl" role="img" aria-label="Olive">🫒</span>
                    <p className="font-display font-bold text-white text-sm uppercase tracking-widest">
                        Hinweis zum Browser-Speicher
                    </p>
                </div>

                <p className="text-white/60 text-sm leading-relaxed mb-5">
                    Diese Website nutzt technisch erforderlichen Browser-Speicher für grundlegende Funktionen. Es werden keine Analyse- oder Marketing-Cookies eingesetzt.{' '}
                    <Link
                        to="/datenschutz"
                        className="text-accent underline hover:text-white transition-colors focus-visible:rounded-sm focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent"
                    >
                        Mehr erfahren
                    </Link>
                </p>

                <button
                    onClick={dismiss}
                    className="btn-magnetic btn-accent w-full py-3 text-sm shadow-[0_0_20px_rgba(254,65,0,0.25)]"
                >
                    Verstanden
                </button>
            </div>
        </div>
    )
}

/* ═══════════════════════════════════════════════════════════
   INDEX PAGE — Main Composition
   ═══════════════════════════════════════════════════════════ */
export default function Index() {
    const [showImpressum, setShowImpressum] = useState(false)

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
            <CookieBanner />
            
            <FloatingCTA />
            
            <main>
                <Hero />
                <ClaimSet1 />
                <ProductSection />
                <WaitlistSection />
            </main>
            <Footer onShowImpressum={() => setShowImpressum(true)} />
        </div>
    )
}