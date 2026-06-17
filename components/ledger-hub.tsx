"use client"

import Link from "next/link"
import {
  ArrowLeft,
  BookOpen,
  ArrowRight,
  Lock,
  Unlock,
  ShoppingCart,
  Truck,
  Wallet,
  Receipt,
  Package,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent } from "@/components/ui/card"
import { Header } from "@/components/header"
import { useAuth } from "@/context/auth-context"
import { ledgerBooks, type LedgerBookId } from "@/lib/data"

const iconMap: Record<LedgerBookId, typeof ShoppingCart> = {
  sales: ShoppingCart,
  purchases: Package,
  "cash-bank": Wallet,
  expenses: Receipt,
  "load-unload": Truck,
}

export function LedgerHub() {
  const { hasPermission, currentUser, isAuthenticated } = useAuth()
  const canOpen = hasPermission("canOpenLedgers")

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to shop
        </Link>

        <div className="mb-10 flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between animate-fade-in-up">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
              Financial records
            </Badge>
            <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">Ledgers</h1>
            <p className="mt-2 max-w-2xl text-lg text-muted-foreground">
              Five separate books for sales, purchases, cash, expenses, and load/unload. Only{" "}
              <span className="font-semibold text-foreground">Owner</span> and{" "}
              <span className="font-semibold text-foreground">Manager</span> can open and edit them.
            </p>
          </div>
          <div className="flex flex-wrap items-center gap-3">
            {isAuthenticated && currentUser ? (
              <Badge variant="outline" className="h-10 rounded-full px-4 py-2 text-sm">
                {canOpen ? (
                  <span className="flex items-center gap-2">
                    <Unlock className="h-4 w-4 text-emerald-600" />
                    {currentUser.name} — access granted
                  </span>
                ) : (
                  <span className="flex items-center gap-2">
                    <Lock className="h-4 w-4 text-amber-600" />
                    {currentUser.name} — no ledger access
                  </span>
                )}
              </Badge>
            ) : (
              <Button asChild variant="secondary" className="h-12 rounded-full gap-2">
                <Link href="/staff">
                  <Lock className="h-4 w-4" />
                  Staff sign-in
                </Link>
              </Button>
            )}
          </div>
        </div>

        <div className="grid gap-5 sm:grid-cols-2 xl:grid-cols-3">
          {ledgerBooks.map((book, i) => {
            const Icon = iconMap[book.id]
            return (
              <Link key={book.id} href={`/ledger/${book.id}`} className="group block animate-fade-in-up">
                <Card
                  className={`h-full rounded-3xl border-border/60 transition-all duration-300 hover:-translate-y-1 hover:shadow-lg hover:border-primary/20 ${
                    i % 2 === 0 ? "bg-card" : "bg-secondary/20"
                  }`}
                >
                  <CardContent className="flex flex-col gap-4 p-7">
                    <div className="flex items-start justify-between gap-3">
                      <div className="flex h-14 w-14 items-center justify-center rounded-2xl bg-foreground text-background transition-transform duration-300 group-hover:scale-105">
                        <Icon className="h-7 w-7" />
                      </div>
                      {!canOpen && (
                        <span className="rounded-full bg-amber-500/10 px-3 py-1 text-xs font-medium text-amber-800 dark:text-amber-200">
                          Manager / Owner
                        </span>
                      )}
                    </div>
                    <div>
                      <h2 className="text-xl font-bold text-foreground group-hover:text-primary transition-colors">
                        {book.name}
                      </h2>
                      <p className="text-sm text-muted-foreground" dir="rtl">
                        {book.nameUrdu}
                      </p>
                      <p className="mt-2 text-sm leading-relaxed text-muted-foreground">{book.description}</p>
                    </div>
                    <div className="flex items-center gap-2 pt-2 text-sm font-semibold text-primary">
                      Open ledger
                      <ArrowRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
                    </div>
                  </CardContent>
                </Card>
              </Link>
            )
          })}
        </div>

        <div className="mt-12 rounded-3xl border border-border/60 bg-secondary/30 p-8 text-center">
          <BookOpen className="mx-auto mb-3 h-10 w-10 text-muted-foreground" />
          <p className="text-sm text-muted-foreground max-w-xl mx-auto">
            Use the <Link href="/staff" className="font-semibold text-foreground underline-offset-4 hover:underline">Staff</Link>{" "}
            page to sign in as a team member. Load/unload department accounts cannot open these ledgers.
          </p>
        </div>
      </main>
    </div>
  )
}
