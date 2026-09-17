(() => {
  const video = document.querySelector(".page-sequence");
  const startMarker = document.querySelector(".about-block");

  if (!video || !startMarker) {
    return;
  }

  let duration = 0;
  let lastTime = -1;
  const minDelta = 1 / 48;

  function seekTo(time) {
    if (Math.abs(time - lastTime) < minDelta) {
      return;
    }

    lastTime = time;

    if (typeof video.fastSeek === "function") {
      video.fastSeek(time);
    } else {
      video.currentTime = time;
    }
  }

  function updateFrame() {
    if (!duration) {
      return;
    }

    const startY = startMarker.offsetTop;
    const activationY = startY * 0.8;
    const totalScrollable = document.documentElement.scrollHeight - window.innerHeight - startY;
    const scrollY = window.scrollY;

    if (scrollY < activationY) {
      video.classList.remove("is-active");
      return;
    }

    video.classList.add("is-active");

    const progress = totalScrollable > 0
      ? Math.min(Math.max((scrollY - startY) / totalScrollable, 0), 1)
      : 1;

    seekTo(progress * duration);
  }

  video.addEventListener("loadedmetadata", () => {
    duration = video.duration || 0;

    video
      .play()
      .then(() => video.pause())
      .catch(() => {});

    updateFrame();
  });

  window.addEventListener(
    "scroll",
    () => window.requestAnimationFrame(updateFrame),
    { passive: true }
  );

  window.addEventListener("resize", () => window.requestAnimationFrame(updateFrame));

  updateFrame();
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
