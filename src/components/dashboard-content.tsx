"use client"

import * as React from "react"
import { motion } from "motion/react"
import { DashboardHeader } from "@/components/dashboard-header"
import { SectionCards } from "@/components/section-cards"
import { ChartAreaInteractive } from "@/components/chart-area-interactive"
import { RecentCasesTable } from "@/components/recent-cases-table"
import { RecentSketches } from "@/components/recent-sketches"

const containerVariants = {
  hidden: { opacity: 0 },
  visible: {
    opacity: 1,
    transition: {
      staggerChildren: 0.08,
      delayChildren: 0.04,
    },
  },
}

const itemVariants = {
  hidden: { opacity: 0, y: 14, filter: "blur(3px)" },
  visible: {
    opacity: 1,
    y: 0,
    filter: "blur(0px)",
    transition: {
      duration: 0.45,
      ease: [0.16, 1, 0.3, 1] as const,
    },
  },
}

export function DashboardContent({ userName }: { userName: string }) {
  return (
    <motion.div
      variants={containerVariants}
      initial="hidden"
      animate="visible"
      className="flex flex-col gap-4 py-4 md:gap-6 md:py-6"
    >
      {/* 1. Header (Welcome text & Date Range Picker) */}
      <motion.div variants={itemVariants}>
        <DashboardHeader initialUserName={userName} />
      </motion.div>

      {/* 2. Metric Cards */}
      <motion.div variants={itemVariants}>
        <SectionCards />
      </motion.div>

      {/* 3. Area Chart */}
      <motion.div variants={itemVariants} className="px-4 lg:px-6">
        <ChartAreaInteractive />
      </motion.div>

      {/* 4. Bottom Section: Recent Cases & Recent Sketches */}
      <motion.div
        variants={itemVariants}
        className="grid grid-cols-1 gap-4 px-4 lg:grid-cols-12 lg:px-6"
      >
        <div className="lg:col-span-7">
          <RecentCasesTable />
        </div>
        <div className="lg:col-span-5">
          <RecentSketches />
        </div>
      </motion.div>
    </motion.div>
  )
}
