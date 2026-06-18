"use client"

import { useState, type FormEvent } from "react"
import { useRouter } from "next/navigation"
import Link from "next/link"
import { ArrowLeft, Lock, Phone, KeyRound, ArrowRight, UserCheck } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card"
import { Badge } from "@/components/ui/badge"
import { GTLogo } from "@/components/gt-logo"
import { useAuth } from "@/context/auth-context"
import { toast } from "sonner"

export default function LoginPage() {
  const router = useRouter()
  const { loginCustomer, isCustomerAuthenticated, currentCustomer, logoutCustomer } = useAuth()
  const [phone, setPhone] = useState("")
  const [password, setPassword] = useState("")
  const [loading, setLoading] = useState(false)
  const [error, setError] = useState<string | null>(null)

  const handleSubmit = async (e: FormEvent) => {
    e.preventDefault()
    if (!phone.trim() || !password.trim()) {
      setError("Please fill in all fields.")
      return
    }

    setLoading(true)
    setError(null)

    try {
      const res = await loginCustomer(phone.trim(), password.trim())
      if (res.ok) {
        toast.success("Successfully logged in!")
        router.push("/")
      } else {
        setError(res.message)
        toast.error(res.message)
      }
    } catch (err) {
      setError("An unexpected error occurred. Please try again.")
      toast.error("An unexpected error occurred.")
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="relative min-h-screen flex items-center justify-center overflow-hidden bg-background py-12 px-4 sm:px-6 lg:px-8">
      {/* Decorative Gradients */}
      <div className="absolute inset-0 z-0">
        <div className="absolute -left-1/4 top-1/4 h-[400px] w-[400px] rounded-full bg-accent/15 blur-[100px]" />
        <div className="absolute -right-1/4 bottom-1/4 h-[400px] w-[400px] rounded-full bg-primary/15 blur-[100px]" />
      </div>

      <div className="relative z-10 w-full max-w-md space-y-6">
        <div className="flex flex-col items-center text-center">
          <Link href="/" className="mb-4">
            <GTLogo size="lg" className="hover:scale-105 transition-transform" />
          </Link>
          <h1 className="text-3xl font-black tracking-tight text-foreground">Goraya Traders</h1>
          <p className="mt-1 text-sm text-muted-foreground uppercase tracking-widest font-bold text-emerald-700 dark:text-emerald-400">
            Customer Portal
          </p>
        </div>

        <Card className="rounded-[2.5rem] border border-border/50 bg-card/90 shadow-2xl backdrop-blur-md">
          <CardHeader className="space-y-1">
            <CardTitle className="text-2xl font-bold text-center">Sign In</CardTitle>
            <CardDescription className="text-center">
              Enter your mobile number and password to log in
            </CardDescription>
          </CardHeader>
          <CardContent>
            {isCustomerAuthenticated ? (
              <div className="space-y-4 py-4 text-center">
                <div className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-emerald-100 text-emerald-600 dark:bg-emerald-900/30 dark:text-emerald-400">
                  <UserCheck className="h-6 w-6" />
                </div>
                <p className="font-semibold text-foreground">
                  Already signed in as {currentCustomer?.name}
                </p>
                <div className="flex flex-col gap-2 pt-2">
                  <Button className="rounded-full h-11" onClick={() => router.push("/")}>
                    Continue Shopping
                  </Button>
                  <Button variant="outline" className="rounded-full h-11" onClick={logoutCustomer}>
                    Sign Out
                  </Button>
                </div>
              </div>
            ) : (
              <form onSubmit={handleSubmit} className="space-y-4">
                <div className="space-y-2">
                  <Label htmlFor="phone">Mobile Number</Label>
                  <div className="relative">
                    <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="phone"
                      type="tel"
                      placeholder="e.g. 0300-1234567"
                      required
                      disabled={loading}
                      className="pl-12 h-12 rounded-xl"
                      value={phone}
                      onChange={(e) => {
                        setPhone(e.target.value)
                        setError(null)
                      }}
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <div className="flex justify-between items-center">
                    <Label htmlFor="password">Password</Label>
                    <span className="text-xs text-muted-foreground">Default: 1234</span>
                  </div>
                  <div className="relative">
                    <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                    <Input
                      id="password"
                      type="password"
                      required
                      placeholder="••••"
                      disabled={loading}
                      className="pl-12 h-12 rounded-xl"
                      value={password}
                      onChange={(e) => {
                        setPassword(e.target.value)
                        setError(null)
                      }}
                    />
                  </div>
                </div>

                {error && (
                  <p className="text-sm font-semibold text-destructive mt-2" role="alert">
                    {error}
                  </p>
                )}

                <Button type="submit" disabled={loading} className="w-full h-12 rounded-full font-bold gap-2 mt-4">
                  {loading ? "Signing In..." : "Sign In"}
                  <ArrowRight className="h-5 w-5" />
                </Button>
              </form>
            )}
          </CardContent>
          {!isCustomerAuthenticated && (
            <CardFooter className="flex flex-col gap-4 border-t border-border/40 pt-6">
              <div className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link href="/signup" className="font-semibold text-primary underline-offset-4 hover:underline">
                  Sign Up / Register
                </Link>
              </div>

              <div className="text-xs text-center">
                <Link href="/staff" className="inline-flex items-center gap-1.5 text-muted-foreground hover:text-foreground hover:underline">
                  <KeyRound className="h-3.5 w-3.5" />
                  Are you a staff member? Go to Staff Portal
                </Link>
              </div>
            </CardFooter>
          )}
        </Card>

        <div className="text-center">
          <Link href="/" className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground">
            <ArrowLeft className="h-4 w-4" />
            Back to main site
          </Link>
        </div>
      </div>
    </div>
  )
}
