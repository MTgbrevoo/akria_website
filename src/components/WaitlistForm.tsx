import { useState, useRef, useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import * as z from 'zod';
import { gsap } from 'gsap';
import { Loader2, CheckCircle2 } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Checkbox } from '@/components/ui/checkbox';
import { cn } from '@/lib/utils';

const waitlistSchema = z.object({
  firstName: z.string().min(1, 'Vorname ist erforderlich'),
  lastName: z.string().min(1, 'Nachname ist erforderlich'),
  email: z.string().email('Ungültige E-Mail-Adresse'),
  location: z.string().min(1, 'Wohnort ist erforderlich'),
  suggestions: z.string().optional(),
  privacyAccepted: z.boolean().refine(v => v === true, 'Datenschutzerklärung muss akzeptiert werden'),
});

type WaitlistFormData = z.infer<typeof waitlistSchema>;

export function WaitlistForm() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isSuccess, setIsSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const successRef = useRef<HTMLDivElement>(null);

  const {
    register,
    handleSubmit,
    setValue,
    watch,
    formState: { errors },
  } = useForm<WaitlistFormData>({
    resolver: zodResolver(waitlistSchema),
    defaultValues: {
      privacyAccepted: false,
    },
  });

  const privacyAccepted = watch('privacyAccepted');

  const onSubmit = async (data: WaitlistFormData) => {
    setIsSubmitting(true);
    setError(null);
    try {
      const response = await fetch('/api/waitlist', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || 'Etwas ist schiefgelaufen');
      }

      setIsSuccess(true);
    } catch (err: any) {
      setError(err.message || 'Verbindungsfehler. Bitte versuche es später erneut.');
    } finally {
      setIsSubmitting(false);
    }
  };

  useEffect(() => {
    if (isSuccess && successRef.current) {
      gsap.fromTo(
        successRef.current,
        { scale: 0.8, opacity: 0 },
        { scale: 1, opacity: 1, duration: 0.6, ease: 'back.out(1.7)' }
      );
    }
  }, [isSuccess]);

  if (isSuccess) {
    return (
      <div 
        ref={successRef}
        className="text-center py-12 px-6 flex flex-col items-center justify-center space-y-6"
      >
        <div className="w-20 h-20 bg-accent/20 rounded-full flex items-center justify-center">
          <CheckCircle2 className="w-12 h-12 text-accent" />
        </div>
        <div className="space-y-2">
          <h2 className="text-3xl font-serif italic font-bold text-white">Willkommen im Kreis!</h2>
          <p className="text-white/60 text-lg max-w-sm">
            Deine Anmeldung war erfolgreich. Wir melden uns bei dir, sobald die Ernte 2026 bereit ist.
          </p>
        </div>
        <Button 
          variant="outline" 
          onClick={() => window.location.href = '/'}
          className="mt-4 border-white/20 text-white hover:bg-white/10"
        >
          Zurück zur Startseite
        </Button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="firstName">Vorname</Label>
          <Input
            id="firstName"
            placeholder="Max"
            {...register('firstName')}
            className={cn(errors.firstName && "border-red-500")}
          />
          {errors.firstName && <p className="text-xs text-red-500">{errors.firstName.message}</p>}
        </div>
        <div className="space-y-2">
          <Label htmlFor="lastName">Nachname</Label>
          <Input
            id="lastName"
            placeholder="Mustermann"
            {...register('lastName')}
            className={cn(errors.lastName && "border-red-500")}
          />
          {errors.lastName && <p className="text-xs text-red-500">{errors.lastName.message}</p>}
        </div>
      </div>

      <div className="space-y-2">
        <Label htmlFor="email">E-Mail</Label>
        <Input
          id="email"
          type="email"
          placeholder="max@beispiel.de"
          {...register('email')}
          className={cn(errors.email && "border-red-500")}
        />
        {errors.email && <p className="text-xs text-red-500">{errors.email.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="location">Wohnort</Label>
        <Input
          id="location"
          placeholder="Berlin, Deutschland"
          {...register('location')}
          className={cn(errors.location && "border-red-500")}
        />
        {errors.location && <p className="text-xs text-red-500">{errors.location.message}</p>}
      </div>

      <div className="space-y-2">
        <Label htmlFor="suggestions">Wünsche oder Vorschläge (Optional)</Label>
        <Textarea
          id="suggestions"
          placeholder="Was wünschst du dir von AKRIA?"
          {...register('suggestions')}
        />
      </div>

      <div className="flex items-start space-x-2">
        <Checkbox
          id="privacy"
          checked={privacyAccepted}
          onCheckedChange={(checked) => setValue('privacyAccepted', checked as boolean)}
          className={cn(errors.privacyAccepted && "border-red-500")}
        />
        <Label 
          htmlFor="privacy" 
          className="text-xs leading-relaxed font-normal cursor-pointer select-none"
        >
          Ich habe die <button type="button" className="text-accent hover:underline">Datenschutzerklärung</button> gelesen und akzeptiere die Verarbeitung meiner Daten zur Wartelisten-Vormerkung.
        </Label>
      </div>
      {errors.privacyAccepted && <p className="text-xs text-red-500">{errors.privacyAccepted.message}</p>}

      {error && (
        <div className="p-3 rounded bg-red-500/10 border border-red-500/20 text-red-500 text-sm">
          {error}
        </div>
      )}

      <Button
        type="submit"
        disabled={isSubmitting}
        className="w-full h-12 text-lg font-bold bg-accent hover:bg-accent/90 text-white shadow-[0_0_20px_rgba(254,65,0,0.3)]"
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-5 w-5 animate-spin" />
            Wird gesendet...
          </>
        ) : (
          "Eintragen"
        )}
      </Button>
    </form>
  );
}
