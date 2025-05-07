// header.js
document.addEventListener("DOMContentLoaded", () => {
  const avatarBtn = document.getElementById("avatarBtn");
  const dropdown = document.getElementById("avatar-dropdown-menu");

  if (avatarBtn && dropdown) {
    avatarBtn.addEventListener("click", () => {
      const isVisible = dropdown.getAttribute("data-visible") === "true";
      dropdown.setAttribute("data-visible", !isVisible);
      dropdown.style.display = isVisible ? "none" : "block";
    });
  }
});
