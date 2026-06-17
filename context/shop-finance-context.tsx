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
import {
  seedShopExpenses,
  staffMembers,
  type ShopExpense,
} from "@/lib/data"

const STORAGE_EXP = "goraya-shop-expenses-v1"
const STORAGE_STAFF = "goraya-staff-money-v1"

export interface StaffMoneyBalance {
  staffId: string
  /** PKR given to staff as advance from shop (typically recovered from salary) */
  advanceFromShop: number
  /** PKR the shop is holding for this staff member (owed to them) */
  heldForStaff: number
}

type StaffMoneyMap = Record<string, StaffMoneyBalance>

function initialStaffMoney(): StaffMoneyMap {
  return Object.fromEntries(
    staffMembers.map((s) => [
      s.id,
      { staffId: s.id, advanceFromShop: 0, heldForStaff: 0 },
    ])
  )
}

function readExpenses(): ShopExpense[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_EXP)
    if (raw === null) return null
    const p = JSON.parse(raw) as ShopExpense[]
    return Array.isArray(p) ? p : null
  } catch {
    return null
  }
}

function readStaffMoney(): StaffMoneyMap | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_STAFF)
    if (!raw) return null
    const p = JSON.parse(raw) as StaffMoneyMap
    if (!p || typeof p !== "object") return null
    return p
  } catch {
    return null
  }
}

function mergeStaffMoney(stored: StaffMoneyMap | null): StaffMoneyMap {
  const base = initialStaffMoney()
  if (!stored) return base
  for (const id of Object.keys(base)) {
    if (stored[id]) {
      base[id] = {
        staffId: id,
        advanceFromShop: Math.max(0, Number(stored[id].advanceFromShop) || 0),
        heldForStaff: Math.max(0, Number(stored[id].heldForStaff) || 0),
      }
    }
  }
  return base
}

interface ShopFinanceContextType {
  expenses: ShopExpense[]
  staffMoney: StaffMoneyMap
  addExpense: (e: Omit<ShopExpense, "id">) => void
  setStaffBalance: (staffId: string, patch: Partial<Pick<StaffMoneyBalance, "advanceFromShop" | "heldForStaff">>) => void
  expenseTotal: number
  hydrated: boolean
}

const ShopFinanceContext = createContext<ShopFinanceContextType | undefined>(undefined)

export function ShopFinanceProvider({ children }: { children: ReactNode }) {
  const [expenses, setExpenses] = useState<ShopExpense[]>(seedShopExpenses)
  const [staffMoney, setStaffMoney] = useState<StaffMoneyMap>(() => initialStaffMoney())
  const [hydrated, setHydrated] = useState(false)

  useEffect(() => {
    const ex = readExpenses()
    if (ex !== null) setExpenses(ex)
    const sm = readStaffMoney()
    setStaffMoney(mergeStaffMoney(sm))
    setHydrated(true)
  }, [])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_EXP, JSON.stringify(expenses))
    } catch {
      /* ignore */
    }
  }, [expenses, hydrated])

  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_STAFF, JSON.stringify(staffMoney))
    } catch {
      /* ignore */
    }
  }, [staffMoney, hydrated])

  const addExpense = useCallback((row: Omit<ShopExpense, "id">) => {
    const id = `exp-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    setExpenses((prev) => [{ ...row, id }, ...prev])
  }, [])

  const setStaffBalance = useCallback(
    (staffId: string, patch: Partial<Pick<StaffMoneyBalance, "advanceFromShop" | "heldForStaff">>) => {
      setStaffMoney((prev) => {
        const cur = prev[staffId] ?? { staffId, advanceFromShop: 0, heldForStaff: 0 }
        return {
          ...prev,
          [staffId]: {
            ...cur,
            ...patch,
            advanceFromShop:
              patch.advanceFromShop !== undefined
                ? Math.max(0, patch.advanceFromShop)
                : cur.advanceFromShop,
            heldForStaff:
              patch.heldForStaff !== undefined ? Math.max(0, patch.heldForStaff) : cur.heldForStaff,
          },
        }
      })
    },
    []
  )

  const expenseTotal = useMemo(() => expenses.reduce((s, e) => s + e.amount, 0), [expenses])

  return (
    <ShopFinanceContext.Provider
      value={{ expenses, staffMoney, addExpense, setStaffBalance, expenseTotal, hydrated }}
    >
      {children}
    </ShopFinanceContext.Provider>
  )
}

export function useShopFinance() {
  const ctx = useContext(ShopFinanceContext)
  if (!ctx) throw new Error("useShopFinance must be used within ShopFinanceProvider")
  return ctx
}
