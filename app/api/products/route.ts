import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const products = await db.collection("products").find({}).toArray()
    const formattedProducts = products.map((p) => {
      const { _id, ...rest } = p
      return {
        ...rest,
        id: rest.id || _id?.toString?.() || String(_id),
      }
    })
    return NextResponse.json(formattedProducts)
  } catch (error: any) {
    console.error("DB GET Products Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const body = await request.json()
    
    const id = `p-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`
    const newProduct = {
      ...body,
      id,
      _id: id,
    }
    
    await db.collection("products").insertOne(newProduct)
    return NextResponse.json({ ok: true, product: newProduct })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const body = await request.json()
    const { id, stock, ...updateData } = body
    
    if (!id) {
      return NextResponse.json({ ok: false, error: "Product id is required" }, { status: 400 })
    }

    const updates: any = {}
    if (stock !== undefined) {
      updates.stock = Math.max(0, Math.floor(Number(stock) || 0))
    }
    if (Object.keys(updateData).length > 0) {
      Object.assign(updates, updateData)
    }

    await db.collection("products").updateOne(
      { $or: [{ _id: id }, { id }] },
      { $set: updates }
    )
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
