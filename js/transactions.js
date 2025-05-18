import { getData } from "../utils/connection.js";

// Numbering format
function formatCurrency(value) {
  return new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(value);
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

// Function to get info from backend
async function getInfo(seller) {
  const url = `sales/transactions/${seller}`;

  try {
    const serverResponse = await getData(url);
    const { message, summary, transactions } = serverResponse.data;
    console.log(message);
    notifyMe(message, "success");
    return { summary: summary[0], transactions };
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

// Fill in the dashboard with data
function populateDashboard(summary) {
  if (!summary) return;

  console.log(summary);

  // Update Quick Summary
  const summaryStats = document.querySelectorAll(".summary-cards .card");
  animateCount(summaryStats[0].querySelector("h3"), summary.revenue);
  animateCount(summaryStats[1].querySelector("h3"), summary.pending);
  animateCount(summaryStats[2].querySelector("h3"), summary.complete);
  animateCount(summaryStats[3].querySelector("h3"), summary.refund);
}

// Render table
function renderTransactionTable(transactions) {
  const tbody = document.getElementById("transactionTable");
  tbody.innerHTML = ""; // Clear old rows

  transactions.forEach((txn) => {
    const row = document.createElement("tr");
    row.innerHTML = `
      <td>${txn.date}</td>
      <td>${txn.customer}</td>
      <td>${txn.orderId}</td>
      <td><span class="status ${txn.status.toLowerCase()}">${
      txn.status
    }</span></td>
      <td>${formatCurrency(txn.amount)}</td>
    `;
    tbody.appendChild(row);
  });
}

// Init
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

  const searchInput = document.getElementById("searchInput");
  const info = await getInfo(user.userId);

  if (!info) return;

  const { summary, transactions } = info;

  populateDashboard(summary);
  renderTransactionTable(transactions);

  // Live search from transactions list
  searchInput.addEventListener("input", () => {
    const query = searchInput.value.toLowerCase();
    const filtered = transactions.filter(
      (txn) =>
        txn.customer.toLowerCase().includes(query) ||
        txn.status.toLowerCase().includes(query)
    );
    renderTransactionTable(filtered);
  });
});
