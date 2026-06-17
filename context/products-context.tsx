"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { seedProducts, type Product } from "@/lib/data"

const STORAGE_KEY = "goraya-traders-products-v1"

function mergeSeedImages(list: Product[]): Product[] {
  const seedById = Object.fromEntries(seedProducts.map((p) => [p.id, p]))
  return list.map((p) => {
    const seed = seedById[p.id]
    const staleLocal = !p.image || p.image.startsWith("/products/")
    return staleLocal && seed ? { ...p, image: seed.image } : p
  })
}

function readStoredProducts(): Product[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as Product[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return mergeSeedImages(parsed)
  } catch {
    return null
  }
}

interface ProductsContextType {
  products: Product[]
  addProduct: (product: Omit<Product, "id">) => void
  updateProductStock: (productId: string, newStock: number) => void
  adjustProductStock: (productId: string, delta: number) => boolean
  /** Atomically reduce stock for all lines, or roll back (no change) if any line fails */
  deductStockForOrder: (lines: { productId: string; quantity: number }[]) => boolean
  hydrated: boolean
}

const ProductsContext = createContext<ProductsContextType | undefined>(undefined)

export function ProductsProvider({ children }: { children: ReactNode }) {
  const [products, setProducts] = useState<Product[]>(seedProducts)
  const [hydrated, setHydrated] = useState(false)

  // Fetch from MongoDB, auto-seed if empty, fallback to localStorage
  useEffect(() => {
    async function initProducts() {
      try {
        let res = await fetch("/api/products")
        if (res.ok) {
          let data = await res.json()
          if (Array.isArray(data) && data.length === 0) {
            await fetch("/api/db-seed")
            res = await fetch("/api/products")
            if (res.ok) data = await res.json()
          }
          if (Array.isArray(data) && data.length > 0) {
            setProducts(mergeSeedImages(data.map((p) => ({
              ...p,
              id: p.id || p._id?.toString?.() || String(p._id),
            }))))
            setHydrated(true)
            return
          }
        }
      } catch (err) {
        console.warn("Failed to fetch products from db, falling back to storage:", err)
      }
      
      const stored = readStoredProducts()
      if (stored) setProducts(stored)
      else setProducts(seedProducts)
      setHydrated(true)
    }
    
    initProducts()
  }, [])

  // Save local fallback to localStorage
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(products))
    } catch {
      /* ignore quota */
    }
  }, [products, hydrated])

  const addProduct = useCallback(async (input: Omit<Product, "id">) => {
    try {
      const res = await fetch("/api/products", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.product) {
          setProducts((prev) => [...prev, data.product])
          return
        }
      }
    } catch (err) {
      console.error("Failed to add product to database, saving locally:", err)
    }

    // Local Fallback
    const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    setProducts((prev) => [...prev, { ...input, id }])
  }, [])

  const updateProductStock = useCallback(async (productId: string, newStock: number) => {
    const n = Math.max(0, Math.floor(Number(newStock) || 0))
    try {
      const res = await fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, stock: n }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          setProducts((prev) =>
            prev.map((p) => (p.id === productId ? { ...p, stock: n } : p))
          )
          return
        }
      }
    } catch (err) {
      console.error("Failed to update product stock on database, updating locally:", err)
    }

    // Local Fallback
    setProducts((prev) =>
      prev.map((p) => (p.id === productId ? { ...p, stock: n } : p))
    )
  }, [])

  const adjustProductStock = useCallback(async (productId: string, delta: number) => {
    let ok = false
    setProducts((prev) => {
      const target = prev.find(p => p.id === productId)
      if (!target) return prev
      const nextStock = target.stock + delta
      if (nextStock < 0) return prev
      
      ok = true
      
      // Attempt async background database sync
      fetch("/api/products", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id: productId, stock: nextStock }),
      }).catch(err => console.error("Failed to sync stock adjustment:", err))

      return prev.map((p) => {
        if (p.id !== productId) return p
        return { ...p, stock: nextStock }
      })
    })
    return ok
  }, [])

  const deductStockForOrder = useCallback((lines: { productId: string; quantity: number }[]) => {
    let ok = false
    setProducts((prev) => {
      const next = prev.map((p) => ({ ...p }))
      for (const line of lines) {
        const idx = next.findIndex((x) => x.id === line.productId)
        if (idx === -1 || next[idx].stock < line.quantity) return prev
      }
      for (const line of lines) {
        const idx = next.findIndex((x) => x.id === line.productId)
        const nextStock = next[idx].stock - line.quantity
        next[idx] = { ...next[idx], stock: nextStock }
        
        // Background sync to db
        fetch("/api/products", {
          method: "PUT",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({ id: line.productId, stock: nextStock }),
        }).catch(err => console.error("Failed to sync stock deduction:", err))
      }
      ok = true
      return next
    })
    return ok
  }, [])

  return (
    <ProductsContext.Provider
      value={{
        products,
        addProduct,
        updateProductStock,
        adjustProductStock,
        deductStockForOrder,
        hydrated,
      }}
    >
      {children}
    </ProductsContext.Provider>
  )
}

export function useProducts() {
  const ctx = useContext(ProductsContext)
  if (ctx === undefined) {
    throw new Error("useProducts must be used within a ProductsProvider")
  }
  return ctx
}
