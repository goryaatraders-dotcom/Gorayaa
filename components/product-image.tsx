"use client"

import { useState } from "react"
import { Package } from "lucide-react"
import { cn } from "@/lib/utils"

type ProductImageProps = {
  src?: string
  alt: string
  className?: string
  iconClassName?: string
  sizes?: string
  priority?: boolean
}

export function ProductImage({
  src,
  alt,
  className,
  iconClassName,
  priority = false,
}: ProductImageProps) {
  const [failed, setFailed] = useState(false)

  if (!src || failed) {
    return (
      <div className={cn("flex h-full w-full items-center justify-center bg-secondary", className)}>
        <Package className={cn("h-12 w-12 text-foreground/20", iconClassName)} />
      </div>
    )
  }

  return (
    <img
      src={src}
      alt={alt}
      className={cn("object-cover w-full h-full absolute inset-0", className)}
      loading={priority ? "eager" : "lazy"}
      onError={() => setFailed(true)}
    />
  )
}
