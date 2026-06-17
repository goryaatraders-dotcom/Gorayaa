"use client"

import { Leaf } from "lucide-react"

interface ShopMarkProps {
  size?: "sm" | "md" | "lg" | "xl"
  className?: string
}

/** Rounded leaf mark — no angular “N”-style logo */
export function GTLogo({ size = "md", className = "" }: ShopMarkProps) {
  const sizes = {
    sm: { box: "h-10 w-10", icon: "h-5 w-5" },
    md: { box: "h-14 w-14", icon: "h-7 w-7" },
    lg: { box: "h-20 w-20", icon: "h-10 w-10" },
    xl: { box: "h-32 w-32", icon: "h-16 w-16" },
  }

  return (
    <div
      className={`
        ${sizes[size].box}
        flex shrink-0 items-center justify-center rounded-full
        bg-emerald-800 text-white shadow-lg shadow-emerald-900/25
        ring-2 ring-emerald-600/50 transition-transform duration-300
        group-hover:scale-105
        ${className}
      `}
      aria-hidden
    >
      <Leaf className={sizes[size].icon} strokeWidth={2.5} />
    </div>
  )
}
