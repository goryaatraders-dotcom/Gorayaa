"use client"

import { useMemo } from "react"
import Link from "next/link"
import { ArrowLeft, Lock, Minus, Package, Plus, Warehouse } from "lucide-react"
import { Header } from "@/components/header"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useProducts } from "@/context/products-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { toast } from "sonner"

function InventoryInner() {
  const { totalItems } = useCart()
  const { hasPermission } = useAuth()
  const allowed = hasPermission("canManageProducts")
  const { products, updateProductStock, adjustProductStock } = useProducts()

  const stats = useMemo(() => {
    const totalUnits = products.reduce((s, p) => s + p.stock, 0)
    const lowStock = products.filter((p) => p.stock < 50).length
    return { skuCount: products.length, totalUnits, lowStock }
  }, [products])

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartCount={totalItems} />
        <main className="mx-auto max-w-lg px-4 py-16">
          <Link
            href="/"
            className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
          <Card className="rounded-3xl border-amber-500/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <Lock className="h-7 w-7 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Stock management restricted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-center text-muted-foreground">
              <p>
                Sign in on <strong className="text-foreground">Staff</strong> as owner or manager (password{" "}
                <strong className="text-foreground">1234</strong>) to manage stock. Load / unload accounts cannot
                access this page.
              </p>
              <Button asChild className="rounded-full">
                <Link href="/staff">Staff sign-in</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4" />
          Back to shop
        </Link>

        <div className="mb-10 flex flex-col gap-4 sm:flex-row sm:items-end sm:justify-between">
          <div className="flex items-start gap-4">
            <div className="flex h-14 w-14 shrink-0 items-center justify-center rounded-2xl bg-primary/10">
              <Warehouse className="h-7 w-7 text-primary" />
            </div>
            <div>
              <Badge variant="secondary" className="mb-2 rounded-full">
                Inventory
              </Badge>
              <h1 className="text-4xl font-black tracking-tight text-foreground">Stock management</h1>
              <p className="mt-2 max-w-2xl text-muted-foreground">
                On-hand quantities per product. Use ± for quick changes or type a quantity and press{" "}
                <strong className="text-foreground">Save</strong>. Everything persists in this browser.
              </p>
            </div>
          </div>
        </div>

        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">SKU count</p>
              <p className="text-2xl font-black text-foreground">{stats.skuCount}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-border/60">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">Total units on hand</p>
              <p className="text-2xl font-black text-foreground">{stats.totalUnits.toLocaleString()}</p>
            </CardContent>
          </Card>
          <Card className="rounded-2xl border-destructive/25 bg-destructive/5">
            <CardContent className="p-5">
              <p className="text-xs font-medium text-muted-foreground">Low stock (&lt; 50)</p>
              <p className="text-2xl font-black text-destructive">{stats.lowStock}</p>
            </CardContent>
          </Card>
        </div>

        <Card className="rounded-3xl border-border/60">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-lg">
              <Package className="h-5 w-5" />
              Products — adjust on hand
            </CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <Table>
              <TableHeader>
                <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                  <TableHead>Product</TableHead>
                  <TableHead>Category</TableHead>
                  <TableHead>Unit</TableHead>
                  <TableHead className="text-right">On hand</TableHead>
                  <TableHead className="min-w-[200px]">Quick ±</TableHead>
                  <TableHead className="min-w-[200px]">Set qty / Save</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {products.map((p) => (
                  <TableRow key={p.id}>
                    <TableCell>
                      <div>
                        <p className="font-semibold text-foreground">{p.name}</p>
                        <p className="text-xs text-muted-foreground">{p.nameUrdu}</p>
                      </div>
                    </TableCell>
                    <TableCell>{p.category}</TableCell>
                    <TableCell className="text-muted-foreground">{p.unit}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex items-center justify-end gap-2">
                        <span className="font-semibold tabular-nums">{p.stock}</span>
                        {p.stock < 50 && (
                          <Badge variant="destructive" className="rounded-full text-xs">
                            Low
                          </Badge>
                        )}
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-wrap items-center gap-1">
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-lg"
                          disabled={p.stock < 10}
                          onClick={() => {
                            const ok = adjustProductStock(p.id, -10)
                            if (ok) toast.success("Stock updated (−10)")
                            else toast.error("Not enough stock")
                          }}
                          aria-label={`Remove 10 from ${p.name}`}
                        >
                          <span className="text-xs font-bold">−10</span>
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-lg"
                          disabled={p.stock < 1}
                          onClick={() => {
                            const ok = adjustProductStock(p.id, -1)
                            if (ok) toast.success("Stock updated (−1)")
                            else toast.error("Not enough stock")
                          }}
                          aria-label={`Remove one ${p.name}`}
                        >
                          <Minus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-lg"
                          onClick={() => {
                            adjustProductStock(p.id, 1)
                            toast.success("Stock updated (+1)")
                          }}
                          aria-label={`Add one ${p.name}`}
                        >
                          <Plus className="h-4 w-4" />
                        </Button>
                        <Button
                          type="button"
                          variant="outline"
                          size="icon"
                          className="h-8 w-8 shrink-0 rounded-lg"
                          onClick={() => {
                            adjustProductStock(p.id, 10)
                            toast.success("Stock updated (+10)")
                          }}
                          aria-label={`Add 10 to ${p.name}`}
                        >
                          <span className="text-xs font-bold">+10</span>
                        </Button>
                      </div>
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
                        <Input
                          id={`stock-qty-${p.id}`}
                          type="number"
                          min={0}
                          step={1}
                          className="h-10 rounded-xl sm:max-w-[120px]"
                          defaultValue={p.stock}
                          key={`${p.id}-${p.stock}`}
                          onKeyDown={(e) => {
                            if (e.key !== "Enter") return
                            e.preventDefault()
                            const el = e.currentTarget
                            const n = Math.floor(Number(el.value))
                            if (!Number.isFinite(n) || n < 0) {
                              toast.error("Enter a valid quantity (0 or more)")
                              el.value = String(p.stock)
                              return
                            }
                            updateProductStock(p.id, n)
                            toast.success("Stock saved", { description: p.name })
                          }}
                        />
                        <Button
                          type="button"
                          variant="secondary"
                          size="sm"
                          className="h-10 shrink-0 rounded-xl px-4"
                          onClick={() => {
                            const el = document.getElementById(`stock-qty-${p.id}`) as HTMLInputElement | null
                            if (!el) return
                            const n = Math.floor(Number(el.value))
                            if (!Number.isFinite(n) || n < 0) {
                              toast.error("Enter a valid quantity (0 or more)")
                              return
                            }
                            updateProductStock(p.id, n)
                            toast.success("Stock saved", { description: p.name })
                          }}
                        >
                          Save
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </CardContent>
        </Card>
      </main>
    </div>
  )
}

export default function InventoryPage() {
  return <InventoryInner />
}
