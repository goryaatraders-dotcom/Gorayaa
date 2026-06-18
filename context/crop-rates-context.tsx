"use client"

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useState,
  type ReactNode,
} from "react"
import { seedCropRates, type CropRate } from "@/lib/data"

const STORAGE_KEY = "goraya-traders-crop-rates-v1"

function readStoredCropRates(): CropRate[] | null {
  if (typeof window === "undefined") return null
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed = JSON.parse(raw) as CropRate[]
    if (!Array.isArray(parsed) || parsed.length === 0) return null
    return parsed
  } catch {
    return null
  }
}

interface CropRatesContextType {
  cropRates: CropRate[]
  addCropRate: (rate: Omit<CropRate, "id">) => void
  updateCropRate: (id: string, updateData: Partial<Omit<CropRate, "id">>) => void
  deleteCropRate: (id: string) => void
  hydrated: boolean
}

const CropRatesContext = createContext<CropRatesContextType | undefined>(undefined)

export function CropRatesProvider({ children }: { children: ReactNode }) {
  const [cropRates, setCropRates] = useState<CropRate[]>(seedCropRates)
  const [hydrated, setHydrated] = useState(false)

  // Fetch from MongoDB, auto-seed if empty, fallback to localStorage
  useEffect(() => {
    async function initCropRates() {
      try {
        let res = await fetch("/api/crop-rates")
        if (res.ok) {
          let data = await res.json()
          if (Array.isArray(data) && data.length > 0) {
            setCropRates(data.map((cr: any) => ({
              ...cr,
              id: cr.id || cr._id?.toString?.() || String(cr._id),
            })))
            setHydrated(true)
            return
          }
        }
      } catch (err) {
        console.warn("Failed to fetch crop rates from db, falling back to storage:", err)
      }
      
      const stored = readStoredCropRates()
      if (stored) setCropRates(stored)
      else setCropRates(seedCropRates)
      setHydrated(true)
    }
    
    initCropRates()
  }, [])

  // Save local fallback to localStorage
  useEffect(() => {
    if (!hydrated || typeof window === "undefined") return
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(cropRates))
    } catch {
      /* ignore quota */
    }
  }, [cropRates, hydrated])

  const addCropRate = useCallback(async (input: Omit<CropRate, "id">) => {
    const id = `crop-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    try {
      const res = await fetch("/api/crop-rates", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(input),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok && data.cropRate) {
          setCropRates((prev) => [...prev, data.cropRate])
          return
        }
      }
    } catch (err) {
      console.error("Failed to add crop rate to database, saving locally:", err)
    }

    // Local Fallback
    setCropRates((prev) => [...prev, { ...input, id }])
  }, [])

  const updateCropRate = useCallback(async (id: string, updateData: Partial<Omit<CropRate, "id">>) => {
    try {
      const res = await fetch("/api/crop-rates", {
        method: "PUT",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ id, ...updateData }),
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          setCropRates((prev) =>
            prev.map((cr) => (cr.id === id ? { ...cr, ...updateData, updatedAt: new Date().toISOString() } : cr))
          )
          return
        }
      }
    } catch (err) {
      console.error("Failed to update crop rate on database, updating locally:", err)
    }

    // Local Fallback
    setCropRates((prev) =>
      prev.map((cr) => (cr.id === id ? { ...cr, ...updateData, updatedAt: new Date().toISOString() } : cr))
    )
  }, [])

  const deleteCropRate = useCallback(async (id: string) => {
    try {
      const res = await fetch(`/api/crop-rates?id=${id}`, {
        method: "DELETE",
      })
      if (res.ok) {
        const data = await res.json()
        if (data.ok) {
          setCropRates((prev) => prev.filter((cr) => cr.id !== id))
          return
        }
      }
    } catch (err) {
      console.error("Failed to delete crop rate on database, deleting locally:", err)
    }

    // Local Fallback
    setCropRates((prev) => prev.filter((cr) => cr.id !== id))
  }, [])

  return (
    <CropRatesContext.Provider
      value={{
        cropRates,
        addCropRate,
        updateCropRate,
        deleteCropRate,
        hydrated,
      }}
    >
      {children}
    </CropRatesContext.Provider>
  )
}

export function useCropRates() {
  const ctx = useContext(CropRatesContext)
  if (ctx === undefined) {
    throw new Error("useCropRates must be used within a CropRatesProvider")
  }
  return ctx
}
