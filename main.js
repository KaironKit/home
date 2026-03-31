const sliderTrack = document.getElementById("sliderTrack");
const sliderViewport = document.getElementById("sliderViewport");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");
const navChips = document.querySelectorAll(".nav-chip");
const dots = document.querySelectorAll(".dot");
const slideButtons = document.querySelectorAll("[data-slide]");
const brandHome = document.getElementById("brandHome");

const totalSlides = 4;
let currentIndex = 0;
let isAnimating = false;

let startX = 0;
let isPointerDown = false;
let wheelLock = false;

function clampIndex(index) {
  return Math.max(0, Math.min(index, totalSlides - 1));
}

function updateUI() {
  navChips.forEach((chip, i) => {
    chip.classList.toggle("active", i === currentIndex);
  });

  dots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentIndex);
  });

  if (prevBtn) {
    prevBtn.style.opacity = currentIndex === 0 ? "0.45" : "1";
  }

  if (nextBtn) {
    nextBtn.style.opacity = currentIndex === totalSlides - 1 ? "0.45" : "1";
  }
}

function goToSlide(index) {
  const nextIndex = clampIndex(index);
  if (isAnimating || nextIndex === currentIndex) return;

  currentIndex = nextIndex;
  isAnimating = true;

  sliderTrack.style.transform = `translateX(-${currentIndex * 100}vw)`;
  updateUI();

  setTimeout(() => {
    isAnimating = false;
  }, 580);
}

function goNext() {
  goToSlide(currentIndex + 1);
}

function goPrev() {
  goToSlide(currentIndex - 1);
}

if (prevBtn) {
  prevBtn.addEventListener("click", goPrev);
}

if (nextBtn) {
  nextBtn.addEventListener("click", goNext);
}

slideButtons.forEach((button) => {
  button.addEventListener("click", () => {
    const index = Number(button.dataset.slide);
    if (!Number.isNaN(index)) {
      goToSlide(index);
    }
  });
});

if (brandHome) {
  brandHome.addEventListener("click", (e) => {
    e.preventDefault();
    goToSlide(0);
  });
}

window.addEventListener("keydown", (e) => {
  if (window.innerWidth <= 980) return;

  if (e.key === "ArrowRight") {
    goNext();
  } else if (e.key === "ArrowLeft") {
    goPrev();
  }
});

window.addEventListener(
  "wheel",
  (e) => {
    if (window.innerWidth <= 980) return;
    if (wheelLock) return;

    const isMostlyVertical = Math.abs(e.deltaY) >= Math.abs(e.deltaX);
    const delta = isMostlyVertical ? e.deltaY : e.deltaX;

    if (Math.abs(delta) < 20) return;

    wheelLock = true;

    if (delta > 0) {
      goNext();
    } else {
      goPrev();
    }

    setTimeout(() => {
      wheelLock = false;
    }, 700);
  },
  { passive: true }
);

function pointerDown(clientX) {
  if (window.innerWidth <= 980) return;
  isPointerDown = true;
  startX = clientX;
}

function pointerUp(clientX) {
  if (window.innerWidth <= 980) return;
  if (!isPointerDown) return;

  const diff = clientX - startX;
  const threshold = 70;

  if (diff <= -threshold) {
    goNext();
  } else if (diff >= threshold) {
    goPrev();
  }

  isPointerDown = false;
}

if (sliderViewport) {
  sliderViewport.addEventListener("mousedown", (e) => {
    pointerDown(e.clientX);
  });

  sliderViewport.addEventListener("mouseup", (e) => {
    pointerUp(e.clientX);
  });

  sliderViewport.addEventListener("mouseleave", (e) => {
    if (isPointerDown) {
      pointerUp(e.clientX);
    }
  });

  sliderViewport.addEventListener("touchstart", (e) => {
    if (!e.touches.length) return;
    pointerDown(e.touches[0].clientX);
  }, { passive: true });

  sliderViewport.addEventListener("touchend", (e) => {
    if (!e.changedTouches.length) return;
    pointerUp(e.changedTouches[0].clientX);
  }, { passive: true });
}

window.addEventListener("resize", () => {
  if (window.innerWidth > 980) {
    sliderTrack.style.transform = `translateX(-${currentIndex * 100}vw)`;
  }
});

updateUI();
sliderTrack.style.transform = "translateX(0vw)";
