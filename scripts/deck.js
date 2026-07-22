// ふわふわストライク — デッキ操作
// ← → / Space / クリック / スワイプ で送り、F でフルスクリーン
(() => {
  "use strict";

  const slides = Array.from(document.querySelectorAll(".slide"));
  const progress = document.querySelector(".progress");
  const stage = document.querySelector(".stage");
  let index = 0;

  // 進行ドットを生成
  const dots = slides.map((_, i) => {
    const dot = document.createElement("button");
    dot.type = "button";
    dot.setAttribute("aria-label", `${i + 1}枚目へ`);
    dot.addEventListener("click", () => go(i));
    progress.appendChild(dot);
    return dot;
  });

  function go(next) {
    const clamped = Math.max(0, Math.min(slides.length - 1, next));
    if (clamped === index) return;

    slides.forEach((slide, i) => {
      slide.classList.toggle("is-active", i === clamped);
      slide.classList.toggle("is-prev", i < clamped);
    });
    dots.forEach((dot, i) => dot.classList.toggle("is-current", i === clamped));
    index = clamped;
  }

  const nextSlide = () => go(index + 1);
  const prevSlide = () => go(index - 1);

  // 入力中（得点表のセルなど）はスライド操作を奪わない
  const isTyping = () => {
    const el = document.activeElement;
    return el && (el.tagName === "INPUT" || el.tagName === "TEXTAREA" || el.isContentEditable);
  };

  // キーボード
  window.addEventListener("keydown", (e) => {
    if (isTyping()) {
      if (e.key === "Escape") document.activeElement.blur();
      return; // 入力欄では矢印＝カーソル移動、数字＝入力を優先
    }
    switch (e.key) {
      case "ArrowRight":
      case "ArrowDown":
      case " ":
      case "Enter":
        e.preventDefault();
        nextSlide();
        break;
      case "ArrowLeft":
      case "ArrowUp":
        e.preventDefault();
        prevSlide();
        break;
      case "Home":
        go(0);
        break;
      case "End":
        go(slides.length - 1);
        break;
      case "f":
      case "F":
        toggleFullscreen();
        break;
      default:
        break;
    }
  });

  // クリック（左1/4で戻る、それ以外で進む。ボタン類は除外）
  stage.addEventListener("click", (e) => {
    if (e.target.closest("button, a, input, textarea, select")) return;
    const rect = stage.getBoundingClientRect();
    const x = e.clientX - rect.left;
    if (x < rect.width * 0.25) prevSlide();
    else nextSlide();
  });

  // スワイプ
  let touchX = null;
  stage.addEventListener("touchstart", (e) => {
    touchX = e.changedTouches[0].clientX;
  }, { passive: true });
  stage.addEventListener("touchend", (e) => {
    if (touchX === null) return;
    const dx = e.changedTouches[0].clientX - touchX;
    if (Math.abs(dx) > 40) (dx < 0 ? nextSlide() : prevSlide());
    touchX = null;
  }, { passive: true });

  function toggleFullscreen() {
    const el = document.documentElement;
    if (!document.fullscreenElement) {
      (el.requestFullscreen || el.webkitRequestFullscreen)?.call(el);
    } else {
      (document.exitFullscreen || document.webkitExitFullscreen)?.call(document);
    }
  }

  // 矢印ボタン
  document.querySelector(".nav-arrow.prev")?.addEventListener("click", prevSlide);
  document.querySelector(".nav-arrow.next")?.addEventListener("click", nextSlide);

  // 初期スライド（?slide=N または #N で指定可能・1始まり）
  const params = new URLSearchParams(location.search);
  const fromQuery = parseInt(params.get("slide"), 10);
  const fromHash = parseInt(location.hash.replace("#", ""), 10);
  const start = (Number.isFinite(fromQuery) ? fromQuery : fromHash) - 1;
  go(Number.isFinite(start) ? start : 0);
})();
