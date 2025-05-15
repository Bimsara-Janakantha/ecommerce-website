import { getData } from "../utils/connection.js";

const imageList = [
  "../assets/carousel/crsl-sh1.jpg",
  "../assets/carousel/crsl-sh2.jpg",
  "../assets/carousel/crsl-sh3.jpeg",
  "../assets/carousel/crsl-sh4.jpg",
  "../assets/carousel/crsl-sh5.webp",
  "../assets/carousel/crsl-sh6.webp",
  "../assets/carousel/crsl-sh7.jpg",
  "../assets/carousel/crsl-sh-8.jpg",
  "../assets/carousel/crsl-sh9.jpg",
  "../assets/carousel/crsl-sh10.jpg",
  "../assets/carousel/crsl-sh11.jpg",
  "../assets/carousel/crsl-sh12.webp",
  "../assets/carousel/crsl-sh13.avif",
  "../assets/carousel/crsl-sh14.jpg",
];

const getProductList = async () => {
  const url = `products/featured`;

  console.log("requesting: ", url);

  try {
    const serverResponse = await getData(url);
    const { message, products } = serverResponse.data;

    if (serverResponse.status === 200) {
      console.log(message, products);
      return products;
    }
    return [];
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
    return [];
  }
};

document.addEventListener("DOMContentLoaded", async function () {
  /* Carousel Section */
  let index = 0;
  let offset = 0;
  const carousel = document.querySelector(".carousel");
  const imageCount = imageList.length;
  const imageWidths = [];

  // Populate carousel with images
  carousel.innerHTML = imageList
    .map((img) => `<img src="${img}" alt="${img.split("/").pop()}" />`)
    .join("");

  const images = document.querySelectorAll(".carousel img");

  const showNextImage = () => {
    if (index >= imageCount - 1) {
      index = 0;
      offset = 0;
    } else {
      offset += imageWidths[index] + 20; // 20px margin/padding if applicable
      index++;
    }
    updateCarouselPosition();
  };

  const updateCarouselPosition = () => {
    carousel.style.transition = "transform 0.5s ease-in-out";
    carousel.style.transform = `translateX(-${offset}px)`;
  };

  // Wait for all images to load
  let loaded = 0;
  images.forEach((img) => {
    img.addEventListener("load", () => {
      loaded++;
      if (loaded === images.length) {
        // Get widths of all images
        images.forEach((img, i) => {
          const w = img.clientWidth;
          imageWidths.push(w);
          //console.log(`Image ${i + 1} width: ${w}px`);
        });

        // Start carousel
        setInterval(showNextImage, 3000);
      }
    });

    // Trigger load manually for cached images
    if (img.complete) {
      img.dispatchEvent(new Event("load"));
    }
  });

  /* Featured Items */
  const product = document.querySelector(".product-grid");
  const productList = await getProductList();

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
            <article class="product" onclick="location.href='details.html?id=${item.shoeId}'">
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

  if (productList.length > 0) {
    product.innerHTML = productList
      .map((item) => generateProductHTML(item))
      .join("");
  } else {
    document.querySelector(".product-container .no-data").style.display =
      "flex";
  }
});
