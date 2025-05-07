import { postData } from "./utils/connection.js";

const getVerify = async (username, password) => {
  const data = { username, password };

  try {
    const response = await postData("login", data);

    console.log("Server Reponse: ", response);

    if (response.status === 200) {
      const userInfo = response.json();
      localStorage.setItem("user", JSON.stringify(userInfo));
      window.location.href = "profile.html";
    } else {
      alert("Invalid username or password");
    }
  } catch (error) {
    console.error("Error:", error);
    alert("Something went wrong. Please try again.");
  }
};

const submitForm = (e) => {
  e.preventDefault();

  const username = document.getElementById("username").value;
  const password = document.getElementById("password").value;

  console.log("Username: " + username + "\t Password: " + password);

  getVerify(username, password);
};

document.getElementById("loginForm").addEventListener("submit", submitForm);
