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
async function getInfo(seller, range) {
  const url = `sales/summary/${seller}/${range}`;

  try {
    const serverResponse = await getData(url);
    const { message, summary } = serverResponse.data;
    console.log({ message, summary });
    notifyMe(message, "success");
    return summary;
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

  // Update stat cards
  animateCount(
    document.querySelector("#stat-new-orders .number"),
    summary.newOrders
  );
  document.querySelector(
    "#stat-new-orders .subtext"
  ).textContent = `Avg: ${summary.avgDailyOrders.toFixed(0)} daily`;

  animateCount(
    document.querySelector("#stat-total-income .number"),
    summary.revenue
  );
  document.querySelector(
    "#stat-total-income .subtext"
  ).textContent = `${summary.revenueGrowth.toFixed(0)}% growth this month`;

  animateCount(
    document.querySelector("#stat-total-cancel .number"),
    summary.cancelOrders
  );
  document.querySelector(
    "#stat-total-cancel .subtext"
  ).textContent = `Avg: ${summary.avgDailyCancel.toFixed(0)} daily`;

  animateCount(
    document.querySelector("#stat-new-users .number"),
    summary.customers
  );
  document.querySelector(
    "#stat-new-users .subtext"
  ).textContent = `${summary.customerGrowth.toFixed(0)}% growth this month`;

  // Update Quick Summary
  const summaryStats = document.querySelectorAll(".summary .stats > div");
  animateCount(summaryStats[0].querySelector("p"), summary.newOrders);
  animateCount(summaryStats[1].querySelector("p"), summary.cancelOrders);
  animateCount(summaryStats[2].querySelector("p"), summary.revenue);
  animateCount(summaryStats[3].querySelector("p"), summary.activeCustomers);
}

// Populate top-selling products
function populateTopProducts(products) {
  const container = document.querySelector(".top-selling");
  const existing = container.querySelectorAll(".product");

  // Clear current products
  existing.forEach((el) => el.remove());

  if (products) {
    container.querySelector("div").style.display = "none";
    products.forEach((product) => {
      const div = document.createElement("div");
      div.className = "product";
      div.innerHTML = `
      <div class="product-info">
        <img src="${product.url}" alt="${product.shoeId}" />
        <div>
          <p class="title">
            ${product.brand} ${product.gender} ${product.category}
          </p>
          <p class="desc">${product.description}</p>
        </div>
      </div>
      <p class="price">${formatCurrency(product.price)}<br /></p>
    `;
      container.appendChild(div);
    });
  } else {
    container.querySelector("div").style.display = "block";
  }
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
    /* const summary = {
      basic: {
        newOrders: 1000,
        avgDailyOrders: 400,
        revenue: 50000,
        revenueGrowth: 19,
        cancelOrders: 50,
        avgDailyCancel: 2,
        customers: 60000,
        customerGrowth: 25.8855,
      },
      topProducts: [
        {
          shoeId: 41,
          url: "../assets/women_shoes/shoe_11.jpeg",
          brand: "NIKE",
          gender: "WOMEN",
          catagory: "BOOTS",
          description: "tests tests tests",
          price: 50000,
        },
        {
          shoeId: 42,
          url: "../assets/women_shoes/shoe_11.jpeg",
          brand: "NIKE",
          gender: "WOMEN",
          catagory: "BOOTS",
          description: "tests tests tests",
          price: 50000,
        },
        {
          shoeId: 43,
          url: "../assets/women_shoes/shoe_11.jpeg",
          brand: "NIKE",
          gender: "WOMEN",
          catagory: "BOOTS",
          description: "tests tests tests",
          price: 50000,
        },
        {
          shoeId: 44,
          url: "../assets/women_shoes/shoe_11.jpeg",
          brand: "NIKE",
          gender: "WOMEN",
          catagory: "BOOTS",
          description:
            "tests tests teststests tests teststests tests teststests tests tests",
          price: 50000,
        },
        {
          shoeId: 45,
          url: "../assets/women_shoes/shoe_11.jpeg",
          brand: "NIKE",
          gender: "WOMEN",
          catagory: "BOOTS",
          description: "tests tests tests",
          price: 50000,
        },
      ],
      chartDatasets: {
        "New Orders": { sun: 120, mon: 300, tue: 180, wed: 250 },
        "Canceled Orders": { sun: 2500, mon: 750, tue: 5852, wed: 4200 },
        Revenue: { sun: 32, mon: 29, tue: 41, wed: 55 },
        "ToTal Customers": { sun: 10, mon: 14, tue: 12, wed: 17 },
      },
    }; */

    if (summary) {
      populateDashboard(summary.basic);
      populateTopProducts(summary.topProducts);
      chartDatasets = summary.chartDatasets;
      renderChart(chartDatasets["Revenue"], "Revenue");
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
            backgroundColor: "#5f9fe0",
            borderColor: "#5f9fe0",
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
