import { getData } from "../utils/connection.js";

// Function to animate count
function animateCount(el, endValue, duration = 1000) {
  let startValue = 0;
  let startTime = null;

  function update(currentTime) {
    if (!startTime) startTime = currentTime;
    const elapsed = currentTime - startTime;
    const progress = Math.min(elapsed / duration, 1);
    const value = Math.floor(progress * endValue);
    el.textContent = value.toLocaleString(); // adds commas
    if (progress < 1) {
      requestAnimationFrame(update);
    }
  }

  requestAnimationFrame(update);
}

// Function to display message
function notifyMe(message, type, redirectUrl = null) {
  const status_msg = document.querySelector("#status-message");
  let icon;

  switch (type) {
    case "success":
      icon = `<i class="fa-regular fa-circle-check"></i>`;
      break;
    case "error":
      icon = `<i class="fa-regular fa-circle-xmark"></i>`;
      break;
    case "info":
      icon = `<i class="fa fa-info-circle" aria-hidden="true"></i>`;
      break;
    default:
      icon = `<i class="fa-regular fa-bell"></i>`;
  }

  status_msg.innerHTML = ` ${icon} ${message} `;
  status_msg.classList.add(type);
  status_msg.style.display = "flex";

  setTimeout(() => {
    status_msg.classList.remove(type);
    status_msg.style.display = "none";

    // Redirect if a URL is provided
    if (redirectUrl) {
      location.href = redirectUrl;
    }
  }, 3000);
}

// Function to get info from backend
async function getInfo(seller) {
  const url = `sales/insights/${seller}`;

  try {
    const serverResponse = await getData(url);
    const { message, summary, orders } = serverResponse.data;
    console.log(message);
    notifyMe(message, "success");
    return { summary: summary[0], orders };
  } catch (error) {
    console.error("Order Error: ", error);
    const { status, message } = error;
    const knownErrors = [400, 404];
    if (knownErrors.includes(status)) {
      notifyMe(message, "error");
    } else {
      notifyMe("Something went wrong", "error");
    }
    return null;
  }
}

// Render summary card values
function updateSummaryCounts(summary) {
  if (!summary) return;

  console.log(summary);

  const cards = document.querySelectorAll(".summary-cards .card");
  animateCount(cards[0].querySelector("h3"), summary.pending);
  animateCount(cards[1].querySelector("h3"), summary.shipped);
  animateCount(cards[2].querySelector("h3"), summary.completed);
  animateCount(cards[3].querySelector("h3"), summary.failed);
}

// Function to generate address (HTML-safe line breaks)
function generateAddress(order) {
  if (!order) return "";

  return `
    ${order.fName} ${order.lName}<br>
    ${order.apt},<br>
    ${order.street},<br>
    ${order.city},<br>
    ${order.province} Province,<br>
    ${order.postal}<br>
    ${order.mobile}
  `;
}

// Function to generate item list (HTML-safe line breaks)
function generateItemList(items) {
  if (!Array.isArray(items) || items.length === 0) return "";

  return items
    .map(
      (item) => `${item.sku} | size: ${item.size} | quantity: ${item.quantity}`
    )
    .join("<br>");
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
      <td>${generateItemList(order.items)}</td>
      <td style="text-align: left">${generateAddress(order)}</td>
      <td>${order.notes || "-"}</td>
      <td><span class="status ${order.status.toLowerCase()}">${
      order.status
    }</span></td>
    `;
    tbody.appendChild(row);
  });
}

// Run on page load
document.addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user")) || null;

  if (!user || isNaN(user.userId) || user.role !== "seller") {
    notifyMe(
      "Unauthorized access. Please log in as a seller.",
      "info",
      "login.html"
    );
    return;
  }

  const info = await getInfo(user.userId);

  if (!info) return;

  const { summary, orders } = info;

  updateSummaryCounts(summary);
  populateTable(orders);
});
