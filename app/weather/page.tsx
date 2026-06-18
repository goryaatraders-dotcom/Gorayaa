"use client"

import { useState } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  CloudSun, 
  Droplets, 
  Wind, 
  Thermometer, 
  CloudRain, 
  Sun, 
  ShieldAlert, 
  Sprout, 
  Calendar,
  Sparkles,
  Info
} from "lucide-react"
import { Header } from "@/components/header"
import { Badge } from "@/components/ui/badge"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { useCart } from "@/context/cart-context"

// Mock weather dataset for Arifwala, Punjab
const CURRENT_WEATHER = {
  temp: 36,
  condition: "Partly Cloudy",
  humidity: 65,
  wind: 12, // km/h
  precipitation: 15, // %
  uvIndex: 9, // Very High
  uvLevel: "Very High",
  location: "Arifwala, Punjab",
  updatedAt: "Updated 10 mins ago"
}

const FIVE_DAY_FORECAST = [
  { day: "Tomorrow", temp: 37, condition: "Sunny", humidity: 55, wind: 14, precipitation: 5, icon: Sun },
  { day: "Friday", temp: 35, condition: "Partly Cloudy", humidity: 62, wind: 10, precipitation: 20, icon: CloudSun },
  { day: "Saturday", temp: 33, condition: "Scattered Rain", humidity: 82, wind: 16, precipitation: 70, icon: CloudRain },
  { day: "Sunday", temp: 32, condition: "Thunderstorms", humidity: 88, wind: 18, precipitation: 90, icon: CloudRain },
  { day: "Monday", temp: 34, condition: "Clear Sky", humidity: 60, wind: 8, precipitation: 10, icon: Sun }
]

const FARM_ADVISORIES = [
  {
    title: "Fertilizer Application (Urea & DAP)",
    description: "Do NOT apply Urea or chemical sprays on Saturday or Sunday. High rain probability (70%-90%) will cause nitrogen runoff, leading to waste of fertilizer. Apply top-dressing today or wait until Monday when dry weather returns.",
    category: "critical",
    icon: ShieldAlert,
    badgeColor: "bg-rose-500/10 text-rose-600 border-rose-500/20"
  },
  {
    title: "Irrigation Schedule",
    description: "Hold off on irrigating your crops starting Friday evening. Natural rainfall expected over the weekend will provide ample soil moisture. Sowing fields should be kept clear to prevent waterlogging.",
    category: "irrigation",
    icon: Droplets,
    badgeColor: "bg-blue-500/10 text-blue-600 border-blue-500/20"
  },
  {
    title: "Pesticide Spray Guidelines",
    description: "Wind speeds are ideal today (12 km/h) for spraying pesticide on Cotton and Maize crops. Avoid spraying on Sunday morning as wind gusts might exceed 18 km/h, which leads to spray drift and uneven crop protection.",
    category: "general",
    icon: Wind,
    badgeColor: "bg-amber-500/10 text-amber-600 border-amber-500/20"
  },
  {
    title: "Harvesting Advice",
    description: "If you have mature Maize or early Kharif crops ready, complete harvesting before Friday evening. Store harvested crop grains in elevated, dry warehouses to protect them from rain damage.",
    category: "harvest",
    icon: Sprout,
    badgeColor: "bg-emerald-500/10 text-emerald-600 border-emerald-500/20"
  }
]

export default function WeatherAdvisoryPage() {
  const { totalItems } = useCart()
  const [activeTab, setActiveTab] = useState<"current" | "forecast" | "advisory">("current")

  return (
    <div className="min-h-screen bg-background">
      <Header cartCount={totalItems} />

      <main className="mx-auto max-w-7xl px-4 py-8 sm:px-6 lg:px-8">
        
        {/* Back Link */}
        <Link
          href="/"
          className="group mb-8 inline-flex items-center gap-2 text-sm text-muted-foreground transition-colors hover:text-foreground"
        >
          <ArrowLeft className="h-4 w-4 transition-transform group-hover:-translate-x-1" />
          Back to shop
        </Link>

        {/* Title Section */}
        <div className="mb-10 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
            Agricultural Weather
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
            Arifwala Weather & Farm Advisory
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Smart weather insights, 5-day forecasts, and actionable agricultural advice for Punjab farmers.
          </p>
        </div>

        {/* Dynamic Navigation Tabs */}
        <div className="flex border-b border-border/60 gap-8 mb-8 overflow-x-auto whitespace-nowrap scrollbar-none">
          {[
            { id: "current", label: "Current Conditions", icon: Thermometer },
            { id: "forecast", label: "5-Day Forecast", icon: Calendar },
            { id: "advisory", label: "Farming Advisories", icon: Sparkles }
          ].map((tab) => {
            const Icon = tab.icon
            return (
              <button
                key={tab.id}
                onClick={() => setActiveTab(tab.id as any)}
                className={`pb-4 text-base font-bold flex items-center gap-2 border-b-2 transition-all ${
                  activeTab === tab.id
                    ? "border-primary text-foreground"
                    : "border-transparent text-muted-foreground hover:text-foreground"
                }`}
              >
                <Icon className="h-5 w-5" />
                {tab.label}
              </button>
            )
          })}
        </div>

        {/* Tab Content rendering */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Main Display Pane (Left 2 Columns) */}
          <div className="lg:col-span-2 space-y-6">
            
            {activeTab === "current" && (
              <div className="space-y-6 animate-scale-in">
                {/* Current Weather Card */}
                <Card className="rounded-[2.5rem] border border-border/50 bg-gradient-to-br from-emerald-950 via-teal-950 to-emerald-900 text-white shadow-2xl relative overflow-hidden">
                  <div className="absolute inset-0 bg-[radial-gradient(circle_at_80%_20%,oklch(0.65_0.14_158_/_0.25),transparent_45%)]" />
                  <CardHeader className="relative z-10 pb-0">
                    <div className="flex justify-between items-center">
                      <div>
                        <CardTitle className="text-3xl font-black tracking-tight">{CURRENT_WEATHER.location}</CardTitle>
                        <CardDescription className="text-emerald-200/75 mt-0.5">{CURRENT_WEATHER.updatedAt}</CardDescription>
                      </div>
                      <CloudSun className="h-16 w-16 text-accent animate-float" />
                    </div>
                  </CardHeader>
                  <CardContent className="relative z-10 pt-6">
                    <div className="flex items-baseline gap-2">
                      <span className="text-7xl font-black tracking-tighter">{CURRENT_WEATHER.temp}°C</span>
                      <span className="text-xl font-semibold text-emerald-100">{CURRENT_WEATHER.condition}</span>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mt-8 pt-6 border-t border-white/10">
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Droplets className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="text-xxs text-emerald-200/70 uppercase font-semibold">Humidity</p>
                          <p className="text-base font-bold">{CURRENT_WEATHER.humidity}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Wind className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="text-xxs text-emerald-200/70 uppercase font-semibold">Wind</p>
                          <p className="text-base font-bold">{CURRENT_WEATHER.wind} km/h</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <CloudRain className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="text-xxs text-emerald-200/70 uppercase font-semibold">Precipitation</p>
                          <p className="text-base font-bold">{CURRENT_WEATHER.precipitation}%</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-3">
                        <div className="h-10 w-10 rounded-xl bg-white/10 flex items-center justify-center">
                          <Sun className="h-5 w-5 text-emerald-300" />
                        </div>
                        <div>
                          <p className="text-xxs text-emerald-200/70 uppercase font-semibold">UV Index</p>
                          <p className="text-base font-bold">{CURRENT_WEATHER.uvIndex} ({CURRENT_WEATHER.uvLevel})</p>
                        </div>
                      </div>
                    </div>
                  </CardContent>
                </Card>

                {/* Farming Tips summary */}
                <Card className="rounded-[2rem] border border-border/50 bg-card/90 shadow-xl p-6 space-y-4">
                  <div className="flex items-center gap-2">
                    <Info className="h-5 w-5 text-primary" />
                    <h3 className="font-bold text-lg text-foreground">Today's Spray Recommendation</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    Sunny and low-humidity weather conditions today make it an excellent time to apply <strong>DAP or secondary fertilizers</strong> to your fields. Wind speeds are low (12 km/h), ensuring minimal chemical spray drift. Make sure to complete application before rain arrives on Friday night.
                  </p>
                </Card>
              </div>
            )}

            {activeTab === "forecast" && (
              <div className="space-y-4 animate-scale-in">
                <h3 className="text-xl font-bold text-foreground px-1 mb-2">5-Day Agricultural Forecast</h3>
                {FIVE_DAY_FORECAST.map((day, index) => {
                  const WeatherIcon = day.icon
                  return (
                    <Card key={index} className="rounded-2xl border border-border/60 bg-card hover:bg-secondary/20 transition-all duration-300">
                      <CardContent className="p-5 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
                        <div className="flex items-center gap-4">
                          <div className="h-12 w-12 rounded-full bg-primary/10 text-primary flex items-center justify-center shrink-0">
                            <WeatherIcon className="h-6 w-6" />
                          </div>
                          <div>
                            <p className="font-bold text-base text-foreground">{day.day}</p>
                            <p className="text-sm text-muted-foreground">{day.condition}</p>
                          </div>
                        </div>

                        <div className="grid grid-cols-3 gap-4 sm:gap-8 text-center sm:text-right">
                          <div>
                            <p className="text-xxs text-muted-foreground uppercase font-semibold">Temp</p>
                            <p className="text-base font-black text-foreground">{day.temp}°C</p>
                          </div>
                          <div>
                            <p className="text-xxs text-muted-foreground uppercase font-semibold">Humidity</p>
                            <p className="text-base font-bold text-foreground">{day.humidity}%</p>
                          </div>
                          <div>
                            <p className="text-xxs text-muted-foreground uppercase font-semibold">Rain Prob.</p>
                            <p className="text-base font-bold text-primary">{day.precipitation}%</p>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  )
                })}
              </div>
            )}

            {activeTab === "advisory" && (
              <div className="space-y-6 animate-scale-in">
                <h3 className="text-xl font-bold text-foreground px-1">Detailed Fertilizer & Crop Advice</h3>
                <div className="grid gap-6">
                  {FARM_ADVISORIES.map((adv, index) => {
                    const AdvIcon = adv.icon
                    return (
                      <Card key={index} className="rounded-3xl border border-border/50 bg-card overflow-hidden shadow-sm">
                        <CardHeader className="bg-secondary/40 pb-3">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center gap-2.5">
                              <div className="h-8 w-8 rounded-lg bg-primary/10 text-primary flex items-center justify-center">
                                <AdvIcon className="h-4.5 w-4.5" />
                              </div>
                              <CardTitle className="text-base font-bold">{adv.title}</CardTitle>
                            </div>
                            <Badge className={`rounded-full border px-2.5 py-0.5 font-semibold text-xs capitalize ${adv.badgeColor}`}>
                              {adv.category}
                            </Badge>
                          </div>
                        </CardHeader>
                        <CardContent className="p-6">
                          <p className="text-sm leading-relaxed text-muted-foreground">
                            {adv.description}
                          </p>
                        </CardContent>
                      </Card>
                    )
                  })}
                </div>
              </div>
            )}

          </div>

          {/* Right Column - Weather guidelines & quick links */}
          <div className="space-y-6">
            
            {/* Quick stats / UV guide */}
            <Card className="rounded-[2rem] border border-border/50 bg-card/90 shadow-xl overflow-hidden">
              <CardHeader className="bg-secondary/25 pb-4">
                <CardTitle className="text-lg font-bold">Weather Thresholds for Spray</CardTitle>
              </CardHeader>
              <CardContent className="p-6 space-y-4 text-xs">
                <p className="text-muted-foreground leading-relaxed">
                  Avoid fertilizer or pesticide spray application when current weather metrics hit these thresholds:
                </p>
                <div className="space-y-2">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-foreground">Wind Speed</span>
                    <span className="text-rose-500 font-bold">&gt; 15 km/h</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-foreground">Air Temp</span>
                    <span className="text-rose-500 font-bold">&gt; 38°C</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-semibold text-foreground">Humidity</span>
                    <span className="text-rose-500 font-bold">&gt; 80%</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-semibold text-foreground">Rain Forecast</span>
                    <span className="text-rose-500 font-bold">&lt; 12 hours away</span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Need expert advice Card */}
            <Card className="rounded-[2rem] border-0 bg-gradient-to-r from-emerald-950 to-teal-900 text-white p-6 shadow-xl relative overflow-hidden">
              <div className="absolute inset-0 bg-[linear-gradient(120deg,rgba(255,255,255,0.05),transparent_40%)]" />
              <div className="relative z-10 space-y-4">
                <h3 className="font-bold text-lg">Talk to our Agronomist</h3>
                <p className="text-xs text-emerald-100/90 leading-relaxed">
                  Unsure about weather changes or looking for seed and fertilizer selection customized for your crop fields in Arifwala? Call our expert hotline.
                </p>
                <div className="pt-2">
                  <a href="tel:+923001234567" className="inline-flex items-center justify-center w-full h-11 bg-white text-emerald-950 font-bold rounded-full text-sm hover:bg-emerald-50 transition-colors shadow-md">
                    Call 0300-1234567
                  </a>
                </div>
              </div>
            </Card>

          </div>

        </div>
      </main>
    </div>
  )
}
