import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const customers = await db.collection("customers").find({}).toArray()
    const formatted = customers.map(c => ({
      ...c,
      id: c._id.toString(),
    }))
    return NextResponse.json(formatted)
  } catch (error: any) {
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const body = await request.json()
    const { name, phone, address, balance } = body

    if (!name || !phone) {
      return NextResponse.json({ ok: false, error: "Name and phone are required" }, { status: 400 })
    }

    const id = `c-${Date.now()}`
    const newCustomer = {
      _id: id,
      id,
      name: name.trim(),
      phone: phone.trim(),
      password: "1234",
      address: (address || "").trim(),
      balance: Number(balance) || 0,
      createdAt: new Date().toISOString().slice(0, 10),
    }

    await db.collection("customers").insertOne(newCustomer)
    return NextResponse.json({ ok: true, customer: newCustomer })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
