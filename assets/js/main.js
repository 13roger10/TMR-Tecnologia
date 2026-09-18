const navToggle = document.querySelector(".hero__nav-toggle");
const navMenu = document.querySelector(".hero__nav-menu");

if (navToggle && navMenu) {
  const closeMenu = () => {
    navMenu.classList.remove("is-open");
    navToggle.classList.remove("is-open");
    navToggle.setAttribute("aria-expanded", "false");
  };

  navToggle.addEventListener("click", () => {
    const isOpen = navMenu.classList.toggle("is-open");
    navToggle.classList.toggle("is-open", isOpen);
    navToggle.setAttribute("aria-expanded", String(isOpen));
  });

  navMenu.querySelectorAll("a").forEach((link) => {
    link.addEventListener("click", closeMenu);
  });

  window.addEventListener("resize", () => {
    if (window.innerWidth > 680) {
      closeMenu();
    }
  });
}

const hero = document.querySelector(".hero");
const background = document.querySelector(".hero__background");
const revealLayer = document.querySelector(".hero__reveal");
const gridPattern = document.querySelector("#grid");

if (hero && background && revealLayer && gridPattern) {
  const supportsFinePointer = window.matchMedia("(pointer:fine)").matches;
  const rawMouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };
  const gridOffset = { x: 0, y: 0 };
  let isHovering = false;
  let frameId = 0;

  const setHeroCenter = () => {
    const rect = hero.getBoundingClientRect();
    const centerX = rect.left + rect.width / 2;
    const centerY = rect.top + rect.height / 2;

    rawMouse.x = centerX;
    rawMouse.y = centerY;
    smoothMouse.x = centerX;
    smoothMouse.y = centerY;
  };

  const clearReveal = () => {
    hero.classList.remove("hero--hovering");
  };

  const animate = () => {
    frameId = window.requestAnimationFrame(animate);

    smoothMouse.x += (rawMouse.x - smoothMouse.x) * 0.35;
    smoothMouse.y += (rawMouse.y - smoothMouse.y) * 0.35;

    const rect = hero.getBoundingClientRect();
    const cx = (smoothMouse.x - rect.left) / rect.width - 0.5;
    const cy = (smoothMouse.y - rect.top) / rect.height - 0.5;

    gridOffset.x += (cx * 16 - gridOffset.x) * 0.06;
    gridOffset.y += (cy * 16 - gridOffset.y) * 0.06;

    gridPattern.setAttribute("x", gridOffset.x.toFixed(2));
    gridPattern.setAttribute("y", gridOffset.y.toFixed(2));

    background.style.transform = `scale(1.03) translate(${cx * -14}px, ${cy * -10}px)`;
    revealLayer.style.transform = `scale(1.03) translate(${cx * -14}px, ${cy * -10}px)`;

    if (supportsFinePointer && isHovering) {
      revealLayer.style.setProperty("--reveal-x", `${smoothMouse.x - rect.left}px`);
      revealLayer.style.setProperty("--reveal-y", `${smoothMouse.y - rect.top}px`);
      hero.classList.add("hero--hovering");
    } else {
      clearReveal();
    }
  };

  setHeroCenter();
  hero.classList.add("hero--ready");

  if (supportsFinePointer) {
    hero.addEventListener("mousemove", (event) => {
      rawMouse.x = event.clientX;
      rawMouse.y = event.clientY;
      isHovering = true;
    });

    hero.addEventListener("mouseenter", (event) => {
      rawMouse.x = event.clientX;
      rawMouse.y = event.clientY;
      isHovering = true;
      hero.classList.add("hero--hovering");
    });

    hero.addEventListener("mouseleave", () => {
      isHovering = false;
      setHeroCenter();
      clearReveal();
    });
  }

  window.addEventListener("resize", () => {
    if (!isHovering) {
      setHeroCenter();
      clearReveal();
    }
  });

  animate();

  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(frameId);
  });
}
