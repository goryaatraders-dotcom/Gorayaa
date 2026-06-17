"use client"

import { useState, useEffect, useCallback } from "react"
import Link from "next/link"
import { 
  ArrowLeft, Users, UserCog, Truck, Crown, Phone, 
  CreditCard, Plus, Search, Building2,
  ChevronRight, Lock, Edit2, Eye, LogOut, KeyRound, Clock, CheckCircle2, XCircle, AlertCircle, ShoppingCart
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select"
import { staffMembers, StaffMember, StaffRole } from "@/lib/data"
import { Header } from "@/components/header"
import { GTLogo } from "@/components/gt-logo"
import { useAuth } from "@/context/auth-context"
import { useCart } from "@/context/cart-context"
import { STAFF_PORTAL_PASSWORD } from "@/lib/auth-constants"
import { useShopFinance } from "@/context/shop-finance-context"
import { toast } from "sonner"

const roleConfig: Record<StaffRole, { label: string, labelUrdu: string, icon: typeof Crown, color: string, bgColor: string }> = {
  owner: { 
    label: "Owner", 
    labelUrdu: "مالک", 
    icon: Crown, 
    color: "text-amber-600", 
    bgColor: "bg-amber-500/10 border-amber-500/20" 
  },
  manager: { 
    label: "Manager", 
    labelUrdu: "منیجر", 
    icon: UserCog, 
    color: "text-blue-600", 
    bgColor: "bg-blue-500/10 border-blue-500/20" 
  },
  loader: { 
    label: "Loader", 
    labelUrdu: "لوڈر", 
    icon: Truck, 
    color: "text-emerald-600", 
    bgColor: "bg-emerald-500/10 border-emerald-500/20" 
  }
}

function StaffContent() {
  const { totalItems } = useCart()
  const { currentUser, login, logout, isAuthenticated, hasPermission } = useAuth()
  const { staffMoney } = useShopFinance()
  const showMoney = hasPermission("canManageShopFinance")
  const [loginStaffId, setLoginStaffId] = useState("")
  const [loginPassword, setLoginPassword] = useState("")
  const [loginError, setLoginError] = useState<string | null>(null)
  const [searchQuery, setSearchQuery] = useState("")
  const [filterRole, setFilterRole] = useState<string>("all")
  
  // Dynamic staff list states
  const [staffList, setStaffList] = useState<StaffMember[]>(staffMembers)
  const [newStaffName, setNewStaffName] = useState("")
  const [newStaffNameUrdu, setNewStaffNameUrdu] = useState("")
  const [newStaffPhone, setNewStaffPhone] = useState("")
  const [newStaffRole, setNewStaffRole] = useState("loader")
  const [newStaffSalary, setNewStaffSalary] = useState("")
  const [isAddingStaff, setIsAddingStaff] = useState(false)
  const [addStaffOpen, setAddStaffOpen] = useState(false)

  // Orders Tab states
  const [activeTab, setActiveTab] = useState<"staff" | "orders">("staff")
  const [dbOrders, setDbOrders] = useState<any[]>([])
  const [ordersLoading, setOrdersLoading] = useState(false)
  const [orderSearch, setOrderSearch] = useState("")
  const [ordersFilterStatus, setOrdersFilterStatus] = useState("all")
  const [selectedOrderScreenshot, setSelectedOrderScreenshot] = useState<string | null>(null)

  const portalStaff = staffList

  const loadStaff = useCallback(async () => {
    try {
      const res = await fetch("/api/staff")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data) && data.length > 0) {
          setStaffList(data)
        }
      }
    } catch (err) {
      console.warn("Failed to load staff list from database, using seed.")
    }
  }, [])

  const loadDbOrders = useCallback(async () => {
    if (!isAuthenticated) return
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
      toast.error("Failed to load orders from database.")
    } finally {
      setOrdersLoading(false)
    }
  }, [isAuthenticated])

  useEffect(() => {
    loadStaff()
  }, [loadStaff])

  useEffect(() => {
    if (isAuthenticated) {
      loadDbOrders()
      if (currentUser?.role === "loader") {
        setActiveTab("orders")
      } else {
        setActiveTab("staff")
      }
    }
  }, [isAuthenticated, currentUser, loadDbOrders])

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
          toast.success(`Order ${action}ed successfully!`)
          await loadDbOrders()
        } else {
          toast.error(data.error || `Failed to ${action} order`)
        }
      } else {
        toast.error("Request failed. Please verify stocks.")
      }
    } catch (err) {
      toast.error("Network error processing order action")
    }
  }

  const filteredStaff = staffList.filter(staff => {
    const matchesSearch = staff.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
                         staff.nameUrdu.includes(searchQuery) ||
                         staff.phone.includes(searchQuery)
    const matchesRole = filterRole === "all" || staff.role === filterRole
    return matchesSearch && matchesRole
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
  const managementCount = staffList.filter(s => s.role === "owner" || s.role === "manager").length
  const loaderCount = staffList.filter(s => s.role === "loader").length
  const pendingOrdersCount = dbOrders.filter(o => o.status === "pending").length

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />
      
      <main className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 py-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors duration-300 mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Shop
        </Link>

        {/* Demo staff sign-in — Owner & Manager can open all five ledgers */}
        <Card className="rounded-3xl border-primary/20 bg-primary/5 mb-10 overflow-hidden animate-fade-in-up">
          <CardContent className="p-6 sm:p-8 flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
            <div className="flex-1 space-y-4">
              <div className="flex items-start gap-4">
                <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-foreground text-background">
                  <KeyRound className="h-6 w-6" />
                </div>
                <div>
                  <p className="font-bold text-foreground text-lg">Staff Portal Access</p>
                  <p className="text-sm text-muted-foreground mt-1 max-w-xl">
                    Select a staff account below and enter password <strong className="text-foreground">1234</strong> (or custom password) to test different roles.
                  </p>
                </div>
              </div>
              
              {/* Credentials helper */}
              {!isAuthenticated && (
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-3 bg-card/80 p-4 rounded-2xl border border-primary/10 text-xs">
                  <div className="space-y-1">
                    <p className="font-bold text-amber-600 flex items-center gap-1">👑 Admin/Owner</p>
                    <p className="text-muted-foreground">Name: Muhammad Goraya</p>
                    <p className="font-mono text-[11px] bg-secondary/50 px-1.5 py-0.5 rounded w-fit">Pass: 1234</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-blue-600 flex items-center gap-1">👤 Manager</p>
                    <p className="text-muted-foreground">Name: Hassan Ali</p>
                    <p className="font-mono text-[11px] bg-secondary/50 px-1.5 py-0.5 rounded w-fit">Pass: 1234</p>
                  </div>
                  <div className="space-y-1">
                    <p className="font-bold text-emerald-600 flex items-center gap-1">🚚 Staff (Loader)</p>
                    <p className="text-muted-foreground">Name: Tariq Mehmood</p>
                    <p className="font-mono text-[11px] bg-secondary/50 px-1.5 py-0.5 rounded w-fit">Pass: 1234</p>
                  </div>
                </div>
              )}

              {isAuthenticated && currentUser && (
                <div className="text-sm font-medium text-foreground bg-card/80 p-3 rounded-2xl border border-primary/10 w-fit">
                  Signed in as <span className="text-primary font-bold">{currentUser.name}</span> (<span className="capitalize font-semibold text-accent">{currentUser.role}</span>) — {currentUser.department}
                </div>
              )}
            </div>

            <div className="flex w-full flex-col gap-3 sm:w-auto sm:min-w-[280px]">
              {!isAuthenticated ? (
                <>
                  <Select
                    value={loginStaffId || undefined}
                    onValueChange={(id) => {
                      setLoginStaffId(id)
                      setLoginError(null)
                    }}
                  >
                    <SelectTrigger className="h-12 rounded-xl">
                      <SelectValue placeholder="Select staff account…" />
                    </SelectTrigger>
                    <SelectContent>
                      {portalStaff.map((s) => (
                        <SelectItem key={s.id} value={s.id}>
                          {s.name} — {s.role}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  <Input
                    type="password"
                    autoComplete="current-password"
                    placeholder="Password (1234)"
                    className="h-12 rounded-xl"
                    value={loginPassword}
                    onChange={(e) => {
                      setLoginPassword(e.target.value)
                      setLoginError(null)
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Enter" && loginStaffId) {
                        const r = login(loginStaffId, loginPassword)
                        if (!r.ok) setLoginError(r.message)
                        else {
                          setLoginPassword("")
                          setLoginError(null)
                        }
                      }
                    }}
                  />
                  {loginError && (
                    <p className="text-sm font-medium text-destructive" role="alert">
                      {loginError}
                    </p>
                  )}
                  <Button
                    className="h-12 rounded-xl px-6 font-medium"
                    disabled={!loginStaffId}
                    onClick={() => {
                      if (!loginStaffId) return
                      const r = login(loginStaffId, loginPassword)
                      if (!r.ok) setLoginError(r.message)
                      else {
                        setLoginPassword("")
                        setLoginError(null)
                      }
                    }}
                  >
                    Sign in
                  </Button>
                </>
              ) : (
                <Button variant="outline" className="h-12 rounded-xl gap-2" onClick={() => logout()}>
                  <LogOut className="h-4 w-4" />
                  Sign out
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Page Header */}
        <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-6 mb-10 animate-fade-in-up">
          <div>
            <div className="flex items-center gap-3 mb-2">
              <div className="h-12 w-12 rounded-2xl bg-foreground flex items-center justify-center">
                <Users className="h-6 w-6 text-background" />
              </div>
              <div>
                <h1 className="text-3xl lg:text-4xl font-black text-foreground tracking-tight">Staff Management</h1>
                <p className="text-muted-foreground">Goraya Traders - Team Overview</p>
              </div>
            </div>
          </div>
          
          <Dialog open={addStaffOpen} onOpenChange={setAddStaffOpen}>
            <DialogTrigger asChild>
              <Button className="rounded-full gap-2 h-12 px-6 font-medium group">
                <Plus className="h-5 w-5" />
                Add Staff Member
                <ChevronRight className="h-4 w-4 transition-transform duration-300 group-hover:translate-x-1" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-lg rounded-3xl bg-card border">
              <DialogHeader>
                <DialogTitle className="text-2xl font-black">Add New Staff Member</DialogTitle>
              </DialogHeader>
              <div className="grid gap-5 py-4">
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name</Label>
                    <Input 
                      placeholder="Full name" 
                      className="h-12 rounded-xl bg-background" 
                      value={newStaffName}
                      onChange={(e) => setNewStaffName(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Name (Urdu)</Label>
                    <Input 
                      placeholder="اردو نام" 
                      className="h-12 rounded-xl text-right bg-background" 
                      dir="rtl" 
                      value={newStaffNameUrdu}
                      onChange={(e) => setNewStaffNameUrdu(e.target.value)}
                    />
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Phone</Label>
                    <Input 
                      placeholder="0300-1234567" 
                      className="h-12 rounded-xl bg-background" 
                      value={newStaffPhone}
                      onChange={(e) => setNewStaffPhone(e.target.value)}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Role</Label>
                    <Select value={newStaffRole} onValueChange={setNewStaffRole}>
                      <SelectTrigger className="h-12 rounded-xl bg-background">
                        <SelectValue placeholder="Select role" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="manager">Manager</SelectItem>
                        <SelectItem value="loader">Loader (Load/Unload)</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Salary (PKR)</Label>
                    <Input 
                      type="number" 
                      placeholder="25000" 
                      className="h-12 rounded-xl bg-background" 
                      value={newStaffSalary}
                      onChange={(e) => setNewStaffSalary(e.target.value)}
                    />
                  </div>
                </div>
                <Button 
                  className="h-12 rounded-xl font-medium mt-2" 
                  onClick={handleAddStaff}
                  disabled={isAddingStaff}
                >
                  {isAddingStaff ? "Adding..." : "Add Staff Member"}
                </Button>
              </div>
            </DialogContent>
          </Dialog>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-10">
          <Card className="rounded-3xl border-border/50 hover-lift animate-fade-in-up stagger-1">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Total Staff</p>
                  <p className="text-3xl font-black text-foreground mt-1">{staffList.length}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-foreground flex items-center justify-center">
                  <Users className="h-7 w-7 text-background" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-3xl border-border/50 hover-lift animate-fade-in-up stagger-2">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Management</p>
                  <p className="text-3xl font-black text-foreground mt-1">{managementCount}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                  <UserCog className="h-7 w-7 text-blue-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-3xl border-border/50 hover-lift animate-fade-in-up stagger-3">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Load/Unload Dept.</p>
                  <p className="text-3xl font-black text-foreground mt-1">{loaderCount}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                  <Truck className="h-7 w-7 text-emerald-600" />
                </div>
              </div>
            </CardContent>
          </Card>
          
          <Card className="rounded-3xl border-border/50 hover-lift animate-fade-in-up stagger-4">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-muted-foreground">Monthly Salaries</p>
                  <p className="text-3xl font-black text-foreground mt-1">Rs. {totalSalary.toLocaleString()}</p>
                </div>
                <div className="h-14 w-14 rounded-2xl bg-accent/20 flex items-center justify-center">
                  <CreditCard className="h-7 w-7 text-accent" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Tabs switcher */}
        {isAuthenticated && currentUser?.role !== "loader" && (
          <div className="flex border-b border-border/60 gap-8 mb-8">
            <button
              onClick={() => setActiveTab("staff")}
              className={`pb-4 text-lg font-black tracking-tight border-b-2 transition-all ${
                activeTab === "staff"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Staff Members
            </button>
            <button
              onClick={() => setActiveTab("orders")}
              className={`pb-4 text-lg font-black tracking-tight border-b-2 transition-all flex items-center gap-2 ${
                activeTab === "orders"
                  ? "border-primary text-foreground"
                  : "border-transparent text-muted-foreground hover:text-foreground"
              }`}
            >
              Customer Orders
              {pendingOrdersCount > 0 && (
                <Badge className="bg-primary text-primary-foreground text-xs font-bold rounded-full px-2 py-0.5 animate-pulse">
                  {pendingOrdersCount}
                </Badge>
              )}
            </button>
          </div>
        )}

        {activeTab === "staff" && currentUser?.role !== "loader" ? (
          <>
            {/* Search and Filter */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6 animate-fade-in-up stagger-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search staff by name or phone..."
                  className="pl-12 h-12 rounded-2xl bg-secondary/50"
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                />
              </div>
              <div className="flex gap-2">
                {[
                  { value: "all", label: "All" },
                  { value: "owner", label: "Owner" },
                  { value: "manager", label: "Manager" },
                  { value: "loader", label: "Loader" }
                ].map((filter) => (
                  <Button
                    key={filter.value}
                    variant={filterRole === filter.value ? "default" : "secondary"}
                    onClick={() => setFilterRole(filter.value)}
                    className="rounded-full h-12 px-5 font-medium"
                  >
                    {filter.label}
                  </Button>
                ))}
              </div>
            </div>

            {/* Staff Table */}
            <Card className="rounded-3xl border-border/50 overflow-hidden animate-fade-in-up stagger-7">
              <CardContent className="p-0">
                <Table>
                  <TableHeader>
                    <TableRow className="bg-secondary/50 hover:bg-secondary/50">
                      <TableHead className="font-bold py-5 pl-6">Staff Member</TableHead>
                      <TableHead className="font-bold">Role</TableHead>
                      <TableHead className="font-bold">Department</TableHead>
                      <TableHead className="font-bold">Phone</TableHead>
                      <TableHead className="font-bold">Salary</TableHead>
                      {showMoney && (
                        <>
                          <TableHead className="font-bold text-right whitespace-nowrap">Advance</TableHead>
                          <TableHead className="font-bold text-right whitespace-nowrap">Held</TableHead>
                        </>
                      )}
                      <TableHead className="font-bold">Status</TableHead>
                      <TableHead className="font-bold pr-6 text-right">Actions</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {filteredStaff.map((staff, index) => {
                      const config = roleConfig[staff.role]
                      const RoleIcon = config.icon
                      
                      return (
                        <TableRow 
                          key={staff.id} 
                          className={`hover:bg-secondary/30 transition-colors duration-200 animate-fade-in-up`}
                          style={{ animationDelay: `${index * 0.05}s` }}
                        >
                          <TableCell className="py-5 pl-6">
                            <div className="flex items-center gap-4">
                              <div className={`h-12 w-12 rounded-2xl flex items-center justify-center ${config.bgColor}`}>
                                <RoleIcon className={`h-5 w-5 ${config.color}`} />
                              </div>
                              <div>
                                <p className="font-bold text-foreground">{staff.name}</p>
                                <p className="text-sm text-muted-foreground">{staff.nameUrdu}</p>
                              </div>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge className={`${config.bgColor} ${config.color} border font-medium rounded-full px-3`}>
                              {config.label}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Building2 className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{staff.department}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <Phone className="h-4 w-4 text-muted-foreground" />
                              <span className="text-sm">{staff.phone}</span>
                            </div>
                          </TableCell>
                          <TableCell>
                            {staff.role === "owner" ? (
                              <span className="text-sm text-muted-foreground">-</span>
                            ) : (
                              <span className="font-semibold">Rs. {staff.salary.toLocaleString()}</span>
                            )}
                          </TableCell>
                          {showMoney && (
                            <>
                              <TableCell className="text-right text-sm tabular-nums">
                                Rs. {(staffMoney[staff.id]?.advanceFromShop ?? 0).toLocaleString()}
                              </TableCell>
                              <TableCell className="text-right text-sm tabular-nums text-accent">
                                Rs. {(staffMoney[staff.id]?.heldForStaff ?? 0).toLocaleString()}
                              </TableCell>
                            </>
                          )}
                          <TableCell>
                            <Badge 
                              variant={staff.status === "active" ? "default" : "secondary"}
                              className={`rounded-full font-medium ${
                                staff.status === "active" 
                                  ? "bg-emerald-500/10 text-emerald-600 border-emerald-500/20" 
                                  : "bg-red-500/10 text-red-600 border-red-500/20"
                              }`}
                            >
                              {staff.status === "active" ? "Active" : "Inactive"}
                            </Badge>
                          </TableCell>
                          <TableCell className="pr-6 text-right">
                            <div className="flex items-center justify-end gap-2">
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary">
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button variant="ghost" size="icon" className="h-10 w-10 rounded-xl hover:bg-secondary">
                                <Edit2 className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </CardContent>
            </Card>

            {/* Department Summary */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mt-10">
              {/* Management Team */}
              <Card className="rounded-3xl border-border/50 animate-fade-in-up stagger-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-blue-500/10 flex items-center justify-center">
                      <UserCog className="h-6 w-6 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Management Team</CardTitle>
                      <p className="text-sm text-muted-foreground">Owner & Manager</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {staffList.filter(s => s.role === "owner" || s.role === "manager").map((staff) => {
                    const config = roleConfig[staff.role]
                    return (
                      <div key={staff.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
                        <div className="flex items-center gap-3">
                          <div className={`h-10 w-10 rounded-xl flex items-center justify-center ${config.bgColor}`}>
                            <config.icon className={`h-5 w-5 ${config.color}`} />
                          </div>
                          <div>
                            <p className="font-semibold text-foreground">{staff.name}</p>
                            <p className="text-xs text-muted-foreground">{config.label}</p>
                          </div>
                        </div>
                        <Badge className="rounded-full bg-emerald-500/10 text-emerald-600 border-emerald-500/20">
                          <Lock className="h-3 w-3 mr-1" />
                          Ledger Access
                        </Badge>
                      </div>
                    )
                  })}
                </CardContent>
              </Card>

              {/* Load/Unload Department */}
              <Card className="rounded-3xl border-border/50 animate-fade-in-up stagger-8">
                <CardHeader className="pb-4">
                  <div className="flex items-center gap-3">
                    <div className="h-12 w-12 rounded-2xl bg-emerald-500/10 flex items-center justify-center">
                      <Truck className="h-6 w-6 text-emerald-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold">Load/Unload Department</CardTitle>
                      <p className="text-sm text-muted-foreground">{loaderCount} Workers</p>
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  {staffList.filter(s => s.role === "loader").map((staff) => (
                    <div key={staff.id} className="flex items-center justify-between p-4 rounded-2xl bg-secondary/50 hover:bg-secondary transition-colors">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-emerald-500/10 flex items-center justify-center">
                          <Truck className="h-5 w-5 text-emerald-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-foreground">{staff.name}</p>
                          <p className="text-xs text-muted-foreground">{staff.phone}</p>
                        </div>
                      </div>
                      <span className="text-sm font-semibold">Rs. {staff.salary.toLocaleString()}</span>
                    </div>
                  ))}
                </CardContent>
              </Card>
            </div>
          </>
        ) : (
          <div className="space-y-6 animate-fade-in-up">
            {/* Orders Filters */}
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="relative flex-1">
                <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                <Input
                  type="text"
                  placeholder="Search orders by customer name, phone, code..."
                  className="pl-12 h-12 rounded-2xl bg-secondary/50"
                  value={orderSearch}
                  onChange={(e) => setOrderSearch(e.target.value)}
                />
              </div>
              <div className="flex gap-2 flex-wrap">
                {[
                  { value: "all", label: "All" },
                  { value: "pending", label: "Pending" },
                  { value: "approved", label: "Approved" },
                  { value: "shipped", label: "Shipped" },
                  { value: "delivered", label: "Delivered" },
                  { value: "cancelled", label: "Cancelled" },
                ].map((s) => (
                  <Button
                    key={s.value}
                    variant={ordersFilterStatus === s.value ? "default" : "secondary"}
                    onClick={() => setOrdersFilterStatus(s.value)}
                    className="rounded-full h-12 px-4 text-xs font-semibold"
                  >
                    {s.label}
                  </Button>
                ))}
              </div>
            </div>

            {ordersLoading ? (
              <div className="text-center py-12">
                <p className="text-muted-foreground">Loading database orders...</p>
              </div>
            ) : filteredOrders.length === 0 ? (
              <Card className="rounded-3xl border border-dashed py-16 text-center bg-secondary/10">
                <CardContent>
                  <ShoppingCart className="mx-auto mb-4 h-12 w-12 text-muted-foreground/35" />
                  <p className="font-bold text-foreground text-lg">No orders found</p>
                </CardContent>
              </Card>
            ) : (
              <div className="grid gap-6">
                {filteredOrders.map((order) => (
                  <Card key={order.id} className="rounded-3xl border border-border/50 overflow-hidden bg-card shadow-sm">
                    <CardHeader className="bg-secondary/25 p-5 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-3 border-b">
                      <div>
                        <div className="flex items-center gap-2 flex-wrap">
                          <span className="font-mono font-bold text-sm text-primary">{order.trackingCode}</span>
                          <Badge className={`rounded-full px-2.5 py-0.5 text-xs font-bold border uppercase ${
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
                          {order.customerName} — {order.customerPhone || "No Phone"}
                        </p>
                        <p className="text-xs text-muted-foreground mt-0.5">
                          {order.customerAddress || "No Address"}
                        </p>
                      </div>

                      <div className="text-left sm:text-right">
                        <p className="text-xs text-muted-foreground uppercase font-bold tracking-wider">Total Value</p>
                        <p className="text-xl font-black text-foreground">Rs. {order.total.toLocaleString()}</p>
                        <Badge variant="outline" className="mt-1 rounded-full text-[10px] uppercase font-bold">
                          {order.paymentMethod}
                        </Badge>
                      </div>
                    </CardHeader>

                    <CardContent className="p-5 space-y-4">
                      {/* Payment Proof details */}
                      {(order.transactionId || order.paymentScreenshot) && (
                        <div className="p-3 bg-secondary/35 rounded-2xl border text-sm flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                          <div className="space-y-0.5">
                            <p className="font-bold text-xs text-muted-foreground uppercase">Payment Details</p>
                            {order.transactionId && (
                              <p>Transaction ID: <code className="bg-background px-1.5 py-0.5 rounded border text-xs font-mono font-bold">{order.transactionId}</code></p>
                            )}
                          </div>
                          {order.paymentScreenshot && (
                            <Button
                              variant="outline"
                              size="sm"
                              className="h-8 gap-1.5 rounded-lg text-xs"
                              onClick={() => setSelectedOrderScreenshot(order.paymentScreenshot)}
                            >
                              <Eye className="h-3.5 w-3.5" />
                              View Payment Screenshot
                            </Button>
                          )}
                        </div>
                      )}

                      {/* Items */}
                      <div>
                        <p className="font-bold text-xs text-muted-foreground uppercase mb-1.5">Items Ordered</p>
                        <ul className="divide-y border rounded-2xl overflow-hidden bg-background text-sm">
                          {order.items.map((it: any) => (
                            <li key={it.productId} className="p-3 flex justify-between">
                              <span className="font-bold">{it.name}</span>
                              <span className="text-muted-foreground">{it.quantity} bags @ Rs. {it.unitPrice.toLocaleString()}</span>
                              <span className="font-black">Rs. {it.lineTotal.toLocaleString()}</span>
                            </li>
                          ))}
                        </ul>
                      </div>

                      {/* Actions */}
                      <div className="flex justify-end gap-2 pt-2 border-t">
                        {order.status === "pending" && (
                          <>
                            <Button
                              size="sm"
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold px-4"
                              onClick={() => handleOrderAction(order.id, "approve")}
                            >
                              Approve Order
                            </Button>
                            <Button
                              size="sm"
                              variant="destructive"
                              className="rounded-full font-bold px-4"
                              onClick={() => handleOrderAction(order.id, "cancel")}
                            >
                              Reject & Cancel
                            </Button>
                          </>
                        )}
                        {order.status === "approved" && (
                          <>
                            <Button
                              size="sm"
                              className="rounded-full bg-purple-600 hover:bg-purple-700 font-bold px-4"
                              onClick={() => handleOrderAction(order.id, "ship")}
                            >
                              Mark as Shipped
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full font-bold px-4 text-destructive border-destructive/30 hover:bg-destructive/5"
                              onClick={() => handleOrderAction(order.id, "cancel")}
                            >
                              Cancel Order
                            </Button>
                          </>
                        )}
                        {order.status === "shipped" && (
                          <>
                            <Button
                              size="sm"
                              className="rounded-full bg-emerald-600 hover:bg-emerald-700 font-bold px-4"
                              onClick={() => handleOrderAction(order.id, "deliver")}
                            >
                              Mark as Delivered
                            </Button>
                            <Button
                              size="sm"
                              variant="outline"
                              className="rounded-full font-bold px-4 text-destructive border-destructive/30 hover:bg-destructive/5"
                              onClick={() => handleOrderAction(order.id, "cancel")}
                            >
                              Cancel Order
                            </Button>
                          </>
                        )}
                        {(order.status === "delivered" || order.status === "cancelled") && (
                          <span className="text-xs text-muted-foreground font-semibold flex items-center gap-1.5">
                            {order.status === "delivered" ? (
                              <CheckCircle2 className="h-4 w-4 text-emerald-600" />
                            ) : (
                              <XCircle className="h-4 w-4 text-red-600" />
                            )}
                            Order processing complete
                          </span>
                        )}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
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
                {/* eslint-disable-next-line @next/next/no-img-element */}
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

      {/* Footer */}
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
    </div>
  )
}

export default function StaffPage() {
  return <StaffContent />
}
