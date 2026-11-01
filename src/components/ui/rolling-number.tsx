"use client";

import * as React from "react";
import NumberFlow, { type Format, type Trend } from "@number-flow/react";
import { useInView } from "react-intersection-observer";
import { cn } from "@/lib/utils";

export interface RollingNumberProps {
  value: number;
  className?: string;
  trend?: Trend;
  prefix?: string;
  suffix?: string;
  format?: Format;
}

export function RollingNumber({
  value,
  className,
  trend = 1,
  prefix,
  suffix,
  format,
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
        prefix={prefix}
        suffix={suffix}
        format={format}
        className={cn(
          "text-2xl font-bold font-heading text-foreground tabular-nums leading-tight",
          className
        )}
      />
    </span>
  );
}
