"use client";

import React from "react";
import { motion, MotionProps } from "framer-motion";
import { cn } from "@/lib/utils";

export type AnimatedButtonProps = React.ButtonHTMLAttributes<HTMLButtonElement> &
  MotionProps & {
    children?: React.ReactNode;
    as?: any;
    isAnimated?: boolean;
  };

/**
 * AnimatedButton (VengeanceUI)
 * - theme-aware: uses Tailwind `dark:` classes so it works in both light and dark mode
 * - accepts all native button props (onClick, className, type, etc.)
 * - isAnimated: controls whether the border shine and text sweep animations are active
 */
const AnimatedButton: React.FC<AnimatedButtonProps> = ({
  children = "Browse Components",
  className = "",
  as = "button",
  isAnimated = true,
  disabled,
  ...rest
}) => {
  const Component = (motion as any)[as] || motion.button;

  return (
    <Component
      {...rest}
      disabled={disabled}
      whileHover={disabled ? undefined : { scale: 1.015 }}
      whileTap={disabled ? undefined : { scale: 0.96 }}
      transition={{
        type: "spring",
        stiffness: 450,
        damping: 24,
        mass: 0.5,
      }}
      // Set a CSS variable `--shine` that adapts or can be overridden via className
      className={cn(
        "group inline-flex items-center justify-center px-6 py-2 rounded-md relative overflow-hidden bg-background border border-border",
        "text-foreground font-medium transition-colors duration-(--vng-transition-speed,150ms) focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 select-none",
        "[--shine:rgba(255,255,255,.75)] dark:[--shine:rgba(255,255,255,.75)]",
        className,
      )}
    >
      {/* Text with shine mask */}
      <motion.span
        className="tracking-wide font-medium flex items-center justify-center gap-2 h-full w-full relative z-10"
        style={
          isAnimated
            ? {
                WebkitMaskImage:
                  "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
                maskImage:
                  "linear-gradient(-75deg, white calc(var(--mask-x) + 20%), transparent calc(var(--mask-x) + 30%), white calc(var(--mask-x) + 100%))",
              }
            : undefined
        }
        initial={isAnimated ? ({ ["--mask-x" as any]: "100%" } as any) : undefined}
        animate={isAnimated ? ({ ["--mask-x" as any]: "-100%" } as any) : undefined}
        transition={
          isAnimated
            ? {
                repeat: Infinity,
                duration: 1.5,
                ease: "linear",
                repeatDelay: 0.8,
              }
            : undefined
        }
      >
        {children}
      </motion.span>

      {/* Surface light sweep when animated */}
      {isAnimated && (
        <motion.span
          className="block absolute inset-0 rounded-md pointer-events-none z-0"
          style={{
            background:
              "linear-gradient(-75deg, transparent 25%, rgba(255, 255, 255, 0.16) 50%, transparent 75%)",
            backgroundSize: "200% 100%",
          }}
          initial={{ backgroundPosition: "100% 0", opacity: 0 }}
          animate={{ backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 0.8, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0.8,
          }}
        />
      )}

      {/* Border shine effect uses the --shine variable */}
      {isAnimated && (
        <motion.span
          className="block absolute inset-0 rounded-md p-px pointer-events-none z-20"
          style={{
            background:
              "linear-gradient(-75deg, transparent 30%, var(--shine) 50%, transparent 70%)",
            backgroundSize: "200% 100%",
            mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            maskComposite: "exclude",
            WebkitMask:
              "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
            WebkitMaskComposite: "xor",
          }}
          initial={{ backgroundPosition: "100% 0", opacity: 0 }}
          animate={{ backgroundPosition: ["100% 0", "0% 0"], opacity: [0, 1, 0] }}
          transition={{
            duration: 1.5,
            repeat: Infinity,
            ease: "linear",
            repeatDelay: 0.8,
          }}
        />
      )}
    </Component>
  );
};

export { AnimatedButton };
export default AnimatedButton;
