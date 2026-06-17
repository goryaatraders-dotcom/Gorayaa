"use client"

import Link from "next/link"
import { usePathname } from "next/navigation"
import { useState } from "react"
import { ShoppingCart, Menu, X, BookOpen, ArrowRight, Users } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { GTLogo } from "@/components/gt-logo"
import { cn } from "@/lib/utils"

interface HeaderProps {
  cartCount?: number
}

const navItems = [
  { href: "/", label: "Shop" },
  { href: "/products", label: "Products" },
  { href: "/inventory", label: "Stock" },
  { href: "/shop-finance", label: "Finance" },
  { href: "/ledger", label: "Ledgers" },
  { href: "/customers", label: "Customers" },
  { href: "/staff", label: "Staff" },
  { href: "/contact", label: "Contact" },
] as const

export function Header({ cartCount = 0 }: HeaderProps) {
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false)
  const pathname = usePathname()

  const linkClass = (href: string) =>
    cn(
      "nav-link-hover rounded-full px-5 py-2.5 text-sm font-medium",
      pathname === href || (href !== "/" && pathname.startsWith(href))
        ? "bg-foreground text-background shadow-md shadow-primary/15"
        : "text-muted-foreground hover:bg-secondary/90 hover:text-foreground hover:shadow-sm"
    )

  return (
    <header className="sticky top-0 z-50 border-b border-border/40 glass shadow-sm shadow-primary/5">
      <nav className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
        <div className="flex h-20 items-center justify-between gap-4">
          <Link
            href="/"
            className="group flex min-w-0 max-w-[min(100%,14rem)] shrink items-center gap-3 rounded-2xl py-1 pr-2 transition-all duration-300 hover:bg-secondary/50 sm:max-w-none sm:gap-3.5"
          >
            <GTLogo size="sm" className="group-hover:scale-105" />
            <span className="min-w-0 text-balance text-lg font-black leading-none tracking-tight text-foreground sm:text-2xl sm:leading-tight">
              Goraya Traders
            </span>
          </Link>

          <div className="hidden items-center gap-0.5 md:flex lg:gap-1">
            {navItems.map((item) => (
              <Link key={item.href} href={item.href} className={linkClass(item.href)}>
                {item.label}
              </Link>
            ))}
          </div>

          <div className="flex shrink-0 items-center gap-2 sm:gap-3">
            <Link href="/cart" className="relative group">
              <Button
                variant="ghost"
                size="icon"
                className="relative h-11 w-11 rounded-full hover:bg-secondary transition-all duration-300 sm:h-12 sm:w-12"
              >
                <ShoppingCart className="h-5 w-5 transition-transform duration-300 group-hover:scale-110" />
                {cartCount > 0 && (
                  <Badge className="absolute -top-0.5 -right-0.5 h-5 w-5 flex items-center justify-center p-0 text-xs bg-accent text-accent-foreground border-2 border-background animate-scale-in">
                    {cartCount}
                  </Badge>
                )}
              </Button>
            </Link>

            <Link href="/ledger" className="hidden sm:block">
              <Button className="rounded-full gap-2 group h-11 px-4 font-medium lg:h-12 lg:px-6">
                <BookOpen className="h-4 w-4 shrink-0" />
                <span className="hidden lg:inline">Ledgers</span>
                <span className="lg:hidden">Books</span>
                <ArrowRight className="h-4 w-4 shrink-0 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </Link>

            <Link href="/staff" className="hidden md:block">
              <Button variant="outline" className="rounded-full gap-2 h-11 px-4 font-medium lg:h-12 lg:px-5 border-border/80">
                <Users className="h-4 w-4" />
                Staff
              </Button>
            </Link>

            <Button
              variant="ghost"
              size="icon"
              className="md:hidden h-11 w-11 rounded-full hover:bg-secondary"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
              aria-label={mobileMenuOpen ? "Close menu" : "Open menu"}
            >
              {mobileMenuOpen ? <X className="h-5 w-5" /> : <Menu className="h-5 w-5" />}
            </Button>
          </div>
        </div>

        {mobileMenuOpen && (
          <div className="md:hidden py-6 border-t border-border animate-slide-up">
            <div className="flex flex-col gap-1">
              {navItems.map((item) => {
                const active =
                  pathname === item.href || (item.href !== "/" && pathname.startsWith(item.href))
                return (
                  <Link
                    key={item.href}
                    href={item.href}
                    className={cn(
                      "text-lg font-medium py-3 px-4 rounded-xl transition-all duration-300 animate-fade-in-up",
                      active
                        ? "bg-foreground text-background"
                        : "text-foreground hover:bg-secondary"
                    )}
                    onClick={() => setMobileMenuOpen(false)}
                  >
                    {item.label}
                  </Link>
                )
              })}
            </div>
          </div>
        )}
      </nav>
    </header>
  )
}
