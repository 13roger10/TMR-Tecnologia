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
const revealSpot = document.querySelector(".hero__reveal-spot");
const revealImage = document.querySelector(".hero__reveal-image");
const gridPattern = document.querySelector("#grid");

if (hero && background && revealLayer && revealSpot && revealImage && gridPattern) {
  const supportsFinePointer = window.matchMedia("(pointer:fine)").matches;
  const spotRadius = revealSpot.offsetWidth / 2 || 520;
  const rawMouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };
  const gridOffset = { x: 0, y: 0 };
  let isHovering = false;
  let frameId = 0;
  let lastParallax = "";
  let lastGrid = "";
  let lastSpot = "";

  const syncHeroSize = () => {
    revealLayer.style.setProperty("--hero-w", `${hero.offsetWidth}px`);
    revealLayer.style.setProperty("--hero-h", `${hero.offsetHeight}px`);
  };

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

  // O círculo é só movido (transform, feito pela GPU); a imagem interna anda
  // no sentido oposto para continuar alinhada com o fundo do hero.
  const updateReveal = (x, y) => {
    const tx = Math.round(x - spotRadius);
    const ty = Math.round(y - spotRadius);
    const spot = `${tx},${ty}`;

    if (spot !== lastSpot) {
      lastSpot = spot;
      revealSpot.style.transform = `translate3d(${tx}px, ${ty}px, 0)`;
      revealImage.style.transform = `translate3d(${-tx}px, ${-ty}px, 0)`;
    }

    hero.classList.add("hero--hovering");
  };

  const animate = () => {
    frameId = window.requestAnimationFrame(animate);

    smoothMouse.x += (rawMouse.x - smoothMouse.x) * 0.25;
    smoothMouse.y += (rawMouse.y - smoothMouse.y) * 0.25;

    const rect = hero.getBoundingClientRect();
    const cx = (smoothMouse.x - rect.left) / rect.width - 0.5;
    const cy = (smoothMouse.y - rect.top) / rect.height - 0.5;

    gridOffset.x += (cx * 16 - gridOffset.x) * 0.06;
    gridOffset.y += (cy * 16 - gridOffset.y) * 0.06;

    const grid = `${gridOffset.x.toFixed(2)},${gridOffset.y.toFixed(2)}`;

    if (grid !== lastGrid) {
      lastGrid = grid;
      gridPattern.setAttribute("x", gridOffset.x.toFixed(2));
      gridPattern.setAttribute("y", gridOffset.y.toFixed(2));
    }

    const parallax = `scale(1.03) translate(${(cx * -14).toFixed(2)}px, ${(cy * -10).toFixed(2)}px)`;

    if (parallax !== lastParallax) {
      lastParallax = parallax;
      background.style.transform = parallax;
      revealLayer.style.transform = parallax;
    }

    if (supportsFinePointer && isHovering) {
      updateReveal(rawMouse.x - rect.left, rawMouse.y - rect.top);
    } else {
      clearReveal();
    }
  };

  syncHeroSize();
  setHeroCenter();
  clearReveal();
  hero.classList.add("hero--ready");

  // Decodifica a imagem do efeito antes do primeiro hover.
  const warmUp = new Image();
  warmUp.src = "assets/images/hero-01.webp";
  if (typeof warmUp.decode === "function") {
    warmUp.decode().catch(() => {});
  }

  if (supportsFinePointer) {
    hero.addEventListener("mousemove", (event) => {
      rawMouse.x = event.clientX;
      rawMouse.y = event.clientY;
      isHovering = true;
    });

    hero.addEventListener("mouseenter", (event) => {
      rawMouse.x = event.clientX;
      rawMouse.y = event.clientY;
      smoothMouse.x = event.clientX;
      smoothMouse.y = event.clientY;
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
    syncHeroSize();

    if (!isHovering) {
      setHeroCenter();
      clearReveal();
    }
  });

  if ("ResizeObserver" in window) {
    new ResizeObserver(syncHeroSize).observe(hero);
  }

  animate();

  window.addEventListener("beforeunload", () => {
    window.cancelAnimationFrame(frameId);
  });
}
