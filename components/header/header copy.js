const isLoggedIn = false; // Set to false to simulate logged-out state

const userSection = document.getElementById("user-section");

console.log("IsLogedIn: ", isLoggedIn);
console.log("UserSection: ", userSection);

if (!isLoggedIn) {
  // Display login button if not logged in
  userSection.innerHTML = `
      <li>
        <button class="login-btn" onclick="location.href='/login'">
          Log in
        </button>
      </li>
    `;
} else {
  // Display cart icon and avatar button when logged in
  userSection.innerHTML = `
      <li>
        <a href="/cart">
          <div class="icon-container">
            <i class="fa fa-shopping-cart" aria-hidden="true"></i>
            <div class="badge">4</div>
          </div>
        </a>
      </li>
      <li>
        <div id="user-avatar-dropdown">
          <img
            src="../../assets/users/user1.jpeg"
            alt="user"
            class="avatar-img"
            id="avatarBtn"
          />
          <div class="dropdown-menu" id="dropdownMenu">
            <a href="settings.html"><i class="fa fa-cog"></i> Settings</a>
            <a href="orders.html"><i class="fa fa-box"></i> My Orders</a>
            <a href="#" id="logoutBtn"><i class="fa fa-sign-out-alt"></i> Logout</a>
          </div>
        </div>
      </li>
    `;

  // Avatar dropdown toggle functionality
  document.addEventListener("click", function (event) {
    const avatarBtn = document.getElementById("avatarBtn");
    const dropdownMenu = document.getElementById("dropdownMenu");

    if (avatarBtn && dropdownMenu) {
      if (avatarBtn.contains(event.target)) {
        // Toggle dropdown visibility when avatar is clicked
        dropdownMenu.style.display =
          dropdownMenu.style.display === "block" ? "none" : "block";
      } else if (!dropdownMenu.contains(event.target)) {
        // Close dropdown when clicking outside
        dropdownMenu.style.display = "none";
      }
    }
  });
}
