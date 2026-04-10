import React, { useEffect, useRef, useState } from 'react';
import { gsap } from 'gsap';
import { CheckCircle2, ArrowRight } from 'lucide-react';
import { Link, useNavigate } from 'react-router-dom';
import { supabase } from '../integrations/supabase/client';

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

export default function Success() {
    const containerRef = useRef<HTMLDivElement>(null);
    const [status, setStatus] = useState<'loading' | 'success' | 'error'>('loading');
    const [errorMessage, setErrorMessage] = useState('');
    const navigate = useNavigate();

    useEffect(() => {
        let isMounted = true;

        const processSession = async () => {
            try {
                // Wait a tiny bit to ensure Supabase auth state is fully populated from URL hash
                await new Promise(resolve => setTimeout(resolve, 500));
                
                const { data: { session }, error: sessionError } = await supabase.auth.getSession();
                
                if (sessionError) throw sessionError;
                
                if (!session) {
                    // Check if it's processing the hash
                    const hash = window.location.hash;
                    if (hash && hash.includes('access_token')) {
                         // Still processing auth callback
                         return;
                    }
                    throw new Error('Keine gültige Sitzung gefunden. Bitte versuche den Bestätigungslink erneut zu klicken.');
                }

                const user = session.user;
                const metadata = user.user_metadata || {};
                const email = user.email;

                if (!email) throw new Error('E-Mail-Adresse konnte nicht ermittelt werden.');

                // Check if user already exists in ernte2026 table
                const { data: existingEntry, error: checkError } = await supabase
                    .from('ernte2026')
                    .select('email')
                    .eq('email', email)
                    .maybeSingle();

                if (checkError) throw checkError;

                // If not existing, insert them
                if (!existingEntry) {
                    const { error: insertError } = await supabase
                        .from('ernte2026')
                        .insert([{
                            email: email,
                            firstname: metadata.firstname || '',
                            lastname: metadata.lastname || '',
                            location: metadata.location || '',
                            notes: metadata.notes || '',
                            marketing_consent: metadata.marketing_consent === true
                        }]);

                    if (insertError) throw insertError;
                }

                if (isMounted) {
                    setStatus('success');
                    
                    // Trigger success animation
                    if (containerRef.current) {
                        gsap.from('.success-content', {
                            y: 30,
                            opacity: 0,
                            duration: 0.8,
                            ease: 'power3.out',
                            stagger: 0.2
                        });
                        gsap.from('.success-icon', {
                            scale: 0.5,
                            opacity: 0,
                            duration: 0.6,
                            ease: 'back.out(1.5)',
                            delay: 0.2
                        });
                    }
                }
            } catch (err: any) {
                console.error('Success page error:', err);
                if (isMounted) {
                    setStatus('error');
                    setErrorMessage(err.message || 'Ein Fehler ist aufgetreten.');
                }
            }
        };

        const { data: authListener } = supabase.auth.onAuthStateChange((event, session) => {
            if (event === 'SIGNED_IN' && session) {
                processSession();
            }
        });

        // Initial check
        processSession();

        return () => {
            isMounted = false;
            authListener.subscription.unsubscribe();
        };
    }, []);

    return (
        <div ref={containerRef} className="min-h-[100svh] w-full bg-primary relative flex items-center justify-center p-6 overflow-hidden">
            <NoiseOverlay />
            
            <div className="absolute top-[-10%] right-[-10%] w-[40%] aspect-square bg-accent/10 rounded-full blur-[120px] pointer-events-none" />
            <div className="absolute bottom-[-10%] left-[-10%] w-[40%] aspect-square bg-blue-500/10 rounded-full blur-[120px] pointer-events-none" />

            <div className="max-w-2xl w-full relative z-10">
                <div className="glass-card p-8 md:p-16 rounded-[2.5rem] border border-white/10 shadow-2xl relative overflow-hidden text-center">
                    
                    {status === 'loading' && (
                        <div className="py-12 flex flex-col items-center justify-center">
                            <div className="w-16 h-16 border-4 border-accent/20 border-t-accent rounded-full animate-spin mb-6"></div>
                            <h2 className="font-serif italic font-bold text-2xl text-white">
                                Anmeldung wird bestätigt...
                            </h2>
                        </div>
                    )}

                    {status === 'success' && (
                        <div className="py-8">
                            <div className="flex justify-center mb-8 success-icon">
                                <CheckCircle2 className="w-24 h-24 text-accent" />
                            </div>
                            <h1 className="success-content font-serif italic font-bold text-4xl md:text-5xl lg:text-6xl text-white mb-6">
                                Du bist dabei!
                            </h1>
                            <p className="success-content text-white/70 text-lg md:text-xl mb-10 max-w-md mx-auto leading-relaxed">
                                Deine E-Mail-Adresse wurde erfolgreich bestätigt. Wir haben dich auf die Warteliste für die nächste Ernte gesetzt.
                            </p>
                            <div className="success-content">
                                <Link to="/" className="btn-magnetic btn-accent py-4 px-10 inline-flex items-center text-lg shadow-[0_0_30px_rgba(254,65,0,0.3)] group">
                                    Zurück zur Startseite
                                    <ArrowRight className="ml-2 w-5 h-5 group-hover:translate-x-1 transition-transform" />
                                </Link>
                            </div>
                        </div>
                    )}

                    {status === 'error' && (
                        <div className="py-8">
                            <h2 className="font-serif italic font-bold text-3xl text-white mb-4">
                                Entschuldigung!
                            </h2>
                            <div className="p-4 bg-red-500/10 border border-red-500/20 rounded-2xl text-red-400 text-base mb-8 max-w-md mx-auto">
                                {errorMessage}
                            </div>
                            <p className="text-white/60 mb-8">
                                Es gab ein Problem bei der Bestätigung. Bitte versuche es später noch einmal oder registriere dich neu.
                            </p>
                            <Link to="/waitlist" className="btn-magnetic bg-white/10 hover:bg-white/20 text-white py-3 px-8 rounded-full transition-colors inline-flex items-center">
                                Zurück zur Warteliste
                            </Link>
                        </div>
                    )}

                </div>
            </div>
        </div>
    );
}