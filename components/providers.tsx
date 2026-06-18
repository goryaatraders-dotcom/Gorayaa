"use client"

import { usePathname, useRouter } from "next/navigation"
import { useEffect, type ReactNode } from "react"
import { AuthProvider, useAuth } from "@/context/auth-context"
import { CartProvider } from "@/context/cart-context"
import { ProductsProvider } from "@/context/products-context"
import { ShopFinanceProvider } from "@/context/shop-finance-context"
import { ShopOperationsProvider } from "@/context/shop-operations-context"
import { CropRatesProvider } from "@/context/crop-rates-context"
import { Toaster } from "@/components/ui/sonner"

function AuthGate({ children }: { children: ReactNode }) {
  const { currentUser, currentCustomer } = useAuth()
  const pathname = usePathname()
  const router = useRouter()

  const staffProtected = ["/inventory", "/shop-finance", "/ledger", "/customers"]
  const customerProtected: string[] = []

  const isStaffRoute = staffProtected.some(route => pathname === route || pathname.startsWith(route + "/"))
  const isCustomerRoute = customerProtected.some(route => pathname === route || pathname.startsWith(route + "/"))

  useEffect(() => {
    if (isStaffRoute && !currentUser) {
      router.push("/staff")
    } else if (isCustomerRoute && !currentCustomer && !currentUser) {
      router.push("/login")
    }
  }, [currentUser, currentCustomer, pathname, router, isStaffRoute, isCustomerRoute])

  if ((isStaffRoute && !currentUser) || (isCustomerRoute && !currentCustomer && !currentUser)) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <p className="text-muted-foreground animate-pulse">Redirecting to login portal...</p>
      </div>
    )
  }

  return <>{children}</>
}

export function Providers({ children }: { children: ReactNode }) {
  return (
    <AuthProvider>
      <AuthGate>
        <ShopFinanceProvider>
          <ProductsProvider>
            <CropRatesProvider>
              <ShopOperationsProvider>
                <CartProvider>
                  {children}
                  <Toaster richColors closeButton position="top-center" />
                </CartProvider>
              </ShopOperationsProvider>
            </CropRatesProvider>
          </ProductsProvider>
        </ShopFinanceProvider>
      </AuthGate>
    </AuthProvider>
  )
}
