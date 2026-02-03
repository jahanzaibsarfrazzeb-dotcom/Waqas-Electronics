/* =========================
PART 3/4 — app.js (FULL)
SAVE AS: app.js
========================= */

/* 1) SET YOUR WHATSAPP NUMBER HERE
   Format: country code + number, no + sign, no spaces
   Pakistan example: 923001234567
*/
const STORE_WHATSAPP = "923001234567"; // <-- CHANGE THIS
const STORE_NAME = "Waqas Electronics (Kot Addu)";

const products = [
  { id: 1, name: "Smart LED TV 43-inch", category: "LED TVs", price: 89999, desc: "4K Smart TV with vibrant display and Wi-Fi apps." },
  { id: 2, name: "Smart LED TV 55-inch", category: "LED TVs", price: 134999, desc: "Large screen 4K TV ideal for home entertainment." },
  { id: 3, name: "Refrigerator 12 cu.ft", category: "Refrigerators", price: 114999, desc: "Energy efficient cooling with fast freezing." },
  { id: 4, name: "Inverter AC 1.5 Ton", category: "Air Conditioners", price: 174999, desc: "Power saving inverter AC with quick cooling." },
  { id: 5, name: "Washing Machine 8kg", category: "Washing Machines", price: 89999, desc: "Durable wash programs with efficient spinning." },
  { id: 6, name: "Microwave Oven", category: "Small Appliances", price: 28999, desc: "Fast heating with multiple modes." },
  { id: 7, name: "Blender & Grinder", category: "Small Appliances", price: 10999, desc: "Daily kitchen use with strong motor." },
  { id: 8, name: "HDMI Cable (2m)", category: "Accessories", price: 999, desc: "High quality HDMI cable for TV and devices." },
];

let cart = []; // [{id, qty}]

/* ---------- Helpers ---------- */
const PKR = (n) => `PKR ${Number(n).toLocaleString("en-PK")}`;
const byId = (id) => document.getElementById(id);

function getProduct(id){
  return products.find(p => p.id === id);
}
function cartCount(){
  return cart.reduce((sum, item) => sum + item.qty, 0);
}
function cartTotal(){
  return cart.reduce((sum, item) => sum + (getProduct(item.id).price * item.qty), 0);
}
function setYear(){
  const y = new Date().getFullYear();
  const el = byId("year");
  if(el) el.textContent = y;
}

/* ---------- UI Elements ---------- */
const productGrid = () => byId("productGrid");
const categorySelect = () => byId("categorySelect");
const searchInput = () => byId("searchInput");
const sortSelect = () => byId("sortSelect");

const cartDrawer = () => byId("cartDrawer");
const overlay = () => byId("overlay");
const cartItemsEl = () => byId("cartItems");
const cartCountEl = () => byId("cartCount");
const cartTotalEl = () => byId("cartTotal");
const cartSubEl = () => byId("cartSub");

/* ---------- Render Categories ---------- */
function renderCategories(){
  const cats = ["all", ...Array.from(new Set(products.map(p => p.category)))];
  categorySelect().innerHTML = cats.map(c => {
    const label = c === "all" ? "All Categories" : c;
    return `<option value="${c}">${label}</option>`;
  }).join("");
}

/* ---------- Render Products ---------- */
function getFilteredProducts(){
  const q = (searchInput().value || "").trim().toLowerCase();
  const cat = categorySelect().value;

  let list = [...products];

  if(cat !== "all"){
    list = list.filter(p => p.category === cat);
  }
  if(q){
    list = list.filter(p =>
      p.name.toLowerCase().includes(q) ||
      p.category.toLowerCase().includes(q) ||
      p.desc.toLowerCase().includes(q)
    );
  }

  const sortVal = sortSelect().value;
  if(sortVal === "priceLow") list.sort((a,b)=>a.price-b.price);
  if(sortVal === "priceHigh") list.sort((a,b)=>b.price-a.price);
  if(sortVal === "nameAZ") list.sort((a,b)=>a.name.localeCompare(b.name));

  return list;
}

function renderProducts(){
  const list = getFilteredProducts();
  productGrid().innerHTML = list.map(p => `
    <div class="card productCard">
      <div class="productTop">
        <div>
          <div class="productName">${p.name}</div>
          <div class="productCat">${p.category}</div>
        </div>
        <div class="price">${PKR(p.price)}</div>
      </div>
      <div class="productDesc">${p.desc}</div>
      <div class="productActions">
        <button class="smallBtn smallBtn--primary" onclick="addToCart(${p.id})">Add to Cart</button>
        <button class="smallBtn" onclick="quickWhatsApp(${p.id})">WhatsApp</button>
      </div>
    </div>
  `).join("");

  if(list.length === 0){
    productGrid().innerHTML = `<div class="card">No products found. Try another search.</div>`;
  }
}

/* ---------- Cart Operations ---------- */
function addToCart(id){
  const existing = cart.find(i => i.id === id);
  if(existing) existing.qty += 1;
  else cart.push({id, qty: 1});
  updateCartUI();
  openCart();
}

function incQty(id){
  const item = cart.find(i => i.id === id);
  if(item) item.qty += 1;
  updateCartUI();
}

function decQty(id){
  const item = cart.find(i => i.id === id);
  if(!item) return;
  item.qty -= 1;
  if(item.qty <= 0){
    cart = cart.filter(i => i.id !== id);
  }
  updateCartUI();
}

function removeItem(id){
  cart = cart.filter(i => i.id !== id);
  updateCartUI();
}

function clearCart(){
  cart = [];
  updateCartUI();
}

/* ---------- Render Cart ---------- */
function renderCart(){
  const count = cartCount();
  cartCountEl().textContent = count;
  cartSubEl().textContent = `${count} item${count===1?"":"s"}`;
  cartTotalEl().textContent = PKR(cartTotal());

  if(cart.length === 0){
    cartItemsEl().innerHTML = `<div class="card">Your cart is empty. Add products to order on WhatsApp.</div>`;
    return;
  }

  cartItemsEl().innerHTML = cart.map(item => {
    const p = getProduct(item.id);
    return `
      <div class="cartItem">
        <div class="cartItemTop">
          <div>
            <div class="cartItemName">${p.name}</div>
            <div class="cartItemMeta">${p.category} • ${PKR(p.price)}</div>
          </div>
          <button class="removeBtn" onclick="removeItem(${p.id})">Remove</button>
        </div>
        <div class="qtyRow">
          <div><b>${PKR(p.price * item.qty)}</b></div>
          <div class="qtyBtns">
            <button class="qtyBtn" onclick="decQty(${p.id})">−</button>
            <b>${item.qty}</b>
            <button class="qtyBtn" onclick="incQty(${p.id})">+</button>
          </div>
        </div>
      </div>
    `;
  }).join("");
}

function updateCartUI(){
  renderCart();
}

/* ---------- WhatsApp Message ---------- */
function buildCustomerBlock(){
  const name = (byId("custName")?.value || "").trim();
  const phone = (byId("custPhone")?.value || "").trim();
  const addr = (byId("custAddress")?.value || "").trim();
  const note = (byId("custNote")?.value || "").trim();

  let out = "";
  if(name) out += `Name: ${name}\n`;
  if(phone) out += `Phone: ${phone}\n`;
  if(addr) out += `Address: ${addr}\n`;
  if(note) out += `Note: ${note}\n`;
  return out.trim();
}

function buildCartLines(){
  if(cart.length === 0) return "Cart: (empty)\n";
  let lines = "Order Items:\n";
  cart.forEach(item => {
    const p = getProduct(item.id);
    lines += `- ${p.name} x ${item.qty} = ${PKR(p.price * item.qty)}\n`;
  });
  lines += `\nTotal: ${PKR(cartTotal())}\n`;
  return lines;
}

function openWhatsAppWithText(text){
  const encoded = encodeURIComponent(text);
  const url = `https://wa.me/${STORE_WHATSAPP}?text=${encoded}`;
  window.open(url, "_blank");
}

function orderOnWhatsApp(){
  const cust = buildCustomerBlock();
  const cartText = buildCartLines();
  const msg =
`Assalam-o-Alaikum ${STORE_NAME}!
I want to place an order.

${cartText}
${cust ? `\nCustomer Details:\n${cust}\n` : ""}

Please confirm availability, final price, and delivery time.`;

  openWhatsAppWithText(msg);
}

function quickWhatsApp(productId){
  const p = getProduct(productId);
  const msg =
`Assalam-o-Alaikum ${STORE_NAME}!
I want details for:
- ${p.name}
Category: ${p.category}
Price (sample): ${PKR(p.price)}

Please share availability, exact price, warranty, and delivery time.`;
  openWhatsAppWithText(msg);
}

/* ---------- Drawer Controls ---------- */
function openCart(){
  cartDrawer().classList.add("open");
  cartDrawer().setAttribute("aria-hidden", "false");
  overlay().classList.add("show");
}
function closeCart(){
  cartDrawer().classList.remove("open");
  cartDrawer().setAttribute("aria-hidden", "true");
  overlay().classList.remove("show");
}

/* ---------- Mobile Menu ---------- */
function toggleMenu(){
  byId("navLinks").classList.toggle("open");
}

/* ---------- Init ---------- */
function init(){
  setYear();
  renderCategories();
  renderProducts();
  updateCartUI();

  byId("menuBtn").addEventListener("click", toggleMenu);
  byId("openCartBtn").addEventListener("click", openCart);
  byId("closeCartBtn").addEventListener("click", closeCart);
  overlay().addEventListener("click", closeCart);

  searchInput().addEventListener("input", renderProducts);
  categorySelect().addEventListener("change", renderProducts);
  sortSelect().addEventListener("change", renderProducts);

  byId("orderWhatsAppBtn").addEventListener("click", orderOnWhatsApp);
  byId("orderNowFromContact").addEventListener("click", orderOnWhatsApp);

  byId("clearCartBtn").addEventListener("click", clearCart);
}

window.addToCart = addToCart;
window.quickWhatsApp = quickWhatsApp;
window.incQty = incQty;
window.decQty = decQty;
window.removeItem = removeItem;

document.addEventListener("DOMContentLoaded", init);

/* ============ END PART 3/4 ============ */