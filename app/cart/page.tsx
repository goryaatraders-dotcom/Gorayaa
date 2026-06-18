"use client"

import { useMemo, useState } from "react"
import Link from "next/link"
import {
  ArrowLeft,
  Trash2,
  Plus,
  Minus,
  ShoppingBag,
  User,
  Phone,
  MapPin,
  Check,
  ArrowRight,
  Banknote,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardFooter } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Separator } from "@/components/ui/separator"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { ProductImage } from "@/components/product-image"
import { useCart } from "@/context/cart-context"
import { useProducts } from "@/context/products-context"
import { useShopOperations } from "@/context/shop-operations-context"
import { useAuth } from "@/context/auth-context"
import { customers } from "@/lib/data"
import type { Product } from "@/lib/data"

function CartContent() {
  const { items, updateQuantity, clearCart, totalItems, totalPrice } = useCart()
  const { products, deductStockForOrder, adjustProductStock } = useProducts()
  const { placeCodOrder } = useShopOperations()
  const { currentCustomer, isCustomerAuthenticated } = useAuth()

  const [selectedCustomer, setSelectedCustomer] = useState<string>("")
  const [orderPlaced, setOrderPlaced] = useState(false)
  const [checkoutError, setCheckoutError] = useState<string | null>(null)

  const [newCustomerName, setNewCustomerName] = useState("")
  const [newCustomerPhone, setNewCustomerPhone] = useState("")
  const [newCustomerAddress, setNewCustomerAddress] = useState("")

  const [paymentMethod, setPaymentMethod] = useState<"cod" | "jazzcash" | "easypaisa" | "bank">("cod")
  const [paymentScreenshot, setPaymentScreenshot] = useState<string | null>(null)
  const [transactionId, setTransactionId] = useState("")
  const [trackingCode, setTrackingCode] = useState<string | null>(null)
  const [isPlacing, setIsPlacing] = useState(false)

  const stockById = useMemo(() => Object.fromEntries(products.map((p) => [p.id, p.stock])), [products])

  const resolveCustomer = () => {
    if (isCustomerAuthenticated && currentCustomer) {
      return {
        name: currentCustomer.name,
        phone: currentCustomer.phone,
        address: currentCustomer.address,
      }
    }
    if (selectedCustomer) {
      const c = customers.find((x) => x.id === selectedCustomer)
      if (c) return { name: c.name, phone: c.phone, address: c.address }
    }
    return {
      name: newCustomerName.trim(),
      phone: newCustomerPhone.trim(),
      address: newCustomerAddress.trim(),
    }
  }

  const maxQtyFor = (product: Product, desired: number) => {
    const live = stockById[product.id] ?? product.stock
    return Math.min(desired, Math.max(0, live))
  }

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0]
    if (file) {
      const reader = new FileReader()
      reader.onloadend = () => {
        setPaymentScreenshot(reader.result as string)
      }
      reader.readAsDataURL(file)
    }
  }

  const handlePlaceOrder = async () => {
    setCheckoutError(null)
    if (items.length === 0) return
    const cust = resolveCustomer()
    if (!cust.name) {
      setCheckoutError("Please select an existing customer or enter a new customer name.")
      return
    }

    if (paymentMethod !== "cod") {
      if (!paymentScreenshot) {
        setCheckoutError("Please upload a payment screenshot receipt.")
        return
      }
      if (!transactionId.trim()) {
        setCheckoutError("Please enter the Transaction ID / Reference.")
        return
      }
    }

    for (const row of items) {
      const avail = stockById[row.product.id] ?? row.product.stock
      if (row.quantity > avail) {
        setCheckoutError(
          `Not enough stock for ${row.product.name}. Available: ${avail} ${row.product.unit}.`
        )
        return
      }
    }

    const lines = items.map((row) => ({ productId: row.product.id, quantity: row.quantity }))
    const reserved = deductStockForOrder(lines)
    if (!reserved) {
      setCheckoutError("Could not reserve stock. Refresh and check quantities.")
      return
    }

    setIsPlacing(true)
    const placed = await placeCodOrder({
      items,
      customerName: cust.name,
      customerPhone: cust.phone,
      customerAddress: cust.address,
      paymentMethod,
      paymentScreenshot,
      transactionId: transactionId.trim(),
    })
    setIsPlacing(false)

    if (!placed.ok) {
      for (const row of items) {
        adjustProductStock(row.product.id, row.quantity)
      }
      setCheckoutError(placed.error)
      return
    }

    setTrackingCode(placed.order.trackingCode)
    setOrderPlaced(true)
    clearCart()
    setSelectedCustomer("")
    setNewCustomerName("")
    setNewCustomerPhone("")
    setNewCustomerAddress("")
    setPaymentScreenshot(null)
    setTransactionId("")
  }

  if (orderPlaced) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartCount={0} />
        <div className="mx-auto max-w-3xl px-4 py-20 sm:px-6 lg:px-8">
          <Card className="animate-scale-in rounded-3xl border-0 bg-secondary/30 py-20 text-center">
            <CardContent>
              <div className="mx-auto mb-8 flex h-24 w-24 items-center justify-center rounded-3xl bg-accent">
                <Check className="h-12 w-12 text-accent-foreground" />
              </div>
              <h2 className="mb-3 text-3xl font-black text-foreground">Order placed</h2>
              <p className="mb-6 text-lg text-muted-foreground">
                Your order has been recorded in our database. You can track your order using the code below:
              </p>
              
              {trackingCode && (
                <div className="mx-auto max-w-sm rounded-2xl bg-secondary/80 border p-4 mb-8">
                  <p className="text-xs text-muted-foreground uppercase tracking-widest">Order Tracking Code</p>
                  <p className="text-2xl font-black text-foreground tracking-wider select-all mt-1">{trackingCode}</p>
                </div>
              )}

              <div className="flex justify-center gap-4 flex-wrap">
                <Link href="/track">
                  <Button size="lg" variant="outline" className="h-14 rounded-full px-8">
                    Track Order
                  </Button>
                </Link>
                <Link href="/">
                  <Button size="lg" className="h-14 gap-2 rounded-full px-8">
                    Continue shopping
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                </Link>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform duration-300 group-hover:-translate-x-1" />
          Continue shopping
        </Link>

        <div className="mb-10 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
            Checkout
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">Shopping cart</h1>
          <p className="mt-2 text-lg text-muted-foreground">{totalItems} items</p>
        </div>

        {items.length === 0 ? (
          <Card className="animate-fade-in-up rounded-3xl border-0 bg-secondary/30 py-20 text-center">
            <CardContent>
              <ShoppingBag className="mx-auto mb-6 h-20 w-20 text-muted-foreground/30" />
              <h2 className="mb-3 text-2xl font-bold text-foreground">Your cart is empty</h2>
              <p className="mb-8 text-lg text-muted-foreground">Add products from the catalog</p>
              <Link href="/">
                <Button size="lg" className="h-14 gap-2 rounded-full px-8">
                  Browse products
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </Link>
            </CardContent>
          </Card>
        ) : (
          <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
            <div className="space-y-4 lg:col-span-2">
              {items.map((item, i) => {
                const avail = stockById[item.product.id] ?? item.product.stock
                return (
                  <Card
                    key={item.product.id}
                    className={`animate-fade-in-up rounded-3xl border-0 bg-secondary/30 stagger-${(i % 8) + 1}`}
                  >
                    <CardContent className="p-6">
                      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:gap-6">
                        <div className="relative flex h-24 w-24 flex-shrink-0 items-center justify-center overflow-hidden rounded-2xl bg-secondary">
                          <ProductImage
                            src={item.product.image || (item.product as any).images?.[0]}
                            alt={item.product.name}
                            sizes="96px"
                          />
                        </div>
                        <div className="min-w-0 flex-1">
                          <h3 className="text-lg font-bold text-foreground">{item.product.name}</h3>
                          <p className="text-sm text-muted-foreground">{item.product.nameUrdu}</p>
                          <p className="mt-1 text-sm text-muted-foreground">
                            Rs. {item.product.price.toLocaleString()} / {item.product.unit}
                          </p>
                          <p className="mt-1 text-xs text-muted-foreground">
                            Available: {avail} {item.product.unit}
                            {item.quantity > avail && (
                              <span className="ml-2 font-semibold text-destructive"> — exceeds stock</span>
                            )}
                          </p>
                        </div>
                        <div className="flex items-center gap-3">
                          <Button
                            variant="secondary"
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            onClick={() => updateQuantity(item.product.id, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="w-10 text-center text-xl font-black">{item.quantity}</span>
                          <Button
                            size="icon"
                            className="h-10 w-10 rounded-full"
                            disabled={item.quantity >= avail}
                            onClick={() =>
                              updateQuantity(
                                item.product.id,
                                maxQtyFor(item.product, item.quantity + 1)
                              )
                            }
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                        </div>
                        <div className="text-right sm:min-w-[120px]">
                          <p className="text-xl font-black text-foreground">
                            Rs. {(item.product.price * item.quantity).toLocaleString()}
                          </p>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="mt-1 rounded-full text-destructive hover:text-destructive"
                            onClick={() => updateQuantity(item.product.id, 0)}
                          >
                            <Trash2 className="mr-1 h-4 w-4" />
                            Remove
                          </Button>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                )
              })}
            </div>

            <div className="space-y-6">
              <Card className="animate-fade-in-up rounded-3xl border-0 bg-secondary/30 stagger-1">
                <CardHeader>
                  <CardTitle className="text-xl font-bold">Customer</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {isCustomerAuthenticated && currentCustomer ? (
                    <div className="space-y-3 p-4 rounded-2xl bg-emerald-500/5 border border-emerald-500/10">
                      <p className="text-sm font-semibold text-emerald-600 dark:text-emerald-400">
                        Logged In Account
                      </p>
                      <div>
                        <p className="text-base font-bold text-foreground">{currentCustomer.name}</p>
                        <p className="text-sm text-muted-foreground">{currentCustomer.phone}</p>
                        <p className="text-sm text-muted-foreground">{currentCustomer.address}</p>
                      </div>
                      <p className="text-xs text-muted-foreground">
                        Your order will be linked to your customer profile automatically.
                      </p>
                    </div>
                  ) : (
                    <>
                      <div className="space-y-2">
                        <Label className="text-muted-foreground">Existing customer</Label>
                        <select
                          className="w-full rounded-xl border border-input bg-background p-3 text-foreground"
                          value={selectedCustomer}
                          onChange={(e) => {
                            setSelectedCustomer(e.target.value)
                            if (e.target.value) {
                              setNewCustomerName("")
                              setNewCustomerPhone("")
                              setNewCustomerAddress("")
                            }
                          }}
                        >
                          <option value="">Select…</option>
                          {customers.map((customer) => (
                            <option key={customer.id} value={customer.id}>
                              {customer.name} — {customer.phone}
                            </option>
                          ))}
                        </select>
                      </div>
                      <Separator />
                      <p className="text-sm text-muted-foreground">Or new customer</p>
                      <div className="space-y-3">
                        <div className="relative">
                          <User className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Name"
                            className="h-12 rounded-xl pl-11"
                            value={newCustomerName}
                            onChange={(e) => {
                              setNewCustomerName(e.target.value)
                              if (e.target.value) setSelectedCustomer("")
                            }}
                          />
                        </div>
                        <div className="relative">
                          <Phone className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Phone"
                            className="h-12 rounded-xl pl-11"
                            value={newCustomerPhone}
                            onChange={(e) => setNewCustomerPhone(e.target.value)}
                          />
                        </div>
                        <div className="relative">
                          <MapPin className="absolute left-4 top-1/2 h-4 w-4 -translate-y-1/2 text-muted-foreground" />
                          <Input
                            placeholder="Address"
                            className="h-12 rounded-xl pl-11"
                            value={newCustomerAddress}
                            onChange={(e) => setNewCustomerAddress(e.target.value)}
                          />
                        </div>
                      </div>
                    </>
                  )}
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up rounded-3xl border-0 bg-secondary/30 stagger-2">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-xl font-bold">
                    <Banknote className="h-5 w-5 text-primary" />
                    Payment Method
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-2">
                    {[
                      { id: "cod", label: "COD", desc: "Cash on Delivery" },
                      { id: "jazzcash", label: "JazzCash", desc: "0300-1234567" },
                      { id: "easypaisa", label: "EasyPaisa", desc: "0300-1234567" },
                      { id: "bank", label: "Bank Transfer", desc: "Meezan Bank" },
                    ].map((m) => (
                      <button
                        key={m.id}
                        type="button"
                        onClick={() => {
                          setPaymentMethod(m.id as any)
                          setCheckoutError(null)
                        }}
                        className={`p-3 text-left rounded-xl border transition-all ${
                          paymentMethod === m.id
                            ? "border-primary bg-primary/10 text-foreground"
                            : "border-border/60 bg-background/50 text-muted-foreground hover:bg-background"
                        }`}
                      >
                        <p className="font-bold text-sm">{m.label}</p>
                        <p className="text-xs opacity-75">{m.desc}</p>
                      </button>
                    ))}
                  </div>

                  {paymentMethod === "cod" && (
                    <div className="space-y-2 text-sm text-muted-foreground pt-2">
                      <p>
                        Pay in cash upon delivery. The order is stored for dispatch and accounts immediately.
                      </p>
                      <div className="rounded-2xl border border-primary/20 bg-primary/5 p-4 text-foreground">
                        <p className="font-semibold">Rs. {totalPrice.toLocaleString()} due on delivery</p>
                        <p className="mt-1 text-xs text-muted-foreground">Stock is reserved and updated upon approval.</p>
                      </div>
                    </div>
                  )}

                  {paymentMethod === "jazzcash" && (
                    <div className="space-y-3 pt-2">
                      <div className="rounded-2xl border border-orange-500/20 bg-orange-500/5 p-4 text-sm text-foreground space-y-1">
                        <p className="font-bold text-orange-600">JazzCash Account Details:</p>
                        <p>Account Name: <strong className="text-foreground">Muhammad Goraya</strong></p>
                        <p>Number: <strong className="text-foreground">0300-1234567</strong></p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Transaction ID / Reference</Label>
                        <Input
                          placeholder="e.g. 12345678901"
                          className="h-10 rounded-xl bg-background"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Upload Receipt Screenshot</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          className="h-10 rounded-xl cursor-pointer bg-background"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "easypaisa" && (
                    <div className="space-y-3 pt-2">
                      <div className="rounded-2xl border border-emerald-500/20 bg-emerald-500/5 p-4 text-sm text-foreground space-y-1">
                        <p className="font-bold text-emerald-600">EasyPaisa Account Details:</p>
                        <p>Account Name: <strong className="text-foreground">Muhammad Goraya</strong></p>
                        <p>Number: <strong className="text-foreground">0300-1234567</strong></p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Transaction ID / Reference</Label>
                        <Input
                          placeholder="e.g. 12345678901"
                          className="h-10 rounded-xl bg-background"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Upload Receipt Screenshot</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          className="h-10 rounded-xl cursor-pointer bg-background"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  )}

                  {paymentMethod === "bank" && (
                    <div className="space-y-3 pt-2">
                      <div className="rounded-2xl border border-blue-500/20 bg-blue-500/5 p-4 text-sm text-foreground space-y-1">
                        <p className="font-bold text-blue-600">Bank Transfer Details:</p>
                        <p>Bank: <strong className="text-foreground">Meezan Bank Ltd</strong></p>
                        <p>Account Title: <strong className="text-foreground">Goraya Traders</strong></p>
                        <p>Account Number: <strong className="text-foreground">1234-56789-0123</strong></p>
                        <p>Branch Code: <strong className="text-foreground">0123 (Arifwala Branch)</strong></p>
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Transaction Reference / UTR</Label>
                        <Input
                          placeholder="e.g. PKMZN123456789"
                          className="h-10 rounded-xl bg-background"
                          value={transactionId}
                          onChange={(e) => setTransactionId(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label className="text-xs text-muted-foreground">Upload Bank Transfer Receipt</Label>
                        <Input
                          type="file"
                          accept="image/*"
                          className="h-10 rounded-xl cursor-pointer bg-background"
                          onChange={handleFileChange}
                        />
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              <Card className="animate-fade-in-up rounded-3xl border-0 bg-foreground text-background stagger-3">
                <CardHeader>
                  <CardTitle className="text-xl font-bold text-background">Summary</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="flex justify-between text-background/70">
                    <span>Items ({totalItems})</span>
                    <span>Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                  <div className="flex justify-between text-background/70">
                    <span>Method</span>
                    <Badge variant="secondary" className="rounded-full border-0 bg-background/20 text-background uppercase">
                      {paymentMethod}
                    </Badge>
                  </div>
                  <Separator className="bg-background/20" />
                  <div className="flex justify-between text-2xl font-black">
                    <span>Total</span>
                    <span>Rs. {totalPrice.toLocaleString()}</span>
                  </div>
                </CardContent>
                <CardFooter className="flex flex-col gap-3 pt-0">
                  {checkoutError && (
                    <p className="rounded-xl bg-destructive/15 px-3 py-2 text-center text-sm text-destructive">
                      {checkoutError}
                    </p>
                  )}
                  <Button
                    variant="secondary"
                    className="h-14 w-full gap-2 rounded-full text-base font-bold"
                    onClick={handlePlaceOrder}
                    disabled={isPlacing}
                  >
                    {isPlacing ? "Processing..." : `Place order (${paymentMethod.toUpperCase()})`}
                    <ArrowRight className="h-5 w-5" />
                  </Button>
                  <Button
                    variant="ghost"
                    className="h-12 w-full rounded-full text-background/70 hover:bg-background/10 hover:text-background"
                    onClick={clearCart}
                  >
                    Clear cart
                  </Button>
                </CardFooter>
              </Card>
            </div>
          </div>
        )}
      </main>
    </div>
  )
}

export default function CartPage() {
  return <CartContent />
}
