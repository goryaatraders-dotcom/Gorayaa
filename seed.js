const { MongoClient } = require("mongodb");
const fs = require("fs");
const path = require("path");

// Load .env.local variables
const envPath = path.join(__dirname, ".env.local");
let mongodbUri = "";

if (fs.existsSync(envPath)) {
  const envContent = fs.readFileSync(envPath, "utf-8");
  const match = envContent.match(/^MONGODB_URI=(.+)$/m);
  if (match) {
    mongodbUri = match[1].trim();
  }
}

if (!mongodbUri) {
  console.error("Error: MONGODB_URI not found in .env.local");
  process.exit(1);
}

const seedProducts = [
  {
    id: "1",
    name: "DAP Fertilizer",
    nameUrdu: "ڈی اے پی",
    category: "Phosphate",
    price: 12500,
    unit: "50kg Bag",
    stock: 150,
    description: "Di-ammonium Phosphate - Best for crop growth and root development",
    image: "/images/dap.png",
    images: ["/images/dap.png"]
  },
  {
    id: "2",
    name: "Urea",
    nameUrdu: "یوریا",
    category: "Nitrogen",
    price: 3200,
    unit: "50kg Bag",
    stock: 300,
    description: "High nitrogen content for lush green growth",
    image: "/images/urea.png",
    images: ["/images/urea.png"]
  },
  {
    id: "3",
    name: "Potash (SOP)",
    nameUrdu: "پوٹاش",
    category: "Potassium",
    price: 8500,
    unit: "50kg Bag",
    stock: 100,
    description: "Sulphate of Potash - Improves fruit quality and disease resistance",
    image: "/images/potash.jpg",
    images: ["/images/potash.jpg"]
  },
  {
    id: "4",
    name: "NP Fertilizer",
    nameUrdu: "این پی",
    category: "Compound",
    price: 9800,
    unit: "50kg Bag",
    stock: 120,
    description: "Nitrogen-Phosphorus blend for balanced nutrition",
    image: "/images/np.png",
    images: ["/images/np.png"]
  },
  {
    id: "5",
    name: "Calcium Ammonium Nitrate",
    nameUrdu: "کیلشیم امونیم نائٹریٹ",
    category: "Nitrogen",
    price: 4500,
    unit: "50kg Bag",
    stock: 80,
    description: "CAN - Quick acting nitrogen with calcium",
    image: "/images/can.jpg",
    images: ["/images/can.jpg"]
  },
  {
    id: "6",
    name: "Zinc Sulphate",
    nameUrdu: "زنک سلفیٹ",
    category: "Micronutrient",
    price: 2800,
    unit: "25kg Bag",
    stock: 200,
    description: "Essential micronutrient for healthy crops",
    image: "/images/zinc.png",
    images: ["/images/zinc.png"]
  },
  {
    id: "7",
    name: "Organic Compost",
    nameUrdu: "نامیاتی کھاد",
    category: "Organic",
    price: 1500,
    unit: "50kg Bag",
    stock: 500,
    description: "Natural organic matter for soil health",
    image: "/images/oprganic.jfif",
    images: ["/images/oprganic.jfif"]
  },
  {
    id: "8",
    name: "SSP Fertilizer",
    nameUrdu: "ایس ایس پی",
    category: "Phosphate",
    price: 2200,
    unit: "50kg Bag",
    stock: 180,
    description: "Single Super Phosphate - Economical phosphorus source",
    image: "/images/ssp.png",
    images: ["/images/ssp.png"]
  },
  {
    id: "9",
    name: "Ammonium Sulphate",
    nameUrdu: "امونیم سلفیٹ",
    category: "Nitrogen",
    price: 4800,
    unit: "50kg Bag",
    stock: 110,
    description: "Good source of nitrogen and sulphur for soil conditioning",
    image: "/images/can.jpg",
    images: ["/images/can.jpg"]
  },
  {
    id: "10",
    name: "Boron Micronutrient",
    nameUrdu: "بوران",
    category: "Micronutrient",
    price: 1800,
    unit: "3kg Pack",
    stock: 150,
    description: "Essential boron micronutrient for flowering and fruit setting",
    image: "/images/zinc.png",
    images: ["/images/zinc.png"]
  }
];

const staffMembers = [
  { id: "staff-owner-1", name: "Muhammad Goraya", nameUrdu: "محمد گورایہ", role: "owner", department: "Management", phone: "0300-1112233", email: "goraya@gmail.com", salary: 0, status: "active", password: "1234" },
  { id: "staff-mgr-1", name: "Hassan Ali", nameUrdu: "حسن علی", role: "manager", department: "Management", phone: "0300-4445566", email: "hassan@gmail.com", salary: 55000, status: "active", password: "1234" },
  { id: "staff-load-1", name: "Tariq Mehmood", nameUrdu: "طارق محمود", role: "loader", department: "Load / Unload", phone: "0300-7778899", email: "tariq@gmail.com", salary: 28000, status: "active", password: "1234" }
];

const customers = [
  { id: "1", name: "Muhammad Ali", phone: "0300-1234567", address: "Village Chak 45, District Faisalabad", balance: 25000, createdAt: "2024-01-15", password: "1234" },
  { id: "2", name: "Ahmad Khan", phone: "0321-7654321", address: "Moza Khanpur, Tehsil Jhang", balance: -15000, createdAt: "2024-02-20", password: "1234" }
];

const seedOrders = [
  {
    id: "order-1",
    createdAt: new Date(Date.now() - 3600000 * 2).toISOString(),
    customerName: "Muhammad Ali",
    customerPhone: "0300-1234567",
    customerAddress: "Village Chak 45, District Faisalabad",
    items: [
      {
        product: { id: "1", name: "DAP Fertilizer", nameUrdu: "ڈی اے پی", price: 12500, unit: "50kg Bag" },
        quantity: 2
      }
    ],
    total: 25000,
    paymentMethod: "bank",
    paymentScreenshot: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
    status: "pending",
    trackingCode: "GT-783621"
  },
  {
    id: "order-2",
    createdAt: new Date(Date.now() - 3600000 * 5).toISOString(),
    customerName: "Ahmad Khan",
    customerPhone: "0321-7654321",
    customerAddress: "Moza Khanpur, Tehsil Jhang",
    items: [
      {
        product: { id: "2", name: "Urea", nameUrdu: "یوریا", price: 3200, unit: "50kg Bag" },
        quantity: 5
      }
    ],
    total: 16000,
    paymentMethod: "cash",
    paymentScreenshot: null,
    status: "delivered",
    trackingCode: "GT-918237"
  },
  {
    id: "order-3",
    createdAt: new Date(Date.now() - 3600000 * 24).toISOString(),
    customerName: "Rashid Mehmood",
    customerPhone: "0333-9876543",
    customerAddress: "Village Bhalwal, District Sargodha",
    items: [
      {
        product: { id: "3", name: "Potash (SOP)", nameUrdu: "پوٹاش", price: 8500, unit: "50kg Bag" },
        quantity: 3
      }
    ],
    total: 25500,
    paymentMethod: "bank",
    paymentScreenshot: "https://images.unsplash.com/photo-1554224155-8d04cb21cd6c?w=400",
    status: "approved",
    trackingCode: "GT-102938"
  },
  {
    id: "order-4",
    createdAt: new Date(Date.now() - 3600000 * 48).toISOString(),
    customerName: "Imran Hussain",
    customerPhone: "0345-1122334",
    customerAddress: "Chak 120/GB, Faisalabad",
    items: [
      {
        product: { id: "4", name: "NP Fertilizer", nameUrdu: "این پی", price: 9800, unit: "50kg Bag" },
        quantity: 4
      }
    ],
    total: 39200,
    paymentMethod: "cash",
    paymentScreenshot: null,
    status: "shipped",
    trackingCode: "GT-543210"
  }
];

const seedCropRates = [
  { id: "crop-1", name: "Wheat", nameUrdu: "گندم", rate: 3800, unit: "40kg (Maund)", location: "Faisalabad Galla Mandi", trend: "up", updatedAt: new Date().toISOString() },
  { id: "crop-2", name: "Rice (Basmati)", nameUrdu: "چاول باسمتی", rate: 8500, unit: "40kg (Maund)", location: "Sargodha Mandi", trend: "stable", updatedAt: new Date().toISOString() },
  { id: "crop-3", name: "Cotton", nameUrdu: "کپاس", rate: 7200, unit: "40kg (Maund)", location: "Multan Mandi", trend: "down", updatedAt: new Date().toISOString() },
  { id: "crop-4", name: "Sugarcane", nameUrdu: "گنا", rate: 450, unit: "40kg (Maund)", location: "Jhang Sugar Mill Gate", trend: "up", updatedAt: new Date().toISOString() },
  { id: "crop-5", name: "Maize (Corn)", nameUrdu: "مکئی", rate: 2200, unit: "40kg (Maund)", location: "Okara Mandi", trend: "stable", updatedAt: new Date().toISOString() }
];

const ledgerEntriesByBook = {
  sales: [
    { id: "1", customerId: "1", customerName: "Muhammad Ali", date: "2024-03-15", type: "sale", description: "DAP 2 bags, Urea 5 bags", debit: 41000, credit: 0, balance: 41000 },
    { id: "2", customerId: "1", customerName: "Muhammad Ali", date: "2024-03-20", type: "payment", description: "Cash Payment", debit: 0, credit: 16000, balance: 25000 },
    { id: "3", customerId: "2", customerName: "Ahmad Khan", date: "2024-03-18", type: "sale", description: "Potash 3 bags, NP 2 bags (25% weekly)", debit: 45100, credit: 0, balance: 45100 },
    { id: "4", customerId: "2", customerName: "Ahmad Khan", date: "2024-03-25", type: "payment", description: "Routine Payment (Week 1)", debit: 0, credit: 60100, balance: -15000 }
  ],
  purchases: [
    { id: "p1", customerId: "sup-1", customerName: "FFC Ltd", date: "2024-03-10", type: "sale", description: "DAP stock inward — 100 bags @ distributor rate", debit: 1150000, credit: 0, balance: 1150000 },
    { id: "p2", customerId: "sup-1", customerName: "FFC Ltd", date: "2024-03-12", type: "payment", description: "Bank transfer to supplier", debit: 0, credit: 600000, balance: 550000 }
  ],
  "cash-bank": [
    { id: "c1", customerId: "bank", customerName: "Meezan Bank — Current", date: "2024-03-01", type: "sale", description: "Opening balance brought forward", debit: 450000, credit: 0, balance: 450000 },
    { id: "c2", customerId: "cash", customerName: "Cash in hand", date: "2024-03-14", type: "payment", description: "Cash deposit to bank", debit: 0, credit: 120000, balance: 330000 }
  ],
  expenses: [
    { id: "e1", customerId: "exp", customerName: "Shop Rent", date: "2024-03-01", type: "sale", description: "March rent — Galla Mandi unit", debit: 85000, credit: 0, balance: 85000 },
    { id: "e2", customerId: "exp", customerName: "Utilities", date: "2024-03-05", type: "sale", description: "Electricity bill", debit: 22000, credit: 0, balance: 107000 }
  ],
  "load-unload": [
    { id: "l1", customerId: "wh", customerName: "Unload — Truck #PA-1234", date: "2024-03-16", type: "sale", description: "Unloaded 120 bags DAP (supplier delivery)", debit: 0, credit: 0, balance: 0 }
  ]
};

async function runSeeder() {
  console.log("Connecting to MongoDB Atlas Cluster...");
  const client = new MongoClient(mongodbUri);

  try {
    await client.connect();
    console.log("Connected successfully!");
    const db = client.db("goryaaDB");

    // Seed Products
    console.log("Seeding products...");
    const productsColl = db.collection("products");
    await productsColl.deleteMany({});
    await productsColl.insertMany(seedProducts.map(p => ({ ...p, _id: p.id })));

    // Seed Staff
    console.log("Seeding staff...");
    const staffColl = db.collection("staff");
    await staffColl.deleteMany({});
    await staffColl.insertMany(staffMembers.map(s => ({ ...s, _id: s.id })));

    // Seed Customers
    console.log("Seeding customers...");
    const customersColl = db.collection("customers");
    await customersColl.deleteMany({});
    await customersColl.insertMany(customers.map(c => ({ ...c, _id: c.id })));

    // Seed Orders
    console.log("Seeding orders...");
    const ordersColl = db.collection("orders");
    await ordersColl.deleteMany({});
    await ordersColl.insertMany(seedOrders.map(o => ({ ...o, _id: o.id })));

    // Seed Ledgers
    console.log("Seeding ledgers...");
    const ledgersColl = db.collection("ledgers");
    await ledgersColl.deleteMany({});
    const ledgerDocs = [];
    Object.entries(ledgerEntriesByBook).forEach(([bookId, entries]) => {
      entries.forEach((entry) => {
        ledgerDocs.push({
          ...entry,
          bookId,
          _id: `${bookId}-${entry.id}`,
        });
      });
    });
    if (ledgerDocs.length > 0) {
      await ledgersColl.insertMany(ledgerDocs);
    }

    // Seed Crop Rates
    console.log("Seeding crop rates...");
    const cropRatesColl = db.collection("crop-rates");
    await cropRatesColl.deleteMany({});
    await cropRatesColl.insertMany(seedCropRates.map(cr => ({ ...cr, _id: cr.id })));

    console.log("Seeding finished successfully!");
    const stats = {
      products: await productsColl.countDocuments(),
      staff: await staffColl.countDocuments(),
      customers: await customersColl.countDocuments(),
      orders: await ordersColl.countDocuments(),
      ledgers: await ledgersColl.countDocuments(),
      cropRates: await cropRatesColl.countDocuments(),
    };
    console.log("Collection Stats:", stats);
  } catch (error) {
    console.error("Seeding failed with error:", error);
  } finally {
    await client.close();
  }
}

runSeeder();
