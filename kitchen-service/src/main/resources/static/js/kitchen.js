// kitchen.js - kitchen UI (immediate client-side move of completed orders + persistent divider)
const API = "/api/kitchen/orders";

// local store: last-seen fetched orders (keeps local completed orders if server removes them)
let ALL_ORDERS = [];

// helpers
function isoToLocal(iso) {
  if (!iso) return "";
  const d = new Date(iso);
  return d.toLocaleString();
}
function escapeHtml(s){
  return String(s).replace(/[&<>"']/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','"':'&quot;',"'":"&#39;"}[c]));
}

// build items list HTML
function createItemList(items) {
  if (!items || !items.length) return "<div class='items'><em>No items</em></div>";
  const htmlItems = items.map(it => {
    const removed = (it.removedIngredients && it.removedIngredients.length) ?
      `<div style="color:#b22222;font-size:12px">Removed: ${it.removedIngredients.join(", ")}</div>` : "";
    const opt = it.option ? ` <span style="font-size:12px; color:#333">(${escapeHtml(it.option)})</span>` : "";
    return `<li>${escapeHtml(String(it.menuId))}${opt} × ${it.quantity || 1}${removed}</li>`;
  }).join("");
  return `<ul class="items">${htmlItems}</ul>`;
}

// create DOM card for an order
function makeOrderCard(order, completed) {
  const card = document.createElement("div");
  card.className = "order-card";
  card.dataset.orderId = order.orderId;

  const title = document.createElement("div");
  title.style.fontWeight = "700";
  title.style.marginBottom = "6px";
  title.textContent = `Order for ${order.userId || "unknown"}`;

  const meta = document.createElement("div");
  meta.className = "order-meta";
  meta.textContent = `OrderId: ${order.orderId || ""}`;

  // show total
  const totalDiv = document.createElement("div");
  totalDiv.className = "small-note";
  totalDiv.style.fontWeight = "600";
  totalDiv.textContent = "Total: " + (order.total !== undefined && order.total !== null ? Number(order.total).toFixed(2) + " €" : "-");

  const ts = document.createElement("div");
  ts.className = "timestamp";
  ts.textContent = completed ? (order.completedAt ? isoToLocal(order.completedAt) : "Completed") : (order.createdAt ? isoToLocal(order.createdAt) : "");

  const itemsHtml = document.createElement("div");
  itemsHtml.innerHTML = createItemList(order.items || []);

  card.appendChild(title);
  card.appendChild(meta);
  card.appendChild(totalDiv);
  card.appendChild(itemsHtml);

  if (order.comment) {
    const c = document.createElement("div");
    c.className = "comment";
    c.textContent = `Comment: ${order.comment}`;
    card.appendChild(c);
  }

  card.appendChild(ts);

  if (!completed) {
    const btn = document.createElement("button");
    btn.className = "complete-btn";
    btn.textContent = "Complete Order";
    btn.onclick = async () => {
      btn.disabled = true;
      btn.textContent = "Completing...";
      try {
        const res = await fetch(`${API}/${order.orderId}/complete`, { method: "POST" });
        if (!res.ok) {
          const text = await res.text();
          alert("Failed to complete: " + text);
          btn.disabled = false;
          btn.textContent = "Complete Order";
          return;
        }

        // Successful server call - move card to completed column
        const nowIso = new Date().toISOString();

        // Update local ALL_ORDERS: mark as DONE and set completedAt
        const idx = ALL_ORDERS.findIndex(x => x.orderId === order.orderId);
        if (idx >= 0) {
          ALL_ORDERS[idx].status = "DONE";
          ALL_ORDERS[idx].completedAt = nowIso;
        } else {
          ALL_ORDERS.push(Object.assign({}, order, { status: "DONE", completedAt: nowIso }));
        }

        // Remove from Active DOM (if present) and append a completed card to Completed column
        const activeList = document.getElementById("activeOrders");
        const completedList = document.getElementById("completedOrders");
        const existing = activeList.querySelector(`[data-order-id="${order.orderId}"]`);
        if (existing) existing.remove();

        const completedCard = makeOrderCard(Object.assign({}, order, { status: "DONE", completedAt: nowIso }), true);
        // insert at top of completed list for visibility
        if (completedList.firstChild && completedList.firstChild.classList && completedList.firstChild.classList.contains("empty")) {
          completedList.innerHTML = "";
        }
        completedList.insertBefore(completedCard, completedList.firstChild || null);

      } catch (err) {
        alert("Network error: " + err.message);
        btn.disabled = false;
        btn.textContent = "Complete Order";
      }
    };
    card.appendChild(btn);
  }

  return card;
}

// render using ALL_ORDERS
function renderFromAllOrders() {
  const activeEl = document.getElementById("activeOrders");
  const doneEl = document.getElementById("completedOrders");
  activeEl.innerHTML = "";
  doneEl.innerHTML = "";

  const act = ALL_ORDERS.filter(o => !(o.status && String(o.status).toUpperCase() === "DONE"));
  const done = ALL_ORDERS.filter(o => (o.status && String(o.status).toUpperCase() === "DONE"));

  if (!act.length) activeEl.innerHTML = "<div class='empty'>No active orders</div>";
  else act.forEach(o => activeEl.appendChild(makeOrderCard(o, false)));

  if (!done.length) doneEl.innerHTML = "<div class='empty'>No completed orders</div>";
  else done.forEach(o => doneEl.appendChild(makeOrderCard(o, true)));
}

// fetch + merge logic: keep server returned orders as authority for active list
async function loadOrders() {
  try {
    const res = await fetch(API);
    if (!res.ok) {
      document.getElementById("activeOrders").innerHTML = `<div class="empty">Error: ${res.status}</div>`;
      return;
    }
    const payload = await res.json();
    const serverList = Array.isArray(payload) ? payload : (payload.orders || []);

    // Build map of server orders by id
    const serverMap = {};
    serverList.forEach(o => serverMap[o.orderId] = o);

    // Keep local-only completed orders (status DONE) that server no longer returns
    const localCompletedKept = ALL_ORDERS.filter(o => o.status && String(o.status).toUpperCase() === "DONE" && !serverMap[o.orderId]);

    // Recompose ALL_ORDERS: serverList (active and any server-side completed) + locally kept completed
    ALL_ORDERS = serverList.concat(localCompletedKept);

    // Render
    renderFromAllOrders();

  } catch (err) {
    document.getElementById("activeOrders").innerHTML = `<div class="empty">Error: ${err.message}</div>`;
  }
}

// start
document.addEventListener("DOMContentLoaded", () => {
  loadOrders();
  // short interval so kitchen sees new orders fast
  setInterval(loadOrders, 4000);
});
