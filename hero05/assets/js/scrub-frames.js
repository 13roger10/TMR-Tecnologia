// Carrega a sequência de imagens usada no efeito de scroll (assets/images/scrub).
// Fica num arquivo à parte, carregado antes do preloader e do sections.js, para
// que o download comece o quanto antes e ambos os scripts usem a mesma lista de
// imagens já em cache do navegador.
window.scrubFrames = (() => {
  const COUNT = 75;
  const BASE_PATH = "assets/images/scrub/";

  const images = Array.from({ length: COUNT }, (_, i) => {
    const img = new Image();
    img.src = `${BASE_PATH}frame-${String(i + 1).padStart(3, "0")}.jpg`;
    return img;
  });

  const ready = Promise.all(
    images.map(
      (img) =>
        new Promise((resolve) => {
          if (img.complete) {
            resolve();
            return;
          }

          img.addEventListener("load", resolve, { once: true });
          img.addEventListener("error", resolve, { once: true });
        })
    )
  );

  return { images, ready, count: COUNT };
})();
