"use client"

import * as React from "react"
import Link from "next/link"
import Image from "next/image"
import { ArrowRight, Sparkles, MoreHorizontal } from "lucide-react"

import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card"
import {
  Empty,
  EmptyHeader,
  EmptyTitle,
  EmptyDescription,
  EmptyContent,
} from "@/components/ui/empty"
import { Button } from "@/components/ui/button"

export interface SketchItem {
  id: string
  title: string
  date: string
  imageUrl: string
}

interface RecentSketchesProps {
  sketches?: SketchItem[]
}

export function RecentSketches({ sketches = [] }: RecentSketchesProps) {
  const hasSketches = sketches && sketches.length > 0

  return (
    <Card className="@container/card rounded-xl border border-border/70 bg-card/70 shadow-xs h-full flex flex-col justify-between">
      <CardHeader className="flex flex-row items-center justify-between gap-4 border-b border-border/40 px-5 sm:px-6 py-4">
        <div className="space-y-1">
          <CardTitle className="text-base font-semibold tracking-tight text-foreground">
            Recent Sketches
          </CardTitle>
          <CardDescription className="text-xs text-muted-foreground">
            Latest AI-generated composite sketches.
          </CardDescription>
        </div>
        <Link
          href="/sketch"
          className="group flex items-center gap-1 text-xs font-medium text-blue-400 hover:text-blue-300 transition-colors"
        >
          <span>View all</span>
          <ArrowRight className="size-3.5 transition-transform group-hover:translate-x-0.5" />
        </Link>
      </CardHeader>
      <CardContent className="p-5 flex-1 flex flex-col justify-center">
        {hasSketches ? (
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-3">
            {sketches.map((sketch) => (
              <div
                key={sketch.id}
                className="group relative flex flex-col overflow-hidden rounded-xl border border-border/70 bg-card/50 hover:border-border transition-colors"
              >
                <div className="relative aspect-[3/4] w-full overflow-hidden bg-muted/40">
                  <Image
                    src={sketch.imageUrl}
                    alt={sketch.title}
                    fill
                    className="object-cover grayscale contrast-110 group-hover:scale-105 transition-transform duration-300"
                  />
                </div>
                <div className="flex items-center justify-between p-2.5">
                  <div className="min-w-0">
                    <p className="truncate text-xs font-semibold text-foreground">
                      {sketch.title}
                    </p>
                    <p className="text-[10px] text-muted-foreground">
                      {sketch.date}
                    </p>
                  </div>
                  <button
                    type="button"
                    className="text-muted-foreground hover:text-foreground cursor-pointer"
                  >
                    <MoreHorizontal className="size-3.5" />
                  </button>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <Empty className="py-12 border-2 border-dashed border-border/60 rounded-xl bg-card/30">
            <EmptyHeader>
              <EmptyTitle className="text-sm font-semibold text-foreground">
                No recent sketches generated
              </EmptyTitle>
              <EmptyDescription className="text-xs text-muted-foreground max-w-[270px]">
                Create composite suspect sketches using the AI Forensic Sketch Generator.
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button
                size="sm"
                className="h-8 gap-1.5 rounded-lg bg-blue-600 hover:bg-blue-500 text-white text-xs font-medium cursor-pointer shadow-xs"
                render={<Link href="/sketch" />}
                nativeButton={false}
              >
                <Sparkles className="size-3.5" />
                <span>Generate Sketch</span>
              </Button>
            </EmptyContent>
          </Empty>
        )}
      </CardContent>
    </Card>
  )
}
