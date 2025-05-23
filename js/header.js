document.addEventListener("DOMContentLoaded", function () {
  console.log("DOM fully loaded");

  const user = JSON.parse(localStorage.getItem("user")) || null;
  const isLoggedIn = !!user;
  const cart = JSON.parse(localStorage.getItem("cart")) || [];
  const cartItems = cart.length;

  const path = window.location.pathname;
  const currentPath = path.split("/").pop().toLowerCase();

  const userSection = document.getElementById("navbar");
  if (!userSection) {
    console.error("Error: #navbar not found!");
    return;
  }

  console.log("userSection found:", userSection);

  const getNavItem = (href, label) => {
    const isActive = currentPath === href.toLowerCase();
    return `<li><a class="${
      isActive ? "active" : ""
    }" href="${href}" data-link>${label}</a></li>`;
  };

  if (!isLoggedIn) {
    userSection.innerHTML = `
      ${getNavItem("home.html", "Home")}
      ${getNavItem("shop.html", "Shop")}
      ${getNavItem("about.html", "About Us")}
      ${getNavItem("contact.html", "Contact Us")}
      <li>
        <button class="login-btn" onclick="location.href='login.html'">
          Log in
        </button>
      </li>
    `;
  } else {
    const badgeHTML =
      Number(cartItems) > 0 ? `<div class="badge">${cartItems}</div>` : "";

    const dashboardHTML =
      user.role.toLowerCase() === "seller"
        ? `<a href="dashboard.html" data-link><i class="fa fa-tachometer" aria-hidden="true"></i> Dashboard</a>`
        : "";

    userSection.innerHTML = `
      ${getNavItem("home.html", "Home")}
      ${getNavItem("shop.html", "Shop")}
      ${getNavItem("about.html", "About Us")}
      ${getNavItem("contact.html", "Contact Us")}
      <li id="cartButtonContainer">
        <button class="icon-container" onclick="location.href='cart.html'">
          <i class="fa fa-shopping-cart" aria-hidden="true"></i>
          ${badgeHTML}
        </button>
      </li>

      <li id="userAvatarContainer" class="user-avatar-dropdown">
        <img
          src="../assets/users/user1.jpeg"
          alt="user"
          class="avatarBtn"
          id="avatarBtn"
        />
        <div class="avatar-dropdown-menu" id="avatar-dropdown-menu">
          ${dashboardHTML}
          <a href="settings.html" data-link>
            <i class="fa fa-cog"></i> Settings
          </a>
          <a href="orders.html" data-link>
            <i class="fa fa-box"></i> My Orders
          </a>
          <a href="home.html" id="logoutBtn" data-link>
            <i class="fa fa-sign-out-alt"></i> Logout
          </a>
        </div>
      </li>
    `;
  }

  // Avatar Dropdown Handling
  const avatarBtn = document.getElementById("avatarBtn");
  const dropdownMenu = document.getElementById("avatar-dropdown-menu");

  if (avatarBtn && dropdownMenu) {
    avatarBtn.addEventListener("click", (e) => {
      e.stopPropagation();
      dropdownMenu.classList.toggle("visible");
    });

    document.addEventListener("click", (e) => {
      if (!avatarBtn.contains(e.target) && !dropdownMenu.contains(e.target)) {
        dropdownMenu.classList.remove("visible");
      }
    });

    dropdownMenu.querySelectorAll("a").forEach((link) => {
      link.addEventListener("click", () => {
        dropdownMenu.classList.remove("visible");
      });
    });
  }

  // Logout handler
  const logoutBtn = document.getElementById("logoutBtn");
  if (logoutBtn) {
    logoutBtn.addEventListener("click", () => {
      localStorage.clear();
    });
  }
});
