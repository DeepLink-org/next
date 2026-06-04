// DeepLink Next - Extra JavaScript
// Handles instant navigation and dynamic behavior

function attachProjectCommunityDropdown() {
  var tabLinks = document.querySelectorAll(".md-tabs__link");
  var projectLink = Array.prototype.find.call(tabLinks, function(link) {
    return link.textContent.trim() === "项目与社区";
  });

  if (!projectLink) {
    return;
  }

  var projectItem = projectLink.closest(".md-tabs__item");
  if (!projectItem) {
    return;
  }

  var homepage = document.querySelector('[data-md-component="logo"]');
  var siteRoot = homepage ? homepage.href : window.location.origin + "/";
  var links = [
    ["Pulsing", "https://deeplink-org.github.io/Pulsing/"],
    ["Persisting", "https://deeplink-org.github.io/Persisting/zh/"],
    ["Probing", "https://deeplink-org.github.io/probing/"],
  ];

  projectItem.classList.add("md-tabs__item--project-community");
  projectLink.setAttribute("aria-haspopup", "true");
  projectLink.setAttribute("aria-expanded", "false");

  var menu = document.querySelector(".dl-tabs-dropdown__menu");
  if (!menu) {
    menu = document.createElement("div");
    menu.className = "dl-tabs-dropdown__menu";
    menu.setAttribute("role", "menu");
    menu.setAttribute("aria-label", "项目与社区快捷导航");
    document.body.appendChild(menu);
  }

  menu.textContent = "";

  links.forEach(function(item) {
    var label = item[0];
    var href = new URL(item[1], siteRoot).href;
    var anchor = document.createElement("a");
    anchor.className = "dl-tabs-dropdown__item";
    anchor.href = href;
    anchor.role = "menuitem";
    anchor.textContent = label;

    if (window.location.pathname === new URL(href).pathname) {
      anchor.classList.add("dl-tabs-dropdown__item--active");
    }

    menu.appendChild(anchor);
  });

  function positionMenu() {
    var rect = projectLink.getBoundingClientRect();
    menu.style.left = Math.round(rect.left) + "px";
    menu.style.top = Math.round(rect.bottom) + "px";
    menu.style.minWidth = Math.round(rect.width) + "px";
  }

  function openMenu() {
    positionMenu();
    menu.classList.add("dl-tabs-dropdown__menu--open");
    projectItem.classList.add("md-tabs__item--project-community-open");
    projectLink.setAttribute("aria-expanded", "true");
  }

  function closeMenu() {
    menu.classList.remove("dl-tabs-dropdown__menu--open");
    projectItem.classList.remove("md-tabs__item--project-community-open");
    projectLink.setAttribute("aria-expanded", "false");
  }

  if (projectItem.dataset.dlDropdownReady !== "true") {
    var closeTimer;
    var scheduleClose = function() {
      window.clearTimeout(closeTimer);
      closeTimer = window.setTimeout(closeMenu, 120);
    };
    var cancelClose = function() {
      window.clearTimeout(closeTimer);
      openMenu();
    };

    projectItem.addEventListener("mouseenter", cancelClose);
    projectItem.addEventListener("mouseleave", scheduleClose);
    projectItem.addEventListener("focusin", openMenu);
    projectItem.addEventListener("focusout", scheduleClose);
    menu.addEventListener("mouseenter", cancelClose);
    menu.addEventListener("mouseleave", scheduleClose);
    window.addEventListener("scroll", closeMenu, { passive: true });
    window.addEventListener("resize", closeMenu);
    projectItem.dataset.dlDropdownReady = "true";
  }
}

document$.subscribe(function() {
  attachProjectCommunityDropdown();

  // Add target="_blank" to external links
  document.querySelectorAll('.md-content a[href^="http"]').forEach(function(link) {
    link.setAttribute('target', '_blank');
    link.setAttribute('rel', 'noopener noreferrer');
  });
});
