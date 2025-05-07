const routes = {
  "/home": "./pages/home/home.html",
  "/about": "./pages/about/about.html",
  "/contact": "./pages/contact/contact.html",
};

const navigate = (event) => {
  event.preventDefault();
  const path = event.target.getAttribute("href");
  history.pushState({}, "", path);
  renderRoute(path);
};

const bindLinks = () => {
  const links = document.querySelectorAll("a[data-link]");
  links.forEach((link) => {
    link.addEventListener("click", navigate);
  });
};

const renderRoute = async (path) => {
  const app = document.getElementById("app");
  const page = routes[path];
  if (page) {
    try {
      const res = await fetch(page);
      if (!res.ok) throw new Error("Page not found");
      const html = await res.text();
      app.innerHTML = html;
      bindLinks();
    } catch (err) {
      app.innerHTML = "<h2>Failed to load page.</h2>";
    }
  } else {
    app.innerHTML = "<h2>404 - Page not found</h2>";
  }
};

const loadComponent = async (selector, file) => {
  const container = document.querySelector(selector);
  const res = await fetch(file);
  const html = await res.text();
  container.innerHTML = html;
};

window.onpopstate = () => renderRoute(window.location.pathname);

if (window.location.pathname === "/") {
  history.replaceState({}, "", "/home");
}

renderRoute(window.location.pathname);
loadComponent("#appbar", "./components/header/header.html");
loadComponent("#footer", "./components/footer/footer.html");
