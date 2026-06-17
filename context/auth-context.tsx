"use client"

import { createContext, useContext, useState, useEffect, ReactNode } from "react"
import { STAFF_PORTAL_PASSWORD } from "@/lib/auth-constants"
import type { StaffMember, StaffPermissions, Customer } from "@/lib/data"
import { rolePermissions, staffMembers, customers } from "@/lib/data"

export type LoginResult = { ok: true } | { ok: false; message: string }

interface AuthContextType {
  currentUser: StaffMember | null
  currentCustomer: Customer | null
  isAuthenticated: boolean
  isCustomerAuthenticated: boolean
  login: (staffId: string, password: string) => LoginResult
  loginCustomer: (phone: string, nameOrPassword: string) => Promise<LoginResult>
  logout: () => void
  logoutCustomer: () => void
  hasPermission: (permission: keyof StaffPermissions) => boolean
  permissions: StaffPermissions | null
}

const AuthContext = createContext<AuthContextType | undefined>(undefined)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [currentUser, setCurrentUser] = useState<StaffMember | null>(null)
  const [currentCustomer, setCurrentCustomer] = useState<Customer | null>(null)
  const [staffList, setStaffList] = useState<any[]>(staffMembers)

  useEffect(() => {
    async function loadStaff() {
      try {
        const res = await fetch("/api/staff")
        if (res.ok) {
          const data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setStaffList(data)
          }
        }
      } catch (err) {
        console.warn("Failed to fetch staff from database, using local data:", err)
      }
    }
    loadStaff()
  }, [])

  const login = (staffId: string, password: string): LoginResult => {
    const staff = staffList.find((s) => s.id === staffId)
    if (!staff || staff.status !== "active") {
      return { ok: false, message: "Select a valid staff account." }
    }
    const requiredPassword = staff.password || STAFF_PORTAL_PASSWORD
    if (password !== requiredPassword) {
      return { ok: false, message: "Wrong password." }
    }
    setCurrentUser(staff)
    return { ok: true }
  }

  const loginCustomer = async (phone: string, nameOrPassword: string): Promise<LoginResult> => {
    try {
      const res = await fetch("/api/customers")
      if (res.ok) {
        const customersData: any[] = await res.json()
        const found = customersData.find(
          c => c.phone === phone || 
          c.phone.replace(/[^0-9]/g, "") === phone.replace(/[^0-9]/g, "")
        )
        if (!found) {
          return { ok: false, message: "Customer account not found." }
        }
        const checkPass = found.password || "1234"
        if (nameOrPassword !== checkPass) {
          return { ok: false, message: "Wrong password." }
        }
        setCurrentCustomer(found)
        return { ok: true }
      }
      return { ok: false, message: "Could not contact server to authenticate." }
    } catch (err) {
      // Local fallback
      const found = customers.find(
        c => c.phone === phone || 
        c.phone.replace(/[^0-9]/g, "") === phone.replace(/[^0-9]/g, "")
      )
      if (found) {
        if (nameOrPassword !== "1234") {
          return { ok: false, message: "Wrong password (default: 1234)." }
        }
        setCurrentCustomer({ ...found, password: "1234" } as any)
        return { ok: true }
      }
      return { ok: false, message: "Authentication failed. Local backup customer not found." }
    }
  }

  const logoutCustomer = () => {
    setCurrentCustomer(null)
  }

  const logout = () => {
    setCurrentUser(null)
  }

  const hasPermission = (permission: keyof StaffPermissions): boolean => {
    if (!currentUser) return false
    return rolePermissions[currentUser.role][permission]
  }

  const permissions = currentUser ? rolePermissions[currentUser.role] : null

  return (
    <AuthContext.Provider value={{
      currentUser,
      currentCustomer,
      isAuthenticated: !!currentUser,
      isCustomerAuthenticated: !!currentCustomer,
      login,
      loginCustomer,
      logout,
      logoutCustomer,
      hasPermission,
      permissions
    }}>
      {children}
    </AuthContext.Provider>
  )
}

export function useAuth() {
  const context = useContext(AuthContext)
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider")
  }
  return context
}
