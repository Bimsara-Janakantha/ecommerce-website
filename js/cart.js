import { postData } from "../utils/connection.js";

// Numbering format
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(value);

/* Function to display message */
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

document.addEventListener("DOMContentLoaded", async function () {
  const purchaseItem = JSON.parse(localStorage.getItem("purchase")) || null;
  const cartItems = JSON.parse(localStorage.getItem("cart")) || [];
  const user = JSON.parse(localStorage.getItem("user")) || null;

  /* Global Variables */
  let subTotal = 0;
  let shipping = 0;
  let totalDiscount = 0;
  let coupon = 0;

  /* Validate Page */
  if (!user || isNaN(user.userId)) {
    notifyMe("Please Login", "info", "login.html");
    return;
  }

  /* Cart Data (modifiable) */
  let cartList = purchaseItem === null ? cartItems : [purchaseItem];
  console.log("Cart List: ", cartList);

  /* Rendering - Cart Table Body */
  function generateCartHTML(item) {
    const itemTotal = item.unitPrice * item.quantity;
    const itemDiscount = item.unitPrice * item.discount * 0.01 * item.quantity;
    const totalPrice = itemTotal - itemDiscount;

    subTotal += itemTotal;
    totalDiscount += itemDiscount;

    return `
      <tr>
        <td class="product-desciption">
          <button class="remove" aria-label="Remove item" name="${item.shoeId}">
            <i class="fas fa-times"></i>
          </button>

          <img class="product-image" src="${item.url}" alt="${item.shoeId}" />
          ${item.brand} ${item.gender} ${item.description} - Size ${item.size}
        </td>

        <td class="unit-price">${formatCurrency(item.unitPrice)}</td>

        <td class="quantity">
          <div class="quantity-control" role="group" aria-label="Quantity selector">
            <button class="dec" aria-label="Decrease quantity" name="${
              item.shoeId
            }">-</button>
            <input type="text" aria-label="Quantity" value="${
              item.quantity
            }" readonly />
            <button class="inc" aria-label="Increase quantity" name="${
              item.shoeId
            }">+</button>
          </div>
        </td>

        <td class="total-price">${formatCurrency(totalPrice)}</td>
      </tr>
    `;
  }

  function renderCartTable() {
    subTotal = 0;
    totalDiscount = 0;

    let innerHTML = cartList.map((item) => generateCartHTML(item)).join("");
    innerHTML += `
      <tr>
        <td colspan="4" class="coupon-row">
          <div class="coupon-container">
            <div class="coupon-element">
              <input type="text" placeholder="Coupon code" maxlength="12" />
              <button id="coupon_btn" class="primary" type="button" disabled>
                <span class="btn-text">Apply coupon</span>
                <i class="fa fa-spinner fa-spin fa-fw" style="display: none;"></i>
              </button>
            </div>

            <button id="shop_more" type="button" class="update">
              shop more
            </button>
          </div>
        </td>
      </tr>
    `;

    document.querySelector("#cart-table tbody").innerHTML = innerHTML;

    // Re-bind event listeners
    attachRemoveListeners();
    attachQuantityListeners();
    attachCouponInputListener();
    attachUpdateCartListener();
    attachCheckoutListener();
  }

  /* Rendering - Cart Total Table Body */
  function generateCheckoutHTML() {
    const shippingString =
      shipping === 0 ? `( FREE )` : formatCurrency(shipping);
    const totalPrice = subTotal + shipping - totalDiscount - coupon;

    return `
      <tbody>
        <tr>
          <th>Subtotal</th>
          <td>${formatCurrency(subTotal)}</td>
        </tr>
        <tr>
          <th>Shipping</th>
          <td>${shippingString}</td>
        </tr>
        <tr>
          <th>Discount</th>
          <td>- ${formatCurrency(totalDiscount)}</td>
        </tr>
        <tr>
          <th>Coupon</th>
          <td>- ${formatCurrency(coupon)}</td>
        </tr>
        <tr>
          <th>Total</th>
          <td>${formatCurrency(totalPrice)}</td>
        </tr>
      </tbody>
    `;
  }

  function renderCheckoutSummary() {
    const checkoutHTML = generateCheckoutHTML();
    document.querySelector(".cart-totals table").innerHTML = checkoutHTML;
  }

  /* Utility Function to update local storage */
  function updateLocalStorage() {
    if (purchaseItem !== null) {
      localStorage.setItem("purchase", JSON.stringify(cartList[0]));
    } else {
      localStorage.setItem("cart", JSON.stringify(cartList));
    }
  }

  /* Initial Rendering */
  renderCartTable();
  renderCheckoutSummary();

  /* Attach Remove Event Listeners */
  function attachRemoveListeners() {
    document.querySelectorAll(".remove").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const shoeId = parseInt(e.currentTarget.getAttribute("name"));
        console.log(
          "Request remove:" + shoeId + " type(shoeId): " + typeof shoeId
        );

        cartList = cartList.filter((shoe) => shoe.shoeId !== shoeId);

        // Update Stored Cart
        if (purchaseItem !== null) {
          localStorage.removeItem("purchase");
        } else {
          localStorage.setItem("cart", JSON.stringify(cartList));
        }

        notifyMe("Item removed successfully.", "success");
        renderCartTable();
        renderCheckoutSummary();
      });
    });
  }

  /* Attach Quantity Event Listners */
  function attachQuantityListeners() {
    document.querySelectorAll(".dec").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const shoeId = parseInt(e.currentTarget.getAttribute("name"));
        const item = cartList.find((shoe) => shoe.shoeId === shoeId);
        if (item && item.quantity > 1) {
          item.quantity -= 1;
          updateLocalStorage();
          renderCartTable();
          renderCheckoutSummary();
          notifyMe("Cart updated successfully.", "success");
        }
      });
    });

    document.querySelectorAll(".inc").forEach((btn) => {
      btn.addEventListener("click", (e) => {
        const shoeId = parseInt(e.currentTarget.getAttribute("name"));
        const item = cartList.find((shoe) => shoe.shoeId === shoeId);
        if (item && item.quantity < item.availableQty && item.quantity < 11) {
          item.quantity += 1;
          updateLocalStorage();
          renderCartTable();
          renderCheckoutSummary();
          notifyMe("Cart updated successfully.", "success");
        }
      });
    });
  }

  /* Attach Coupon Event Listners */
  function attachCouponInputListener() {
    const couponInput = document.querySelector(".coupon-element input");
    const couponBtn = document.querySelector("#coupon_btn");

    if (!couponInput || !couponBtn) return;

    const spinnerIcon = couponBtn.querySelector("i");
    const btnText = couponBtn.querySelector("span");

    couponInput.addEventListener("input", () => {
      const trimmed = couponInput.value.trim();
      couponBtn.disabled = trimmed.length <= 8;
    });

    couponBtn.addEventListener("click", async () => {
      const code = couponInput.value.trim();
      console.log("Applying coupon:", code);
      if (code.length <= 8) return;

      // Show spinner, hide text, disable button
      spinnerIcon.style.display = "inline-block";
      btnText.style.display = "none";
      couponBtn.disabled = true;

      const cpnData = { code, subTotal };

      try {
        const serverResponse = await postData("coupons/verify", cpnData);
        const { message, couponDiscount } = serverResponse.data;
        notifyMe(message, "success");
        coupon = couponDiscount ?? 0;
      } catch (error) {
        console.error("Coupon Error: ", error);
        if (error.status === 404 || error.status === 401) {
          notifyMe(error.message, "error");
        } else {
          notifyMe("Something went wrong", "error");
        }
      } finally {
        // Reset button state
        spinnerIcon.style.display = "none";
        btnText.style.display = "inline";
        couponInput.value = "";
      }
    });
  }

  /* Attach Shop More Event Listners */
  function attachUpdateCartListener() {
    document.querySelector("#shop_more").addEventListener("click", () => {
      console.log("shop more");

      // Case 1: No purchase, just go to shop
      if (purchaseItem === null) {
        window.location.href = "shop.html";
        return;
      }

      // Case 2: Cart is empty, move purchase to cart
      if (cartItems.length === 0) {
        localStorage.setItem("cart", JSON.stringify(cartList));
        localStorage.removeItem("purchase");
        window.location.href = "shop.html";
        return;
      }

      // Case 3: Merge purchase with existing cart
      let updated = false;
      const updatedCart = cartItems.map((item) => {
        if (
          item.shoeId === purchaseItem.shoeId &&
          item.size === purchaseItem.size
        ) {
          const combinedQty = item.quantity + cartList[0].quantity;
          const newQty = Math.min(combinedQty, 10, item.availableQty);
          updated = true;
          return { ...item, quantity: newQty };
        }
        return item;
      });

      // Case 4: If no match was found, append the purchase
      if (!updated) {
        updatedCart.push(purchaseItem);
      }

      localStorage.setItem("cart", JSON.stringify(updatedCart));
      localStorage.removeItem("purchase");
      window.location.href = "shop.html";
    });
  }

  /* Attach Checkout Event Listners */
  function attachCheckoutListener() {
    document.querySelector(".checkout-button").addEventListener("click", () => {
      const cartData = cartList || [];

      if (cartData.length === 0) {
        notifyMe(
          "Your cart is empty. Add items before proceeding.",
          "error",
          "shop.html"
        );
        return;
      }

      const checkoutData = {
        user: user?.userId,
        subTotal,
        shipping,
        totalDiscount,
        coupon,
        cart: cartData,
      };

      // Store cart as 'checkout'
      localStorage.setItem("checkout", JSON.stringify(checkoutData));

      // Redirect to checkout page
      window.location.href = "checkout.html";
    });
  }
});
