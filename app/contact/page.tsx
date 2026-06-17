"use client"

import { useState, type FormEvent } from "react"
import Link from "next/link"
import { ArrowLeft, Clock, Mail, MapPin, Phone, Send } from "lucide-react"
import { Header } from "@/components/header"
import { useCart } from "@/context/cart-context"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { Badge } from "@/components/ui/badge"

function ContactContent() {
  const { totalItems } = useCart()
  const [sent, setSent] = useState(false)

  const onSubmit = (e: FormEvent) => {
    e.preventDefault()
    setSent(true)
  }

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        <Link
          href="/"
          className="group mb-10 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to shop
        </Link>

        <div className="mb-10 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
            Get in touch
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">Contact us</h1>
          <p className="mt-3 max-w-2xl text-lg text-muted-foreground">
            Visit us at Galla Mandi, call for bulk orders, or send a message — we reply during business hours.
          </p>
        </div>

        <div className="grid gap-8 lg:grid-cols-2">
          <div className="space-y-4 animate-fade-in-up stagger-1">
            <Card className="rounded-3xl border-border/60 shadow-sm">
              <CardHeader>
                <CardTitle className="text-xl">Shop & location</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-muted-foreground">
                <div className="flex gap-3">
                  <MapPin className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Goraya Traders</p>
                    <p>Galla Mandi, Arifwala</p>
                    <p>Punjab, Pakistan</p>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Phone className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Phone</p>
                    <a href="tel:03001234567" className="hover:text-primary">
                      0300-1234567
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Mail className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Email</p>
                    <a href="mailto:goraya.traders@gmail.com" className="hover:text-primary">
                      goraya.traders@gmail.com
                    </a>
                  </div>
                </div>
                <div className="flex gap-3">
                  <Clock className="mt-0.5 h-5 w-5 shrink-0 text-accent" />
                  <div>
                    <p className="font-semibold text-foreground">Hours</p>
                    <p>Mon–Sat: 8:00 AM – 8:00 PM</p>
                    <p>Sunday: 9:00 AM – 2:00 PM</p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          <Card className="animate-fade-in-up stagger-2 rounded-3xl border-border/60 shadow-sm">
            <CardHeader>
              <CardTitle className="text-xl">Send a message</CardTitle>
              <p className="text-sm text-muted-foreground">
                Ask about stock, pricing, or delivery — this form is a demo (no server).
              </p>
            </CardHeader>
            <CardContent>
              {sent ? (
                <p className="rounded-2xl bg-secondary/60 py-8 text-center font-medium text-foreground">
                  Thanks — we would get back to you soon. (Demo: not actually sent.)
                </p>
              ) : (
                <form className="space-y-4" onSubmit={onSubmit}>
                  <div className="grid gap-4 sm:grid-cols-2">
                    <div className="space-y-2">
                      <Label htmlFor="name">Name</Label>
                      <Input id="name" required placeholder="Your name" className="h-12 rounded-xl" />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input id="phone" type="tel" placeholder="03xx-xxxxxxx" className="h-12 rounded-xl" />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="email">Email</Label>
                    <Input id="email" type="email" placeholder="you@example.com" className="h-12 rounded-xl" />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="msg">Message</Label>
                    <Textarea
                      id="msg"
                      required
                      rows={5}
                      placeholder="What do you need? (product names, bags, delivery area…)"
                      className="min-h-[120px] rounded-xl resize-y"
                    />
                  </div>
                  <Button type="submit" className="h-12 w-full gap-2 rounded-xl text-base font-semibold sm:w-auto">
                    <Send className="h-4 w-4" />
                    Send message
                  </Button>
                </form>
              )}
            </CardContent>
          </Card>
        </div>
      </main>
    </div>
  )
}

export default function ContactPage() {
  return <ContactContent />
}
