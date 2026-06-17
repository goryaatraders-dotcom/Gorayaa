"use client"

import { useState } from "react"
import Link from "next/link"
import { Search, ArrowRight } from "lucide-react"
import { Input } from "@/components/ui/input"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { ProductCard } from "@/components/product-card"
import { AddProductDialog } from "@/components/add-product-dialog"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useProducts } from "@/context/products-context"
import { PRODUCT_CATEGORIES, type Product } from "@/lib/data"

const categories = ["All", ...PRODUCT_CATEGORIES] as const

type ProductsBrowseProps = {
  variant?: "home" | "page"
}

export function ProductsBrowse({ variant = "home" }: ProductsBrowseProps) {
  const [searchQuery, setSearchQuery] = useState("")
  const [selectedCategory, setSelectedCategory] = useState<string>("All")
  const { addToCart, removeFromCart, getItemQuantity } = useCart()
  const { products } = useProducts()
  const { hasPermission, isAuthenticated } = useAuth()
  const canManageProducts = hasPermission("canManageProducts")

  const handleAddToCart = (product: Product) => {
    const live = products.find((p) => p.id === product.id)
    const avail = live?.stock ?? product.stock
    const q = getItemQuantity(product.id)
    if (avail <= 0 || q >= avail) return
    addToCart(live ?? product)
  }

  const filteredProducts = products.filter((product) => {
    const matchesSearch =
      product.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      product.nameUrdu.includes(searchQuery) ||
      product.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesCategory = selectedCategory === "All" || product.category === selectedCategory
    return matchesSearch && matchesCategory
  })

  const isPage = variant === "page"

  return (
    <section className={`relative ${isPage ? "py-12" : "py-20"}`} id={isPage ? "catalog" : "products"}>
      {!isPage && (
        <div
          className="pointer-events-none absolute inset-0 -z-10 bg-[radial-gradient(ellipse_80%_50%_at_50%_0%,oklch(0.58_0.12_158_/_0.06),transparent_60%)]"
          aria-hidden
        />
      )}
      <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="mb-12 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between">
          <div className="animate-fade-in-up">
            {isPage ? (
              <>
                <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
                  Catalog
                </Badge>
                <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
                  Product catalog
                </h1>
                <p className="mt-3 text-lg text-muted-foreground">
                  Browse every fertilizer we stock — same range as our shop home page.
                </p>
              </>
            ) : (
              <>
                <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
                  Our Products
                </Badge>
                <h2 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
                  Quality Fertilizers
                </h2>
                <p className="mt-3 text-lg text-muted-foreground">
                  Premium products for every crop and soil type
                </p>
                <Link
                  href="/products"
                  className="mt-4 inline-flex items-center gap-2 text-sm font-semibold text-primary transition-colors hover:text-accent"
                >
                  View full product page
                  <ArrowRight className="h-4 w-4" />
                </Link>
              </>
            )}
          </div>

          <div className="flex w-full flex-col gap-3 sm:flex-row sm:items-center sm:justify-end lg:w-auto">
            {canManageProducts && <AddProductDialog canAdd />}
            {!canManageProducts && (
              <p className="text-center text-xs text-muted-foreground sm:text-right lg:max-w-[220px]">
                {isAuthenticated ? (
                  <>
                    Your role cannot add products. Use an <span className="font-medium text-foreground">owner</span> or{" "}
                    <span className="font-medium text-foreground">manager</span> account on{" "}
                    <Link href="/staff" className="font-semibold text-primary underline-offset-2 hover:underline">
                      Staff
                    </Link>
                    .
                  </>
                ) : (
                  <>
                    <Link href="/staff" className="font-semibold text-primary underline-offset-2 hover:underline">
                      Sign in
                    </Link>{" "}
                    as owner or manager to add products.
                  </>
                )}
              </p>
            )}
            <div className="relative w-full animate-fade-in-up stagger-1 sm:min-w-[260px] lg:w-96">
              <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search fertilizers..."
                className="h-14 rounded-full border-border/80 bg-card/90 pl-12 text-base shadow-inner transition-all duration-300 hover:border-accent/40 hover:shadow-md focus-visible:ring-2 focus-visible:ring-ring"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </div>
        </div>

        <div className="mb-10 flex flex-wrap gap-2 animate-fade-in-up stagger-2">
          {categories.map((category) => (
            <Button
              key={category}
              variant={selectedCategory === category ? "default" : "secondary"}
              onClick={() => setSelectedCategory(category)}
              className={`h-11 rounded-full px-6 font-medium transition-all duration-300 ${
                selectedCategory === category
                  ? "shadow-lg shadow-primary/15"
                  : "hover:bg-secondary/90 hover:shadow-md"
              }`}
            >
              {category}
            </Button>
          ))}
        </div>

        <div className="grid grid-cols-1 gap-6 sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
          {filteredProducts.map((product, index) => {
            const live = products.find((p) => p.id === product.id) ?? product
            const q = getItemQuantity(product.id)
            const canAddMore = live.stock > q
            return (
              <ProductCard
                key={product.id}
                product={live}
                quantity={q}
                onAddToCart={handleAddToCart}
                onRemoveFromCart={removeFromCart}
                canAddMore={canAddMore}
                index={index}
              />
            )
          })}
        </div>

        {filteredProducts.length === 0 && (
          <div className="animate-fade-in-up py-20 text-center">
            <p className="text-xl text-muted-foreground">No products found matching your search.</p>
          </div>
        )}
      </div>
    </section>
  )
}
