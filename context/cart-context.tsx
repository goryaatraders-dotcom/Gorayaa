"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from "react"
import type { Product, CartItem } from "@/lib/data"
import { getOrCreateCartSessionId } from "@/lib/cart-session"
import { useAuth } from "@/context/auth-context"

interface CartContextType {
  items: CartItem[]
  addToCart: (product: Product) => void
  removeFromCart: (productId: string) => void
  updateQuantity: (productId: string, quantity: number) => void
  clearCart: () => void
  getItemQuantity: (productId: string) => number
  totalItems: number
  totalPrice: number
  hydrated: boolean
}

const CartContext = createContext<CartContextType | undefined>(undefined)

async function fetchCartFromDb(sessionId: string, customerId?: string | null) {
  const params = new URLSearchParams({ sessionId })
  if (customerId) params.set("customerId", customerId)
  const res = await fetch(`/api/cart?${params}`)
  if (!res.ok) return null
  const data = await res.json()
  return Array.isArray(data.items) ? (data.items as CartItem[]) : null
}

async function saveCartToDb(
  sessionId: string,
  items: CartItem[],
  customerId?: string | null
) {
  await fetch("/api/cart", {
    method: "PUT",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ sessionId, customerId: customerId || null, items }),
  })
}

async function deleteCartFromDb(sessionId: string, customerId?: string | null) {
  const params = new URLSearchParams({ sessionId })
  if (customerId) params.set("customerId", customerId)
  await fetch(`/api/cart?${params}`, { method: "DELETE" })
}

export function CartProvider({ children }: { children: ReactNode }) {
  const { currentCustomer } = useAuth()
  const [items, setItems] = useState<CartItem[]>([])
  const [hydrated, setHydrated] = useState(false)
  const sessionIdRef = useRef<string>("")
  const skipNextSync = useRef(true)

  const customerId = currentCustomer?.id ?? null

  useEffect(() => {
    sessionIdRef.current = getOrCreateCartSessionId()

    async function loadCart() {
      try {
        const dbItems = await fetchCartFromDb(sessionIdRef.current, customerId)
        if (dbItems) {
          setItems(dbItems)
        }
      } catch (err) {
        console.warn("Failed to load cart from database:", err)
      } finally {
        setHydrated(true)
      }
    }

    loadCart()
  }, [customerId])

  useEffect(() => {
    if (!hydrated) return
    if (skipNextSync.current) {
      skipNextSync.current = false
      return
    }

    const timer = setTimeout(() => {
      saveCartToDb(sessionIdRef.current, items, customerId).catch((err) =>
        console.warn("Failed to sync cart to database:", err)
      )
    }, 400)

    return () => clearTimeout(timer)
  }, [items, hydrated, customerId])

  const addToCart = useCallback((product: Product) => {
    setItems((current) => {
      const existingItem = current.find((item) => item.product.id === product.id)
      if (existingItem) {
        return current.map((item) =>
          item.product.id === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...current, { product, quantity: 1 }]
    })
  }, [])

  const removeFromCart = useCallback((productId: string) => {
    setItems((current) => {
      const existingItem = current.find((item) => item.product.id === productId)
      if (existingItem && existingItem.quantity > 1) {
        return current.map((item) =>
          item.product.id === productId
            ? { ...item, quantity: item.quantity - 1 }
            : item
        )
      }
      return current.filter((item) => item.product.id !== productId)
    })
  }, [])

  const updateQuantity = useCallback((productId: string, quantity: number) => {
    if (quantity <= 0) {
      setItems((current) => current.filter((item) => item.product.id !== productId))
    } else {
      setItems((current) =>
        current.map((item) =>
          item.product.id === productId ? { ...item, quantity } : item
        )
      )
    }
  }, [])

  const clearCart = useCallback(() => {
    setItems([])
    deleteCartFromDb(sessionIdRef.current, customerId).catch((err) =>
      console.warn("Failed to clear cart in database:", err)
    )
  }, [customerId])

  const getItemQuantity = useCallback(
    (productId: string) => items.find((item) => item.product.id === productId)?.quantity || 0,
    [items]
  )

  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + item.product.price * item.quantity, 0)

  return (
    <CartContext.Provider
      value={{
        items,
        addToCart,
        removeFromCart,
        updateQuantity,
        clearCart,
        getItemQuantity,
        totalItems,
        totalPrice,
        hydrated,
      }}
    >
      {children}
    </CartContext.Provider>
  )
}

export function useCart() {
  const context = useContext(CartContext)
  if (context === undefined) {
    throw new Error("useCart must be used within a CartProvider")
  }
  return context
}
