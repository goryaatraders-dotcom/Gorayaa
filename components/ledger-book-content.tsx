"use client"

import { useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Search,
  Plus,
  ArrowUpRight,
  ArrowDownLeft,
  RotateCcw,
  TrendingUp,
  TrendingDown,
  Users,
  Calendar,
  ArrowRight,
  Banknote,
  Repeat,
  Clock,
} from "lucide-react"
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
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import {
  customers,
  saleTypes,
  ledgerEntriesByBook,
  ledgerBooks,
  type LedgerEntry,
  type SaleType,
  type LedgerBookId,
} from "@/lib/data"

interface LedgerBookContentProps {
  bookId: LedgerBookId
}

export function LedgerBookContent({ bookId }: LedgerBookContentProps) {
  const bookMeta = ledgerBooks.find((b) => b.id === bookId)!
  const [searchQuery, setSearchQuery] = useState("")
  const [entries, setEntries] = useState<LedgerEntry[]>(ledgerEntriesByBook[bookId] || [])
  const [isAddOpen, setIsAddOpen] = useState(false)
  const [newCustomerId, setNewCustomerId] = useState("")
  const [newType, setNewType] = useState<"sale" | "payment" | "return">("sale")
  const [newSaleType, setNewSaleType] = useState<SaleType>("cash")
  const [newAmount, setNewAmount] = useState("")
  const [newDescription, setNewDescription] = useState("")

  const filteredEntries = entries.filter((entry) => {
    const matchesSearch =
      entry.customerName.toLowerCase().includes(searchQuery.toLowerCase()) ||
      entry.description.toLowerCase().includes(searchQuery.toLowerCase())
    const matchesType = filterType === "all" || entry.type === filterType
    const matchesSaleType = filterSaleType === "all" || entry.saleType === filterSaleType
    return matchesSearch && matchesType && (entry.type !== "sale" || matchesSaleType)
  })

  const handleAddEntry = () => {
    if (!newCustomerId || !newAmount || !newDescription) {
      alert("Please fill all required fields")
      return
    }
    const customer = customers.find(c => c.id === newCustomerId)
    if (!customer) return

    const debit = newType === "sale" ? Number(newAmount) : 0
    const credit = (newType === "payment" || newType === "return") ? Number(newAmount) : 0

    // Calculate running balance (simplified for local demo)
    const currentBalance = entries.length > 0 ? entries[0].balance : 0
    const balance = currentBalance + debit - credit

    const newEntry: LedgerEntry = {
      id: `entry-${Date.now()}`,
      customerId: newCustomerId,
      customerName: customer.name,
      date: new Date().toLocaleDateString('en-US', { day: '2-digit', month: 'short', year: 'numeric' }),
      type: newType,
      saleType: newType === "sale" ? newSaleType : undefined,
      description: newDescription,
      debit,
      credit,
      balance
    }

    setEntries([newEntry, ...entries])
    setIsAddOpen(false)
    setNewAmount("")
    setNewDescription("")
    setNewCustomerId("")
  }

  const totalDebit = entries.reduce((sum, entry) => sum + entry.debit, 0)
  const totalCredit = entries.reduce((sum, entry) => sum + entry.credit, 0)
  const netBalance = totalDebit - totalCredit

  const cashSales = entries.filter((e) => e.saleType === "cash").reduce((sum, e) => sum + e.debit, 0)
  const routineSales = entries.filter((e) => e.saleType === "routine").reduce((sum, e) => sum + e.debit, 0)
  const seasonalSales = entries.filter((e) => e.saleType === "seasonal").reduce((sum, e) => sum + e.debit, 0)

  const showSaleTypeBreakdown = bookId === "sales"

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "sale":
        return <ArrowUpRight className="h-4 w-4 text-destructive" />
      case "payment":
        return <ArrowDownLeft className="h-4 w-4 text-accent" />
      case "return":
        return <RotateCcw className="h-4 w-4 text-muted-foreground" />
      default:
        return null
    }
  }

  const getTypeBadge = (type: string) => {
    if (bookId === "purchases") {
      if (type === "sale")
        return (
          <Badge variant="outline" className="rounded-full border-primary/40 text-primary">
            Purchase
          </Badge>
        )
      if (type === "payment")
        return (
          <Badge className="bg-accent text-accent-foreground rounded-full">Supplier pay</Badge>
        )
    }
    if (bookId === "expenses") {
      if (type === "sale")
        return (
          <Badge variant="destructive" className="rounded-full">
            Expense
          </Badge>
        )
      if (type === "payment")
        return <Badge className="bg-accent text-accent-foreground rounded-full">Paid</Badge>
    }
    if (bookId === "cash-bank") {
      if (type === "sale")
        return (
          <Badge variant="outline" className="rounded-full border-emerald-600/40 text-emerald-700">
            Receipt
          </Badge>
        )
      if (type === "payment")
        return (
          <Badge variant="outline" className="rounded-full border-blue-600/40 text-blue-700">
            Outflow
          </Badge>
        )
    }
    if (bookId === "load-unload") {
      return (
        <Badge variant="secondary" className="rounded-full">
          Movement
        </Badge>
      )
    }
    switch (type) {
      case "sale":
        return <Badge variant="destructive" className="rounded-full">Sale</Badge>
      case "payment":
        return <Badge className="bg-accent text-accent-foreground rounded-full">Payment</Badge>
      case "return":
        return <Badge variant="secondary" className="rounded-full">Return</Badge>
      default:
        return null
    }
  }

  const getSaleTypeBadge = (saleType?: SaleType) => {
    if (!saleType) return null
    switch (saleType) {
      case "cash":
        return (
          <Badge variant="outline" className="rounded-full gap-1 border-primary/30 text-primary">
            <Banknote className="h-3 w-3" />
            Cash
          </Badge>
        )
      case "routine":
        return (
          <Badge variant="outline" className="rounded-full gap-1 border-accent/30 text-accent">
            <Repeat className="h-3 w-3" />
            Routine
          </Badge>
        )
      case "seasonal":
        return (
          <Badge variant="outline" className="rounded-full gap-1 border-orange-500/30 text-orange-600">
            <Clock className="h-3 w-3" />
            Seasonal
          </Badge>
        )
      default:
        return null
    }
  }

  const customerLink = (entry: LedgerEntry) => {
    if (bookId !== "sales") {
      return <span className="font-medium text-foreground">{entry.customerName}</span>
    }
    return (
      <Link
        href={`/customers/${entry.customerId}`}
        className="text-foreground hover:text-accent font-medium transition-colors"
      >
        {entry.customerName}
      </Link>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/ledger"
          className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group"
        >
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          All ledgers
        </Link>

        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 animate-fade-in-up">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
              {bookMeta.nameUrdu}
            </Badge>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">{bookMeta.name}</h1>
            <p className="text-muted-foreground mt-2 text-lg max-w-2xl">{bookMeta.description}</p>
          </div>
          <Dialog open={isAddOpen} onOpenChange={setIsAddOpen}>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 rounded-full h-12 px-6">
                <Plus className="h-5 w-5" />
                New Entry
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Entry</DialogTitle>
                <DialogDescription>
                  Record a transaction in this ledger ({bookMeta.name}).
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Customer / Party</Label>
                  <select 
                    className="w-full p-3 rounded-xl border border-input bg-background"
                    value={newCustomerId}
                    onChange={(e) => setNewCustomerId(e.target.value)}
                  >
                    <option value="">Select…</option>
                    {customers.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>
                <div className="space-y-2">
                  <Label>Transaction Type</Label>
                  <select 
                    className="w-full p-3 rounded-xl border border-input bg-background"
                    value={newType}
                    onChange={(e) => setNewType(e.target.value as any)}
                  >
                    <option value="sale">Charge / Sale</option>
                    <option value="payment">Payment</option>
                    <option value="return">Return</option>
                  </select>
                </div>
                {showSaleTypeBreakdown && newType === "sale" && (
                  <div className="space-y-2">
                    <Label>Sale Type (for sales only)</Label>
                    <select 
                      className="w-full p-3 rounded-xl border border-input bg-background"
                      value={newSaleType}
                      onChange={(e) => setNewSaleType(e.target.value as any)}
                    >
                      {saleTypes.map((type) => (
                        <option key={type.id} value={type.id}>
                          {type.name} - {type.nameUrdu}
                        </option>
                      ))}
                    </select>
                  </div>
                )}
                <div className="space-y-2">
                  <Label>Amount (Rs.)</Label>
                  <Input 
                    type="number" 
                    placeholder="0" 
                    className="h-12 rounded-xl"
                    value={newAmount}
                    onChange={(e) => setNewAmount(e.target.value)}
                  />
                </div>
                <div className="space-y-2">
                  <Label>Description</Label>
                  <Input 
                    placeholder="Enter description…" 
                    className="h-12 rounded-xl"
                    value={newDescription}
                    onChange={(e) => setNewDescription(e.target.value)}
                  />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-full" onClick={() => setIsAddOpen(false)}>
                  Cancel
                </Button>
                <Button className="rounded-full" onClick={handleAddEntry}>Add Entry</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
          {[
            { label: "Total Debit", value: totalDebit, icon: TrendingUp, color: "destructive", delay: 1 },
            { label: "Total Credit", value: totalCredit, icon: TrendingDown, color: "accent", delay: 2 },
            {
              label: "Net",
              value: Math.abs(netBalance),
              icon: Users,
              color: netBalance >= 0 ? "destructive" : "accent",
              delay: 3,
            },
            { label: "Entries", value: entries.length, icon: Calendar, color: "muted", delay: 4, isCount: true },
          ].map((stat) => (
            <Card
              key={stat.label}
              className={`hover-lift border-0 bg-secondary/30 rounded-3xl animate-fade-in-up stagger-${stat.delay}`}
            >
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p
                      className={`text-2xl font-black mt-1 ${stat.isCount ? "text-foreground" : `text-${stat.color}`}`}
                    >
                      {stat.isCount ? stat.value : `Rs. ${stat.value.toLocaleString()}`}
                    </p>
                  </div>
                  <div
                    className={`h-14 w-14 rounded-2xl bg-${stat.color === "muted" ? "secondary" : stat.color + "/10"} flex items-center justify-center`}
                  >
                    <stat.icon
                      className={`h-6 w-6 ${stat.color === "muted" ? "text-muted-foreground" : `text-${stat.color}`}`}
                    />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {showSaleTypeBreakdown && (
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
            <Card className="border-0 bg-primary/5 rounded-3xl animate-fade-in-up stagger-5">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-primary/10 flex items-center justify-center">
                    <Banknote className="h-6 w-6 text-primary" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Cash Sales</p>
                    <p className="text-xl font-bold text-primary">Rs. {cashSales.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-accent/5 rounded-3xl animate-fade-in-up stagger-6">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-accent/10 flex items-center justify-center">
                    <Repeat className="h-6 w-6 text-accent" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Routine Sales</p>
                    <p className="text-xl font-bold text-accent">Rs. {routineSales.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
            <Card className="border-0 bg-orange-500/5 rounded-3xl animate-fade-in-up stagger-7">
              <CardContent className="p-6">
                <div className="flex items-center gap-4">
                  <div className="h-12 w-12 rounded-xl bg-orange-500/10 flex items-center justify-center">
                    <Clock className="h-6 w-6 text-orange-500" />
                  </div>
                  <div>
                    <p className="text-sm text-muted-foreground">Seasonal Sales</p>
                    <p className="text-xl font-bold text-orange-600">Rs. {seasonalSales.toLocaleString()}</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        <Card className="mb-6 border-0 bg-secondary/30 rounded-3xl">
          <CardContent className="p-6">
            <div className="flex flex-col gap-4">
              <div className="flex flex-col sm:flex-row gap-4">
                <div className="relative flex-1">
                  <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                  <Input
                    type="text"
                    placeholder="Search by party or description…"
                    className="pl-12 h-12 rounded-full border-border bg-background"
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                  />
                </div>
                <div className="flex gap-2 flex-wrap">
                  {["all", "sale", "payment", "return"].map((type) => (
                    <Button
                      key={type}
                      variant={filterType === type ? "default" : "secondary"}
                      className="rounded-full h-12 px-6 capitalize"
                      onClick={() => setFilterType(type as typeof filterType)}
                    >
                      {type === "all" ? "All" : type + "s"}
                    </Button>
                  ))}
                </div>
              </div>

              {showSaleTypeBreakdown && (
                <div className="flex items-center gap-3 pt-2 border-t border-border">
                  <span className="text-sm text-muted-foreground whitespace-nowrap">Sale Type:</span>
                  <div className="flex gap-2 flex-wrap">
                    <Button
                      variant={filterSaleType === "all" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full h-9 px-4"
                      onClick={() => setFilterSaleType("all")}
                    >
                      All Types
                    </Button>
                    <Button
                      variant={filterSaleType === "cash" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full h-9 px-4 gap-1"
                      onClick={() => setFilterSaleType("cash")}
                    >
                      <Banknote className="h-3.5 w-3.5" />
                      Cash
                    </Button>
                    <Button
                      variant={filterSaleType === "routine" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full h-9 px-4 gap-1"
                      onClick={() => setFilterSaleType("routine")}
                    >
                      <Repeat className="h-3.5 w-3.5" />
                      Routine
                    </Button>
                    <Button
                      variant={filterSaleType === "seasonal" ? "default" : "outline"}
                      size="sm"
                      className="rounded-full h-9 px-4 gap-1"
                      onClick={() => setFilterSaleType("seasonal")}
                    >
                      <Clock className="h-3.5 w-3.5" />
                      Seasonal
                    </Button>
                  </div>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <Card className="border-0 bg-card rounded-3xl overflow-hidden shadow-sm">
          <CardHeader className="bg-secondary/30 border-b border-border">
            <CardTitle className="text-xl font-bold">Transaction history</CardTitle>
          </CardHeader>
          <CardContent className="p-0">
            <div className="overflow-x-auto">
              <Table>
                <TableHeader>
                  <TableRow className="bg-secondary/30 hover:bg-secondary/30">
                    <TableHead className="font-bold">Date</TableHead>
                    <TableHead className="font-bold">Party</TableHead>
                    <TableHead className="font-bold">Type</TableHead>
                    <TableHead className="font-bold">Sale Type</TableHead>
                    <TableHead className="font-bold">Description</TableHead>
                    <TableHead className="text-right font-bold">Debit</TableHead>
                    <TableHead className="text-right font-bold">Credit</TableHead>
                    <TableHead className="text-right font-bold">Balance</TableHead>
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {filteredEntries.map((entry, i) => (
                    <TableRow
                      key={entry.id}
                      className={`hover:bg-secondary/20 transition-colors duration-200 animate-fade-in-up stagger-${(i % 8) + 1}`}
                    >
                      <TableCell className="whitespace-nowrap font-medium">{entry.date}</TableCell>
                      <TableCell>{customerLink(entry)}</TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getTypeIcon(entry.type)}
                          {getTypeBadge(entry.type)}
                        </div>
                      </TableCell>
                      <TableCell>
                        {entry.type === "sale" && showSaleTypeBreakdown ? (
                          <div className="flex flex-col gap-1">
                            {getSaleTypeBadge(entry.saleType)}
                            {entry.routinePercent && (
                              <span className="text-xs text-muted-foreground">{entry.routinePercent}% weekly</span>
                            )}
                          </div>
                        ) : (
                          <span className="text-muted-foreground">—</span>
                        )}
                      </TableCell>
                      <TableCell className="max-w-[200px] truncate text-muted-foreground">{entry.description}</TableCell>
                      <TableCell className="text-right font-bold text-destructive">
                        {entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell className="text-right font-bold text-accent">
                        {entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : "—"}
                      </TableCell>
                      <TableCell
                        className={`text-right font-black ${entry.balance >= 0 ? "text-destructive" : "text-accent"}`}
                      >
                        Rs. {entry.balance.toLocaleString()}
                      </TableCell>
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </div>

            {filteredEntries.length === 0 && (
              <div className="text-center py-16">
                <Calendar className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                <p className="text-xl text-muted-foreground">No entries found</p>
                <p className="text-sm text-muted-foreground mt-1">Try adjusting your search or filters</p>
              </div>
            )}
          </CardContent>
        </Card>
      </main>
    </div>
  )
}
