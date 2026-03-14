// ─────────────────────────────────────────────
//  Daily English — app.js
//  501 phrases + Android TTS fix
// ─────────────────────────────────────────────

const CATS = ["Work", "Shopping", "Health", "Social", "Travel"];

let allPhrases = [];
let cat = 0, lang = "both", heard = new Set(), currentBtn = null;
let usedIndexes = {};

// ── Init ──────────────────────────────────────
window.addEventListener("load", async () => {
  showDate();
  updateStreak();
  await loadPhrases();
  setupCats();
  setupLang();
  showSentences();
  initTTS();
});

// ── TTS Init — fix Android WebView ────────────
let ttsReady = false;
let ttsQueue = null;

function initTTS() {
  if (!window.speechSynthesis) return;
  // Android WebView needs a user gesture to unlock TTS
  // Pre-load voices
  const tryLoad = () => {
    const voices = speechSynthesis.getVoices();
    if (voices.length > 0) { ttsReady = true; return; }
    setTimeout(tryLoad, 200);
  };
  speechSynthesis.onvoiceschanged = () => { ttsReady = true; };
  tryLoad();
}

// ── Load phrases.json ─────────────────────────
async function loadPhrases() {
  try {
    const res = await fetch("phrases.json");
    allPhrases = await res.json();
  } catch (e) {
    console.error("Could not load phrases.json", e);
  }
}

// ── Get 3 random phrases ──────────────────────
function getRandomPhrases(catId) {
  const pool = allPhrases.filter(p => p.cat === catId);
  if (!usedIndexes[catId]) usedIndexes[catId] = [];
  if (usedIndexes[catId].length >= pool.length) usedIndexes[catId] = [];
  const available = pool.filter((_, i) => !usedIndexes[catId].includes(i));
  const selected  = available.sort(() => Math.random() - 0.5).slice(0, 3);
  selected.forEach(s => usedIndexes[catId].push(pool.indexOf(s)));
  return selected;
}

// ── Date ──────────────────────────────────────
function showDate() {
  document.getElementById("date-val").textContent =
    new Date().toLocaleDateString("en-US", { weekday:"short", month:"short", day:"numeric" });
}

// ── Streak ────────────────────────────────────
function updateStreak() {
  const today = new Date().toDateString();
  const last  = localStorage.getItem("de_last") || "";
  let streak  = parseInt(localStorage.getItem("de_streak") || "0");
  if (last !== today) {
    const yesterday = new Date(Date.now() - 86400000).toDateString();
    streak = last === yesterday ? streak + 1 : 1;
    localStorage.setItem("de_streak", streak);
    localStorage.setItem("de_last", today);
  }
  document.getElementById("streak").textContent = streak;
}

// ── Categories ────────────────────────────────
function setupCats() {
  document.getElementById("cat-row").addEventListener("click", e => {
    const b = e.target.closest(".cat-btn"); if (!b) return;
    document.querySelectorAll(".cat-btn").forEach(x => x.classList.remove("active"));
    b.classList.add("active");
    cat = parseInt(b.dataset.cat);
    showSentences();
  });
}

// ── Language toggle ───────────────────────────
function setupLang() {
  document.querySelectorAll(".l-pill").forEach(p => p.addEventListener("click", () => {
    document.querySelectorAll(".l-pill").forEach(x => x.classList.remove("active"));
    p.classList.add("active");
    lang = p.dataset.lang;
    showSentences();
  }));
}

// ── Progress ──────────────────────────────────
function updateProg(n) {
  document.getElementById("prog-fill").style.width = Math.round((n / 3) * 100) + "%";
  document.getElementById("prog-txt").textContent  = n + " / 3";
}

// ── Show sentences ────────────────────────────
function showSentences() {
  if (window.speechSynthesis) speechSynthesis.cancel();
  currentBtn = null; heard.clear(); updateProg(0);
  renderSentences(getRandomPhrases(cat));
}

function loadSentences() { showSentences(); }

// ── Render ────────────────────────────────────
function renderSentences(sentences) {
  const content = document.getElementById("content");
  content.innerHTML = "";
  heard.clear(); updateProg(0);

  if (!sentences || sentences.length === 0) {
    content.innerHTML = `<div style="text-align:center;padding:40px;color:#888">No phrases found.</div>`;
    return;
  }

  sentences.forEach((s, i) => {
    const card = document.createElement("div");
    card.className = "s-card";

    const enB = lang !== "fr" ? `
      <div class="s-row">
        <span class="s-en"><span style="font-size:13px">🇬🇧</span> ${esc(s.en)}</span>
        <button class="spk en-s" data-text="${esc(s.en)}" data-lc="en-US">🔊</button>
      </div>` : "";

    const frB = lang !== "en" ? `
      <div class="s-row" style="margin-top:${lang === "both" ? "4px" : "0"}">
        <span class="s-fr"><span style="font-size:13px">🇫🇷</span> ${esc(s.fr)}</span>
        <button class="spk fr-s" data-text="${esc(s.fr)}" data-lc="fr-FR">🔊</button>
      </div>` : "";

    card.innerHTML = `
      <div class="c-tag">PHRASE 0${i + 1}</div>
      ${enB}
      ${lang === "both" ? '<div class="div-line"></div>' : ""}
      ${frB}
      <div class="div-line"></div>
      <div class="s-ar">${esc(s.ar)}</div>`;

    card.querySelectorAll(".spk").forEach(b => {
      b.addEventListener("click", () => {
        speak(b.dataset.text, b, b.dataset.lc, b.classList.contains("en-s") ? "sp-en" : "sp-fr");
        markHeard(i);
      });
    });

    content.appendChild(card);
    setTimeout(() => card.classList.add("vis"), 60 + i * 110);
  });
}

function markHeard(i) {
  if (heard.has(i)) return;
  heard.add(i); updateProg(heard.size);
}

// ── TTS — Android WebView compatible ──────────
function speak(text, btn, lc, cls) {
  if (!window.speechSynthesis) {
    showToast("TTS not supported");
    return;
  }

  speechSynthesis.cancel();

  if (btn.classList.contains(cls)) {
    btn.classList.remove(cls); currentBtn = null; return;
  }

  document.querySelectorAll(".spk").forEach(b => b.classList.remove("sp-en", "sp-fr"));

  // Small delay — fixes Android WebView TTS bug
  setTimeout(() => {
    const u = new SpeechSynthesisUtterance(text);
    u.lang  = lc;
    u.rate  = 0.85;
    u.pitch = 1;
    u.volume = 1;

    // Get best voice
    const voices = speechSynthesis.getVoices();
    const v = voices.find(v => v.lang === lc)
           || voices.find(v => v.lang.startsWith(lc.split("-")[0]))
           || voices[0];
    if (v) u.voice = v;

    btn.classList.add(cls);
    currentBtn = btn;

    u.onstart = () => btn.classList.add(cls);
    u.onend   = () => { btn.classList.remove(cls); currentBtn = null; };
    u.onerror = (e) => {
      btn.classList.remove(cls);
      currentBtn = null;
      // Retry once on error
      if (e.error !== "interrupted") {
        setTimeout(() => speechSynthesis.speak(u), 300);
      }
    };

    speechSynthesis.speak(u);
  }, 100);
}

// ── Toast ─────────────────────────────────────
function showToast(msg) {
  let t = document.getElementById("toast");
  if (!t) {
    t = document.createElement("div");
    t.id = "toast";
    t.style.cssText = "position:fixed;bottom:90px;left:50%;transform:translateX(-50%);background:#333;color:#fff;padding:8px 18px;border-radius:20px;font-size:12px;z-index:99;";
    document.body.appendChild(t);
  }
  t.textContent = msg;
  t.style.opacity = "1";
  setTimeout(() => t.style.opacity = "0", 2500);
}

if (window.speechSynthesis) speechSynthesis.onvoiceschanged = () => { ttsReady = true; };

function esc(s) {
  return String(s).replace(/&/g,"&amp;").replace(/</g,"&lt;").replace(/>/g,"&gt;").replace(/"/g,"&quot;");
}