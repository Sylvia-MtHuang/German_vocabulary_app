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

let state = loadState();
let session = [];
let currentItem = null;
let locked = false;
let autoAdvanceTimer = null;
let cachedVoices = [];
let voicesReady = false;

const setupView = document.querySelector("#setupView");
const studyView = document.querySelector("#studyView");
const countPicker = document.querySelector("#countPicker");
const startButton = document.querySelector("#startButton");
const backButton = document.querySelector("#backButton");
const resetButton = document.querySelector("#resetButton");
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
  const [term, meaning = "", example = "", translation = ""] = line
    .split(separator)
    .map((part) => part.trim());
  return { term, meaning, example, translation };
}

function normalizeVocabularyEntry(entry) {
  const parsed = parseTerm(entry.term);
  if (!parsed.word) return null;

  const generated = generateExample(parsed);
  const idBase = parsed.article ? `${parsed.article}-${parsed.word}` : parsed.word;
  const imageId = slugify(idBase);
  return {
    ...parsed,
    pos: parsed.article ? "noun" : "word",
    meaning: entry.meaning || "",
    example: entry.example || generated.example,
    translation: entry.translation || generated.translation,
    imagePath: IMAGE_PATHS.get(imageId) || ""
  };
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

function pruneOldRecords() {
  const validIds = new Set(WORDS.map((word) => word.id));
  Object.keys(state.records).forEach((id) => {
    if (!validIds.has(id)) delete state.records[id];
  });
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
      wrong: 0
    };
  }
  return state.records[wordId];
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

function shuffle(items) {
  return [...items].sort(() => Math.random() - 0.5);
}

function pickSessionWords(count) {
  const now = Date.now();
  return [...WORDS]
    .map((word) => ({ word, record: getRecord(word.id) }))
    .sort((a, b) => {
      const aDue = a.record.dueAt <= now ? 0 : 1;
      const bDue = b.record.dueAt <= now ? 0 : 1;
      const aImage = imagePriority(a.word);
      const bImage = imagePriority(b.word);
      return aDue - bDue || a.record.strength - b.record.strength || aImage - bImage || a.record.dueAt - b.record.dueAt;
    })
    .slice(0, count)
    .map(({ word }) => word);
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
  locked = false;
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
  card.className = `word-card ${getGenderClass(word, revealGender)}`;
  updateProgress();

  if (phase === "learn") {
    modePill.textContent = "Learn";
    renderLearn(word);
    return;
  }

  modePill.textContent = "Review";
  if (quizType === "meaning") renderMeaningQuiz(word);
  if (quizType === "article") renderArticleQuiz(word);
  if (quizType === "fill") renderFillQuiz(word);
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

function renderLearn(word) {
  cardContent.innerHTML = `
    ${imageMarkup(word)}
    <div class="word-line">
      <div class="word">${displayWord(word)}</div>
      <button class="speak-button" type="button" aria-label="Play German pronunciation" title="Play German pronunciation">${speakerIcon()}</button>
    </div>
    ${hasMeaning(word) ? `<div class="meaning">${word.meaning}</div>` : ""}
    <div class="example">
      <strong>${word.example}</strong>
      <span>${word.translation}</span>
    </div>
  `;
  cardContent.querySelector(".speak-button").addEventListener("click", () => speak(word.word));
  actions.innerHTML = `
    <button class="answer-button low" type="button" data-rating="0">New to me</button>
    <button class="answer-button mid" type="button" data-rating="1">Almost</button>
    <button class="answer-button high" type="button" data-rating="2">Know it</button>
  `;
  actions.querySelectorAll("button").forEach((button) => {
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

function renderMeaningQuiz(word) {
  const distractors = WORDS
    .filter((item) => item.id !== word.id && hasMeaning(item))
    .map((item) => item.meaning);
  const choices = shuffle([
    word.meaning,
    ...shuffle(distractors).slice(0, 3)
  ]);
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

function rateLearn(rating) {
  const { word } = currentItem;
  const record = getRecord(word.id);
  record.seen = true;
  record.strength = Math.max(record.strength, rating);
  record.dueAt = Date.now() + [0, 90_000, 8 * 60_000][rating];
  saveState();

  if (rating < 2) {
    session.splice(Math.min(2, session.length), 0, { word, phase: "quiz", quizType: chooseQuizType(word) });
  }
  nextCard();
}

function checkQuiz(isCorrect) {
  if (locked) return;
  locked = true;

  const { word } = currentItem;
  const record = getRecord(word.id);
  record.seen = true;

  if (isCorrect) {
    record.correct += 1;
    record.strength = Math.min(7, record.strength + 1);
    record.dueAt = Date.now() + intervalFor(record.strength);
    state.streak += 1;
    feedback.textContent = "Correct";
    feedback.className = "feedback correct";
    actions.innerHTML = "";
    saveState();
    autoAdvanceTimer = setTimeout(nextCard, 1000);
    return;
  } else {
    record.wrong += 1;
    record.strength = Math.max(0, record.strength - 1);
    record.dueAt = Date.now();
    state.streak = 0;
    feedback.textContent = `Correct answer: ${displayWord(word)}`;
    feedback.className = "feedback wrong";
    session.splice(Math.min(2, session.length), 0, { word, phase: "quiz", quizType: currentItem.quizType });
  }

  saveState();
  actions.innerHTML = `<button class="answer-button primary" type="button">Continue</button>`;
  actions.querySelector("button").addEventListener("click", nextCard);
}

function clearAutoAdvance() {
  if (!autoAdvanceTimer) return;
  clearTimeout(autoAdvanceTimer);
  autoAdvanceTimer = null;
}

function intervalFor(strength) {
  const minutes = [0, 2, 10, 60, 12 * 60, 24 * 60, 3 * 24 * 60, 7 * 24 * 60];
  return minutes[strength] * 60_000;
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

async function speak(text) {
  if (!("speechSynthesis" in window)) {
    showVoiceMessage("Speech synthesis is not available in this browser.", "wrong");
    return;
  }

  const voices = voicesReady ? cachedVoices : await loadVoices();
  const germanVoice = findGermanVoice(voices);

  if (!germanVoice && voices.length) {
    showVoiceMessage("No German voice was found. Install a German language voice in your OS/browser, then reopen the app.", "wrong");
    return;
  }

  window.speechSynthesis.cancel();
  const utterance = new SpeechSynthesisUtterance(text);
  utterance.lang = "de-DE";
  utterance.rate = 0.86;
  utterance.pitch = 1;
  if (germanVoice) utterance.voice = germanVoice;
  window.speechSynthesis.speak(utterance);
}

function showVoiceMessage(message, tone) {
  feedback.textContent = message;
  feedback.className = `feedback ${tone}`.trim();
}

function renderDone() {
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
    mastered: records.filter((record) => record.seen && record.strength >= 4).length,
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

loadVoices();
syncCountPicker();
loadVocabulary();
