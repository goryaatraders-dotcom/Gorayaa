import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const orders = await db.collection("orders").find({}).sort({ createdAt: -1 }).toArray()
    const formatted = orders.map(o => ({
      ...o,
      id: o._id.toString(),
    }))
    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("DB GET Orders Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const body = await request.json()
    const {
      customerName,
      customerPhone,
      customerAddress,
      items,
      total,
      paymentMethod,
      paymentScreenshot,
      transactionId,
    } = body

    if (!customerName || !items || !items.length) {
      return NextResponse.json({ ok: false, error: "Invalid order details" }, { status: 400 })
    }

    const id = `order-${Date.now()}-${Math.random().toString(36).slice(2, 7)}`
    const trackingCode = `GT-${Math.floor(100000 + Math.random() * 900000)}`

    const newOrder = {
      _id: id,
      id,
      createdAt: new Date().toISOString(),
      customerName: customerName.trim(),
      customerPhone: (customerPhone || "").trim(),
      customerAddress: (customerAddress || "").trim(),
      items,
      total,
      paymentMethod,
      paymentScreenshot: paymentScreenshot || null,
      transactionId: transactionId || null,
      status: "pending",
      trackingCode,
    }

    await db.collection("orders").insertOne(newOrder as any)
    return NextResponse.json({ ok: true, order: newOrder })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
