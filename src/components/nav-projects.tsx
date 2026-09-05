"use client"

import * as React from "react"
import { motion } from "motion/react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarGroup,
  SidebarGroupLabel,
  SidebarMenu,
  SidebarMenuAction,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import { MoreHorizontalIcon, FolderIcon, ShareIcon, Trash2Icon } from "lucide-react"

function ProjectDropdown({ item, isMobile }: { item: { name: string; url: string }; isMobile: boolean }) {
  const [hoveredAction, setHoveredAction] = React.useState<string | null>(null)

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        render={
          <SidebarMenuAction
            showOnHover
            className="aria-expanded:bg-muted"
          />
        }
      >
        <MoreHorizontalIcon />
        <span className="sr-only">More</span>
      </DropdownMenuTrigger>
      <DropdownMenuContent
        className="w-48 p-1 rounded-xl shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
        side={isMobile ? "bottom" : "right"}
        align={isMobile ? "end" : "start"}
        sideOffset={6}
        onPointerLeave={() => setHoveredAction(null)}
      >
        <motion.div
          initial={{ opacity: 0, scale: 0.96, y: -6 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.96, y: -6 }}
          transition={{ duration: 0.22, ease: [0.16, 1, 0.3, 1] }}
          className="space-y-0.5"
        >
          <DropdownMenuItem
            onPointerEnter={() => setHoveredAction("view")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
          >
            {hoveredAction === "view" && (
              <motion.div
                layoutId={`nav-project-hover-${item.name}`}
                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              />
            )}
            <FolderIcon className="size-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
            <span>View Project</span>
          </DropdownMenuItem>
          <DropdownMenuItem
            onPointerEnter={() => setHoveredAction("share")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-accent-foreground hover:text-accent-foreground !bg-transparent text-xs font-medium"
          >
            {hoveredAction === "share" && (
              <motion.div
                layoutId={`nav-project-hover-${item.name}`}
                className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              />
            )}
            <ShareIcon className="size-4 text-muted-foreground group-hover:text-accent-foreground transition-colors" />
            <span>Share Project</span>
          </DropdownMenuItem>
          <DropdownMenuSeparator className="opacity-50" />
          <DropdownMenuItem
            onPointerEnter={() => setHoveredAction("delete")}
            className="relative z-0 group flex items-center gap-2 cursor-pointer px-2.5 py-1.5 rounded-md transition-colors focus:text-destructive hover:text-destructive !bg-transparent text-xs font-medium text-destructive"
          >
            {hoveredAction === "delete" && (
              <motion.div
                layoutId={`nav-project-hover-${item.name}`}
                className="absolute inset-0 z-[-1] rounded-md bg-destructive/15"
                transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
              />
            )}
            <Trash2Icon className="size-4 text-destructive group-hover:text-destructive transition-colors" />
            <span>Delete Project</span>
          </DropdownMenuItem>
        </motion.div>
      </DropdownMenuContent>
    </DropdownMenu>
  )
}

export function NavProjects({
  projects,
}: {
  projects: {
    name: string
    url: string
    icon: React.ReactNode
  }[]
}) {
  const { isMobile } = useSidebar()
  return (
    <SidebarGroup className="group-data-[collapsible=icon]:hidden">
      <SidebarGroupLabel>Projects</SidebarGroupLabel>
      <SidebarMenu>
        {projects.map((item) => (
          <SidebarMenuItem key={item.name}>
            <SidebarMenuButton render={<a href={item.url} />}>
              {item.icon}
              <span>{item.name}</span>
            </SidebarMenuButton>
            <ProjectDropdown item={item} isMobile={isMobile} />
          </SidebarMenuItem>
        ))}
        <SidebarMenuItem>
          <SidebarMenuButton>
            <MoreHorizontalIcon />
            <span>More</span>
          </SidebarMenuButton>
        </SidebarMenuItem>
      </SidebarMenu>
    </SidebarGroup>
  )
}
