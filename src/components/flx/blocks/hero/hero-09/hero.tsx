'use client'

import * as React from 'react'
import { useRef, useEffect } from 'react'
import { motion, useReducedMotion, type Variants } from 'motion/react'
import { gsap } from 'gsap'
import { Search } from 'lucide-react'
import Balancer from 'react-wrap-balancer'

import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export interface HeroProps {
  title: string
  titleLine2?: string
  description: string
  mobileDescription?: string
  searchPlaceholder?: string
  searchButtonText?: string
  heroImage: string
  heroAlt?: string
  bottomTitle: string
  bottomTitleLine2?: string
  bottomText?: string
  mobileBottomText?: string
  animation?: 'none' | 'subtle'
  variant?: 'standard' | 'compact'
}

const variantStyles = {
  standard: {
    section: 'py-10 sm:py-16 lg:py-28',
    title: 'text-[1.65rem] leading-[1.15] sm:text-3xl md:text-5xl lg:text-5xl',
    description: 'max-w-[17rem] sm:max-w-sm md:max-w-3xl text-[0.8rem] leading-relaxed sm:text-base md:text-xl text-balance',
    header: 'gap-4 sm:gap-6',
    content: 'gap-7 sm:gap-12 lg:gap-18',
    media: 'max-w-6xl',
    imageAspect: 'aspect-[4/3] sm:aspect-[16/10] lg:aspect-[21/9]',
    bottomTitle: 'text-xl sm:text-3xl md:text-4xl',
    overlap: 'mt-4 sm:mt-10 lg:mt-14',
  },
  compact: {
    section: 'py-14 sm:py-20',
    title: 'text-2xl sm:text-3xl md:text-4xl',
    description: 'max-w-sm text-sm',
    header: 'gap-4',
    content: 'gap-8 sm:gap-10',
    media: 'max-w-3xl',
    imageAspect: 'aspect-16/11',
    bottomTitle: 'text-xl sm:text-2xl md:text-3xl',
    overlap: 'mt-4',
  },
} as const

// ─── Framer Motion variants ──────────────────────────────────────────────────
// All use the EXACT same ease + delay as the header: [0.16, 1, 0.3, 1], 0.8s, delay 0.1
// so header and hero land simultaneously.

const ease: [number, number, number, number] = [0.16, 1, 0.3, 1]

const fmTitle: Variants = {
  hidden: { opacity: 0, y: 20, filter: 'blur(8px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease, delay: 0.1 },
  },
}

const fmDescription: Variants = {
  hidden: { opacity: 0, y: 16, filter: 'blur(6px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease, delay: 0.2 },
  },
}

const fmSearch: Variants = {
  hidden: { opacity: 0, y: 12, filter: 'blur(4px)' },
  visible: {
    opacity: 1, y: 0, filter: 'blur(0px)',
    transition: { duration: 0.8, ease, delay: 0.3 },
  },
}

const fmMedia: Variants = {
  hidden: { opacity: 0, scale: 0.98, filter: 'blur(10px)' },
  visible: {
    opacity: 1, scale: 1, filter: 'blur(0px)',
    transition: { duration: 0.9, ease, delay: 0.25 },
  },
}

const fmBottom: Variants = {
  hidden: { opacity: 0, y: 10 },
  visible: {
    opacity: 1, y: 0,
    transition: { duration: 0.7, ease, delay: 0.4 },
  },
}

export function Hero({
  title,
  titleLine2,
  description,
  mobileDescription,
  searchPlaceholder = 'Search blocks and components',
  searchButtonText = 'Search',
  heroImage,
  heroAlt = '',
  bottomTitle,
  bottomTitleLine2,
  bottomText,
  mobileBottomText,
  animation = 'none',
  variant = 'standard',
}: Readonly<HeroProps>) {
  const reduce = useReducedMotion()
  const vs = variantStyles[variant]

  // GSAP: scan line only — decorative, runs independently without blocking FM
  const sectionRef = useRef<HTMLElement>(null)
  const scanLineRef = useRef<HTMLDivElement>(null)
  const imageWrapRef = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (reduce || !imageWrapRef.current) return

    const ctx = gsap.context(() => {
      gsap.timeline({ delay: 0.8 })
        // Materialise — soft fade-in as line descends into frame
        .fromTo(
          scanLineRef.current,
          { opacity: 0, top: '0%' },
          { opacity: 1, top: '10%', duration: 0.45, ease: 'power3.out' },
        )
        // Sweep — silky constant glide through the image
        .to(scanLineRef.current, { top: '90%', duration: 1.5, ease: 'power1.inOut' })
        // Dissolve — line fades as it exits the bottom
        .to(scanLineRef.current, { opacity: 0, top: '100%', duration: 0.4, ease: 'power3.in' })
    }, sectionRef)

    return () => ctx.revert()
  }, [reduce])

  const shouldAnimate = !reduce

  // ─── Elements ──────────────────────────────────────────────────────────────

  const titleElement = title && (
    <h1
      className={cn(
        'text-foreground font-heading font-normal tracking-tight md:whitespace-nowrap',
        vs.title,
      )}
    >
      <Balancer>{title}</Balancer>
      {titleLine2 && (
        <>
          <br />
          <Balancer>{titleLine2}</Balancer>
        </>
      )}
    </h1>
  )

  const descriptionElement = description && (
    <>
      {mobileDescription && (
        <p className={cn('text-muted-foreground md:hidden', vs.description)}>
          <Balancer>{mobileDescription}</Balancer>
        </p>
      )}
      <p className={cn('text-muted-foreground', vs.description, mobileDescription && 'hidden md:block')}>
        <Balancer>{description}</Balancer>
      </p>
    </>
  )

  const searchElement = (
    <form
      onSubmit={(e) => e.preventDefault()}
      className="bg-elevated focus-within:ring-ring/40 mx-auto flex w-full max-w-xl items-center rounded-full border border-border p-1 sm:p-1.5 shadow-sm transition focus-within:ring-2"
    >
      <div className="text-muted-foreground pl-2.5 sm:pl-3 shrink-0">
        <Search className="size-3.5 sm:size-4" />
      </div>
      <input
        aria-label={searchPlaceholder}
        placeholder={searchPlaceholder}
        className="h-8 sm:h-10 min-w-0 flex-1 bg-transparent px-2 sm:px-3 text-xs sm:text-sm text-foreground placeholder:text-muted-foreground/50 outline-none border-none ring-0"
      />
      <Button
        type="submit"
        className="shrink-0 rounded-full px-3 sm:px-5 h-7 sm:h-9 text-xs sm:text-sm font-medium"
      >
        {searchButtonText}
      </Button>
    </form>
  )

  const mediaElement = heroImage && (
    <div ref={imageWrapRef} className={cn('relative mx-auto w-full', vs.media)}>
      {/* GSAP scan line — decorative only */}
      <div
        ref={scanLineRef}
        className="absolute inset-x-0 top-0 z-20 h-px bg-gradient-to-r from-transparent via-white to-transparent opacity-0 pointer-events-none [filter:drop-shadow(0_0_6px_rgba(255,255,255,0.75))_drop-shadow(0_0_12px_rgba(255,255,255,0.4))]"
      />
      <div
        className={cn(
          'relative mx-auto w-full overflow-hidden',
          'mask-x-from-80% mask-x-to-100%',
          'mask-t-from-35% mask-t-to-95%',
          'mask-b-from-55% mask-b-to-100%',
          'mask-radial-[95%_85%] mask-radial-from-60% mask-radial-to-100% mask-radial-at-center',
          'opacity-85',
        )}
      >
        <img
          src={heroImage}
          alt={heroAlt}
          decoding="async"
          className={cn('w-full object-cover object-center', vs.imageAspect)}
        />
      </div>
    </div>
  )

  const bottomElement = (bottomTitle || bottomText) && (
    <div
      className={cn(
        'grid grid-cols-1 items-start gap-2 sm:gap-8 md:grid-cols-2 md:gap-12 border-t border-border pt-6 sm:pt-8 md:border-0 md:pt-0',
        vs.overlap,
      )}
    >
      {bottomTitle && (
        <h2 className={cn('text-foreground font-heading font-normal tracking-tight text-balance', vs.bottomTitle)}>
          <Balancer>{bottomTitle}</Balancer>
          {bottomTitleLine2 && (
            <>
              <br />
              <Balancer>{bottomTitleLine2}</Balancer>
            </>
          )}
        </h2>
      )}
      {bottomText && (
        <p className="text-muted-foreground max-w-md text-sm sm:text-base md:justify-self-end text-balance">
          {mobileBottomText && (
            <Balancer>
              <span className="md:hidden">{mobileBottomText}</span>
              <span className="hidden md:inline">{bottomText}</span>
            </Balancer>
          )}
          {!mobileBottomText && <Balancer>{bottomText}</Balancer>}
        </p>
      )}
    </div>
  )

  return (
    <section ref={sectionRef} className="bg-background relative isolate w-full overflow-hidden">
      <div className={cn(
        'relative z-10 mx-auto flex max-w-6xl flex-col px-5 sm:px-6',
        vs.section,
        vs.content,
      )}>
        {/* Header block: title + description + search */}
        <div className={cn(
          'mx-auto flex w-full max-w-2xl md:max-w-5xl flex-col items-center text-center',
          vs.header,
        )}>
          <motion.div
            variants={fmTitle}
            initial={shouldAnimate ? 'hidden' : false}
            animate={shouldAnimate ? 'visible' : false}
          >
            {titleElement}
          </motion.div>

          <motion.div
            variants={fmDescription}
            initial={shouldAnimate ? 'hidden' : false}
            animate={shouldAnimate ? 'visible' : false}
          >
            {descriptionElement}
          </motion.div>

          <motion.div
            variants={fmSearch}
            initial={shouldAnimate ? 'hidden' : false}
            animate={shouldAnimate ? 'visible' : false}
            className="w-full"
          >
            {searchElement}
          </motion.div>
        </div>

        {/* Hero image */}
        <motion.div
          variants={fmMedia}
          initial={shouldAnimate ? 'hidden' : false}
          animate={shouldAnimate ? 'visible' : false}
          className="w-full"
        >
          {mediaElement}
        </motion.div>

        {/* Bottom section */}
        <motion.div
          variants={fmBottom}
          initial={shouldAnimate ? 'hidden' : false}
          animate={shouldAnimate ? 'visible' : false}
          className="w-full"
        >
          {bottomElement}
        </motion.div>
      </div>
    </section>
  )
}
