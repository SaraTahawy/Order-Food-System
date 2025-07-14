const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbzscxkVtOLgXIwVUdQu0xsiOxpKFYRvqnrvYL207moaWa4L0InjwyWx_MEzs1O8XAhGdA/exec";

let prices = {};

// ✅ تحميل الأسعار (المنيو)
async function fetchPrices() {
  const res = await fetch(`${SCRIPT_URL}?action=menu`);
  prices = await res.json();
}

// ✅ بدء الطلبات
async function startSession() {
  await fetch(`${SCRIPT_URL}?action=start`, { method: "POST" });
  Swal.fire({
    icon: "success",
    title: "تم فتح الطلبات!",
    text: "ابدأ استقبال الطلبات من الزملاء 💚",
  });
}

// ✅ إيقاف الطلبات
async function stopSession() {
  await fetch(`${SCRIPT_URL}?action=stop`, { method: "POST" });
  Swal.fire({
    icon: "error",
    title: "تم إيقاف الطلبات",
    text: "مش هنقبل طلبات جديدة دلوقتي 🚫",
  });
}

// ✅ تحميل الطلبات
async function fetchOrders() {
  const res = await fetch(`${SCRIPT_URL}?action=orders`);
  const data = await res.json();

  let totalSandwiches = 0;
  let deliveryTotal = 0;
  let totalAll = 0;
  const deliveryFee = 5;
  const itemTotals = {};
  let result = "";

  data.forEach((order) => {
    result += `<div class="order-card"><h3>${order.name}</h3><ul>`;
    const itemCounts = {};
    let personTotal = 0;

    order.items.forEach((item) => {
      itemCounts[item] = (itemCounts[item] || 0) + 1;
      itemTotals[item] = itemTotals[item] || { count: 0, total: 0 };
      itemTotals[item].count += 1;
      itemTotals[item].total += prices[item] || 0;
    });

    for (const [item, count] of Object.entries(itemCounts)) {
      const price = prices[item] || 0;
      const itemTotal = count * price;
      personTotal += itemTotal;
      result += `<li>${item}: ${count} × ${price} = ${itemTotal} جنيه</li>`;
    }

    totalSandwiches += personTotal;
    deliveryTotal += deliveryFee;
    const totalWithDelivery = personTotal + deliveryFee;

    result += `</ul>
      <p style="margin-top:8px;">🚚 دليفري: ${deliveryFee} جنيه</p>
      <strong>🧾 إجمالي ${order.name}: ${totalWithDelivery} جنيه</strong>`;

    if (order.note && order.note.trim() !== "") {
      result += `<p style="margin-top:5px; color:#d2691e;">📝 ملاحظة: ${order.note}</p>`;
    }

    result += `</div>`;
  });

  totalAll = totalSandwiches + deliveryTotal;

  result += `
<div class="order-card summary-card">
  <h2>📊 تفاصيل الأصناف:</h2>
  <ul>
    ${Object.entries(itemTotals)
      .map(
        ([item, data]) => `
      <li>${item}: ${data.count} سندوتشات = ${data.total} جنيه</li>
    `
      )
      .join("")}
  </ul>
</div>

<div class="order-card summary-card">
  <h2>💰 الإجمالي:</h2>
  <ul>
    <li>🥪 إجمالي السندوتشات: ${totalSandwiches} جنيه</li>
    <li>🚚 إجمالي الدليفري (${deliveryFee} × ${data.length}): ${deliveryTotal} جنيه</li>
    <li><strong>💵 الإجمالي الكلي: ${totalAll} جنيه</strong></li>
  </ul>
</div>
`;

  document.getElementById("orders").innerHTML = result;
}

// ✅ التحديث التلقائي كل 2 ثانية
setInterval(() => {
  fetchPrices().then(fetchOrders);
}, 2000);

fetchPrices().then(fetchOrders);

