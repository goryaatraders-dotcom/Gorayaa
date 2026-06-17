// Product Data
export interface Product {
  id: string
  name: string
  nameUrdu: string
  category: string
  price: number
  unit: string
  stock: number
  description: string
  image: string
}

/** Default catalog — merged with client-added products via ProductsProvider */
export const seedProducts: Product[] = [
  {
    id: "1",
    name: "DAP Fertilizer",
    nameUrdu: "ڈی اے پی",
    category: "Phosphate",
    price: 12500,
    unit: "50kg Bag",
    stock: 150,
    description: "Di-ammonium Phosphate - Best for crop growth and root development",
    image: "https://images.unsplash.com/photo-1574323347407-f5fdd43100a3?w=600&h=450&fit=crop&q=80"
  },
  {
    id: "2",
    name: "Urea",
    nameUrdu: "یوریا",
    category: "Nitrogen",
    price: 3200,
    unit: "50kg Bag",
    stock: 300,
    description: "High nitrogen content for lush green growth",
    image: "https://images.unsplash.com/photo-1464226185764-9a5719008a39?w=600&h=450&fit=crop&q=80"
  },
  {
    id: "3",
    name: "Potash (SOP)",
    nameUrdu: "پوٹاش",
    category: "Potassium",
    price: 8500,
    unit: "50kg Bag",
    stock: 100,
    description: "Sulphate of Potash - Improves fruit quality and disease resistance",
    image: "https://images.unsplash.com/photo-1501004318641-b39e6451bec6?w=600&h=450&fit=crop&q=80"
  },
  {
    id: "4",
    name: "NP Fertilizer",
    nameUrdu: "این پی",
    category: "Compound",
    price: 9800,
    unit: "50kg Bag",
    stock: 120,
    description: "Nitrogen-Phosphorus blend for balanced nutrition",
    image: "https://images.unsplash.com/photo-1592982537447-795146426d7b?w=600&h=450&fit=crop&q=80"
  },
  {
    id: "5",
    name: "Calcium Ammonium Nitrate",
    nameUrdu: "کیلشیم امونیم نائٹریٹ",
    category: "Nitrogen",
    price: 4500,
    unit: "50kg Bag",
    stock: 80,
    description: "CAN - Quick acting nitrogen with calcium",
    image: "https://images.unsplash.com/photo-1625246333195-78d9c38ad449?w=600&h=450&fit=crop&q=80"
  },
  {
    id: "6",
    name: "Zinc Sulphate",
    nameUrdu: "زنک سلفیٹ",
    category: "Micronutrient",
    price: 2800,
    unit: "25kg Bag",
    stock: 200,
    description: "Essential micronutrient for healthy crops",
    image: "https://images.unsplash.com/photo-1416879595882-de6d81d9f1e4?w=600&h=450&fit=crop&q=80"
  },
  {
    id: "7",
    name: "Organic Compost",
    nameUrdu: "نامیاتی کھاد",
    category: "Organic",
    price: 1500,
    unit: "50kg Bag",
    stock: 500,
    description: "Natural organic matter for soil health",
    image: "https://images.unsplash.com/photo-1533777847886-39bd1df2ecc4?w=600&h=450&fit=crop&q=80"
  },
  {
    id: "8",
    name: "SSP Fertilizer",
    nameUrdu: "ایس ایس پی",
    category: "Phosphate",
    price: 2200,
    unit: "50kg Bag",
    stock: 180,
    description: "Single Super Phosphate - Economical phosphorus source",
    image: "https://images.unsplash.com/photo-1473972726974-9ae3840e4756?w=600&h=450&fit=crop&q=80"
  }
]

export const products: Product[] = seedProducts

/** Category filters (use with "All" in UI) */
export const PRODUCT_CATEGORIES = [
  "Nitrogen",
  "Phosphate",
  "Potassium",
  "Compound",
  "Micronutrient",
  "Organic",
] as const

// Customer Data
export interface Customer {
  id: string
  name: string
  phone: string
  address: string
  balance: number
  createdAt: string
}

export const customers: Customer[] = [
  {
    id: "1",
    name: "Muhammad Ali",
    phone: "0300-1234567",
    address: "Village Chak 45, District Faisalabad",
    balance: 25000,
    createdAt: "2024-01-15"
  },
  {
    id: "2",
    name: "Ahmad Khan",
    phone: "0321-7654321",
    address: "Moza Khanpur, Tehsil Jhang",
    balance: -15000,
    createdAt: "2024-02-20"
  },
  {
    id: "3",
    name: "Rashid Mehmood",
    phone: "0333-9876543",
    address: "Village Bhalwal, District Sargodha",
    balance: 50000,
    createdAt: "2024-03-10"
  },
  {
    id: "4",
    name: "Imran Hussain",
    phone: "0345-1122334",
    address: "Chak 120/GB, Faisalabad",
    balance: 0,
    createdAt: "2024-04-05"
  }
]

// Sale Types
export type SaleType = "cash" | "routine" | "seasonal"

export interface SaleTypeInfo {
  id: SaleType
  name: string
  nameUrdu: string
  description: string
  paymentTerms: string
}

export const saleTypes: SaleTypeInfo[] = [
  {
    id: "cash",
    name: "Cash Sale",
    nameUrdu: "نقد فروخت",
    description: "Full payment at time of purchase",
    paymentTerms: "Immediate - 100% payment"
  },
  {
    id: "routine",
    name: "Routine Sale",
    nameUrdu: "روٹین فروخت",
    description: "Partial payment with weekly installments",
    paymentTerms: "% payment received after each week"
  },
  {
    id: "seasonal",
    name: "Seasonal Sale",
    nameUrdu: "سیزنل فروخت",
    description: "Payment after harvest season",
    paymentTerms: "Payment due after season ends"
  }
]

// Ledger Entry
export interface LedgerEntry {
  id: string
  customerId: string
  customerName: string
  date: string
  type: "sale" | "payment" | "return"
  saleType?: SaleType
  routinePercent?: number
  dueDate?: string
  description: string
  debit: number
  credit: number
  balance: number
}

/** Five business ledgers — opened by Owner or Manager only (see rolePermissions). */
export type LedgerBookId =
  | "sales"
  | "purchases"
  | "cash-bank"
  | "expenses"
  | "load-unload"

export interface LedgerBookMeta {
  id: LedgerBookId
  name: string
  nameUrdu: string
  description: string
}

export const ledgerBooks: LedgerBookMeta[] = [
  {
    id: "sales",
    name: "Sales & Receivables",
    nameUrdu: "فروخت و واجبات",
    description: "Customer sales, credit, and recovery",
  },
  {
    id: "purchases",
    name: "Purchases & Suppliers",
    nameUrdu: "خرید و سپلائر",
    description: "Stock inward and supplier payments",
  },
  {
    id: "cash-bank",
    name: "Cash & Bank",
    nameUrdu: "نقد و بینک",
    description: "Daily cash, deposits, and withdrawals",
  },
  {
    id: "expenses",
    name: "Expenses",
    nameUrdu: "اخراجات",
    description: "Rent, utilities, wages, and misc. costs",
  },
  {
    id: "load-unload",
    name: "Load / Unload",
    nameUrdu: "لوڈ / ان لوڈ",
    description: "Warehouse movements and handling log",
  },
]

const salesLedgerEntries: LedgerEntry[] = [
  {
    id: "1",
    customerId: "1",
    customerName: "Muhammad Ali",
    date: "2024-03-15",
    type: "sale",
    saleType: "cash",
    description: "DAP 2 bags, Urea 5 bags",
    debit: 41000,
    credit: 0,
    balance: 41000
  },
  {
    id: "2",
    customerId: "1",
    customerName: "Muhammad Ali",
    date: "2024-03-20",
    type: "payment",
    description: "Cash Payment",
    debit: 0,
    credit: 16000,
    balance: 25000
  },
  {
    id: "3",
    customerId: "2",
    customerName: "Ahmad Khan",
    date: "2024-03-18",
    type: "sale",
    saleType: "routine",
    routinePercent: 25,
    dueDate: "2024-03-25",
    description: "Potash 3 bags, NP 2 bags (25% weekly)",
    debit: 45100,
    credit: 0,
    balance: 45100
  },
  {
    id: "4",
    customerId: "2",
    customerName: "Ahmad Khan",
    date: "2024-03-25",
    type: "payment",
    description: "Routine Payment (Week 1)",
    debit: 0,
    credit: 60100,
    balance: -15000
  },
  {
    id: "5",
    customerId: "3",
    customerName: "Rashid Mehmood",
    date: "2024-03-22",
    type: "sale",
    saleType: "seasonal",
    dueDate: "2024-10-01",
    description: "Urea 10 bags, DAP 4 bags (Seasonal - Kharif)",
    debit: 82000,
    credit: 0,
    balance: 82000
  },
  {
    id: "6",
    customerId: "3",
    customerName: "Rashid Mehmood",
    date: "2024-03-28",
    type: "payment",
    description: "Advance Payment",
    debit: 0,
    credit: 32000,
    balance: 50000
  }
]

const purchasesLedgerEntries: LedgerEntry[] = [
  {
    id: "p1",
    customerId: "sup-1",
    customerName: "FFC Ltd",
    date: "2024-03-10",
    type: "sale",
    description: "DAP stock inward — 100 bags @ distributor rate",
    debit: 1150000,
    credit: 0,
    balance: 1150000
  },
  {
    id: "p2",
    customerId: "sup-1",
    customerName: "FFC Ltd",
    date: "2024-03-12",
    type: "payment",
    description: "Bank transfer to supplier",
    debit: 0,
    credit: 600000,
    balance: 550000
  },
  {
    id: "p3",
    customerId: "sup-2",
    customerName: "Fatima Fertilizer",
    date: "2024-03-18",
    type: "sale",
    description: "Urea shipment — 200 bags",
    debit: 620000,
    credit: 0,
    balance: 620000
  },
]

const cashBankLedgerEntries: LedgerEntry[] = [
  {
    id: "c1",
    customerId: "bank",
    customerName: "Meezan Bank — Current",
    date: "2024-03-01",
    type: "sale",
    description: "Opening balance brought forward",
    debit: 450000,
    credit: 0,
    balance: 450000
  },
  {
    id: "c2",
    customerId: "cash",
    customerName: "Cash in hand",
    date: "2024-03-14",
    type: "payment",
    description: "Cash deposit to bank",
    debit: 0,
    credit: 120000,
    balance: 330000
  },
  {
    id: "c3",
    customerId: "cash",
    customerName: "Cash in hand",
    date: "2024-03-20",
    type: "sale",
    description: "Cash sales takings (counter)",
    debit: 185000,
    credit: 0,
    balance: 515000
  },
]

const expensesLedgerEntries: LedgerEntry[] = [
  {
    id: "e1",
    customerId: "exp",
    customerName: "Shop Rent",
    date: "2024-03-01",
    type: "sale",
    description: "March rent — Galla Mandi unit",
    debit: 85000,
    credit: 0,
    balance: 85000
  },
  {
    id: "e2",
    customerId: "exp",
    customerName: "Utilities",
    date: "2024-03-05",
    type: "sale",
    description: "Electricity bill",
    debit: 22000,
    credit: 0,
    balance: 107000
  },
  {
    id: "e3",
    customerId: "exp",
    customerName: "Misc",
    date: "2024-03-22",
    type: "payment",
    description: "Staff refreshment / petty cash",
    debit: 0,
    credit: 5000,
    balance: 102000
  },
]

const loadUnloadLedgerEntries: LedgerEntry[] = [
  {
    id: "l1",
    customerId: "wh",
    customerName: "Unload — Truck #PA-1234",
    date: "2024-03-16",
    type: "sale",
    description: "Unloaded 120 bags DAP (supplier delivery)",
    debit: 0,
    credit: 0,
    balance: 0
  },
  {
    id: "l2",
    customerId: "wh",
    customerName: "Load — Customer delivery",
    date: "2024-03-17",
    type: "sale",
    description: "Loaded 40 bags Urea for Muhammad Ali",
    debit: 0,
    credit: 0,
    balance: 0
  },
  {
    id: "l3",
    customerId: "wh",
    customerName: "Unload — Truck #LE-8891",
    date: "2024-03-21",
    type: "sale",
    description: "Unloaded Potash + NP — counted & stacked",
    debit: 0,
    credit: 0,
    balance: 0
  },
]

export const ledgerEntriesByBook: Record<LedgerBookId, LedgerEntry[]> = {
  sales: salesLedgerEntries,
  purchases: purchasesLedgerEntries,
  "cash-bank": cashBankLedgerEntries,
  expenses: expensesLedgerEntries,
  "load-unload": loadUnloadLedgerEntries,
}

/** @deprecated Use ledgerEntriesByBook.sales — alias for customer-related stats */
export const ledgerEntries: LedgerEntry[] = salesLedgerEntries

export function isLedgerBookId(id: string): id is LedgerBookId {
  return (
    id === "sales" ||
    id === "purchases" ||
    id === "cash-bank" ||
    id === "expenses" ||
    id === "load-unload"
  )
}

// Cart Item
export interface CartItem {
  product: Product
  quantity: number
}

// Staff & roles (Staff Management page + auth)
export type StaffRole = "owner" | "manager" | "loader"

export interface StaffMember {
  id: string
  name: string
  nameUrdu: string
  role: StaffRole
  department: string
  phone: string
  salary: number
  status: "active" | "inactive"
}

export interface StaffPermissions {
  canViewLedger: boolean
  canEditLedger: boolean
  /** Open any of the five ledger books (Owner + Manager only) */
  canOpenLedgers: boolean
  canViewCustomers: boolean
  canMakeSales: boolean
  canEditStaff: boolean
  /** Add products to the shop catalog (Owner + Manager only) */
  canManageProducts: boolean
  /** Shop expenses & staff advance balances (Owner + Manager only) */
  canManageShopFinance: boolean
}

export const rolePermissions: Record<StaffRole, StaffPermissions> = {
  owner: {
    canViewLedger: true,
    canEditLedger: true,
    canOpenLedgers: true,
    canViewCustomers: true,
    canMakeSales: true,
    canEditStaff: true,
    canManageProducts: true,
    canManageShopFinance: true,
  },
  manager: {
    canViewLedger: true,
    canEditLedger: true,
    canOpenLedgers: true,
    canViewCustomers: true,
    canMakeSales: true,
    canEditStaff: false,
    canManageProducts: true,
    canManageShopFinance: true,
  },
  loader: {
    canViewLedger: false,
    canEditLedger: false,
    canOpenLedgers: false,
    canViewCustomers: false,
    canMakeSales: false,
    canEditStaff: false,
    canManageProducts: false,
    canManageShopFinance: false,
  },
}

/** Shop operating expenses (seed — extended in ShopFinanceProvider) */
export interface ShopExpense {
  id: string
  date: string
  category: string
  description: string
  amount: number
}

export const seedShopExpenses: ShopExpense[] = [
  {
    id: "se-1",
    date: "2024-03-01",
    category: "Rent",
    description: "March — Galla Mandi unit rent",
    amount: 85000,
  },
  {
    id: "se-2",
    date: "2024-03-05",
    category: "Utilities",
    description: "Electricity",
    amount: 22000,
  },
  {
    id: "se-3",
    date: "2024-03-12",
    category: "Transport",
    description: "Delivery fuel & vehicle",
    amount: 18500,
  },
]

export const staffMembers: StaffMember[] = [
  {
    id: "staff-owner-1",
    name: "Muhammad Goraya",
    nameUrdu: "محمد گورایہ",
    role: "owner",
    department: "Management",
    phone: "0300-1112233",
    salary: 0,
    status: "active",
  },
  {
    id: "staff-mgr-1",
    name: "Hassan Ali",
    nameUrdu: "حسن علی",
    role: "manager",
    department: "Management",
    phone: "0300-4445566",
    salary: 55000,
    status: "active",
  },
  {
    id: "staff-load-1",
    name: "Tariq Mehmood",
    nameUrdu: "طارق محمود",
    role: "loader",
    department: "Load / Unload",
    phone: "0300-7778899",
    salary: 28000,
    status: "active",
  },
  {
    id: "staff-load-2",
    name: "Shahzad Iqbal",
    nameUrdu: "شہزاد اقبال",
    role: "loader",
    department: "Load / Unload",
    phone: "0321-3344555",
    salary: 26000,
    status: "active",
  },
  {
    id: "staff-load-3",
    name: "Nadeem Akhtar",
    nameUrdu: "ندیم اختر",
    role: "loader",
    department: "Load / Unload",
    phone: "0333-6677888",
    salary: 26000,
    status: "active",
  },
  {
    id: "staff-load-4",
    name: "Waseem Butt",
    nameUrdu: "وسیم بٹ",
    role: "loader",
    department: "Load / Unload",
    phone: "0345-9900112",
    salary: 25000,
    status: "active",
  },
]

/** Suppliers — used by supplier ledger & stock inward (Shop operations) */
export interface Supplier {
  id: string
  name: string
  phone: string
}

export const seedSuppliers: Supplier[] = [
  { id: "sup-1", name: "FFC Ltd", phone: "042-111-2222" },
  { id: "sup-2", name: "Fatima Fertilizer", phone: "042-333-4444" },
]
