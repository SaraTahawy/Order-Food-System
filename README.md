# 🍽️ EasyOrder - Simple Food Ordering System

**EasyOrder** is a simple food ordering web app where:
- 👉 Users place, edit, and cancel orders easily.
- 🔧 Admin manages the menu and controls the order session.

---

## 👤 User Features
- ✅ Enter first and last name to place an order.
- ✅ View your current order.
- ✅ Edit your order.
- ✅ Cancel your order.
- ✅ Cannot place more than one order at the same time.
- ✅ Shows total price including delivery.
- ✅ Displays motivational phrases after ordering like:  
  “Pray for the Prophet 💖”, “Remember God 🌿”, etc.
- ✅ Must enter name and select items before placing an order.

---

## 🛠️ Admin Features
- ✅ Add new items to the menu with prices.
- ✅ Edit the price of an existing menu item.
- ✅ Delete items from the menu.
- ✅ Start the order session (allow users to place orders).
- ✅ Stop the order session (block new orders).
- ✅ Download all orders as a CSV file.
- ✅ View all submitted orders at `/orders`.

---

## 💻 Tech Stack
- **Backend:** Node.js + Express.js
- **Frontend:** HTML + CSS + Vanilla JavaScript
- **Database:** JSON files (`menu.json`, `orders.json`)
- **Alerts:** SweetAlert2

---

How to Run:
1. Clone the repository.
2. Open terminal in the project folder.
3. Install dependencies:
   npm install
4. Start the server:
   node server.js
5. Open in browser:
   User page: http://localhost:3000/index.html
   Admin page: http://localhost:3000/admin.html

Folder Structure:
EasyOrder/
├── public/ → Frontend files (HTML, CSS, JS)
│   ├── index.html → User page
│   ├── admin.html → Admin page
│   ├── styles.css → Styling
│   └── script.js → Client-side JS
├── server.js → Server code
├── package.json → Project dependencies
├── menu.json → Menu items
└── orders.json → Saved orders

Exporting Orders:
Admin can export orders to CSV file. The file includes:
- Full name
- Ordered items and their counts
- Notes
- Total price without delivery

Example Flow:
1. Admin adds menu items and starts the session.
2. Users place orders by selecting items.
3. Users edit or cancel their order if needed.
4. Admin stops the session and downloads orders.

Made by Eng. Sara Tahawy | ©️ 2025


