const express = require("express");
const fs = require("fs");
const { Parser } = require("json2csv");
const app = express();
// const PORT = 3000;
const PORT = process.env.PORT || 3000;

app.use(express.static("public"));
app.use(express.json());

// ✅ تحميل المنيو من ملف
let menu = {};

try {
  const savedMenu = fs.readFileSync("menu.json", "utf-8");
  menu = JSON.parse(savedMenu);
} catch (e) {
  menu = { فول: 10, بيض: 12, جبنة: 15 };
}

function saveMenu() {
  fs.writeFileSync("menu.json", JSON.stringify(menu, null, 2));
}

let orders = [];
let sessionOpen = false;

// ✅ بدء الطلبات
app.post("/start", (req, res) => {
  orders = [];
  sessionOpen = true;
  res.json({ message: "Session started" });
});

// ✅ إنهاء الطلبات
app.post("/stop", (req, res) => {
  sessionOpen = false;
  res.json({ message: "Session ended" });
});

// ✅ استلام أوردر جديد أو تعديل
app.post("/order", (req, res) => {
  if (!sessionOpen)
    return res.status(400).json({ message: "Session is closed" });

  const { name, items, note } = req.body;
  const existingOrder = orders.find((order) => order.name === name);

  if (existingOrder) {
    existingOrder.items = items;
    existingOrder.note = note;
  } else {
    orders.push({ name, items, note });
  }

  fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
  res.json({ message: "Order saved" });
});

// ✅ التحقق من وجود أوردر
app.post("/check-order", (req, res) => {
  const { name } = req.body;
  const existingOrder = orders.find((order) => order.name === name);
  res.json({ hasOrder: !!existingOrder });
});

// ✅ تفاصيل الأوردر
app.post("/check-order-details", (req, res) => {
  const { name } = req.body;
  const existingOrder = orders.find((order) => order.name === name);

  if (existingOrder) {
    res.json({
      hasOrder: true,
      items: existingOrder.items,
      note: existingOrder.note || "",
    });
  } else {
    res.json({ hasOrder: false });
  }
});

// ✅ إلغاء أوردر
app.post("/cancel-order", (req, res) => {
  const { name } = req.body;
  const index = orders.findIndex((order) => order.name === name);

  if (index !== -1) {
    orders.splice(index, 1);
    fs.writeFileSync("orders.json", JSON.stringify(orders, null, 2));
    res.json({ success: true });
  } else {
    res.json({ success: false });
  }
});

// ✅ إرجاع حالة السيشن
app.get("/session-status", (req, res) => {
  res.json({ sessionOpen });
});

// ✅ إرجاع كل الطلبات
app.get("/orders", (req, res) => {
  res.json(orders);
});

// ✅ تحميل CSV
app.get("/export", (req, res) => {
  const prices = menu;

  const formattedOrders = orders.map((order) => {
    const itemCounts = {};
    let total = 0;

    // عداد الأصناف مع الحساب
    order.items.forEach((item) => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
      total += prices[item] || 0;
    });

    // نجهز نص الأصناف بشكل "فول(2), بيض(1)" مثلاً
    const itemsWithCounts = Object.entries(itemCounts)
      .map(([item, count]) => `${item} (${count})`)
      .join(", ");

    return {
      name: order.name,
      items: itemsWithCounts,
      note: order.note || "",
      total,
    };
  });

  const fields = ["name", "items", "note", "total"];
  const parser = new Parser({ fields });
  const csv = parser.parse(formattedOrders);

  res.setHeader("Content-Type", "text/csv; charset=utf-8");
  res.setHeader("Content-Disposition", 'attachment; filename="orders.csv"');

  res.send("\uFEFF" + csv);
});

// ✅ عرض المنيو
app.get("/menu", (req, res) => {
  res.json(menu);
});

// ✅ إضافة/تعديل صنف
app.post("/menu", (req, res) => {
  const { item, price } = req.body;
  if (!item || typeof price !== "number") {
    return res.status(400).json({ message: "❌ لازم تبعت اسم وسعر" });
  }
  menu[item] = price;
  fs.writeFileSync("menu.json", JSON.stringify(menu, null, 2));
  res.json({ message: "✅ تم التعديل", menu });
});

// ✅ حذف صنف
app.delete("/menu", (req, res) => {
  const { item } = req.body;
  if (!item || !menu[item]) {
    return res.status(400).json({ message: "❌ الصنف مش موجود" });
  }
  delete menu[item];
  fs.writeFileSync("menu.json", JSON.stringify(menu, null, 2));
  res.json({ message: "✅ تم الحذف", menu });
});

// ✅ تشغيل السيرفر
// app.listen(PORT, () => {
//   console.log(`👨‍💻 Admin Panel: http://localhost:${PORT}/admin.html`);
//   console.log(`🛒 User Orders: http://localhost:${PORT}/index.html`);
// });
app.listen(PORT, () => {
  console.log(`✅ Server running on port ${PORT}`);
});

