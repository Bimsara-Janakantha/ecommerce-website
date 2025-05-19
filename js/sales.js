import { getData, postData, updateData } from "../utils/connection.js";

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

// Function to update order status
async function updateOrder(sellerId, orderId, currentStatus, newStatus) {
  const data = { sellerId, orderId, currentStatus, newStatus };

  try {
    const serverResponse = await updateData("sales/insights", data);
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

    const dateItems = order.date.trim().split(" ");
    const dateString = `${dateItems[0]} <br/> ${dateItems[1]}`;

    console.log("status: ", order.status.toLowerCase());

    row.innerHTML = `
      <td>#${order.orderId}</td>
      <td>${dateString}</td>
      <td>${generateItemList(order.items)}</td>
      <td style="text-align: left">${generateAddress(order)}</td>
      <td>${order.notes || "-"}</td>
      <td><span class="status ${order.status.toLowerCase()}">${
      order.status
    }</span></td>
    <td><div class="sales-more-info-btn" data-id="${
      order.orderId
    }"><i class="fa-solid fa-ellipsis-vertical"></i></div></td>
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

  let info = await getInfo(user.userId);

  if (!info) return;

  let { summary, orders } = info;
  let selectedOrderId = null;
  let selectedStatus = null;

  updateSummaryCounts(summary);
  populateTable(orders);

  document
    .getElementById("ordersTableBody")
    .addEventListener("click", function (e) {
      const moreBtn = e.target.closest(".sales-more-info-btn");
      if (!moreBtn) return;

      const row = moreBtn.closest("tr");

      selectedOrderId = moreBtn.dataset.id;
      selectedStatus = row.querySelector(".status").textContent.trim();

      document.getElementById("statusDialog").style.display = "flex";
      document.getElementById("statusSelect").value = selectedStatus;
    });

  // Handle Status Dialog Buttons
  document.getElementById("statusCancelBtn").onclick = () => {
    document.getElementById("statusDialog").style.display = "none";
  };

  document.getElementById("statusSaveBtn").onclick = () => {
    document.getElementById("statusDialog").style.display = "none";
    document.getElementById("confirmDialog").style.display = "flex";
  };

  // Handle Confirmation Dialog Buttons
  document.getElementById("confirmCancelBtn").onclick = () => {
    document.getElementById("confirmDialog").style.display = "none";
  };

  document.getElementById("confirmYesBtn").onclick = async () => {
    const newStatus = document.getElementById("statusSelect").value;

    if (newStatus === selectedStatus) {
      notifyMe("No change detected in order status.", "info");
      document.getElementById("confirmDialog").style.display = "none";
      return;
    }

    console.log({ newStatus, selectedOrderId, selectedStatus });

    const updatedInfo = await updateOrder(
      user.userId,
      selectedOrderId,
      selectedStatus,
      newStatus
    );

    if (updatedInfo) {
      ({ summary, orders } = updatedInfo);
      updateSummaryCounts(summary);
      populateTable(orders);
    } else {
      notifyMe("Failed to update order. Please try again.", "error");
    }

    document.getElementById("confirmDialog").style.display = "none";
  };
});
