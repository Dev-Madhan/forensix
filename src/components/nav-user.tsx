"use client"

import * as React from "react"
import Link from "next/link"
import { useRouter } from "next/navigation"
import { toast } from "sonner"
import { motion } from "motion/react"
import {
  Avatar,
  AvatarFallback,
  AvatarImage,
} from "@/components/ui/avatar"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar"
import {
  ChevronsUpDown,
  User,
  Settings,
  Shield,
  LogOut,
} from "lucide-react"
import { authClient } from "@/lib/auth-client"

export function NavUser({
  user,
}: {
  user: {
    name: string
    email: string
    avatar?: string
    role?: string
  }
}) {
  const { isMobile } = useSidebar()
  const router = useRouter()
  const [isPending, setIsPending] = React.useState(false)
  const [hoveredItem, setHoveredItem] = React.useState<string | null>(null)

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .filter(Boolean)
        .join("")
        .toUpperCase()
        .slice(0, 2)
    : "FX"

  const handleSignOut = async () => {
    if (isPending) return
    setIsPending(true)
    try {
      await authClient.signOut()
      toast.success("Signed out successfully")
      router.push("/auth")
      router.refresh()
    } catch {
      toast.error("Failed to sign out")
      setIsPending(false)
    }
  }

  const isAdmin = user.role === "ADMIN"

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <DropdownMenu>
          <DropdownMenuTrigger
            render={
              <SidebarMenuButton size="lg" className="aria-expanded:bg-muted" />
            }
          >
            <Avatar className="size-8 rounded-lg">
              <AvatarImage src={user.avatar} alt={user.name} />
              <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">
                {initials}
              </AvatarFallback>
            </Avatar>
            <div className="grid flex-1 text-left text-sm leading-tight">
              <span className="truncate font-semibold">{user.name}</span>
              <span className="truncate text-xs text-muted-foreground">{user.email}</span>
            </div>
            <ChevronsUpDown className="ml-auto size-4 text-muted-foreground" />
          </DropdownMenuTrigger>
          <DropdownMenuContent
            className="w-(--anchor-width) min-w-56 rounded-xl p-1 shadow-xl bg-card/95 backdrop-blur-xl border-2 border-border overflow-hidden"
            side={isMobile ? "bottom" : "right"}
            align="end"
            sideOffset={4}
            onPointerLeave={() => setHoveredItem(null)}
          >
            <motion.div
              initial={{ opacity: 0, scale: 0.96, y: 6 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              transition={{ duration: 0.2, ease: [0.16, 1, 0.3, 1] }}
            >
              <DropdownMenuGroup>
                <DropdownMenuLabel className="p-0 font-normal">
                  <div className="flex items-center gap-2.5 px-2 py-1.5 text-left text-sm">
                    <Avatar className="size-8 rounded-lg">
                      <AvatarImage src={user.avatar} alt={user.name} />
                      <AvatarFallback className="rounded-lg bg-muted text-xs font-semibold">
                        {initials}
                      </AvatarFallback>
                    </Avatar>
                    <div className="grid flex-1 text-left text-sm leading-tight min-w-0">
                      <div className="flex items-center justify-between gap-1">
                        <span className="truncate font-medium">{user.name}</span>
                        {user.role && (
                          <span className="text-[10px] font-medium text-muted-foreground bg-muted px-1.5 py-0.5 rounded capitalize">
                            {user.role.toLowerCase()}
                          </span>
                        )}
                      </div>
                      <span className="truncate text-xs text-muted-foreground">{user.email}</span>
                    </div>
                  </div>
                </DropdownMenuLabel>
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="opacity-50" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="relative z-0 cursor-pointer gap-2 px-2 py-1.5 rounded-md transition-colors hover:!bg-transparent focus:!bg-transparent"
                  onPointerEnter={() => setHoveredItem("profile")}
                  render={<Link href="/profile" />}
                >
                  {hoveredItem === "profile" && (
                    <motion.div
                      layoutId="nav-user-dropdown-hover"
                      className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <User className="size-4 text-muted-foreground" />
                  <span>Profile</span>
                </DropdownMenuItem>

                <DropdownMenuItem
                  className="relative z-0 cursor-pointer gap-2 px-2 py-1.5 rounded-md transition-colors hover:!bg-transparent focus:!bg-transparent"
                  onPointerEnter={() => setHoveredItem("settings")}
                  render={<Link href="/settings" />}
                >
                  {hoveredItem === "settings" && (
                    <motion.div
                      layoutId="nav-user-dropdown-hover"
                      className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <Settings className="size-4 text-muted-foreground" />
                  <span>Settings</span>
                </DropdownMenuItem>

                {isAdmin && (
                  <DropdownMenuItem
                    className="relative z-0 cursor-pointer gap-2 px-2 py-1.5 rounded-md transition-colors hover:!bg-transparent focus:!bg-transparent"
                    onPointerEnter={() => setHoveredItem("admin")}
                    render={<Link href="/admin" />}
                  >
                    {hoveredItem === "admin" && (
                      <motion.div
                        layoutId="nav-user-dropdown-hover"
                        className="absolute inset-0 z-[-1] rounded-md bg-accent/80"
                        transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                      />
                    )}
                    <Shield className="size-4 text-muted-foreground" />
                    <span>Admin Panel</span>
                  </DropdownMenuItem>
                )}
              </DropdownMenuGroup>

              <DropdownMenuSeparator className="opacity-50" />

              <DropdownMenuGroup>
                <DropdownMenuItem
                  className="relative z-0 cursor-pointer gap-2 px-2 py-1.5 rounded-md text-destructive focus:text-destructive hover:!bg-transparent focus:!bg-transparent"
                  onPointerEnter={() => setHoveredItem("logout")}
                  onClick={handleSignOut}
                >
                  {hoveredItem === "logout" && (
                    <motion.div
                      layoutId="nav-user-dropdown-hover"
                      className="absolute inset-0 z-[-1] rounded-md bg-destructive/15"
                      transition={{ type: "spring", bounce: 0.3, duration: 0.4 }}
                    />
                  )}
                  <LogOut className="size-4" />
                  <span>Log out</span>
                </DropdownMenuItem>
              </DropdownMenuGroup>
            </motion.div>
          </DropdownMenuContent>
        </DropdownMenu>
      </SidebarMenuItem>
    </SidebarMenu>
  )
}
