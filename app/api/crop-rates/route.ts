import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

async function getDb() {
  const client = await clientPromise
  return client.db("goraya-traders")
}

export async function GET() {
  try {
    const db = await getDb()
    const cropRates = await db.collection("crop-rates").find({}).toArray()
    return NextResponse.json(cropRates.map((cr: any) => ({ ...cr, id: cr._id.toString() })))
  } catch (error) {
    console.error("DB GET CropRates Error:", error)
    return NextResponse.json({ error: "Failed to fetch crop rates" }, { status: 500 })
  }
}

export async function POST(req: Request) {
  try {
    const body = await req.json()
    const db = await getDb()
    
    const cropRate = {
      name: body.name,
      nameUrdu: body.nameUrdu || body.name,
      rate: body.rate,
      unit: body.unit || "40kg (Maund)",
      location: body.location || "Galla Mandi",
      trend: body.trend || "stable",
      isActive: body.isActive !== false,
      updatedAt: new Date().toISOString()
    }
    
    const result = await db.collection("crop-rates").insertOne(cropRate)
    
    return NextResponse.json({ ok: true, cropRate: { ...cropRate, id: result.insertedId.toString() } })
  } catch (error) {
    console.error("DB POST CropRates Error:", error)
    return NextResponse.json({ error: "Failed to create crop rate" }, { status: 500 })
  }
}

export async function PUT(req: Request) {
  try {
    const body = await req.json()
    const db = await getDb()
    
    const { id, ...updateData } = body
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ObjectId } = require("mongodb")
    
    updateData.updatedAt = new Date().toISOString()
    
    await db.collection("crop-rates").updateOne(
      { _id: new ObjectId(id) },
      { $set: updateData }
    )
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DB PUT CropRates Error:", error)
    return NextResponse.json({ error: "Failed to update crop rate" }, { status: 500 })
  }
}

export async function DELETE(req: Request) {
  try {
    const { searchParams } = new URL(req.url)
    const id = searchParams.get("id")
    
    if (!id) return NextResponse.json({ error: "Missing ID" }, { status: 400 })
    
    const db = await getDb()
    // eslint-disable-next-line @typescript-eslint/no-var-requires
    const { ObjectId } = require("mongodb")
    
    await db.collection("crop-rates").deleteOne({ _id: new ObjectId(id) })
    
    return NextResponse.json({ ok: true })
  } catch (error) {
    console.error("DB DELETE CropRates Error:", error)
    return NextResponse.json({ error: "Failed to delete crop rate" }, { status: 500 })
  }
}
