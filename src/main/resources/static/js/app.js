// app.js - fetches /menu and builds category dropdowns + add-to-cart
const CATEGORIES = [
  { key: "Starter", label: "Starters" },
  { key: "Main", label: "Main course" },
  { key: "Dessert", label: "Desserts" },
  { key: "Drink", label: "Drinks" }
];

const STORAGE_KEY = "orderup_cart_v1";

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
}

function updateCartBadge() {
  const cart = readCart();
  const count = cart.items.reduce((s, it) => s + (it.quantity || 0), 0);
  const badge = document.getElementById("cartCount");
  if (badge) badge.textContent = count;
}

function makeId() {
  if (window.crypto && window.crypto.randomUUID) return window.crypto.randomUUID();
  return Date.now().toString(36) + "-" + Math.floor(Math.random() * 1e6).toString(36);
}

// add single unit as independent cart entry, store selectedOption for drinks
function addSingleToCart(menuItem, selectedOption) {
  const cart = readCart();
  cart.items.push({
    id: makeId(),
    menuId: menuItem.id,
    quantity: 1,
    removedIngredients: [],
    selectedOption: selectedOption || null
  });
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
    container.style.width = "100%";

    const row = document.createElement("div");
    row.className = "item-row";

    const left = document.createElement("div");
    left.className = "item-left";

    const name = document.createElement("div");
    name.className = "item-name";
    name.textContent = it.name;

    const meta = document.createElement("div");
    meta.className = "item-meta";
    const priceText = (typeof it.price === "number") ? `${it.price.toFixed(2)} €` : (it.price || "");
    meta.textContent = `${it.category || ""} • ${priceText}`;

    // description about the item (static, shown both in menu and checkout)
    const desc = document.createElement("div");
    desc.className = "small-note";
    desc.style.marginTop = "6px";
    desc.textContent = it.description || "";

    left.appendChild(name);
    left.appendChild(meta);
    left.appendChild(desc);

    row.appendChild(left);

    const right = document.createElement("div");
    right.className = "controls";

    // qty
    const qty = document.createElement("input");
    qty.className = "qty";
    qty.type = "number";
    qty.min = 1;
    qty.value = 1;

    // if item has options (drinks), create a select
    let optionSelect = null;
    if (it.options && Array.isArray(it.options) && it.options.length > 0) {
      optionSelect = document.createElement("select");
      optionSelect.style.marginRight = "8px";
      it.options.forEach(opt => {
        const o = document.createElement("option");
        o.value = opt;
        o.textContent = opt;
        optionSelect.appendChild(o);
      });
    }

    const addBtn = document.createElement("button");
    addBtn.className = "add-btn";
    addBtn.textContent = "Add to cart";

    addBtn.addEventListener("click", () => {
      const q = parseInt(qty.value, 10) || 1;
      const selectedOption = optionSelect ? optionSelect.value : null;
      for (let i = 0; i < q; i++) addSingleToCart(it, selectedOption);
      addBtn.textContent = "Added";
      setTimeout(() => addBtn.textContent = "Add to cart", 800);
    });

    if (optionSelect) right.appendChild(optionSelect);
    right.appendChild(qty);
    right.appendChild(addBtn);

    row.appendChild(right);

    // show ingredients as a simple small-note (not editable here)
    const ing = document.createElement("div");
    ing.style.fontSize = "12px";
    ing.style.opacity = 0.9;
    ing.textContent = (it.ingredients && it.ingredients.length) ? `Ingredients: ${it.ingredients.join(", ")}` : "";
    ing.style.marginTop = "8px";

    container.appendChild(row);
    container.appendChild(ing);
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
  if (!el) {
    console.error("Missing #categories element in index.html");
    return;
  }
  el.innerHTML = "";
  const loading = document.createElement("p");
  loading.className = "loading";
  loading.textContent = "Loading menu…";
  el.appendChild(loading);

  try {
    const res = await fetch("/menu");
    if (!res.ok) throw new Error("Failed to fetch menu: " + res.status);
    const menu = await res.json();
    el.innerHTML = "";

    const grouped = groupMenuByCategory(menu);
    CATEGORIES.forEach(cat => {
      const items = grouped[cat.key] || [];
      const card = createCategoryCard(cat.label, items);
      el.appendChild(card);
    });

    updateCartBadge();
  } catch (err) {
    el.innerHTML = `<p class="loading">Error loading menu: ${err.message}</p>`;
    console.error(err);
  }
}

document.addEventListener("DOMContentLoaded", () => {
  loadMenu();
  updateCartBadge();
});
