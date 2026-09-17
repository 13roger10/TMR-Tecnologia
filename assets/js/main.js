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
const maskCanvas = document.querySelector(".hero__mask-canvas");
const gridPattern = document.querySelector("#grid");

if (hero && background && revealLayer && maskCanvas && gridPattern) {
  const context = maskCanvas.getContext("2d");
  const supportsFinePointer = window.matchMedia("(pointer:fine)").matches;
  const rawMouse = { x: 0, y: 0 };
  const smoothMouse = { x: 0, y: 0 };
  const cursorPos = { x: 0, y: 0 };
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
    cursorPos.x = centerX;
    cursorPos.y = centerY;
  };

  const resizeCanvas = () => {
    maskCanvas.width = window.innerWidth;
    maskCanvas.height = window.innerHeight;
  };

  const clearReveal = () => {
    if (!context) {
      return;
    }

    context.clearRect(0, 0, maskCanvas.width, maskCanvas.height);
    revealLayer.style.maskImage = "none";
    revealLayer.style.webkitMaskImage = "none";
    hero.classList.remove("hero--hovering");
  };

  const drawReveal = (cursorX, cursorY) => {
    if (!context) {
      return;
    }

    context.clearRect(0, 0, maskCanvas.width, maskCanvas.height);

    const gradient = context.createRadialGradient(
      cursorX,
      cursorY,
      0,
      cursorX,
      cursorY,
      520
    );

    gradient.addColorStop(0, "rgba(255,255,255,1)");
    gradient.addColorStop(0.4, "rgba(255,255,255,1)");
    gradient.addColorStop(0.6, "rgba(255,255,255,0.75)");
    gradient.addColorStop(0.75, "rgba(255,255,255,0.4)");
    gradient.addColorStop(0.88, "rgba(255,255,255,0.12)");
    gradient.addColorStop(1, "rgba(255,255,255,0)");

    context.beginPath();
    context.arc(cursorX, cursorY, 520, 0, Math.PI * 2);
    context.fillStyle = gradient;
    context.fill();

    const maskDataUrl = maskCanvas.toDataURL();
    revealLayer.style.maskImage = `url("${maskDataUrl}")`;
    revealLayer.style.webkitMaskImage = `url("${maskDataUrl}")`;
    hero.classList.add("hero--hovering");
  };

  const animate = () => {
    frameId = window.requestAnimationFrame(animate);

    smoothMouse.x += (rawMouse.x - smoothMouse.x) * 0.1;
    smoothMouse.y += (rawMouse.y - smoothMouse.y) * 0.1;

    const rect = hero.getBoundingClientRect();
    const cx = (smoothMouse.x - rect.left) / rect.width - 0.5;
    const cy = (smoothMouse.y - rect.top) / rect.height - 0.5;

    gridOffset.x += (cx * 16 - gridOffset.x) * 0.06;
    gridOffset.y += (cy * 16 - gridOffset.y) * 0.06;

    cursorPos.x = smoothMouse.x;
    cursorPos.y = smoothMouse.y;

    gridPattern.setAttribute("x", gridOffset.x.toFixed(2));
    gridPattern.setAttribute("y", gridOffset.y.toFixed(2));

    background.style.transform = `scale(1.03) translate(${cx * -14}px, ${cy * -10}px)`;
    revealLayer.style.transform = `scale(1.03) translate(${cx * -14}px, ${cy * -10}px)`;

    if (supportsFinePointer && isHovering) {
      drawReveal(cursorPos.x, cursorPos.y);
    } else {
      clearReveal();
    }
  };

  resizeCanvas();
  setHeroCenter();
  clearReveal();
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
    resizeCanvas();

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
