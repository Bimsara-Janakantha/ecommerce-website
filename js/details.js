import { getData } from "../utils/connection.js";

const getProductInfo = async (productId) => {
  const url = `products/item/${productId}`;

  console.log("requesting: ", url);

  return {
    shoeId: 1,
    brand: "NIKE",
    gender: "MEN",
    category: "Sneakers",
    description: "Lightweight breathable sneakers for daily wear",
    price: 1799.0,
    discount: 15,
    sizes: [4, 5, 6, 7, 8, 9, 10],
    instock: [4, 5, 8, 10],
    sku: "T00069",
    rating: 4.2,
    color: "Black",
    weight: "700 g",
    url: "../assets/men_shoes/shoe_6.jpeg",
  };

  /* try {
    const serverResponse = await getData(url);

    console.log("Server Reponse: ", serverResponse.json());

    if (serverResponse.status === 200) {
      return serverResponse.json();
    }
    return null;
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
    return [];
  } */
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

  function generateDetailHTML(item) {
    if (item === null) {
      return `<h5 style="margin-top: 50px">No information!</h5>`;
    }

    const maxStars = 5;
    const roundRating = Math.round(item.rating);
    let starsHTML = "";

    for (let i = 1; i <= maxStars; i++) {
      if (i <= roundRating) {
        starsHTML += `<i class="fas fa-star" style="color: rgb(243, 181, 25)"></i>`;
      } else {
        starsHTML += `<i class="fas fa-star" style="color: lightgray"></i>`;
      }
    }

    const oldPrice = item.discount
      ? `<h5 class="price-old">LKR ${item.price.toFixed(2)}</h5>`
      : "";
    const newPrice = item.discount
      ? (item.price * (100 - item.discount) * 0.01).toFixed(2)
      : item.price.toFixed(2);

    const saleMark = item.discount
      ? `
			<h5 class="price-sale">
        SALE
        <i class="fa fa-bookmark" aria-hidden="true" style="font-size: 16px"></i>
      </h5>
		`
      : "";

    const sizes = item.sizes
      .map((size) => {
        return item.instock.includes(size)
          ? `<button class="size-button instock ${
              selectedSize === size ? "active" : ""
            }" type="button" value="${size}">${size}</button>`
          : `<button class="size-button" type="button" value="${size}" disabled>${size}</button>`;
      })
      .join("");

    const allSizes = item.sizes.map((size) => size).join(", ");

    return `
			<section class="main-detail-section">
        <div class="detail-imager">
          <img src="${item.url}" alt="shoe_${item.shoeId}" />
        </div>

        <div class="product-details">
          <h2>${item.brand} ${item.gender} ${item.description}</h2>

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
            <button class="add-to-cart-button">Add to Cart</button>

            <button class="buy-now-button">Buy Now</button>
          </div>

          <div class="product-meta">
            <p><strong>SKU:</strong> ${item.sku}</p>
            <p>
              <strong>Tags:</strong> ${item.brand.toLowerCase()}, ${item.gender.toLowerCase()}, footwear, ${item.category.toLowerCase()}
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
                <td>${item.weight}</td>
              </tr>
              <tr>
                <th>Digi</th>
                <td style="text-transform: uppercase">${item.category.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Color</th>
                <td>${item.color.toUpperCase()}</td>
              </tr>
              <tr>
                <th>Size</th>
                <td>${allSizes}</td>
              </tr>
              <tr>
                <th>Brand</th>
                <td>${item.brand}</td>
              </tr>
              <tr>
                <th>Gender</th>
                <td>${item.gender}</td>
              </tr>
            </tbody>
          </table>
        </div>
      </section>
    `;
  }

  bodySection.innerHTML = generateDetailHTML(product);
});
