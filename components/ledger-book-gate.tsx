"use client"

import Link from "next/link"
import { Lock, ArrowLeft, LogIn } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Header } from "@/components/header"
import { LedgerBookContent } from "@/components/ledger-book-content"
import { useAuth } from "@/context/auth-context"
import type { LedgerBookId } from "@/lib/data"

export function LedgerBookGate({ bookId }: { bookId: LedgerBookId }) {
  const { hasPermission, currentUser } = useAuth()
  const allowed = hasPermission("canOpenLedgers")

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartCount={0} />
        <main className="mx-auto max-w-lg px-4 py-16 sm:px-6">
          <Link
            href="/ledger"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to ledgers
          </Link>
          <Card className="rounded-3xl border-border/60 shadow-sm">
            <CardHeader className="text-center pb-2">
              <div className="mx-auto mb-4 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <Lock className="h-7 w-7 text-amber-600" />
              </div>
              <CardTitle className="text-2xl font-black">Ledger restricted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4 text-center text-muted-foreground">
              <p>
                Only the <strong className="text-foreground">Owner</strong> or{" "}
                <strong className="text-foreground">Manager</strong> can open this ledger. Load / unload staff use the
                staff portal without financial access.
              </p>
              <Button asChild className="rounded-full gap-2">
                <Link href="/staff">
                  <LogIn className="h-4 w-4" />
                  Sign in as staff
                </Link>
              </Button>
              {currentUser && (
                <p className="text-sm pt-2">
                  Signed in as <span className="font-semibold text-foreground">{currentUser.name}</span> (
                  {currentUser.role}) — switch account on the Staff page.
                </p>
              )}
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return <LedgerBookContent bookId={bookId} />
}
