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
        <div>
          <img 
            class="product-image" 
            src="${product.url}" 
            alt="${product.shoeId}" 
          />
          <div>
            <p>${product.sku}<br/></p>
            <strong>
              ${product.brand} | ${product.gender} | ${product.category} <br/>
            </strong>
            <span>${product.description}</span>
          </div>
        </div>
      </td>
      <td>${product.discount}%</td>
      <td>${formatCurrency(product.price)}</td>
      <td>${generateStockList(product.stocks)}</td>
      <td>
      <div>        
        <button class="secondary" data-action="edit" data-id="${
          product.shoeId
        }">Edit</button>
          <button class="error" data-action="delete" data-id="${
            product.shoeId
          }">Delete</button>
        </div>
      </td>
      `;
    tbody.appendChild(row);
  });
}

// Add Empty Stock Rows
function addStockRow(size = "", quantity = "") {
  const stockSection = document.getElementById("stockSection");
  const stockDiv = document.createElement("div");
  stockDiv.classList.add("form-group", "stock-entry");

  stockDiv.innerHTML = `
    <input type="number" placeholder="Size" value="${size}" style="width: 80px" />
    <input type="number" placeholder="Quantity" value="${quantity}" style="width: 80px" />
    <div class="icon-btn remove-stock-btn"><i class="fa-solid fa-xmark"></i></div>
  `;
  stockSection.appendChild(stockDiv);
}

// Render Product form
function fillProductForm(product = null) {
  document.getElementById("formTitle").innerText = product
    ? "Edit Product"
    : "Add Product";
  document.getElementById("productBrand").value = product?.brand || "";
  document.getElementById("productCategory").value = product?.category || "";
  document.getElementById("productGender").value = product?.gender || "MALE";
  document.getElementById("productSKU").value = product?.sku || "";
  document.getElementById("productColor").value = product?.color || "";
  document.getElementById("productWeight").value = product?.weight || "";
  document.getElementById("productDescription").value =
    product?.description || "";
  document.getElementById("productPrice").value = product?.price || "";
  document.getElementById("productDiscount").value = product?.discount || 0;
  document.getElementById("product-image-holder").src =
    product?.url || "../assets/pageImages/placeholder.jpg";

  const stockSection = document.getElementById("stockSection");
  stockSection.innerHTML = "";

  if (product) {
    product.stocks.forEach((stock) => addStockRow(stock.size, stock.quantity));
  } else {
    addStockRow();
  }
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
  let products = PDCTS;
  let selectedShoe = null;

  if (!products) return;

  populateTable(products);

  // DELETE + EDIT EVENT LISTENER
  const tbody = document.getElementById("productList");
  tbody.addEventListener("click", async (e) => {
    const btn = e.target.closest("button");
    if (!btn) return;

    const action = btn.dataset.action;
    const shoeId = parseInt(btn.dataset.id);

    selectedShoe = products.find((shoe) => shoe.shoeId === shoeId);

    console.log({ action, shoeId, selectedShoe });

    if (action === "delete") {
      document.getElementById("productFormContainer").style.display = "none";
      document.getElementById("confirmDialog").style.display = "flex";
    }

    if (action === "edit") {
      fillProductForm(selectedShoe);
      document.getElementById("productFormContainer").style.display = "flex";
      document.getElementById("confirmDialog").style.display = "none";
    }
  });

  // Handle Add New Button
  document.getElementById("add-new-product").onclick = () => {
    fillProductForm();
    document.getElementById("productFormContainer").style.display = "flex";
  };

  // Handle Confirmation Dialog Buttons
  document.getElementById("confirmCancelBtn").onclick = () => {
    document.getElementById("confirmDialog").style.display = "none";
  };

  document.getElementById("confirmYesBtn").onclick = async () => {
    document.getElementById("confirmDialog").style.display = "none";
    const updatedInfo = await deleteStore(user.userId, selectedShoe.shoeId);

    if (updatedInfo) {
      products = updatedInfo;
      populateTable(products);
    } else {
      notifyMe("Failed to delete product. Please try again.", "error");
    }
  };

  // Handle Form Buttons
  document.getElementById("form-cancel-btn").onclick = () => {
    document.getElementById("productFormContainer").style.display = "none";
  };

  document.getElementById("add-stock-btn").onclick = () => {
    addStockRow();
  };

  document.getElementById("stockSection").addEventListener("click", (e) => {
    if (e.target.closest(".remove-stock-btn")) {
      const stockSection = document.getElementById("stockSection");
      const stockEntries = stockSection.querySelectorAll(".stock-entry");

      // Only remove if more than one entry remains
      if (stockEntries.length > 1) {
        const stockDiv = e.target.closest(".stock-entry");
        if (stockDiv) stockDiv.remove();
      } else {
        notifyMe("At least one stock entry is required.", "info");
      }
    }
  });

  document
    .getElementById("product-image-holder")
    .addEventListener("click", () => {
      document.getElementById("productImage").click();
    });

  document.getElementById("productImage").addEventListener("change", (e) => {
    const file = e.target.files[0];
    if (file) {
      const imageUrl = URL.createObjectURL(file);
      document.getElementById("product-image-holder").src = imageUrl;
    }
  });
});
