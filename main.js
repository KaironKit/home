const navChips = document.querySelectorAll(".nav-chip");
const brandHome = document.getElementById("brandHome");
const supportBtn = document.getElementById("supportBtn");

const likeButton = document.getElementById("likeButton");
const likeCount = document.getElementById("likeCount");
const coffeeButton = document.getElementById("coffeeButton");
const installBtn = document.getElementById("installBtn");

const homeSection = document.getElementById("home");
const supportSection = document.getElementById("support");

const imageTrack = document.getElementById("imageTrack");
const imageViewport = document.getElementById("imageViewport");
const imagePrevBtn = document.getElementById("imagePrevBtn");
const imageNextBtn = document.getElementById("imageNextBtn");
const ribbonTabs = document.querySelectorAll(".ribbon-tab");
const imageDots = document.querySelectorAll(".image-dot");

const appTitle = document.getElementById("appTitle");
const appDesc = document.getElementById("appDesc");
const appPoints = document.getElementById("appPoints");

const imageSlides = document.querySelectorAll(".image-slide");
const totalImages = imageSlides.length;

let currentImageIndex = 0;
let autoSlideTimer = null;

let pointerStartX = 0;
let pointerStartY = 0;
let isPointerDown = false;
let isDraggingImage = false;

const appData = {
  title: "K-MemoKit",
  desc:
    "메모, 일정, 즐겨찾기, 계산기를 한곳에 모아 쉽고 빠르게 사용할 수 있는 데스크톱 프로그램입니다. 딱딱한 도구가 아니라, 매일 편하게 꺼내 쓰는 나만의 작은 작업 키트를 목표로 만들었습니다.",
  points: ["Memo", "Schedule", "Bookmarks", "Calculator"]
};

const COUNTER_NAMESPACE = "kaironkit-home";
const COUNTER_KEY = "support-like-count";
const LIMIT_ONE_LIKE_PER_BROWSER = false;
const LIKE_CLICKED_STORAGE_KEY = "kaironkit_like_clicked";

const COUNTER_GET_URL = `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}/${encodeURIComponent(COUNTER_KEY)}`;
const COUNTER_HIT_URL = `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}/${encodeURIComponent(COUNTER_KEY)}/up`;

function renderAppInfo() {
  if (appTitle) appTitle.textContent = appData.title;
  if (appDesc) appDesc.textContent = appData.desc;

  if (appPoints) {
    appPoints.innerHTML = "";
    appData.points.forEach((point) => {
      const span = document.createElement("span");
      span.textContent = point;
      appPoints.appendChild(span);
    });
  }
}

function scrollToSection(section) {
  if (!section) return;

  section.scrollIntoView({
    behavior: "smooth",
    block: "start"
  });
}

function setActiveNavBySection() {
  const sections = [
    { key: "home", el: homeSection },
    { key: "support", el: supportSection }
  ];

  const headerOffset = 140;
  let activeKey = "home";

  sections.forEach((section) => {
    if (!section.el) return;
    const top = section.el.getBoundingClientRect().top;
    if (top - headerOffset <= 0) {
      activeKey = section.key;
    }
  });

  navChips.forEach((chip) => {
    chip.classList.toggle("active", chip.dataset.target === activeKey);
  });
}

navChips.forEach((chip) => {
  chip.addEventListener("click", () => {
    const targetId = chip.dataset.target;
    const target = document.getElementById(targetId);
    scrollToSection(target);
  });
});

if (brandHome) {
  brandHome.addEventListener("click", (e) => {
    e.preventDefault();
    scrollToSection(homeSection);
  });
}

if (supportBtn) {
  supportBtn.addEventListener("click", () => {
    scrollToSection(supportSection);
  });
}

function clampImageIndex(index) {
  if (index < 0) return totalImages - 1;
  if (index >= totalImages) return 0;
  return index;
}

function updateImageUI() {
  if (imageTrack) {
    imageTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
  }

  ribbonTabs.forEach((tab, i) => {
    tab.classList.toggle("active", i === currentImageIndex);
  });

  imageDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentImageIndex);
  });
}

function goToImage(index) {
  currentImageIndex = clampImageIndex(index);
  updateImageUI();
}

function goNextImage() {
  goToImage(currentImageIndex + 1);
}

function goPrevImage() {
  goToImage(currentImageIndex - 1);
}

function restartAutoSlide() {
  stopAutoSlide();
  startAutoSlide();
}

function startAutoSlide() {
  autoSlideTimer = window.setInterval(() => {
    goNextImage();
  }, 3000);
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
}

if (imagePrevBtn) {
  imagePrevBtn.addEventListener("click", () => {
    goPrevImage();
    restartAutoSlide();
  });
}

if (imageNextBtn) {
  imageNextBtn.addEventListener("click", () => {
    goNextImage();
    restartAutoSlide();
  });
}

ribbonTabs.forEach((tab) => {
  tab.addEventListener("click", () => {
    const index = Number(tab.dataset.imageIndex);
    if (Number.isNaN(index)) return;
    goToImage(index);
    restartAutoSlide();
  });
});

imageDots.forEach((dot) => {
  dot.addEventListener("click", () => {
    const index = Number(dot.dataset.imageIndex);
    if (Number.isNaN(index)) return;
    goToImage(index);
    restartAutoSlide();
  });
});

function pointerDown(clientX, clientY) {
  isPointerDown = true;
  isDraggingImage = false;
  pointerStartX = clientX;
  pointerStartY = clientY;
  stopAutoSlide();
}

function pointerMove(clientX, clientY) {
  if (!isPointerDown) return;

  const diffX = clientX - pointerStartX;
  const diffY = clientY - pointerStartY;

  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) > 8) {
    isDraggingImage = true;
  }
}

function pointerUp(clientX, clientY) {
  if (!isPointerDown) return;

  const diffX = clientX - pointerStartX;
  const diffY = clientY - pointerStartY;
  const threshold = 50;

  if (Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= threshold) {
    if (diffX < 0) {
      goNextImage();
    } else {
      goPrevImage();
    }
  }

  isPointerDown = false;
  isDraggingImage = false;
  restartAutoSlide();
}

if (imageViewport) {
  imageViewport.addEventListener("mousedown", (e) => {
    pointerDown(e.clientX, e.clientY);
  });

  imageViewport.addEventListener("mousemove", (e) => {
    pointerMove(e.clientX, e.clientY);
  });

  imageViewport.addEventListener("mouseup", (e) => {
    pointerUp(e.clientX, e.clientY);
  });

  imageViewport.addEventListener("mouseleave", (e) => {
    if (!isPointerDown) return;
    pointerUp(e.clientX, e.clientY);
  });

  imageViewport.addEventListener(
    "touchstart",
    (e) => {
      if (!e.touches.length) return;
      pointerDown(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  imageViewport.addEventListener(
    "touchmove",
    (e) => {
      if (!e.touches.length) return;
      pointerMove(e.touches[0].clientX, e.touches[0].clientY);
    },
    { passive: true }
  );

  imageViewport.addEventListener(
    "touchend",
    (e) => {
      if (!e.changedTouches.length) return;
      pointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    },
    { passive: true }
  );
}

function setLikeButtonDisabled(disabled) {
  if (!likeButton) return;

  likeButton.disabled = disabled;
  likeButton.style.opacity = disabled ? "0.7" : "1";
  likeButton.style.cursor = disabled ? "default" : "pointer";
}

function formatCount(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("ko-KR");
}

function renderLikeCount(value) {
  if (!likeCount) return;
  likeCount.textContent = formatCount(value);
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
}

async function loadGlobalLikeCount() {
  try {
    const data = await fetchJson(COUNTER_GET_URL, {
      method: "GET",
      cache: "no-store"
    });

    const value = data?.data?.up_count ?? data?.value ?? data?.count ?? 0;
    renderLikeCount(value);
  } catch (error) {
    console.error("좋아요 수 조회 실패:", error);
    renderLikeCount(0);
  }
}

function hasAlreadyLikedInThisBrowser() {
  if (!LIMIT_ONE_LIKE_PER_BROWSER) return false;
  return localStorage.getItem(LIKE_CLICKED_STORAGE_KEY) === "1";
}

function markLikedInThisBrowser() {
  if (!LIMIT_ONE_LIKE_PER_BROWSER) return;
  localStorage.setItem(LIKE_CLICKED_STORAGE_KEY, "1");
}

function syncLikeButtonState() {
  if (!LIMIT_ONE_LIKE_PER_BROWSER) {
    setLikeButtonDisabled(false);
    return;
  }

  setLikeButtonDisabled(hasAlreadyLikedInThisBrowser());
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
  likeButton.addEventListener("click", async () => {
    if (hasAlreadyLikedInThisBrowser()) {
      alert("이 브라우저에서는 이미 좋아요를 눌렀어요.");
      return;
    }

    setLikeButtonDisabled(true);

    try {
      const data = await fetchJson(COUNTER_HIT_URL, {
        method: "GET",
        cache: "no-store"
      });

      const value = data?.data?.up_count ?? data?.value ?? data?.count ?? 0;
      renderLikeCount(value);
      markLikedInThisBrowser();
      createImpact(likeButton, "like");
    } catch (error) {
      console.error("좋아요 증가 실패:", error);
      alert("좋아요 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
      setLikeButtonDisabled(false);
      return;
    }

    syncLikeButtonState();
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

window.addEventListener("scroll", setActiveNavBySection);

window.addEventListener("load", async () => {
  renderAppInfo();
  updateImageUI();
  setActiveNavBySection();
  startAutoSlide();

  syncLikeButtonState();
  await loadGlobalLikeCount();
});
