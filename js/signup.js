addEventListener("DOMContentLoaded", async function () {
  // Elements
  const emailInput = document.querySelector("#signup-email");
  const otpInput = document.querySelector("#signup-otp");
  const passwordInput = document.querySelector("#signup-password");
  const confirmPwdInput = document.querySelector("#signup-confirmPwd");
  const agreedCheckbox = document.querySelector("#agreed");

  const inputGroups = document.querySelectorAll(".input-group");
  const headings = document.querySelectorAll("h4");
  const checkboxLabel = document.querySelector(".checkbox-group");
  const signupBtn = document.querySelector("button[type='submit']");

  let currentStep = 1;

  // Helper: Switch step
  function goToStep(step) {
    inputGroups.forEach(
      (group, i) => (group.style.display = i === step - 1 ? "block" : "none")
    );
    headings.forEach(
      (heading, i) =>
        (heading.style.display = i === step - 1 ? "block" : "none")
    );

    if (step === 3) checkboxLabel.style.display = "block";
    else checkboxLabel.style.display = "none";
  }

  // Step 1: Email submission
  emailInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Add your validation/send email API logic here
      goToStep(2);
      updateStepper(2);
    }
  });

  // Step 2: OTP submission
  otpInput.addEventListener("keydown", (e) => {
    if (e.key === "Enter") {
      e.preventDefault();
      // Add your OTP verification logic here
      goToStep(3);
      updateStepper(3);
    }
  });

  // Step 3: Password setup + Submit
  signupBtn.addEventListener("click", (e) => {
    e.preventDefault();
    if (
      passwordInput.value.length >= 6 &&
      passwordInput.value === confirmPwdInput.value &&
      agreedCheckbox.checked
    ) {
      signupBtn.disabled = true;
      signupBtn.querySelector("i").style.display = "inline-block";
      signupBtn.textContent = " Signing up...";
      // Call API to complete registration
    } else {
      alert("Please check your inputs and agreement.");
    }
  });

  // Stepper update
  function updateStepper(step) {
    const circles = document.querySelectorAll(".signup-stepper .circle");
    circles.forEach((circle, i) => {
      if (i + 1 < step) {
        circle.className = "circle completed";
        circle.innerHTML = `<i class="fas fa-check"></i>`;
      } else if (i + 1 === step) {
        circle.className = "circle current";
        circle.innerHTML = `${step}`;
      } else {
        circle.className = "circle upcoming";
        circle.innerHTML = `${i + 1}`;
      }
    });
  }

  // Initial setup
  goToStep(1);
});
