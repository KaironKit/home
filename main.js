const sliderTrack = document.getElementById("sliderTrack");
const sliderViewport = document.getElementById("sliderViewport");
const slides = document.querySelectorAll(".slide");
const navChips = document.querySelectorAll(".nav-chip");
const slideButtons = document.querySelectorAll("[data-slide]");
const brandHome = document.getElementById("brandHome");
const prevBtn = document.getElementById("prevBtn");
const nextBtn = document.getElementById("nextBtn");

const likeButton = document.getElementById("likeButton");
const likeCount = document.getElementById("likeCount");
const coffeeButton = document.getElementById("coffeeButton");
const installBtn = document.getElementById("installBtn");

const ribbonTabs = document.querySelectorAll(".ribbon-tab");
const appTitle = document.getElementById("appTitle");
const appDesc = document.getElementById("appDesc");
const appPoints = document.getElementById("appPoints");
const appImage = document.getElementById("appImage");

const totalSlides = 3;
let currentIndex = 0;
let isAnimating = false;

let startX = 0;
let startY = 0;
let isPointerDown = false;
let wheelLock = false;

const appData = {
  kmemokit: {
    title: "K-MemoKit",
    desc:
      "메모, 일정, 즐겨찾기, 계산기를 한곳에 모아 쉽고 빠르게 사용할 수 있는 데스크톱 프로그램입니다. 딱딱한 도구가 아니라, 매일 편하게 꺼내 쓰는 나만의 작은 작업 키트를 목표로 만들었습니다.",
    points: ["Memo", "Schedule", "Bookmarks", "Calculator"],
    image: "kaironkit-main.png",
    alt: "K-MemoKit 대표 이미지"
  }
};

function clampIndex(index) {
  return Math.max(0, Math.min(index, totalSlides - 1));
}

function updateUI() {
  navChips.forEach((chip, i) => {
    chip.classList.toggle("active", i === currentIndex);
  });

  if (prevBtn) {
    prevBtn.style.opacity = currentIndex === 0 ? "0.45" : "1";
  }

  if (nextBtn) {
    nextBtn.style.opacity = currentIndex === totalSlides - 1 ? "0.45" : "1";
  }
}

function updateViewportHeight() {
  if (!sliderViewport || !slides[currentIndex]) return;

  if (window.innerWidth <= 980) {
    sliderViewport.style.height = "auto";
    return;
  }

  const activeSlide = slides[currentIndex];
  const targetHeight = activeSlide.offsetHeight;
  sliderViewport.style.height = `${targetHeight}px`;
}

function goToSlide(index) {
  const nextIndex = clampIndex(index);
  if (isAnimating || nextIndex === currentIndex) return;

  currentIndex = nextIndex;
  isAnimating = true;

  sliderTrack.style.transform = `translateX(-${currentIndex * 100}vw)`;
  updateUI();
  updateViewportHeight();

  window.scrollTo({
    top: 0,
    behavior: "smooth"
  });

  setTimeout(() => {
    isAnimating = false;
    updateViewportHeight();
  }, 580);
}

function goNext() {
  goToSlide(currentIndex + 1);
}

function goPrev() {
  goToSlide(currentIndex - 1);
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
    if (currentIndex !== 0) {
      goToSlide(0);
    }
  });
}

if (prevBtn) {
  prevBtn.addEventListener("click", goPrev);
}

if (nextBtn) {
  nextBtn.addEventListener("click", goNext);
}

window.addEventListener(
  "wheel",
  (e) => {
    if (window.innerWidth <= 980) return;
    if (wheelLock || isAnimating) return;

    const delta = e.deltaY;
    if (Math.abs(delta) < 28) return;

    wheelLock = true;

    if (delta > 0) {
      goNext();
    } else {
      goPrev();
    }

    setTimeout(() => {
      wheelLock = false;
    }, 720);
  },
  { passive: true }
);

function pointerDown(clientX, clientY) {
  isPointerDown = true;
  startX = clientX;
  startY = clientY;
}

function pointerUp(clientX, clientY) {
  if (!isPointerDown) return;

  const diffX = clientX - startX;
  const diffY = clientY - startY;
  const threshold = 70;

  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= threshold) {
    if (diffX < 0) {
      goNext();
    } else {
      goPrev();
    }
  }

  isPointerDown = false;
}

if (sliderViewport) {
  sliderViewport.addEventListener("mousedown", (e) => {
    if (window.innerWidth <= 980) return;
    pointerDown(e.clientX, e.clientY);
  });

  sliderViewport.addEventListener("mouseup", (e) => {
    if (window.innerWidth <= 980) return;
    pointerUp(e.clientX, e.clientY);
  });

  sliderViewport.addEventListener("mouseleave", (e) => {
    if (window.innerWidth <= 980) return;
    if (isPointerDown) {
      pointerUp(e.clientX, e.clientY);
    }
  });

  sliderViewport.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches.length) return;
      pointerDown(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  sliderViewport.addEventListener(
    "touchend",
    (e) => {
      if (!e.changedTouches.length) return;
      pointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    },
    { passive: true }
  );
}

window.addEventListener("resize", () => {
  sliderTrack.style.transform = `translateX(-${currentIndex * 100}vw)`;
  updateViewportHeight();
});

function renderApp(appKey) {
  const app = appData[appKey];
  if (!app) return;

  appTitle.textContent = app.title;
  appDesc.textContent = app.desc;
  appImage.src = app.image;
  appImage.alt = app.alt;

  appPoints.innerHTML = "";
  app.points.forEach((point) => {
    const span = document.createElement("span");
    span.textContent = point;
    appPoints.appendChild(span);
  });

  ribbonTabs.forEach((tab) => {
    tab.classList.toggle("active", tab.dataset.app === appKey);
  });

  requestAnimationFrame(updateViewportHeight);
}

ribbonTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    renderApp(tab.dataset.app);
  });
});

const LIKE_STORAGE_KEY = "kaironkit_like_count";
const savedLikeCount = Number(localStorage.getItem(LIKE_STORAGE_KEY) || "0");
let currentLikeCount = Number.isNaN(savedLikeCount) ? 0 : savedLikeCount;

function renderLikeCount() {
  if (likeCount) {
    likeCount.textContent = currentLikeCount.toLocaleString("ko-KR");
  }
}

function createImpact(button, theme = "like") {
  if (!button) return;

  button.classList.remove("is-pop");
  void button.offsetWidth;
  button.classList.add("is-pop");

  button.classList.remove("like-theme", "coffee-theme");
  button.classList.add(theme === "coffee" ? "coffee-theme" : "like-theme");

  const ring = document.createElement("span");
  ring.className = "impact-ring";
  button.appendChild(ring);

  const particleCount = 12;
  for (let i = 0; i < particleCount; i++) {
    const particle = document.createElement("span");
    particle.className = "impact-particle";

    const angle = (Math.PI * 2 * i) / particleCount;
    const distance = 70 + Math.random() * 34;
    const x = Math.cos(angle) * distance;
    const y = Math.sin(angle) * distance;

    particle.style.setProperty("--tx", `${x}px`);
    particle.style.setProperty("--ty", `${y}px`);
    particle.style.width = `${8 + Math.random() * 8}px`;
    particle.style.height = particle.style.width;

    button.appendChild(particle);

    setTimeout(() => {
      particle.remove();
    }, 950);
  }

  setTimeout(() => {
    ring.remove();
    button.classList.remove("is-pop");
  }, 700);
}

if (likeButton) {
  likeButton.addEventListener("click", () => {
    currentLikeCount += 1;
    localStorage.setItem(LIKE_STORAGE_KEY, String(currentLikeCount));
    renderLikeCount();
    createImpact(likeButton, "like");
  });
}

if (coffeeButton) {
  coffeeButton.addEventListener("click", (e) => {
    e.preventDefault();
    createImpact(coffeeButton, "coffee");

    setTimeout(() => {
      alert("커피 후원 링크는 추후 연결 예정입니다.");
    }, 240);
  });
}

if (installBtn) {
  installBtn.addEventListener("click", () => {
    alert("무료 설치 링크는 추후 연결 예정입니다.");
  });
}

window.addEventListener("load", () => {
  renderApp("kmemokit");
  renderLikeCount();
  updateUI();
  sliderTrack.style.transform = "translateX(0vw)";
  updateViewportHeight();
});
