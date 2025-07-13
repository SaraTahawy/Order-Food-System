const form = document.getElementById("orderForm");
const messageDiv = document.getElementById("sessionMessage");
const successDiv = document.getElementById("successMessage");
const firstNameInput = document.getElementById("firstName");
const lastNameInput = document.getElementById("lastName");
const checkDiv = document.getElementById("checkMessage");
const noteInput = document.getElementById("note");
let lastOrderItems = [];
let prices = {};

const motivationalPhrases = [
  "صلِّ على النبي ❤",
  "اذكر الله 🌿",
  "دعوة حلوة 🌸",
  "اللهم صلِّ وسلم على سيدنا محمد ﷺ ❤",
  "استغفر الله 💫",
  "سبّح الله 📿",
];

function getRandomPhrase() {
  const index = Math.floor(Math.random() * motivationalPhrases.length);
  return motivationalPhrases[index];
}

// مسح الرسائل
function clearMessages() {
  successDiv.innerText = "";
  checkDiv.innerText = "";
}

function calculateTotal(items) {
  let total = 0;
  items.forEach((item) => {
    total += prices[item] || 0;
  });
  return total + 5; // 5 جنيه دليفري
}

function formatOrderItems(items) {
  const countMap = {};

  items.forEach((item) => {
    countMap[item] = (countMap[item] || 0) + 1;
  });

  return Object.entries(countMap)
    .map(([item, count]) => {
      return count > 1 ? `${item} ×${count}` : item;
    })
    .join(", ");
}

// إرسال الأوردر
form.addEventListener("submit", async (e) => {
  e.preventDefault();
  clearMessages();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const fullName = `${firstName} ${lastName}`;
  const items = [];
  for (const [item, count] of Object.entries(itemQuantities)) {
    for (let i = 0; i < count; i++) {
      items.push(item);
    }
  }

  if (!firstName || !lastName) {
    Swal.fire("❌ لازم تكتب اسمك الأول والتاني", "", "error");
    return;
  }

  if (items.length === 0) {
    Swal.fire("❌ لازم تختار حاجة!", "", "warning");
    return;
  }

  try {
    const checkRes = await fetch("/check-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName }),
    });

    const checkData = await checkRes.json();

    if (checkData.hasOrder) {
      Swal.fire({
        icon: "error",
        title: "عندك أوردر بالفعل ❌",
        text: "استخدم زر التعديل أو الغي الأوردر الأول.",
      });
      return;
    }

    // ⬇️ تأكيد التسجيل قبل الحفظ
    Swal.fire({
      title: "تأكيد الأوردر",
      text: `هل أنت متأكد من تسجيل الأوردر: [${formatOrderItems(items)}]؟`,
      icon: "question",
      showCancelButton: true,
      confirmButtonText: "نعم، سجل",
      cancelButtonText: "لا، رجوع",
    }).then(async (result) => {
      if (!result.isConfirmed) return;

      // ✅ يسجل الأوردر
      const note = noteInput.value.trim();
      const res = await fetch("/order", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name: fullName, items, note }),
      });

      if (res.ok) {
        const phrase = getRandomPhrase();
        Swal.fire({
          icon: "success",
          title: "✅ تم تسجيل أوردرك",
          html: `💰 <strong>${calculateTotal(
            items
          )}</strong> جنيه الإجمالي مع الدليفري<br>😊 بالهنا والشفا<br>🌹 ${phrase}`,
          confirmButtonText: "تمام",
        });

        form.reset();
        for (const item in itemQuantities) {
          itemQuantities[item] = 0;
          const el = document.getElementById(`qty-${item}`);
          if (el) el.innerText = "0";
        }
      } else {
        Swal.fire({
          icon: "error",
          title: "حصلت مشكلة ❌",
          text: "حاول تاني بعد شوية.",
        });
      }
    });
  } catch {
    Swal.fire("❌ مشكلة في الاتصال بالسيرفر", "", "error");
  }
});

// التحقق من حالة السيشن
async function checkSession() {
  try {
    const res = await fetch("/session-status");
    const data = await res.json();

    if (data.sessionOpen) {
      form.style.display = "block";
      messageDiv.innerText = "✅ الطلبات مفتوحة";
      messageDiv.style.color = "green";
    } else {
      form.style.display = "none";
      messageDiv.innerText = "❌   الطلبات مش مفتوحة دلوقتي";
      messageDiv.style.color = "red";
    }
  } catch {
    messageDiv.innerText = "❌ مشكلة في الاتصال بالسيرفر";
    messageDiv.style.color = "red";
    form.style.display = "none";
  }
}

// التحقق لو في أوردر
async function checkIfHasOrder(silent = false) {
  clearMessages();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const fullName = `${firstName} ${lastName}`;

  if (!firstName || !lastName) {
    if (!silent)
      await Swal.fire("❌ من فضلك اكتب اسمك الأول والتاني", "", "error");
    return false;
  }

  try {
    const res = await fetch("/check-order-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName }),
    });

    const data = await res.json();

    if (data.hasOrder) {
      lastOrderItems = data.items;
      localStorage.setItem("fullName", fullName);
      if (!silent) {
        await Swal.fire(
          "✅ عندك أوردر مسجل",
          `${formatOrderItems(data.items)}`,
          "info"
        );
      }
      return true;
    } else {
      lastOrderItems = [];
      if (!silent) {
        await Swal.fire("❌ مفيش أوردر ليك", "", "warning");
      }
      return false;
    }
  } catch {
    if (!silent) await Swal.fire("❌ مشكلة في الاتصال بالسيرفر", "", "error");
    return false;
  }
}

// إلغاء الأوردر
async function cancelOrder() {
  clearMessages();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const fullName = `${firstName} ${lastName}`;

  if (!firstName || !lastName) {
    Swal.fire("❌ من فضلك اكتب اسمك الأول والتاني", "", "error");
    return;
  }

  try {
    const res = await fetch("/check-order-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName }),
    });

    const data = await res.json();

    if (!data.hasOrder) {
      Swal.fire("❌ مفيش أوردر ليك تلغيه", "", "warning");
      return;
    }

    lastOrderItems = data.items;

    const result = await Swal.fire({
      title: "تأكيد الإلغاء",
      text: `هل أنت متأكد من إلغاء أوردر: [${formatOrderItems(
        lastOrderItems
      )}]؟`,
      icon: "warning",
      showCancelButton: true,
      cancelButtonText: "لا، رجوع",
      confirmButtonText: "نعم، إلغاء",
    });

    if (!result.isConfirmed) return;

    const cancelRes = await fetch("/cancel-order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName }),
    });

    const cancelData = await cancelRes.json();

    if (cancelData.success) {
      Swal.fire("✅ تم إلغاء أوردرك", "", "success");
      lastOrderItems = [];
      localStorage.removeItem("fullName");
      form.reset();
    } else {
      Swal.fire("❌ مفيش أوردر بإسمك تلغيه", "", "error");
    }
  } catch {
    Swal.fire("❌ مشكلة في الاتصال بالسيرفر", "", "error");
  }
}

// تعديل الأوردر
async function enableEdit() {
  clearMessages();

  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const fullName = `${firstName} ${lastName}`;

  if (!firstName || !lastName) {
    Swal.fire("❌ من فضلك اكتب اسمك الأول والتاني", "", "error");
    return;
  }

  try {
    const res = await fetch("/check-order-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName }),
    });

    const data = await res.json();

    if (!data.hasOrder) {
      Swal.fire("❌ مفيش أوردر ليك تعدله، اطلب الاول", "", "warning");
      return;
    }

    lastOrderItems = data.items;

    const selectedItems = [];
    for (const [itemName, count] of Object.entries(itemQuantities)) {
      for (let i = 0; i < count; i++) {
        selectedItems.push(itemName);
      }
    }

    if (selectedItems.length === 0) {
      Swal.fire("❌ لازم تختار أوردر جديد قبل التعديل", "", "error");
      return;
    }

    if (arraysEqual(selectedItems, lastOrderItems)) {
      Swal.fire("😊 نفس الأوردر القديم، مفيش أي تغيير", "", "info");
      return;
    }

    Swal.fire({
      title: "تأكيد التعديل",
      text: `هل أنت متأكد من تغيير أوردر: [${formatOrderItems(
        lastOrderItems
      )}] إلى: [${formatOrderItems(selectedItems)}]؟`,
      icon: "question",
      showCancelButton: true,
      cancelButtonText: "لا، رجوع",
      confirmButtonText: "نعم، عدل",
    }).then(async (result) => {
      if (result.isConfirmed) {
        await sendOrder(selectedItems);
      }
      // ❌ ما تعملش حاجة في حالة الضغط على رجوع
    });
  } catch {
    Swal.fire("❌ مشكلة في الاتصال بالسيرفر", "", "error");
  }
}

async function sendOrder(items) {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const fullName = `${firstName} ${lastName}`;
  const note = noteInput.value.trim();

  try {
    const res = await fetch("/order", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName, items, note }),
    });

    if (res.ok) {
      // ✅ نحسب الإجمالي
      let total = 0;
      items.forEach((item) => {
        total += prices[item] || 0;
      });
      total += 5; // سعر الدليفري الثابت

      // ✅ جملة مبهجة عشوائية
      const messages = [
        "صلِّ على النبي ❤",
        "اذكر الله 🌿",
        "دعوة حلوة 🌸",
        "اللهم صلِّ وسلم على سيدنا محمد ﷺ ❤",
        "استغفر الله 💫",
        "سبّح الله 📿",
      ];
      const randomMsg = messages[Math.floor(Math.random() * messages.length)];

      Swal.fire({
        icon: "success",
        title: "✅ تم تعديل أوردرك",
        html: `💰 <strong>${calculateTotal(
          items
        )}</strong> جنيه الإجمالي مع الدليفري<br>😊 بالهنا والشفا<br>🌹 ${randomMsg}`,
        confirmButtonText: "تمام",
      });

      lastOrderItems = items;
      form.reset();
      // نصفر الكميات في الواجهة
      for (const item in itemQuantities) {
        itemQuantities[item] = 0;
        const el = document.getElementById(`qty-${item}`);
        if (el) el.innerText = "0";
      }
    } else {
      Swal.fire("❌ حصلت مشكلة أثناء التعديل", "", "error");
    }
  } catch {
    Swal.fire("❌ مشكلة في الاتصال بالسيرفر", "", "error");
  }
}

async function getOrderItems() {
  const firstName = firstNameInput.value.trim();
  const lastName = lastNameInput.value.trim();
  const fullName = `${firstName} ${lastName}`;

  if (!firstName || !lastName) {
    await Swal.fire("❌ من فضلك اكتب اسمك الأول والتاني", "", "error");
    return null;
  }

  try {
    const res = await fetch("/check-order-details", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ name: fullName }),
    });

    const data = await res.json();

    return data.hasOrder ? data.items : null;
  } catch {
    await Swal.fire("❌ مشكلة في الاتصال بالسيرفر", "", "error");
    return null;
  }
}

// مقارنة القوائم
function arraysEqual(a, b) {
  if (a.length !== b.length) return false;

  const countItems = (arr) =>
    arr.reduce((acc, item) => {
      acc[item] = (acc[item] || 0) + 1;
      return acc;
    }, {});

  const aCount = countItems(a);
  const bCount = countItems(b);

  return Object.keys(aCount).every((item) => aCount[item] === bCount[item]);
}

// كل 3 ثواني يتشيك على السيشن
async function loadMenuItems() {
  try {
    const res = await fetch("/menu");
    const menu = await res.json();
    prices = menu;

    const container = document.getElementById("menuItemsContainer");
    container.innerHTML = ""; // نمسح القديم

    for (const [item, price] of Object.entries(menu)) {
      const row = document.createElement("div");
      row.className = "menu-row";

      row.innerHTML = `
        <span class="item-label">🍽️ ${item} - ${price}ج</span>
        <div class="qty-controls">
          <button type="button" class="qty-btn" onclick="changeQty('${item}', -1)">➖</button>
          <span id="qty-${item}" class="qty-value">0</span>
          <button type="button" class="qty-btn" onclick="changeQty('${item}', 1)">➕</button>
        </div>
      `;

      container.appendChild(row);
    }
  } catch {
    document.getElementById("menuItemsContainer").innerText =
      "❌ مشكلة في تحميل المنيو";
  }
}

// تخزين الكميات لكل صنف في object
const itemQuantities = {};

function changeQty(item, delta) {
  if (!itemQuantities[item]) itemQuantities[item] = 0;
  itemQuantities[item] = Math.max(0, itemQuantities[item] + delta);
  document.getElementById(`qty-${item}`).innerText = itemQuantities[item];
}

setInterval(checkSession, 3000);
checkSession();

window.addEventListener("load", async () => {
  localStorage.removeItem("fullName");
  const fullName = localStorage.getItem("fullName");
  if (fullName) {
    const [firstName, lastName] = fullName.split(" ");
    firstNameInput.value = firstName || "";
    lastNameInput.value = lastName || "";
    await checkIfHasOrder();
  }

  await loadMenuItems(); // تحميل المنيو مرة واحدة هنا فقط
});
