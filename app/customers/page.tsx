"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  Search, 
  Plus, 
  Phone, 
  MapPin,
  User,
  TrendingUp,
  TrendingDown,
  Eye,
  Edit,
  ArrowRight
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"
import { Label } from "@/components/ui/label"
import { Header } from "@/components/header"
import { useCart } from "@/context/cart-context"
import { customers, ledgerEntries, type Customer } from "@/lib/data"

function CustomersContent() {
  const { totalItems } = useCart()
  const [searchQuery, setSearchQuery] = useState("")
  const [customerList] = useState<Customer[]>(customers)

  const filteredCustomers = customerList.filter(customer => {
    return customer.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
           customer.phone.includes(searchQuery) ||
           customer.address.toLowerCase().includes(searchQuery.toLowerCase())
  })

  const totalReceivable = customerList.reduce((sum, c) => c.balance > 0 ? sum + c.balance : sum, 0)
  const totalPayable = customerList.reduce((sum, c) => c.balance < 0 ? sum + Math.abs(c.balance) : sum, 0)

  const getCustomerTransactions = (customerId: string) => {
    return ledgerEntries.filter(e => e.customerId === customerId).length
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />
      
      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Back Button */}
        <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8 group">
          <ArrowLeft className="h-4 w-4 group-hover:-translate-x-1 transition-transform duration-300" />
          Back to Shop
        </Link>

        {/* Page Header */}
        <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-6 mb-10 animate-fade-in-up">
          <div>
            <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">Account Management</Badge>
            <h1 className="text-4xl lg:text-5xl font-black text-foreground tracking-tight">Customers</h1>
            <p className="text-muted-foreground mt-2 text-lg">Manage customer accounts and balances</p>
          </div>
          <Dialog>
            <DialogTrigger asChild>
              <Button size="lg" className="gap-2 rounded-full h-12 px-6">
                <Plus className="h-5 w-5" />
                Add Customer
                <ArrowRight className="h-4 w-4" />
              </Button>
            </DialogTrigger>
            <DialogContent className="sm:max-w-md">
              <DialogHeader>
                <DialogTitle className="text-2xl font-bold">Add New Customer</DialogTitle>
                <DialogDescription>
                  Add a new customer to your ledger system.
                </DialogDescription>
              </DialogHeader>
              <div className="space-y-4 py-4">
                <div className="space-y-2">
                  <Label>Customer Name</Label>
                  <Input placeholder="Enter full name" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Phone Number</Label>
                  <Input placeholder="03XX-XXXXXXX" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Address</Label>
                  <Input placeholder="Village/City, District" className="h-12 rounded-xl" />
                </div>
                <div className="space-y-2">
                  <Label>Opening Balance (Rs.)</Label>
                  <Input type="number" placeholder="0" className="h-12 rounded-xl" />
                </div>
              </div>
              <DialogFooter className="gap-2">
                <Button variant="outline" className="rounded-full">Cancel</Button>
                <Button className="rounded-full">Add Customer</Button>
              </DialogFooter>
            </DialogContent>
          </Dialog>
        </div>

        {/* Summary Cards */}
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-10">
          {[
            { label: "Total Customers", value: customerList.length, icon: User, color: "muted", isCount: true, delay: 1 },
            { label: "Total Receivable", value: totalReceivable, icon: TrendingUp, color: "destructive", delay: 2 },
            { label: "Total Advance", value: totalPayable, icon: TrendingDown, color: "accent", delay: 3 },
          ].map((stat) => (
            <Card key={stat.label} className={`hover-lift border-0 bg-secondary/30 rounded-3xl animate-fade-in-up stagger-${stat.delay}`}>
              <CardContent className="p-6">
                <div className="flex items-center justify-between">
                  <div>
                    <p className="text-sm text-muted-foreground">{stat.label}</p>
                    <p className={`text-2xl font-black mt-1 ${stat.isCount ? 'text-foreground' : `text-${stat.color}`}`}>
                      {stat.isCount ? stat.value : `Rs. ${stat.value.toLocaleString()}`}
                    </p>
                  </div>
                  <div className={`h-14 w-14 rounded-2xl bg-${stat.color === 'muted' ? 'secondary' : stat.color + '/10'} flex items-center justify-center`}>
                    <stat.icon className={`h-6 w-6 ${stat.color === 'muted' ? 'text-muted-foreground' : `text-${stat.color}`}`} />
                  </div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Search */}
        <Card className="mb-8 border-0 bg-secondary/30 rounded-3xl">
          <CardContent className="p-6">
            <div className="relative">
              <Search className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
              <Input
                type="text"
                placeholder="Search by name, phone, or address..."
                className="pl-12 h-12 rounded-full border-border bg-background"
                value={searchQuery}
                onChange={(e) => setSearchQuery(e.target.value)}
              />
            </div>
          </CardContent>
        </Card>

        {/* Customer Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {filteredCustomers.map((customer, index) => (
            <Card 
              key={customer.id} 
              className={`hover-lift border-0 bg-card rounded-3xl overflow-hidden animate-fade-in-up stagger-${(index % 8) + 1} group`}
            >
              <CardHeader className="pb-3 bg-secondary/30">
                <div className="flex items-start justify-between">
                  <div className="flex items-center gap-4">
                    <div className="h-14 w-14 rounded-2xl bg-foreground flex items-center justify-center group-hover:scale-110 transition-all duration-300">
                      <User className="h-7 w-7 text-background" />
                    </div>
                    <div>
                      <CardTitle className="text-xl font-bold">{customer.name}</CardTitle>
                      <Badge variant="secondary" className="text-xs mt-2 rounded-full">
                        {getCustomerTransactions(customer.id)} transactions
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4 p-6">
                <div className="space-y-3">
                  <div className="flex items-center gap-3 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center">
                      <Phone className="h-4 w-4" />
                    </div>
                    <span>{customer.phone}</span>
                  </div>
                  <div className="flex items-start gap-3 text-sm text-muted-foreground">
                    <div className="w-8 h-8 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                      <MapPin className="h-4 w-4" />
                    </div>
                    <span className="line-clamp-2">{customer.address}</span>
                  </div>
                </div>
                
                <div className="pt-4 border-t border-border">
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-muted-foreground">Balance:</span>
                    <span className={`text-xl font-black ${customer.balance >= 0 ? 'text-destructive' : 'text-accent'}`}>
                      {customer.balance >= 0 ? '' : '-'}Rs. {Math.abs(customer.balance).toLocaleString()}
                    </span>
                  </div>
                  <p className="text-xs text-muted-foreground mt-1">
                    {customer.balance > 0 ? 'Receivable from customer' : customer.balance < 0 ? 'Advance payment' : 'Account settled'}
                  </p>
                </div>

                <div className="flex gap-2 pt-2">
                  <Link href={`/ledger?customer=${customer.id}`} className="flex-1">
                    <Button variant="secondary" className="w-full gap-2 rounded-full h-11">
                      <Eye className="h-4 w-4" />
                      View Ledger
                    </Button>
                  </Link>
                  <Button variant="ghost" size="icon" className="h-11 w-11 rounded-full">
                    <Edit className="h-4 w-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {filteredCustomers.length === 0 && (
          <Card className="text-center py-16 border-0 bg-secondary/30 rounded-3xl">
            <CardContent>
              <User className="w-20 h-20 mx-auto text-muted-foreground/30 mb-4" />
              <h2 className="text-2xl font-bold text-foreground mb-2">No customers found</h2>
              <p className="text-muted-foreground">Try adjusting your search or add a new customer</p>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  )
}

export default function CustomersPage() {
  return <CustomersContent />
}
