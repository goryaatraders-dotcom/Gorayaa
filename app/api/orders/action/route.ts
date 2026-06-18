import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const body = await request.json()
    const { orderId, action } = body

    if (!orderId || !action) {
      return NextResponse.json({ ok: false, error: "Missing required parameters" }, { status: 400 })
    }

    const ordersColl = db.collection("orders")
    const productsColl = db.collection("products")
    const ledgersColl = db.collection("ledgers")
    const customersColl = db.collection("customers")

    const order = await ordersColl.findOne({ _id: orderId as any })
    if (!order) {
      return NextResponse.json({ ok: false, error: "Order not found" }, { status: 404 })
    }

    if (action === "approve") {
      if (order.status !== "pending") {
        return NextResponse.json({ ok: false, error: "Order must be in pending status to approve" }, { status: 400 })
      }

      // Check stock
      for (const item of order.items) {
        const prod = await productsColl.findOne({ _id: item.productId as any })
        if (!prod || prod.stock < item.quantity) {
          return NextResponse.json({
            ok: false,
            error: `Insufficient stock for ${item.name || "product"}. Available: ${prod ? prod.stock : 0}`
          }, { status: 400 })
        }
      }

      // Deduct stock
      for (const item of order.items) {
        await productsColl.updateOne(
          { _id: item.productId as any },
          { $inc: { stock: -item.quantity } }
        )
      }

      // Find or create customer
      const customer = await customersColl.findOne({ phone: order.customerPhone })
      const customerId = customer ? customer._id.toString() : `c-${Date.now()}`
      const currentBalance = customer ? (customer.balance || 0) : 0

      if (!customer) {
        const newCust = {
          _id: customerId as any,
          id: customerId,
          name: order.customerName,
          phone: order.customerPhone,
          address: order.customerAddress,
          balance: 0,
          createdAt: new Date().toISOString().slice(0, 10),
        }
        await customersColl.insertOne(newCust as any)
      }

      // Create ledger entry
      const itemsDescription = order.items.map((i: any) => `${i.name} (${i.quantity} bags)`).join(", ")
      const prepaid = order.paymentMethod !== "cod"
      const debit = order.total
      const credit = prepaid ? order.total : 0
      const newBalance = currentBalance + (debit - credit)

      await customersColl.updateOne(
        { _id: customerId as any },
        { $set: { balance: newBalance } }
      )

      const ledgerEntryId = `le-${Date.now()}`
      await ledgersColl.insertOne({
        _id: `sales-${ledgerEntryId}` as any,
        id: ledgerEntryId,
        customerId,
        customerName: order.customerName,
        date: new Date().toISOString().slice(0, 10),
        type: "sale",
        saleType: prepaid ? "cash" : "routine",
        description: `Order ${order.trackingCode}: ${itemsDescription}`,
        debit,
        credit,
        balance: newBalance,
        bookId: "sales",
      } as any)

      await ordersColl.updateOne({ _id: orderId as any }, { $set: { status: "approved" } })

    } else if (action === "ship") {
      if (order.status !== "approved") {
        return NextResponse.json({ ok: false, error: "Order must be approved before shipping" }, { status: 400 })
      }
      await ordersColl.updateOne({ _id: orderId as any }, { $set: { status: "shipped" } })

    } else if (action === "deliver") {
      if (order.status !== "shipped" && order.status !== "approved") {
        return NextResponse.json({ ok: false, error: "Order must be approved or shipped to deliver" }, { status: 400 })
      }

      // If COD, record payment when delivered
      if (order.paymentMethod === "cod") {
        const customer = await customersColl.findOne({ phone: order.customerPhone })
        if (customer) {
          const debit = 0
          const credit = order.total
          const newBalance = (customer.balance || 0) - credit

          await customersColl.updateOne(
            { _id: customer._id as any },
            { $set: { balance: newBalance } }
          )

          const ledgerEntryId = `le-pay-${Date.now()}`
          await ledgersColl.insertOne({
            _id: `sales-${ledgerEntryId}` as any,
            id: ledgerEntryId,
            customerId: customer._id.toString(),
            customerName: order.customerName,
            date: new Date().toISOString().slice(0, 10),
            type: "payment",
            description: `Payment for Order ${order.trackingCode}`,
            debit,
            credit,
            balance: newBalance,
            bookId: "sales",
          } as any)
        }
      }

      await ordersColl.updateOne({ _id: orderId as any }, { $set: { status: "delivered" } })

    } else if (action === "cancel") {
      if (order.status === "approved" || order.status === "shipped" || order.status === "delivered") {
        for (const item of order.items) {
          await productsColl.updateOne(
            { _id: item.productId as any },
            { $inc: { stock: item.quantity } }
          )
        }
        
        const customer = await customersColl.findOne({ phone: order.customerPhone })
        if (customer) {
          const debit = 0
          const credit = order.paymentMethod !== "cod" ? order.total : 0
          const refundAmount = order.total - credit
          const newBalance = (customer.balance || 0) - refundAmount
          
          await customersColl.updateOne(
            { _id: customer._id as any },
            { $set: { balance: newBalance } }
          )
        }
      }
      await ordersColl.updateOne({ _id: orderId as any }, { $set: { status: "cancelled" } })
    } else {
      return NextResponse.json({ ok: false, error: "Invalid action" }, { status: 400 })
    }

    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
