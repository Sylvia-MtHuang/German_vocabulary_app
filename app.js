let WORDS = [];
const VOCABULARY_URL = "vocabulary.txt";
const IMAGE_MANIFEST_URL = "assets/vocab-images/manifest.json";
const IMAGE_CACHE_KEY = Date.now();
let IMAGE_PATHS = new Map();

const STORAGE_KEY = "nini-gigi-german-memory-v1";
const DEFAULT_STATE = {
  selectedCount: 10,
  streak: 0,
  records: {}
};
const DEFAULT_EASE_FACTOR = 2.5;
const MIN_EASE_FACTOR = 1.3;
const MAX_EASE_FACTOR = 3.2;
const DAY_MS = 24 * 60 * 60 * 1000;
const LEARNING_STEPS_MS = [0, 5 * 60_000, 20 * 60_000];
const MAX_INTERVAL_DAYS = 180;
const SWIPE_THRESHOLD = 84;
const SWIPE_EXIT_MS = 260;
const SWIPE_RATING_DIRECTIONS = {
  0: "left",
  1: "down",
  2: "right"
};
const BUILT_IN_MEMORY_AIDS = {
  abmeldung: [
    ["ab-", "off; away"],
    ["die Meldung", "notice; report"],
    ["merken", "Think of signing yourself 'off the register'."]
  ],
  bestaetigung: [
    ["bestätigen", "to confirm"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "A Bestätigung is the result of confirming something."]
  ],
  aenderung: [
    ["ändern", "to change"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "An Änderung is the result of changing something."]
  ],
  nachricht: [
    ["nach", "after; toward"],
    ["richten", "to direct; arrange"],
    ["merken", "A Nachricht is information directed to someone."]
  ],
  hinweis: [
    ["hin", "there; toward"],
    ["der Weise / weisen", "way; to point"],
    ["merken", "A Hinweis points you toward the right way."]
  ],
  moeglichkeit: [
    ["möglich", "possible"],
    ["-keit", "forms an abstract noun"],
    ["merken", "Möglichkeit is the state or option of something being possible."]
  ],
  entscheidung: [
    ["entscheiden", "to decide"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "An Entscheidung is the result of deciding."]
  ],
  meinung: [
    ["meinen", "to think; mean"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "A Meinung is what someone thinks or means."]
  ],
  erfahrung: [
    ["erfahren", "to experience; find out"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "An Erfahrung is something you have experienced."]
  ],
  uebung: [
    ["üben", "to practice"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "Eine Übung is the act/result of practicing."]
  ],
  pruefung: [
    ["prüfen", "to check; examine"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "Eine Prüfung is a checking or examination."]
  ],
  bedeutung: [
    ["bedeuten", "to mean"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "Bedeutung is what something means."]
  ],
  aufgabe: [
    ["auf-", "up; onto"],
    ["geben", "to give"],
    ["merken", "An Aufgabe is something given to you to do."]
  ],
  anfang: [
    ["an-", "on; at"],
    ["fangen", "to catch; start"],
    ["merken", "Der Anfang is where something starts."]
  ],
  verbindung: [
    ["verbinden", "to connect"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "Eine Verbindung is the result of connecting."]
  ],
  umgebung: [
    ["um", "around"],
    ["geben", "to give"],
    ["merken", "Die Umgebung is what is given/located around you: the surroundings."]
  ],
  kreuzung: [
    ["das Kreuz", "cross"],
    ["-ung", "noun ending"],
    ["merken", "Eine Kreuzung is where roads cross."]
  ],
  ampel: [
    ["Ampel", "traffic light"],
    ["merken", "Historically from a hanging lamp; modern German uses it for traffic lights."]
  ],
  fahrplan: [
    ["fahren", "to travel; drive"],
    ["der Plan", "plan"],
    ["merken", "Der Fahrplan is the travel plan: the timetable."]
  ],
  verspaetung: [
    ["spät", "late"],
    ["ver-", "change/result prefix"],
    ["-ung", "turns a verb/adjective idea into a noun"],
    ["merken", "Verspätung is the state/result of being late."]
  ],
  anschluss: [
    ["an-", "on; to"],
    ["der Schluss / schließen", "close; join"],
    ["merken", "Der Anschluss is the connection that joins onto your route."]
  ],
  kontrolle: [
    ["kontrollieren", "to check; control"],
    ["merken", "Kontrolle is the act of checking or controlling."]
  ],
  erkaeltung: [
    ["kalt", "cold"],
    ["sich erkälten", "to catch a cold"],
    ["-ung", "noun ending"],
    ["merken", "Eine Erkältung is the cold you caught."]
  ],
  rechnung: [
    ["rechnen", "to calculate"],
    ["-ung", "turns a verb into a noun"],
    ["merken", "Eine Rechnung is a calculation on paper: bill or invoice."]
  ],
  betrag: [
    ["tragen", "to carry"],
    ["be-", "prefix"],
    ["merken", "Der Betrag is the amount a bill carries."]
  ],
  ueberweisung: [
    ["über", "over; across"],
    ["weisen", "to direct; transfer"],
    ["-ung", "noun ending"],
    ["merken", "Eine Überweisung directs money across to another account."]
  ],
  bargeld: [
    ["bar", "cash; bare"],
    ["das Geld", "money"],
    ["merken", "Bargeld is money you have directly in cash."]
  ],
  versicherung: [
    ["sicher", "safe; certain"],
    ["versichern", "to insure; assure"],
    ["-ung", "noun ending"],
    ["merken", "Versicherung makes something financially safe."]
  ],
  kuendigung: [
    ["kündigen", "to cancel; give notice"],
    ["-ung", "noun ending"],
    ["merken", "Eine Kündigung is the notice that cancels something."]
  ],
  antrag: [
    ["an-", "to; toward"],
    ["tragen", "to carry"],
    ["merken", "Ein Antrag carries a request toward an office or person."]
  ],
  unterschrift: [
    ["unter", "under"],
    ["die Schrift", "writing"],
    ["merken", "Die Unterschrift is the writing under a document: signature."]
  ],
  bewilligung: [
    ["willigen", "to consent"],
    ["be-", "prefix"],
    ["-ung", "noun ending"],
    ["merken", "Eine Bewilligung is official consent or authorization."]
  ],
  nebenkosten: [
    ["neben", "beside; additional"],
    ["die Kosten", "costs"],
    ["merken", "Nebenkosten are costs beside the main rent."]
  ],
  heizung: [
    ["heizen", "to heat"],
    ["-ung", "noun ending"],
    ["merken", "Die Heizung is the heating system or act of heating."]
  ],
  geschirrspueler: [
    ["das Geschirr", "dishes"],
    ["spülen", "to rinse; wash"],
    ["-er", "machine/person that does something"],
    ["merken", "Der Geschirrspüler is the machine that washes dishes."]
  ],
  einkaufswagen: [
    ["einkaufen", "to shop"],
    ["der Wagen", "cart; vehicle"],
    ["merken", "Der Einkaufswagen is the cart for shopping."]
  ],
  angebot: [
    ["anbieten", "to offer"],
    ["das Gebot", "offer; bid"],
    ["merken", "Ein Angebot is something offered to you."]
  ]
};

let state = loadState();
let session = [];
let currentItem = null;
let locked = false;
let autoAdvanceTimer = null;
let cachedVoices = [];
let voicesReady = false;
let speechRequestId = 0;
let swipeState = null;
let promotePreviewOnNextRender = false;
let missedReviewContext = null;

const setupView = document.querySelector("#setupView");
const studyView = document.querySelector("#studyView");
const countPicker = document.querySelector("#countPicker");
const startButton = document.querySelector("#startButton");
const backButton = document.querySelector("#backButton");
const resetButton = document.querySelector("#resetButton");
const cardStack = document.querySelector(".card-stack");
const nextCardPreview = document.querySelector("#nextCardPreview");
const card = document.querySelector("#card");
const cardContent = document.querySelector("#cardContent");
const actions = document.querySelector("#actions");
const feedback = document.querySelector("#feedback");
const modePill = document.querySelector("#modePill");
const progressBar = document.querySelector("#progressBar");
const progressText = document.querySelector("#progressText");
const knownCount = document.querySelector("#knownCount");
const dueCount = document.querySelector("#dueCount");
const streakCount = document.querySelector("#streakCount");

async function loadVocabulary() {
  startButton.disabled = true;
  startButton.textContent = "Loading vocabulary...";

  try {
    const response = await fetch(`${VOCABULARY_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error(`Could not load ${VOCABULARY_URL}`);

    await loadImageManifest();
    const text = await response.text();
    WORDS = parseVocabulary(text);
    pruneOldRecords();

    if (!WORDS.length) {
      startButton.textContent = "No words found";
      feedback.textContent = "vocabulary.txt is empty or could not be parsed.";
      return;
    }

    startButton.disabled = false;
    startButton.textContent = "Start studying";
    renderStats();
  } catch (error) {
    WORDS = [];
    startButton.textContent = "Vocabulary missing";
    feedback.textContent = "Could not load vocabulary.txt. Put a vocabulary file next to index.html and refresh.";
  }
}

async function loadImageManifest() {
  try {
    const response = await fetch(`${IMAGE_MANIFEST_URL}?t=${Date.now()}`, { cache: "no-store" });
    if (!response.ok) throw new Error("No image manifest");
    const entries = await response.json();
    IMAGE_PATHS = parseImageManifest(Array.isArray(entries) ? entries : []);
  } catch {
    IMAGE_PATHS = new Map();
  }
}

function parseImageManifest(entries) {
  const paths = new Map();
  entries.forEach((entry) => {
    const parsed = parseImageManifestEntry(entry);
    if (!parsed) return;

    const { id, path, extension } = parsed;

    if (extension === "png" || extension === "jpg" || extension === "jpeg" || extension === "webp") {
      paths.set(id, path);
      return;
    }

    if (!paths.has(id)) paths.set(id, path);
  });
  return paths;
}

function parseImageManifestEntry(entry) {
  let id = "";
  let filename = "";

  if (typeof entry === "string") {
    filename = entry.trim();
  } else if (entry && typeof entry === "object") {
    id = String(entry.id || "").trim();
    filename = String(entry.file || entry.path || entry.filename || "").trim();
  }

  if (!filename) return null;

  const basename = filename.split(/[\\/]/).pop();
  const match = basename.match(/^(.+)\.(png|jpe?g|webp|svg)$/i);
  const inferredId = match ? match[1] : basename;
  const extension = match ? match[2].toLowerCase() : "svg";
  const path = filename.startsWith("assets/") ? filename : `assets/vocab-images/${filename}`;

  return {
    id: id || inferredId,
    path,
    extension
  };
}

function parseVocabulary(text) {
  const cleaned = text.replace(/^\uFEFF/, "").trim();
  if (!cleaned) return [];

  const richLines = cleaned
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .filter((line) => line.includes("|") || line.includes("\t"));

  const rawEntries = richLines.length
    ? richLines.map(parseRichVocabularyLine)
    : cleaned.split(/[,;\r\n]+/).map((term) => ({ term: term.trim() }));

  const usedIds = new Map();
  return rawEntries
    .map((entry) => normalizeVocabularyEntry(entry))
    .filter(Boolean)
    .map((word, index) => {
      const baseId = slugify(word.article ? `${word.article}-${word.word}` : word.word) || `word-${index + 1}`;
      const count = usedIds.get(baseId) || 0;
      usedIds.set(baseId, count + 1);
      word.id = count ? `${baseId}-${count + 1}` : baseId;
      return word;
    });
}

function parseRichVocabularyLine(line) {
  const separator = line.includes("|") ? "|" : "\t";
  const [term, meaning = "", example = "", translation = "", memoryAid = ""] = line
    .split(separator)
    .map((part) => part.trim());
  return { term, meaning, example, translation, memoryAid };
}

function normalizeVocabularyEntry(entry) {
  const parsed = parseTerm(entry.term);
  if (!parsed.word) return null;

  const generated = generateExample(parsed);
  const idBase = parsed.article ? `${parsed.article}-${parsed.word}` : parsed.word;
  const imageId = slugify(idBase);
  const customMemoryAid = normalizeMemoryAid(entry.memoryAid);
  return {
    ...parsed,
    pos: parsed.article ? "noun" : "word",
    meaning: entry.meaning || "",
    example: entry.example || generated.example,
    translation: entry.translation || generated.translation,
    memoryAid: customMemoryAid.length ? customMemoryAid : BUILT_IN_MEMORY_AIDS[memoryAidKey(parsed.word)] || [],
    imagePath: IMAGE_PATHS.get(imageId) || ""
  };
}

function normalizeMemoryAid(value) {
  if (!value || !value.trim()) return [];
  return value
    .split(";")
    .map((part) => part.trim())
    .filter(Boolean)
    .map((part) => {
      const [label, meaning = ""] = part.split(/\s*=\s*/);
      return [label.trim(), meaning.trim()];
    });
}

function parseTerm(term) {
  const normalized = term.replace(/\s+/g, " ").trim();
  const match = normalized.match(/^(der|die|das)\s+(.+)$/i);
  if (!match) return { word: normalized };
  return { article: match[1].toLowerCase(), word: match[2].trim() };
}

function generateExample(word) {
  const visibleWord = displayWord(word);
  const templates = [
    {
      example: `Beim Kaffee sagt Nini „${visibleWord}“, und Gigi schreibt das Wort in ihr Reiseheft.`,
      translation: `Over coffee, Nini says "${visibleWord}", and Gigi writes the word in her travel notebook.`
    },
    {
      example: `Auf der Wanderung üben Nini und Gigi das Wort „${visibleWord}“ und machen danach ein Foto.`,
      translation: `On the hike, Nini and Gigi practice the word "${visibleWord}" and then take a photo.`
    },
    {
      example: `Vor dem Skifahren liest Gigi „${visibleWord}“ laut vor, während Nini ruhig atmet.`,
      translation: `Before skiing, Gigi reads "${visibleWord}" aloud while Nini breathes calmly.`
    },
    {
      example: `Im Alltag wiederholen Nini und Gigi „${visibleWord}“ nach einer kurzen Meditation.`,
      translation: `In daily life, Nini and Gigi repeat "${visibleWord}" after a short meditation.`
    }
  ];
  return templates[Math.abs(slugify(visibleWord).length + visibleWord.length) % templates.length];
}

function slugify(value) {
  return normalizeAnswer(value)
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function hasMeaning(word) {
  return Boolean(word.meaning && word.meaning.trim());
}

function hasMemoryAid(word) {
  return Array.isArray(word.memoryAid) && word.memoryAid.length > 0;
}

function pruneOldRecords() {
  const validIds = new Set(WORDS.map((word) => word.id));
  Object.keys(state.records).forEach((id) => {
    if (!validIds.has(id)) delete state.records[id];
  });
  WORDS.forEach((word) => getRecord(word.id));
  saveState();
}

function loadState() {
  try {
    return { ...DEFAULT_STATE, ...JSON.parse(localStorage.getItem(STORAGE_KEY)) };
  } catch {
    return structuredClone(DEFAULT_STATE);
  }
}

function saveState() {
  localStorage.setItem(STORAGE_KEY, JSON.stringify(state));
  renderStats();
}

function getRecord(wordId) {
  if (!state.records[wordId]) {
    state.records[wordId] = {
      seen: false,
      strength: 0,
      dueAt: 0,
      correct: 0,
      wrong: 0,
      easeFactor: DEFAULT_EASE_FACTOR,
      intervalDays: 0,
      reviewCount: 0,
      lapses: 0,
      learningStep: 0,
      lastReviewedAt: 0
    };
  }
  return normalizeRecord(state.records[wordId]);
}

function normalizeRecord(record) {
  record.seen = Boolean(record.seen);
  record.strength = clampInteger(record.strength, 0, 9, 0);
  record.dueAt = clampNumber(record.dueAt, 0, Number.MAX_SAFE_INTEGER, 0);
  record.correct = clampInteger(record.correct, 0, Number.MAX_SAFE_INTEGER, 0);
  record.wrong = clampInteger(record.wrong, 0, Number.MAX_SAFE_INTEGER, 0);
  record.easeFactor = clampNumber(record.easeFactor, MIN_EASE_FACTOR, MAX_EASE_FACTOR, DEFAULT_EASE_FACTOR);
  record.intervalDays = clampNumber(record.intervalDays, 0, MAX_INTERVAL_DAYS, estimateIntervalDays(record));
  record.reviewCount = clampInteger(record.reviewCount, 0, Number.MAX_SAFE_INTEGER, record.correct + record.wrong);
  record.lapses = clampInteger(record.lapses, 0, Number.MAX_SAFE_INTEGER, record.wrong);
  record.learningStep = clampInteger(record.learningStep, 0, LEARNING_STEPS_MS.length, record.intervalDays >= 1 ? LEARNING_STEPS_MS.length : 0);
  record.lastReviewedAt = clampNumber(record.lastReviewedAt, 0, Number.MAX_SAFE_INTEGER, 0);
  return record;
}

function clampNumber(value, min, max, fallback) {
  const number = Number(value);
  if (!Number.isFinite(number)) return fallback;
  return Math.min(max, Math.max(min, number));
}

function clampInteger(value, min, max, fallback) {
  return Math.round(clampNumber(value, min, max, fallback));
}

function estimateIntervalDays(record) {
  if (!record.seen || !record.dueAt) return 0;
  const remainingDays = Math.max(0, Math.round((record.dueAt - Date.now()) / DAY_MS));
  if (remainingDays > 0) return Math.min(MAX_INTERVAL_DAYS, remainingDays);
  return record.strength >= 5 ? 1 : 0;
}

function getGenderClass(word, revealGender = true) {
  if (!revealGender || !word.article) return "neutral";
  if (word.pluralOnly) return "plural";
  if (word.article === "die") return "feminine";
  if (word.article === "der") return "masculine";
  if (word.article === "das") return "neuter";
  return "neutral";
}

function displayWord(word, includeArticle = true) {
  if (word.article && includeArticle) return `${word.article} ${word.word}`;
  return word.word;
}

function isNoun(word) {
  return word.pos === "noun";
}

function normalizeAnswer(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss");
}

function memoryAidKey(value) {
  return value
    .trim()
    .toLowerCase()
    .replaceAll("ä", "ae")
    .replaceAll("ö", "oe")
    .replaceAll("ü", "ue")
    .replaceAll("ß", "ss")
    .replaceAll("盲", "ae")
    .replaceAll("枚", "oe")
    .replaceAll("眉", "ue")
    .replaceAll("脽", "ss")
    .replace(/[^a-z0-9]+/g, "");
}

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickSessionWords(count) {
  const now = Date.now();
  return [...WORDS]
    .map((word) => ({ word, record: getRecord(word.id) }))
    .sort((a, b) => {
      const aDue = isDue(a.record, now) ? 0 : 1;
      const bDue = isDue(b.record, now) ? 0 : 1;
      const aImage = imagePriority(a.word);
      const bImage = imagePriority(b.word);
      return (
        aDue - bDue ||
        memoryPriority(a.record, now) - memoryPriority(b.record, now) ||
        a.record.strength - b.record.strength ||
        aImage - bImage ||
        a.record.dueAt - b.record.dueAt
      );
    })
    .slice(0, count)
    .map(({ word }) => word);
}

function isDue(record, now = Date.now()) {
  return !record.seen || record.dueAt <= now;
}

function memoryPriority(record, now) {
  if (!record.seen) return -10_000;
  const overdueMinutes = Math.max(0, (now - record.dueAt) / 60_000);
  const weakness = (9 - record.strength) * 200;
  const lapseWeight = record.lapses * 120;
  const learningWeight = record.intervalDays < 1 ? -400 : 0;
  return -overdueMinutes - weakness - lapseWeight + learningWeight;
}

function imagePriority(word) {
  if (!word.imagePath) return 2;
  if (word.imagePath.toLowerCase().endsWith(".png")) return 0;
  return 1;
}

function startSession() {
  if (!WORDS.length) {
    feedback.textContent = "No vocabulary has been loaded yet.";
    return;
  }

  const words = pickSessionWords(state.selectedCount);
  session = words.map((word) => ({
    word,
    phase: getRecord(word.id).seen ? "quiz" : "learn",
    quizType: null
  }));
  document.body.classList.add("is-studying");
  setupView.classList.add("hidden");
  studyView.classList.remove("hidden");
  nextCard();
}

function nextCard() {
  clearAutoAdvance();
  stopSpeech();
  locked = false;
  missedReviewContext = null;
  feedback.textContent = "";
  feedback.className = "feedback";

  if (!session.length) {
    renderDone();
    return;
  }

  currentItem = session.shift();
  if (currentItem.phase === "quiz" && !currentItem.quizType) {
    currentItem.quizType = chooseQuizType(currentItem.word);
  }
  renderCurrent();
}

function chooseQuizType(word) {
  const types = [];
  if (hasMeaning(word)) types.push("meaning");
  if (isNoun(word)) types.push("article");
  types.push("fill");
  return types[Math.floor(Math.random() * types.length)];
}

function renderCurrent() {
  const { word, phase, quizType } = currentItem;
  const revealGender = phase === "learn" || quizType !== "article";
  const genderClass = getGenderClass(word, revealGender);
  const shouldPromotePreview = promotePreviewOnNextRender;
  promotePreviewOnNextRender = false;
  resetCardMotion({ immediate: shouldPromotePreview });
  cardStack.className = `card-stack ${genderClass}`;
  card.className = `word-card ${genderClass}${phase === "learn" ? " is-swipeable" : ""}`;
  renderNextCardPreview();
  updateProgress();

  if (phase === "learn") {
    modePill.textContent = "Learn";
    renderLearn(word);
  } else {
    modePill.textContent = "Review";
    if (quizType === "meaning") renderMeaningQuiz(word);
    if (quizType === "article") renderArticleQuiz(word);
    if (quizType === "fill") renderFillQuiz(word);
  }

  if (shouldPromotePreview) {
    stabilizePromotedCard();
  } else {
    animateCardIn();
  }
}

function speakerIcon() {
  return `
    <svg aria-hidden="true" viewBox="0 0 24 24" class="speaker-icon">
      <path d="M4 9v6h4l5 4V5L8 9H4Z"></path>
      <path d="M16 8.5a5 5 0 0 1 0 7"></path>
      <path d="M18.5 6a8.5 8.5 0 0 1 0 12"></path>
    </svg>
  `;
}

function renderLearn(word, options = {}) {
  const autoSpeak = options.autoSpeak !== false;
  const actionsHtml = options.actionsHtml || `
    <button class="answer-button low" type="button" data-rating="0">New to me</button>
    <button class="answer-button mid" type="button" data-rating="1">Almost</button>
    <button class="answer-button high" type="button" data-rating="2">Know it</button>
  `;
  cardContent.innerHTML = `
    ${imageMarkup(word)}
    <div class="word-line">
      <div class="word">${displayWord(word)}</div>
      <button class="speak-button" type="button" aria-label="Play German pronunciation" title="Play German pronunciation">${speakerIcon()}</button>
    </div>
    ${hasMeaning(word) ? `<div class="meaning">${word.meaning}</div>` : ""}
    ${memoryAidMarkup(word)}
    <div class="example">
      <strong>${word.example}</strong>
      <span>${word.translation}</span>
    </div>
  `;
  cardContent.querySelector(".speak-button").addEventListener("click", () => speak(word.word));
  if (autoSpeak) speak(word.word, { repeat: 3, announceErrors: false });
  actions.innerHTML = actionsHtml;
  actions.querySelectorAll("[data-rating]").forEach((button) => {
    button.addEventListener("click", () => rateLearn(Number(button.dataset.rating)));
  });
}

function imageMarkup(word) {
  if (!word.imagePath) return "";
  return `
    <figure class="vocab-figure">
      <img class="vocab-image" src="${imageUrl(word.imagePath)}" alt="Visual cue for ${escapeAttribute(displayWord(word))}" onerror="this.closest('.vocab-figure').remove()">
    </figure>
  `;
}

function imageUrl(path) {
  const separator = path.includes("?") ? "&" : "?";
  return `${escapeAttribute(path)}${separator}v=${IMAGE_CACHE_KEY}`;
}

function memoryAidMarkup(word) {
  if (!hasMemoryAid(word)) return "";
  return `
    <section class="memory-aid" aria-label="Word building memory aid">
      <div class="memory-title">Word building</div>
      <div class="memory-parts">
        ${word.memoryAid.map(memoryAidPartMarkup).join("")}
      </div>
    </section>
  `;
}

function memoryAidPartMarkup(part) {
  const [label, meaning = ""] = part;
  if (/^(merken|memory)$/i.test(label) && meaning) return `<div class="memory-note">${meaning}</div>`;
  if (!meaning) return `<div class="memory-note">${label}</div>`;
  return `
    <div class="memory-part">
      <strong>${label}</strong>
      <span>${meaning}</span>
    </div>
  `;
}

function renderNextCardPreview() {
  const nextItem = session[0];
  if (!nextItem) {
    nextCardPreview.className = "word-card next-card-preview neutral is-empty";
    nextCardPreview.innerHTML = "";
    return;
  }

  if (nextItem.phase === "quiz" && !nextItem.quizType) {
    nextItem.quizType = chooseQuizType(nextItem.word);
  }

  const revealGender = nextItem.phase === "learn" || nextItem.quizType !== "article";
  const genderClass = getGenderClass(nextItem.word, revealGender);
  nextCardPreview.className = `word-card next-card-preview ${genderClass}`;
  nextCardPreview.innerHTML = previewMarkup(nextItem);
}

function previewMarkup(item) {
  const { word, phase, quizType } = item;
  if (phase === "learn") {
    return `
      <div class="card-top">
        <span class="mode-pill">Learn</span>
      </div>
      <div class="card-content preview-content">
        ${imageMarkup(word)}
        <div class="word-line">
          <div class="word">${displayWord(word)}</div>
          <button class="speak-button" type="button" tabindex="-1" aria-hidden="true">${speakerIcon()}</button>
        </div>
        ${hasMeaning(word) ? `<div class="meaning">${word.meaning}</div>` : ""}
        ${memoryAidMarkup(word)}
        <div class="example">
          <strong>${word.example}</strong>
          <span>${word.translation}</span>
        </div>
      </div>
      <div class="feedback"></div>
      <div class="actions preview-actions">
        <button class="answer-button low" type="button" tabindex="-1">New to me</button>
        <button class="answer-button mid" type="button" tabindex="-1">Almost</button>
        <button class="answer-button high" type="button" tabindex="-1">Know it</button>
      </div>
    `;
  }

  if (quizType === "meaning") {
    const choices = getMeaningChoices(item);
    return `
      <div class="card-top">
        <span class="mode-pill">Review</span>
      </div>
      <div class="card-content preview-content">
        <p class="prompt">Choose the correct meaning</p>
        <div class="word-line">
          <div class="quiz-word">${displayWord(word)}</div>
          <button class="speak-button" type="button" tabindex="-1" aria-hidden="true">${speakerIcon()}</button>
        </div>
        <div class="choices">
          ${choices.map((choice) => `<button class="choice-button" type="button" tabindex="-1">${choice}</button>`).join("")}
        </div>
      </div>
      <div class="feedback"></div>
      <div class="actions preview-actions"></div>
    `;
  }

  if (quizType === "article") {
    return `
      <div class="card-top">
        <span class="mode-pill">Review</span>
      </div>
      <div class="card-content preview-content">
        <p class="prompt">Choose the correct article</p>
        <div class="quiz-word">${word.word}</div>
        <div class="choices">
          <button class="choice-button article-choice" type="button" tabindex="-1">der</button>
          <button class="choice-button article-choice" type="button" tabindex="-1">die</button>
          <button class="choice-button article-choice" type="button" tabindex="-1">das</button>
          <button class="choice-button article-choice" type="button" tabindex="-1">plural</button>
        </div>
      </div>
      <div class="feedback"></div>
      <div class="actions preview-actions"></div>
    `;
  }

  const blanked = blankWordInExample(word);
  return `
    <div class="card-top">
      <span class="mode-pill">Review</span>
    </div>
    <div class="card-content preview-content">
      <p class="prompt">Fill in the German word</p>
      <div class="example">
        <strong>${blanked}</strong>
        <span>${word.translation}</span>
      </div>
      <form class="fill-form">
        <input class="fill-input" type="text" tabindex="-1" aria-hidden="true">
        <button class="answer-button primary" type="button" tabindex="-1">Check</button>
      </form>
    </div>
    <div class="feedback"></div>
    <div class="actions preview-actions"></div>
  `;
}

function renderMeaningQuiz(word) {
  const choices = getMeaningChoices(currentItem);
  cardContent.innerHTML = `
    <p class="prompt">Choose the correct meaning</p>
    <div class="word-line">
      <div class="quiz-word">${displayWord(word)}</div>
      <button class="speak-button" type="button" aria-label="Play German pronunciation" title="Play German pronunciation">${speakerIcon()}</button>
    </div>
    <div class="choices">
      ${choices.map((choice) => `<button class="choice-button" type="button" data-answer="${escapeAttribute(choice)}">${choice}</button>`).join("")}
    </div>
  `;
  cardContent.querySelector(".speak-button").addEventListener("click", () => speak(word.word));
  actions.innerHTML = "";
  cardContent.querySelectorAll(".choice-button").forEach((button) => {
    button.addEventListener("click", () => checkQuiz(button.dataset.answer === word.meaning));
  });
}

function getMeaningChoices(item) {
  if (item.choices) return item.choices;
  const { word } = item;
  const distractors = WORDS
    .filter((item) => item.id !== word.id && hasMeaning(item))
    .map((item) => item.meaning);
  item.choices = shuffle([
    word.meaning,
    ...shuffle(distractors).slice(0, 3)
  ]);
  return item.choices;
}

function renderArticleQuiz(word) {
  cardContent.innerHTML = `
    <p class="prompt">Choose the correct article</p>
    <div class="quiz-word">${word.word}</div>
    <div class="choices">
      <button class="choice-button article-choice" type="button" data-article="der">der</button>
      <button class="choice-button article-choice" type="button" data-article="die">die</button>
      <button class="choice-button article-choice" type="button" data-article="das">das</button>
      <button class="choice-button article-choice" type="button" data-article="plural">plural</button>
    </div>
  `;
  actions.innerHTML = "";
  const answer = word.pluralOnly ? "plural" : word.article;
  cardContent.querySelectorAll(".choice-button").forEach((button) => {
    button.addEventListener("click", () => checkQuiz(button.dataset.article === answer));
  });
}

function renderFillQuiz(word) {
  const blanked = blankWordInExample(word);
  cardContent.innerHTML = `
    <p class="prompt">Fill in the German word</p>
    <div class="example">
      <strong>${blanked}</strong>
      <span>${word.translation}</span>
    </div>
    <form class="fill-form">
      <input class="fill-input" type="text" autocomplete="off" spellcheck="false" aria-label="Type the German word">
      <button class="answer-button primary" type="submit">Check</button>
    </form>
  `;
  actions.innerHTML = "";
  const form = cardContent.querySelector(".fill-form");
  const input = cardContent.querySelector(".fill-input");
  input.focus();
  form.addEventListener("submit", (event) => {
    event.preventDefault();
    const answer = normalizeAnswer(input.value);
    const correct = normalizeAnswer(word.word);
    checkQuiz(answer === correct);
  });
}

function blankWordInExample(word) {
  const pattern = new RegExp(escapeRegExp(word.word), "i");
  return word.example.replace(pattern, "_____");
}

function rateLearn(rating, direction = SWIPE_RATING_DIRECTIONS[rating]) {
  if (locked) return;
  locked = true;
  clearAutoAdvance();
  stopSpeech();
  promotePreviewOnNextRender = Boolean(session[0]);
  animateCardExit(direction, () => commitLearnRating(rating));
}

function commitLearnRating(rating) {
  const { word } = currentItem;
  const record = getRecord(word.id);
  applyInitialRating(record, rating);
  saveState();

  if (rating < 2) {
    session.splice(Math.min(2, session.length), 0, { word, phase: "quiz", quizType: chooseQuizType(word) });
  }
  nextCard();
}

function animateCardIn() {
  window.requestAnimationFrame(() => {
    card.classList.add("is-entering");
    setTimeout(() => card.classList.remove("is-entering"), 280);
  });
}

function animateCardExit(direction, onDone) {
  const reducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
  if (reducedMotion || !card.classList.contains("is-swipeable")) {
    resetCardMotion();
    onDone();
    return;
  }

  const exit = exitTransform(direction);
  card.classList.remove("is-dragging");
  card.classList.add("is-animating");
  card.style.transition = `transform ${SWIPE_EXIT_MS}ms cubic-bezier(0.22, 1, 0.36, 1), opacity ${SWIPE_EXIT_MS}ms ease`;
  card.style.transform = `translate3d(${exit.x}px, ${exit.y}px, 0) rotate(${exit.rotation}deg)`;
  card.style.opacity = "0";

  setTimeout(() => {
    resetCardMotion({ immediate: promotePreviewOnNextRender });
    onDone();
  }, SWIPE_EXIT_MS);
}

function exitTransform(direction) {
  const width = window.innerWidth || 390;
  const height = window.innerHeight || 844;
  if (direction === "left") return { x: -width * 1.1, y: 28, rotation: -14 };
  if (direction === "down") return { x: 0, y: height * 0.95, rotation: 0 };
  return { x: width * 1.1, y: 28, rotation: 14 };
}

function resetCardMotion(options = {}) {
  const immediate = Boolean(options.immediate);
  swipeState = null;
  card.classList.remove("is-dragging", "is-animating", "is-entering");
  card.style.transition = immediate ? "none" : "";
  card.style.transform = "";
  card.style.opacity = immediate ? "1" : "";
  card.style.setProperty("--swipe-intensity", "0");
  cardStack.style.setProperty("--swipe-intensity", "0");
  cardStack.classList.remove("is-peeking");
  delete card.dataset.swipeIntent;
}

function stabilizePromotedCard() {
  window.requestAnimationFrame(() => {
    card.style.opacity = "1";
    card.style.transition = "none";
  });
}

function canSwipeCurrentCard() {
  return currentItem && currentItem.phase === "learn" && card.classList.contains("is-swipeable") && !locked;
}

function isInteractiveTarget(target) {
  return Boolean(target.closest("button, input, textarea, select, a, form"));
}

function beginSwipe(event) {
  if (!canSwipeCurrentCard()) return;
  if (event.button !== undefined && event.button !== 0) return;
  if (isInteractiveTarget(event.target)) return;

  swipeState = {
    pointerId: event.pointerId,
    startX: event.clientX,
    startY: event.clientY,
    dx: 0,
    dy: 0
  };
  card.setPointerCapture(event.pointerId);
  card.classList.add("is-dragging");
  card.style.transition = "none";
}

function moveSwipe(event) {
  if (!swipeState || swipeState.pointerId !== event.pointerId) return;
  if (!canSwipeCurrentCard()) return;

  swipeState.dx = event.clientX - swipeState.startX;
  swipeState.dy = event.clientY - swipeState.startY;
  if (Math.abs(swipeState.dx) > 4 || Math.abs(swipeState.dy) > 4) event.preventDefault();

  const rotation = clampNumber(swipeState.dx / 14, -10, 10, 0);
  const intensity = Math.min(1, swipeDistance(swipeState.dx, swipeState.dy) / SWIPE_THRESHOLD);
  const intent = swipeIntent(swipeState.dx, swipeState.dy);

  card.style.transform = `translate3d(${swipeState.dx}px, ${swipeState.dy}px, 0) rotate(${rotation}deg)`;
  card.style.opacity = (1 - intensity * 0.45).toFixed(2);
  card.style.setProperty("--swipe-intensity", intensity.toFixed(2));
  cardStack.style.setProperty("--swipe-intensity", intensity.toFixed(2));
  cardStack.classList.toggle("is-peeking", intensity > 0.08);
  if (intent) {
    card.dataset.swipeIntent = intent;
  } else {
    delete card.dataset.swipeIntent;
  }
}

function endSwipe(event) {
  if (!swipeState || swipeState.pointerId !== event.pointerId) return;
  const rating = ratingFromSwipe(swipeState.dx, swipeState.dy);
  releaseSwipePointer(event);

  if (rating === null) {
    snapCardBack();
    return;
  }

  rateLearn(rating, SWIPE_RATING_DIRECTIONS[rating]);
}

function cancelSwipe(event) {
  if (!swipeState || swipeState.pointerId !== event.pointerId) return;
  releaseSwipePointer(event);
  snapCardBack();
}

function releaseSwipePointer(event) {
  if (card.hasPointerCapture && card.hasPointerCapture(event.pointerId)) {
    card.releasePointerCapture(event.pointerId);
  }
}

function snapCardBack() {
  swipeState = null;
  card.classList.remove("is-dragging");
  card.style.transition = "transform 220ms cubic-bezier(0.22, 1, 0.36, 1), opacity 180ms ease";
  card.style.transform = "";
  card.style.opacity = "";
  card.style.setProperty("--swipe-intensity", "0");
  cardStack.style.setProperty("--swipe-intensity", "0");
  cardStack.classList.remove("is-peeking");
  delete card.dataset.swipeIntent;
  setTimeout(() => {
    if (!swipeState && !locked) card.style.transition = "";
  }, 230);
}

function swipeDistance(dx, dy) {
  const intent = swipeIntent(dx, dy);
  if (intent === "down") return dy;
  if (intent === "left" || intent === "right") return Math.abs(dx);
  return Math.max(Math.abs(dx), Math.abs(dy));
}

function swipeIntent(dx, dy) {
  if (dy > Math.abs(dx) * 0.95 && dy > 18) return "down";
  if (Math.abs(dx) > Math.abs(dy) * 0.85 && Math.abs(dx) > 18) return dx < 0 ? "left" : "right";
  return "";
}

function ratingFromSwipe(dx, dy) {
  const intent = swipeIntent(dx, dy);
  if (!intent || swipeDistance(dx, dy) < SWIPE_THRESHOLD) return null;
  if (intent === "left") return 0;
  if (intent === "down") return 1;
  if (intent === "right") return 2;
  return null;
}

function checkQuiz(isCorrect) {
  if (locked) return;
  locked = true;

  const { word } = currentItem;
  const record = getRecord(word.id);
  record.seen = true;

  if (isCorrect) {
    applyReviewResult(record, "good");
    state.streak += 1;
    feedback.textContent = "Correct";
    feedback.className = "feedback correct";
    actions.innerHTML = "";
    saveState();
    autoAdvanceTimer = setTimeout(nextCard, 1000);
    return;
  } else {
    applyReviewResult(record, "again");
    state.streak = 0;
    feedback.textContent = `Correct answer: ${correctAnswerForCurrentQuiz()}`;
    feedback.className = "feedback wrong";
    session.splice(Math.min(2, session.length), 0, { word, phase: "quiz", quizType: currentItem.quizType });
    missedReviewContext = {
      item: currentItem,
      feedbackText: feedback.textContent
    };
  }

  saveState();
  actions.innerHTML = `
    <button class="answer-button" type="button" id="reviewCardButton">Review card</button>
    <button class="answer-button primary" type="button" id="continueButton">Continue</button>
  `;
  document.querySelector("#reviewCardButton").addEventListener("click", showMissedWordCard);
  document.querySelector("#continueButton").addEventListener("click", nextCard);
}

function showMissedWordCard() {
  if (!missedReviewContext) return;
  clearAutoAdvance();
  stopSpeech();
  const { word } = missedReviewContext.item;
  const genderClass = getGenderClass(word, true);
  resetCardMotion({ immediate: true });
  cardStack.className = `card-stack ${genderClass}`;
  card.className = `word-card ${genderClass} is-reviewing-missed`;
  modePill.textContent = "Learn";
  renderNextCardPreview();
  renderLearn(word, {
    autoSpeak: false,
    actionsHtml: `
      <button class="answer-button" type="button" id="backToQuestionButton">Back to question</button>
      <button class="answer-button primary" type="button" id="continueButton">Continue</button>
    `
  });
  feedback.textContent = "";
  feedback.className = "feedback";
  document.querySelector("#backToQuestionButton").addEventListener("click", restoreMissedQuestion);
  document.querySelector("#continueButton").addEventListener("click", nextCard);
}

function restoreMissedQuestion() {
  if (!missedReviewContext) return;
  currentItem = missedReviewContext.item;
  locked = true;
  renderCurrent();
  locked = true;
  feedback.textContent = missedReviewContext.feedbackText;
  feedback.className = "feedback wrong";
  actions.innerHTML = `
    <button class="answer-button" type="button" id="reviewCardButton">Review card</button>
    <button class="answer-button primary" type="button" id="continueButton">Continue</button>
  `;
  document.querySelector("#reviewCardButton").addEventListener("click", showMissedWordCard);
  document.querySelector("#continueButton").addEventListener("click", nextCard);
}

function correctAnswerForCurrentQuiz() {
  const { word, quizType } = currentItem;
  if (quizType === "meaning") return word.meaning || displayWord(word);
  if (quizType === "article") return word.pluralOnly ? "plural" : word.article;
  return displayWord(word);
}

function clearAutoAdvance() {
  if (!autoAdvanceTimer) return;
  clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = null;
}

function applyInitialRating(record, rating) {
  const now = Date.now();
  record.seen = true;
  record.lastReviewedAt = now;

  if (rating === 0) {
    record.learningStep = 0;
    record.intervalDays = 0;
    record.strength = 0;
    record.dueAt = now;
    return;
  }

  if (rating === 1) {
    record.learningStep = 1;
    record.intervalDays = 0;
    record.strength = Math.max(record.strength, 1);
    record.dueAt = now + LEARNING_STEPS_MS[1];
    return;
  }

  record.learningStep = LEARNING_STEPS_MS.length;
  record.intervalDays = Math.max(record.intervalDays, 1);
  record.strength = Math.max(record.strength, strengthFromInterval(record.intervalDays));
  record.dueAt = now + daysToMs(record.intervalDays);
}

function applyReviewResult(record, result) {
  const now = Date.now();
  record.seen = true;
  record.reviewCount += 1;
  record.lastReviewedAt = now;

  if (result === "again") {
    record.wrong += 1;
    record.lapses += 1;
    record.easeFactor = clampNumber(record.easeFactor - 0.2, MIN_EASE_FACTOR, MAX_EASE_FACTOR, DEFAULT_EASE_FACTOR);
    record.learningStep = 0;
    record.intervalDays = 0;
    record.strength = Math.max(0, record.strength - 2);
    record.dueAt = now;
    return;
  }

  record.correct += 1;

  if (record.intervalDays < 1 || record.learningStep < LEARNING_STEPS_MS.length) {
    record.learningStep += 1;
    if (record.learningStep < LEARNING_STEPS_MS.length) {
      record.intervalDays = 0;
      record.strength = Math.max(record.strength, record.learningStep + 1);
      record.dueAt = now + LEARNING_STEPS_MS[record.learningStep];
      return;
    }

    record.intervalDays = Math.max(record.intervalDays, 1);
    record.strength = Math.max(record.strength, strengthFromInterval(record.intervalDays));
    record.dueAt = now + daysToMs(record.intervalDays);
    return;
  }

  record.easeFactor = updatedEase(record.easeFactor, 4);
  record.intervalDays = nextIntervalDays(record);
  record.strength = Math.max(record.strength, strengthFromInterval(record.intervalDays));
  record.dueAt = now + daysToMs(record.intervalDays);
}

function nextIntervalDays(record) {
  if (record.intervalDays < 1) return 1;
  if (record.intervalDays < 3) return 3;
  if (record.intervalDays < 7) return 7;
  return clampNumber(Math.round(record.intervalDays * record.easeFactor), 1, MAX_INTERVAL_DAYS, 1);
}

function updatedEase(easeFactor, quality) {
  const adjustment = 0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02);
  return clampNumber(easeFactor + adjustment, MIN_EASE_FACTOR, MAX_EASE_FACTOR, DEFAULT_EASE_FACTOR);
}

function strengthFromInterval(intervalDays) {
  if (intervalDays >= 30) return 9;
  if (intervalDays >= 14) return 8;
  if (intervalDays >= 7) return 7;
  if (intervalDays >= 3) return 5;
  if (intervalDays >= 1) return 4;
  return 2;
}

function daysToMs(days) {
  return Math.round(days * DAY_MS);
}

function loadVoices() {
  if (!("speechSynthesis" in window)) return Promise.resolve([]);
  const voices = window.speechSynthesis.getVoices();
  if (voices.length) {
    cachedVoices = voices;
    voicesReady = true;
    return Promise.resolve(voices);
  }

  return new Promise((resolve) => {
    let settled = false;
    const finish = () => {
      if (settled) return;
      settled = true;
      cachedVoices = window.speechSynthesis.getVoices();
      voicesReady = true;
      resolve(cachedVoices);
    };
    window.speechSynthesis.addEventListener("voiceschanged", finish, { once: true });
    setTimeout(finish, 1200);
  });
}

function findGermanVoice(voices) {
  const byLang = (lang) => voices.find((voice) => voice.lang.toLowerCase() === lang);
  return (
    byLang("de-de") ||
    byLang("de_at") ||
    byLang("de-at") ||
    voices.find((voice) => voice.lang.toLowerCase().startsWith("de")) ||
    voices.find((voice) => /german|deutsch/i.test(voice.name))
  );
}

async function speak(text, options = {}) {
  const requestId = ++speechRequestId;
  const repeat = Math.max(1, Math.min(5, Number(options.repeat) || 1));
  const announceErrors = options.announceErrors !== false;

  if (!("speechSynthesis" in window)) {
    if (announceErrors) showVoiceMessage("Speech synthesis is not available in this browser.", "wrong");
    return;
  }

  const voices = voicesReady ? cachedVoices : await loadVoices();
  if (requestId !== speechRequestId) return;
  const germanVoice = findGermanVoice(voices);

  if (!germanVoice && voices.length) {
    if (announceErrors) showVoiceMessage("No German voice was found. Install a German language voice in your OS/browser, then reopen the app.", "wrong");
    return;
  }

  stopSpeech();
  for (let index = 0; index < repeat; index += 1) {
    const utterance = new SpeechSynthesisUtterance(text);
    utterance.lang = "de-DE";
    utterance.rate = 0.86;
    utterance.pitch = 1;
    if (germanVoice) utterance.voice = germanVoice;
    window.speechSynthesis.speak(utterance);
  }
}

function stopSpeech() {
  speechRequestId += 1;
  if ("speechSynthesis" in window) window.speechSynthesis.cancel();
}

function showVoiceMessage(message, tone) {
  feedback.textContent = message;
  feedback.className = `feedback ${tone}`.trim();
}

function renderDone() {
  promotePreviewOnNextRender = false;
  cardStack.className = "card-stack neutral";
  nextCardPreview.className = "word-card next-card-preview neutral is-empty";
  nextCardPreview.innerHTML = "";
  card.className = "word-card neutral";
  modePill.textContent = "Done";
  cardContent.innerHTML = `
    <div class="word-line">
      <div class="word">Sehr gut</div>
    </div>
    <div class="meaning">This session is complete. Words answered incorrectly were returned to the queue and practiced again.</div>
  `;
  feedback.textContent = "";
  actions.innerHTML = `
    <button class="answer-button primary" type="button" id="againButton">Study again</button>
    <button class="answer-button" type="button" id="homeButton">Choose count</button>
  `;
  document.querySelector("#againButton").addEventListener("click", startSession);
  document.querySelector("#homeButton").addEventListener("click", goHome);
  updateProgress(true);
}

function goHome() {
  promotePreviewOnNextRender = false;
  document.body.classList.remove("is-studying");
  studyView.classList.add("hidden");
  setupView.classList.remove("hidden");
  renderStats();
}

function updateProgress(done = false) {
  const total = state.selectedCount;
  const remainingUnique = new Set(session.map((item) => item.word.id)).size + (currentItem && !done ? 1 : 0);
  const completed = done ? total : Math.max(0, total - Math.min(total, remainingUnique));
  const percent = total ? Math.round((completed / total) * 100) : 0;
  progressBar.style.width = `${percent}%`;
  progressText.textContent = `${completed} / ${total}`;
}

function getStats() {
  const now = Date.now();
  const records = WORDS.map((word) => getRecord(word.id));
  return {
    mastered: records.filter((record) => record.seen && record.intervalDays >= 7 && record.strength >= 7).length,
    due: records.filter((record) => record.seen && record.dueAt <= now).length,
    streak: state.streak
  };
}

function renderStats() {
  const stats = getStats();
  knownCount.textContent = stats.mastered;
  dueCount.textContent = stats.due;
  streakCount.textContent = stats.streak;
}

function syncCountPicker() {
  countPicker.querySelectorAll(".count-option").forEach((option) => {
    const selected = Number(option.dataset.count) === state.selectedCount;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-checked", String(selected));
  });
}

function escapeAttribute(value) {
  return value.replaceAll("&", "&amp;").replaceAll('"', "&quot;").replaceAll("<", "&lt;");
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

countPicker.addEventListener("click", (event) => {
  const button = event.target.closest(".count-option");
  if (!button) return;
  state.selectedCount = Number(button.dataset.count);
  countPicker.querySelectorAll(".count-option").forEach((option) => {
    const selected = option === button;
    option.classList.toggle("is-selected", selected);
    option.setAttribute("aria-checked", String(selected));
  });
  saveState();
});

startButton.addEventListener("click", startSession);
backButton.addEventListener("click", goHome);
resetButton.addEventListener("click", () => {
  state = structuredClone(DEFAULT_STATE);
  syncCountPicker();
  saveState();
  goHome();
});
card.addEventListener("pointerdown", beginSwipe);
card.addEventListener("pointermove", moveSwipe);
card.addEventListener("pointerup", endSwipe);
card.addEventListener("pointercancel", cancelSwipe);

loadVoices();
syncCountPicker();
loadVocabulary();
