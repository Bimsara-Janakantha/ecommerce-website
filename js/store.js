import {
  deleteData,
  getData,
  postData,
  updateData,
} from "../utils/connection.js";

const PDCTS = [
  {
    shoeId: 1,
    sku: "SNX001",
    brand: "SneakerX",
    gender: "Women",
    description: "Running Shoes",
    discount: 500,
    price: 7999,
    url: "../assets/women_shoes/shoe_11.jpeg",
    stocks: [
      { size: 36, quantity: 5 },
      { size: 38, quantity: 3 },
    ],
  },
  {
    shoeId: 2,
    sku: "BTX002",
    brand: "BootPro",
    gender: "Women",
    description: "Hiking Boots",
    discount: 800,
    price: 9500,
    url: "../assets/women_shoes/shoe_12.jpeg",
    stocks: [
      { size: 37, quantity: 2 },
      { size: 39, quantity: 3 },
    ],
  },
];

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

// Function to get stocks from backend
async function getStore(seller) {
  const url = `sales/store/${seller}`;

  try {
    const serverResponse = await getData(url);
    const { message, shoeList } = serverResponse.data;
    console.log(message);
    notifyMe(message, "success");
    return shoeList;
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

// Function to update stocks
async function updateStore(data) {
  try {
    const serverResponse = await updateData("sales/store", data);
    const { message } = serverResponse.data;
    console.log(message);
    notifyMe(message, "success");
  } catch (error) {
    console.error("Order Error: ", error);
    const { status, message } = error;
    const knownErrors = [400, 404];
    if (knownErrors.includes(status)) {
      notifyMe(message, "error");
    } else {
      notifyMe("Something went wrong", "error");
    }
  } finally {
    return await getStore(data.sellerId);
  }
}

// Function to add new stocks
async function addStore(data) {
  try {
    const serverResponse = await postData("sales/store", data);
    const { message } = serverResponse.data;
    console.log(message);
    notifyMe(message, "success");
  } catch (error) {
    console.error("Order Error: ", error);
    const { status, message } = error;
    const knownErrors = [400, 404];
    if (knownErrors.includes(status)) {
      notifyMe(message, "error");
    } else {
      notifyMe("Something went wrong", "error");
    }
  } finally {
    return await getStore(data.sellerId);
  }
}

// Function to add new stocks
async function deleteStore(sellerId, shoeId) {
  const data = { sellerId, shoeId };
  try {
    const serverResponse = await deleteData("sales/store", data);
    const { message } = serverResponse.data;
    console.log(message);
    notifyMe(message, "success");
  } catch (error) {
    console.error("Order Error: ", error);
    const { status, message } = error;
    const knownErrors = [400, 404];
    if (knownErrors.includes(status)) {
      notifyMe(message, "error");
    } else {
      notifyMe("Something went wrong", "error");
    }
  } finally {
    return await getStore(sellerId);
  }
}

// Function to generate item list (HTML-safe line breaks)
function generateStockList(items) {
  if (!Array.isArray(items) || items.length === 0) return "";

  return items
    .map((item) => `size: ${item.size} - quantity: ${item.quantity}`)
    .join("<br>");
}

// Render table rows
function populateTable(products) {
  const tbody = document.getElementById("productList");
  tbody.innerHTML = ""; // clear existing

  products.forEach((product) => {
    const row = document.createElement("tr");

    row.innerHTML = `
      <td>
        <img class="product-image" src="${product.url}" alt="${
      product.shoeId
    }" />
        ${product.sku}<br/>
        ${product.brand} ${product.gender} ${product.description}
      </td>
      <td>${formatCurrency(product.discount)}</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${generateStockList(product.stocks)}</td>
      <td>
        <button class="btn-danger" onclick="deleteProduct(${
          product.shoeId
        })">Delete</button>
        <button class="btn-edit" onclick="editProduct(${
          product.shoeId
        })">Edit</button>
      </td>
      `;
    tbody.appendChild(row);
  });
}

addEventListener("DOMContentLoaded", async () => {
  const user = JSON.parse(localStorage.getItem("user")) || null;

  if (!user || isNaN(user.userId) || user.role !== "seller") {
    notifyMe(
      "Unauthorized access. Please log in as a seller.",
      "info",
      "login.html"
    );
    return;
  }

  //let products = await getInfo(user.userId);
  let products = await PDCTS;

  if (!products) return;

  populateTable(products);
});
