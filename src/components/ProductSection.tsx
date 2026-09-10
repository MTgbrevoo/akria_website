import { useEffect, useRef, useState } from 'react'
import { ArrowRight, Check } from 'lucide-react'
import { Link } from 'react-router-dom'
import { gsap } from 'gsap'
import { ScrollTrigger } from 'gsap/ScrollTrigger'
import { getSupabaseAssetUrl } from '../lib/supabaseAssets'

gsap.registerPlugin(ScrollTrigger)

type StoryStep = {
  text: string
  image: string
  alt: string
}

const PRODUCT_FOLDER = 'Unser-Produkt'

const storySteps: StoryStep[] = [
  {
    text: 'Die Oliven werden ganz am Anfang der Saison geerntet. Hier sind sie klein, grün und hart wie Stein.',
    image: '01-oliven-am-baum.webp',
    alt: 'Grüne Koroneiki-Oliven an einem Olivenbaum in der Mani',
  },
  {
    text: 'Und davon braucht es viele. Bis zu 9kg Oliven für 1 Liter von unserem (super intensiven) Öl.',
    image: '02-ernte-und-transport.webp',
    alt: 'Oliven während der Ernte und des Transports zur Ölmühle',
  },
  {
    text: 'Die jungen Oliven sind voller konzentriertem Geschmack. Perfekt als Finishing Öl und zum leichten braten.',
    image: '03-olivenoel-serviert.webp',
    alt: 'Serviertes Olivenöl auf einem gedeckten Tisch mit Essen',
  },
]

const productDetails = [
  '5 Liter extra natives Olivenöl',
  '100 % Koroneiki-Oliven',
  'Ernte 2026/27 aus der Mani, Griechenland',
  'Lichtgeschützt und praktisch in der Bag-in-Box',
]

export default function ProductSection() {
  const sectionRef = useRef<HTMLElement>(null)
  const [isPreorder, setIsPreorder] = useState(true)

  useEffect(() => {
    const section = sectionRef.current
    if (!section) return

    const ctx = gsap.context(() => {
      if (window.matchMedia('(prefers-reduced-motion: reduce)').matches) return

      gsap.utils.toArray<HTMLElement>('[data-product-reveal]').forEach((element) => {
        gsap.from(element, {
          y: 36,
          opacity: 0,
          duration: 0.8,
          ease: 'power3.out',
          scrollTrigger: {
            trigger: element,
            start: 'top 86%',
            once: true,
          },
        })
      })
    }, section)

    const refresh = window.setTimeout(() => ScrollTrigger.refresh(), 100)

    return () => {
      window.clearTimeout(refresh)
      ctx.revert()
    }
  }, [])

  const refreshScrollTriggers = () => ScrollTrigger.refresh()

  return (
    <section
      ref={sectionRef}
      id="unser-produkt"
      aria-labelledby="unser-produkt-heading"
      className="relative overflow-hidden bg-primary py-20 sm:py-24 md:py-32"
    >
      <div className="mx-auto w-full max-w-7xl px-4 sm:px-6 md:px-12 lg:px-16">
        <h2
          id="unser-produkt-heading"
          className="mb-14 text-center font-serif text-4xl font-bold italic leading-none text-white sm:text-5xl md:mb-20 md:text-6xl lg:text-7xl"
        >
          Unser Produkt
        </h2>

        <div className="space-y-20 sm:space-y-24 md:space-y-28">
          {storySteps.map((step, index) => {
            const textFirst = index % 2 === 0

            return (
              <article
                key={step.image}
                data-product-reveal
                className="mx-auto grid max-w-5xl grid-cols-12 items-center md:gap-10 lg:gap-16"
              >
                <div
                  className={`col-span-10 row-start-1 aspect-[4/5] overflow-hidden rounded-[1.75rem] shadow-[0_24px_70px_rgba(3,28,55,0.3)] md:col-span-6 md:col-start-auto md:row-auto md:max-h-[620px] ${
                    index % 2 === 0 ? 'col-start-3' : 'col-start-1'
                  } ${textFirst ? 'md:order-2' : 'md:order-1'}`}
                >
                  <img
                    src={getSupabaseAssetUrl(PRODUCT_FOLDER, step.image)}
                    alt={step.alt}
                    loading="lazy"
                    decoding="async"
                    onLoad={refreshScrollTriggers}
                    className="h-full w-full object-cover"
                  />
                </div>

                <div
                  className={`relative z-10 col-span-10 row-start-2 -mt-14 rounded-[1.5rem] border border-white/10 bg-[#07539a] p-6 shadow-[0_20px_55px_rgba(3,28,55,0.32)] sm:p-8 md:col-span-6 md:col-start-auto md:row-auto md:mt-0 md:p-9 lg:p-11 ${
                    index % 2 === 0 ? 'col-start-1' : 'col-start-3'
                  } ${textFirst ? 'md:order-1' : 'md:order-2'}`}
                >
                  <p className="text-sm leading-relaxed text-white/75 sm:text-base md:text-lg">
                    {step.text}
                  </p>
                </div>
              </article>
            )
          })}
        </div>

        <div
          data-product-reveal
          className="mx-auto mt-28 grid max-w-6xl items-center gap-10 md:mt-36 md:grid-cols-2 md:gap-14 lg:gap-20"
        >
          <div className="space-y-5">
            <div className="aspect-square overflow-hidden rounded-[2rem] bg-white/5 shadow-[0_28px_80px_rgba(3,28,55,0.35)]">
              <img
                src={getSupabaseAssetUrl(PRODUCT_FOLDER, '04-bag-in-box.webp')}
                alt="AKRIA Olivenöl als 5-Liter-Bag-in-Box"
                loading="lazy"
                decoding="async"
                onLoad={refreshScrollTriggers}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="rounded-[1.5rem] border border-white/10 bg-[#07539a] p-6 text-sm leading-relaxed text-white/75 shadow-[0_20px_55px_rgba(3,28,55,0.25)] sm:p-8 sm:text-base">
              Aktuell verkaufen wir unser Öl in 5l Gebinden. Bag-in-Box schützt das Öl vor Licht und Sauerstoff (seinen größten Feinden) um den Geschmack lange Zeit nach der Ernte zu erhalten.
            </div>
          </div>

          <div className="rounded-[2rem] border border-white/10 bg-[#07539a] p-6 shadow-[0_24px_70px_rgba(3,28,55,0.28)] sm:p-8 lg:p-11">
            <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
              Die Ernte 2026/27
            </p>
            <h3 className="mb-5 font-serif text-3xl font-bold italic leading-tight text-white sm:text-4xl lg:text-5xl">
              5 Liter pures Griechenland
            </h3>
            <p className="mb-8 text-base leading-relaxed text-white/75 lg:text-lg">
              Intensiv, fruchtig und frisch: Unser extra natives Olivenöl kommt in einer Bag-in-Box zu dir, die das Öl zuverlässig vor Licht und Sauerstoff schützt.
            </p>

            <div className="mb-8 flex flex-wrap items-end justify-between gap-5 border-y border-white/10 py-6">
              <div aria-live="polite">
                <p className="font-display text-4xl font-bold text-white sm:text-5xl">
                  {isPreorder ? '85 €*' : '95 €'}
                </p>
                <p className={`mt-1 text-sm text-white/60 ${isPreorder ? 'visible' : 'invisible'}`}>
                  * Vorbestellung
                </p>
              </div>

              <div className="flex items-center gap-3">
                <span id="preorder-label" className="text-sm font-medium text-white/85">
                  Vorbestellung
                </span>
                <button
                  type="button"
                  role="switch"
                  aria-checked={isPreorder}
                  aria-labelledby="preorder-label"
                  onClick={() => setIsPreorder((current) => !current)}
                  className={`relative h-8 w-14 rounded-full border transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-accent focus-visible:ring-offset-4 focus-visible:ring-offset-[#07539a] ${
                    isPreorder ? 'border-accent bg-accent' : 'border-white/30 bg-white/10'
                  }`}
                >
                  <span
                    aria-hidden="true"
                    className={`absolute top-1 h-6 w-6 rounded-full bg-white shadow-md transition-transform ${
                      isPreorder ? 'translate-x-6' : 'translate-x-1'
                    }`}
                  />
                </button>
              </div>
            </div>

            <h4 className="mb-4 font-display text-sm font-semibold uppercase tracking-[0.16em] text-white">
              Produktdetails
            </h4>
            <ul className="mb-9 space-y-3">
              {productDetails.map((detail) => (
                <li key={detail} className="flex items-start gap-3 text-sm leading-relaxed text-white/75 sm:text-base">
                  <Check className="mt-0.5 h-5 w-5 shrink-0 text-accent" aria-hidden="true" />
                  <span>{detail}</span>
                </li>
              ))}
            </ul>

            <Link
              to="/waitlist"
              className="btn-magnetic btn-accent w-full px-5 py-4 text-center shadow-[0_12px_35px_rgba(254,65,0,0.35)] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-white"
            >
              Zur Ernte 26/27 anmelden
              <ArrowRight className="ml-2 h-5 w-5" aria-hidden="true" />
            </Link>
          </div>
        </div>

        <div data-product-reveal className="mx-auto mt-28 max-w-6xl md:mt-36">
          <h3 className="mb-10 text-center font-serif text-4xl font-bold italic text-white sm:text-5xl md:mb-14 md:text-6xl">
            Über Uns
          </h3>
          <div className="grid overflow-hidden rounded-[2rem] border border-white/10 bg-[#07539a] shadow-[0_28px_80px_rgba(3,28,55,0.3)] md:grid-cols-[1.15fr_0.85fr] md:items-stretch">
            <div className="aspect-[3/2] overflow-hidden md:aspect-auto md:min-h-[430px]">
              <img
                src={getSupabaseAssetUrl(PRODUCT_FOLDER, '05-zeno-und-denis.webp')}
                alt="Zeno Meyer und Denis Tiffert, die Gründer von AKRIA"
                loading="lazy"
                decoding="async"
                onLoad={refreshScrollTriggers}
                className="h-full w-full object-cover"
              />
            </div>
            <div className="flex flex-col justify-center p-7 sm:p-9 lg:p-12">
              <p className="mb-3 font-display text-xs font-semibold uppercase tracking-[0.2em] text-accent">
                Zeno &amp; Denis
              </p>
              <h4 className="mb-5 font-serif text-3xl font-bold italic leading-tight text-white lg:text-4xl">
                Olivenöl, das Herkunft hat
              </h4>
              <div className="space-y-4 text-sm leading-relaxed text-white/75 sm:text-base lg:text-lg">
                <p>
                  Wir sind Zeno und Denis. Mit AKRIA bringen wir das Olivenöl aus unserer zweiten Heimat in der Mani direkt zu dir.
                </p>
                <p>
                  Wir kennen die Menschen, die Bäume und jeden Schritt von der Ernte bis zur Abfüllung. Darum stehen wir für ehrliche Qualität, kurze Wege und vollen Geschmack.
                </p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  )
}
