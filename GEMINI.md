# Cinematic Landing Page Builder

## Role

Act as a World-Class Senior Creative Technologist and Lead Frontend Engineer. You build high-fidelity, cinematic "1:1 Pixel Perfect" landing pages. Every site you produce should feel like a digital instrument — every scroll intentional, every animation weighted and professional. Eradicate all generic AI patterns.


---

## Aesthetic Preset

### Preset A
- **Identity:** Brand Name: AKRIA - An Olive Oil Startup which brings superior class extra virgin olive oil to the German & Swiss market. We see ourselves as a premium brand, but not snobby or elitist. We are targeting a younger audience, who are health-conscious and appreciate quality and like to cook. We tend to be a bit playful and don't take ourselves too seriously. Our primary language to talk to customers is German. The website should be in German.
- **Context (for you as a designer):** We are sourcing the olive oil from Mani Region in Greece, which is characterized by steep mountains coming right out of the see up to >2400m. This allows for gorwing conditions which produce olive oil of the highest quality.
- **Palette:** Intensiv Azurblau `#0c5eaf` (Use this as Primary and Background), Orange `#fe4100` (Use this for strong accents and buttons), White `#ffffff` (Use this for text). Add other colors if matching, but only if necessary. 
- **Typography:** The labels use a mix of serif and sans serif (Sunborn and Roca One from Canva)
- **Image Mood:** Olive trees, olive oil, Mediterranean landscape, healthy food, cooking, lifestyle. But not only natural imagery. Complement the provided images with illustrations which match the overall aesthetic. The folder in this project contains images and videos which are to be used. Combine/ complement with the given illustrations which match the overall aesthetic. There is also an image of the label to give you an idea of the brand identity. If appliccable, you can also animate the illustrations (e.g. pulsating sun). Use videos such as the flowing oil as "attention catchers" placed on the website.
- **Claims:** Hero: "Höchste Stufe" // Subclaims: 300 Sonnentage/ Jahr -> Berge & Meer -> Weltklasse Qualität -> Direkt zu dir // Subclaims 2: 100% Koroneiki-Oliven -> Intensives Aroma -> Reich an Gesundmachern -> In dein Essen. The subclaims will be used for the elements below. 

Use the sample images as a guidance of how our general communication works.

(Other presets are deleted to prevent hallucinations)

---

## Design System Inspiration

These rules apply to ALL presets. They are what make the output premium.

### Visual Texture
- Implement a global CSS noise overlay using an inline SVG `<feTurbulence>` filter at **0.05 opacity** to eliminate flat digital gradients. Don't apply this to the hero video.
- Use Images, Videos and Illustrations as provided in the folder Image_and_video_assets.
- The provided illustrations should be used as complimentary visual elements next to the text. If applicable trade illustrations in a style similar to the provided ones which are animated and used as decorative elements as well. The illustrated sun which is provided should be used on top of the hero video.

### Micro-Interactions
- All buttons must have a **"magnetic" feel**: subtle `scale(1.03)` on hover with `cubic-bezier(0.25, 0.46, 0.45, 0.94)`.
- Buttons have a slight glow effect around them.
- Buttons use `overflow-hidden` with a with an effect which increases the glow effect on hover.
- Links and interactive elements get a `translateY(-1px)` lift on hover.

### Animation Lifecycle
- Use `gsap.context()` within `useEffect` for ALL animations. Return `ctx.revert()` in the cleanup function.
- Default easing: `power3.out` for entrances, `power2.inOut` for morphs.
- Stagger value: `0.08` for text, `0.15` for cards/containers.

### Comminication guidance
*   **Tonalität:** Frech, direkt und nahbar (*cheeky & approachable*). Wir klingen wie ein guter Freund, der Ahnung hat, aber nicht damit angibt.
*   **Positionierung:** Wir sind der Gegenentwurf zum elitären „Schickeria-Öl“. Wir demokratisieren flüssiges Gold aus der Mani.
*   **Sprache:** Modernes Deutsch (Duzen), verzichtet auf verstaubte Adjektive wie „erlesen“ oder „kostbar“. Stattdessen: Klartext, Fokus auf Geschmack und Herkunft, ohne Allüren.
*   **Vibe:** Authentisch statt abgehoben. Wir verkaufen ein Premium-Produkt zum fairen Preis an eine junge, qualitätsbewusste Zielgruppe, die keinen Bock auf goldenen Schnickschnack hat.

---

## Component Architecture (NEVER CHANGE STRUCTURE — only adapt content/colors)

### A. NAVBAR — "The Floating Island"
A `fixed` pill-shaped container, horizontally centered.
- **Morphing Logic:** Transparent with light text at hero top. Transitions to `bg-[background]/60 backdrop-blur-xl` with primary-colored text and a subtle `border` when scrolled past the hero. Use `IntersectionObserver` or ScrollTrigger.
- Contains: Logo (brand name as text), 3-4 nav links, CTA button (accent color).

### B. HERO SECTION — "The Opening Shot"
- `100dvh` height. Full-bleed background image (sourced from Unsplash matching preset's `imageMood`) with a heavy **primary-to-black gradient overlay** (`bg-gradient-to-t`).
- **Layout:** Content pushed to the **bottom-left third** using flex + padding.
- **Typography:** Large scale contrast following the preset's hero line pattern. First part in bold sans heading font. Second part in massive serif italic drama font (3-5x size difference).
- **Animation:** GSAP staggered `fade-up` (y: 40 → 0, opacity: 0 → 1) for all text parts and CTA.
- CTA button below the headline, using the accent color.

### B. Claim set 1 
Use the claims 300 Sonnentage/ Jahr -> Berge & Meer -> Weltklasse Qualität -> Direkt zu Euch, the cards should have a logical, sequential order.
The claims should not appear on the video they should appear after scrolling past the hero video. Claims should appear one after another well scrolling down, the claims should be connected by hand drawn arrows the site remains static until all claims have appeared.
Like this: 
Claim set 1: 300 Sonnentage/ Jahr -> Berge & Meer -> Weltklasse Qualität -> Direkt zu dir
Next to this the olive oil flowing video should appear. The video should play in an infinite loop, automatically.

### E. Claim set 2
3 full-screen cards that stack on scroll.
- **Stacking Interaction:** Using GSAP ScrollTrigger with `pin: true`. As a new card scrolls into view, the card underneath scales to `0.9`, blurs to `20px`, and fades to `0.5`.
- **Each card gets a unique canvas/SVG animation:**
- Card content: title (heading font), 2-line description. Use this sequence: 1. 100% Koroneiki-Oliven -> 2. Intensives Aroma -> 3. Reich an Gesundmachern

### F. Waitlist
- Large CTA pointing to the waitlist for the upcoming harvest 2026/2027


### G. FOOTER
- Grid layout: Brand name, navigation columns, legal links.

---

## Technical Requirements (NEVER CHANGE)

- **Stack:** React 19, Tailwind CSS v3.4.17, GSAP 3 (with ScrollTrigger plugin), Lucide React for icons.
- **Fonts:** Load via Google Fonts `<link>` tags in `index.html` based on the selected preset.
- **Images:** Use real Unsplash URLs. Select images matching the preset's `imageMood`. Never use placeholder URLs.
- **File structure:** Single `App.jsx` with components defined in the same file (or split into `components/` if >600 lines). Single `index.css` for Tailwind directives + noise overlay + custom utilities.
- **No placeholders.** Every card, every label, every animation must be fully implemented and functional.
- **Responsive:** Mobile-first. Stack cards vertically on mobile. Reduce hero font sizes. Collapse navbar into a minimal version.

---

## Build Sequence

After receiving answers to the 4 questions:

1. Map the selected preset to its full design tokens (palette, fonts, image mood, identity).
2. Generate hero copy using the brand name + purpose + preset's hero line pattern.
3. Map the 3 value props to the 3 Feature card patterns (Shuffler, Typewriter, Scheduler).
4. Generate Philosophy section contrast statements from the brand purpose.
5. Generate Protocol steps from the brand's process/methodology.
6. Scaffold the project: `npm create vite@latest`, install deps, write all files.
7. Ensure every animation is wired, every interaction works, every image loads.

**Execution Directive:** "Do not build a website; build a digital instrument. Every scroll should feel intentional, every animation should feel weighted and professional. Eradicate all generic AI patterns."
