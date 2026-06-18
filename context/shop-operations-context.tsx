"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react"
import { seedSuppliers, staffMembers, type CartItem, type Supplier } from "@/lib/data"

const STORAGE_KEY = "goraya-shop-operations-v1"

export type CodOrderStatus = "pending" | "delivered" | "cancelled"

export interface CodOrderLine {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  lineTotal: number
}

export interface CodOrder {
  id: string
  createdAt: string
  customerName: string
  customerPhone: string
  customerAddress: string
  items: CodOrderLine[]
  total: number
  paymentMethod: "cod"
  status: CodOrderStatus
}

export type StaffLedgerEntryType = "salary" | "payment_taken"

export interface StaffLedgerEntry {
  id: string
  staffId: string
  staffName: string
  date: string
  type: StaffLedgerEntryType
  description: string
  amount: number
  /** Running balance: positive = shop owes staff */
  balance: number
}

export type SupplierLedgerEntryType = "purchase" | "payment"

export interface SupplierLedgerEntry {
  id: string
  supplierId: string
  supplierName: string
  date: string
  type: SupplierLedgerEntryType
  description: string
  amount: number
  /** Running balance: positive = amount payable to supplier */
  balance: number
}

type PersistedState = {
  orders: CodOrder[]
  staffLedger: StaffLedgerEntry[]
  supplierLedger: SupplierLedgerEntry[]
  suppliers: Supplier[]
}

function staffNameById(id: string): string {
  return staffMembers.find((s) => s.id === id)?.name ?? id
}

function lastStaffBalance(entries: StaffLedgerEntry[], staffId: string): number {
  const forStaff = entries.filter((e) => e.staffId === staffId)
  return forStaff.length ? forStaff[forStaff.length - 1].balance : 0
}

function lastSupplierBalance(entries: SupplierLedgerEntry[], supplierId: string): number {
  const forSup = entries.filter((e) => e.supplierId === supplierId)
  return forSup.length ? forSup[forSup.length - 1].balance : 0
}

const seedSupplierLedger: SupplierLedgerEntry[] = [
  {
    id: "sl-seed-1",
    supplierId: "sup-1",
    supplierName: "FFC Ltd",
    date: "2024-03-10",
    type: "purchase",
    description: "DAP stock inward — 100 bags @ distributor rate",
    amount: 1_150_000,
    balance: 1_150_000,
  },
  {
    id: "sl-seed-2",
    supplierId: "sup-1",
    supplierName: "FFC Ltd",
    date: "2024-03-12",
    type: "payment",
    description: "Bank transfer to supplier",
    amount: 600_000,
    balance: 550_000,
  },
  {
    id: "sl-seed-3",
    supplierId: "sup-2",
    supplierName: "Fatima Fertilizer",
    date: "2024-03-18",
    type: "purchase",
    description: "Urea shipment — 200 bags",
    amount: 620_000,
    balance: 620_000,
  },
]

function readPersisted(): Partial<PersistedState> | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw) as PersistedState
    if (!p || typeof p !== "object") return null
    return p
  } catch {
    return null
  }
}

interface ShopOperationsContextType {
  codOrders: any[]
  staffLedger: StaffLedgerEntry[]
  supplierLedger: SupplierLedgerEntry[]
  suppliers: Supplier[]
  hydrated: boolean
  placeCodOrder: (input: {
    items: CartItem[]
    customerName: string
    customerPhone: string
    customerAddress: string
    paymentMethod?: string
    paymentScreenshot?: string | null
    transactionId?: string | null
  }) => Promise<{ ok: true; order: any } | { ok: false; error: string }>
  addStaffSalaryEntry: (staffId: string, date: string, amount: number, description?: string) => void
  addStaffPaymentTaken: (staffId: string, date: string, amount: number, description?: string) => void
  addSupplierPurchase: (supplierId: string, date: string, amount: number, description: string) => void
  addSupplierPayment: (supplierId: string, date: string, amount: number, description: string) => void
  addSupplier: (name: string, phone: string) => void
  supplierSummaries: {
    supplierId: string
    name: string
    totalPurchases: number
    totalPayments: number
    payable: number
  }[]
  pendingCodTotal: number
  refreshOrders: () => Promise<void>
}

const ShopOperationsContext = createContext<ShopOperationsContextType | undefined>(undefined)

export function ShopOperationsProvider({ children }: { children: ReactNode }) {
  const [codOrders, setCodOrders] = useState<any[]>([])
  const [staffLedger, setStaffLedger] = useState<StaffLedgerEntry[]>([])
  const [supplierLedger, setSupplierLedger] = useState<SupplierLedgerEntry[]>(seedSupplierLedger)
  const [suppliers, setSuppliers] = useState<Supplier[]>(seedSuppliers)
  const [hydrated, setHydrated] = useState(false)

  const refreshOrders = useCallback(async () => {
    try {
      const res = await fetch("/api/orders")
      if (res.ok) {
        const data = await res.json()
        if (Array.isArray(data)) {
          setCodOrders(data)
        }
      }
    } catch (err) {
      console.warn("Failed to fetch orders from database:", err)
    }
  }, [])

  // Sync from DB, fallback to localStorage
  useEffect(() => {
    async function loadInitialData() {
      await refreshOrders()
      
      try {
        const res = await fetch("/api/ledger")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setStaffLedger(data.filter(e => e.bookId === "staff"))
            setSupplierLedger(data.filter(e => e.bookId === "purchases"))
          }
        }
      } catch (err) {
        console.warn("Failed to fetch ledgers from database:", err)
      }

      const p = readPersisted()
      if (p?.orders && p.orders.length > 0 && codOrders.length === 0) setCodOrders(p.orders)
      if (p?.staffLedger && Array.isArray(p.staffLedger) && staffLedger.length === 0) setStaffLedger(p.staffLedger)
      if (Array.isArray(p?.supplierLedger) && p.supplierLedger.length > 0) {
        setSupplierLedger(p.supplierLedger)
      }
      if (p?.suppliers && Array.isArray(p.suppliers) && p.suppliers.length > 0) {
        const merged = [...seedSuppliers]
        for (const s of p.suppliers) {
          if (!merged.some((m) => m.id === s.id)) merged.push(s)
        }
        setSuppliers(merged)
      }
      setHydrated(true)
    }
    loadInitialData()
  }, [refreshOrders])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    try {
      const payload: PersistedState = {
        orders: codOrders,
        staffLedger,
        supplierLedger,
        suppliers,
      }
      localStorage.setItem(STORAGE_KEY, JSON.stringify(payload))
    } catch {
      /* ignore */
    }
  }, [codOrders, staffLedger, supplierLedger, suppliers, hydrated])

  const placeCodOrder = useCallback(
    async (input: {
      items: CartItem[]
      customerName: string
      customerPhone: string
      customerAddress: string
      paymentMethod?: string
      paymentScreenshot?: string | null
      transactionId?: string | null
    }): Promise<{ ok: true; order: any } | { ok: false; error: string }> => {
      if (!input.items.length) return { ok: false, error: "Cart is empty" }
      const name = input.customerName.trim()
      if (!name) return { ok: false, error: "Customer name is required" }

      const lines = input.items.map((row) => ({
        productId: row.product.id,
        name: row.product.name,
        quantity: row.quantity,
        unitPrice: row.product.price,
        lineTotal: row.product.price * row.quantity,
      }))
      const total = lines.reduce((s, l) => s + l.lineTotal, 0)
      
      const payload = {
        customerName: name,
        customerPhone: input.customerPhone.trim(),
        customerAddress: input.customerAddress.trim(),
        items: lines,
        total,
        paymentMethod: input.paymentMethod || "cod",
        paymentScreenshot: input.paymentScreenshot || null,
        transactionId: input.transactionId || null,
      }

      try {
        const res = await fetch("/api/orders", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify(payload),
        })
        if (res.ok) {
          const data = await res.json()
          if (data.ok && data.order) {
            setCodOrders((prev) => [data.order, ...prev])
            return { ok: true, order: data.order }
          }
        }
      } catch (err) {
        console.error("Failed to place order in database, saving locally:", err)
      }

      // Local fallback
      const order = {
        id: `cod-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
        createdAt: new Date().toISOString(),
        customerName: name,
        customerPhone: input.customerPhone.trim(),
        customerAddress: input.customerAddress.trim(),
        items: lines,
        total,
        paymentMethod: (input.paymentMethod || "cod") as any,
        status: "pending" as any,
        trackingCode: `GT-${Math.floor(100000 + Math.random() * 900000)}`,
        paymentScreenshot: input.paymentScreenshot || null,
        transactionId: input.transactionId || null,
      }
      setCodOrders((prev) => [order, ...prev])
      return { ok: true, order }
    },
    []
  )

  const appendStaffEntry = useCallback(
    (staffId: string, type: StaffLedgerEntryType, date: string, amount: number, description: string) => {
      const amt = Math.max(0, Number(amount) || 0)
      if (!amt) return
      const staffName = staffNameById(staffId)
      setStaffLedger((prev) => {
        const prevBal = lastStaffBalance(prev, staffId)
        const delta = type === "salary" ? amt : -amt
        const balance = prevBal + delta
        const id = `st-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        return [...prev, { id, staffId, staffName, date, type, description, amount: amt, balance }]
      })
    },
    []
  )

  const addStaffSalaryEntry = useCallback(
    (staffId: string, date: string, amount: number, description?: string) => {
      appendStaffEntry(
        staffId,
        "salary",
        date,
        amount,
        description?.trim() || "Salary / accrual recorded"
      )
    },
    [appendStaffEntry]
  )

  const addStaffPaymentTaken = useCallback(
    (staffId: string, date: string, amount: number, description?: string) => {
      appendStaffEntry(
        staffId,
        "payment_taken",
        date,
        amount,
        description?.trim() || "Cash paid to staff / withdrawal"
      )
    },
    [appendStaffEntry]
  )

  const appendSupplierEntry = useCallback(
    (supplierId: string, type: SupplierLedgerEntryType, date: string, amount: number, description: string) => {
      const amt = Math.max(0, Number(amount) || 0)
      if (!amt) return
      const supplierName = suppliers.find((s) => s.id === supplierId)?.name ?? supplierId
      setSupplierLedger((prev) => {
        const prevBal = lastSupplierBalance(prev, supplierId)
        const delta = type === "purchase" ? amt : -amt
        const balance = Math.max(0, prevBal + delta)
        const id = `su-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
        return [...prev, { id, supplierId, supplierName, date, type, description, amount: amt, balance }]
      })
    },
    [suppliers]
  )

  const addSupplierPurchase = useCallback(
    (supplierId: string, date: string, amount: number, description: string) => {
      appendSupplierEntry(supplierId, "purchase", date, amount, description.trim() || "Purchase / order")
    },
    [appendSupplierEntry]
  )

  const addSupplierPayment = useCallback(
    (supplierId: string, date: string, amount: number, description: string) => {
      appendSupplierEntry(supplierId, "payment", date, amount, description.trim() || "Payment to supplier")
    },
    [appendSupplierEntry]
  )

  const addSupplier = useCallback((name: string, phone: string) => {
    const n = name.trim()
    if (!n) return
    const id = `sup-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    setSuppliers((prev) => [...prev, { id, name: n, phone: phone.trim() || "—" }])
  }, [])

  const supplierSummaries = useMemo(() => {
    return suppliers.map((s) => {
      const rows = supplierLedger.filter((e) => e.supplierId === s.id)
      const totalPurchases = rows.filter((r) => r.type === "purchase").reduce((a, r) => a + r.amount, 0)
      const totalPayments = rows.filter((r) => r.type === "payment").reduce((a, r) => a + r.amount, 0)
      const last = rows.length ? rows[rows.length - 1].balance : 0
      return {
        supplierId: s.id,
        name: s.name,
        totalPurchases,
        totalPayments,
        payable: last,
      }
    })
  }, [suppliers, supplierLedger])

  const pendingCodTotal = useMemo(
    () => codOrders.filter((o) => o.status === "pending").reduce((s, o) => s + o.total, 0),
    [codOrders]
  )

  return (
    <ShopOperationsContext.Provider
      value={{
        codOrders,
        staffLedger,
        supplierLedger,
        suppliers,
        hydrated,
        placeCodOrder,
        addStaffSalaryEntry,
        addStaffPaymentTaken,
        addSupplierPurchase,
        addSupplierPayment,
        addSupplier,
        supplierSummaries,
        pendingCodTotal,
        refreshOrders,
      }}
    >
      {children}
    </ShopOperationsContext.Provider>
  )
}

export function useShopOperations() {
  const ctx = useContext(ShopOperationsContext)
  if (!ctx) throw new Error("useShopOperations must be used within ShopOperationsProvider")
  return ctx
}
