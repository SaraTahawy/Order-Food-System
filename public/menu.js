

// ✅ تحميل المنيو
async function fetchMenu() {
  const res = await fetch("/menu");
  const menu = await res.json();

  let result = "";
  for (const [item, price] of Object.entries(menu)) {
    result += `
    <li>
      <span>${item} - ${price} جنيه</span>
      <div>
        <button onclick="editItem('${item}', ${price})">✏️ تعديل</button>
        <button onclick="deleteItem('${item}')">🗑️ حذف</button>
      </div>
    </li>`;
  }

  document.getElementById("menuList").innerHTML = result;
}

// ✅ إضافة صنف
async function addItem() {
  const name = document.getElementById("itemName").value.trim();
  const price = +document.getElementById("itemPrice").value;

  if (!name || price <= 0) {
    return Swal.fire("❌ اكتب اسم وسعر صحيح", "", "error");
  }

  const result = await Swal.fire({
    title: "تأكيد الإضافة",
    text: `هل أنت متأكد من إضافة الصنف "${name}" بسعر ${price} جنيه؟`,
    icon: "question",
    showCancelButton: true,
    confirmButtonText: "نعم، أضف",
    cancelButtonText: "لا، رجوع",
  });

  if (!result.isConfirmed) return;

  await fetch("/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item: name, price }),
  });

  document.getElementById("itemName").value = "";
  document.getElementById("itemPrice").value = "";
  fetchMenu();
}

// ✅ حذف صنف
async function deleteItem(name) {
  const result = await Swal.fire({
    title: "تأكيد الحذف",
    text: `هل أنت متأكد من حذف ${name}؟`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "نعم، حذف",
    cancelButtonText: "لا، رجوع",
  });

  if (!result.isConfirmed) return;

await fetch("/menu", {
  method: "DELETE", 
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ item: name }),
});


  Swal.fire("✅ تم الحذف", "", "success");
  fetchMenu();
}

// ✅ تعديل صنف
async function editItem(name, oldPrice) {
  const result = await Swal.fire({
    title: `تعديل سعر ${name}`,
    input: "number",
    inputValue: oldPrice,
    confirmButtonText: "تأكيد",
    cancelButtonText: "إلغاء",
    showCancelButton: true,
    inputValidator: (value) => {
      if (!value || value <= 0) return "❌ اكتب سعر صحيح";
    },
  });

  if (!result.isConfirmed) return;

  const newPrice = +result.value;

  if (newPrice === oldPrice) {
    Swal.fire("😊 نفس السعر القديم، مفيش أي تغيير", "", "info");
    return;
  }

  await fetch("/menu", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ item: name, price: newPrice }),
  });

  Swal.fire("✅ تم التعديل", "", "success");
  fetchMenu();
}

fetchMenu();



