"use client"

import * as React from "react"
import { format } from "date-fns"
import { ChevronDownIcon } from "lucide-react"
import type { DateRange } from "react-day-picker"

import { cn } from "@/lib/utils"
import { Button } from "@/components/ui/button"
import { Calendar } from "@/components/ui/calendar"
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover"

export function DateRangePicker({
  className,
}: React.HTMLAttributes<HTMLDivElement>) {
  const [date, setDate] = React.useState<DateRange | undefined>({
    from: new Date(2026, 8, 4), // Sep 4, 2026
    to: new Date(2026, 9, 4),   // Oct 4, 2026
  })

  return (
    <div className={cn("grid gap-2", className)}>
      <Popover>
        <PopoverTrigger
          render={
            <Button
              id="date-range"
              variant="outline"
              className={cn(
                "h-8.5 w-auto justify-between gap-2.5 rounded-lg border-2 border-border bg-background/50 px-3 text-left text-xs sm:text-sm font-normal hover:bg-muted/60 hover:text-foreground transition-colors shadow-xs cursor-pointer",
                !date && "text-muted-foreground"
              )}
            />
          }
        >
          <span className="font-medium text-foreground">
            {date?.from ? (
              date.to ? (
                <>
                  {format(date.from, "MMM d, yyyy")} -{" "}
                  {format(date.to, "MMM d, yyyy")}
                </>
              ) : (
                format(date.from, "MMM d, yyyy")
              )
            ) : (
              <span>Pick a date range</span>
            )}
          </span>
          <ChevronDownIcon className="size-3.5 shrink-0 text-muted-foreground opacity-70" />
        </PopoverTrigger>
        <PopoverContent
          className="w-auto p-0 border-2 border-border bg-popover shadow-xl rounded-xl"
          align="end"
        >
          <Calendar
            mode="range"
            defaultMonth={date?.from}
            selected={date}
            onSelect={setDate}
            numberOfMonths={2}
          />
        </PopoverContent>
      </Popover>
    </div>
  )
}
