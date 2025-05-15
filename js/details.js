import { getData } from "../utils/connection.js";

const getProductInfo = async (productId) => {
  const url = `products/item/${productId}`;

  //console.log("requesting: ", url);

  try {
    const serverResponse = await getData(url);

    if (serverResponse.status === 200) {
      const { message, product } = serverResponse.data;
      console.log(message);
      return product;
    }
    return null;
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
    return [];
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  /* Get current product */
  const urlParams = new URLSearchParams(window.location.search);
  const productId = urlParams.get("id");
  console.log("Product Id:", productId);

  const product = await getProductInfo(productId);

  let selectedSize = 0;
  let selectedShoes = 1;

  const bodySection = document.querySelector(".detail-page-body");

  function generateDetailHTML() {
    if (product === null) {
      return `<h5 style="margin-top: 50px">No information!</h5>`;
    }

    const maxStars = 5;
    const roundRating = Math.round(product.rating);
    let starsHTML = "";

    for (let i = 1; i <= maxStars; i++) {
      if (i <= roundRating) {
        starsHTML += `<i class="fas fa-star" style="color: rgb(243, 181, 25)"></i>`;
      } else {
        starsHTML += `<i class="fas fa-star" style="color: lightgray"></i>`;
      }
    }

    const oldPrice = product.discount
      ? `<h5 class="price-old">LKR ${product.price.toFixed(2)}</h5>`
      : "";
    const newPrice = product.discount
      ? (product.price * (100 - product.discount) * 0.01).toFixed(2)
      : product.price.toFixed(2);

    const saleMark = product.discount
      ? `
			<h5 class="price-sale">
        SALE
        <i class="fa fa-bookmark" aria-hidden="true" style="font-size: 16px"></i>
      </h5>
		`
      : "";

    const sizes = product.sizes
      .map((size) => {
        return size.quantity > 0
          ? `<button class="size-button instock ${
              selectedSize === size.size ? "active" : ""
            }" type="button" value="${size.size}">${size.size}</button>`
          : `<button class="size-button" type="button" value="${size.size}" disabled>${size.size}</button>`;
      })
      .join("");

    const allSizes = product.sizes.map((size) => size.size).join(", ");

    return `
			<section class="main-detail-section">
        <div class="detail-imager">
          <img src="${product.url}" alt="shoe_${product.shoeId}" />
        </div>

        <div class="product-details">
          <h2>${product.brand} ${product.gender} ${product.description}</h2>

          <div class="price-row">
            ${oldPrice}
						${saleMark}
          </div>
          <h3>LKR ${newPrice}</h3>
					<div class="stars"> ${starsHTML} </div>

          <p class="size-chart-link">Select Size</p>

          <div class="size-buttons" role="group" aria-label="Select size">
            ${sizes}
          </div>

          <div class="add-to-cart-form" aria-label="Add to cart form">
            <input
              type="number"
              min="1"
              max="10"
              value="${selectedShoes}"
              aria-label="Quantity"
              class="quantity-input"
            />
            <button class="add-to-cart-button" ${
              selectedSize === 0 ? "disabled" : ""
            }>
              Add to Cart
            </button>

            <button class="buy-now-button" ${
              selectedSize === 0 ? "disabled" : ""
            }>
              Buy Now
            </button>
          </div>

          <div class="product-meta">
            <p><strong>SKU:</strong> ${product.sku}</p>
            <p>
              <strong>Tags:</strong> ${product.brand.toLowerCase()}, ${product.gender.toLowerCase()}, footwear, ${product.category.toLowerCase()}
            </p>				
            <a href="#">Share Reviews</a>
          </div>
        </div>
      </section>

      <section class="additional-info-section">
        <h6 style="font-weight: 600">Additional Information</h6>

        <div
          id="additional-info"
          class="additional-info-content"
          role="region"
          aria-labelledby="tab-additional-info"
        >
          <table class="additional-info-table">
            <tbody>
              <tr>
                <th>Weight</th>
                <td>${product.weight}</td>
              </tr>
              <tr>
                <th>Digi</th>
                <td style="text-transform: uppercase">${product.category.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Color</th>
                <td>${product.color.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Size</th>
                <td>${allSizes}</td>
              </tr>
              <tr>
                <th>Brand</th>
                <td>${product.brand}</td>
              </tr>
              <tr>
                <th>Gender</th>
                <td>${product.gender}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  /* Initial page render */
  bodySection.innerHTML = generateDetailHTML();

  /* Event handlers - select size */
  document.querySelector(".size-buttons").addEventListener("click", (e) => {
    const button = e.target.closest(".size-button.instock");
    if (!button) return;

    selectedSize = parseInt(button.value); // Update selected size
    console.log("Selected size:", selectedSize);

    // Remove 'active' from all buttons
    document
      .querySelectorAll(".size-button.instock")
      .forEach((btn) => btn.classList.remove("active"));

    // Add 'active' to the clicked button
    button.classList.add("active");

    // Enable "Add to Cart" and "Buy Now" buttons
    const addToCartBtn = document.querySelector(".add-to-cart-button");
    const buyNowBtn = document.querySelector(".buy-now-button");

    if (addToCartBtn) addToCartBtn.disabled = false;
    if (buyNowBtn) buyNowBtn.disabled = false;
  });

  /* Event handler - select shoes */
  document.querySelector(".quantity-input").addEventListener("input", (e) => {
    selectedShoes = parseInt(e.target.value, 10);
    console.log("Selected quantity:", selectedShoes);
  });

  function checkAvailability(action) {
    const user = JSON.parse(localStorage.getItem("user")) || null;

    if (!user || isNaN(user.userId)) {
      alert("Please login.");
      location.href = "login.html";
      return;
    }

    // Get the quantity for the selected size
    const sizeObj = product.sizes.find((s) => s.size === selectedSize);
    const availableQty = sizeObj ? sizeObj.quantity : 0;

    const newPurchase = {
      shoeId: product.shoeId,
      brand: product.brand,
      gender: product.gender,
      description: product.description,
      url: product.url,
      unitPrice: product.price,
      discount: product.discount,
      availableQty,
      quantity: selectedShoes,
      size: selectedSize,
    };

    // Get existing cart object or default
    const curCart = JSON.parse(localStorage.getItem("cart")) || [];

    // --- BUY NOW ---
    if (action === "buy") {
      if (newPurchase.quantity <= availableQty) {
        console.log("Preparing for purchase:", newPurchase);
        localStorage.setItem("purchase", JSON.stringify(newPurchase));
        location.href = "cart.html";
      } else {
        console.log("Too much quantity requested");
        alert("Cannot buy more than available stock.");
      }
    }

    // --- ADD TO CART ---
    else {
      const existingItem = curCart.find(
        (item) =>
          item.shoeId === newPurchase.shoeId && item.size === newPurchase.size
      );

      if (existingItem) {
        const newQuantity = existingItem.quantity + newPurchase.quantity;

        if (newQuantity <= availableQty && newQuantity < 11) {
          existingItem.quantity = newQuantity;
          console.log("Updated quantity for existing item:", existingItem);
        } else {
          console.log("Too much quantity requested");
          alert(
            "Cannot add more than 10 pairs or available stock. If you need more pairs please contact us"
          );
        }
      } else {
        if (newPurchase.quantity <= availableQty) {
          curCart.push(newPurchase);
          console.log("Added new item to cart:", newPurchase);
        } else {
          console.log("Too much quantity requested");
          alert("Cannot add more than available stock.");
        }
      }

      localStorage.setItem("cart", JSON.stringify(curCart));
    }
  }

  /* Event handler - add to cart */
  document
    .querySelector(".add-to-cart-button")
    .addEventListener("click", () => {
      checkAvailability("add");
    });

  /* Event handler - buy now */
  document.querySelector(".buy-now-button").addEventListener("click", () => {
    checkAvailability("buy");
  });
});
