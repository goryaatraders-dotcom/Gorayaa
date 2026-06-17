"use client"

import Link from "next/link"
import { ArrowLeft } from "lucide-react"
import { Header } from "@/components/header"
import { ProductsBrowse } from "@/components/products-browse"
import { useCart } from "@/context/cart-context"

function ProductsPageContent() {
  const { totalItems } = useCart()
  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />
      <main className="pb-20">
        <div className="mx-auto max-w-7xl px-4 pt-8 sm:px-6 lg:px-8">
          <Link
            href="/"
            className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
            Back to shop (home)
          </Link>
        </div>
        <ProductsBrowse variant="page" />
      </main>
    </div>
  )
}

export default function ProductsPage() {
  return <ProductsPageContent />
}
