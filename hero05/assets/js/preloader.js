(() => {
  const preloader = document.getElementById("preloader");

  if (!preloader) {
    return;
  }

  let hidden = false;

  const hidePreloader = () => {
    if (hidden) {
      return;
    }

    hidden = true;
    document.body.classList.remove("is-loading");
    preloader.classList.add("is-hidden");

    preloader.addEventListener(
      "transitionend",
      () => preloader.remove(),
      { once: true }
    );
  };

  const pageLoaded = new Promise((resolve) => {
    if (document.readyState === "complete") {
      resolve();
    } else {
      window.addEventListener("load", resolve, { once: true });
    }
  });

  const fontsReady =
    document.fonts && document.fonts.ready
      ? document.fonts.ready.catch(() => {})
      : Promise.resolve();

  Promise.all([pageLoaded, fontsReady]).then(hidePreloader);

  // Rede segura: nunca prende o visitante atrás do preloader por mais de 8s.
  window.setTimeout(hidePreloader, 8000);
})();
