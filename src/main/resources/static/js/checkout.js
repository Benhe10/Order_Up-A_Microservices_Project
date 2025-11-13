// checkout.js - render each cart entry separately and send them as individual OrderItems
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
}

function makeItemLabel(menuMap, menuId, occurrence) {
  const menu = menuMap[menuId];
  const base = menu ? menu.name : menuId;
  return occurrence > 1 ? `${base} ${occurrence}` : base;
}

async function fetchMenuMap() {
  const res = await fetch("/menu");
  if (!res.ok) throw new Error("Failed to fetch menu");
  const arr = await res.json();
  const map = {};
  arr.forEach(it => { map[String(it.id)] = it; });
  return map;
}

function removeAt(index) {
  const cart = readCart();
  cart.items.splice(index, 1);
  saveCart(cart);
  render();
}

function toggleRemovedIngredient(index, ingredient) {
  const cart = readCart();
  const item = cart.items[index];
  item.removedIngredients = item.removedIngredients || [];
  const pos = item.removedIngredients.indexOf(ingredient);
  if (pos === -1) item.removedIngredients.push(ingredient);
  else item.removedIngredients.splice(pos, 1);
  saveCart(cart);
}

function updateQty(index, val) {
  const cart = readCart();
  val = Math.max(1, parseInt(val || "1", 10));
  if (val === 1) return;
  const entry = cart.items[index];
  const copies = [];
  for (let i = 0; i < val; i++) {
    copies.push({
      id: (window.crypto && window.crypto.randomUUID) ? window.crypto.randomUUID() : (Date.now().toString(36) + "-" + Math.random().toString(36).slice(2)),
      menuId: entry.menuId,
      quantity: 1,
      removedIngredients: Array.isArray(entry.removedIngredients) ? [...entry.removedIngredients] : [],
      selectedOption: entry.selectedOption || null
    });
  }
  cart.items.splice(index, 1, ...copies);
  saveCart(cart);
  render();
}

async function render() {
  const container = document.getElementById("cartList");
  container.innerHTML = "";
  const cart = readCart();
  if (!cart.items || cart.items.length === 0) {
    container.innerHTML = "<p class='loading'>Your cart is empty. Add items from the menu.</p>";
    return;
  }

  const menuMap = await fetchMenuMap();

  // counters for numbering duplicates
  const counters = {};
  cart.items.forEach((it, idx) => {
    const menuId = String(it.menuId);
    counters[menuId] = (counters[menuId] || 0) + 1;
    const occurrence = counters[menuId];

    const menuItem = menuMap[menuId];
    const name = menuItem ? menuItem.name : menuId;
    const price = menuItem ? (menuItem.price ? menuItem.price.toFixed(2) + " €" : "") : "";

    const card = document.createElement("div");
    card.className = "cart-item";

    const left = document.createElement("div");
    left.className = "cart-left";

    const title = document.createElement("div");
    title.style.fontWeight = 700;
    title.style.fontSize = "18px";
    title.textContent = makeItemLabel(menuMap, menuId, occurrence);

    const meta = document.createElement("div");
    meta.className = "small-note";
    meta.textContent = `${menuItem ? menuItem.category : ""} • ${price}`;

    left.appendChild(title);
    left.appendChild(meta);

    // show static description (about the item)
    if (menuItem && menuItem.description) {
      const desc = document.createElement("div");
      desc.className = "small-note";
      desc.style.marginTop = "6px";
      desc.textContent = menuItem.description;
      left.appendChild(desc);
    }

    // Show selected option if any (e.g., Drink: "Diet")
    if (it.selectedOption) {
      const opt = document.createElement("div");
      opt.className = "small-note";
      opt.style.marginTop = "6px";
      opt.textContent = `Option: ${it.selectedOption}`;
      left.appendChild(opt);
    }

    // ingredients exclusion only for non-drinks
    const isDrink = menuItem && String(menuItem.category).toLowerCase() === "drink";
    if (!isDrink && menuItem && menuItem.ingredients && menuItem.ingredients.length) {
      const ingWrap = document.createElement("div");
      ingWrap.className = "ingredients";
      const ingLabel = document.createElement("div");
      ingLabel.textContent = "Ingredients you want to exclude:";
      ingWrap.appendChild(ingLabel);

      menuItem.ingredients.forEach(ing => {
        const row = document.createElement("div");
        const cb = document.createElement("input");
        cb.type = "checkbox";
        cb.checked = (it.removedIngredients || []).includes(ing);
        cb.addEventListener("change", () => toggleRemovedIngredient(idx, ing));
        const lab = document.createElement("label");
        lab.style.marginLeft = "8px";
        lab.textContent = ing;
        row.appendChild(cb);
        row.appendChild(lab);
        ingWrap.appendChild(row);
      });
      left.appendChild(ingWrap);
    }

    // right side
    const right = document.createElement("div");
    right.className = "cart-right";

    const qtyLabel = document.createElement("div");
    qtyLabel.textContent = "Quantity (click to expand)";
    const qty = document.createElement("input");
    qty.type = "number";
    qty.className = "qty";
    qty.value = 1;
    qty.min = 1;
    qty.addEventListener("change", (e) => {
      const val = Math.max(1, parseInt(e.target.value || "1", 10));
      updateQty(idx, val);
    });

    right.appendChild(qty);
    right.appendChild(document.createElement("br"));
    right.appendChild(document.createElement("br"));

    const del = document.createElement("button");
    del.className = "delete-btn";
    del.textContent = "Delete";
    del.addEventListener("click", () => {
      removeAt(idx);
    });
    right.appendChild(del);

    card.appendChild(left);
    card.appendChild(right);
    container.appendChild(card);
  });
}

// validate name (no default allowed) and toggle finalize button
function validateNameAndToggleButton() {
  const nameInput = document.getElementById("customerName");
  const finalizeBtn = document.getElementById("finalizeBtn");
  const nameValidation = document.getElementById("nameValidation");
  if (!nameInput || !finalizeBtn) return;
  const val = (nameInput.value || "").trim();
  if (val.length === 0) {
    finalizeBtn.disabled = true;
    nameValidation.style.display = "block";
  } else {
    finalizeBtn.disabled = false;
    nameValidation.style.display = "none";
  }
}

async function finalizeOrder() {
  const cart = readCart();
  if (!cart.items || cart.items.length === 0) {
    alert("Cart is empty.");
    return;
  }

  const nameInput = document.getElementById("customerName");
  const customerName = nameInput ? (nameInput.value || "").trim() : "";
  if (!customerName) {
    document.getElementById("nameValidation").style.display = "block";
    return;
  }

  const globalComment = document.getElementById("globalComment").value;
  const payload = {
    userId: customerName,
    items: cart.items.map(it => ({
      menuId: it.menuId,
      quantity: it.quantity || 1,
      removedIngredients: it.removedIngredients || [],
      option: it.selectedOption || null
    })),
    comment: globalComment || null
  };

  try {
    document.getElementById("finalizeBtn").disabled = true;
    const res = await fetch("http://localhost:8081/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    if (!res.ok) {
      const txt = await res.text();
      document.getElementById("result").textContent = "Failed: " + txt;
      document.getElementById("finalizeBtn").disabled = false;
      return;
    }
    const json = await res.json();
    document.getElementById("result").textContent = "Order placed: " + json.orderId;
    localStorage.removeItem(STORAGE_KEY);
    saveCart({ items: [] });
    render();
  } catch (err) {
    console.error(err);
    document.getElementById("result").textContent = "Error: " + err.message;
    document.getElementById("finalizeBtn").disabled = false;
  }
}

document.addEventListener("DOMContentLoaded", async () => {
  await render();
  // ensure button state is tied to name input
  const nameInput = document.getElementById("customerName");
  if (nameInput) {
    // start blank (no default)
    nameInput.value = "";
    nameInput.addEventListener("input", validateNameAndToggleButton);
  }
  validateNameAndToggleButton();
  document.getElementById("finalizeBtn").addEventListener("click", finalizeOrder);
});
