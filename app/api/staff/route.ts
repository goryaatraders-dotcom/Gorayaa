import { NextResponse } from "next/server"
import clientPromise from "@/lib/mongodb"

export async function GET() {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const staff = await db.collection("staff").find({}).toArray()
    const formatted = staff.map(s => ({
      ...s,
      id: s._id.toString(),
    }))
    return NextResponse.json(formatted)
  } catch (error: any) {
    console.error("DB GET Staff Error:", error)
    return NextResponse.json({ error: error.message }, { status: 500 })
  }
}

export async function POST(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const body = await request.json()
    const { name, nameUrdu, role, department, phone, salary } = body

    if (!name || !role) {
      return NextResponse.json({ ok: false, error: "Name and role are required" }, { status: 400 })
    }

    const id = `staff-${Date.now()}-${Math.random().toString(36).slice(2, 6)}`
    const newStaff = {
      _id: id,
      id,
      name,
      nameUrdu: nameUrdu || "",
      role,
      department: department || (role === "loader" ? "Load / Unload" : "Management"),
      phone: phone || "",
      salary: Number(salary) || 0,
      status: "active",
      password: "1234",
      advanceFromShop: 0,
      heldForStaff: 0,
    }

    await db.collection("staff").insertOne(newStaff as any)
    return NextResponse.json({ ok: true, staff: newStaff })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function PUT(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const body = await request.json()
    const { id, name, nameUrdu, role, department, phone, salary, status, password } = body

    if (!id) {
      return NextResponse.json({ ok: false, error: "Staff ID is required" }, { status: 400 })
    }

    const updateFields: any = {}
    if (name !== undefined) updateFields.name = name
    if (nameUrdu !== undefined) updateFields.nameUrdu = nameUrdu
    if (role !== undefined) updateFields.role = role
    if (department !== undefined) updateFields.department = department
    if (phone !== undefined) updateFields.phone = phone
    if (salary !== undefined) updateFields.salary = Number(salary) || 0
    if (status !== undefined) updateFields.status = status
    if (password !== undefined) updateFields.password = password

    await db.collection("staff").updateOne({ _id: id as any }, { $set: updateFields })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}

export async function DELETE(request: Request) {
  try {
    const client = await clientPromise
    const db = client.db("goryaaDB")
    const { searchParams } = new URL(request.url)
    const id = searchParams.get("id")

    if (!id) {
      return NextResponse.json({ ok: false, error: "Staff ID is required" }, { status: 400 })
    }

    await db.collection("staff").deleteOne({ _id: id as any })
    return NextResponse.json({ ok: true })
  } catch (error: any) {
    return NextResponse.json({ ok: false, error: error.message }, { status: 500 })
  }
}
