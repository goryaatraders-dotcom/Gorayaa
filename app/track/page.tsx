"use client"

import { useState, useEffect } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Search, Calendar, Package, CreditCard, 
  CheckCircle2, Truck, Check, AlertCircle, Eye, 
  User, MapPin, Receipt, LogOut, KeyRound, Building 
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Header } from "@/components/header"
import { useAuth } from "@/context/auth-context"

export default function TrackPage() {
  const { currentCustomer, isCustomerAuthenticated, loginCustomer, logoutCustomer } = useAuth()
  const [query, setQuery] = useState("")
  const [orders, setOrders] = useState<any[]>([])
  const [loading, setLoading] = useState(false)
  const [searched, setSearched] = useState(false)
  const [error, setError] = useState<string | null>(null)
  const [selectedScreenshot, setSelectedScreenshot] = useState<string | null>(null)

  // Login inputs
  const [loginPhone, setLoginPhone] = useState("")
  const [loginPass, setLoginPass] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loginLoading, setLoginLoading] = useState(false)

  // Customer ledger
  const [ledgerEntries, setLedgerEntries] = useState<any[]>([])
  const [ledgerLoading, setLedgerLoading] = useState(false)

  // Load customer data automatically on login
  useEffect(() => {
    async function loadCustomerData() {
      if (!currentCustomer) {
        setOrders([])
        setLedgerEntries([])
        setSearched(false)
        return
      }
      setLoading(true)
      setError(null)
      try {
        // 1. Fetch orders by customer phone number
        const ordersRes = await fetch(`/api/orders/track?query=${encodeURIComponent(currentCustomer.phone)}`)
        if (ordersRes.ok) {
          const ordersData = await ordersRes.json()
          setOrders(ordersData)
        }
        
        // 2. Fetch ledger statement entries
        setLedgerLoading(true)
        const ledgerRes = await fetch(`/api/ledger?bookId=sales`)
        if (ledgerRes.ok) {
          const ledgerData = await ledgerRes.json()
          const filtered = ledgerData.filter((e: any) => e.customerId === currentCustomer.id)
          setLedgerEntries(filtered)
        }
      } catch (err) {
        console.error("Failed to load customer statements:", err)
      } finally {
        setLoading(false)
        setLedgerLoading(false)
        setSearched(true)
      }
    }
    loadCustomerData()
  }, [currentCustomer])

  const handleSearch = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!query.trim()) return

    setLoading(true)
    setError(null)
    setSearched(true)
    try {
      const res = await fetch(`/api/orders/track?query=${encodeURIComponent(query.trim())}`)
      if (res.ok) {
        const data = await res.json()
        setOrders(data)
      } else {
        const data = await res.json()
        setError(data.error || "Failed to load tracking details.")
      }
    } catch (err) {
      setError("Failed to fetch tracking details. Please check your network connection.")
    } finally {
      setLoading(false)
    }
  }

  const handleCustomerLogin = async (e: React.FormEvent) => {
    e.preventDefault()
    if (!loginPhone.trim()) {
      setLoginError("Please enter your phone number")
      return
    }
    setLoginLoading(true)
    setLoginError(null)
    try {
      const res = await loginCustomer(loginPhone.trim(), loginPass)
      if (!res.ok) {
        setLoginError(res.message)
      } else {
        setLoginPhone("")
        setLoginPass("")
      }
    } catch (err) {
      setLoginError("Failed to sign in")
    } finally {
      setLoginLoading(false)
    }
  }

  const getStatusStep = (status: string) => {
    switch (status) {
      case "pending": return 0
      case "approved": return 1
      case "shipped": return 2
      case "delivered": return 3
      default: return -1
    }
  }

  const statusColors: Record<string, string> = {
    pending: "bg-amber-500/10 text-amber-600 border-amber-500/20",
    approved: "bg-blue-500/10 text-blue-600 border-blue-500/20",
    shipped: "bg-purple-500/10 text-purple-600 border-purple-500/20",
    delivered: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20",
    cancelled: "bg-red-500/10 text-red-600 border-red-500/20",
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={0} />

      <main className="mx-auto max-w-5xl px-4 py-8 sm:px-6 lg:px-8">
        <Link href="/" className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Back to Shop
        </Link>

        <div className="mb-10 text-center">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1 text-sm font-semibold">
            Customer Portal
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground sm:text-5xl">Order & Account Portal</h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Sign in to check your ledger balance & statements, or search single tracking codes.
          </p>
        </div>

        {/* Dual Mode View */}
        {!isCustomerAuthenticated ? (
          <div className="grid md:grid-cols-2 gap-8 mb-10">
            {/* Customer Login Panel */}
            <Card className="rounded-3xl border border-border/50 bg-card p-6 shadow-md flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <User className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Sign In as Customer</h2>
                    <p className="text-xs text-muted-foreground">Access your statement & orders history</p>
                  </div>
                </div>

                <form onSubmit={handleCustomerLogin} className="space-y-4 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Mobile Number</label>
                    <Input 
                      placeholder="e.g. 0300-1234567"
                      className="h-12 rounded-xl"
                      value={loginPhone}
                      onChange={(e) => setLoginPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Password</label>
                    <Input 
                      type="password"
                      placeholder="Enter password (default: 1234)"
                      className="h-12 rounded-xl"
                      value={loginPass}
                      onChange={(e) => setLoginPass(e.target.value)}
                    />
                  </div>
                  {loginError && (
                    <p className="text-sm font-medium text-destructive">{loginError}</p>
                  )}
                  <Button type="submit" className="w-full h-12 rounded-xl font-bold" disabled={loginLoading}>
                    {loginLoading ? "Signing In..." : "Sign In"}
                  </Button>
                </form>
              </div>

              {/* Customer credentials helper */}
              <div className="mt-6 border-t pt-4 space-y-2 text-xs">
                <p className="font-bold text-muted-foreground flex items-center gap-1">
                  <KeyRound className="h-3.5 w-3.5" /> Customer Credentials Demo:
                </p>
                <div className="grid grid-cols-1 gap-1.5 font-mono text-[11px] bg-secondary/50 p-2.5 rounded-xl">
                  <p>• Muhammad Ali: <strong className="text-foreground">0300-1234567</strong> (Pass: 1234)</p>
                  <p>• Ahmad Khan: <strong className="text-foreground">0321-7654321</strong> (Pass: 1234)</p>
                  <p>• Rashid Mehmood: <strong className="text-foreground">0333-9876543</strong> (Pass: 1234)</p>
                </div>
              </div>
            </Card>

            {/* Quick Order Lookup (No login required) */}
            <Card className="rounded-3xl border border-border/50 bg-secondary/20 p-6 shadow-sm flex flex-col justify-between">
              <div>
                <div className="flex items-center gap-3 mb-4">
                  <div className="h-10 w-10 rounded-xl bg-primary/10 flex items-center justify-center text-primary">
                    <Search className="h-5 w-5" />
                  </div>
                  <div>
                    <h2 className="text-xl font-bold">Quick Tracking Search</h2>
                    <p className="text-xs text-muted-foreground">Quick lookup without signing in</p>
                  </div>
                </div>

                <form onSubmit={handleSearch} className="space-y-4 py-2">
                  <div className="space-y-1">
                    <label className="text-xs font-semibold text-muted-foreground">Order ID or Tracking Code</label>
                    <Input 
                      placeholder="e.g. GT-123456"
                      className="h-12 rounded-xl bg-background"
                      value={query}
                      onChange={(e) => setQuery(e.target.value)}
                    />
                  </div>
                  <Button type="submit" variant="secondary" className="w-full h-12 rounded-xl font-bold border" disabled={loading}>
                    {loading ? "Searching..." : "Track Single Order"}
                  </Button>
                </form>
              </div>

              <div className="mt-6 border-t pt-4 text-xs text-muted-foreground">
                Enter your order number or tracking code printed on your receipt to inspect shipping status immediately.
              </div>
            </Card>
          </div>
        ) : (
          /* Customer Session Profile & Info */
          <div className="space-y-8 mb-10">
            <Card className="rounded-3xl border border-primary/20 bg-primary/5 overflow-hidden animate-fade-in-up">
              <CardContent className="p-6 flex flex-col md:flex-row justify-between gap-6">
                <div className="flex items-start gap-4">
                  <div className="h-14 w-14 rounded-2xl bg-foreground text-background flex items-center justify-center">
                    <User className="h-7 w-7" />
                  </div>
                  <div className="space-y-1">
                    <div className="flex items-center gap-2">
                      <h2 className="text-2xl font-black text-foreground">{currentCustomer?.name}</h2>
                      <Badge className="bg-primary/20 text-primary border-0 rounded-full text-xs font-medium">Customer</Badge>
                    </div>
                    <p className="text-sm text-muted-foreground flex items-center gap-1.5">
                      <MapPin className="h-4 w-4 shrink-0 text-muted-foreground" />
                      {currentCustomer?.address}
                    </p>
                    <p className="text-sm font-semibold text-foreground">Phone: {currentCustomer?.phone}</p>
                  </div>
                </div>

                <div className="flex flex-col sm:flex-row md:flex-col lg:flex-row gap-4 items-stretch justify-center">
                  {/* Ledger Balance Card */}
                  <div className="bg-card border p-4 px-6 rounded-2xl shadow-sm text-center flex flex-col justify-center min-w-[180px]">
                    <p className="text-xs font-bold text-muted-foreground uppercase tracking-widest">Account Balance</p>
                    <p className={`text-2xl font-black mt-1 ${
                      (currentCustomer?.balance ?? 0) > 0 
                        ? "text-red-600" 
                        : (currentCustomer?.balance ?? 0) < 0 
                          ? "text-emerald-600" 
                          : "text-muted-foreground"
                    }`}>
                      Rs. {Math.abs(currentCustomer?.balance ?? 0).toLocaleString()}
                    </p>
                    <p className="text-[10px] text-muted-foreground mt-0.5 font-medium">
                      {(currentCustomer?.balance ?? 0) > 0 ? "Debit (Pending Balance)" : (currentCustomer?.balance ?? 0) < 0 ? "Credit (Advance)" : "Cleared"}
                    </p>
                  </div>

                  <Button variant="outline" className="h-auto rounded-2xl gap-2 font-bold px-5 border-border/80 self-center" onClick={() => logoutCustomer()}>
                    <LogOut className="h-4 w-4" />
                    Sign Out
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Customer Statement / Ledger History */}
            <Card className="rounded-3xl border border-border/50 overflow-hidden shadow-sm">
              <CardHeader className="bg-secondary/20 border-b p-5 flex flex-row items-center gap-3">
                <Receipt className="h-5 w-5 text-primary" />
                <CardTitle className="text-xl font-bold">Ledger Statement</CardTitle>
              </CardHeader>
              <CardContent className="p-0">
                {ledgerLoading ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">Loading statement...</div>
                ) : ledgerEntries.length === 0 ? (
                  <div className="text-center py-8 text-sm text-muted-foreground">No recent transaction statement entries.</div>
                ) : (
                  <Table>
                    <TableHeader>
                      <TableRow className="bg-secondary/35">
                        <TableHead className="font-bold py-3 pl-6">Date</TableHead>
                        <TableHead className="font-bold">Description</TableHead>
                        <TableHead className="font-bold text-right">Debit (Purchased)</TableHead>
                        <TableHead className="font-bold text-right">Credit (Paid)</TableHead>
                        <TableHead className="font-bold text-right pr-6">Running Balance</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {ledgerEntries.map((entry) => (
                        <TableRow key={entry.id}>
                          <TableCell className="py-3 pl-6 text-sm text-muted-foreground">{entry.date}</TableCell>
                          <TableCell className="font-medium">{entry.description}</TableCell>
                          <TableCell className="text-right text-sm font-semibold text-red-600">
                            {entry.debit > 0 ? `Rs. ${entry.debit.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell className="text-right text-sm font-semibold text-emerald-600">
                            {entry.credit > 0 ? `Rs. ${entry.credit.toLocaleString()}` : "-"}
                          </TableCell>
                          <TableCell className="text-right text-sm font-bold pr-6">
                            Rs. {entry.balance.toLocaleString()}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                )}
              </CardContent>
            </Card>
          </div>
        )}

        {/* Results Container */}
        {loading && (
          <div className="text-center py-10">
            <p className="text-lg text-muted-foreground">Searching database records...</p>
          </div>
        )}

        {searched && !loading && orders.length === 0 && (
          <Card className="rounded-3xl border-0 bg-secondary/30 py-16 text-center animate-fade-in-up">
            <CardContent>
              <AlertCircle className="mx-auto mb-6 h-16 w-16 text-muted-foreground/40" />
              <h2 className="mb-2 text-2xl font-bold text-foreground">No orders found</h2>
              <p className="text-muted-foreground max-w-md mx-auto">
                No orders are currently linked with this query. Place a new order inside the Cart page.
              </p>
            </CardContent>
          </Card>
        )}

        {error && (
          <div className="mb-6 rounded-2xl bg-destructive/15 p-4 text-center text-sm text-destructive">
            {error}
          </div>
        )}

        {orders.length > 0 && !loading && (
          <div className="space-y-8 animate-fade-in-up">
            <h2 className="text-2xl font-black text-foreground px-1">Order History & Tracking</h2>
            {orders.map((order) => {
              const currentStep = getStatusStep(order.status)
              
              return (
                <Card key={order.id} className="rounded-3xl border border-border/60 shadow-lg overflow-hidden bg-card/65 backdrop-blur-sm">
                  <CardHeader className="border-b bg-secondary/20 p-6 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                    <div>
                      <div className="flex items-center gap-3">
                        <Badge variant="outline" className={`rounded-full px-3 py-1 font-semibold border uppercase ${statusColors[order.status]}`}>
                          {order.status}
                        </Badge>
                        <span className="text-sm font-semibold tracking-wider text-muted-foreground">{order.trackingCode}</span>
                      </div>
                      <p className="text-xs text-muted-foreground mt-1.5 flex items-center gap-1.5">
                        <Calendar className="h-3.5 w-3.5" />
                        Placed on {new Date(order.createdAt).toLocaleString()}
                      </p>
                    </div>
                    <div className="text-right sm:text-right">
                      <p className="text-xs text-muted-foreground uppercase tracking-widest font-semibold">Total Amount</p>
                      <p className="text-2xl font-black text-foreground">Rs. {order.total.toLocaleString()}</p>
                    </div>
                  </CardHeader>

                  <CardContent className="p-6 space-y-8">
                    {/* Visual Tracking Progress */}
                    {order.status !== "cancelled" ? (
                      <div className="py-4">
                        <div className="relative flex items-center justify-between">
                          {/* Background Line */}
                          <div className="absolute left-0 right-0 top-1/2 -translate-y-1/2 h-1 bg-secondary rounded-full z-0" />
                          {/* Active Progress Line */}
                          <div 
                            className="absolute left-0 top-1/2 -translate-y-1/2 h-1 bg-primary rounded-full transition-all duration-500 z-0" 
                            style={{ width: `${(currentStep / 3) * 100}%` }}
                          />

                          {/* Steps */}
                          {[
                            { label: "Pending", desc: "Order Received", icon: ClockIcon },
                            { label: "Approved", desc: "Payment Verified", icon: CheckCircle2 },
                            { label: "Shipped", desc: "Out for Delivery", icon: Truck },
                            { label: "Delivered", desc: "Received by Customer", icon: Check },
                          ].map((step, idx) => {
                            const StepIcon = step.icon
                            const isCompleted = idx <= currentStep
                            const isActive = idx === currentStep

                            return (
                              <div key={idx} className="relative z-10 flex flex-col items-center">
                                <div className={`h-10 w-10 rounded-full flex items-center justify-center border-2 transition-all duration-300 ${
                                  isCompleted 
                                    ? "bg-primary border-primary text-primary-foreground shadow-lg shadow-primary/20" 
                                    : "bg-background border-border text-muted-foreground"
                                }`}>
                                  <StepIcon className="h-5 w-5" />
                                </div>
                                <div className="text-center mt-3">
                                  <p className={`text-sm font-bold ${isActive ? "text-foreground" : "text-muted-foreground"}`}>{step.label}</p>
                                  <p className="text-[10px] text-muted-foreground/85 hidden sm:block mt-0.5">{step.desc}</p>
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </div>
                    ) : (
                      <div className="rounded-2xl border border-red-500/20 bg-red-500/5 p-4 flex items-center gap-3">
                        <AlertCircle className="h-6 w-6 text-red-600 shrink-0" />
                        <div>
                          <p className="font-bold text-red-700">Order Cancelled</p>
                          <p className="text-sm text-muted-foreground">This order has been cancelled and will not be processed.</p>
                        </div>
                      </div>
                    )}

                    {/* Customer & Payment Details */}
                    <div className="grid md:grid-cols-2 gap-6">
                      <div className="rounded-2xl bg-secondary/30 p-5 space-y-3">
                        <h3 className="font-bold text-foreground border-b pb-2 flex items-center gap-2">
                          <Package className="h-4 w-4 text-primary" /> Delivery Details
                        </h3>
                        <div className="space-y-1.5 text-sm">
                          <p><span className="text-muted-foreground">Customer:</span> <strong className="text-foreground">{order.customerName}</strong></p>
                          {order.customerPhone && <p><span className="text-muted-foreground">Phone:</span> <span className="text-foreground">{order.customerPhone}</span></p>}
                          {order.customerAddress && <p><span className="text-muted-foreground">Address:</span> <span className="text-foreground">{order.customerAddress}</span></p>}
                        </div>
                      </div>

                      <div className="rounded-2xl bg-secondary/30 p-5 space-y-3">
                        <h3 className="font-bold text-foreground border-b pb-2 flex items-center gap-2">
                          <CreditCard className="h-4 w-4 text-primary" /> Payment details
                        </h3>
                        <div className="space-y-1.5 text-sm">
                          <p><span className="text-muted-foreground">Method:</span> <strong className="text-foreground uppercase">{order.paymentMethod}</strong></p>
                          {order.transactionId && (
                            <p><span className="text-muted-foreground">Transaction ID:</span> <span className="font-mono text-foreground">{order.transactionId}</span></p>
                          )}
                          {order.paymentScreenshot && (
                            <div className="pt-2 flex items-center gap-3">
                              <span className="text-muted-foreground">Proof Receipt:</span>
                              <Button 
                                variant="outline" 
                                size="sm" 
                                className="h-8 gap-1.5 rounded-lg text-xs"
                                onClick={() => setSelectedScreenshot(order.paymentScreenshot)}
                              >
                                <Eye className="h-3.5 w-3.5" />
                                View Receipt
                              </Button>
                            </div>
                          )}
                        </div>
                      </div>
                    </div>

                    {/* Items Table */}
                    <div className="space-y-3">
                      <h3 className="font-bold text-foreground">Items List</h3>
                      <div className="border rounded-2xl overflow-hidden bg-background">
                        <Table>
                          <TableHeader>
                            <TableRow className="bg-secondary/40">
                              <TableHead className="font-bold pl-4">Product</TableHead>
                              <TableHead className="font-bold text-center">Quantity</TableHead>
                              <TableHead className="font-bold text-right">Unit Price</TableHead>
                              <TableHead className="font-bold text-right pr-4">Subtotal</TableHead>
                            </TableRow>
                          </TableHeader>
                          <TableBody>
                            {order.items.map((item: any) => (
                              <TableRow key={item.productId}>
                                <TableCell className="font-semibold pl-4 py-3">{item.name}</TableCell>
                                <TableCell className="text-center py-3">{item.quantity} bags</TableCell>
                                <TableCell className="text-right py-3">Rs. {item.unitPrice.toLocaleString()}</TableCell>
                                <TableCell className="text-right pr-4 py-3 font-bold">Rs. {item.lineTotal.toLocaleString()}</TableCell>
                              </TableRow>
                            ))}
                          </TableBody>
                        </Table>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}

        {/* Screenshot Modal Popup */}
        {selectedScreenshot && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedScreenshot(null)}
          >
            <div 
              className="bg-card rounded-3xl p-4 max-w-2xl w-full border relative overflow-hidden shadow-2xl animate-scale-in"
              onClick={(e) => e.stopPropagation()}
            >
              <button 
                className="absolute top-4 right-4 h-10 w-10 rounded-full border bg-background hover:bg-secondary flex items-center justify-center font-bold"
                onClick={() => setSelectedScreenshot(null)}
              >
                ✕
              </button>
              <h3 className="text-lg font-bold mb-4 pr-12">Payment Screenshot Proof</h3>
              <div className="max-h-[70vh] overflow-y-auto flex justify-center bg-secondary/50 rounded-2xl p-2">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img 
                  src={selectedScreenshot} 
                  alt="Payment Screenshot Receipt" 
                  className="max-w-full h-auto object-contain rounded-xl"
                />
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

function ClockIcon(props: React.SVGProps<SVGSVGElement>) {
  return (
    <svg
      {...props}
      xmlns="http://www.w3.org/2000/svg"
      width="24"
      height="24"
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="2"
      strokeLinecap="round"
      strokeLinejoin="round"
    >
      <circle cx="12" cy="12" r="10" />
      <polyline points="12 6 12 12 16 14" />
    </svg>
  )
}
