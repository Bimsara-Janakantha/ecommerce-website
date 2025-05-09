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

document.addEventListener("DOMContentLoaded", function () {
  let index = 0;
  let width = 0;
  const carousel = document.querySelector(".carousel");
  const imageCount = imageList.length;

  carousel.innerHTML = imageList.map(
    (img) => `<img id="carousel-img" src=${img} alt=${img.split("/").pop()} />`
  );

  const imageWidth = [];
  setTimeout(() => {
    const images = document.querySelectorAll(".carousel img");
    images.forEach((img, i) => {
      console.log(`Image ${i + 1} width: ${img.clientWidth}px`);
      imageWidth.push(img.clientWidth);
    });
  }, 500);

  const showNextImage = () => {
    if (index === imageCount - 1) {
      console.log("Reset");
      index = 0;
      width = 0;
    } else {
      width = width + imageWidth[index++] + 20;
    }
    updateCarouselPosition();
  };

  const updateCarouselPosition = () => {
    const carousel = document.querySelector(".carousel");
    const newTransform = `translateX(-${width}px)`;
    carousel.style.transform = newTransform;
  };

  setInterval(showNextImage, 3000);
});
