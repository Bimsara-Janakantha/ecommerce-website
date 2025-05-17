/* --------------------------- Google Pay Implementation ----------------------------- */
let paymentsClient;
let amountToPay = 0;

// Tokenization configuration
const tokenizationSpecification = {
  type: "PAYMENT_GATEWAY",
  parameters: {
    gateway: "example",
    gatewayMerchantId: "exampleMerchantId",
  },
};

// Card payment method configuration
const cardPaymentMethod = {
  type: "CARD",
  tokenizationSpecification,
  parameters: {
    allowedAuthMethods: ["PAN_ONLY", "CRYPTOGRAM_3DS"],
    allowedCardNetworks: ["VISA", "MASTERCARD"],
  },
};

// Base request configuration
const baseRequest = {
  apiVersion: 2,
  apiVersionMinor: 0,
};

// Full Google Pay configuration
const googlePayConfiguration = {
  ...baseRequest,
  allowedPaymentMethods: [cardPaymentMethod],
};

// Merchant information
const merchantInfo = {
  merchantId: "01234567890123456789",
  merchantName: "Example Merchant",
};

// Function to create Google Pay button
function createGooglePayButton() {
  const button = paymentsClient.createButton({
    onClick: onGooglePaymentButtonClicked,
    buttonColor: "default",
    buttonType: "checkout",
    buttonRadius: 5,
    buttonSizeMode: "fill",
  });

  const container = document.getElementById("google-pay");
  if (container) {
    container.appendChild(button);
    container.style.display = "block";
  }

  // Hide the loading spinner if it exists
  const spinner = document.querySelector(".fa-spinner");
  if (spinner) spinner.style.display = "none";
}

// Collect shipping info from form
function getShippingInfo() {
  return {
    fName: document.getElementById("fName").value.trim(),
    lName: document.getElementById("lName").value.trim(),
    email: document.getElementById("email").value.trim(),
    mobile: document.getElementById("mobile").value.trim(),
    street: document.getElementById("street").value.trim(),
    apt: document.getElementById("apt").value.trim(),
    city: document.getElementById("city").value.trim(),
    province: document.getElementById("province").value,
    postal: document.getElementById("postal").value.trim(),
    notes: document.getElementById("notes").value.trim(),
  };
}

// Validate shipping info
function validateShippingInfo(info) {
  for (const [key, value] of Object.entries(info)) {
    if (["apt", "notes"].includes(key)) continue;
    if (!value) {
      notifyMe(`Please fill in the ${key} field.`, "error");
      return true;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(info.email)) {
    notifyMe("Please enter a valid email address.", "error");
    return true;
  }

  const mobileRegex = /^(?:\+94|0)(7\d{8})$/;
  if (!mobileRegex.test(info.mobile)) {
    notifyMe(
      "Please enter a valid mobile number. (e.g., 0712345678 or +94712345678)",
      "error"
    );
    return true;
  }

  return false;
}

// On Google Pay button click
async function onGooglePaymentButtonClicked() {
  const gpay = document.getElementById("google-pay");
  const spinner = document.querySelector(".fa-spinner");

  gpay.style.display = "none";
  spinner.style.display = "block";

  try {
    // Get shipping info
    const shippingInfo = getShippingInfo();

    if (validateShippingInfo(shippingInfo)) {
      console.log("Invalid Billing Data");
      throw new Error("Invalid Billing Data");
    }

    console.log("Billing info is valid:", shippingInfo);

    // Get checkout info
    const checkoutData = await (JSON.parse(localStorage.getItem("checkout")) ||
      null);

    if (checkoutData === null) {
      console.log("No checkout data");
      throw new Error("No checkout data");
    }

    console.log("Amount to pay: ", amountToPay);

    // Make the order
    const orderId = await sendOrder(shippingInfo, checkoutData);

    if (orderId === null) {
      console.log("Order failed");
      throw new Error("Order failed");
    }

    // Create payment request object
    const paymentDataRequest = {
      ...baseRequest,
      allowedPaymentMethods: [cardPaymentMethod],
      transactionInfo: {
        totalPriceStatus: "FINAL",
        totalPrice: `${amountToPay}`,
        currencyCode: "LKR",
        countryCode: "LK",
      },
      merchantInfo,
    };

    // Load Google Pay dialog
    const paymentData = await paymentsClient.loadPaymentData(
      paymentDataRequest
    );

    const paymentInfo = {
      userId: checkoutData.user,
      orderId,
      amount: amountToPay,
      referenceId:
        paymentData.paymentMethodData?.tokenizationData?.token || "testpayment",
    };

    await sendPayment(paymentInfo);
  } catch (error) {
    console.error("Payment Process Error:", error.message || error);
    notifyMe(error.message || "Payment Failed", "error");
  } finally {
    gpay.style.display = "block";
    spinner.style.display = "none";
  }
}

// Initialize Google Pay

function onGooglePayLoaded() {
  paymentsClient = new google.payments.api.PaymentsClient({
    environment: "TEST",
  });

  paymentsClient
    .isReadyToPay(googlePayConfiguration)
    .then((response) => {
      if (response.result) {
        createGooglePayButton();
      }
    })
    .catch((err) => {
      console.error("Google Pay failed to load:", err);
      notifyMe("Google Pay failed to load", "error");
    });
}
/* ------------------------------------------------------------------------------------ */

/* -------------------------------- General Functions --------------------------------- */
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

// Function to update the cart
function updateCartBadge() {
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = cart.length;
  const cartButtonContainer = document.getElementById("cartButtonContainer");

  if (cartButtonContainer) {
    const badgeHTML =
      cartItems > 0 ? `<div class="badge">${cartItems}</div>` : "";

    cartButtonContainer.innerHTML = `
      <button class="icon-container" onclick="location.href='cart.html'">
        <i class="fa fa-shopping-cart" aria-hidden="true"></i>
        ${badgeHTML}
      </button>
    `;
  }
}

// Function to send order data
async function sendOrder(shippingInfo, checkoutData) {
  const orderInfo = {
    ...shippingInfo,
    userId: checkoutData.user,
    totalAmount: checkoutData.subTotal,
    couponCode: checkoutData.couponCode,
    coupon: checkoutData.coupon,
    discount: checkoutData.totalDiscount,
  };

  //console.log("Order Info: ", orderInfo);

  try {
    const serverResponse = await postData("orders/new", orderInfo);
    const { message, orderId } = serverResponse.data;
    console.log({ message, orderId });
    notifyMe(message, "success");
    return orderId;
  } catch (error) {
    console.error("Order Error: ", error);
    const { status, message } = error;
    if (status === 400) {
      notifyMe(message, "error");
    } else {
      notifyMe("Something went wrong", "error");
    }
    return null;
  }
}

// Function to send payment data
async function sendPayment(paymentData) {
  console.log("Payment successful:", paymentData);

  try {
    const serverResponse = await postData("order/pay", paymentData);
    notifyMe(serverResponse.data.message, "success", "shop.html");
  } catch (error) {
    console.error("Payment Error: ", error);
    const { status, message } = error;
    const knownErrors = [400, 403, 404, 410];
    if (knownErrors.includes(status)) {
      notifyMe(message, "error");
    } else {
      notifyMe("Something went wrong", "error");
    }
  } finally {
    localStorage.removeItem("checkout");

    const purchaseData = localStorage.getItem("purchase") || null;
    if (purchaseData === null) {
      localStorage.removeItem("cart");
      updateCartBadge();
    } else {
      localStorage.removeItem("purchase");
    }
  }
}

// Function to build backend connection
const postData = async (path, data) => {
  const BASE_URL = "http://ecommerce.local/api/app.php";
  const url = `${BASE_URL}/${path}`;

  try {
    const response = await fetch(url, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(data),
    });

    const resBody = await response.json();

    if (!response.ok) {
      // Throw a custom error object
      throw {
        status: response.status,
        message: resBody.error || "Unknown error",
      };
    }

    return {
      status: response.status,
      data: resBody,
    };
  } catch (error) {
    console.error("POST Error:", error);
    throw error; // let caller handle it
  }
};
/* ------------------------------------------------------------------------------------ */

/* ------------------------------------ Page DOM -------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const checkoutItem = JSON.parse(localStorage.getItem("checkout")) || null;
  const user = JSON.parse(localStorage.getItem("user")) || null;

  /* User validation */
  if (!user || isNaN(user.userId)) {
    notifyMe("Please Login First", "info", "login.html");
    return;
  }

  /* Checkout List Validation */
  if (!checkoutItem || checkoutItem.cart.length === 0) {
    notifyMe("Nothing to checkout.", "error", "shop.html");
    return;
  }

  console.log("Checkout Items: ", checkoutItem);

  /* Rendering - Order Summary */
  function generateBagHTML(item) {
    const oldPriceString =
      item.discount > 0
        ? `<span class="price-old">${formatCurrency(item.unitPrice)}</span>`
        : "";
    const newPrice =
      item.discount > 0
        ? item.unitPrice * 0.01 * (100 - item.discount)
        : item.unitPrice;

    return `
      <div class="bag-item">
        <img src="${item.url}" alt="${item.shoeId}" />

        <div class="bag-item-details">
          <p><strong>${item.brand} ${item.description}</strong></p>
          <p>${item.gender} | ${item.catagory}</p>
          <p>Size ${item.size}</p>
          <p>
						${oldPriceString}
            <span class="price">${formatCurrency(
              newPrice
            )}</span> x ${item.quantity}
          </p>
        </div>
      </div>
    `;
  }

  function renderBag() {
    const bagHTML = checkoutItem.cart.map((shoe) => generateBagHTML(shoe));
    document.querySelector(".bag-summary").innerHTML = bagHTML;
  }

  /* Rendering - Cart Total Table Body */
  function generateOrderHTML() {
    const { subTotal, shipping, totalDiscount, coupon } = checkoutItem;
    amountToPay = subTotal + shipping - totalDiscount - coupon;

    return `
			<div><strong>Subtotal</strong><span>${formatCurrency(subTotal)}</span></div>
			<div><strong>Shipping</strong><span>${formatCurrency(shipping)}</span></div>
			<div><strong>Discount</strong><span>- ${formatCurrency(
        totalDiscount
      )}</span></div>
			<div><strong>Coupons</strong><span>- ${formatCurrency(coupon)}</span></div>
			<hr />
			<div class="total">
				<span>TOTAL</span><span>${formatCurrency(amountToPay)}</span>
			</div>
		`;
  }

  function renderOrderSummary() {
    const orderHTML = generateOrderHTML();
    document.querySelector(".order-summary").innerHTML = orderHTML;
  }

  /* Initial Rendering */
  renderOrderSummary();
  renderBag();

  /* Event handlers - Back to cart */
  document.querySelector("#back-to-cart").addEventListener("click", () => {
    console.log("Back to cart");
    localStorage.removeItem("checkout");
    this.location.href = "cart.html";
  });

  /* Event Handler - update word count */
  const textarea = document.getElementById("notes");
  const hint = document.getElementById("noteHint");
  const maxLength = textarea.maxLength;

  textarea.addEventListener("input", function () {
    const currentLength = textarea.value.length;
    hint.textContent = `${currentLength}/${maxLength}`;
  });
});

/* ------------------------------------------------------------------------------------ */
