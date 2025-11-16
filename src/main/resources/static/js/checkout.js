const STORAGE_KEY = "orderup_cart_v1";
const MENU_MAP_KEY = "orderup_menu_map_v1";

// Synoym mapping for allergies -> ingredient tokens
const ALLERGY_SYNONYMS = {
  shellfish: ["shrimp","prawn","prawns","crab","lobster","squid","calamari","octopus"],
  peanut: ["peanut","peanuts","peanut butter"],
  milk: ["milk","cheese","butter","cream","mozzarella","parmesan","mascarpone"],
  gluten: ["flour","dough","bun","bread","croutons","breadcrumbs","spaghetti","pasta","wheat","ladyfingers"],
  egg: ["egg","eggs","mayonnaise"],
  fish: ["salmon","tuna","anchovy","fish"],
  soy: ["soy","tofu","soy sauce","edamame"]
};

function normalize(s){ return String(s||"").toLowerCase().trim(); }

function ingredientRemovesAllergy(allergyToken, ingredient) {
  const a = normalize(allergyToken);
  const r = normalize(ingredient);
  if (!a || !r) return false;
  if (r === a || r.includes(a) || a.includes(r)) return true;
  const synonyms = ALLERGY_SYNONYMS[a];
  if (synonyms) {
    return synonyms.some(x => r.includes(x) || x.includes(r));
  }
  // reverse check
  for (const [all, list] of Object.entries(ALLERGY_SYNONYMS)) {
    if (list.some(x => r.includes(x) || x.includes(r))) {
      if (all === a) return true;
    }
  }
  return false;
}

function remainingAllergies(menuItem, removedIngredients) {
  const allergies = Array.isArray(menuItem.allergies) ? menuItem.allergies.slice() : [];
  if (!removedIngredients || removedIngredients.length === 0) return allergies;
  const removed = removedIngredients.map(i => normalize(i));
  return allergies.filter(all => {
    for (const r of removed) {
      if (ingredientRemovesAllergy(all, r)) return false;
    }
    return true;
  });
}

function readCart() {
  try { const raw = localStorage.getItem(STORAGE_KEY); return raw ? JSON.parse(raw) : { items: [] }; }
  catch(e) { console.error("readCart error", e); return { items: [] }; }
}
function saveCart(cart) {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(cart));
  renderCart();
  updateTotals();
  const headerTotal = document.getElementById("checkoutTotal");
  if (headerTotal) headerTotal.textContent = computeCartTotal().toFixed(2) + " €";
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
  } catch (e) { console.warn("computeCartTotal error", e); }
  return total;
}

async function loadMenuMap() {
  const cached = localStorage.getItem(MENU_MAP_KEY);
  if (cached) {
    try { return JSON.parse(cached); } catch(e){ console.warn("menuMap parse failed", e); }
  }
  const res = await fetch("/menu");
  if (!res.ok) throw new Error("Cannot fetch /menu: " + res.status);
  const menu = await res.json();
  const map = {}; menu.forEach(i => map[i.id] = i);
  localStorage.setItem(MENU_MAP_KEY, JSON.stringify(map));
  return map;
}

function removeCartItem(entryId) {
  const cart = readCart();
  cart.items = cart.items.filter(it => it.id !== entryId);
  saveCart(cart);
}

function toggleRemovedIngredient(entryId, ingredient, checked) {
  const cart = readCart();
  const entry = cart.items.find(it => it.id === entryId);
  if (!entry) return;
  entry.removedIngredients = entry.removedIngredients || [];
  if (checked && !entry.removedIngredients.includes(ingredient)) entry.removedIngredients.push(ingredient);
  if (!checked) entry.removedIngredients = entry.removedIngredients.filter(i => i !== ingredient);
  saveCart(cart);
}

async function renderCart() {
  const container = document.getElementById("cartList");
  if (!container) { console.warn("renderCart: #cartList not found"); return; }
  container.innerHTML = "";
  const cart = readCart();
  if (!cart.items || cart.items.length === 0) {
    container.innerHTML = '<div class="loading">Your cart is empty.</div>';
    updateTotals();
    return;
  }
  const menuMap = await loadMenuMap();

  cart.items.forEach(entry => {
    const itemDef = menuMap[entry.menuId];
    const card = document.createElement("div");
    card.className = "cart-item";

    const left = document.createElement("div");
    left.className = "cart-left";

    const name = document.createElement("div");
    name.className = "cart-name";
    name.textContent = itemDef ? itemDef.name : entry.menuId;
    left.appendChild(name);

    if (itemDef && itemDef.description) {
      const desc = document.createElement("div");
      desc.className = "small-note";
      desc.textContent = itemDef.description;
      left.appendChild(desc);
    }

    // Ingredients and checkboxes
    if (itemDef && Array.isArray(itemDef.ingredients) && itemDef.ingredients.length) {
      if (itemDef.category !== "Drink") {
        // show "Ingredients you want to exclude" text above checkboxes
        const header = document.createElement("div");
        header.className = "small-note";
        header.style.fontWeight = "600";
        header.style.marginTop = "8px";
        header.textContent = "Ingredients you want to exclude:";
        left.appendChild(header);

        const ingWrap = document.createElement("div");
        ingWrap.className = "ingredients";
        entry.removedIngredients = entry.removedIngredients || [];
        itemDef.ingredients.forEach(ing => {
          const label = document.createElement("label");
          label.style.display = "inline-block";
          label.style.marginRight = "10px";
          const cb = document.createElement("input");
          cb.type = "checkbox";
          cb.checked = entry.removedIngredients.includes(ing);
          cb.dataset.ingredient = ing;
          cb.addEventListener("change", (ev) => {
            toggleRemovedIngredient(entry.id, ing, ev.target.checked);
          });
          label.appendChild(cb);
          label.appendChild(document.createTextNode(" " + ing));
          ingWrap.appendChild(label);
        });
        left.appendChild(ingWrap);
      } else {
        const ingText = document.createElement("div");
        ingText.className = "small-note";
        ingText.textContent = "Ingredients: " + itemDef.ingredients.join(", ");
        left.appendChild(ingText);
      }
    }

    // Allergies
    if (itemDef && Array.isArray(itemDef.allergies)) {
      const allergyDiv = document.createElement("div");
      allergyDiv.className = "small-note";
      const remaining = remainingAllergies(itemDef, entry.removedIngredients || []);
      if (remaining.length) {
        allergyDiv.style.color = "#b22222";
        allergyDiv.textContent = "Allergies: " + remaining.join(", ");
      } else {
        allergyDiv.style.color = "#2e7d32";
        allergyDiv.textContent = "No allergy triggers after customization";
      }
      left.appendChild(allergyDiv);
    }

    card.appendChild(left);

    const right = document.createElement("div");
    right.className = "cart-right";

    const priceLine = document.createElement("div");
    priceLine.className = "price-line";
    priceLine.textContent = itemDef ? Number(itemDef.price).toFixed(2) + " €" : "0.00 €";
    right.appendChild(priceLine);

    const remBtn = document.createElement("button");
    remBtn.className = "delete-btn";
    remBtn.textContent = "Remove item";
    remBtn.addEventListener("click", () => removeCartItem(entry.id));
    remBtn.style.display = "block";
    remBtn.style.marginTop = "12px";
    right.appendChild(remBtn);

    card.appendChild(right);
    container.appendChild(card);
  });

  updateTotals();
}

// updateTotals sets price displays and button state
async function updateTotals() {
  const total = computeCartTotal();
  const topEl = document.getElementById("totalPrice");
  const rightEl = document.getElementById("totalPriceRight");
  const headerBadge = document.getElementById("checkoutTotal");
  const finalizeEl = document.getElementById("finalizeTotal"); // new

  if (topEl) topEl.textContent = Number(total).toFixed(2) + " €";
  if (rightEl) rightEl.textContent = Number(total).toFixed(2) + " €";
  if (headerBadge) headerBadge.textContent = Number(total).toFixed(2) + " €";
  if (finalizeEl) finalizeEl.textContent = Number(total).toFixed(2) + " €";

  updateButtonState();
}

function updateButtonState() {
  const finalizeBtn = document.getElementById("finalizeBtn");
  const userInput = document.getElementById("userName");
  const cart = readCart();
  const cartNotEmpty = cart.items && cart.items.length > 0;
  const hasName = userInput && String(userInput.value || "").trim().length > 0;

  // debug
  console.debug("updateButtonState: cartNotEmpty=", cartNotEmpty, "hasName=", hasName);

  if (finalizeBtn) {
    finalizeBtn.disabled = !(cartNotEmpty && hasName);
    if (finalizeBtn.disabled) {
      finalizeBtn.classList.add("disabled");
    } else {
      finalizeBtn.classList.remove("disabled");
    }
  }
  const status = document.getElementById("statusMsg");
  if (status) status.textContent = "";
}

async function finalizeOrder() {
  const userInput = document.getElementById("userName");
  const status = document.getElementById("statusMsg");
  if (!userInput) {
    if (status) { status.textContent = "Missing name field."; status.style.color = "#b22222"; }
    return;
  }
  const user = (userInput.value || "").trim();
  if (!user) {
    if (status) { status.textContent = "Please enter a name before finalizing."; status.style.color = "#b22222"; }
    return;
  }
  const cart = readCart();
  if (!cart.items || cart.items.length === 0) {
    if (status) { status.textContent = "Cart is empty."; status.style.color = "#b22222"; }
    return;
  }

  // NOTE: we now read the global comment textarea that exists in checkout.html:
  const globalCommentEl = document.getElementById("globalComment");
  const globalComment = globalCommentEl ? (globalCommentEl.value || "").trim() : "";

   const payload = {
     userId: user,
     items: cart.items.map(it => ({ menuId: it.menuId, quantity: it.quantity || 1, removedIngredients: it.removedIngredients || [] })),
     comment: globalComment,
     total: computeCartTotal()
   };

  try {
    const res = await fetch("http://localhost:8081/api/orders", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify(payload)
    });
    const data = await res.json().catch(() => null);
    if (!res.ok) {
      if (status) status.textContent = `Failed: ${res.status} ${data ? JSON.stringify(data) : ""}`;
      return;
    }
    // success
    localStorage.removeItem(STORAGE_KEY);
    renderCart();
    if (status) { status.textContent = "Order placed — kitchen received it!"; status.style.color = "#2e7d32"; }
    setTimeout(() => { window.location.href = "/"; }, 900);
  } catch (e) {
    console.error("finalizeOrder error", e);
    if (status) status.textContent = "Network error — could not place order";
  }
}

document.addEventListener("DOMContentLoaded", () => {
  const finalizeBtn = document.getElementById("finalizeBtn");
  if (finalizeBtn) {
    finalizeBtn.disabled = true;
    finalizeBtn.addEventListener("click", finalizeOrder);
  } else {
    console.warn("finalizeBtn not found in DOM");
  }

  const userInput = document.getElementById("userName");
  if (userInput) {
    userInput.addEventListener("input", () => updateButtonState());
  } else {
    console.warn("userName input not found in DOM");
  }

  renderCart();
});
