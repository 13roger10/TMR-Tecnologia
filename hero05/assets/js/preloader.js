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

  // A sequência de imagens do efeito de scroll (assets/js/scrub-frames.js) já
  // começou a baixar assim que o HTML foi parseado. Só liberamos o site
  // quando todos os quadros estiverem prontos, para a rolagem já começar
  // suave, sem esperar surgir durante o uso.
  const framesReady = window.scrubFrames ? window.scrubFrames.ready : Promise.resolve();

  // Mantém o preloader visível por um tempo mínimo, mesmo que o site
  // carregue antes disso, para dar tempo da marca aparecer.
  const minDisplayTime = new Promise((resolve) => window.setTimeout(resolve, 3000));

  Promise.all([pageLoaded, fontsReady, framesReady, minDisplayTime]).then(hidePreloader);

  // Rede segura: nunca prende o visitante atrás do preloader por mais de 15s
  // (os quadros do efeito de scroll fazem parte do que esperamos carregar).
  window.setTimeout(hidePreloader, 15000);
})();
