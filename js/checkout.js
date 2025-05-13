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

  document.getElementById("google-pay").appendChild(button);
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
      alert(`Please fill in the ${key} field.`);
      return true;
    }
  }

  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(info.email)) {
    alert("Please enter a valid email address.");
    return true;
  }

  const mobileRegex = /^(?:\+94|0)(7\d{8})$/;
  if (!mobileRegex.test(info.mobile)) {
    alert(
      "Please enter a valid mobile number. (e.g., 0712345678 or +94712345678)"
    );
    return true;
  }

  return false;
}

// Handle payment success
function handleSuccess(paymentData) {
  console.log("Payment successful:", paymentData);
}

// On Google Pay button click
function onGooglePaymentButtonClicked() {
  const shippingInfo = getShippingInfo();

  if (validateShippingInfo(shippingInfo)) {
    console.log("Invalid Billing Data");
    return;
  }

  console.log("Billing info is valid:", shippingInfo);
  console.log("Amount to pay: ", amountToPay);

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
  paymentsClient
    .loadPaymentData(paymentDataRequest)
    .then(handleSuccess)
    .catch((err) => {
      console.error("Payment failed:", err);
    });
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

/* ------------------------------------------------------------------------------------ */

/* ------------------------------------ Page DOM -------------------------------------- */
document.addEventListener("DOMContentLoaded", function () {
  const checkoutItem = JSON.parse(localStorage.getItem("checkout")) || null;
  const user = JSON.parse(localStorage.getItem("user")) || null;

  /* User validation */
  if (!user || isNaN(user.userId)) {
    // alert("Please login.");
    // location.href = "login.html";
    // return;
  }

  /* Checkout List Validation */
  if (!checkoutItem || checkoutItem.cart.length === 0) {
    alert("Nothing to checkout.");
    location.href = "shop.html";
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
});

/* ------------------------------------------------------------------------------------ */
