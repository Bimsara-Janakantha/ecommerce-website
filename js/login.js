import { postData } from "../utils/connection.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const username = document.getElementById("login-username");
  const password = document.getElementById("login-password");
  const remember = document.getElementById("remember");
  const status_msg = document.querySelector("#status-message");
  const spinner = form.querySelector(".fa-spinner");
  const spinnerText = document.querySelector(".submit-btn span");

  const user = localStorage.getItem("user") || null;

  if (user !== null) {
    console.log("already loged in");
    location.href = "home.html";
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    username.setCustomValidity("");
    password.setCustomValidity("");

    // Function to display message
    function notifyMe(message, type) {
      const icon =
        type === "error"
          ? `<i class="fa-regular fa-circle-xmark"></i>`
          : `<i class="fa-regular fa-circle-check"></i>`;
      status_msg.innerHTML = ` ${icon} ${message} `;
      status_msg.classList.add(type);
      status_msg.style.display = "flex";

      // Auto-hide after 3 seconds (optional)
      setTimeout(() => {
        status_msg.classList.remove(type);
        status_msg.style.display = "none";

        if (type === "success") {
          location.href = "home.html";
        }
      }, 3000);
    }

    // Validate username
    if (username.value.length < 5) {
      username.setCustomValidity("Username should be more than 4 characters");
      username.reportValidity();
      return;
    }

    // Validate terms acceptance
    if (!remember.checked) {
      console.log("Remember Me");
    }

    // Show spinner
    spinner.style.display = "inline-block";

    // Backend Verification Logic
    const verifyUser = async (user) => {
      //console.log("User: ", user);
      spinner.style.display = "block";
      spinnerText.style.display = "none";

      try {
        const serverResponse = await postData("login", user);
        const { message, role, userId } = serverResponse.data;
        notifyMe(message, "success");
        localStorage.setItem("user", JSON.stringify({ userId, role }));
      } catch (error) {
        console.error("Login Error: ", error);
        if (error.status === 404 || error.status === 401) {
          notifyMe(error.message, "error");
        } else {
          notifyMe("Something went wrong", "error");
        }
      } finally {
        spinner.style.display = "none";
        spinnerText.style.display = "block";
      }
    };

    verifyUser({ username: username.value, password: password.value });
  });
});
