"use client";

import * as React from "react";
import NumberFlow from "@number-flow/react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

export interface RollingNumberProps {
  value: number;
  className?: string;
  trend?: -1 | 0 | 1;
}

export function RollingNumber({
  value,
  className,
  trend = 1,
}: RollingNumberProps) {
  const [displayValue, setDisplayValue] = React.useState(0);
  const { ref, inView } = useInView({ triggerOnce: true, threshold: 0.1 });

  React.useEffect(() => {
    if (inView) {
      setDisplayValue(value);
    }
  }, [inView, value]);

  return (
    <span ref={ref} className="inline-block tabular-nums">
      <NumberFlow
        value={displayValue}
        trend={trend}
        className={cn(
          "text-2xl font-bold font-heading text-foreground tabular-nums leading-tight",
          className
        )}
      />
    </span>
  );
}
