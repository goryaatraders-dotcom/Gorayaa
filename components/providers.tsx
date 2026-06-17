"use client"

import type { ReactNode } from "react"
import { AuthProvider } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { ProductsProvider } from "@/context/products-context"
import { ShopFinanceProvider } from "@/context/shop-finance-context"
import { ShopOperationsProvider } from "@/context/shop-operations-context"
import { Toaster } from "@/components/ui/sonner"

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <ShopFinanceProvider>
        <ProductsProvider>
          <ShopOperationsProvider>
            <CartProvider>
              {children}
              <Toaster richColors closeButton position="top-center" />
            </CartProvider>
          </ShopOperationsProvider>
        </ProductsProvider>
      </ShopFinanceProvider>
    </AuthProvider>
  )
}
