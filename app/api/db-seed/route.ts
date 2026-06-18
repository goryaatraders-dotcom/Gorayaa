import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"
import { seedProducts, staffMembers, customers, ledgerEntriesByBook, seedOrders, seedCropRates } from "@/lib/data"

export async function GET(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")

    const { searchParams } = new URL(request.url)
    const force = searchParams.get("force") === "true"

    // 1. Seed Products
    const productsColl = db.collection("products")
    const existingProducts = await productsColl.countDocuments()
    if (force || existingProducts === 0) {
      if (force) await productsColl.deleteMany({})
      await productsColl.insertMany(
        seedProducts.map(p => ({
          ...p,
          _id: p.id as any,
        }))
      )
    }

    // 2. Seed Staff
    const staffColl = db.collection("staff")
    const existingStaff = await staffColl.countDocuments()
    if (force || existingStaff === 0) {
      if (force) await staffColl.deleteMany({})
      await staffColl.insertMany(
        staffMembers.map(s => ({
          ...s,
          password: "1234",
          _id: s.id as any,
        }))
      )
    }

    // 3. Seed Customers
    const customersColl = db.collection("customers")
    const existingCustomers = await customersColl.countDocuments()
    if (force || existingCustomers === 0) {
      if (force) await customersColl.deleteMany({})
      await customersColl.insertMany(
        customers.map(c => ({
          ...c,
          password: "1234",
          _id: c.id as any,
        }))
      )
    }

    // 4. Seed Ledgers
    const ledgersColl = db.collection("ledgers")
    const existingLedgers = await ledgersColl.countDocuments()
    if (force || existingLedgers === 0) {
      if (force) await ledgersColl.deleteMany({})
      
      const documents: any[] = []
      Object.entries(ledgerEntriesByBook).forEach(([bookId, entries]) => {
        entries.forEach((entry) => {
          documents.push({
            ...entry,
            bookId,
            _id: `${bookId}-${entry.id}` as any,
          })
        })
      })
      if (documents.length > 0) {
        await ledgersColl.insertMany(documents)
      }
    }

    // 5. Seed Orders
    const ordersColl = db.collection("orders")
    const existingOrders = await ordersColl.countDocuments()
    if (force || existingOrders === 0) {
      if (force) await ordersColl.deleteMany({})
      await ordersColl.insertMany(
        seedOrders.map(o => ({
          ...o,
          _id: o.id as any,
        }))
      )
    }

    // 6. Seed Crop Rates
    const cropRatesColl = db.collection("crop-rates")
    const existingCropRates = await cropRatesColl.countDocuments()
    if (force || existingCropRates === 0) {
      if (force) await cropRatesColl.deleteMany({})
      await cropRatesColl.insertMany(
        seedCropRates.map(cr => ({
          ...cr,
          _id: cr.id as any,
        }))
      )
    }

    return NextResponse.json({
      ok: true,
      message: "Database seeded successfully",
      stats: {
        products: await productsColl.countDocuments(),
        staff: await staffColl.countDocuments(),
        customers: await customersColl.countDocuments(),
        ledgers: await ledgersColl.countDocuments(),
        orders: await ordersColl.countDocuments(),
        cropRates: await cropRatesColl.countDocuments(),
      }
    })
  } catch (error: any) {
    console.error("Seeding error:", error)
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
