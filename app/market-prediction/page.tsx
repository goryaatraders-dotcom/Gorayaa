"use client"

import { useState, useMemo } from "react"
import Link from "next/link"
import { 
  ArrowLeft, 
  TrendingUp, 
  TrendingDown, 
  Activity, 
  Calculator, 
  Sparkles, 
  MapPin, 
  Scale, 
  DollarSign 
} from "lucide-react"
import { Header } from "@/components/header"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Badge } from "@/components/ui/badge"
import { Separator } from "@/components/ui/separator"
import { useCropRates } from "@/context/crop-rates-context"
import { useCart } from "@/context/cart-context"
import {
  ResponsiveContainer,
  AreaChart,
  Area,
  XAxis,
  YAxis,
  Tooltip,
  CartesianGrid
} from "recharts"

// Predefined mock historical trends for realistic visual chart representation
const MOCK_HISTORICAL_DATA: Record<string, { date: string; rate: number }[]> = {
  "Wheat": [
    { date: "Jan", rate: 3500 },
    { date: "Feb", rate: 3600 },
    { date: "Mar", rate: 3750 },
    { date: "Apr", rate: 3700 },
    { date: "May", rate: 3820 },
    { date: "Jun", rate: 3800 },
  ],
  "Rice (Basmati)": [
    { date: "Jan", rate: 8100 },
    { date: "Feb", rate: 8300 },
    { date: "Mar", rate: 8400 },
    { date: "Apr", rate: 8600 },
    { date: "May", rate: 8550 },
    { date: "Jun", rate: 8500 },
  ],
  "Cotton": [
    { date: "Jan", rate: 7800 },
    { date: "Feb", rate: 7650 },
    { date: "Mar", rate: 7500 },
    { date: "Apr", rate: 7350 },
    { date: "May", rate: 7280 },
    { date: "Jun", rate: 7200 },
  ],
  "Sugarcane": [
    { date: "Jan", rate: 420 },
    { date: "Feb", rate: 430 },
    { date: "Mar", rate: 440 },
    { date: "Apr", rate: 440 },
    { date: "May", rate: 445 },
    { date: "Jun", rate: 450 },
  ],
  "Maize (Corn)": [
    { date: "Jan", rate: 2150 },
    { date: "Feb", rate: 2200 },
    { date: "Mar", rate: 2250 },
    { date: "Apr", rate: 2220 },
    { date: "May", rate: 2190 },
    { date: "Jun", rate: 2200 },
  ]
}

const MOCK_PREDICTIONS: Record<string, {
  weeklyForecast: number[]
  sentiment: "Bullish" | "Bearish" | "Stable"
  confidence: number
  analysis: string
  recommendation: string
}> = {
  "Wheat": {
    weeklyForecast: [3850, 3900, 3960, 4020],
    sentiment: "Bullish",
    confidence: 88,
    analysis: "Strong domestic demand coupled with tight stocks in Punjab grain markets is pushing prices up. Flour mills are aggressively restocking before summer ends.",
    recommendation: "Hold your stock. Price is expected to break Rs. 4,000 per Maund in the next 3 weeks. Sell partially around mid-July."
  },
  "Rice (Basmati)": {
    weeklyForecast: [8480, 8510, 8490, 8520],
    sentiment: "Stable",
    confidence: 75,
    analysis: "Export orders are steady, but local supply from millers is matching demand. Prices are holding stable around the current average.",
    recommendation: "Hold or sell as needed. No major market swings are anticipated. Ideal time to sell if cash flow is needed immediately."
  },
  "Cotton": {
    weeklyForecast: [7150, 7080, 7000, 6950],
    sentiment: "Bearish",
    confidence: 82,
    analysis: "Higher international production rates and reduced buying interest from local spinning mills are creating downward pressure on cotton rates.",
    recommendation: "Sell now. Crop rates are expected to slide further. Unload your current stock before the price touches Rs. 7,000."
  },
  "Sugarcane": {
    weeklyForecast: [455, 460, 468, 475],
    sentiment: "Bullish",
    confidence: 90,
    analysis: "Millers are offering premium rates to secure sugarcane supply due to lower crop acreage in south Punjab this season.",
    recommendation: "Hold. Mills will increase purchase incentives in the coming weeks. Wait for the peak season prices."
  },
  "Maize (Corn)": {
    weeklyForecast: [2210, 2215, 2220, 2225],
    sentiment: "Stable",
    confidence: 70,
    analysis: "Poultry feed manufacturers are purchasing at regular volumes. Supply arrivals from central Punjab are steady.",
    recommendation: "Sell. Price is stable and holding costs will exceed minor gains. Deliver to nearby Mandi."
  }
}

export default function MarketPredictionPage() {
  const { totalItems } = useCart()
  const { cropRates } = useCropRates()
  
  // Filter active crop rates in database
  const dbCropRates = useMemo(() => cropRates.filter(cr => cr.isActive), [cropRates])
  
  const [selectedCropId, setSelectedCropId] = useState<string>(dbCropRates[0]?.id || "crop-1")
  const [maundsInput, setMaundsInput] = useState<string>("50")

  const currentCrop = useMemo(() => {
    return dbCropRates.find(c => c.id === selectedCropId) || dbCropRates[0]
  }, [selectedCropId, dbCropRates])

  const chartData = useMemo(() => {
    if (!currentCrop) return []
    const key = currentCrop.name.includes("Rice") ? "Rice (Basmati)" : currentCrop.name.includes("Maize") ? "Maize (Corn)" : currentCrop.name
    const history = MOCK_HISTORICAL_DATA[key] || []
    
    // Append the actual current rate as the last data point
    return [
      ...history,
      { date: "Current", rate: currentCrop.rate }
    ]
  }, [currentCrop])

  const predictionInfo = useMemo(() => {
    if (!currentCrop) return null
    const key = currentCrop.name.includes("Rice") ? "Rice (Basmati)" : currentCrop.name.includes("Maize") ? "Maize (Corn)" : currentCrop.name
    return MOCK_PREDICTIONS[key] || {
      weeklyForecast: [currentCrop.rate * 1.01, currentCrop.rate * 1.02, currentCrop.rate * 1.03, currentCrop.rate * 1.04],
      sentiment: "Stable" as const,
      confidence: 70,
      analysis: "Regular market activity. Prices expected to remain steady.",
      recommendation: "Hold or sell based on your immediate cash needs."
    }
  }, [currentCrop])

  // Simulator calculation
  const calculatedTotal = useMemo(() => {
    if (!currentCrop) return 0
    const val = parseFloat(maundsInput) || 0
    return val * currentCrop.rate
  }, [maundsInput, currentCrop])

  if (!currentCrop) {
    return (
      <div className="min-h-screen bg-background">
        <Header cartCount={totalItems} />
        <div className="mx-auto max-w-7xl px-4 py-20 text-center">
          <p className="text-xl text-muted-foreground">Loading market crop data...</p>
        </div>
      </div>
    )
  }

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

        {/* Title */}
        <div className="mb-10 animate-fade-in-up">
          <Badge variant="secondary" className="mb-4 rounded-full px-4 py-1">
            Market Intelligence
          </Badge>
          <h1 className="text-4xl font-black tracking-tight text-foreground lg:text-5xl">
            Crop Market Predictions
          </h1>
          <p className="mt-2 text-lg text-muted-foreground">
            Real-time Galla Mandi rates, price prediction models, and trade calculator.
          </p>
        </div>

        {/* Grid Layout */}
        <div className="grid grid-cols-1 gap-8 lg:grid-cols-3">
          
          {/* Left Column - Crop Selector & Chart */}
          <div className="space-y-6 lg:col-span-2">
            {/* Selector Buttons */}
            <div className="flex flex-wrap gap-2 animate-fade-in-up">
              {dbCropRates.map((crop) => (
                <button
                  key={crop.id}
                  onClick={() => setSelectedCropId(crop.id)}
                  className={`flex items-center gap-2.5 rounded-2xl px-5 py-3 text-sm font-semibold transition-all duration-300 border ${
                    selectedCropId === crop.id
                      ? "bg-primary text-primary-foreground border-primary shadow-lg shadow-primary/25"
                      : "bg-card text-foreground border-border/80 hover:bg-secondary/50"
                  }`}
                >
                  <span>{crop.name}</span>
                  <span className="text-xs opacity-75">{crop.nameUrdu}</span>
                </button>
              ))}
            </div>

            {/* Interactive Graph Card */}
            <Card className="rounded-[2rem] border border-border/50 bg-card/90 shadow-xl overflow-hidden animate-fade-in-up stagger-1">
              <CardHeader className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4 pb-2">
                <div>
                  <CardTitle className="text-2xl font-bold flex items-center gap-2">
                    <Activity className="h-5 w-5 text-primary" />
                    Price Trend Chart
                  </CardTitle>
                  <CardDescription>
                    Historical pricing for {currentCrop.name} per Maund (40kg)
                  </CardDescription>
                </div>
                <div className="flex items-center gap-4">
                  <div className="text-right">
                    <span className="text-xs text-muted-foreground uppercase">Current Rate</span>
                    <p className="text-2xl font-black text-foreground">
                      Rs. {currentCrop.rate.toLocaleString()}
                    </p>
                  </div>
                  <Badge className={`rounded-full px-3 py-1 flex items-center gap-1 ${
                    currentCrop.trend === "up" 
                      ? "bg-emerald-500/15 text-emerald-600 border border-emerald-500/20" 
                      : currentCrop.trend === "down" 
                      ? "bg-rose-500/15 text-rose-600 border border-rose-500/20" 
                      : "bg-gray-500/15 text-gray-600 border border-gray-500/20"
                  }`}>
                    {currentCrop.trend === "up" ? (
                      <TrendingUp className="h-4 w-4" />
                    ) : currentCrop.trend === "down" ? (
                      <TrendingDown className="h-4 w-4" />
                    ) : null}
                    <span className="font-semibold text-xs capitalize">{currentCrop.trend}</span>
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="pt-6">
                <div className="h-[320px] w-full">
                  <ResponsiveContainer width="100%" height="100%">
                    <AreaChart data={chartData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                      <defs>
                        <linearGradient id="colorRate" x1="0" y1="0" x2="0" y2="1">
                          <stop offset="5%" stopColor="oklch(0.55 0.14 158)" stopOpacity={0.4}/>
                          <stop offset="95%" stopColor="oklch(0.55 0.14 158)" stopOpacity={0.0}/>
                        </linearGradient>
                      </defs>
                      <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#E2E8F0" />
                      <XAxis 
                        dataKey="date" 
                        stroke="#94A3B8" 
                        fontSize={12} 
                        tickLine={false} 
                      />
                      <YAxis 
                        stroke="#94A3B8" 
                        fontSize={12} 
                        tickLine={false} 
                        domain={["auto", "auto"]}
                      />
                      <Tooltip
                        contentStyle={{
                          backgroundColor: "rgba(255, 255, 255, 0.95)",
                          border: "1px solid #E2E8F0",
                          borderRadius: "16px",
                          boxShadow: "0 10px 15px -3px rgba(0,0,0,0.05)"
                        }}
                        labelClassName="font-bold text-foreground"
                      />
                      <Area 
                        type="monotone" 
                        dataKey="rate" 
                        stroke="oklch(0.55 0.14 158)" 
                        strokeWidth={3} 
                        fillOpacity={1} 
                        fill="url(#colorRate)" 
                      />
                    </AreaChart>
                  </ResponsiveContainer>
                </div>
              </CardContent>
            </Card>

            {/* Trading Simulator calculator */}
            <Card className="rounded-[2rem] border border-border/50 bg-card/90 shadow-xl overflow-hidden animate-fade-in-up stagger-2">
              <CardHeader>
                <CardTitle className="text-xl font-bold flex items-center gap-2">
                  <Calculator className="h-5 w-5 text-primary" />
                  Crop Trading Calculator
                </CardTitle>
                <CardDescription>
                  Calculate estimated payout if you sell your crop harvest to Goraya Traders at current market rates.
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Harvest Quantity (Maunds)</label>
                    <div className="relative">
                      <Scale className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        type="number"
                        placeholder="Maunds (1 Maund = 40kg)"
                        className="h-12 rounded-xl pl-12 bg-background font-bold text-base"
                        value={maundsInput}
                        onChange={(e) => setMaundsInput(e.target.value)}
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-xs font-semibold text-muted-foreground uppercase">Current Rate per Maund</label>
                    <div className="relative">
                      <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-muted-foreground" />
                      <Input
                        disabled
                        className="h-12 rounded-xl pl-12 bg-secondary/40 font-bold text-base text-foreground"
                        value={`Rs. ${currentCrop.rate.toLocaleString()}`}
                      />
                    </div>
                  </div>
                </div>

                <div className="mt-4 p-4 rounded-2xl bg-primary/5 border border-primary/10 flex flex-col sm:flex-row justify-between items-center gap-4">
                  <div>
                    <span className="text-xs text-muted-foreground uppercase">Estimated Total Revenue</span>
                    <p className="text-3xl font-black text-primary">
                      Rs. {calculatedTotal.toLocaleString()}
                    </p>
                  </div>
                  <Button asChild className="rounded-full px-6 h-12 gap-2 shadow-md">
                    <a href="tel:+923001234567">
                      Call to Sell Now
                    </a>
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Right Column - Predictions & Advice */}
          <div className="space-y-6">
            
            {/* AI Prediction Card */}
            {predictionInfo && (
              <Card className="rounded-[2rem] border border-border/50 bg-card/90 shadow-xl overflow-hidden animate-fade-in-up stagger-1">
                <CardHeader className="bg-gradient-to-br from-emerald-500/10 to-teal-500/5 pb-4 border-b border-border/40">
                  <div className="flex justify-between items-center mb-1">
                    <CardTitle className="text-lg font-black flex items-center gap-2 text-foreground">
                      <Sparkles className="h-5 w-5 text-accent animate-pulse" />
                      AI Price Prediction
                    </CardTitle>
                    <Badge className="bg-emerald-600 text-white font-semibold text-xs rounded-full">
                      {predictionInfo.confidence}% Conf.
                    </Badge>
                  </div>
                  <CardDescription>
                    Weekly forecast for July 2026
                  </CardDescription>
                </CardHeader>
                <CardContent className="p-6 space-y-6">
                  
                  {/* Sentiment & Status */}
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-semibold text-muted-foreground">Market Trend</span>
                    <Badge className={`rounded-full px-3 py-1 font-bold text-sm ${
                      predictionInfo.sentiment === "Bullish"
                        ? "bg-emerald-500/10 text-emerald-600 border border-emerald-500/20"
                        : predictionInfo.sentiment === "Bearish"
                        ? "bg-rose-500/10 text-rose-600 border border-rose-500/20"
                        : "bg-gray-500/10 text-gray-600 border border-gray-500/20"
                    }`}>
                      {predictionInfo.sentiment === "Bullish" ? "📈 Bullish" : predictionInfo.sentiment === "Bearish" ? "📉 Bearish" : "↔ Stable"}
                    </Badge>
                  </div>

                  {/* Future Rates Forecast */}
                  <div className="space-y-3">
                    <span className="text-xs font-bold uppercase text-muted-foreground">4-Week Price Forecast (Rs.)</span>
                    <div className="grid grid-cols-4 gap-2">
                      {predictionInfo.weeklyForecast.map((val, idx) => (
                        <div key={idx} className="bg-secondary/40 border border-border/60 rounded-xl p-2 text-center">
                          <p className="text-xxs font-semibold text-muted-foreground">Week {idx + 1}</p>
                          <p className="text-sm font-black text-foreground mt-0.5">
                            {Math.round(val)}
                          </p>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator />

                  {/* Analysis Description */}
                  <div className="space-y-2">
                    <span className="text-xs font-bold uppercase text-muted-foreground">Market Analysis</span>
                    <p className="text-sm text-muted-foreground leading-relaxed">
                      {predictionInfo.analysis}
                    </p>
                  </div>

                  {/* Recommendation Alert Box */}
                  <div className="p-4 rounded-2xl bg-accent/10 border border-accent/20 text-sm font-medium text-foreground">
                    <strong className="text-accent block mb-1">Recommended Action:</strong>
                    {predictionInfo.recommendation}
                  </div>

                </CardContent>
              </Card>
            )}

            {/* Mandi Locations Info Card */}
            <Card className="rounded-[2rem] border border-border/50 bg-card/90 shadow-xl overflow-hidden animate-fade-in-up stagger-2">
              <CardHeader>
                <CardTitle className="text-lg font-bold flex items-center gap-2">
                  <MapPin className="h-5 w-5 text-primary" />
                  Mandi Reference Locations
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4 text-sm">
                <p className="text-muted-foreground leading-relaxed">
                  Goraya Traders tracks crop rate updates across the major Mandis in Punjab to ensure we provide fair pricing.
                </p>
                <div className="space-y-2.5">
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-foreground">Wheat</span>
                    <span className="text-muted-foreground">Faisalabad Mandi</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-foreground">Rice (Basmati)</span>
                    <span className="text-muted-foreground">Sargodha Mandi</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-foreground">Cotton</span>
                    <span className="text-muted-foreground">Multan Mandi</span>
                  </div>
                  <div className="flex justify-between border-b pb-2">
                    <span className="font-medium text-foreground">Sugarcane</span>
                    <span className="text-muted-foreground">Jhang Mill Gate</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="font-medium text-foreground">Maize</span>
                    <span className="text-muted-foreground">Okara Mandi</span>
                  </div>
                </div>
              </CardContent>
            </Card>

          </div>

        </div>
      </main>
    </div>
  )
}
