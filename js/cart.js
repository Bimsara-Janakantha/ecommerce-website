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
    const totalPrice = (
      item.unitPrice *
      (100 - item.discount) *
      0.01 *
      item.quantity
    ).toFixed(2);

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
			
				<td class="total-price">LKR ${totalPrice}</td>
			</tr>
    `;
  }

  document.querySelector("#cart-table tbody").innerHTML = cartList
    .map((item) => generateCartHTML(item))
    .join("");

  /* Rendering - Purchase Body */
});
