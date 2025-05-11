const SHOE_LIST = [
  {
    shoeId: 1,
    brand: "NIKE",
    gender: "MEN",
    category: "Sneakers",
    description: "Lightweight breathable sneakers for daily wear",
    price: 1799.0,
    discount: 15,
    rating: 4.2,
    url: "../assets/shoes/shoe_1.jpg",
  },
  {
    shoeId: 2,
    brand: "PUMA",
    gender: "MEN",
    category: "Sneakers",
    description: "Classic low-top sneakers with modern twist",
    price: 1899.0,
    discount: 10,
    rating: 4.3,
    url: "../assets/shoes/shoe_6.jpeg",
  },
  {
    shoeId: 3,
    brand: "WOODLAND",
    gender: "MEN",
    category: "Boots",
    description: "Tough leather boots for outdoor adventures",
    price: 2599.0,
    discount: 20,
    rating: 4.5,
    url: "../assets/shoes/shoe_7.webp",
  },
  {
    shoeId: 4,
    brand: "RED TAPE",
    gender: "MEN",
    category: "Boots",
    description: "Stylish ankle boots for all-day comfort",
    price: 2299.0,
    discount: 12,
    rating: 4.1,
    url: "../assets/shoes/shoe_8.jpeg",
  },
  {
    shoeId: 5,
    brand: "BATA",
    gender: "MEN",
    category: "Sandals",
    description: "Comfortable sandals with soft footbed",
    price: 999.0,
    discount: 8,
    rating: 4.0,
    url: "../assets/shoes/shoe_9.jpeg",
  },
  {
    shoeId: 6,
    brand: "SPARX",
    gender: "MEN",
    category: "Sandals",
    description: "Durable sandals ideal for casual outings",
    price: 899.0,
    discount: 5,
    rating: 4.2,
    url: "../assets/shoes/shoe_10.webp",
  },
  {
    shoeId: 7,
    brand: "LOUIS PHILIPPE",
    gender: "MEN",
    category: "Loafers",
    description: "Elegant leather loafers for formal wear",
    price: 2699.0,
    discount: 18,
    rating: 4.6,
    url: "../assets/shoes/shoe_11.jpg",
  },
  {
    shoeId: 8,
    brand: "HUSH PUPPIES",
    gender: "MEN",
    category: "Loafers",
    description: "Comfortable slip-on loafers with cushioned sole",
    price: 2399.0,
    discount: 15,
    rating: 4.4,
    url: "../assets/shoes/shoe_12.jpg",
  },
  {
    shoeId: 9,
    brand: "NIKE",
    gender: "MEN",
    category: "Sneakers",
    description: "Performance sneakers with superior grip",
    price: 2099.0,
    discount: 10,
    rating: 4.5,
    url: "../assets/shoes/shoe_13.jpeg",
  },
  {
    shoeId: 10,
    brand: "PUMA",
    gender: "MEN",
    category: "Sneakers",
    description: "Trendy sneakers for casual wear",
    price: 1699.0,
    discount: 12,
    rating: 4.1,
    url: "../assets/shoes/shoe_14.webp",
  },
  {
    shoeId: 11,
    brand: "RED CHIEF",
    gender: "MEN",
    category: "Boots",
    description: "Rugged boots with padded collar",
    price: 2499.0,
    discount: 17,
    rating: 4.3,
    url: "../assets/shoes/shoe_15.jpg",
  },
  {
    shoeId: 12,
    brand: "LEE COOPER",
    gender: "MEN",
    category: "Loafers",
    description: "Smart casual loafers for versatile use",
    price: 1999.0,
    discount: 14,
    rating: 4.2,
    url: "../assets/shoes/shoe_16.jpg",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  const shoeGrid = document.querySelector(".product-grid");

  function generateProductHTML(item) {
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

    const discount = item.discount
      ? `<div class="discount-badge">${item.discount}% OFF</div>`
      : "";

    const oldPrice = item.discount
      ? `<p class="product-old-price">LKR ${item.price.toFixed(2)}</p>`
      : "";
    const newPrice = item.discount
      ? (item.price * (100 - item.discount) * 0.01).toFixed(2)
      : item.price.toFixed(2);

    return `
        <div class="grid-item">
            <article class="product">
                ${discount}
                <img
                  class="product-image"
                  src="${item.url}"
                  alt="${item.shoeId}"
                />
                <p class="product-title">
                  ${item.brand} ${item.gender} ${item.description}
                </p>
                ${oldPrice}
                <h5 class="product-new-price">LKR ${newPrice}</h5>
                <div class="stars">
                    ${starsHTML}                  
                </div>
            </article>
        </div>
    `;
  }

  shoeGrid.innerHTML = SHOE_LIST.map((item) => generateProductHTML(item)).join(
    ""
  );
});
