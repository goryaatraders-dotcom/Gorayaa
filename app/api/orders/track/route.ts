import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")

    const { searchParams } = new URL(request.url)
    const query = searchParams.get("query")

    if (!query) {
      return NextResponse.json({ ok: false, error: "Query parameter is required" }, { status: 400 })
    }

    const ordersColl = db.collection("orders")
    const normalizedQuery = query.trim()
    const orders = await ordersColl.find({
      $or: [
        { trackingCode: normalizedQuery },
        { id: normalizedQuery },
        { customerPhone: normalizedQuery },
      ]
    }).sort({ createdAt: -1 }).toArray()

    const formatted = orders.map(o => ({
      ...o,
      id: o._id.toString(),
    }))

    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
