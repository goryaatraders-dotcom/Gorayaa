"use client"

import Image from "next/image"
import Link from "next/link"
import { Leaf, Truck, Shield, Phone, MapPin, ArrowRight, Star, ChevronRight, Newspaper } from "lucide-react"
import { Button } from "@/components/ui/button"
import { Badge } from "@/components/ui/badge"
import { Header } from "@/components/header"
import { GTLogo } from "@/components/gt-logo"
import { ProductsBrowse } from "@/components/products-browse"
import { useCart } from "@/context/cart-context"

function ShopContent() {
  const { totalItems } = useCart()

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />

      <div className="relative overflow-hidden border-b border-emerald-900/20 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 text-emerald-50 shadow-[0_4px_24px_-4px_oklch(0.35_0.1_158_/_0.35)]">
        <div
          className="pointer-events-none absolute inset-0 animate-shimmer-bar opacity-40 bg-gradient-to-r from-transparent via-white/15 to-transparent"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 py-2.5 text-center text-xs sm:text-sm sm:px-6 lg:px-8">
          <span className="font-semibold tracking-wide">Trusted wholesale & retail — Goraya Traders, Arifwala</span>
          <span className="mx-2 hidden sm:inline opacity-50">·</span>
          <span className="block opacity-95 sm:inline">Secure checkout · Quality products · Expert support</span>
        </div>
      </div>
      
      {/* Hero Section - Modern Split Layout */}
      <section className="relative min-h-[90vh] flex items-center overflow-hidden">
        {/* Layered banner: mesh + image + colour grading */}
        <div className="absolute inset-0 z-0">
          <div
            className="absolute inset-0 z-[1] bg-[radial-gradient(ellipse_90%_60%_at_10%_20%,oklch(0.55_0.14_158_/_0.35),transparent_55%),radial-gradient(ellipse_70%_50%_at_90%_80%,oklch(0.45_0.1_175_/_0.25),transparent_50%),radial-gradient(ellipse_50%_40%_at_50%_100%,oklch(0.4_0.08_150_/_0.2),transparent_60%)]"
            aria-hidden
          />
          <div
            className="absolute -left-1/4 top-1/4 z-[2] h-[min(80vw,520px)] w-[min(80vw,520px)] rounded-full bg-accent/25 blur-[100px] animate-banner-glow"
            aria-hidden
          />
          <div
            className="absolute -right-1/4 bottom-0 z-[2] h-[min(70vw,420px)] w-[min(70vw,420px)] rounded-full bg-primary/20 blur-[90px] animate-banner-glow"
            style={{ animationDelay: "-4s" }}
            aria-hidden
          />
          <Image
            src="/images/banner-bg.jpg"
            alt="Agricultural field background"
            fill
            className="object-cover z-[3] scale-105"
            priority
          />
          <div className="absolute inset-0 z-[4] bg-gradient-to-br from-background/88 via-background/72 to-emerald-950/30" />
          <div className="absolute inset-0 z-[5] bg-[linear-gradient(105deg,oklch(0.99_0.01_95_/_0.92)_0%,transparent_42%,oklch(0.98_0.015_100_/_0.55)_100%)]" />
          <div className="absolute inset-0 z-[6] bg-gradient-to-t from-background/40 via-transparent to-background/25" />
        </div>

        <div className="relative z-10 mx-auto max-w-7xl px-4 sm:px-6 lg:px-8 w-full py-20">
          <div className="grid lg:grid-cols-2 gap-12 items-center">
            {/* Left Content */}
            <div className="space-y-8">
              {/* Location Badge */}
              <div className="animate-fade-in-up">
                <Badge
                  variant="secondary"
                  className="border border-accent/25 bg-card/90 px-4 py-2 text-sm font-medium shadow-md backdrop-blur-sm gap-2 rounded-full hover:border-accent/40 hover:shadow-lg transition-all duration-300"
                >
                  <MapPin className="h-4 w-4 text-accent" />
                  Arifwala Galla Mandi, Punjab
                </Badge>
              </div>
              
              {/* Main Heading */}
              <div className="space-y-4">
                <h1 className="text-5xl sm:text-6xl lg:text-7xl font-black leading-[0.9] tracking-tight animate-fade-in-up stagger-1">
                  <span className="block text-balance text-foreground">Premium</span>
                  <span className="block text-balance text-foreground">Fertilizers for</span>
                  <span className="block bg-gradient-to-r from-accent via-emerald-500 to-teal-600 bg-clip-text text-transparent text-balance">
                    Better Harvest
                  </span>
                </h1>
              </div>
              
              <p className="text-lg text-muted-foreground max-w-lg text-pretty leading-relaxed animate-fade-in-up stagger-2">
                Your trusted partner for DAP, Urea, Potash, and all agricultural fertilizers. 
                Serving farmers across Punjab with premium quality products since 2010.
              </p>
              
              {/* CTA Buttons */}
              <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-3">
                <Button 
                  size="lg" 
                  className="h-14 gap-3 rounded-full px-8 text-base font-semibold shadow-lg shadow-primary/25 transition-all duration-300 hover:scale-[1.02] hover:shadow-xl hover:shadow-primary/30 group"
                  onClick={() => document.getElementById('products')?.scrollIntoView({ behavior: 'smooth' })}
                >
                  <Leaf className="h-5 w-5 transition-transform duration-300 group-hover:rotate-12" />
                  Shop Now
                  <ArrowRight className="h-5 w-5 transition-transform duration-300 group-hover:translate-x-1" />
                </Button>
                <Button 
                  size="lg" 
                  variant="outline" 
                  asChild
                  className="h-14 gap-3 rounded-full border-2 border-primary/30 bg-card/90 px-8 text-base font-semibold text-foreground shadow-sm backdrop-blur-sm transition-all duration-300 hover:border-accent/60 hover:bg-card hover:text-foreground hover:shadow-md"
                >
                  <a href="tel:+923001234567" className="inline-flex items-center gap-3">
                    <Phone className="h-5 w-5 shrink-0 text-emerald-700 dark:text-emerald-400" />
                    <span className="font-bold tabular-nums tracking-wide">0300-1234567</span>
                  </a>
                </Button>
              </div>

              {/* Stats */}
              <div className="flex gap-8 pt-4 animate-fade-in-up stagger-4">
                <div>
                  <p className="text-3xl font-black text-foreground">15+</p>
                  <p className="text-sm text-muted-foreground">Years Experience</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">5000+</p>
                  <p className="text-sm text-muted-foreground">Happy Farmers</p>
                </div>
                <div>
                  <p className="text-3xl font-black text-foreground">100%</p>
                  <p className="text-sm text-muted-foreground">Quality Products</p>
                </div>
              </div>
            </div>

            {/* Right Content - Logo Display */}
            <div className="flex justify-center lg:justify-end animate-fade-in-right stagger-3">
              <div className="relative">
                {/* Background blur effect */}
                <div className="absolute inset-0 bg-accent/10 rounded-[3rem] blur-3xl scale-110" />
                
                {/* Shop name — high contrast, no block letter logo */}
                <div className="relative rounded-[2rem] border border-white/40 bg-card/90 p-10 shadow-2xl shadow-primary/10 glass transition-transform duration-500 hover:scale-[1.02] hover:shadow-primary/20 sm:p-12">
                  <div className="mx-auto flex justify-center">
                    <GTLogo size="xl" />
                  </div>
                  <div className="mt-8 text-center">
                    <p className="text-3xl font-black tracking-tight text-foreground sm:text-4xl md:text-5xl">
                      Goraya Traders
                    </p>
                    <p className="mt-2 text-base font-bold uppercase tracking-[0.2em] text-emerald-800 dark:text-emerald-300 sm:text-lg">
                      Arifwala Galla Mandi
                    </p>
                    <p className="mt-2 text-sm font-medium text-foreground/80">Est. 2010 · Fertilizers wholesale & retail</p>
                  </div>
                  
                  {/* Rating */}
                  <div className="flex items-center justify-center gap-1 mt-6">
                    {[...Array(5)].map((_, i) => (
                      <Star key={i} className="w-5 h-5 fill-accent text-accent" />
                    ))}
                    <span className="text-sm text-muted-foreground ml-2">5.0 Rating</span>
                  </div>
                </div>

                {/* Floating badges */}
                <div className="absolute -top-4 -left-4 animate-float rounded-2xl border border-border/60 bg-card/95 px-4 py-2 shadow-xl backdrop-blur-md transition-transform duration-300 hover:scale-105">
                  <p className="text-xs font-medium text-muted-foreground">Trusted By</p>
                  <p className="text-lg font-bold text-foreground">5000+ Farmers</p>
                </div>
                
                <div
                  className="absolute -bottom-4 -right-4 animate-float rounded-2xl bg-gradient-to-br from-accent to-emerald-600 px-4 py-2 text-accent-foreground shadow-xl shadow-accent/25 transition-transform duration-300 hover:scale-105"
                  style={{ animationDelay: "1s" }}
                >
                  <p className="text-xs font-medium opacity-95">Free Delivery</p>
                  <p className="text-lg font-bold">Above Rs. 50k</p>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* Marquee Section */}
      <section className="overflow-hidden border-y border-emerald-900/15 bg-gradient-to-r from-emerald-950 via-teal-900 to-emerald-950 py-4">
        <div className="animate-marquee flex whitespace-nowrap">
          {[...Array(2)].map((_, i) => (
            <div key={i} className="mx-4 flex items-center gap-8">
              {["DAP", "UREA", "POTASH", "NP", "CAN", "SSP", "ZINC", "ORGANIC"].map((item) => (
                <span
                  key={item}
                  className="flex items-center gap-3 text-sm font-semibold uppercase tracking-wider text-emerald-100/90 transition-colors hover:text-white"
                >
                  {item}
                  <span className="h-1.5 w-1.5 rounded-full bg-emerald-400 shadow-[0_0_8px_oklch(0.72_0.14_158_/_0.8)]" />
                </span>
              ))}
            </div>
          ))}
        </div>
      </section>

      {/* What we provide — short blog-style intro (shop remains home) */}
      <section className="border-y border-border/40 bg-gradient-to-b from-card/90 via-background to-secondary/20 py-16 sm:py-20">
        <div className="mx-auto max-w-3xl px-4 sm:px-6 lg:px-8">
          <div className="mb-6 flex flex-col items-center gap-3 text-center sm:flex-row sm:items-center sm:justify-center sm:gap-4 sm:text-left">
            <div className="flex h-12 w-12 items-center justify-center rounded-2xl bg-primary/10 text-primary">
              <Newspaper className="h-6 w-6" />
            </div>
            <Badge variant="secondary" className="rounded-full px-4 py-1">
              From our shop
            </Badge>
          </div>
          <h2 className="mb-8 text-center text-3xl font-black tracking-tight text-foreground sm:text-4xl">
            What we provide
          </h2>
          <article className="space-y-5 text-pretty text-base leading-relaxed text-muted-foreground sm:text-lg">
            <p>
              Goraya Traders is your local source at <strong className="text-foreground">Arifwala Galla Mandi</strong> for
              trusted fertilizers and agricultural inputs. We supply farmers and dealers with{" "}
              <strong className="text-foreground">wholesale and retail</strong> quantities — from nitrogen and phosphate
              bags to micronutrients and organic options — so you can match product to crop, soil, and season.
            </p>
            <p>
              Beyond stocking <strong className="text-foreground">DAP, Urea, Potash, NP, CAN, SSP, Zinc</strong>, and
              more, we help you plan what to apply and when. Our team understands Punjab&apos;s cropping cycles and can
              suggest blends and timings that support a <strong className="text-foreground">better harvest</strong> without
              waste.
            </p>
            <p>
              We offer <strong className="text-foreground">reliable delivery</strong> on larger orders, clear pricing,
              and ongoing support by phone or in person. Browse the catalog on this page or open the{" "}
              <Link href="/products" className="font-semibold text-primary underline-offset-4 hover:underline">
                full product page
              </Link>{" "}
              anytime; for visits, hours, or bulk enquiries, use our{" "}
              <Link href="/contact" className="font-semibold text-primary underline-offset-4 hover:underline">
                contact page
              </Link>
              .
            </p>
          </article>
        </div>
      </section>

      {/* Features Grid */}
      <section className="border-y border-border/40 bg-gradient-to-b from-secondary/40 via-background to-secondary/25 py-20">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 gap-6 md:grid-cols-3">
            {[
              { icon: Truck, title: "Free Delivery", desc: "On orders above Rs. 50,000", delay: 1 },
              { icon: Shield, title: "Quality Assured", desc: "100% genuine products", delay: 2 },
              { icon: Phone, title: "Expert Support", desc: "Call us: 0300-1234567", delay: 3 },
            ].map((feature) => (
              <div 
                key={feature.title}
                className={`group rounded-3xl border border-border/60 bg-card/80 p-8 shadow-sm backdrop-blur-sm hover-lift animate-fade-in-up stagger-${feature.delay}`}
              >
                <div className="mb-6 flex h-14 w-14 items-center justify-center rounded-2xl bg-gradient-to-br from-secondary to-secondary/70 transition-all duration-300 group-hover:scale-110 group-hover:from-primary group-hover:to-accent group-hover:shadow-lg group-hover:shadow-primary/20">
                  <feature.icon className="h-6 w-6 text-primary transition-colors duration-300 group-hover:text-primary-foreground" />
                </div>
                <h3 className="mb-2 text-xl font-bold text-foreground">{feature.title}</h3>
                <p className="text-muted-foreground transition-colors group-hover:text-foreground">{feature.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      <ProductsBrowse variant="home" />

      {/* CTA Section */}
      <section className="relative overflow-hidden border-y border-emerald-900/20 py-20 text-primary-foreground">
        <div
          className="absolute inset-0 bg-gradient-to-br from-emerald-950 via-teal-900 to-emerald-950"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -right-20 top-0 h-64 w-64 rounded-full bg-accent/20 blur-3xl"
          aria-hidden
        />
        <div
          className="pointer-events-none absolute -left-10 bottom-0 h-48 w-48 rounded-full bg-emerald-400/10 blur-3xl"
          aria-hidden
        />
        <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="flex flex-col gap-8 lg:flex-row lg:items-center lg:justify-between">
            <div className="animate-fade-in-up">
              <h2 className="text-balance text-3xl font-black tracking-tight lg:text-4xl">
                Need help choosing the right fertilizer?
              </h2>
              <p className="mt-3 text-lg text-emerald-100/85">Our experts are ready to assist you</p>
            </div>
            <div className="flex flex-wrap gap-4 animate-fade-in-up stagger-1">
              <Button
                size="lg"
                variant="secondary"
                asChild
                className="h-14 gap-2 rounded-full border border-emerald-200/30 bg-emerald-50 px-8 text-base font-semibold text-emerald-950 shadow-lg hover:bg-white hover:text-emerald-950"
              >
                <a href="tel:+923001234567" className="inline-flex items-center gap-2">
                  <Phone className="h-5 w-5 shrink-0" />
                  <span>
                    Call <span className="font-bold tabular-nums">0300-1234567</span>
                  </span>
                  <ArrowRight className="h-5 w-5 shrink-0" />
                </a>
              </Button>
              <Link href="/ledger">
                <Button
                  size="lg"
                  variant="outline"
                  className="h-14 gap-2 rounded-full border-2 border-emerald-200/40 bg-transparent px-8 text-base font-semibold text-primary-foreground backdrop-blur-sm transition-all hover:border-white/60 hover:bg-white/10"
                >
                  View ledgers
                  <ChevronRight className="h-5 w-5" />
                </Button>
              </Link>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-sidebar text-sidebar-foreground py-16">
        <div className="mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-12">
            {/* Brand */}
            <div className="md:col-span-2 animate-fade-in-up">
              <div className="mb-6 flex flex-wrap items-center gap-4">
                <GTLogo size="md" />
                <div>
                  <span className="block text-2xl font-black tracking-tight text-sidebar-foreground">Goraya Traders</span>
                  <span className="mt-1 block text-sm font-semibold uppercase tracking-wider text-emerald-300/90">
                    Arifwala Galla Mandi
                  </span>
                </div>
              </div>
              <p className="text-sidebar-foreground/70 leading-relaxed max-w-md">
                Your trusted partner for quality agricultural fertilizers since 2010. 
                Serving farmers across Punjab with premium products and expert guidance.
              </p>
            </div>
            
            {/* Contact */}
            <div className="animate-fade-in-up stagger-1">
              <h4 className="font-bold text-lg mb-6">Contact</h4>
              <ul className="space-y-4 text-sidebar-foreground/70">
                <li className="hover:text-sidebar-primary transition-colors cursor-pointer">0300-1234567</li>
                <li className="hover:text-sidebar-primary transition-colors cursor-pointer">goraya.traders@gmail.com</li>
                <li className="hover:text-sidebar-primary transition-colors cursor-pointer">Galla Mandi, Arifwala</li>
              </ul>
            </div>
            
            {/* Links */}
            <div className="animate-fade-in-up stagger-2">
              <h4 className="font-bold text-lg mb-6">Quick Links</h4>
              <ul className="space-y-4">
                {[
                  { href: "/products", label: "Products" },
                  { href: "/shop-finance", label: "Finance" },
                  { href: "/contact", label: "Contact" },
                  { href: "/ledger", label: "Ledgers" },
                  { href: "/customers", label: "Customers" },
                  { href: "/staff", label: "Staff" },
                  { href: "/cart", label: "Cart" },
                ].map((link) => (
                  <li key={link.href}>
                    <Link 
                      href={link.href} 
                      className="flex items-center gap-2 text-sidebar-foreground/90 transition-colors hover:text-emerald-300 hover:underline group"
                    >
                      {link.label}
                      <ArrowRight className="h-4 w-4 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 transition-all duration-300" />
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          </div>
          
          <div className="border-t border-sidebar-border mt-12 pt-8 flex flex-col sm:flex-row justify-between items-center gap-4">
            <p className="text-sm text-sidebar-foreground/50">
              &copy; 2026 Goraya Traders. All rights reserved.
            </p>
            <p className="text-sm text-sidebar-foreground/50">
              Made with care for farmers of Punjab
            </p>
          </div>
        </div>
      </footer>
    </div>
  )
}

export default function HomePage() {
  return <ShopContent />
}
