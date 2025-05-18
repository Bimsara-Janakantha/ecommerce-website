import { getData } from "../utils/connection.js";

// Numbering format
function formatCurrency(value) {
  new Intl.NumberFormat("en-LK", {
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
async function getInfo(seller, range) {
  const url = `sales/summary/${seller}/${range}`;

  try {
    const serverResponse = await getData(url);

    if (serverResponse.status === 200) {
      const { message, summary } = serverResponse.data;
      console.log(message);
      return summary;
    }
    return null;
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
    return null;
  }
}

// Fill in the dashboard with data
function populateDashboard(summary) {
  if (!summary) return;

  // Update stat cards
  animateCount(
    document.querySelector("#stat-new-orders .number"),
    summary.newOrders
  );
  document.querySelector(
    "#stat-new-orders .subtext"
  ).textContent = `Avg: ${summary.avgDailyOrders} daily`;

  animateCount(
    document.querySelector("#stat-total-income .number"),
    summary.revenue
  );
  document.querySelector(
    "#stat-total-income .subtext"
  ).textContent = `${summary.revenueGrowth}% growth this month`;

  animateCount(
    document.querySelector("#stat-total-cancel .number"),
    summary.totalProducts
  );
  document.querySelector(
    "#stat-total-cancel .subtext"
  ).textContent = `Avg: ${summary.avgDailyCancel} daily`;

  animateCount(
    document.querySelector("#stat-new-users .number"),
    summary.customers
  );
  document.querySelector(
    "#stat-new-users .subtext"
  ).textContent = `${summary.customerGrowth}% growth this month`;

  // Update Quick Summary
  const summaryStats = document.querySelectorAll(".summary .stats > div");
  animateCount(summaryStats[0].querySelector("p"), summary.totalOrders);
  animateCount(summaryStats[2].querySelector("p"), summary.cancelOrders);
  animateCount(summaryStats[1].querySelector("p"), summary.grossIncome);
  animateCount(summaryStats[3].querySelector("p"), summary.activeUsers);
}

// Populate top-selling products
function populateTopProducts(products) {
  const container = document.querySelector(".top-selling");
  const existing = container.querySelectorAll(".product");

  // Clear current products
  existing.forEach((el) => el.remove());

  products.forEach((product) => {
    const div = document.createElement("div");
    div.className = "product";
    div.innerHTML = `
      <div class="product-info">
        <img src="${product.url}" alt="${product.shoeId}" />
        <div>
          <p class="title">
            ${product.brand} ${product.gender} ${product.catagory}
          </p>
          <p class="desc">${product.description}</p>
        </div>
      </div>
      <p class="price">${formatCurrency(product.price)}<br /><span>${
      product.tag
    }</span></p>
    `;
    container.appendChild(div);
  });
}

// Converts object data to Chart.js format
function getChartData(dataObj) {
  return {
    labels: Object.keys(dataObj),
    values: Object.values(dataObj),
  };
}

document.addEventListener("DOMContentLoaded", async function () {
  const user = JSON.parse(localStorage.getItem("user")) || null;

  // User Validation
  if (!user || isNaN(user.userId) || user.role !== "seller") {
    //notifyMe("Unauthorized access. Please log in as a seller.", "info", "login.html");
    //return;
  }

  // Find elements
  const rangeSelector = document.querySelector(".breadcrumb select");
  const ctx = document.getElementById("salesChart").getContext("2d");

  // Global variables
  let currentRange = rangeSelector.value.toLowerCase();
  let chartDatasets = {};
  let chartInstance = null;

  // Function to update dashboard
  const updateDashboard = async () => {
    const summary = await getInfo(user.userId, currentRange);

    if (summary) {
      populateDashboard(summary.basic);
      populateTopProducts(summary.topProducts);
      chartDatasets = summary.chartData;
      renderChart(chartDatasets["Gross Income"], "Gross Income");
    }
  };

  // Function to render the chart
  function renderChart(dataObj, label) {
    const { labels, values } = getChartData(dataObj);

    if (chartInstance) {
      chartInstance.destroy(); // destroy old chart
    }

    chartInstance = new Chart(ctx, {
      type: "bar",
      data: {
        labels: labels,
        datasets: [
          {
            label: label,
            data: values,
            backgroundColor: "rgba(54, 162, 235, 0.7)",
            borderColor: "rgba(54, 162, 235, 1)",
            borderWidth: 1,
            borderRadius: 5,
          },
        ],
      },
      options: {
        scales: {
          y: {
            beginAtZero: true,
            ticks: {
              callback: function (value) {
                return value.toLocaleString("en-LK", {
                  minimumFractionDigits: 2,
                });
              },
            },
          },
        },
        plugins: {
          legend: {
            display: true,
          },
        },
      },
    });
  }

  // Event listner
  rangeSelector.addEventListener("change", async (e) => {
    currentRange = e.target.value.toLowerCase();
    await updateDashboard();
  });

  // Add click listeners
  document.querySelectorAll(".stats > div").forEach((div) => {
    div.addEventListener("click", () => {
      // Remove active class
      document
        .querySelectorAll(".stats > div")
        .forEach((d) => d.classList.remove("active"));
      div.classList.add("active");

      const label = div.querySelector("p:nth-child(2)").textContent.trim();
      const dataset = chartDatasets[label];

      if (dataset) {
        renderChart(dataset, label);
      }
    });
  });

  // Initial Render
  await updateDashboard();
});
