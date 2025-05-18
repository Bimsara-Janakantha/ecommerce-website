import { getData } from "../utils/connection.js";

// Animate numbers in the summary cards
function animateCount(element, endValue, duration = 1000) {
  let startValue = 0;
  let startTime = null;

  function update(currentTime) {
    if (!startTime) startTime = currentTime;
    const progress = Math.min((currentTime - startTime) / duration, 1);
    const value = Math.floor(progress * endValue);
    element.textContent = value;
    if (progress < 1) requestAnimationFrame(update);
  }

  requestAnimationFrame(update);
}

// Render summary card values
function updateSummaryCounts(summary) {
  const cards = document.querySelectorAll(".summary-cards .card");
  animateCount(cards[0].querySelector("h3"), summary.pending);
  animateCount(cards[1].querySelector("h3"), summary.shipped);
  animateCount(cards[2].querySelector("h3"), summary.completed);
  animateCount(cards[3].querySelector("h3"), summary.failed);
}

// Render table rows
function populateTable(orders) {
  const tbody = document.getElementById("ordersTableBody");
  tbody.innerHTML = ""; // clear existing

  orders.forEach((order) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>#${order.orderId}</td>
      <td>${order.date}</td>
      <td>${order.items}</td>
      <td>${order.address}</td>
      <td><span class="status ${order.status.toLowerCase()}">${
      order.status
    }</span></td>
    `;
    tbody.appendChild(row);
  });
}

// Fetch data and render UI
async function loadSellerOrders() {
  const user = JSON.parse(localStorage.getItem("user")) || {};
  if (!user.userId || user.role !== "seller") {
    alert("Unauthorized access");
    window.location.href = "login.html";
    return;
  }

  try {
    const res = await getData(`sales/orders/${user.userId}`);
    const { summary, orders } = res.data;

    updateSummaryCounts(summary);
    populateTable(orders);
  } catch (err) {
    console.error("Error loading orders:", err);
    alert("Failed to load sales data.");
  }
}

// Run on page load
document.addEventListener("DOMContentLoaded", loadSellerOrders);
