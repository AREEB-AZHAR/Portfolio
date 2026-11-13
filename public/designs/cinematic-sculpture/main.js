(() => {
  document.documentElement.classList.add("archive-static");
  document.querySelectorAll(".reveal, .reveal-title").forEach((element) => {
    element.classList.add("is-revealed");
  });
  const menuButton = document.querySelector("#menu-toggle, .menu-button");
  const menu = document.querySelector("#mobile-nav, #mobile-menu");
  if (menuButton && menu) {
    menuButton.addEventListener("click", () => {
      const open = menu.hidden || getComputedStyle(menu).display === "none";
      menu.hidden = !open;
      menu.classList.toggle("open", open);
      menuButton.setAttribute("aria-expanded", String(open));
    });
    menu.querySelectorAll("a").forEach((link) => link.addEventListener("click", () => {
      menu.hidden = true;
      menuButton.setAttribute("aria-expanded", "false");
    }));
  }
})();
