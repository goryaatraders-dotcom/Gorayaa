import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

function cartKey(sessionId: string, customerId?: string | null) {
  return customerId?.trim() ? `customer-${customerId.trim()}` : sessionId.trim()
}

export async function GET(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const customerId = searchParams.get("customerId")

    if (!sessionId && !customerId) {
      return NextResponse.json({ error: "sessionId or customerId required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("goryaaDB")
    const key = cartKey(sessionId || "", customerId)

    const doc = await db.collection("carts").findOne({ _id: key as any })
    if (!doc) {
      return NextResponse.json({ items: [], sessionId, customerId: customerId || null })
    }

    return NextResponse.json({
      items: doc.items ?? [],
      sessionId: doc.sessionId ?? sessionId,
      customerId: doc.customerId ?? customerId ?? null,
      updatedAt: doc.updatedAt ?? null,
    })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    console.error("DB GET Cart Error:", error)
    return NextResponse.json({ error: message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const body = await request.json()
    const { sessionId, customerId, items } = body

    if (!sessionId && !customerId) {
      return NextResponse.json({ ok: false, error: "sessionId or customerId required" }, { status: 400 })
    }
    if (!Array.isArray(items)) {
      return NextResponse.json({ ok: false, error: "items must be an array" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("goryaaDB")
    const key = cartKey(sessionId || "", customerId)
    const now = new Date().toISOString()

    const doc = {
      _id: key,
      sessionId: sessionId || null,
      customerId: customerId || null,
      items,
      updatedAt: now,
    }

    await db.collection("carts").updateOne({ _id: key as any }, { $set: doc }, { upsert: true })

    return NextResponse.json({ ok: true, cart: doc })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const { searchParams } = new URL(request.url)
    const sessionId = searchParams.get("sessionId")
    const customerId = searchParams.get("customerId")

    if (!sessionId && !customerId) {
      return NextResponse.json({ ok: false, error: "sessionId or customerId required" }, { status: 400 })
    }

    const client = await clientPromise
    const db = client.db("goryaaDB")
    const key = cartKey(sessionId || "", customerId)

    await db.collection("carts").deleteOne({ _id: key as any })
    return NextResponse.json({ ok: true })
  } catch (error: unknown) {
    const message = error instanceof Error ? error.message : "Unknown error"
    return NextResponse.json({ ok: false, error: message }, { status: 500 })
  }
}
