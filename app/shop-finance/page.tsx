"use client"

import { useMemo, useState, type FormEvent } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Banknote,
  BookOpen,
  Lock,
  Package,
  Plus,
  ShoppingCart,
  Truck,
  Wallet,
  Users,
} from "lucide-react"
import { Header } from "@/components/header"
import { useCart } from "@/context/cart-context"
import { useAuth } from "@/context/auth-context"
import { useShopFinance } from "@/context/shop-finance-context"
import { useShopOperations } from "@/context/shop-operations-context"
import { useProducts } from "@/context/products-context"
import { staffMembers } from "@/lib/data"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select"
import { toast } from "sonner"

function staffRunningBalance(entries: { staffId: string; date: string; balance: number }[], staffId: string) {
  const forStaff = entries
    .filter((e) => e.staffId === staffId)
    .sort((a, b) => a.date.localeCompare(b.date) || a.balance - b.balance)
  return forStaff.length ? forStaff[forStaff.length - 1].balance : 0
}

function ShopFinanceInner() {
  const { totalItems } = useCart()
  const { hasPermission, currentUser } = useAuth()
  const allowed = hasPermission("canManageShopFinance")
  const { expenses, staffMoney, addExpense, setStaffBalance, expenseTotal } = useShopFinance()
  const {
    staffLedger,
    supplierLedger,
    suppliers,
    codOrders,
    pendingCodTotal,
    addStaffSalaryEntry,
    addStaffPaymentTaken,
    addSupplierPurchase,
    addSupplierPayment,
    addSupplier,
  } = useShopOperations()
  const { products, adjustProductStock } = useProducts()

  const [expDate, setExpDate] = useState("")
  const [expCategory, setExpCategory] = useState("General")
  const [expDesc, setExpDesc] = useState("")
  const [expAmount, setExpAmount] = useState("")
  const [expenseDialogOpen, setExpenseDialogOpen] = useState(false)
  const [editOpen, setEditOpen] = useState<string | null>(null)
  const [adv, setAdv] = useState("")
  const [held, setHeld] = useState("")

  const [stSalaryStaff, setStSalaryStaff] = useState("")
  const [stSalaryDate, setStSalaryDate] = useState("")
  const [stSalaryAmt, setStSalaryAmt] = useState("")
  const [stSalaryDesc, setStSalaryDesc] = useState("")

  const [stPayStaff, setStPayStaff] = useState("")
  const [stPayDate, setStPayDate] = useState("")
  const [stPayAmt, setStPayAmt] = useState("")
  const [stPayDesc, setStPayDesc] = useState("")

  const [supPurchId, setSupPurchId] = useState("")
  const [supPurchDate, setSupPurchDate] = useState("")
  const [supPurchAmt, setSupPurchAmt] = useState("")
  const [supPurchDesc, setSupPurchDesc] = useState("")

  const [supPayId, setSupPayId] = useState("")
  const [supPayDate, setSupPayDate] = useState("")
  const [supPayAmt, setSupPayAmt] = useState("")
  const [supPayDesc, setSupPayDesc] = useState("")

  const [newSupName, setNewSupName] = useState("")
  const [newSupPhone, setNewSupPhone] = useState("")

  const [inSupId, setInSupId] = useState("")
  const [inProdId, setInProdId] = useState("")
  const [inQty, setInQty] = useState("")
  const [inAmt, setInAmt] = useState("")
  const [inDesc, setInDesc] = useState("")
  const [inDate, setInDate] = useState("")

  const staffLedgerSorted = useMemo(
    () => [...staffLedger].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [staffLedger]
  )

  const supplierLedgerSorted = useMemo(
    () => [...supplierLedger].sort((a, b) => (a.date < b.date ? 1 : a.date > b.date ? -1 : 0)),
    [supplierLedger]
  )

  if (!allowed) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartCount={totalItems} />
        <main className="mx-auto max-w-lg px-4 py-16">
          <Link href="/" className="mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to shop
          </Link>
          <Card className="rounded-3xl border-amber-500/30">
            <CardHeader className="text-center">
              <div className="mx-auto mb-3 flex h-14 w-14 items-center justify-center rounded-2xl bg-amber-500/10">
                <Lock className="h-7 w-7 text-amber-600" />
              </div>
              <CardTitle className="text-2xl">Shop finance restricted</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3 text-center text-muted-foreground">
              <p>
                Only <strong className="text-foreground">Owner</strong> and{" "}
                <strong className="text-foreground">Manager</strong> can record shop finance, ledgers, and stock inward.
              </p>
              {currentUser && (
                <p className="text-sm">
                  Signed in as {currentUser.name} ({currentUser.role}).
                </p>
              )}
              <Button asChild className="rounded-full">
                <Link href="/staff">Staff sign-in</Link>
              </Button>
            </CardContent>
          </Card>
        </main>
      </div>
    )
  }

  const submitExpense = (e: FormEvent) => {
    e.preventDefault()
    const amount = Number(expAmount)
    if (!expDate || !expDesc.trim() || !Number.isFinite(amount) || amount <= 0) return
    addExpense({
      date: expDate,
      category: expCategory,
      description: expDesc.trim(),
      amount,
    })
    setExpDesc("")
    setExpAmount("")
    setExpenseDialogOpen(false)
    toast.success("Expense saved", { description: "Stored on this device." })
  }

  const openEdit = (staffId: string) => {
    const b = staffMoney[staffId]
    setAdv(String(b?.advanceFromShop ?? 0))
    setHeld(String(b?.heldForStaff ?? 0))
    setEditOpen(staffId)
  }

  const saveStaffMoney = () => {
    if (!editOpen) return
    setStaffBalance(editOpen, {
      advanceFromShop: Number(adv) || 0,
      heldForStaff: Number(held) || 0,
    })
    setEditOpen(null)
    toast.success("Staff balances saved")
  }

  const submitStaffSalary = (e: FormEvent) => {
    e.preventDefault()
    const amt = Number(stSalaryAmt)
    if (!stSalaryStaff || !stSalaryDate || !Number.isFinite(amt) || amt <= 0) return
    addStaffSalaryEntry(stSalaryStaff, stSalaryDate, amt, stSalaryDesc)
    setStSalaryAmt("")
    setStSalaryDesc("")
    toast.success("Salary entry saved to staff ledger")
  }

  const submitStaffPay = (e: FormEvent) => {
    e.preventDefault()
    const amt = Number(stPayAmt)
    if (!stPayStaff || !stPayDate || !Number.isFinite(amt) || amt <= 0) return
    addStaffPaymentTaken(stPayStaff, stPayDate, amt, stPayDesc)
    setStPayAmt("")
    setStPayDesc("")
    toast.success("Payment / withdrawal saved to staff ledger")
  }

  const submitSupPurch = (e: FormEvent) => {
    e.preventDefault()
    const amt = Number(supPurchAmt)
    if (!supPurchId || !supPurchDate || !Number.isFinite(amt) || amt <= 0) return
    addSupplierPurchase(supPurchId, supPurchDate, amt, supPurchDesc)
    setSupPurchAmt("")
    setSupPurchDesc("")
    toast.success("Supplier purchase saved")
  }

  const submitSupPay = (e: FormEvent) => {
    e.preventDefault()
    const amt = Number(supPayAmt)
    if (!supPayId || !supPayDate || !Number.isFinite(amt) || amt <= 0) return
    addSupplierPayment(supPayId, supPayDate, amt, supPayDesc)
    setSupPayAmt("")
    setSupPayDesc("")
    toast.success("Supplier payment saved")
  }

  const submitNewSupplier = (e: FormEvent) => {
    e.preventDefault()
    if (!newSupName.trim()) return
    addSupplier(newSupName, newSupPhone)
    setNewSupName("")
    setNewSupPhone("")
    toast.success("Supplier added")
  }

  const submitStockInward = (e: FormEvent) => {
    e.preventDefault()
    const qty = Number(inQty)
    const amt = Number(inAmt)
    if (!inSupId || !inProdId || !inDate || !Number.isFinite(qty) || qty <= 0 || !Number.isFinite(amt) || amt <= 0)
      return
    const ok = adjustProductStock(inProdId, qty)
    if (!ok) {
      toast.error("Could not update stock")
      return
    }
    const p = products.find((x) => x.id === inProdId)
    const label = inDesc.trim() || `Stock inward — ${p?.name ?? inProdId} × ${qty}`
    addSupplierPurchase(inSupId, inDate, amt, label)
    setInQty("")
    setInAmt("")
    setInDesc("")
    toast.success("Stock inward saved", { description: "Inventory and supplier ledger updated." })
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
          <div>
            <Badge variant="secondary" className="mb-3 rounded-full">
              Owner & Manager
            </Badge>
            <h1 className="text-4xl font-black tracking-tight text-foreground">Shop finance</h1>
            <p className="mt-2 max-w-2xl text-muted-foreground">
              Expenses, staff balances & salary ledger, supplier payables, COD orders, and stock inward. Each form has
              Save — data is stored in this browser (localStorage) when you submit.
            </p>
          </div>
          <div className="flex flex-wrap gap-3">
            <Card className="rounded-2xl border-primary/20 bg-primary/5 px-5 py-3">
              <p className="text-xs font-medium text-muted-foreground">Total expenses (listed)</p>
              <p className="text-xl font-black text-foreground">Rs. {expenseTotal.toLocaleString()}</p>
            </Card>
            <Card className="rounded-2xl border-accent/20 bg-accent/5 px-5 py-3">
              <p className="text-xs font-medium text-muted-foreground">Pending COD (orders)</p>
              <p className="text-xl font-black text-foreground">Rs. {pendingCodTotal.toLocaleString()}</p>
            </Card>
          </div>
        </div>

        <Tabs defaultValue="expenses" className="space-y-8">
          <TabsList className="flex h-auto min-h-12 w-full flex-wrap gap-1 rounded-2xl bg-secondary/80 p-2 sm:gap-2">
            <TabsTrigger value="expenses" className="gap-2 rounded-xl px-3 sm:px-4">
              <Banknote className="h-4 w-4 shrink-0" />
              Expenses
            </TabsTrigger>
            <TabsTrigger value="staff" className="gap-2 rounded-xl px-3 sm:px-4">
              <Users className="h-4 w-4 shrink-0" />
              Staff balances
            </TabsTrigger>
            <TabsTrigger value="staff-ledger" className="gap-2 rounded-xl px-3 sm:px-4">
              <BookOpen className="h-4 w-4 shrink-0" />
              Staff ledger
            </TabsTrigger>
            <TabsTrigger value="suppliers" className="gap-2 rounded-xl px-3 sm:px-4">
              <Truck className="h-4 w-4 shrink-0" />
              Suppliers
            </TabsTrigger>
            <TabsTrigger value="cod" className="gap-2 rounded-xl px-3 sm:px-4">
              <ShoppingCart className="h-4 w-4 shrink-0" />
              COD orders
            </TabsTrigger>
          </TabsList>

          <TabsContent value="expenses" className="space-y-6 animate-fade-in-up">
            <Card className="rounded-3xl border-border/60">
              <CardHeader className="flex flex-row flex-wrap items-center justify-between gap-4">
                <CardTitle className="text-lg">Add expense</CardTitle>
                <Dialog open={expenseDialogOpen} onOpenChange={setExpenseDialogOpen}>
                  <DialogTrigger asChild>
                    <Button className="gap-2 rounded-full">
                      <Plus className="h-4 w-4" />
                      New expense
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="rounded-3xl sm:max-w-md">
                    <DialogHeader>
                      <DialogTitle>Shop expense</DialogTitle>
                      <DialogDescription>Rent, utilities, transport — stored in this browser.</DialogDescription>
                    </DialogHeader>
                    <form onSubmit={submitExpense} className="grid gap-4 py-2">
                      <div className="space-y-2">
                        <Label htmlFor="ed">Date</Label>
                        <Input
                          id="ed"
                          type="date"
                          required
                          value={expDate}
                          onChange={(e) => setExpDate(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label>Category</Label>
                        <Input
                          value={expCategory}
                          onChange={(e) => setExpCategory(e.target.value)}
                          placeholder="Rent, Utilities, Transport…"
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ex">Description</Label>
                        <Input
                          id="ex"
                          required
                          value={expDesc}
                          onChange={(e) => setExpDesc(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="ea">Amount (Rs.)</Label>
                        <Input
                          id="ea"
                          type="number"
                          min={1}
                          step={1}
                          required
                          value={expAmount}
                          onChange={(e) => setExpAmount(e.target.value)}
                          className="rounded-xl"
                        />
                      </div>
                      <DialogFooter>
                        <Button type="submit" className="rounded-full">
                          Save expense
                        </Button>
                      </DialogFooter>
                    </form>
                  </DialogContent>
                </Dialog>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead>Date</TableHead>
                      <TableHead>Category</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {expenses.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell>{row.category}</TableCell>
                        <TableCell className="max-w-[280px] text-muted-foreground">{row.description}</TableCell>
                        <TableCell className="text-right font-semibold text-destructive">
                          Rs. {row.amount.toLocaleString()}
                        </TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="staff" className="space-y-6 animate-fade-in-up">
            <Card className="rounded-3xl border-border/60">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Wallet className="h-5 w-5 text-accent" />
                  Advance & held amounts
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  <strong className="text-foreground">Advance from shop</strong> — early draw.{" "}
                  <strong className="text-foreground">Held for staff</strong> — shop owes them. Use{" "}
                  <strong className="text-foreground">Staff ledger</strong> for salary accrual and cash paid.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead>Staff</TableHead>
                      <TableHead className="text-right">Advance taken (Rs.)</TableHead>
                      <TableHead className="text-right">Shop holds for them (Rs.)</TableHead>
                      <TableHead className="text-right">Net (shop view)</TableHead>
                      <TableHead className="w-[100px]" />
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffMembers.map((s) => {
                      const b = staffMoney[s.id]
                      const advance = b?.advanceFromShop ?? 0
                      const heldAmt = b?.heldForStaff ?? 0
                      const net = heldAmt - advance
                      return (
                        <TableRow key={s.id}>
                          <TableCell>
                            <div>
                              <p className="font-semibold text-foreground">{s.name}</p>
                              <p className="text-xs text-muted-foreground">{s.role}</p>
                            </div>
                          </TableCell>
                          <TableCell className="text-right tabular-nums">Rs. {advance.toLocaleString()}</TableCell>
                          <TableCell className="text-right tabular-nums text-accent">Rs. {heldAmt.toLocaleString()}</TableCell>
                          <TableCell
                            className={`text-right font-semibold tabular-nums ${net >= 0 ? "text-emerald-600" : "text-destructive"}`}
                          >
                            {net >= 0 ? "+" : ""}
                            {net.toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <Button variant="outline" size="sm" className="rounded-full" onClick={() => openEdit(s.id)}>
                              Edit
                            </Button>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            <Dialog open={!!editOpen} onOpenChange={(o) => !o && setEditOpen(null)}>
              <DialogContent className="rounded-3xl sm:max-w-md">
                <DialogHeader>
                  <DialogTitle>Update balances</DialogTitle>
                  <DialogDescription>Adjust advance and held amounts for the selected staff member.</DialogDescription>
                </DialogHeader>
                <div className="grid gap-4 py-2">
                  <div className="space-y-2">
                    <Label>Advance from shop (Rs.)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={adv}
                      onChange={(e) => setAdv(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Held for staff (Rs.)</Label>
                    <Input
                      type="number"
                      min={0}
                      value={held}
                      onChange={(e) => setHeld(e.target.value)}
                      className="rounded-xl"
                    />
                  </div>
                </div>
                <DialogFooter>
                  <Button variant="outline" className="rounded-full" onClick={() => setEditOpen(null)}>
                    Cancel
                  </Button>
                  <Button className="rounded-full" onClick={saveStaffMoney}>
                    Save
                  </Button>
                </DialogFooter>
              </DialogContent>
            </Dialog>
          </TabsContent>

          <TabsContent value="staff-ledger" className="space-y-6 animate-fade-in-up">
            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Record salary (owed to staff)</CardTitle>
                  <p className="text-sm text-muted-foreground">Increases running balance — shop owes more to the employee.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitStaffSalary} className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Staff</Label>
                      <Select value={stSalaryStaff || undefined} onValueChange={setStSalaryStaff}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select staff…" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" required className="rounded-xl" value={stSalaryDate} onChange={(e) => setStSalaryDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (Rs.)</Label>
                      <Input type="number" min={1} step={1} required className="rounded-xl" value={stSalaryAmt} onChange={(e) => setStSalaryAmt(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Note (optional)</Label>
                      <Input className="rounded-xl" value={stSalaryDesc} onChange={(e) => setStSalaryDesc(e.target.value)} placeholder="March salary" />
                    </div>
                    <Button type="submit" className="rounded-full">
                      Add salary entry
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Payment / amount taken</CardTitle>
                  <p className="text-sm text-muted-foreground">Cash paid to staff or withdrawn — reduces what the shop still owes.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitStaffPay} className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Staff</Label>
                      <Select value={stPayStaff || undefined} onValueChange={setStPayStaff}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select staff…" />
                        </SelectTrigger>
                        <SelectContent>
                          {staffMembers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name} ({s.role})
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" required className="rounded-xl" value={stPayDate} onChange={(e) => setStPayDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount taken (Rs.)</Label>
                      <Input type="number" min={1} step={1} required className="rounded-xl" value={stPayAmt} onChange={(e) => setStPayAmt(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Note (optional)</Label>
                      <Input className="rounded-xl" value={stPayDesc} onChange={(e) => setStPayDesc(e.target.value)} placeholder="Cash paid" />
                    </div>
                    <Button type="submit" className="rounded-full">
                      Add payment entry
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Current balance (from ledger)</CardTitle>
                <p className="text-sm text-muted-foreground">Positive = shop owes staff. After entries below, totals update.</p>
              </CardHeader>
              <CardContent className="flex flex-wrap gap-3">
                {staffMembers.map((s) => {
                  const bal = staffRunningBalance(staffLedger, s.id)
                  return (
                    <Badge key={s.id} variant="secondary" className="rounded-full px-4 py-2 text-sm">
                      {s.name}: Rs. {bal.toLocaleString()}
                    </Badge>
                  )
                })}
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Staff ledger (newest first)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead>Date</TableHead>
                      <TableHead>Staff</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Balance</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {staffLedgerSorted.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={6} className="py-10 text-center text-muted-foreground">
                          No entries yet — add salary or payment above.
                        </TableCell>
                      </TableRow>
                    ) : (
                      staffLedgerSorted.map((row) => (
                        <TableRow key={row.id}>
                          <TableCell className="font-medium">{row.date}</TableCell>
                          <TableCell>{row.staffName}</TableCell>
                          <TableCell>
                            <Badge variant={row.type === "salary" ? "default" : "secondary"} className="rounded-full capitalize">
                              {row.type === "salary" ? "Salary" : "Paid / taken"}
                            </Badge>
                          </TableCell>
                          <TableCell className="max-w-[220px] text-muted-foreground">{row.description}</TableCell>
                          <TableCell className="text-right tabular-nums">Rs. {row.amount.toLocaleString()}</TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">Rs. {row.balance.toLocaleString()}</TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="suppliers" className="space-y-6 animate-fade-in-up">
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {suppliers.map((s) => {
                const rowsChrono = supplierLedger
                  .filter((e) => e.supplierId === s.id)
                  .sort((a, b) => a.date.localeCompare(b.date))
                const purchases = rowsChrono.filter((r) => r.type === "purchase").reduce((a, r) => a + r.amount, 0)
                const payments = rowsChrono.filter((r) => r.type === "payment").reduce((a, r) => a + r.amount, 0)
                const payable = rowsChrono.length ? rowsChrono[rowsChrono.length - 1].balance : 0
                return (
                  <Card key={s.id} className="rounded-3xl border-border/60">
                    <CardHeader className="pb-2">
                      <CardTitle className="text-base font-bold">{s.name}</CardTitle>
                      <p className="text-xs text-muted-foreground">{s.phone}</p>
                    </CardHeader>
                    <CardContent className="space-y-2 text-sm">
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Total orders / purchases</span>
                        <span className="font-semibold tabular-nums">Rs. {purchases.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between">
                        <span className="text-muted-foreground">Payments made</span>
                        <span className="font-semibold tabular-nums text-emerald-600">Rs. {payments.toLocaleString()}</span>
                      </div>
                      <div className="flex justify-between border-t border-border/60 pt-2">
                        <span className="font-medium">Payable (pending)</span>
                        <span className="font-black tabular-nums text-accent">Rs. {payable.toLocaleString()}</span>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <Card className="rounded-3xl border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Add supplier</CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitNewSupplier} className="flex flex-col gap-4 sm:flex-row sm:items-end">
                  <div className="grid flex-1 gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label>Name</Label>
                      <Input className="rounded-xl" value={newSupName} onChange={(e) => setNewSupName(e.target.value)} required />
                    </div>
                    <div className="space-y-2">
                      <Label>Phone</Label>
                      <Input className="rounded-xl" value={newSupPhone} onChange={(e) => setNewSupPhone(e.target.value)} />
                    </div>
                  </div>
                  <Button type="submit" className="rounded-full sm:shrink-0">
                    Add supplier
                  </Button>
                </form>
              </CardContent>
            </Card>

            <div className="grid gap-6 lg:grid-cols-2">
              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Record purchase / order</CardTitle>
                  <p className="text-sm text-muted-foreground">Increases amount owed to the supplier.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitSupPurch} className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Select value={supPurchId || undefined} onValueChange={setSupPurchId}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" required className="rounded-xl" value={supPurchDate} onChange={(e) => setSupPurchDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (Rs.)</Label>
                      <Input type="number" min={1} step={1} required className="rounded-xl" value={supPurchAmt} onChange={(e) => setSupPurchAmt(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input className="rounded-xl" required value={supPurchDesc} onChange={(e) => setSupPurchDesc(e.target.value)} />
                    </div>
                    <Button type="submit" className="rounded-full">
                      Add purchase
                    </Button>
                  </form>
                </CardContent>
              </Card>

              <Card className="rounded-3xl border-border/60">
                <CardHeader>
                  <CardTitle className="text-lg">Record payment to supplier</CardTitle>
                  <p className="text-sm text-muted-foreground">Reduces payable balance.</p>
                </CardHeader>
                <CardContent>
                  <form onSubmit={submitSupPay} className="grid gap-4">
                    <div className="space-y-2">
                      <Label>Supplier</Label>
                      <Select value={supPayId || undefined} onValueChange={setSupPayId}>
                        <SelectTrigger className="rounded-xl">
                          <SelectValue placeholder="Select…" />
                        </SelectTrigger>
                        <SelectContent>
                          {suppliers.map((s) => (
                            <SelectItem key={s.id} value={s.id}>
                              {s.name}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label>Date</Label>
                      <Input type="date" required className="rounded-xl" value={supPayDate} onChange={(e) => setSupPayDate(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Amount (Rs.)</Label>
                      <Input type="number" min={1} step={1} required className="rounded-xl" value={supPayAmt} onChange={(e) => setSupPayAmt(e.target.value)} />
                    </div>
                    <div className="space-y-2">
                      <Label>Description</Label>
                      <Input className="rounded-xl" required value={supPayDesc} onChange={(e) => setSupPayDesc(e.target.value)} />
                    </div>
                    <Button type="submit" className="rounded-full">
                      Add payment
                    </Button>
                  </form>
                </CardContent>
              </Card>
            </div>

            <Card className="rounded-3xl border-primary/20 bg-primary/5">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-lg">
                  <Package className="h-5 w-5" />
                  Stock inward (supplier + catalog)
                </CardTitle>
                <p className="text-sm text-muted-foreground">
                  Adds units to inventory and posts a supplier purchase for the same amount (link goods to payable).
                </p>
              </CardHeader>
              <CardContent>
                <form onSubmit={submitStockInward} className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  <div className="space-y-2">
                    <Label>Supplier</Label>
                    <Select value={inSupId || undefined} onValueChange={setInSupId}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {suppliers.map((s) => (
                          <SelectItem key={s.id} value={s.id}>
                            {s.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Product</Label>
                    <Select value={inProdId || undefined} onValueChange={setInProdId}>
                      <SelectTrigger className="rounded-xl">
                        <SelectValue placeholder="Select…" />
                      </SelectTrigger>
                      <SelectContent>
                        {products.map((p) => (
                          <SelectItem key={p.id} value={p.id}>
                            {p.name} ({p.unit})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label>Date</Label>
                    <Input type="date" required className="rounded-xl" value={inDate} onChange={(e) => setInDate(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Quantity (units / bags)</Label>
                    <Input type="number" min={1} step={1} required className="rounded-xl" value={inQty} onChange={(e) => setInQty(e.target.value)} />
                  </div>
                  <div className="space-y-2">
                    <Label>Purchase amount (Rs.)</Label>
                    <Input type="number" min={1} step={1} required className="rounded-xl" value={inAmt} onChange={(e) => setInAmt(e.target.value)} />
                  </div>
                  <div className="space-y-2 md:col-span-2 lg:col-span-3">
                    <Label>Note (optional)</Label>
                    <Input className="rounded-xl" value={inDesc} onChange={(e) => setInDesc(e.target.value)} placeholder="Truck #, invoice ref…" />
                  </div>
                  <div className="md:col-span-2 lg:col-span-3">
                    <Button type="submit" className="rounded-full">
                      Post inward + purchase
                    </Button>
                  </div>
                </form>
              </CardContent>
            </Card>

            <Card className="rounded-3xl border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">Supplier ledger (newest first)</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead>Date</TableHead>
                      <TableHead>Supplier</TableHead>
                      <TableHead>Type</TableHead>
                      <TableHead>Description</TableHead>
                      <TableHead className="text-right">Amount</TableHead>
                      <TableHead className="text-right">Payable bal.</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {supplierLedgerSorted.map((row) => (
                      <TableRow key={row.id}>
                        <TableCell className="font-medium">{row.date}</TableCell>
                        <TableCell>{row.supplierName}</TableCell>
                        <TableCell>
                          <Badge variant={row.type === "purchase" ? "default" : "secondary"} className="rounded-full capitalize">
                            {row.type === "purchase" ? "Order / purchase" : "Payment"}
                          </Badge>
                        </TableCell>
                        <TableCell className="max-w-[240px] text-muted-foreground">{row.description}</TableCell>
                        <TableCell className="text-right tabular-nums">Rs. {row.amount.toLocaleString()}</TableCell>
                        <TableCell className="text-right font-semibold tabular-nums">Rs. {row.balance.toLocaleString()}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="cod" className="space-y-6 animate-fade-in-up">
            <Card className="rounded-3xl border-border/60">
              <CardHeader>
                <CardTitle className="text-lg">COD orders (checkout)</CardTitle>
                <p className="text-sm text-muted-foreground">
                  Orders placed from the cart with cash on delivery. Stock is reduced when the order is confirmed.
                </p>
              </CardHeader>
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/40 hover:bg-secondary/40">
                      <TableHead>When</TableHead>
                      <TableHead>Customer</TableHead>
                      <TableHead>Items</TableHead>
                      <TableHead className="text-right">Total</TableHead>
                      <TableHead>Status</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {codOrders.length === 0 ? (
                      <TableRow>
                        <TableCell colSpan={5} className="py-12 text-center text-muted-foreground">
                          No COD orders yet — place one from the cart.
                        </TableCell>
                      </TableRow>
                    ) : (
                      codOrders.map((o) => (
                        <TableRow key={o.id}>
                          <TableCell className="whitespace-nowrap text-sm">
                            {new Date(o.createdAt).toLocaleString()}
                          </TableCell>
                          <TableCell>
                            <div>
                              <p className="font-medium text-foreground">{o.customerName}</p>
                              <p className="text-xs text-muted-foreground">{o.customerPhone}</p>
                            </div>
                          </TableCell>
                          <TableCell className="max-w-[280px] text-sm text-muted-foreground">
                            {o.items.map((i) => `${i.name} ×${i.quantity}`).join(", ")}
                          </TableCell>
                          <TableCell className="text-right font-semibold tabular-nums">Rs. {o.total.toLocaleString()}</TableCell>
                          <TableCell>
                            <Badge className="rounded-full capitalize">{o.status}</Badge>
                          </TableCell>
                        </TableRow>
                      ))
                    )}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  )
}

export default function ShopFinancePage() {
  return <ShopFinanceInner />
}
