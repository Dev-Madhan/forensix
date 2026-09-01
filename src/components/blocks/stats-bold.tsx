'use client'

import React, { useRef, useEffect, useState } from 'react'
import { TimelineAnimation } from '@/components/ui/timeline-animation'
import NumberFlow from '@number-flow/react'
import { animate, useMotionValue } from 'framer-motion'
import { useInView } from 'react-intersection-observer'

function AnimatedStatValue({ 
  value, 
  prefix = "", 
  suffix = "", 
  startValue = 0 
}: { 
  value: number, 
  prefix?: string, 
  suffix?: string, 
  startValue?: number 
}) {
  const [displayValue, setDisplayValue] = useState(startValue)
  const count = useMotionValue(startValue)
  const { ref, inView } = useInView({ triggerOnce: false })

  useEffect(() => {
    if (inView) {
      animate(count, value, {
        duration: 1.5,
        ease: "easeOut",
        onUpdate: (latest) => setDisplayValue(Math.round(latest)),
      })
    } else {
      setDisplayValue(startValue)
    }
  }, [inView, count, value, startValue])

  return (
    <span ref={ref} className="inline-block">
      <NumberFlow value={displayValue} prefix={prefix} suffix={suffix} />
    </span>
  )
}

export const BoldStats = () => {
  const timelineRef = useRef<HTMLElement>(null)

  const customVariants = {
    visible: (i: number) => ({
      filter: 'blur(0px)',
      y: 0,
      opacity: 1,
      transition: {
        delay: i * 0.15,
        duration: 0.8,
        ease: [0.16, 1, 0.3, 1]
      },
    }),
    hidden: {
      filter: 'blur(10px)',
      y: 20,
      opacity: 0,
    },
  }

  return (
    <section ref={timelineRef} className="bg-background w-full flex flex-col justify-center">
      <div className="flex flex-col gap-20 py-10 max-w-6xl mx-auto px-5 w-full">
        <div className="md:flex justify-between items-center border-b border-border pb-5">
          <TimelineAnimation 
            timelineRef={timelineRef} 
            animationNum={0} 
            customVariants={customVariants}
            className="flex flex-col md:flex-row items-baseline gap-4"
          >
            <span className="md:text-8xl text-8xl lg:text-9xl font-medium tracking-tighter text-foreground ">
              <AnimatedStatValue value={10} suffix="k+" />
            </span>
            <div className="max-w-xs">
              <h3 className="text-xl font-semibold tracking-tight text-foreground">
                Sketches Generated
              </h3>
              <p className="text-sm text-muted-foreground text-pretty">
                Transforming witness memories into actionable leads and evidence across multiple agencies.
              </p>
            </div>
          </TimelineAnimation>
          
          <TimelineAnimation 
            timelineRef={timelineRef} 
            animationNum={1} 
            customVariants={customVariants}
            className="relative sm:w-96 w-full h-52 mt-8 md:mt-0 rounded-xl overflow-hidden"
          >
            {/* Gradient overlays to fade the edges into the background */}
            <div className="absolute inset-0 bg-gradient-to-r from-background via-transparent to-background z-10 pointer-events-none" />
            <div className="absolute inset-0 bg-gradient-to-b from-background via-transparent to-background z-10 pointer-events-none" />
            <img
              src="/images/stats-image.png"
              alt="Forensix AI visualization"
              className="w-full h-full object-cover opacity-80 mix-blend-screen"
            />
          </TimelineAnimation>
        </div>

        <div className="flex justify-between items-center gap-5">
          <TimelineAnimation timelineRef={timelineRef} animationNum={2} customVariants={customVariants}>
            <p className="md:text-5xl text-4xl font-medium tracking-tighter text-foreground mb-2 ">
              <AnimatedStatValue value={98} suffix="%" />
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Match Accuracy
            </p>
          </TimelineAnimation>
          <TimelineAnimation timelineRef={timelineRef} animationNum={3} customVariants={customVariants}>
            <p className="md:text-5xl text-4xl font-medium tracking-tighter text-foreground mb-2 ">
              <AnimatedStatValue value={2} prefix="<" suffix="s" />
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Generation Time
            </p>
          </TimelineAnimation>
          <TimelineAnimation timelineRef={timelineRef} animationNum={4} customVariants={customVariants}>
            <p className="md:text-5xl text-4xl font-medium tracking-tighter text-foreground mb-2 ">
              <AnimatedStatValue value={24} suffix="/7" />
            </p>
            <p className="text-xs font-semibold uppercase tracking-widest text-muted-foreground">
              Intelligence Support
            </p>
          </TimelineAnimation>
        </div>
      </div>
    </section>
  )
}
