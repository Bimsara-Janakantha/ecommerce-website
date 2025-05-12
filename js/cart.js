const dummyPurchases = [
  {
    shoeId: "SH001",
    brand: "Nike",
    gender: "Men",
    description: "Nike Air Zoom Pegasus 39",
    url: "../assets/men_shoes/shoe_13.jpeg",
    unitPrice: 17999,
    discount: 10,
    availableQty: 15,
    quantity: 2,
    size: 42,
  },
  {
    shoeId: "SH002",
    brand: "Adidas",
    gender: "Women",
    description: "Adidas Ultraboost Light Running Shoes",
    url: "../assets/women_shoes/shoe_11.jpeg",
    unitPrice: 20999,
    discount: 15,
    availableQty: 10,
    quantity: 1,
    size: 38,
  },
  {
    shoeId: "SH003",
    brand: "Puma",
    gender: "Unisex",
    description: "Puma Smash V2 Sneakers",
    url: "../assets/men_shoes/shoe_1.jpg",
    unitPrice: 12999,
    discount: 5,
    availableQty: 20,
    quantity: 3,
    size: 40,
  },
  {
    shoeId: "SH004",
    brand: "Reebok",
    gender: "Men",
    description: "Reebok Flexagon Energy TR 3.0",
    url: "../assets/boys_shoes/shoe_1.jpg",
    unitPrice: 14999,
    discount: 20,
    availableQty: 12,
    quantity: 1,
    size: 43,
  },
  {
    shoeId: "SH005",
    brand: "Fila",
    gender: "Women",
    description: "Fila Disruptor II Premium",
    url: "../assets/girls_shoes/shoe_4.jpg",
    unitPrice: 18999,
    discount: 25,
    availableQty: 8,
    quantity: 2,
    size: 39,
  },
];

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
    alert("Please login.");
    //location.href = "login.html";
    //return;
  }

  /* Make cart */
  //const cartList = purchaseItem === null ? cartItems : purchaseItem;
  const cartList = dummyPurchases;

  /* Rendering - Cart Table Body */
  function generateCartHTML(item) {
    const itemTotal = item.unitPrice * item.quantity;
    const itemDiscount = item.unitPrice * item.discount * 0.01 * item.quantity;
    const totalPrice = itemTotal - itemDiscount;

    subTotal += itemTotal;
    totalDiscount += itemDiscount;

    console.log("Total Price: ", totalPrice);

    return `
			<tr>
				<td class="product-desciption">
					<button class="remove" aria-label="Remove item">
						<i class="fas fa-times"></i>
					</button>
			
					<img
						class="product-image"
						src="${item.url}"
						alt="${item.shoeId}"
					/>

					${item.brand} ${item.gender} ${item.description} - Size ${item.size}
				</td>
			
				<td class="unit-price">LKR ${item.unitPrice.toFixed(2)}</td>
			
				<td class="quantity">
					<div
					class="quantity-control"
					role="group"
					aria-label="Quantity selector"
					>
						<button class="inc" aria-label="Decrease quantity">-</button>
						<input type="text" aria-label="Quantity" value="${item.quantity}" readonly />
						<button class="dec" aria-label="Increase quantity">+</button>
					</div>
				</td>
			
				<td class="total-price">LKR ${totalPrice.toFixed(2)}</td>
			</tr>
    `;
  }

  function renderCartTable() {
    let innerHTML = cartList.map((item) => generateCartHTML(item)).join("");
    innerHTML += `
			<tr>
				<td colspan="4" class="coupon-row">
					<div class="coupon-container">
						<div class="coupon-element">
							<input type="text" placeholder="Coupon code" />
							<button class="primary" type="button" disabled>
								Apply coupon
							</button>
						</div>
					
						<button
							type="button"
							class="update"
							onclick="location.href='shop.html'"
							>
							Update cart
						</button>
					</div>
				</td>
			</tr>
		`;

    document.querySelector("#cart-table tbody").innerHTML = innerHTML;
  }

  /* Rendering - Purchase Body */
  function generateCheckoutHTML() {
    const shippingString = shipping === 0 ? `( FREE )` : shipping.toFixed(2);

    const totalPrice = (subTotal + shipping - totalDiscount - coupon).toFixed(
      2
    );

    return `
			<tbody>
        <tr>
          <th>Subtotal</th>
          <td>LKR ${subTotal.toFixed(2)}</td>
        </tr>
        <tr>
          <th>Shipping </i></th>
          <td>${shippingString}</td>
        </tr>
        <tr>
          <th>Discount</th>
          <td>- LKR ${totalDiscount.toFixed(2)}</td>
        </tr>
				<tr>
          <th>Coupon </th>
          <td>- LKR ${coupon.toFixed(2)}</td>
        </tr>
        <tr>
          <th>Total</th>
          <td>LKR ${totalPrice}</td>
        </tr>
      </tbody>
		`;
  }

  function renderCheckoutSummary() {
    const checkoutHTML = generateCheckoutHTML();
    document.querySelector(".cart-totals table").innerHTML = checkoutHTML;
  }

  /* Initial Rendering */
  renderCartTable();
  renderCheckoutSummary();
});
