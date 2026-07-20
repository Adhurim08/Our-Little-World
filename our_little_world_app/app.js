const DEFAULTS = {
  nameA: "Adhurim",
  nameB: "Montse",
  heroQuote: "No matter the distance, I will always find my way back to you.",
  reunionDate: "",
  surpriseDate: "",
  surpriseMessage: "My favourite place is wherever I am with you. Thank you for being my peace, my happiness, and my home. I love you more than distance could ever measure.",
  notes: [
    "Even on the busiest days, there is always a quiet part of my heart thinking about you.",
    "I am proud of the woman you are, grateful for the love you give, and excited for every chapter still ahead of us.",
    "You make ordinary days feel special. I hope today reminds you how deeply loved you are.",
    "Distance may change the view outside our windows, but it never changes where my heart feels at home.",
    "You are my favourite person, my safest place, and the future I keep choosing.",
    "One day, the distance will be only a story we tell about how strongly we loved each other."
  ],
  letters: [
    {
      title: "you miss me",
      body: "Close your eyes for a moment and imagine me holding you.\n\nThe distance is temporary. What we have is real, strong, and worth every difficult day. I miss you too—more than these words can explain."
    },
    {
      title: "you’ve had a hard day",
      body: "You do not have to be strong every second.\n\nTake a breath, drink some water, and be gentle with yourself. I am proud of you—not only when everything goes well, but also when you keep going through the difficult moments."
    },
    {
      title: "you cannot sleep",
      body: "Imagine my hand in yours and my voice telling you that everything can wait until tomorrow.\n\nRest, my love. You are safe, you are loved, and you do not have to solve the whole world tonight."
    },
    {
      title: "you need motivation",
      body: "You are more capable than the doubts in your head.\n\nI have seen your strength, your kindness, and the way you keep moving forward. Start with one small step. I believe in you completely."
    },
    {
      title: "we have argued",
      body: "Even when we disagree, it is still you and me against the problem—not you against me.\n\nI love you more than my pride. Let us slow down, listen properly, and find our way back to each other."
    },
    {
      title: "you want to remember our future",
      body: "I picture quiet mornings, shared meals, trips we have not taken yet, a home filled with laughter, and the comfort of knowing we chose each other again and again.\n\nThat is the future I want with you."
    }
  ],
  memories: [
    { title: "Where our story lives", caption: "Add your favourite photo and a little memory.", image: "" },
    { title: "Our next adventure", caption: "A place waiting for both of us.", image: "" },
    { title: "A reason to smile", caption: "Save the moments you never want to forget.", image: "" }
  ],
  voiceNote: ""
};

const STORAGE_KEY = "ourLittleWorldDataV1";
let state = loadState();
let deferredPrompt = null;

const $ = (selector) => document.querySelector(selector);
const modalBackdrop = $("#modalBackdrop");
const modalTitle = $("#modalTitle");
const modalBody = $("#modalBody");

function loadState() {
  try {
    const saved = JSON.parse(localStorage.getItem(STORAGE_KEY));
    return { ...structuredClone(DEFAULTS), ...saved };
  } catch {
    return structuredClone(DEFAULTS);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
}

function escapeHTML(value = "") {
  return String(value)
    .replaceAll("&", "&amp;")
    .replaceAll("<", "&lt;")
    .replaceAll(">", "&gt;")
    .replaceAll('"', "&quot;")
    .replaceAll("'", "&#039;");
}

function render() {
  $("#nameA").textContent = state.nameA;
  $("#nameB").textContent = state.nameB;
  $("#footerName").textContent = state.nameB;
  $("#noteSignature").textContent = `— ${state.nameA}`;
  $("#heroQuote").textContent = state.heroQuote;

  renderDailyNote();
  renderLetters();
  renderMemories();
  renderCountdown();
  renderSurpriseStatus();

  if (state.voiceNote) {
    $("#voiceNote").src = state.voiceNote;
  }
}

function dayIndex(max) {
  const d = new Date();
  const stamp = Number(`${d.getFullYear()}${String(d.getMonth()+1).padStart(2,"0")}${String(d.getDate()).padStart(2,"0")}`);
  return stamp % max;
}

function renderDailyNote(forceRandom = false) {
  const notes = state.notes.filter(Boolean);
  if (!notes.length) return;
  const index = forceRandom ? Math.floor(Math.random() * notes.length) : dayIndex(notes.length);
  $("#dailyNote").textContent = notes[index];
}

function renderLetters() {
  const grid = $("#letterGrid");
  grid.innerHTML = "";
  state.letters.forEach((letter) => {
    const node = $("#letterTemplate").content.firstElementChild.cloneNode(true);
    node.querySelector(".letter-title").textContent = letter.title;
    node.addEventListener("click", () => openLetter(letter));
    grid.appendChild(node);
  });
}

function openLetter(letter) {
  openModal(`Open when ${letter.title}…`,
    `<div class="modal-copy">${escapeHTML(letter.body)}</div>`);
}

function renderMemories() {
  const strip = $("#memoryStrip");
  strip.innerHTML = "";
  state.memories.forEach((memory, index) => {
    const card = document.createElement("article");
    card.className = "memory-card";
    const image = memory.image
      ? `<img class="memory-photo" src="${memory.image}" alt="${escapeHTML(memory.title)}">`
      : `<div class="memory-photo" role="img" aria-label="Photo placeholder"></div>`;
    card.innerHTML = `${image}<h3>${escapeHTML(memory.title)}</h3><p>${escapeHTML(memory.caption)}</p>`;
    card.addEventListener("click", () => editMemory(index));
    strip.appendChild(card);
  });
}

function renderCountdown() {
  const target = state.reunionDate ? new Date(`${state.reunionDate}T12:00:00`) : null;
  const el = $("#countdownValue");
  if (!target || Number.isNaN(target.getTime())) {
    el.textContent = "Set a date in Customize";
    return;
  }
  const now = new Date();
  const diff = target - now;
  if (diff <= 0) {
    el.textContent = "Today is the day ♥";
    return;
  }
  const totalHours = Math.floor(diff / 36e5);
  const days = Math.floor(totalHours / 24);
  const hours = totalHours % 24;
  el.textContent = `${days} days · ${hours} hours`;
}

function renderSurpriseStatus() {
  if (!state.surpriseDate) {
    $("#surpriseStatus").textContent = "A little message is waiting here.";
    $("#surpriseBtn").textContent = "Unlock";
    return;
  }
  const available = new Date() >= new Date(`${state.surpriseDate}T00:00:00`);
  $("#surpriseStatus").textContent = available
    ? "Your surprise is ready."
    : `Locked until ${new Date(`${state.surpriseDate}T00:00:00`).toLocaleDateString(undefined, { dateStyle: "long" })}.`;
  $("#surpriseBtn").textContent = available ? "Open" : "Locked";
}

function openModal(title, html) {
  modalTitle.textContent = title;
  modalBody.innerHTML = html;
  modalBackdrop.hidden = false;
  document.body.style.overflow = "hidden";
}

function closeModal() {
  modalBackdrop.hidden = true;
  document.body.style.overflow = "";
}

function settingsForm() {
  const notesText = state.notes.join("\n");
  return `
    <form id="settingsForm" class="form-grid">
      <div class="form-row"><label>Your name</label><input name="nameA" value="${escapeHTML(state.nameA)}"></div>
      <div class="form-row"><label>Her name</label><input name="nameB" value="${escapeHTML(state.nameB)}"></div>
      <div class="form-row"><label>Main quote</label><textarea name="heroQuote">${escapeHTML(state.heroQuote)}</textarea></div>
      <div class="form-row"><label>Next reunion / trip date</label><input type="date" name="reunionDate" value="${escapeHTML(state.reunionDate)}"></div>
      <div class="form-row"><label>Secret surprise unlock date</label><input type="date" name="surpriseDate" value="${escapeHTML(state.surpriseDate)}"></div>
      <div class="form-row"><label>Secret surprise message</label><textarea name="surpriseMessage">${escapeHTML(state.surpriseMessage)}</textarea></div>
      <div class="form-row"><label>Daily notes — one per line</label><textarea name="notes" style="min-height:190px">${escapeHTML(notesText)}</textarea></div>
      <button class="primary-btn" type="submit">Save changes</button>
      <button class="secondary-btn" type="button" id="resetBtn">Reset sample content</button>
    </form>`;
}

function openSettings() {
  openModal("Customize your gift", settingsForm());
  $("#settingsForm").addEventListener("submit", (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    state.nameA = String(form.get("nameA") || DEFAULTS.nameA).trim();
    state.nameB = String(form.get("nameB") || DEFAULTS.nameB).trim();
    state.heroQuote = String(form.get("heroQuote") || DEFAULTS.heroQuote).trim();
    state.reunionDate = String(form.get("reunionDate") || "");
    state.surpriseDate = String(form.get("surpriseDate") || "");
    state.surpriseMessage = String(form.get("surpriseMessage") || DEFAULTS.surpriseMessage).trim();
    state.notes = String(form.get("notes") || "")
      .split("\n")
      .map((note) => note.trim())
      .filter(Boolean);
    saveState();
    render();
    closeModal();
  });
  $("#resetBtn").addEventListener("click", () => {
    if (confirm("Reset all text and memories to the original sample?")) {
      state = structuredClone(DEFAULTS);
      saveState();
      render();
      closeModal();
    }
  });
}

function addMemory() {
  openModal("Add a memory", `
    <form id="memoryForm" class="form-grid">
      <div class="form-row"><label>Photo</label><input type="file" name="photo" accept="image/*"></div>
      <div class="form-row"><label>Memory title</label><input name="title" placeholder="Our first trip" required></div>
      <div class="form-row"><label>Little caption</label><textarea name="caption" placeholder="What made this moment special?"></textarea></div>
      <button class="primary-btn" type="submit">Add memory</button>
    </form>`);
  $("#memoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("photo");
    const image = file && file.size ? await compressImage(file) : "";
    state.memories.unshift({
      title: String(form.get("title") || "A beautiful memory"),
      caption: String(form.get("caption") || ""),
      image
    });
    saveState();
    renderMemories();
    closeModal();
  });
}

function editMemory(index) {
  const memory = state.memories[index];
  openModal("Edit memory", `
    <form id="editMemoryForm" class="form-grid">
      <div class="form-row"><label>Replace photo</label><input type="file" name="photo" accept="image/*"></div>
      <div class="form-row"><label>Memory title</label><input name="title" value="${escapeHTML(memory.title)}" required></div>
      <div class="form-row"><label>Little caption</label><textarea name="caption">${escapeHTML(memory.caption)}</textarea></div>
      <button class="primary-btn" type="submit">Save memory</button>
      <button class="secondary-btn" type="button" id="deleteMemoryBtn">Delete memory</button>
    </form>`);
  $("#editMemoryForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const form = new FormData(event.currentTarget);
    const file = form.get("photo");
    memory.title = String(form.get("title") || memory.title);
    memory.caption = String(form.get("caption") || "");
    if (file && file.size) memory.image = await compressImage(file);
    saveState();
    renderMemories();
    closeModal();
  });
  $("#deleteMemoryBtn").addEventListener("click", () => {
    state.memories.splice(index, 1);
    saveState();
    renderMemories();
    closeModal();
  });
}

function fileToDataURL(file) {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onload = () => resolve(reader.result);
    reader.onerror = reject;
    reader.readAsDataURL(file);
  });
}

async function compressImage(file) {
  const source = await fileToDataURL(file);
  const image = await new Promise((resolve, reject) => {
    const img = new Image();
    img.onload = () => resolve(img);
    img.onerror = reject;
    img.src = source;
  });
  const maxSide = 1200;
  const scale = Math.min(1, maxSide / Math.max(image.width, image.height));
  const canvas = document.createElement("canvas");
  canvas.width = Math.max(1, Math.round(image.width * scale));
  canvas.height = Math.max(1, Math.round(image.height * scale));
  const context = canvas.getContext("2d");
  context.drawImage(image, 0, 0, canvas.width, canvas.height);
  return canvas.toDataURL("image/jpeg", 0.78);
}

function installHelp() {
  const standalone = window.matchMedia("(display-mode: standalone)").matches || window.navigator.standalone;
  if (standalone) {
    openModal("Already installed ♥", `<div class="modal-copy">This app is already running from your Home Screen.</div>`);
    return;
  }
  openModal("Add it to iPhone", `
    <ol class="install-steps">
      <li><strong>1.</strong> Open this page in Safari.</li>
      <li><strong>2.</strong> Tap the Share button at the bottom of Safari.</li>
      <li><strong>3.</strong> Choose “Add to Home Screen”.</li>
      <li><strong>4.</strong> Tap “Add”. It will open like a normal app.</li>
    </ol>`);
}

function showLove() {
  if (navigator.vibrate) navigator.vibrate([70, 45, 90]);
  const rain = $("#heartRain");
  for (let i = 0; i < 22; i++) {
    const heart = document.createElement("span");
    heart.className = "falling-heart";
    heart.textContent = i % 4 === 0 ? "♡" : "♥";
    heart.style.left = `${8 + Math.random() * 84}%`;
    heart.style.animationDelay = `${Math.random() * .55}s`;
    heart.style.fontSize = `${16 + Math.random() * 24}px`;
    rain.appendChild(heart);
    setTimeout(() => heart.remove(), 2600);
  }
  const messages = [
    "Love sent across every kilometre ♥",
    `${state.nameA} is thinking about you right now.`,
    "One little heartbeat, delivered.",
    "Consider this a long-distance hug.",
    "You are loved more than you know."
  ];
  $("#loveMessage").textContent = messages[Math.floor(Math.random() * messages.length)];
}

function voiceNoteDialog() {
  const audio = $("#voiceNote");
  if (state.voiceNote) {
    openModal("Your voice note", `
      <div class="form-grid">
        <audio src="${state.voiceNote}" controls style="width:100%"></audio>
        <button class="secondary-btn" id="replaceVoice">Replace voice note</button>
        <button class="secondary-btn" id="removeVoice">Remove voice note</button>
      </div>`);
    $("#replaceVoice").addEventListener("click", chooseVoiceNote);
    $("#removeVoice").addEventListener("click", () => {
      state.voiceNote = "";
      audio.removeAttribute("src");
      saveState();
      closeModal();
    });
  } else {
    chooseVoiceNote();
  }
}

function chooseVoiceNote() {
  openModal("Add a voice note", `
    <form id="voiceForm" class="form-grid">
      <p style="margin-top:0;color:var(--soft-ink)">Record a message in Voice Memos, save it to Files, then choose it here.</p>
      <div class="form-row"><label>Audio file</label><input type="file" name="voice" accept="audio/*" required></div>
      <button class="primary-btn" type="submit">Save voice note</button>
    </form>`);
  $("#voiceForm").addEventListener("submit", async (event) => {
    event.preventDefault();
    const file = new FormData(event.currentTarget).get("voice");
    if (!file || !file.size) return;
    state.voiceNote = await fileToDataURL(file);
    saveState();
    $("#voiceNote").src = state.voiceNote;
    closeModal();
  });
}

function openSurprise() {
  const locked = state.surpriseDate &&
    new Date() < new Date(`${state.surpriseDate}T00:00:00`);
  if (locked) {
    const date = new Date(`${state.surpriseDate}T00:00:00`).toLocaleDateString(undefined, { dateStyle: "long" });
    openModal("Not quite yet…", `<div class="modal-copy">This surprise will open on ${date}. Some things are worth waiting for ♥</div>`);
    return;
  }
  openModal(`For ${state.nameB} ♥`, `<div class="modal-copy">${escapeHTML(state.surpriseMessage)}</div>`);
  showLove();
}

$("#settingsBtn").addEventListener("click", openSettings);
$("#installBtn").addEventListener("click", installHelp);
$("#newNoteBtn").addEventListener("click", () => renderDailyNote(true));
$("#addMemoryBtn").addEventListener("click", addMemory);
$("#loveButton").addEventListener("click", showLove);
$("#voiceBtn").addEventListener("click", voiceNoteDialog);
$("#surpriseBtn").addEventListener("click", openSurprise);
$("#modalClose").addEventListener("click", closeModal);
modalBackdrop.addEventListener("click", (event) => {
  if (event.target === modalBackdrop) closeModal();
});
document.addEventListener("keydown", (event) => {
  if (event.key === "Escape" && !modalBackdrop.hidden) closeModal();
});

window.addEventListener("beforeinstallprompt", (event) => {
  event.preventDefault();
  deferredPrompt = event;
});

if ("serviceWorker" in navigator) {
  window.addEventListener("load", () => navigator.serviceWorker.register("service-worker.js"));
}

render();
setInterval(renderCountdown, 60_000);
