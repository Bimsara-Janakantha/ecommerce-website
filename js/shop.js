const DISCOUNTS = [
  {
    id: "slide-1",
    name: "black-friday-01",
    url: "../assets/slideshow/Black-Friday_banner.png",
  },
  {
    id: "slide-2",
    name: "black-friday_2",
    url: "../assets/slideshow/Black-Friday-_banner_2.jpg",
  },
  {
    id: "slide-3",
    name: "new-arrival",
    url: "../assets/slideshow/new-arrival.jpg",
  },
];

document.addEventListener("DOMContentLoaded", function () {
  const carousel = document.querySelector(".slider");

  // Populate carousel with images
  carousel.innerHTML = DISCOUNTS.map(
    (img) => `<img id="${img.id}" src="${img.url}" alt="${img.name}" />`
  ).join("");

  // Auto sider
  const slideCount = DISCOUNTS.length;
  let currentIdx = 0;

  const autoScroll = () => {
    currentIdx = (currentIdx + 1) % slideCount;
    const slideWidth = carousel.clientWidth;
    carousel.scrollTo({
      left: currentIdx * slideWidth,
      behavior: "smooth",
    });
  };

  // Start auto-scroll every 5 seconds
  setInterval(autoScroll, 5000);
});
