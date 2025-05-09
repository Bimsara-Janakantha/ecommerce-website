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

const productList = [
  {
    productId: 1,
    brand: "Nike",
    url: "../assets/shoes/shoe_1.jpg",
    description: "Fashion Sneakers Breathable shoes",
    rating: 5,
    price: 5000.0,
  },
  {
    productId: 2,
    brand: "Nike",
    url: "../assets/shoes/shoe_2.jpg",
    description: "Casual Footwear",
    rating: 4.8,
    price: 4000.0,
  },
  {
    productId: 3,
    brand: "Nike",
    url: "../assets/shoes/shoe_3.jpg",
    description: "Snakers casual shoes",
    rating: 4.5,
    price: 5500.0,
  },
  {
    productId: 4,
    brand: "Salmon",
    url: "../assets/shoes/shoe_4.jpeg",
    description: "Runing and Hikingshoe",
    rating: 4.6,
    price: 8000.0,
  },
  {
    productId: 5,
    brand: "Point",
    url: "../assets/shoes/shoe_5.jpg",
    description: "Multi coloures sport shoes",
    rating: 4.7,
    price: 6500.0,
  },
  {
    productId: 6,
    brand: "New Balance",
    url: "../assets/shoes/shoe_6.jpeg",
    description: "Runing shoes",
    rating: 4.4,
    price: 7000.0,
  },
];

document.addEventListener("DOMContentLoaded", function () {
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

    return `
    <div class="grid-item">
      <div class="product">
        <img src="${item.url}" alt="Product Image" />
        <div class="description">
          <h6>${item.brand}</h6>
          <h5>${item.description}</h5>
          
          <div class="star">
            ${starsHTML}
          </div>
          
          <h4 style="color: #088178">LKR ${item.price}</h4>
        </div>
        
        <button class="icon-button">
          <i class="fa fa-cart-plus" aria-hidden="true"></i>
        </button>  
      </div>
    </div>
  `;
  }

  product.innerHTML = productList
    .map((item) => generateProductHTML(item))
    .join("");
});
