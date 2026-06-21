// Sheep Night Garden - Web Application Logic

// --- Constants ---
const SHEEP_IMAGES = [
  "./assets/sheep/eat.png",
  "./assets/sheep/happy.png",
  "./assets/sheep/read_books.png",
  "./assets/sheep/sleep_no_blanket.png",
  "./assets/sheep/sleep.png",
];

const WALK_SHEEP = {
  right: "./assets/sheep/walk_right.png",
  left: "./assets/sheep/walk_left.png",
};

const BGM_TRACKS = {
  vibraphone: "audio-vibraphone",
  campfire: "audio-campfire",
  rain: "audio-rain"
};

// --- Application State ---
const state = {
  // Navigation
  historyStack: ["home-screen"],
  
  // Game state
  countingMode: "none", // "none" | "sheep" | "prime"
  count: 0,
  primesCounted: 0,
  isPaused: false,
  countingTimer: null,
  randomSheepImage: SHEEP_IMAGES[0],
  
  // Settings
  nightStart: 19,
  nightEnd: 6,
  currentTrack: "vibraphone", // "vibraphone" | "campfire" | "rain"
  isPlaying: false,
  
  // Stats
  stats: [],
};

// --- DOM Elements ---
const DOM = {
  screens: {
    home: document.getElementById("home-screen"),
    counting: document.getElementById("counting-screen"),
    settings: document.getElementById("settings-screen"),
    info: document.getElementById("info-screen"),
    credits: document.getElementById("credits-screen"),
  },
  
  // Home elements
  garden: document.getElementById("garden"),
  moon: document.getElementById("moon"),
  star1: document.getElementById("star1"),
  star2: document.getElementById("star2"),
  rainLayer: document.getElementById("rain-layer"),
  campfire: document.getElementById("campfire"),
  grassContainer: document.getElementById("grass-container"),
  walkingSheep: document.getElementById("walking-sheep"),
  walkingSheepImg: document.getElementById("walking-sheep-img"),
  
  btnToggleBgm: document.getElementById("btn-toggle-bgm"),
  bgmIcon: document.getElementById("bgm-icon"),
  bgmBtnText: document.getElementById("bgm-btn-text"),
  btnCountSheep: document.getElementById("btn-count-sheep"),
  btnCountPrime: document.getElementById("btn-count-prime"),
  
  statCumulative: document.getElementById("stat-cumulative"),
  statToday: document.getElementById("stat-today"),
  statYesterday: document.getElementById("stat-yesterday"),
  statMaxPrime: document.getElementById("stat-max-prime"),
  
  // Counting elements
  countContainer: document.getElementById("count-container"),
  countDisplaySheep: document.getElementById("count-display-sheep"),
  countDisplayPrime: document.getElementById("count-display-prime"),
  countNumberSheep: document.getElementById("count-number-sheep"),
  countNumberPrime: document.getElementById("count-number-prime"),
  bouncingSheep: document.getElementById("bouncing-sheep"),
  bouncingSheepImg: document.getElementById("bouncing-sheep-img"),
  pauseMenu: document.getElementById("pause-menu"),
  pauseText: document.getElementById("pause-text"),
  btnContinueCounting: document.getElementById("btn-continue-counting"),
  countingHint: document.getElementById("counting-hint"),
  btnCloseCounting: document.getElementById("btn-close-counting"),
  
  // Settings elements
  startHourDisplay: document.getElementById("start-hour-display"),
  endHourDisplay: document.getElementById("end-hour-display"),
  bgmOptions: document.querySelectorAll(".bgm-option"),
  

};

// --- Prime Number Helpers ---
function isPrime(num) {
  if (num <= 1) return false;
  for (let i = 2, s = Math.sqrt(num); i <= s; i++) {
    if (num % i === 0) return false;
  }
  return true;
}

// --- Navigation ---
function navigateTo(screenId) {
  // Hide current active screen
  const currentScreenId = state.historyStack[state.historyStack.length - 1];
  DOM.screens[currentScreenId.replace("-screen", "")].classList.remove("active");
  
  // Push new screen and show it
  state.historyStack.push(screenId);
  DOM.screens[screenId.replace("-screen", "")].classList.add("active");
}

function goBack() {
  if (state.historyStack.length <= 1) return;
  
  // Hide current screen
  const currentScreenId = state.historyStack.pop();
  DOM.screens[currentScreenId.replace("-screen", "")].classList.remove("active");
  
  // Show previous screen
  const previousScreenId = state.historyStack[state.historyStack.length - 1];
  DOM.screens[previousScreenId.replace("-screen", "")].classList.add("active");
  
  // Refresh stats if returning to home
  if (previousScreenId === "home-screen") {
    loadDataAndRefresh();
  }
}

// --- Local Storage Helpers ---
const KEYS = {
  STATS: "sheep_stats",
  START: "night_start",
  END: "night_end",
  BGM_TRACK: "bgm_track",
  ADS_REMOVED: "ads_removed",
};

function getStorageItem(key, defaultValue) {
  const value = localStorage.getItem(key);
  return value !== null ? value : defaultValue;
}

function getStats() {
  try {
    const statsStr = getStorageItem(KEYS.STATS, "[]");
    return JSON.parse(statsStr);
  } catch (e) {
    console.error("Error reading stats from localStorage", e);
    return [];
  }
}

function saveStat(type, value) {
  try {
    const stats = getStats();
    stats.push({ timestamp: Date.now(), type, value });
    localStorage.setItem(KEYS.STATS, JSON.stringify(stats));
  } catch (e) {
    console.error("Error saving stat to localStorage", e);
  }
}

function getNightSettings() {
  const start = parseInt(getStorageItem(KEYS.START, "19"));
  const end = parseInt(getStorageItem(KEYS.END, "6"));
  return { start, end };
}

function saveNightSettings(start, end) {
  localStorage.setItem(KEYS.START, start.toString());
  localStorage.setItem(KEYS.END, end.toString());
}

// --- Time and Sky Background Management ---
function isHourInRange(hour, start, end) {
  if (start === end) return true;
  if (start < end) return hour >= start && hour < end;
  return hour >= start || hour < end;
}

function getSkyMode(nightStart, nightEnd) {
  const hour = new Date().getHours();
  
  if (isHourInRange(hour, nightStart, nightEnd)) return "night";
  
  const eveningStart = (nightStart - 2 + 24) % 24;
  if (isHourInRange(hour, eveningStart, nightStart)) return "evening";
  
  const dawnEnd = (nightEnd + 2) % 24;
  if (isHourInRange(hour, nightEnd, dawnEnd)) return "dawn";
  
  return "day";
}

function updateSkyBackground() {
  if (!DOM.garden) return;

  const { start, end } = getNightSettings();
  state.nightStart = start;
  state.nightEnd = end;
  const skyMode = getSkyMode(state.nightStart, state.nightEnd);
  
  // Remove all sky classes
  DOM.garden.classList.remove("sky-day", "sky-night", "sky-evening", "sky-dawn");
  DOM.garden.classList.add(`sky-${skyMode}`);
  
  if (skyMode === "night") {
    DOM.moon.classList.remove("hidden");
    DOM.star1.classList.remove("hidden");
    DOM.star2.classList.remove("hidden");
  } else {
    DOM.moon.classList.add("hidden");
    DOM.star1.classList.add("hidden");
    DOM.star2.classList.add("hidden");
  }
}

// --- Audio Management ---
function getAudioElement(trackId) {
  return document.getElementById(BGM_TRACKS[trackId]);
}

function toggleBgm() {
  const currentAudio = getAudioElement(state.currentTrack);
  if (!currentAudio) return;

  if (state.isPlaying) {
    currentAudio.pause();
    state.isPlaying = false;
    DOM.bgmBtnText.innerText = "BGMを流す";
    DOM.bgmIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-2"><path d="M11 4.702a.7.7 0 0 0-1.203-.49L5.24 8.72a1 1 0 0 1-.64.28H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1.6a1 1 0 0 1 .64.28l4.557 4.507A.7.7 0 0 0 11 19.298z"/><path d="M15.54 8.46a5 5 0 0 1 0 7.07"/><path d="M19.07 4.93a10 10 0 0 1 0 14.14"/></svg>`;
  } else {
    // Play with catch to handle browser autoplay policies
    currentAudio.play().then(() => {
      state.isPlaying = true;
      DOM.bgmBtnText.innerText = "BGMを止める";
      DOM.bgmIcon.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="20" height="20" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="lucide lucide-volume-x"><path d="M11 4.702a.7.7 0 0 0-1.203-.49L5.24 8.72a1 1 0 0 1-.64.28H3a1 1 0 0 0-1 1v4a1 1 0 0 0 1 1h1.6a1 1 0 0 1 .64.28l4.557 4.507A.7.7 0 0 0 11 19.298z"/><line x1="22" x2="16" y1="9" y2="15"/><line x1="16" x2="22" y1="9" y2="15"/></svg>`;
    }).catch(err => {
      console.warn("Audio autoplay blocked or failed:", err);
      alert("ブラウザのポリシーにより、画面を一度タップしてからBGMを流してください。");
    });
  }
  updateGardenItems();
}

function changeTrack(newTrack) {
  const wasPlaying = state.isPlaying;
  
  // Stop current track
  const currentAudio = getAudioElement(state.currentTrack);
  if (currentAudio) {
    currentAudio.pause();
    currentAudio.currentTime = 0;
  }
  
  state.currentTrack = newTrack;
  localStorage.setItem(KEYS.BGM_TRACK, newTrack);
  
  if (wasPlaying) {
    const nextAudio = getAudioElement(newTrack);
    if (nextAudio) {
      nextAudio.play().catch(e => console.warn(e));
    }
  }
  
  updateGardenItems();
}

function updateGardenItems() {
  if (!DOM.rainLayer || !DOM.campfire || !DOM.grassContainer) return;
  const isPlaying = state.isPlaying;
  const track = state.currentTrack;
  
  // Rain
  if (isPlaying && track === "rain") {
    DOM.rainLayer.classList.remove("hidden");
    startRainEffect();
  } else {
    DOM.rainLayer.classList.add("hidden");
    stopRainEffect();
  }
  
  // Campfire
  if (isPlaying && track === "campfire") {
    DOM.campfire.classList.remove("hidden");
  } else {
    DOM.campfire.classList.add("hidden");
  }
  
  // Grass
  if (isPlaying && track === "vibraphone") {
    DOM.grassContainer.classList.remove("hidden");
  } else {
    DOM.grassContainer.classList.add("hidden");
  }
}

// --- Rain Effect Animation ---
let rainInterval = null;

function startRainEffect() {
  if (rainInterval) return;
  DOM.rainLayer.innerHTML = ""; // Clear existing rain
  
  // Generate 16 rain drops
  for (let i = 0; i < 16; i++) {
    const drop = document.createElement("div");
    drop.classList.add("rain-drop");
    
    const left = (i * 23) % 100;
    const delay = (i * 430) % 5000;
    const duration = 1000 + (i % 5) * 500;
    const height = 14 + (i % 4) * 4;
    const opacity = 0.18 + (i % 4) * 0.06;
    const angle = 8 + (i % 4) * 3;
    
    drop.style.left = `${left}%`;
    drop.style.height = `${height}px`;
    drop.style.opacity = opacity;
    drop.style.animationName = "fall";
    drop.style.animationDuration = `${duration}ms`;
    drop.style.animationDelay = `${delay}ms`;
    drop.style.animationIterationCount = "infinite";
    drop.style.animationTimingFunction = "linear";
    drop.style.transform = `rotate(${angle}deg)`;
    
    DOM.rainLayer.appendChild(drop);
  }
}

function stopRainEffect() {
  DOM.rainLayer.innerHTML = "";
}

// --- Walking Sheep Animation ---
// We mimic the precise coordinates and delays of the original app
let walkTimeoutId = null;

function animateWalk() {
  if (walkTimeoutId) clearTimeout(walkTimeoutId);
  
  const sheep = DOM.walkingSheep;
  const img = DOM.walkingSheepImg;
  
  // 1. Initial State: Stopped at left (-80px)
  sheep.style.transition = "none";
  sheep.style.left = "-80px";
  img.src = WALK_SHEEP.left;
  
  // Step 2: After 2.5s, face right
  walkTimeoutId = setTimeout(() => {
    img.src = WALK_SHEEP.right;
    
    // Step 3: After 0.8s, start walking right (takes 9 seconds)
    walkTimeoutId = setTimeout(() => {
      // Cubic bezier representing Easing.inOut(Easing.sin)
      sheep.style.transition = "left 9000ms cubic-bezier(0.445, 0.05, 0.55, 0.95)";
      sheep.style.left = "50%";
      
      // Step 4: After 9s (walk finished), wait 2.5s and face left
      walkTimeoutId = setTimeout(() => {
        // Face left
        img.src = WALK_SHEEP.left;
        
        // Step 5: After 0.8s, walk left (takes 9 seconds)
        walkTimeoutId = setTimeout(() => {
          sheep.style.transition = "left 9000ms cubic-bezier(0.445, 0.05, 0.55, 0.95)";
          sheep.style.left = "-80px";
          
          // Step 6: When walk left finishes, repeat loop
          walkTimeoutId = setTimeout(() => {
            animateWalk();
          }, 9000);
          
        }, 800);
        
      }, 9000);
      
    }, 800);
    
  }, 2500);
}

// --- Stats Processing (Day Boundary) ---
function getDayStart(timestamp, startHour) {
  const date = new Date(timestamp);
  if (date.getHours() < startHour) {
    date.setDate(date.getDate() - 1);
  }
  date.setHours(startHour, 0, 0, 0);
  return date.getTime();
}

function isSameDay(timestamp, targetTimestamp, startHour) {
  return getDayStart(timestamp, startHour) === getDayStart(targetTimestamp, startHour);
}

function calculateAndDisplayStats() {
  const stats = getStats();
  const { start: nightStart } = getNightSettings();
  
  const now = Date.now();
  const todayStart = getDayStart(now, nightStart);
  const yesterdayStart = todayStart - 24 * 60 * 60 * 1000;
  
  // Cumulative
  const cumulativeSheep = stats
    .filter(s => s.type === "sheep")
    .reduce((sum, s) => sum + s.value, 0);
    
  // Today
  const todaySheep = stats
    .filter(s => s.type === "sheep" && isSameDay(s.timestamp, todayStart, nightStart))
    .reduce((sum, s) => sum + s.value, 0);
    
  // Yesterday
  const yesterdaySheep = stats
    .filter(s => s.type === "sheep" && isSameDay(s.timestamp, yesterdayStart, nightStart))
    .reduce((sum, s) => sum + s.value, 0);
    
  // Max Prime
  const maxPrime = stats.length > 0
    ? Math.max(...stats.filter(s => s.type === "prime").map(s => s.value), 0)
    : 0;
    
  // Update HTML
  DOM.statCumulative.innerText = cumulativeSheep;
  DOM.statToday.innerText = todaySheep;
  DOM.statYesterday.innerText = yesterdaySheep;
  DOM.statMaxPrime.innerText = maxPrime;
}

// --- Counting Game Logic ---
function pickRandomSheep() {
  const randomIndex = Math.floor(Math.random() * SHEEP_IMAGES.length);
  state.randomSheepImage = SHEEP_IMAGES[randomIndex];
}

function startCounting(mode) {
  state.countingMode = mode;
  state.count = 0;
  state.primesCounted = 0;
  state.isPaused = false;
  
  // Set UI state
  DOM.countContainer.classList.add("invisible");
  DOM.pauseMenu.classList.add("hidden");
  DOM.bouncingSheep.classList.add("animating");
  DOM.bouncingSheepImg.src = WALK_SHEEP.right;
  
  if (mode === "sheep") {
    DOM.countDisplaySheep.classList.remove("hidden");
    DOM.countDisplayPrime.classList.add("hidden");
    DOM.countingHint.innerText = "ゆっくり、ひつじを数えましょう...";
  } else {
    DOM.countDisplaySheep.classList.add("hidden");
    DOM.countDisplayPrime.classList.remove("hidden");
    DOM.countingHint.innerText = "ひつじと一緒に、素数のリズムを感じましょう...";
  }
  
  navigateTo("counting-screen");
  
  // Start counting timer (every 2 seconds)
  state.countingTimer = setInterval(tickCount, 2000);
}

function tickCount() {
  if (state.isPaused) return;
  
  DOM.countContainer.classList.remove("invisible");
  
  if (state.countingMode === "sheep") {
    state.count++;
    DOM.countNumberSheep.innerText = state.count;
    
    // Pause every 10 counts
    if (state.count > 0 && state.count % 10 === 0) {
      pauseCounting();
    }
  } else if (state.countingMode === "prime") {
    // Next prime
    let next = state.count === 0 ? 2 : state.count + 1;
    while (!isPrime(next)) {
      next++;
    }
    state.count = next;
    state.primesCounted++;
    DOM.countNumberPrime.innerText = state.count;
    
    // Pause every 10 primes counted
    if (state.primesCounted > 0 && state.primesCounted % 10 === 0) {
      pauseCounting();
    }
  }
}

function pauseCounting() {
  state.isPaused = true;
  pickRandomSheep();
  
  // Update UI for paused state
  DOM.bouncingSheep.classList.remove("animating");
  DOM.bouncingSheepImg.src = state.randomSheepImage;
  
  if (state.countingMode === "prime") {
    DOM.pauseText.innerText = `素数ひつじを ${state.primesCounted} 匹数えました。`;
  } else {
    DOM.pauseText.innerText = `ひつじが ${state.count} 匹になりました。`;
  }
  
  DOM.pauseMenu.classList.remove("hidden");
}

function continueCounting() {
  state.isPaused = false;
  DOM.pauseMenu.classList.add("hidden");
  DOM.bouncingSheep.classList.add("animating");
  DOM.bouncingSheepImg.src = WALK_SHEEP.right;
}

async function closeCounting() {
  clearInterval(state.countingTimer);
  state.countingTimer = null;
  
  if (state.count > 0) {
    saveStat(state.countingMode, state.count);
  }
  
  state.countingMode = "none";
  goBack();
}



// --- Settings Page Logic ---
function updateSettingsUI() {
  const { start, end } = getNightSettings();

  if (DOM.startHourDisplay) {
    DOM.startHourDisplay.innerText = `${start}時`;
  }

  if (DOM.endHourDisplay) {
    DOM.endHourDisplay.innerText = `${end}時`;
  }
  
  // Select active BGM option
  DOM.bgmOptions.forEach(opt => {
    if (opt.getAttribute("data-track") === state.currentTrack) {
      opt.classList.add("selected");
    } else {
      opt.classList.remove("selected");
    }
  });
}

function adjustHour(type, delta) {
  const { start, end } = getNightSettings();
  
  if (type === "start") {
    const newStart = (start + delta + 24) % 24;
    saveNightSettings(newStart, end);
  } else {
    const newEnd = (end + delta + 24) % 24;
    saveNightSettings(start, newEnd);
  }
  
  updateSettingsUI();
  updateSkyBackground();
}

// --- Initialization ---
function loadDataAndRefresh() {
  // Load BGM preference
  state.currentTrack = getStorageItem(KEYS.BGM_TRACK, "vibraphone");
  
  // Load stats & render
  calculateAndDisplayStats();
  
  // Sky state
  updateSkyBackground();
  
  // Settings UI
  updateSettingsUI();
}

function setupEventListeners() {
  // Navigation buttons on Home
  document.getElementById("btn-to-settings").addEventListener("click", () => {
    updateSettingsUI();
    navigateTo("settings-screen");
  });
  document.getElementById("btn-to-info").addEventListener("click", () => {
    navigateTo("info-screen");
  });
  
  // Back buttons on all subpages
  document.querySelectorAll(".btn-back").forEach(btn => {
    btn.addEventListener("click", goBack);
  });
  
  // Settings screen navigation
  document.getElementById("btn-to-credits").addEventListener("click", () => {
    navigateTo("credits-screen");
  });

  
  // BGM action button (Home)
  DOM.btnToggleBgm.addEventListener("click", toggleBgm);
  
  // Game trigger buttons (Home)
  DOM.btnCountSheep.addEventListener("click", () => startCounting("sheep"));
  DOM.btnCountPrime.addEventListener("click", () => startCounting("prime"));
  
  // Counting page actions
  DOM.btnContinueCounting.addEventListener("click", continueCounting);
  DOM.btnCloseCounting.addEventListener("click", closeCounting);
  
  // Settings adjusters
  const btnStartDec = document.getElementById("btn-start-dec");
  const btnStartInc = document.getElementById("btn-start-inc");
  const btnEndDec = document.getElementById("btn-end-dec");
  const btnEndInc = document.getElementById("btn-end-inc");

  if (btnStartDec) {
    btnStartDec.addEventListener("click", () => adjustHour("start", -1));
  }

  if (btnStartInc) {
    btnStartInc.addEventListener("click", () => adjustHour("start", 1));
  }

  if (btnEndDec) {
    btnEndDec.addEventListener("click", () => adjustHour("end", -1));
  }

  if (btnEndInc) {
    btnEndInc.addEventListener("click", () => adjustHour("end", 1));
  }

  // BGM settings options
  DOM.bgmOptions.forEach(opt => {
    opt.addEventListener("click", () => {
      const trackId = opt.getAttribute("data-track");
      changeTrack(trackId);
      updateSettingsUI();
    });
  });
  

}

// Start Application
function init() {
  setupEventListeners();
  loadDataAndRefresh();
  
  // Web無料版ではHOMEの庭演出を表示しないため、要素がある場合だけ動かす
  if (DOM.walkingSheep && DOM.walkingSheepImg) {
    animateWalk();
  }
  if (DOM.garden) {
    setInterval(updateSkyBackground, 60 * 1000);
  }
}

// Run init on load
window.addEventListener("DOMContentLoaded", init);
