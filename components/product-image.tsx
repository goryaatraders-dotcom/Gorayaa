"use client"

import { useState } from "react"
import Image from "next/image"
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
  sizes = "(max-width: 640px) 100vw, (max-width: 1024px) 50vw, 25vw",
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
    <Image
      src={src}
      alt={alt}
      fill
      sizes={sizes}
      priority={priority}
      className={cn("object-cover", className)}
      onError={() => setFailed(true)}
    />
  )
}
