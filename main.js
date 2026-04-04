const likeButton = document.getElementById("likeButton");
const likeButtonText = document.getElementById("likeButtonText");
const installBtn = document.getElementById("installBtn");
const likeBurstLayer = document.getElementById("likeBurstLayer");

const imageCarousel = document.getElementById("imageCarousel");
const imageTrack = document.getElementById("imageTrack");
const imageViewport = document.getElementById("imageViewport");
const imagePrevBtn = document.getElementById("imagePrevBtn");
const imageNextBtn = document.getElementById("imageNextBtn");
const imageDots = document.querySelectorAll(".image-dot");
const imageCaption = document.getElementById("imageCaption");
const slideToggleImpact = document.getElementById("slideToggleImpact");

const appTitle = document.getElementById("appTitle");
const appDesc = document.getElementById("appDesc");

const imageSlides = document.querySelectorAll(".image-slide");
const totalImages = imageSlides.length;

let currentImageIndex = 0;
let autoSlideTimer = null;
let isAutoSlidePaused = false;

let pointerStartX = 0;
let pointerStartY = 0;
let isPointerDown = false;
let shouldIgnoreViewportClick = false;

const appData = {
  title: "K-MemoKit",
  desc:
    "메모, 일정, 즐겨찾기, 계산기를 한곳에 모아 쉽고 빠르게 사용할 수 있는 데스크톱 프로그램입니다. 딱딱한 도구가 아니라, 매일 편하게 꺼내 쓰는 나만의 작은 작업 키트를 목표로 만들었습니다."
};

const slideMeta = [
  null,
  { title: "메모", desc: "빠르고 편하게 기록하는 핵심 기능입니다." },
  { title: "즐겨찾기", desc: "자주 쓰는 링크를 깔끔하게 정리해요." },
  { title: "스케줄", desc: "하루 일정과 메모를 함께 관리할 수 있어요." },
  { title: "계산기", desc: "업무 중 바로 꺼내 쓰는 실용 기능입니다." },
  { title: "캡처", desc: "필요한 순간을 빠르게 기록하고 저장해요." }
];

const COUNTER_NAMESPACE = "kaironkit-home";
const COUNTER_KEY = "support-like-count";
const LIMIT_ONE_LIKE_PER_BROWSER = false;
const LIKE_CLICKED_STORAGE_KEY = "kaironkit_like_clicked";

const COUNTER_HIT_URL =
  `https://api.counterapi.dev/v1/${encodeURIComponent(COUNTER_NAMESPACE)}/${encodeURIComponent(COUNTER_KEY)}/up`;

function renderAppInfo() {
  if (appTitle) appTitle.textContent = appData.title;
  if (appDesc) appDesc.textContent = appData.desc;
}

function clampImageIndex(index) {
  if (index < 0) return totalImages - 1;
  if (index >= totalImages) return 0;
  return index;
}

function updateImageCaption() {
  if (!imageCaption) return;

  const meta = slideMeta[currentImageIndex];

  if (!meta) {
    imageCaption.classList.add("is-hidden");
    imageCaption.setAttribute("aria-hidden", "true");
    imageCaption.innerHTML = "<strong></strong><span></span>";
    return;
  }

  imageCaption.classList.remove("is-hidden");
  imageCaption.setAttribute("aria-hidden", "false");
  imageCaption.innerHTML = `
    <strong>${meta.title}</strong>
    <span>${meta.desc}</span>
  `;
}

function updatePlaybackStateUI() {
  if (!imageCarousel) return;
  imageCarousel.classList.toggle("is-paused", isAutoSlidePaused);
}

function updateImageUI() {
  if (imageTrack) {
    imageTrack.style.transform = `translateX(-${currentImageIndex * 100}%)`;
  }

  imageDots.forEach((dot, i) => {
    dot.classList.toggle("active", i === currentImageIndex);
  });

  updateImageCaption();
  updatePlaybackStateUI();
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

function startAutoSlide() {
  if (isAutoSlidePaused) return;

  stopAutoSlide();
  autoSlideTimer = window.setInterval(() => {
    goNextImage();
  }, 3200);
}

function stopAutoSlide() {
  if (autoSlideTimer) {
    clearInterval(autoSlideTimer);
    autoSlideTimer = null;
  }
}

function restartAutoSlide() {
  if (isAutoSlidePaused) {
    stopAutoSlide();
    return;
  }

  stopAutoSlide();
  startAutoSlide();
}

function showSlideToggleImpact(text) {
  if (!slideToggleImpact) return;

  slideToggleImpact.textContent = text;
  slideToggleImpact.classList.remove("show");
  void slideToggleImpact.offsetWidth;
  slideToggleImpact.classList.add("show");
}

function pauseSlidePlayback() {
  isAutoSlidePaused = true;
  stopAutoSlide();
  updatePlaybackStateUI();
  showSlideToggleImpact("II");
}

function resumeSlidePlayback() {
  isAutoSlidePaused = false;
  startAutoSlide();
  updatePlaybackStateUI();
  showSlideToggleImpact("▶");
}

function toggleSlidePlayback() {
  if (isAutoSlidePaused) {
    resumeSlidePlayback();
  } else {
    pauseSlidePlayback();
  }
}

function suppressViewportClickOnce() {
  shouldIgnoreViewportClick = true;
  window.setTimeout(() => {
    shouldIgnoreViewportClick = false;
  }, 120);
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
  pointerStartX = clientX;
  pointerStartY = clientY;
  stopAutoSlide();
}

function pointerUp(clientX, clientY) {
  if (!isPointerDown) return;

  const diffX = clientX - pointerStartX;
  const diffY = clientY - pointerStartY;
  const threshold = 50;
  const isSwipe =
    Math.abs(diffX) > Math.abs(diffY) && Math.abs(diffX) >= threshold;

  if (isSwipe) {
    if (diffX < 0) {
      goNextImage();
    } else {
      goPrevImage();
    }

    suppressViewportClickOnce();
  }

  isPointerDown = false;
  restartAutoSlide();
}

if (imageViewport) {
  imageViewport.addEventListener("mousedown", (e) => {
    pointerDown(e.clientX, e.clientY);
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
    "touchend",
    (e) => {
      if (!e.changedTouches.length) return;
      pointerUp(e.changedTouches[0].clientX, e.changedTouches[0].clientY);
    },
    { passive: true }
  );

  imageViewport.addEventListener("click", () => {
    if (shouldIgnoreViewportClick) {
      shouldIgnoreViewportClick = false;
      return;
    }

    toggleSlidePlayback();
  });

  imageViewport.addEventListener("keydown", (e) => {
    if (e.key === "Enter" || e.key === " ") {
      e.preventDefault();
      toggleSlidePlayback();
    }
  });
}

function setLikeButtonDisabled(disabled) {
  if (!likeButton) return;
  likeButton.disabled = disabled;
  likeButton.style.opacity = disabled ? "0.86" : "1";
  likeButton.style.cursor = disabled ? "default" : "pointer";
}

function formatCount(value) {
  const num = Number(value);
  if (Number.isNaN(num)) return "0";
  return num.toLocaleString("ko-KR");
}

function renderLikeButtonText(value) {
  if (!likeButtonText) return;
  likeButtonText.textContent = `좋아요 ${formatCount(value)}`;
}

async function fetchJson(url, options = {}) {
  const response = await fetch(url, options);

  if (!response.ok) {
    throw new Error(`HTTP ${response.status}`);
  }

  return await response.json();
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

function createFullscreenLikeImpact() {
  if (!likeBurstLayer) return;

  likeBurstLayer.innerHTML = "";
  likeBurstLayer.classList.remove("is-active");
  void likeBurstLayer.offsetWidth;
  likeBurstLayer.classList.add("is-active");

  const wave = document.createElement("span");
  wave.className = "burst-wave";
  likeBurstLayer.appendChild(wave);

  const glow = document.createElement("span");
  glow.className = "burst-glow";
  likeBurstLayer.appendChild(glow);

  const heartCount = 40;

  for (let i = 0; i < heartCount; i++) {
    const heart = document.createElement("span");
    heart.className = "screen-heart";
    heart.textContent = "♥";

    const angle = (Math.PI * 2 * i) / heartCount;
    const distanceX = 220 + Math.random() * (window.innerWidth * 0.45);
    const distanceY = 180 + Math.random() * (window.innerHeight * 0.42);
    const tx = Math.cos(angle) * distanceX;
    const ty = Math.sin(angle) * distanceY;

    heart.style.setProperty("--tx", `${tx}px`);
    heart.style.setProperty("--ty", `${ty}px`);
    heart.style.left = `${50 + (Math.random() * 12 - 6)}%`;
    heart.style.top = `${50 + (Math.random() * 12 - 6)}%`;
    heart.style.fontSize = `${32 + Math.random() * 68}px`;
    heart.style.animationDelay = `${Math.random() * 0.12}s`;

    likeBurstLayer.appendChild(heart);

    setTimeout(() => {
      heart.remove();
    }, 1800);
  }

  setTimeout(() => {
    likeBurstLayer.classList.remove("is-active");
    wave.remove();
    glow.remove();
  }, 1500);
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

      renderLikeButtonText(value);
      createFullscreenLikeImpact();
      markLikedInThisBrowser();
    } catch (error) {
      console.error("좋아요 증가 실패:", error);
      alert("좋아요 처리 중 오류가 발생했어요. 잠시 후 다시 시도해주세요.");
    }

    syncLikeButtonState();
  });
}

if (installBtn) {
  installBtn.addEventListener("click", () => {
    alert("무료 설치 링크는 추후 연결 예정입니다.");
  });
}

window.addEventListener("load", () => {
  renderAppInfo();
  updateImageUI();
  startAutoSlide();
  syncLikeButtonState();
});
