(() => {
  const canvas = document.querySelector(".page-sequence");
  const startMarker = document.querySelector(".about-block");

  if (!canvas || !startMarker || !window.scrubFrames) {
    return;
  }

  const ctx = canvas.getContext("2d");
  const { images, count } = window.scrubFrames;
  let framesReady = false;
  let lastFrameIndex = -1;

  // startMarker.offsetTop e scrollHeight forçam o navegador a recalcular
  // layout quando lidos. Só recalculamos quando o layout realmente pode
  // ter mudado (carregamento e resize), não a cada frame de scroll.
  let startY = 0;
  let activationY = 0;
  let totalScrollable = 0;

  function computeLayout() {
    startY = startMarker.offsetTop;
    activationY = startY * 0.8;
    totalScrollable = document.documentElement.scrollHeight - window.innerHeight - startY;
  }

  function resizeCanvas() {
    const dpr = window.devicePixelRatio || 1;
    canvas.width = Math.round(window.innerWidth * dpr);
    canvas.height = Math.round(window.innerHeight * dpr);
  }

  // Desenha a imagem já decodificada cobrindo o canvas inteiro (equivalente
  // ao object-fit: cover do vídeo antigo), sem nenhum decode ou seek: é só
  // um drawImage de um bitmap que já está pronto na memória.
  function drawFrame(index) {
    const img = images[index];

    if (!img || !img.complete || !img.naturalWidth || index === lastFrameIndex) {
      return;
    }

    lastFrameIndex = index;

    const scale = Math.max(canvas.width / img.naturalWidth, canvas.height / img.naturalHeight);
    const drawW = img.naturalWidth * scale;
    const drawH = img.naturalHeight * scale;
    const dx = (canvas.width - drawW) / 2;
    const dy = (canvas.height - drawH) / 2;

    ctx.clearRect(0, 0, canvas.width, canvas.height);
    ctx.drawImage(img, dx, dy, drawW, drawH);
  }

  function updateFrame() {
    if (!framesReady) {
      return;
    }

    const scrollY = window.scrollY;

    if (scrollY < activationY) {
      canvas.classList.remove("is-active");
      return;
    }

    canvas.classList.add("is-active");

    const progress = totalScrollable > 0
      ? Math.min(Math.max((scrollY - startY) / totalScrollable, 0), 1)
      : 1;

    drawFrame(Math.round(progress * (count - 1)));
  }

  window.addEventListener(
    "scroll",
    () => window.requestAnimationFrame(updateFrame),
    { passive: true }
  );

  window.addEventListener("resize", () => {
    computeLayout();
    resizeCanvas();
    lastFrameIndex = -1;
    window.requestAnimationFrame(updateFrame);
  });

  computeLayout();
  resizeCanvas();

  // O carregamento dos quadros é disparado pelo scrub-frames.js e aguardado
  // pelo preloader.js, que já garante que estejam prontos antes do site
  // aparecer — aqui só assinamos a mesma promise por segurança.
  window.scrubFrames.ready.then(() => {
    framesReady = true;
    updateFrame();
  });
})();

const revealMediaItems = document.querySelectorAll(".reveal-media");
const revealSideItems = document.querySelectorAll(".reveal-side");
const revealUpItems = document.querySelectorAll(".reveal-up");
const revealMarkItems = document.querySelectorAll(".reveal-mark");
const revealWriteItems = document.querySelectorAll(".reveal-write");
const faqItems = document.querySelectorAll(".faq-item");

function splitRevealNode(node, state) {
  if (node.nodeType === Node.TEXT_NODE) {
    const fragment = document.createDocumentFragment();
    const parts = node.textContent.split(/(\s+)/);

    parts.forEach((part) => {
      if (!part) {
        return;
      }

      if (/^\s+$/.test(part)) {
        fragment.appendChild(document.createTextNode(part));
        return;
      }

      const span = document.createElement("span");
      span.className = "reveal-word";
      span.style.setProperty("--word-index", state.index);
      span.textContent = part;
      state.index += 1;
      fragment.appendChild(span);
    });

    return fragment;
  }

  if (node.nodeType === Node.ELEMENT_NODE) {
    const clone = node.cloneNode(false);

    node.childNodes.forEach((child) => {
      const processedChild = splitRevealNode(child, state);

      if (processedChild) {
        clone.appendChild(processedChild);
      }
    });

    return clone;
  }

  return null;
}

revealWriteItems.forEach((item) => {
  const state = { index: 0 };
  const fragment = document.createDocumentFragment();

  item.childNodes.forEach((child) => {
    const processedChild = splitRevealNode(child, state);

    if (processedChild) {
      fragment.appendChild(processedChild);
    }
  });

  item.replaceChildren(fragment);
});

if ("IntersectionObserver" in window) {
  const revealObserver = new IntersectionObserver(
    (entries, observer) => {
      entries.forEach((entry) => {
        if (!entry.isIntersecting) {
          return;
        }

        entry.target.classList.add("is-visible");
        observer.unobserve(entry.target);
      });
    },
    {
      threshold: 0.22,
      rootMargin: "0px 0px -8% 0px",
    }
  );

  revealMediaItems.forEach((item) => revealObserver.observe(item));
  revealSideItems.forEach((item) => revealObserver.observe(item));
  revealUpItems.forEach((item) => revealObserver.observe(item));
  revealMarkItems.forEach((item) => revealObserver.observe(item));
  revealWriteItems.forEach((item) => revealObserver.observe(item));
} else {
  revealMediaItems.forEach((item) => item.classList.add("is-visible"));
  revealSideItems.forEach((item) => item.classList.add("is-visible"));
  revealUpItems.forEach((item) => item.classList.add("is-visible"));
  revealMarkItems.forEach((item) => item.classList.add("is-visible"));
  revealWriteItems.forEach((item) => item.classList.add("is-visible"));
}

faqItems.forEach((item) => {
  const trigger = item.querySelector(".faq-item__trigger");
  const answer = item.querySelector(".faq-item__answer");

  if (!trigger || !answer) {
    return;
  }

  trigger.addEventListener("click", () => {
    const isOpen = item.classList.contains("is-open");

    faqItems.forEach((faqItem) => {
      const faqTrigger = faqItem.querySelector(".faq-item__trigger");
      const faqAnswer = faqItem.querySelector(".faq-item__answer");

      faqItem.classList.remove("is-open");

      if (faqTrigger) {
        faqTrigger.setAttribute("aria-expanded", "false");
      }

      if (faqAnswer) {
        faqAnswer.hidden = true;
      }
    });

    if (!isOpen) {
      item.classList.add("is-open");
      trigger.setAttribute("aria-expanded", "true");
      answer.hidden = false;
    }
  });
});
