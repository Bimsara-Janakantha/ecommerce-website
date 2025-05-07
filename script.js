const routes = {
  "/home": "./pages/home/home.html",
  "/about": "./pages/about/about.html",
  "/contact": "./pages/contact/contact.html",
  "/login": "./pages/auth/login.html",
  "/register": "./pages/auth/register.html",
};

const excludedPaths = ["/login", "/register"]; // Full path match

const navigate = (event) => {
  event.preventDefault();
  const path = event.target.getAttribute("href");
  history.pushState({}, "", path);
  renderApp(path);
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

const renderApp = async (path) => {
  await renderRoute(path);
  if (!excludedPaths.includes(path)) {
    await loadComponent("#appbar", "./components/header/header.html");
    await loadComponent("#footer", "./components/footer/footer.html");
  } else {
    document.getElementById("appbar").innerHTML = "";
    document.getElementById("footer").innerHTML = "";
  }
};

window.onpopstate = () => renderApp(window.location.pathname);

// Initial load
const initialPath =
  window.location.pathname === "/" ? "/home" : window.location.pathname;
history.replaceState({}, "", initialPath);
renderApp(initialPath);
