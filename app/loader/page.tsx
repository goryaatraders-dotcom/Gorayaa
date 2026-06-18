"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import {
  ArrowLeft, Truck, Lock, LogOut, Clock, CheckCircle2, XCircle, ShoppingCart, Search, Plus
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { GTLogo } from "@/components/gt-logo"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { toast } from "sonner"

export default function LoaderPage() {
  const { totalItems } = useCart()
  const { currentUser, login, logout, isAuthenticated } = useAuth()
  const router = useRouter()

  // Authentication inputs
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Database states
  const [dbOrders, setDbOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [warehouseLogs, setWarehouseLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Dashboard states
  const [activeTab, setActiveTab] = useState<"orders" | "logs">("orders")
  const [orderSearch, setOrderSearch] = useState("")
  const [ordersFilterStatus, setOrdersFilterStatus] = useState("all")
  const [selectedOrderScreenshot, setSelectedOrderScreenshot] = useState<string | null>(null)

  // Log loading/unloading form states
  const [logDescription, setLogDescription] = useState("")
  const [logType, setLogType] = useState<"load" | "unload">("unload")
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10))
  const [isAddingLog, setIsAddingLog] = useState(false)

  const loadDbOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setDbOrders(data)
        }
      }
    } catch (err) {
      console.warn("Failed to load orders.")
    } finally {
      setOrdersLoading(false)
    }
  }, [])

  const loadWarehouseLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const res = await fetch("/api/ledger?bookId=load-unload")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setWarehouseLogs(data.reverse())
        }
      }
    } catch (err) {
      console.warn("Failed to load warehouse logs.")
    } finally {
      setLogsLoading(false)
    }
  }, [])

  useEffect(() => {
    if (isAuthenticated && currentUser && currentUser.role === "loader") {
      loadDbOrders()
      loadWarehouseLogs()
    }
  }, [isAuthenticated, currentUser, loadDbOrders, loadWarehouseLogs])

  const handleLoaderLogin = (e: any) => {
    e.preventDefault()
    setLoginError(null)
    setLoading(true)

    const r = login(email.trim(), password)
    if (!r.ok) {
      setLoginError(r.message)
      toast.error(r.message)
      setLoading(false)
      return
    }

    setLoading(false)
  }

  // Effect to redirect non-loaders away from /loader
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role !== "loader") {
        toast.info("Redirecting you to the Admin & Manager Workspace...")
        router.push("/admin")
      } else {
        toast.success(`Welcome back loader, ${currentUser.name}!`)
      }
    }
  }, [isAuthenticated, currentUser, router])

  const handleAddWarehouseLog = async () => {
    if (!logDescription.trim()) {
      toast.error("Log description is required")
      return
    }
    setIsAddingLog(true)
    try {
      const res = await fetch("/api/ledger", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          bookId: "load-unload",
          type: "sale",
          description: `${logType === "load" ? "Loaded" : "Unloaded"}: ${logDescription.trim()}`,
          date: logDate,
          debit: 0,
          credit: 0,
          balance: 0
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          toast.success("Warehouse log recorded successfully!")
          setLogDescription("")
          await loadWarehouseLogs()
        } else {
          toast.error(data.error || "Failed to log movement")
        }
      }
    } catch (err) {
      toast.error("Network error saving warehouse log")
    } finally {
      setIsAddingLog(false)
    }
  }

  const handleOrderAction = async (orderId: string, action: string) => {
    try {
      const res = await fetch("/api/orders/action", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ orderId, action }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          toast.success(`Order marked as ${action === "ship" ? "shipped" : action === "deliver" ? "delivered" : action} successfully!`)
          await loadDbOrders()
        } else {
          toast.error(data.error || `Failed to ${action} order`)
        }
      }
    } catch (err) {
      toast.error("Network error processing order status update")
    }
  }

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && currentUser?.role === "loader" && <Header cartCount={totalItems} />}

      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">

        {/* Isolated Login Portal view when NOT logged in */}
        {!isAuthenticated || !currentUser || currentUser.role !== "loader" ? (
          <div className="max-w-md mx-auto space-y-6 py-12 animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <Link href="/">
                <GTLogo size="lg" className="mb-4 hover:scale-105 transition-transform" />
              </Link>
              <h1 className="text-3xl font-black text-foreground">Goraya Traders</h1>
              <p className="mt-1 text-sm text-muted-foreground uppercase tracking-widest font-bold text-emerald-600">
                Loader Gateway
              </p>
            </div>

            <Card className="rounded-[2.5rem] border border-border bg-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Loader Sign In</CardTitle>
                <CardDescription className="text-center">Enter Loader Gmail and password</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleLoaderLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="loader-email">Gmail Address</Label>
                    <Input
                      id="loader-email"
                      type="email"
                      placeholder="e.g. tariq@gmail.com"
                      required
                      className="h-12 rounded-xl"
                      value={email}
                      onChange={(e) => {
                        setEmail(e.target.value)
                        setLoginError(null)
                      }}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="loader-pass">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="loader-pass"
                        type="password"
                        placeholder="••••"
                        required
                        className="pl-12 h-12 rounded-xl"
                        value={password}
                        onChange={(e) => {
                          setPassword(e.target.value)
                          setLoginError(null)
                        }}
                      />
                    </div>
                  </div>

                  {loginError && (
                    <p className="text-sm font-semibold text-destructive" role="alert">
                      {loginError}
                    </p>
                  )}

                  <Button type="submit" disabled={loading} className="w-full h-12 rounded-full font-bold">
                    {loading ? "Authenticating..." : "Loader Sign In"}
                  </Button>
                </form>
              </CardContent>
              <div className="border-t border-border/40 p-4 bg-secondary/15 rounded-b-[2.5rem] text-xs text-muted-foreground">
                <details className="cursor-pointer group">
                  <summary className="font-semibold text-center select-none group-open:mb-2 hover:text-foreground transition-colors">
                    Click to show credentials
                  </summary>
                  <div className="space-y-2 border-t pt-2 text-[10px] mt-1 bg-background/50 p-2 rounded-xl">
                    <div>
                      <p className="font-bold text-emerald-600">🚚 Loader</p>
                      <p className="text-foreground">tariq@gmail.com &bull; Pass: 1234</p>
                    </div>
                  </div>
                </details>
              </div>
            </Card>

            <div className="text-center">
              <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
                <ArrowLeft className="h-4 w-4" /> Back to Shop
              </Link>
            </div>
          </div>
        ) : (

          /* Authenticated Loader Workspace Dashboard View */
          <div className="space-y-8 animate-fade-in-up">

            {/* Top profile banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] border border-primary/25 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-[1.2rem] bg-foreground text-background flex items-center justify-center shadow-lg">
                  <Truck className="h-8 w-8 text-emerald-500" />
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">{currentUser.name}</h2>
                    <Badge className="capitalize text-xs font-semibold rounded-full px-2.5 py-0.5">
                      Loader
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {currentUser.department} Department &bull; {currentUser.phone} &bull; {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Button variant="outline" className="rounded-full h-11 gap-2 shrink-0 border-destructive/20 text-destructive hover:bg-destructive/5" onClick={logout}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>

            <div className="space-y-8">
              {/* Heading */}
              <div>
                <h1 className="text-3xl font-black text-foreground tracking-tight">🚚 Loader Workspace</h1>
                <p className="text-muted-foreground mt-1">Fulfill physical orders, update tracking statuses, and log warehouse movements</p>
              </div>

              {/* Stats cards */}
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                <Card className="rounded-2xl border">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Assigned Deliveries</p>
                      <p className="text-2xl font-black text-foreground mt-1">
                        {dbOrders.filter(o => o.status === "approved" || o.status === "shipped").length}
                      </p>
                    </div>
                    <ShoppingCart className="h-8 w-8 text-primary" />
                  </CardContent>
                </Card>
                <Card className="rounded-2xl border">
                  <CardContent className="p-5 flex items-center justify-between">
                    <div>
                      <p className="text-xs font-medium text-muted-foreground uppercase">Logs Submitted</p>
                      <p className="text-2xl font-black text-foreground mt-1">{warehouseLogs.length}</p>
                    </div>
                    <Clock className="h-8 w-8 text-emerald-500" />
                  </CardContent>
                </Card>
              </div>

              {/* Tabs switcher */}
              <div className="flex border-b border-border/60 gap-8">
                <button
                  onClick={() => setActiveTab("orders")}
                  className={`pb-4 text-lg font-black capitalize tracking-tight border-b-2 transition-all ${activeTab === "orders" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Assigned Deliveries
                </button>
                <button
                  onClick={() => setActiveTab("logs")}
                  className={`pb-4 text-lg font-black capitalize tracking-tight border-b-2 transition-all ${activeTab === "logs" ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                    }`}
                >
                  Log Warehouse Entry
                </button>
              </div>

              {/* Tab content */}
              {activeTab === "orders" && (
                <div className="space-y-6">
                  <OrdersManager
                    filteredOrders={dbOrders.filter(o => o.status === "approved" || o.status === "shipped" || o.status === "delivered")}
                    orderSearch={orderSearch}
                    setOrderSearch={setOrderSearch}
                    ordersFilterStatus={ordersFilterStatus}
                    setOrdersFilterStatus={setOrdersFilterStatus}
                    ordersLoading={ordersLoading}
                    handleOrderAction={handleOrderAction}
                    setSelectedOrderScreenshot={setSelectedOrderScreenshot}
                    isLoader={true}
                  />
                </div>
              )}

              {activeTab === "logs" && (
                <div className="space-y-6">
                  <WarehouseLogsManager
                    warehouseLogs={warehouseLogs}
                    logsLoading={logsLoading}
                    logDescription={logDescription}
                    setLogDescription={setLogDescription}
                    logType={logType}
                    setLogType={setLogType}
                    logDate={logDate}
                    setLogDate={setLogDate}
                    isAddingLog={isAddingLog}
                    handleAddWarehouseLog={handleAddWarehouseLog}
                    showForm={true}
                  />
                </div>
              )}
            </div>

            {/* Screenshot Modal Popup */}
            {selectedOrderScreenshot && (
              <div
                className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
                onClick={() => setSelectedOrderScreenshot(null)}
              >
                <div
                  className="bg-card rounded-3xl p-4 max-w-2xl w-full border relative overflow-hidden shadow-2xl"
                  onClick={(e) => e.stopPropagation()}
                >
                  <button
                    className="absolute top-4 right-4 h-10 w-10 rounded-full border bg-background hover:bg-secondary flex items-center justify-center font-bold"
                    onClick={() => setSelectedOrderScreenshot(null)}
                  >
                    ✕
                  </button>
                  <h3 className="text-lg font-bold mb-4 pr-12">Payment Screenshot Proof</h3>
                  <div className="max-h-[70vh] overflow-y-auto flex justify-center bg-secondary/50 rounded-2xl p-2">
                    <img
                      src={selectedOrderScreenshot}
                      alt="Payment Screenshot Receipt"
                      className="max-w-full h-auto object-contain rounded-xl"
                    />
                  </div>
                </div>
              </div>
            )}

          </div>
        )}
      </main>

      {isAuthenticated && currentUser?.role === "loader" && (
        <footer className="bg-foreground text-background py-8 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GTLogo size="sm" />
                <span className="font-bold">Goraya Traders</span>
              </div>
              <p className="text-sm text-background/60">Loader Portal - Restricted Access</p>
            </div>
          </div>
        </footer>
      )}
    </div>
  )
}

/* Orders manager subcomponent */
function OrdersManager({
  filteredOrders,
  orderSearch,
  setOrderSearch,
  ordersFilterStatus,
  setOrdersFilterStatus,
  ordersLoading,
  handleOrderAction,
  setSelectedOrderScreenshot,
  isLoader = false,
}: any) {
  const filtered = filteredOrders.filter((order: any) => {
    const query = orderSearch.toLowerCase()
    const matchesSearch =
      order.customerName.toLowerCase().includes(query) ||
      (order.customerPhone && order.customerPhone.includes(query)) ||
      (order.trackingCode && order.trackingCode.toLowerCase().includes(query)) ||
      order.id.toLowerCase().includes(query)

    const matchesStatus = ordersFilterStatus === "all" || order.status === ordersFilterStatus
    return matchesSearch && matchesStatus
  })

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row gap-4">
        <div className="relative flex-1">
          <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
          <Input
            type="text"
            placeholder="Search orders by customer or tracking code..."
            className="pl-12 h-12 rounded-xl"
            value={orderSearch}
            onChange={(e) => setOrderSearch(e.target.value)}
          />
        </div>
        <div className="flex gap-1.5 flex-wrap">
          {[
            { value: "all", label: "All" },
            { value: "approved", label: "Approved" },
            { value: "shipped", label: "Shipped" },
            { value: "delivered", label: "Delivered" },
          ].map((s) => (
            <Button
              key={s.value}
              variant={ordersFilterStatus === s.value ? "default" : "secondary"}
              onClick={() => setOrdersFilterStatus(s.value)}
              className="rounded-full h-11 px-4 text-xs font-semibold"
            >
              {s.label}
            </Button>
          ))}
        </div>
      </div>

      {ordersLoading ? (
        <p className="text-center py-10 text-muted-foreground">Loading orders...</p>
      ) : filtered.length === 0 ? (
        <Card className="rounded-2xl border border-dashed py-16 text-center">
          <CardContent>
            <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-bold text-foreground">No orders matching status</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filtered.map((order: any) => (
            <Card key={order.id} className="rounded-2xl border bg-card overflow-hidden">
              <div className="bg-secondary/15 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-primary">{order.trackingCode}</span>
                    <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${order.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
                        order.status === "approved" ? "bg-blue-500/10 text-blue-600 border-blue-500/20" :
                          order.status === "shipped" ? "bg-purple-500/10 text-purple-600 border-purple-500/20" :
                            order.status === "delivered" ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" :
                              "bg-red-500/10 text-red-600 border-red-500/20"
                      }`}>
                      {order.status}
                    </Badge>
                    <span className="text-xs text-muted-foreground">
                      {new Date(order.createdAt).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-sm font-bold text-foreground mt-1">
                    {order.customerName} &bull; {order.customerPhone || "No Phone"}
                  </p>
                  <p className="text-xs text-muted-foreground">{order.customerAddress || "No Address"}</p>
                </div>
                <div className="text-left sm:text-right">
                  <p className="text-xs text-muted-foreground uppercase font-bold">Total</p>
                  <p className="text-lg font-black text-foreground">Rs. {order.total.toLocaleString()}</p>
                  <Badge variant="outline" className="text-[9px] uppercase font-bold rounded-full px-2 py-0">
                    {order.paymentMethod}
                  </Badge>
                </div>
              </div>

              <CardContent className="p-4 sm:p-5 space-y-4">
                {order.paymentScreenshot && (
                  <div className="p-3 bg-secondary/20 rounded-xl flex items-center justify-between text-xs gap-3">
                    <span>Transaction Proof Uploaded: Bank / EasyPaisa</span>
                    <Button variant="outline" size="sm" className="h-8 rounded" onClick={() => setSelectedOrderScreenshot(order.paymentScreenshot)}>
                      View screenshot
                    </Button>
                  </div>
                )}

                <ul className="divide-y border rounded-xl overflow-hidden bg-background text-xs">
                  {order.items.map((it: any) => (
                    <li key={it.productId} className="p-2.5 flex justify-between">
                      <span className="font-bold">{it.name}</span>
                      <span className="text-muted-foreground">{it.quantity} bags &times; Rs. {it.unitPrice.toLocaleString()}</span>
                      <span className="font-black">Rs. {it.lineTotal.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

                <div className="flex justify-end gap-2 pt-2 border-t">
                  {order.status === "approved" && (
                    <Button size="sm" className="bg-purple-600 hover:bg-purple-700 rounded-full font-semibold px-4 text-xs h-9" onClick={() => handleOrderAction(order.id, "ship")}>
                      Mark as Shipped
                    </Button>
                  )}
                  {order.status === "shipped" && (
                    <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-full font-semibold px-4 text-xs h-9" onClick={() => handleOrderAction(order.id, "deliver")}>
                      Mark as Delivered
                    </Button>
                  )}
                  {(order.status === "delivered" || order.status === "cancelled") && (
                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                      {order.status === "delivered" ? <CheckCircle2 className="h-4 w-4 text-emerald-600" /> : <XCircle className="h-4 w-4 text-red-600" />}
                      Completed
                    </span>
                  )}
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  )
}

/* Warehouse movement logs subcomponent */
function WarehouseLogsManager({
  warehouseLogs,
  logsLoading,
  logDescription,
  setLogDescription,
  logType,
  setLogType,
  logDate,
  setLogDate,
  isAddingLog,
  handleAddWarehouseLog,
  showForm = true,
}: any) {
  return (
    <div className="grid gap-6 lg:grid-cols-3">
      {showForm && (
        <Card className="rounded-2xl border lg:col-span-1 h-fit">
          <CardHeader>
            <CardTitle className="text-lg">Log Warehouse Movement</CardTitle>
            <CardDescription>Record warehouse stock loading or unloading movements</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="space-y-1">
              <Label>Movement Type</Label>
              <div className="flex bg-secondary rounded-lg p-0.5">
                <button
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${logType === "unload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  onClick={() => setLogType("unload")}
                >
                  Unload (Inward)
                </button>
                <button
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${logType === "load" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                    }`}
                  onClick={() => setLogType("load")}
                >
                  Load (Outward)
                </button>
              </div>
            </div>

            <div className="space-y-1">
              <Label htmlFor="log-desc">Description</Label>
              <textarea
                id="log-desc"
                placeholder="e.g. Unloaded 120 bags DAP (FFC Ltd supplier delivery)"
                className="w-full min-h-[80px] p-2.5 text-sm rounded-xl border bg-background resize-none"
                value={logDescription}
                onChange={(e) => setLogDescription(e.target.value)}
              />
            </div>

            <div className="space-y-1">
              <Label htmlFor="log-dt">Date</Label>
              <Input id="log-dt" type="date" value={logDate} onChange={(e) => setLogDate(e.target.value)} className="h-10 rounded-xl" />
            </div>

            <Button className="w-full h-11 rounded-xl gap-1.5 mt-2" onClick={handleAddWarehouseLog} disabled={isAddingLog}>
              <Plus className="h-4 w-4" /> Save Log Entry
            </Button>
          </CardContent>
        </Card>
      )}

      <div className={`${showForm ? "lg:col-span-2" : "lg:col-span-3"} space-y-4`}>
        <div className="flex items-center justify-between">
          <h3 className="font-bold text-lg text-foreground">Logs History</h3>
          <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 border border-emerald-500/20 font-medium">
            Warehouse Log Entries
          </Badge>
        </div>

        {logsLoading ? (
          <p className="text-center py-10 text-muted-foreground">Loading logs...</p>
        ) : warehouseLogs.length === 0 ? (
          <Card className="rounded-2xl border border-dashed py-16 text-center">
            <CardContent>
              <Clock className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
              <p className="font-bold text-foreground">No logs recorded yet</p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-3">
            {warehouseLogs.map((log: any) => (
              <div key={log.id} className="p-4 bg-card border rounded-2xl flex items-center justify-between gap-4">
                <div className="space-y-1">
                  <p className="font-medium text-foreground text-sm">{log.description}</p>
                  <div className="flex items-center gap-2 text-xs text-muted-foreground">
                    <span className="font-semibold">{log.date}</span>
                    <span>&bull;</span>
                    <span>Entry ID: {log.id}</span>
                  </div>
                </div>
                <Badge className="text-[10px] rounded-full uppercase font-bold tracking-wider">
                  {log.description.toLowerCase().startsWith("loaded") ? "LOAD" : "UNLOAD"}
                </Badge>
              </div>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}
