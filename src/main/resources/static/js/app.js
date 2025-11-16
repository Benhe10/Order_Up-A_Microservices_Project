// src/main/resources/static/js/app.js
// Menu page: fetch /menu and build category dropdowns + add-to-cart
// - Inserts ingredients & allergies in the item card
// - Computes and updates checkout total badge

const CATEGORIES = [
  { key: "Starter", label: "Starters" },
  { key: "Main", label: "Main course" },
  { key: "Dessert", label: "Desserts" },
  { key: "Drink", label: "Drinks" }
];

const STORAGE_KEY = "orderup_cart_v1";
const MENU_MAP_KEY = "orderup_menu_map_v1";

function readCart() {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    return raw ? JSON.parse(raw) : { items: [] };
  } catch (e) {
    console.error("Invalid cart in storage", e);
    return { items: [] };
  }
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  updateCartBadge();
  updateCheckoutTotal();
}

function updateCartBadge() {
  const cart = readCart();
  const count = cart.items.reduce((s, it) => s + (it.quantity || 1), 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = count;
}

function makeId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return Date.now().toString(36) + "-" + Math.floor(Math.random()*1e6).toString(36);
}

function addSingleToCart(menuItem, quantity = 1) {
  const cart = readCart();
  for (let i = 0; i < quantity; i++) {
    cart.items.push({
      id: makeId(),
      menuId: menuItem.id,
      quantity: 1,
      removedIngredients: [],
      description: ""
    });
  }
  saveCart(cart);
}

function groupMenuByCategory(menu) {
  const map = {};
  for (const c of CATEGORIES) map[c.key] = [];
  for (const item of menu) {
    const cat = item.category || "Main";
    if (!map[cat]) map[cat] = [];
    map[cat].push(item);
  }
  return map;
}

function createCategoryCard(label, items) {
  const card = document.createElement("div");
  card.className = "category-card";

  const header = document.createElement("div");
  header.className = "category-header";

  const title = document.createElement("div");
  title.className = "category-title";

  const tri = document.createElement("span");
  tri.className = "triangle";

  const tLabel = document.createElement("span");
  tLabel.textContent = label;

  title.appendChild(tri);
  title.appendChild(tLabel);

  const count = document.createElement("div");
  count.textContent = `${items.length} item${items.length !== 1 ? "s" : ""}`;
  count.style.opacity = 0.8;

  header.appendChild(title);
  header.appendChild(count);

  const list = document.createElement("div");
  list.className = "items-list";

  items.forEach(it => {
    const container = document.createElement("div");
    container.className = "item-row item-container";

    const left = document.createElement("div");
    left.className = "item-left";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = it.name;

    const meta = document.createElement("div");
    meta.className = "item-meta";
    meta.textContent = `${it.category} • ${Number(it.price).toFixed(2)} €`;

    left.appendChild(name);
    left.appendChild(meta);

    if (it.description) {
      const desc = document.createElement("div");
      desc.className = "small-note";
      desc.textContent = it.description;
      desc.style.marginTop = "6px";
      left.appendChild(desc);
    }

    // Ingredients inside same card
    if (it.ingredients && it.ingredients.length) {
      const ing = document.createElement("div");
      ing.className = "item-ingredients";
      ing.textContent = `Ingredients: ${it.ingredients.join(", ")}`;
      ing.style.marginTop = "8px";
      left.appendChild(ing);
    }

    // Allergies inside same card (if any)
    if (it.allergies && it.allergies.length) {
      const all = document.createElement("div");
      all.className = "item-allergies";
      all.textContent = `Allergies: ${it.allergies.join(", ")}`;
      all.style.marginTop = "6px";
      all.style.color = "#b22222";
      left.appendChild(all);
    }

    container.appendChild(left);

    // right controls
    const right = document.createElement("div");
    right.className = "controls";

    const qty = document.createElement("input");
    qty.className = "qty";
    qty.type = "number";
    qty.min = 1;
    qty.value = 1;

    const addBtn = document.createElement("button");
    addBtn.className = "add-btn";
    addBtn.textContent = "Add to cart";

    addBtn.addEventListener("click", () => {
      const q = parseInt(qty.value, 10) || 1;
      addSingleToCart(it, q);
      addBtn.textContent = "Added";
      setTimeout(() => addBtn.textContent = "Add to cart", 700);
    });

    right.appendChild(qty);
    right.appendChild(addBtn);
    container.appendChild(right);

    list.appendChild(container);
  });

  header.addEventListener("click", () => {
    const opened = list.style.display === "block";
    list.style.display = opened ? "none" : "block";
    tri.style.transform = opened ? "rotate(0deg)" : "rotate(90deg)";
  });

  card.appendChild(header);
  card.appendChild(list);
  return card;
}

async function loadMenu() {
  const el = document.getElementById("categories");
  el.innerHTML = "";
  const loading = document.createElement("p");
  loading.className = "loading";
  loading.textContent = "Loading menu…";
  el.appendChild(loading);

  try {
    const res = await fetch("/menu");
    if (!res.ok) throw new Error("Failed to fetch menu: " + res.status);
    const menu = await res.json();

    // cache menu map for checkout and totals
    const map = {}; menu.forEach(i => map[i.id] = i);
    localStorage.setItem(MENU_MAP_KEY, JSON.stringify(map));

    el.innerHTML = "";
    const grouped = groupMenuByCategory(menu);
    CATEGORIES.forEach(cat => {
      const items = grouped[cat.key] || [];
      const card = createCategoryCard(cat.label, items);
      el.appendChild(card);
    });

    updateCartBadge();
    updateCheckoutTotal();
  } catch (err) {
    el.innerHTML = `<p class="loading">Error loading menu: ${err.message}</p>`;
    console.error(err);
  }
}

function computeCartTotal() {
  const cart = readCart();
  let total = 0;
  try {
    const raw = localStorage.getItem(MENU_MAP_KEY);
    const menuMap = raw ? JSON.parse(raw) : {};
    for (const entry of cart.items) {
      const item = menuMap[entry.menuId];
      if (item && item.price) total += Number(item.price) * (entry.quantity || 1);
    }
  } catch (e) {
    console.warn("Could not compute total:", e);
  }
  return total;
}

function updateCheckoutTotal() {
  const el = document.getElementById("checkoutTotal");
  if (!el) return;
  const total = computeCartTotal();
  el.textContent = `${Number(total).toFixed(2)} €`;
}

document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  updateCartBadge();
  updateCheckoutTotal();
});
