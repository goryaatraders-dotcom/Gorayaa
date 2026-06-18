"use client"

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { 
  ArrowLeft, Users, UserCog, Truck, Crown, Phone, 
  CreditCard, Plus, Search, Building2,
  Lock, Edit2, Eye, LogOut, KeyRound, Clock, CheckCircle2, XCircle, ShoppingCart, Trash2
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger, DialogDescription, DialogFooter } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { GTLogo } from "@/components/gt-logo"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { useShopFinance } from "@/context/shop-finance-context"
import { toast } from "sonner"
import type { StaffMember, StaffRole } from "@/lib/data"
import { CropRatesManager } from "@/components/crop-rates-manager"

export default function AdminPage() {
  const { totalItems } = useCart()
  const { currentUser, login, logout, isAuthenticated } = useAuth()
  const router = useRouter()
  const { staffMoney } = useShopFinance()

  // Authentication inputs
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [loading, setLoading] = useState(false)

  // Staff list & database states
  const [staffList, setStaffList] = useState<StaffMember[]>([])
  const [dbOrders, setDbOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [warehouseLogs, setWarehouseLogs] = useState<any[]>([])
  const [logsLoading, setLogsLoading] = useState(false)

  // Tab navigation states
  const [activeTab, setActiveTab] = useState<"staff" | "orders" | "logs" | "crops">("staff")
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  const [orderSearch, setOrderSearch] = useState("")
  const [ordersFilterStatus, setOrdersFilterStatus] = useState("all")
  const [selectedOrderScreenshot, setSelectedOrderScreenshot] = useState<string | null>(null)

  // Add Staff states
  const [addStaffOpen, setAddStaffOpen] = useState(false)
  const [newStaffName, setNewStaffName] = useState("")
  const [newStaffNameUrdu, setNewStaffNameUrdu] = useState("")
  const [newStaffPhone, setNewStaffPhone] = useState("")
  const [newStaffRole, setNewStaffRole] = useState("loader")
  const [newStaffSalary, setNewStaffSalary] = useState("")
  const [isAddingStaff, setIsAddingStaff] = useState(false)

  // Edit Staff states
  const [editingStaff, setEditingStaff] = useState<StaffMember | null>(null)
  const [editStaffOpen, setEditStaffOpen] = useState(false)
  const [editName, setEditName] = useState("")
  const [editNameUrdu, setEditNameUrdu] = useState("")
  const [editPhone, setEditPhone] = useState("")
  const [editRole, setEditRole] = useState("")
  const [editSalary, setEditSalary] = useState("")
  const [editStatus, setEditStatus] = useState<"active" | "inactive">("active")
  const [isSavingStaff, setIsSavingStaff] = useState(false)

  // Log loading/unloading form states
  const [logDescription, setLogDescription] = useState("")
  const [logType, setLogType] = useState<"load" | "unload">("unload")
  const [logDate, setLogDate] = useState(new Date().toISOString().slice(0, 10))
  const [isAddingLog, setIsAddingLog] = useState(false)

  const loadStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setStaffList(data)
          return
        }
      }
    } catch (err) {
      console.warn("Failed to load staff list from DB, falling back to local data.")
    }
    // Fallback to local data
    import("@/lib/data").then(mod => setStaffList(mod.staffMembers))
  }, [])

  const loadDbOrders = useCallback(async () => {
    setOrdersLoading(true)
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setDbOrders(data)
          return
        }
      }
    } catch (err) {
      console.warn("Failed to load orders from DB, falling back to local data.")
    } finally {
      setOrdersLoading(false)
    }
    // Fallback to local data
    import("@/lib/data").then(mod => {
      setDbOrders(mod.seedOrders)
      setOrdersLoading(false)
    })
  }, [])

  const loadWarehouseLogs = useCallback(async () => {
    setLogsLoading(true)
    try {
      const res = await fetch("/api/ledger?bookId=load-unload")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setWarehouseLogs(data.reverse())
          return
        }
      }
    } catch (err) {
      console.warn("Failed to load warehouse logs from DB, falling back to local data.")
    } finally {
      setLogsLoading(false)
    }
    // Fallback
    setWarehouseLogs([])
    setLogsLoading(false)
  }, [])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  useEffect(() => {
    if (isAuthenticated) {
      loadDbOrders()
      loadWarehouseLogs()
      setActiveTab("staff")
    }
  }, [isAuthenticated, loadDbOrders, loadWarehouseLogs])

  const handleAdminLogin = (e: any) => {
    e.preventDefault()
    setLoginError(null)
    setLoading(true)

    // Check if the role is admin/owner or manager
    const r = login(email.trim(), password)
    if (!r.ok) {
      setLoginError(r.message)
      toast.error(r.message)
      setLoading(false)
      return
    }

    // Verify role restriction (only admin/owner or manager)
    // We fetch staff to check, or rely on currentUser populated by login
    setLoading(false)
  }

  // Effect to redirect loaders away from /admin
  useEffect(() => {
    if (isAuthenticated && currentUser) {
      if (currentUser.role === "loader") {
        toast.info("Redirecting you to the Loader Workspace...")
        router.push("/loader")
      } else {
        toast.success(`Welcome back, ${currentUser.name}!`)
      }
    }
  }, [isAuthenticated, currentUser, router])

  const handleAddStaff = async () => {
    if (!newStaffName.trim()) {
      toast.error("Staff name is required")
      return
    }
    setIsAddingStaff(true)
    try {
      const res = await fetch("/api/staff", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          name: newStaffName.trim(),
          nameUrdu: newStaffNameUrdu.trim(),
          role: newStaffRole,
          phone: newStaffPhone.trim(),
          salary: Number(newStaffSalary) || 0,
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          toast.success("Staff member added successfully!")
          setAddStaffOpen(false)
          setNewStaffName("")
          setNewStaffNameUrdu("")
          setNewStaffPhone("")
          setNewStaffSalary("")
          await loadStaff()
        } else {
          toast.error(data.error || "Failed to add staff member")
        }
      }
    } catch (err) {
      toast.error("Network error adding staff member")
    } finally {
      setIsAddingStaff(false)
    }
  }

  const handleEditStaffClick = (staff: StaffMember) => {
    setEditingStaff(staff)
    setEditName(staff.name)
    setEditNameUrdu(staff.nameUrdu || "")
    setEditPhone(staff.phone || "")
    setEditRole(staff.role)
    setEditSalary(String(staff.salary))
    setEditStatus(staff.status)
    setEditStaffOpen(true)
  }

  const handleSaveStaff = async () => {
    if (!editingStaff) return
    setIsSavingStaff(true)
    try {
      const res = await fetch("/api/staff", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          id: editingStaff.id,
          name: editName,
          nameUrdu: editNameUrdu,
          role: editRole,
          phone: editPhone,
          salary: Number(editSalary) || 0,
          status: editStatus
        })
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          toast.success("Staff details updated!")
          setEditStaffOpen(false)
          await loadStaff()
        } else {
          toast.error(data.error || "Failed to update staff")
        }
      }
    } catch (err) {
      toast.error("Network error updating staff details")
    } finally {
      setIsSavingStaff(false)
    }
  }

  const handleDeleteStaff = async (staffId: string) => {
    if (!confirm("Are you sure you want to remove this staff member?")) return
    try {
      const res = await fetch(`/api/staff?id=${staffId}`, {
        method: "DELETE"
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          toast.success("Staff member removed successfully")
          await loadStaff()
        } else {
          toast.error(data.error || "Failed to delete staff")
        }
      }
    } catch (err) {
      toast.error("Network error deleting staff")
    }
  }

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

  // Filter staff list
  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.nameUrdu.includes(searchQuery) ||
                         staff.phone.includes(searchQuery)
    const matchesRole = filterRole === "all" || staff.role === filterRole
    return matchesSearch && matchesRole
  })

  // Manager filter list: view loaders, manage loaders only
  const managerFilteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.nameUrdu.includes(searchQuery) ||
                         staff.phone.includes(searchQuery)
    const matchesRole = filterRole === "all" ? staff.role === "loader" : staff.role === filterRole
    return matchesSearch && (staff.role === "loader" || staff.id === currentUser?.id)
  })

  const filteredOrders = dbOrders.filter(order => {
    const query = orderSearch.toLowerCase()
    const matchesSearch = 
      order.customerName.toLowerCase().includes(query) ||
      (order.customerPhone && order.customerPhone.includes(query)) ||
      (order.trackingCode && order.trackingCode.toLowerCase().includes(query)) ||
      order.id.toLowerCase().includes(query)
    
    const matchesStatus = ordersFilterStatus === "all" || order.status === ordersFilterStatus
    return matchesSearch && matchesStatus
  })

  const totalSalary = staffList.filter(s => s.role !== "owner").reduce((sum, s) => sum + s.salary, 0)
  const loaderCount = staffList.filter(s => s.role === "loader").length

  return (
    <div className="min-h-screen bg-background">
      {isAuthenticated && <Header cartCount={totalItems} />}
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        
        {/* Isolated Login Portal view when NOT logged in */}
        {!isAuthenticated || !currentUser || currentUser.role === "loader" ? (
          <div className="max-w-md mx-auto space-y-6 py-12 animate-fade-in-up">
            <div className="flex flex-col items-center text-center">
              <Link href="/">
                <GTLogo size="lg" className="mb-4 hover:scale-105 transition-transform" />
              </Link>
              <h1 className="text-3xl font-black text-foreground">Goraya Traders</h1>
              <p className="mt-1 text-sm text-muted-foreground uppercase tracking-widest font-bold text-amber-600">
                Admin & Manager Portal
              </p>
            </div>

            <Card className="rounded-[2.5rem] border border-border bg-card shadow-2xl">
              <CardHeader>
                <CardTitle className="text-2xl font-bold text-center">Management Login</CardTitle>
                <CardDescription className="text-center">Enter Gmail and password to access dashboard</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <form onSubmit={handleAdminLogin} className="space-y-4">
                  <div className="space-y-2">
                    <Label htmlFor="admin-email">Gmail Address</Label>
                    <Input
                      id="admin-email"
                      type="email"
                      placeholder="e.g. goraya@gmail.com"
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
                    <Label htmlFor="admin-pass">Password</Label>
                    <div className="relative">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        id="admin-pass"
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
                    {loading ? "Authenticating..." : "Admin Sign In"}
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
                      <p className="font-bold text-amber-600">👑 Owner (Admin)</p>
                      <p className="text-foreground">goraya@gmail.com &bull; Pass: 1234</p>
                    </div>
                    <div>
                      <p className="font-bold text-blue-600">👤 Manager</p>
                      <p className="text-foreground">hassan@gmail.com &bull; Pass: 1234</p>
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
          
          /* Authenticated Admin / Manager Workspace Dashboard View */
          <div className="space-y-8 animate-fade-in-up">
            
            {/* Top profile banner */}
            <div className="flex flex-col md:flex-row items-start md:items-center justify-between gap-6 p-6 sm:p-8 rounded-[2rem] border border-primary/25 bg-primary/5">
              <div className="flex items-center gap-4">
                <div className="h-16 w-16 rounded-[1.2rem] bg-foreground text-background flex items-center justify-center shadow-lg">
                  {currentUser.role === "owner" ? <Crown className="h-8 w-8 text-amber-500" /> : <UserCog className="h-8 w-8 text-blue-500" />}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <h2 className="text-2xl font-black text-foreground">{currentUser.name}</h2>
                    <Badge className="capitalize text-xs font-semibold rounded-full px-2.5 py-0.5">
                      {currentUser.role === "owner" ? "Owner (Admin)" : "Manager"}
                    </Badge>
                  </div>
                  <p className="text-sm text-muted-foreground mt-0.5">
                    {currentUser.department} Department &bull; {currentUser.phone} &bull; {currentUser.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center gap-3 w-full md:w-auto">
                <Link href="/ledger">
                  <Button variant="outline" className="rounded-full h-11 border-primary/30 text-primary hover:bg-primary/5">
                    Ledgers Book
                  </Button>
                </Link>
                <Button variant="outline" className="rounded-full h-11 gap-2 shrink-0 border-destructive/20 text-destructive hover:bg-destructive/5" onClick={logout}>
                  <LogOut className="h-4 w-4" /> Sign Out
                </Button>
              </div>
            </div>

            {/* A. OWNER (ADMIN) DASHBOARD */}
            {currentUser.role === "owner" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-black text-foreground tracking-tight">👑 Owner Admin Control Panel</h1>
                  <p className="text-muted-foreground mt-1">Full administration, double-entry financial oversight, and payroll</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                  <Card className="rounded-2xl border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Staff Members</p>
                        <p className="text-2xl font-black text-foreground mt-1">{staffList.length}</p>
                      </div>
                      <Users className="h-8 w-8 text-primary" />
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Active Orders</p>
                        <p className="text-2xl font-black text-foreground mt-1">{dbOrders.length}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-500" />
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Loaders Team</p>
                        <p className="text-2xl font-black text-foreground mt-1">{loaderCount}</p>
                      </div>
                      <Truck className="h-8 w-8 text-emerald-500" />
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Monthly Salary Bill</p>
                        <p className="text-2xl font-black text-foreground mt-1">Rs. {totalSalary.toLocaleString()}</p>
                      </div>
                      <CreditCard className="h-8 w-8 text-amber-500" />
                    </CardContent>
                  </Card>
                </div>

                {/* Quick Action Navigation Grid */}
                <div className="grid grid-cols-2 sm:grid-cols-4 gap-4">
                  <Link href="/ledger" className="block p-5 bg-card border rounded-2xl text-center hover:bg-secondary/40 hover:shadow transition">
                    <p className="text-xl font-bold text-foreground">Ledger Books</p>
                    <p className="text-xs text-muted-foreground mt-1">5 Double-Entry Books</p>
                  </Link>
                  <Link href="/inventory" className="block p-5 bg-card border rounded-2xl text-center hover:bg-secondary/40 hover:shadow transition">
                    <p className="text-xl font-bold text-foreground">Stock Control</p>
                    <p className="text-xs text-muted-foreground mt-1">Prices & Inventory</p>
                  </Link>
                  <Link href="/shop-finance" className="block p-5 bg-card border rounded-2xl text-center hover:bg-secondary/40 hover:shadow transition">
                    <p className="text-xl font-bold text-foreground">Shop Finances</p>
                    <p className="text-xs text-muted-foreground mt-1">Expenses & Salaries</p>
                  </Link>
                  <Link href="/customers" className="block p-5 bg-card border rounded-2xl text-center hover:bg-secondary/40 hover:shadow transition">
                    <p className="text-xl font-bold text-foreground">Customers</p>
                    <p className="text-xs text-muted-foreground mt-1">Balances & Recovery</p>
                  </Link>
                </div>

                <div className="flex border-b border-border/60 gap-8">
                  {["staff", "orders", "logs", "crops"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-4 text-lg font-black capitalize tracking-tight border-b-2 transition-all ${
                        activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "staff" ? "Staff Directory" : tab === "orders" ? "Manage Orders" : tab === "logs" ? "Warehouse Movement Logs" : "Crop Rates"}
                    </button>
                  ))}
                </div>

                {activeTab === "staff" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search staff members by name..."
                          className="pl-12 h-12 rounded-xl"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
                        <DialogTrigger asChild>
                          <Button className="rounded-full h-11 gap-2 font-semibold">
                            <Plus className="h-5 w-5" /> Add New Staff
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-md bg-card">
                          <DialogHeader>
                            <DialogTitle>Add Staff Member</DialogTitle>
                            <DialogDescription>Register a new worker profile.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-2">
                            <div className="space-y-1">
                              <Label>Full Name</Label>
                              <Input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="Name" />
                            </div>
                            <div className="space-y-1">
                              <Label>Urdu Name</Label>
                              <Input value={newStaffNameUrdu} onChange={(e) => setNewStaffNameUrdu(e.target.value)} placeholder="اردو نام" className="text-right" dir="rtl" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label>Role</Label>
                                <select className="w-full border p-2 text-sm rounded bg-background" value={newStaffRole} onChange={(e) => setNewStaffRole(e.target.value)}>
                                  <option value="manager">Manager</option>
                                  <option value="loader">Loader</option>
                                  <option value="owner">Owner</option>
                                </select>
                              </div>
                              <div className="space-y-1">
                                <Label>Phone</Label>
                                <Input value={newStaffPhone} onChange={(e) => setNewStaffPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label>Salary (PKR)</Label>
                              <Input type="number" value={newStaffSalary} onChange={(e) => setNewStaffSalary(e.target.value)} placeholder="e.g. 30000" />
                            </div>
                            <Button className="w-full mt-2" onClick={handleAddStaff} disabled={isAddingStaff}>
                              {isAddingStaff ? "Adding..." : "Add Staff"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Card className="rounded-2xl overflow-hidden border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/40">
                            <TableHead className="font-bold py-4 pl-6">Name</TableHead>
                            <TableHead className="font-bold">Role</TableHead>
                            <TableHead className="font-bold">Phone</TableHead>
                            <TableHead className="font-bold">Monthly Salary</TableHead>
                            <TableHead className="font-bold text-right">Advance Bal</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold pr-6 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {filteredStaff.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-bold py-4 pl-6">
                                <div>
                                  <p>{s.name}</p>
                                  <p className="text-xs text-muted-foreground">{s.nameUrdu}</p>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize text-xs font-semibold">{s.role}</TableCell>
                              <TableCell className="text-sm">{s.phone}</TableCell>
                              <TableCell className="font-semibold text-sm">
                                {s.role === "owner" ? "-" : `Rs. ${s.salary.toLocaleString()}`}
                              </TableCell>
                              <TableCell className="text-right text-sm font-mono">
                                Rs. {(staffMoney[s.id]?.advanceFromShop ?? 0).toLocaleString()}
                              </TableCell>
                              <TableCell>
                                <Badge variant={s.status === "active" ? "default" : "secondary"} className="rounded-full text-[10px]">
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="pr-6 text-right space-x-1">
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => handleEditStaffClick(s)}>
                                  <Edit2 className="h-4 w-4" />
                                </Button>
                                <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStaff(s.id)}>
                                  <Trash2 className="h-4 w-4" />
                                </Button>
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <OrdersManager 
                      filteredOrders={filteredOrders}
                      orderSearch={orderSearch}
                      setOrderSearch={setOrderSearch}
                      ordersFilterStatus={ordersFilterStatus}
                      setOrdersFilterStatus={setOrdersFilterStatus}
                      ordersLoading={ordersLoading}
                      handleOrderAction={handleOrderAction}
                      setSelectedOrderScreenshot={setSelectedOrderScreenshot}
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

                {activeTab === "crops" && (
                  <CropRatesManager />
                )}
              </div>
            )}

            {/* B. MANAGER DASHBOARD */}
            {currentUser.role === "manager" && (
              <div className="space-y-8">
                <div>
                  <h1 className="text-3xl font-black text-foreground tracking-tight">👤 Manager Administrative Panel</h1>
                  <p className="text-muted-foreground mt-1">Manage orders, coordinate loaders, check inventory and balances</p>
                </div>

                <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                  <Card className="rounded-2xl border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Loaders Supervised</p>
                        <p className="text-2xl font-black text-foreground mt-1">{loaderCount}</p>
                      </div>
                      <Truck className="h-8 w-8 text-primary" />
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Active Orders</p>
                        <p className="text-2xl font-black text-foreground mt-1">{dbOrders.length}</p>
                      </div>
                      <ShoppingCart className="h-8 w-8 text-blue-500" />
                    </CardContent>
                  </Card>
                  <Card className="rounded-2xl border">
                    <CardContent className="p-5 flex items-center justify-between">
                      <div>
                        <p className="text-xs font-medium text-muted-foreground uppercase">Warehouse Movements</p>
                        <p className="text-2xl font-black text-foreground mt-1">{warehouseLogs.length}</p>
                      </div>
                      <Clock className="h-8 w-8 text-emerald-500" />
                    </CardContent>
                  </Card>
                </div>

                <div className="grid grid-cols-3 gap-4">
                  <Link href="/ledger" className="block p-5 bg-card border rounded-2xl text-center hover:bg-secondary/40 hover:shadow transition">
                    <p className="text-lg font-bold text-foreground">Ledger Books</p>
                    <p className="text-xs text-muted-foreground mt-1">View/Edit Ledger Books</p>
                  </Link>
                  <Link href="/inventory" className="block p-5 bg-card border rounded-2xl text-center hover:bg-secondary/40 hover:shadow transition">
                    <p className="text-lg font-bold text-foreground">Inventory Catalog</p>
                    <p className="text-xs text-muted-foreground mt-1">Manage Stock Prices</p>
                  </Link>
                  <Link href="/customers" className="block p-5 bg-card border rounded-2xl text-center hover:bg-secondary/40 hover:shadow transition">
                    <p className="text-lg font-bold text-foreground">Customer List</p>
                    <p className="text-xs text-muted-foreground mt-1">Balances & Profiles</p>
                  </Link>
                </div>

                <div className="flex border-b border-border/60 gap-8">
                  {["staff", "orders", "logs"].map((tab) => (
                    <button
                      key={tab}
                      onClick={() => setActiveTab(tab as any)}
                      className={`pb-4 text-lg font-black capitalize tracking-tight border-b-2 transition-all ${
                        activeTab === tab ? "border-primary text-foreground" : "border-transparent text-muted-foreground hover:text-foreground"
                      }`}
                    >
                      {tab === "staff" ? "Loader Team" : tab === "orders" ? "Manage Orders" : "Warehouse Movement Logs"}
                    </button>
                  ))}
                </div>

                {activeTab === "staff" && (
                  <div className="space-y-6">
                    <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                      <div className="relative flex-1 w-full max-w-md">
                        <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                        <Input
                          type="text"
                          placeholder="Search loader staff..."
                          className="pl-12 h-12 rounded-xl"
                          value={searchQuery}
                          onChange={(e) => setSearchQuery(e.target.value)}
                        />
                      </div>
                      
                      <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
                        <DialogTrigger asChild>
                          <Button className="rounded-full h-11 gap-2 font-semibold">
                            <Plus className="h-5 w-5" /> Add Loader Member
                          </Button>
                        </DialogTrigger>
                        <DialogContent className="rounded-2xl max-w-md bg-card">
                          <DialogHeader>
                            <DialogTitle>Add Loader Staff</DialogTitle>
                            <DialogDescription>Register a new loader helper.</DialogDescription>
                          </DialogHeader>
                          <div className="space-y-4 py-2">
                            <div className="space-y-1">
                              <Label>Full Name</Label>
                              <Input value={newStaffName} onChange={(e) => setNewStaffName(e.target.value)} placeholder="Loader Name" />
                            </div>
                            <div className="space-y-1">
                              <Label>Urdu Name</Label>
                              <Input value={newStaffNameUrdu} onChange={(e) => setNewStaffNameUrdu(e.target.value)} placeholder="اردو نام" className="text-right" dir="rtl" />
                            </div>
                            <div className="grid grid-cols-2 gap-3">
                              <div className="space-y-1">
                                <Label>Role (Restricted)</Label>
                                <Input value="Loader" disabled className="bg-secondary" />
                              </div>
                              <div className="space-y-1">
                                <Label>Phone</Label>
                                <Input value={newStaffPhone} onChange={(e) => setNewStaffPhone(e.target.value)} placeholder="03xx-xxxxxxx" />
                              </div>
                            </div>
                            <div className="space-y-1">
                              <Label>Salary (PKR)</Label>
                              <Input type="number" value={newStaffSalary} onChange={(e) => setNewStaffSalary(e.target.value)} placeholder="e.g. 26000" />
                            </div>
                            <Button className="w-full mt-2" onClick={async () => {
                              setNewStaffRole("loader")
                              await handleAddStaff()
                            }} disabled={isAddingStaff}>
                              {isAddingStaff ? "Adding..." : "Add Loader"}
                            </Button>
                          </div>
                        </DialogContent>
                      </Dialog>
                    </div>

                    <Card className="rounded-2xl overflow-hidden border bg-card">
                      <Table>
                        <TableHeader>
                          <TableRow className="bg-secondary/40">
                            <TableHead className="font-bold py-4 pl-6">Loader Name</TableHead>
                            <TableHead className="font-bold">Role</TableHead>
                            <TableHead className="font-bold">Phone</TableHead>
                            <TableHead className="font-bold">Monthly Salary</TableHead>
                            <TableHead className="font-bold">Status</TableHead>
                            <TableHead className="font-bold pr-6 text-right">Actions</TableHead>
                          </TableRow>
                        </TableHeader>
                        <TableBody>
                          {managerFilteredStaff.map((s) => (
                            <TableRow key={s.id}>
                              <TableCell className="font-bold py-4 pl-6">
                                <div>
                                  <p>{s.name}</p>
                                  <p className="text-xs text-muted-foreground">{s.nameUrdu}</p>
                                </div>
                              </TableCell>
                              <TableCell className="capitalize text-xs font-semibold">{s.role}</TableCell>
                              <TableCell className="text-sm">{s.phone}</TableCell>
                              <TableCell className="font-semibold text-sm">
                                {s.role === "owner" ? "-" : `Rs. ${s.salary.toLocaleString()}`}
                              </TableCell>
                              <TableCell>
                                <Badge variant={s.status === "active" ? "default" : "secondary"} className="rounded-full text-[10px]">
                                  {s.status}
                                </Badge>
                              </TableCell>
                              <TableCell className="pr-6 text-right">
                                {s.role === "loader" ? (
                                  <div className="space-x-1">
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg" onClick={() => handleEditStaffClick(s)}>
                                      <Edit2 className="h-4 w-4" />
                                    </Button>
                                    <Button size="icon" variant="ghost" className="h-8 w-8 rounded-lg text-destructive hover:bg-destructive/10" onClick={() => handleDeleteStaff(s.id)}>
                                      <Trash2 className="h-4 w-4" />
                                    </Button>
                                  </div>
                                ) : (
                                  <span className="text-xs text-muted-foreground italic">Restricted</span>
                                )}
                              </TableCell>
                            </TableRow>
                          ))}
                        </TableBody>
                      </Table>
                    </Card>
                  </div>
                )}

                {activeTab === "orders" && (
                  <div className="space-y-6">
                    <OrdersManager 
                      filteredOrders={filteredOrders}
                      orderSearch={orderSearch}
                      setOrderSearch={setOrderSearch}
                      ordersFilterStatus={ordersFilterStatus}
                      setOrdersFilterStatus={setOrdersFilterStatus}
                      ordersLoading={ordersLoading}
                      handleOrderAction={handleOrderAction}
                      setSelectedOrderScreenshot={setSelectedOrderScreenshot}
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
            )}

            {/* Edit staff Dialog */}
            <Dialog open={editStaffOpen} onOpenChange={setEditStaffOpen}>
              <DialogContent className="rounded-2xl max-w-md bg-card">
                <DialogHeader>
                  <DialogTitle>Edit Staff Details</DialogTitle>
                </DialogHeader>
                <div className="space-y-4 py-2">
                  <div className="space-y-1">
                    <Label>Full Name</Label>
                    <Input value={editName} onChange={(e) => setEditName(e.target.value)} />
                  </div>
                  <div className="space-y-1">
                    <Label>Urdu Name</Label>
                    <Input value={editNameUrdu} onChange={(e) => setEditNameUrdu(e.target.value)} className="text-right" dir="rtl" />
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Role</Label>
                      {currentUser.role === "owner" ? (
                        <select className="w-full border p-2 text-sm rounded bg-background" value={editRole} onChange={(e) => setEditRole(e.target.value)}>
                          <option value="owner">Owner</option>
                          <option value="manager">Manager</option>
                          <option value="loader">Loader</option>
                        </select>
                      ) : (
                        <Input value="Loader" disabled className="bg-secondary" />
                      )}
                    </div>
                    <div className="space-y-1">
                      <Label>Phone</Label>
                      <Input value={editPhone} onChange={(e) => setEditPhone(e.target.value)} />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <div className="space-y-1">
                      <Label>Salary (PKR)</Label>
                      <Input type="number" value={editSalary} onChange={(e) => setEditSalary(e.target.value)} disabled={editingStaff?.role === "owner"} />
                    </div>
                    <div className="space-y-1">
                      <Label>Status</Label>
                      <select className="w-full border p-2 text-sm rounded bg-background" value={editStatus} onChange={(e) => setEditStatus(e.target.value as any)}>
                        <option value="active">Active</option>
                        <option value="inactive">Inactive</option>
                      </select>
                    </div>
                  </div>
                  <Button className="w-full mt-2" onClick={handleSaveStaff} disabled={isSavingStaff}>
                    {isSavingStaff ? "Saving..." : "Save Changes"}
                  </Button>
                </div>
              </DialogContent>
            </Dialog>

          </div>
        )}

        {/* Screenshot Modal Popup */}
        {selectedOrderScreenshot && (
          <div 
            className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4"
            onClick={() => setSelectedOrderScreenshot(null)}
          >
            <div 
              className="bg-card rounded-3xl p-4 max-w-2xl w-full border relative overflow-hidden shadow-2xl animate-scale-in"
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
      </main>

      {isAuthenticated && (
        <footer className="bg-foreground text-background py-8 mt-16">
          <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <GTLogo size="sm" />
                <span className="font-bold">Goraya Traders</span>
              </div>
              <p className="text-sm text-background/60">Staff Management System - Restricted Access</p>
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
            { value: "pending", label: "Pending" },
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
      ) : filteredOrders.length === 0 ? (
        <Card className="rounded-2xl border border-dashed py-16 text-center">
          <CardContent>
            <ShoppingCart className="mx-auto mb-3 h-10 w-10 text-muted-foreground/40" />
            <p className="font-bold text-foreground">No orders matching status</p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredOrders.map((order: any) => (
            <Card key={order.id} className="rounded-2xl border bg-card overflow-hidden">
              <div className="bg-secondary/15 p-4 sm:p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
                <div>
                  <div className="flex items-center gap-2 flex-wrap">
                    <span className="font-mono font-bold text-sm text-primary">{order.trackingCode}</span>
                    <Badge className={`rounded-full px-2 py-0.5 text-[10px] font-bold border uppercase ${
                      order.status === "pending" ? "bg-amber-500/10 text-amber-600 border-amber-500/20" :
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
                {/* Proof screenshot if bank transfer */}
                {order.paymentScreenshot && (
                  <div className="p-3 bg-secondary/20 rounded-xl flex items-center justify-between text-xs gap-3">
                    <span>Transaction Proof Uploaded: Bank / EasyPaisa</span>
                    <Button variant="outline" size="sm" className="h-8 rounded" onClick={() => setSelectedOrderScreenshot(order.paymentScreenshot)}>
                      View screenshot
                    </Button>
                  </div>
                )}

                {/* Items */}
                <ul className="divide-y border rounded-xl overflow-hidden bg-background text-xs">
                  {order.items.map((it: any) => (
                    <li key={it.productId} className="p-2.5 flex justify-between">
                      <span className="font-bold">{it.name}</span>
                      <span className="text-muted-foreground">{it.quantity} bags &times; Rs. {it.unitPrice.toLocaleString()}</span>
                      <span className="font-black">Rs. {it.lineTotal.toLocaleString()}</span>
                    </li>
                  ))}
                </ul>

                {/* Actions */}
                <div className="flex justify-end gap-2 pt-2 border-t">
                  {order.status === "pending" && !isLoader && (
                    <>
                      <Button size="sm" className="bg-emerald-600 hover:bg-emerald-700 rounded-full font-semibold px-4 text-xs h-9" onClick={() => handleOrderAction(order.id, "approve")}>
                        Approve Order
                      </Button>
                      <Button size="sm" variant="destructive" className="rounded-full font-semibold px-4 text-xs h-9" onClick={() => handleOrderAction(order.id, "cancel")}>
                        Reject
                      </Button>
                    </>
                  )}
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

/* Warehouse movements subcomponent */
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
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    logType === "unload" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
                  }`}
                  onClick={() => setLogType("unload")}
                >
                  Unload (Inward)
                </button>
                <button
                  className={`flex-1 py-1.5 text-xs font-bold rounded-md transition-all ${
                    logType === "load" ? "bg-background text-foreground shadow-sm" : "text-muted-foreground"
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
