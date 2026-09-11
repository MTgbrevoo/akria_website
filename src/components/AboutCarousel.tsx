import {
  useCallback,
  useEffect,
  useLayoutEffect,
  useRef,
  useState,
  type PointerEvent as ReactPointerEvent,
} from 'react'
import { getCarouselAssets, type CarouselAsset } from '../lib/supabaseAssets'

const BASE_SPEED = 28
const MAX_MOMENTUM_SPEED = 900
const MOMENTUM_DECAY = 3.4

type AboutCarouselProps = {
  onLayoutChange?: () => void
}

function normalizeOffset(value: number, width: number) {
  return ((value % width) + width) % width
}

export default function AboutCarousel({ onLayoutChange }: AboutCarouselProps) {
  const viewportRef = useRef<HTMLDivElement>(null)
  const trackRef = useRef<HTMLDivElement>(null)
  const cycleRef = useRef<HTMLDivElement>(null)
  const sequenceWidthRef = useRef(0)
  const offsetRef = useRef(0)
  const momentumRef = useRef(0)
  const draggingRef = useRef(false)
  const pointerRef = useRef({ x: 0, time: 0, velocity: 0 })
  const settledImagesRef = useRef(new Set<string>())
  const [assets, setAssets] = useState<CarouselAsset[] | null>(null)
  const [failedImages, setFailedImages] = useState<Set<string>>(new Set())
  const [imagesReady, setImagesReady] = useState(false)
  const [isMeasured, setIsMeasured] = useState(false)
  const [sequenceRepeats, setSequenceRepeats] = useState(1)
  const [isDragging, setIsDragging] = useState(false)

  useEffect(() => {
    let active = true

    getCarouselAssets()
      .then((result) => {
        if (!active) return
        setAssets(result)
        if (result.length === 0) setImagesReady(true)
      })
      .catch(() => {
        if (active) setAssets([])
      })

    return () => {
      active = false
    }
  }, [])

  const handleImageSettled = useCallback(
    (name: string, failed: boolean) => {
      if (settledImagesRef.current.has(name)) return

      settledImagesRef.current.add(name)
      if (failed) {
        setFailedImages((current) => {
          const next = new Set(current)
          next.add(name)
          return next
        })
      }

      if (assets && settledImagesRef.current.size === assets.length) {
        setImagesReady(true)
      }
    },
    [assets],
  )

  const visibleAssets = assets?.filter((asset) => !failedImages.has(asset.name)) ?? []

  const applyTransform = useCallback(() => {
    const track = trackRef.current
    const width = sequenceWidthRef.current
    if (!track || width <= 0) return

    offsetRef.current = normalizeOffset(offsetRef.current, width)
    track.style.transform = `translate3d(${-offsetRef.current}px, 0, 0)`
  }, [])

  useLayoutEffect(() => {
    if (!imagesReady || visibleAssets.length === 0) return

    const viewport = viewportRef.current
    const cycle = cycleRef.current
    if (!viewport || !cycle) return

    const measure = () => {
      const cycleWidth = cycle.scrollWidth
      if (cycleWidth <= 0) return

      const singleSequenceWidth = cycleWidth / sequenceRepeats
      const nextRepeats = Math.max(1, Math.ceil(viewport.clientWidth / singleSequenceWidth) + 1)

      if (nextRepeats !== sequenceRepeats) {
        setIsMeasured(false)
        setSequenceRepeats(nextRepeats)
        return
      }

      sequenceWidthRef.current = cycleWidth
      offsetRef.current = normalizeOffset(offsetRef.current, cycleWidth)
      applyTransform()
      setIsMeasured(true)
    }

    measure()
    const observer = new ResizeObserver(measure)
    observer.observe(viewport)
    observer.observe(cycle)

    return () => observer.disconnect()
  }, [applyTransform, imagesReady, sequenceRepeats, visibleAssets.length])

  useEffect(() => {
    if (!isMeasured) return
    onLayoutChange?.()
  }, [isMeasured, onLayoutChange, sequenceRepeats])

  useEffect(() => {
    const viewport = viewportRef.current
    if (!isMeasured || !viewport) return

    let frame = 0
    let lastFrame = 0
    let visible = true

    const animate = (time: number) => {
      if (!lastFrame) lastFrame = time
      const deltaSeconds = Math.min((time - lastFrame) / 1000, 0.05)
      lastFrame = time

      if (!draggingRef.current) {
        offsetRef.current += (BASE_SPEED + momentumRef.current) * deltaSeconds
        momentumRef.current *= Math.exp(-MOMENTUM_DECAY * deltaSeconds)
        if (Math.abs(momentumRef.current) < 0.5) momentumRef.current = 0
        applyTransform()
      }

      if (visible) frame = requestAnimationFrame(animate)
    }

    const observer = new IntersectionObserver(([entry]) => {
      visible = entry.isIntersecting
      cancelAnimationFrame(frame)
      if (visible) {
        lastFrame = 0
        frame = requestAnimationFrame(animate)
      }
    })

    observer.observe(viewport)
    frame = requestAnimationFrame(animate)

    return () => {
      observer.disconnect()
      cancelAnimationFrame(frame)
    }
  }, [applyTransform, isMeasured])

  const handlePointerDown = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!isMeasured || event.button !== 0) return
    event.currentTarget.setPointerCapture(event.pointerId)
    draggingRef.current = true
    momentumRef.current = 0
    pointerRef.current = { x: event.clientX, time: performance.now(), velocity: 0 }
    setIsDragging(true)
  }

  const handlePointerMove = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return

    const now = performance.now()
    const deltaX = event.clientX - pointerRef.current.x
    const deltaTime = now - pointerRef.current.time

    offsetRef.current -= deltaX
    if (deltaTime > 0) {
      const instantaneousVelocity = (-deltaX / deltaTime) * 1000
      pointerRef.current.velocity = pointerRef.current.velocity * 0.65 + instantaneousVelocity * 0.35
    }
    pointerRef.current.x = event.clientX
    pointerRef.current.time = now
    applyTransform()
  }

  const finishDragging = (event: ReactPointerEvent<HTMLDivElement>) => {
    if (!draggingRef.current) return
    draggingRef.current = false
    momentumRef.current = Math.max(
      -MAX_MOMENTUM_SPEED,
      Math.min(MAX_MOMENTUM_SPEED, pointerRef.current.velocity),
    )
    if (event.currentTarget.hasPointerCapture(event.pointerId)) {
      event.currentTarget.releasePointerCapture(event.pointerId)
    }
    setIsDragging(false)
  }

  if (!assets || assets.length === 0 || (imagesReady && visibleAssets.length === 0)) return null

  const renderCycle = (cycleIndex: number) => (
    <div
      ref={cycleIndex === 0 ? cycleRef : undefined}
      aria-hidden="true"
      className="flex shrink-0 items-center"
    >
      {Array.from({ length: sequenceRepeats }, (_, repeatIndex) =>
        visibleAssets.map((asset, assetIndex) => (
          <div
            key={`${cycleIndex}-${repeatIndex}-${asset.name}`}
            className="mr-3 h-48 shrink-0 overflow-hidden rounded-[1.5rem] border border-white/10 bg-white/5 shadow-[0_18px_48px_rgba(3,28,55,0.28)] sm:mr-4 sm:h-56 md:h-64 lg:h-72"
          >
            <img
              src={asset.url}
              alt=""
              draggable={false}
              loading={cycleIndex === 0 && repeatIndex === 0 ? 'eager' : 'lazy'}
              fetchPriority={cycleIndex === 0 && repeatIndex === 0 && assetIndex < 2 ? 'high' : 'auto'}
              decoding="async"
              onLoad={() => handleImageSettled(asset.name, false)}
              onError={() => handleImageSettled(asset.name, true)}
              className="pointer-events-none h-full w-auto max-w-none select-none object-contain"
            />
          </div>
        )),
      )}
    </div>
  )

  return (
    <div
      ref={viewportRef}
      aria-hidden="true"
      onPointerDown={handlePointerDown}
      onPointerMove={handlePointerMove}
      onPointerUp={finishDragging}
      onPointerCancel={finishDragging}
      className={`mt-5 w-full touch-pan-y overflow-hidden select-none sm:mt-6 ${
        isDragging ? 'cursor-grabbing' : 'cursor-grab'
      }`}
    >
      <div
        ref={trackRef}
        className={`flex w-max will-change-transform transition-opacity duration-300 ${
          isMeasured ? 'opacity-100' : 'pointer-events-none opacity-0'
        }`}
      >
        {renderCycle(0)}
        {renderCycle(1)}
      </div>
    </div>
  )
}
