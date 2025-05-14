import { postData } from "../utils/connection.js";

document.addEventListener("DOMContentLoaded", () => {
  const form = document.querySelector("form");
  const username = document.getElementById("signup-username");
  const password = document.getElementById("signup-password");
  const confirmPwd = document.getElementById("signup-confirmPwd");
  const agreeCheckbox = document.getElementById("agreed");
  const status_msg = document.querySelector("#status-message");
  const spinner = form.querySelector(".fa-spinner");
  const spinnerText = document.querySelector(".submit-btn span");

  form.addEventListener("submit", async (e) => {
    e.preventDefault();

    // Clear previous errors
    username.setCustomValidity("");
    password.setCustomValidity("");
    confirmPwd.setCustomValidity("");

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
      }, 3000);
    }

    // Validate username
    if (username.value.length < 5) {
      username.setCustomValidity("Username should be more than 4 characters");
      username.reportValidity();
      return;
    }

    // Validate password match
    if (password.value !== confirmPwd.value) {
      confirmPwd.setCustomValidity("Passwords do not match.");
      confirmPwd.reportValidity();
      return;
    }

    // Validate terms acceptance
    if (!agreeCheckbox.checked) {
      notifyMe(
        "Please accept the terms and conditions before signing up.",
        "error"
      );
      return;
    }

    // Show spinner
    spinner.style.display = "inline-block";

    // Backend Verification Logic
    const addUser = async (user) => {
      //console.log("User: ", user);
      spinner.style.display = "block";
      spinnerText.style.display = "none";

      try {
        const serverResponse = await postData("users", user);

        if (serverResponse.status === 201) {
          console.log("User registered successfully.");
          notifyMe("User registered successfully.", "success");
          location.href = "/home.html";
        } else if (serverResponse.status === 226) {
          notifyMe("Username alredy taken", "error");
        }
      } catch (error) {
        console.error("Signup Error: ", error);
        notifyMe("Something went wrong.", "error");
      } finally {
        spinner.style.display = "none";
        spinnerText.style.display = "block";
      }
    };

    addUser({ username: username.value, password: password.value });
  });
});
