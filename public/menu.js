const SCRIPT_URL = "https://script.google.com/macros/s/AKfycbxLzvoKFTIrQ4AJk_2dTnox1HcZTh90FRzxDjoVmA5gsVqV7da7eZ-RPZDLwx3V2VrPRA/exec";

// تحميل المنيو من Google Sheets
async function loadMenu() {
  try {
    const res = await fetch(`${SCRIPT_URL}?action=menu`);
    const menu = await res.json();
    displayMenu(menu);
  } catch (error) {
    Swal.fire("❌ خطأ", "فشل في تحميل المنيو", "error");
  }
}

// عرض الأصناف في القائمة
function displayMenu(menu) {
  const menuList = document.getElementById("menuList");
  menuList.innerHTML = "";

  Object.entries(menu).forEach(([item, price]) => {
    const li = document.createElement("li");
    li.innerHTML = `
      <span><strong>${item}</strong> - ${price}ج</span>
      <button onclick="editItem('${item}', ${price})">✏️ تعديل</button>
      <button onclick="deleteItem('${item}')">🗑 حذف</button>
    `;
    menuList.appendChild(li);
  });
}

// إضافة أو تعديل صنف
async function addItem() {
  const item = document.getElementById("itemName").value.trim();
  const price = parseFloat(document.getElementById("itemPrice").value);

  if (!item || isNaN(price)) {
    Swal.fire("❌ من فضلك اكتب اسم وسعر صحيح", "", "warning");
    return;
  }

  try {
    const res = await fetch(`${SCRIPT_URL}?action=menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item, price })
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire("✅ تم إضافة/تعديل الصنف", `${item} = ${price}ج`, "success");
      document.getElementById("itemName").value = "";
      document.getElementById("itemPrice").value = "";
      loadMenu();
    } else {
      Swal.fire("❌ خطأ", data.message || "فشل في العملية", "error");
    }
  } catch (err) {
    Swal.fire("❌ خطأ في الاتصال", "", "error");
  }
}

// حذف صنف
async function deleteItem(item) {
  const confirm = await Swal.fire({
    title: `هل أنت متأكد من حذف "${item}"؟`,
    icon: "warning",
    showCancelButton: true,
    confirmButtonText: "نعم، احذفه",
    cancelButtonText: "إلغاء"
  });

  if (!confirm.isConfirmed) return;

  try {
    const res = await fetch(`${SCRIPT_URL}?action=delete-menu`, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ item })
    });

    const data = await res.json();
    if (res.ok) {
      Swal.fire("🗑️ تم الحذف", `${item} اتحذف`, "success");
      loadMenu();
    } else {
      Swal.fire("❌ خطأ", data.message || "فشل في الحذف", "error");
    }
  } catch {
    Swal.fire("❌ خطأ في الاتصال", "", "error");
  }
}

// عند الضغط على "تعديل" يملأ الحقول
function editItem(item, price) {
  document.getElementById("itemName").value = item;
  document.getElementById("itemPrice").value = price;
}

// تحميل المنيو تلقائيًا عند فتح الصفحة
window.addEventListener("load", loadMenu);




