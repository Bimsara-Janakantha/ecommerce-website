// Numbering format
const formatCurrency = (value) =>
  new Intl.NumberFormat("en-LK", {
    style: "currency",
    currency: "LKR",
  }).format(value);

document.addEventListener("DOMContentLoaded", async function () {
  const checkoutItem = JSON.parse(localStorage.getItem("checkout")) || [];
  const user = JSON.parse(localStorage.getItem("user")) || null;

  /* User validation */
  if (!user || isNaN(user.userId)) {
    // alert("Please login.");
    // location.href = "login.html";
    // return;
  }

  /* Checkout List Validation */
  if (!checkoutItem || checkoutItem.length === 0) {
    alert("Nothing to checkout.");
    location.href = "shop.html";
    return;
  }

  console.log("Checkout Items: ", checkoutItem);

  let billingInfo = {
    fName: "",
    lName: "",
    email: "",
    mobile: "",
    street: "",
    apt: "",
    city: "",
    province: "",
    postal: "",
    notes: "",
  };

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
    const finalPrice = subTotal + shipping - totalDiscount - coupon;
    return `
			<div><strong>Subtotal</strong><span>${formatCurrency(subTotal)}</span></div>
			<div><strong>Shipping</strong><span>${formatCurrency(shipping)}</span></div>
			<div><strong>Discount</strong><span>- ${formatCurrency(
        totalDiscount
      )}</span></div>
			<div><strong>Coupons</strong><span>- ${formatCurrency(coupon)}</span></div>
			<hr />
			<div class="total">
				<span>TOTAL</span><span>${formatCurrency(finalPrice)}</span>
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

  /* Event handlers - Billing info */
  function getBillingInfo() {
    const billingInfo = {
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

    return billingInfo;
  }

  function validateBillingInfo(info) {
    // Check required fields
    for (const [key, value] of Object.entries(info)) {
      if (["apt", "notes"].includes(key)) continue; // optional fields
      if (!value) {
        alert(`Please fill in the ${key} field.`);
        return false;
      }
    }

    // Email format
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(info.email)) {
      alert("Please enter a valid email address.");
      return false;
    }

    // Mobile number - digits only & length check (e.g., 10–12)
    const mobileRegex = /^(?:\+94|0)(7\d{8})$/;
    if (!mobileRegex.test(info.mobile)) {
      alert(
        "Please enter a valid mobile number. (e.g., 0712345678 or +94712345678)"
      );
      return false;
    }

    return true;
  }

  // Attach to form submit
  document.querySelector("form").addEventListener("submit", function (e) {
    e.preventDefault(); // prevent default form submission

    const billingInfo = getBillingInfo();

    if (validateBillingInfo(billingInfo)) {
      // All good — proceed
      console.log("Billing info is valid:", billingInfo);
      alert("Billing info submitted successfully.");
      // You can now send this data to a backend or continue
    }
  });
});
