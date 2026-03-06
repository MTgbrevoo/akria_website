# AI Rules — AKRIA Landing Page

## Tech Stack

- **Framework:** React 19 (plain JSX, no TypeScript) — all source code lives in `src/`
- **Build Tool:** Vite 6 — dev server and production bundler
- **Styling:** Tailwind CSS 3 — use utility classes for all layout, spacing, color, and typography; custom design tokens are defined in `tailwind.config.js`
- **Animations:** GSAP 3 with the `ScrollTrigger` plugin — used for all scroll-driven animations, pinned sections, video scrubbing, and entrance effects
- **Icons:** `lucide-react` — use this for any UI icons; do not import icon sets from other libraries
- **Fonts:** `@fontsource/inter` (body), `@fontsource/outfit` (display/UI), `@fontsource/playfair-display` (serif/italic headings) — all served locally, no Google Fonts CDN calls
- **No routing library** — this is a single-page landing site; all sections are anchor-linked (`#hero`, `#herkunft`, `#qualitaet`, `#waitlist`)
- **No UI component library** — no shadcn/ui or Radix UI; all components are hand-crafted with Tailwind and custom CSS classes defined in `src/index.css`
- **No state management library** — use React's built-in `useState` and `useEffect` only

---

## Rules

### Styling
- **Always use Tailwind CSS** for layout, spacing, colors, and responsive design.
- Custom reusable CSS classes (e.g. `.btn-magnetic`, `.glass-card`, `.hover-lift`) are defined in `src/index.css` — use them where appropriate instead of duplicating styles inline.
- The design token colors are `primary` (`#0c5eaf`), `primary-dark` (`#083d73`), `accent` (`#fe4100`), and `accent-dark` (`#d63700`). Always reference these Tailwind tokens rather than hardcoding hex values.
- Font families map to Tailwind classes: `font-sans` → Inter, `font-serif` → Playfair Display, `font-display` → Outfit.

### Animations
- **Use GSAP** for all animations — scroll-triggered reveals, entrance effects, pinned sections, and timeline-based sequences.
- Register GSAP plugins at the top of the file where they are used: `gsap.registerPlugin(ScrollTrigger)`.
- Always wrap GSAP code in `gsap.context(() => { ... }, ref)` and return `ctx.revert()` from `useEffect` cleanup to prevent memory leaks.
- Do **not** use CSS `@keyframes` or Tailwind `animate-*` classes for complex or scroll-linked animations — use GSAP for those. Simple decorative loops (e.g. `animate-bounce`, `animate-pulse`) are fine with Tailwind.

### Icons
- Use **`lucide-react`** exclusively for icons. Do not install or import from `react-icons`, `heroicons`, or any other icon library.
- Custom SVG illustrations (sun, mountains, olives, etc.) are stored as image assets in `public/assets/` and `public/assets/illustrations/` — reference them with `<img src="/assets/..." />`.

### Fonts
- All fonts are loaded locally via `@fontsource` packages. Do **not** add `<link>` tags to Google Fonts or any external font CDN.

### Components & File Structure
- All components currently live in `src/App.jsx`. For new sections or overlays, add them as named functions in the same file or create a new file under `src/components/`.
- Keep components focused and co-located with their GSAP logic inside `useEffect`.
- Do **not** introduce a routing library. Navigation is anchor-based only.

### Assets & Media
- Static assets (videos, images, illustrations) are served from `public/assets/`. Reference them with absolute paths starting with `/assets/`.
- Videos should always include `autoPlay muted loop playsInline preload="auto"` attributes for cross-browser and mobile compatibility.

### No External UI Libraries
- Do **not** install or use shadcn/ui, Radix UI, Material UI, Ant Design, or any other component library. All UI is custom-built.
- Do **not** add a CSS-in-JS library (e.g. styled-components, Emotion). Tailwind + `src/index.css` is the only styling system.

### Dependencies
- Before adding any new `npm` package, check whether the functionality can be achieved with GSAP, Tailwind, or native browser APIs.
- Keep the dependency footprint minimal — this is a marketing landing page, not an application.
