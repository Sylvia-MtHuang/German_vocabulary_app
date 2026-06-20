const WORDS = [
  { id: "kaffee", word: "Kaffee", article: "der", plural: "Kaffees", pos: "noun", meaning: "coffee", example: "Nini bestellt im Bahnhofscafé einen Kaffee, während Gigi die Zugtickets prüft.", translation: "Nini orders a coffee at the station café while Gigi checks the train tickets." },
  { id: "reise", word: "Reise", article: "die", plural: "Reisen", pos: "noun", meaning: "trip; journey", example: "Gigi plant eine Reise nach Wien, und Nini sucht kleine Cafés in der Altstadt.", translation: "Gigi plans a trip to Vienna, and Nini looks for small cafés in the old town." },
  { id: "foto", word: "Foto", article: "das", plural: "Fotos", pos: "noun", meaning: "photo", example: "Nini macht ein Foto von Gigi, als die Sonne über dem Wanderweg aufgeht.", translation: "Nini takes a photo of Gigi as the sun rises over the hiking trail." },
  { id: "berge", word: "Berge", article: "die", pluralOnly: true, pos: "noun", meaning: "mountains", example: "Die Berge leuchten, während Nini und Gigi kurz stillstehen und auf den Schnee schauen.", translation: "The mountains glow while Nini and Gigi pause and look at the snow." },
  { id: "rucksack", word: "Rucksack", article: "der", plural: "Rucksäcke", pos: "noun", meaning: "backpack", example: "Gigi packt den Rucksack mit Brot, Kamera und einer kleinen Thermoskanne Kaffee.", translation: "Gigi packs the backpack with bread, a camera, and a small thermos of coffee." },
  { id: "kamera", word: "Kamera", article: "die", plural: "Kameras", pos: "noun", meaning: "camera", example: "Nini legt die Kamera auf den Tisch, bevor sie mit Gigi meditiert.", translation: "Nini puts the camera on the table before meditating with Gigi." },
  { id: "hotel", word: "Hotel", article: "das", plural: "Hotels", pos: "noun", meaning: "hotel", example: "Nach der langen Reise finden Nini und Gigi ein ruhiges Hotel am See.", translation: "After the long trip, Nini and Gigi find a quiet hotel by the lake." },
  { id: "piste", word: "Piste", article: "die", plural: "Pisten", pos: "noun", meaning: "ski slope", example: "Auf der blauen Piste wartet Gigi auf Nini und winkt mit dem Skistock.", translation: "On the blue ski slope, Gigi waits for Nini and waves with a ski pole." },
  { id: "zug", word: "Zug", article: "der", plural: "Züge", pos: "noun", meaning: "train", example: "Im Zug teilen Nini und Gigi Croissants und sprechen über die nächste Wanderung.", translation: "On the train, Nini and Gigi share croissants and talk about the next hike." },
  { id: "ticket", word: "Ticket", article: "das", plural: "Tickets", pos: "noun", meaning: "ticket", example: "Gigi zeigt das Ticket am Eingang, während Nini den Kaffee festhält.", translation: "Gigi shows the ticket at the entrance while Nini holds the coffee." },
  { id: "huette", word: "Hütte", article: "die", plural: "Hütten", pos: "noun", meaning: "mountain hut", example: "In der Hütte trocknen Nini und Gigi ihre Jacken nach der Schneewanderung.", translation: "In the hut, Nini and Gigi dry their jackets after the snowy hike." },
  { id: "schnee", word: "Schnee", article: "der", plural: null, pos: "noun", meaning: "snow", example: "Der Schnee knirscht leise, als Nini und Gigi früh zur Skipiste gehen.", translation: "The snow crunches softly as Nini and Gigi walk early to the ski slope." },
  { id: "fenster", word: "Fenster", article: "das", plural: "Fenster", pos: "noun", meaning: "window", example: "Am Fenster trinkt Nini Kaffee, und Gigi sortiert die Fotos der Reise.", translation: "At the window, Nini drinks coffee and Gigi sorts the photos from the trip." },
  { id: "sonne", word: "Sonne", article: "die", plural: "Sonnen", pos: "noun", meaning: "sun", example: "Die Sonne scheint auf Ninis Gesicht, während Gigi den Wanderweg fotografiert.", translation: "The sun shines on Nini's face while Gigi photographs the hiking trail." },
  { id: "see", word: "See", article: "der", plural: "Seen", pos: "noun", meaning: "lake", example: "Am See setzen sich Nini und Gigi ins Gras und hören dem Wind zu.", translation: "At the lake, Nini and Gigi sit in the grass and listen to the wind." },
  { id: "tasche", word: "Tasche", article: "die", plural: "Taschen", pos: "noun", meaning: "bag", example: "Nini legt die Sonnenbrille in die Tasche, bevor Gigi den Stadtplan öffnet.", translation: "Nini puts the sunglasses in the bag before Gigi opens the city map." },
  { id: "brot", word: "Brot", article: "das", plural: "Brote", pos: "noun", meaning: "bread", example: "Beim Picknick teilt Gigi das Brot, und Nini gießt Kaffee in zwei Tassen.", translation: "At the picnic, Gigi shares the bread and Nini pours coffee into two cups." },
  { id: "stadt", word: "Stadt", article: "die", plural: "Städte", pos: "noun", meaning: "city", example: "In der Stadt suchen Nini und Gigi ein Museum und ein stilles Café.", translation: "In the city, Nini and Gigi look for a museum and a quiet café." },
  { id: "morgen", word: "Morgen", article: "der", plural: "Morgen", pos: "noun", meaning: "morning", example: "Am Morgen meditiert Nini, während Gigi frischen Kaffee kocht.", translation: "In the morning, Nini meditates while Gigi makes fresh coffee." },
  { id: "abend", word: "Abend", article: "der", plural: "Abende", pos: "noun", meaning: "evening", example: "Am Abend schauen Nini und Gigi die Fotos vom Skitag an.", translation: "In the evening, Nini and Gigi look at the photos from the ski day." },
  { id: "wanderung", word: "Wanderung", article: "die", plural: "Wanderungen", pos: "noun", meaning: "hike", example: "Die Wanderung beginnt ruhig, und Gigi erinnert Nini an tiefe Atemzüge.", translation: "The hike begins quietly, and Gigi reminds Nini to take deep breaths." },
  { id: "ski", word: "Ski", article: "die", pluralOnly: true, pos: "noun", meaning: "skis", example: "Vor der Hütte stellen Nini und Gigi die Ski nebeneinander in den Schnee.", translation: "In front of the hut, Nini and Gigi place the skis side by side in the snow." },
  { id: "meditation", word: "Meditation", article: "die", plural: "Meditationen", pos: "noun", meaning: "meditation", example: "Nach der Meditation fühlen sich Nini und Gigi bereit für den langen Reisetag.", translation: "After meditation, Nini and Gigi feel ready for the long travel day." },
  { id: "alltag", word: "Alltag", article: "der", plural: null, pos: "noun", meaning: "daily life", example: "Im Alltag machen Nini und Gigi jeden Nachmittag eine kleine Kaffeepause.", translation: "In daily life, Nini and Gigi take a small coffee break every afternoon." },
  { id: "karte", word: "Karte", article: "die", plural: "Karten", pos: "noun", meaning: "map; card", example: "Gigi faltet die Karte, und Nini markiert den Weg zur nächsten Berghütte.", translation: "Gigi folds the map, and Nini marks the way to the next mountain hut." },
  { id: "ruhig", word: "ruhig", pos: "adjective", meaning: "calm; quiet", example: "Nini bleibt ruhig, als Gigi im Café die Kamera sucht.", translation: "Nini stays calm while Gigi looks for the camera in the café." },
  { id: "frisch", word: "frisch", pos: "adjective", meaning: "fresh", example: "Der Kaffee ist frisch, und Nini packt ihn für die Wanderung ein.", translation: "The coffee is fresh, and Nini packs it for the hike." },
  { id: "langsam", word: "langsam", pos: "adjective", meaning: "slow; slowly", example: "Nini geht langsam durch den Schnee, und Gigi wartet mit einem Foto.", translation: "Nini walks slowly through the snow, and Gigi waits with a photo." },
  { id: "schnell", word: "schnell", pos: "adjective", meaning: "fast; quickly", example: "Gigi findet schnell ein Café, als Nini nach der Reise müde wird.", translation: "Gigi quickly finds a café when Nini gets tired after the trip." },
  { id: "gemuetlich", word: "gemütlich", pos: "adjective", meaning: "cozy; comfortable", example: "Nini und Gigi sitzen gemütlich am Fenster und planen den Skitag.", translation: "Nini and Gigi sit cozily by the window and plan the ski day." },
  { id: "hell", word: "hell", pos: "adjective", meaning: "bright", example: "Der Morgen ist hell, und Nini hilft Gigi beim Fotografieren der Berge.", translation: "The morning is bright, and Nini helps Gigi photograph the mountains." },
  { id: "muede", word: "müde", pos: "adjective", meaning: "tired", example: "Nach der langen Wanderung ist Gigi müde, aber Nini kocht noch Tee.", translation: "After the long hike, Gigi is tired, but Nini still makes tea." },
  { id: "leicht", word: "leicht", pos: "adjective", meaning: "light; easy", example: "Nini nimmt eine leichte Jacke mit, weil Gigi warmes Wetter erwartet.", translation: "Nini brings a light jacket because Gigi expects warm weather." },
  { id: "schwer", word: "schwer", pos: "adjective", meaning: "heavy; difficult", example: "Der Rucksack ist schwer, doch Gigi trägt ihn bis zur Hütte.", translation: "The backpack is heavy, but Gigi carries it to the hut." },
  { id: "wichtig", word: "wichtig", pos: "adjective", meaning: "important", example: "Für Nini ist eine ruhige Meditation vor der Reise wichtig.", translation: "For Nini, a calm meditation before the trip is important." },
  { id: "gehen", word: "gehen", pos: "verb", meaning: "to go; to walk", example: "Nini und Gigi gehen nach dem Kaffee zum Bahnhof.", translation: "Nini and Gigi go to the train station after coffee." },
  { id: "fahren", word: "fahren", pos: "verb", meaning: "to ride; to drive", example: "Gigi und Nini fahren mit dem Zug in die Berge.", translation: "Gigi and Nini take the train into the mountains." },
  { id: "trinken", word: "trinken", pos: "verb", meaning: "to drink", example: "Nini und Gigi trinken Kaffee, bevor sie die Stadt erkunden.", translation: "Nini and Gigi drink coffee before exploring the city." },
  { id: "fotografieren", word: "fotografieren", pos: "verb", meaning: "to photograph", example: "Gigi fotografiert Nini vor dem See, und beide lachen.", translation: "Gigi photographs Nini in front of the lake, and both laugh." },
  { id: "wandern", word: "wandern", pos: "verb", meaning: "to hike", example: "Am Samstag wandern Nini und Gigi durch einen stillen Wald.", translation: "On Saturday, Nini and Gigi hike through a quiet forest." },
  { id: "skifahren", word: "skifahren", pos: "verb", meaning: "to ski", example: "Im Januar gehen Nini und Gigi skifahren und machen danach eine Kaffeepause.", translation: "In January, Nini and Gigi go skiing and take a coffee break afterward." },
  { id: "atmen", word: "atmen", pos: "verb", meaning: "to breathe", example: "Bei der Meditation atmen Nini und Gigi langsam und tief.", translation: "During meditation, Nini and Gigi breathe slowly and deeply." },
  { id: "planen", word: "planen", pos: "verb", meaning: "to plan", example: "Nini und Gigi planen im Café ihre nächste Reise.", translation: "Nini and Gigi plan their next trip in the café." },
  { id: "packen", word: "packen", pos: "verb", meaning: "to pack", example: "Gigi will die Kamera packen, während Nini die Tickets sucht.", translation: "Gigi wants to pack the camera while Nini looks for the tickets." },
  { id: "lernen", word: "lernen", pos: "verb", meaning: "to learn", example: "Nini und Gigi lernen abends deutsche Wörter mit kleinen Karten.", translation: "In the evening, Nini and Gigi learn German words with small cards." },
  { id: "heute", word: "heute", pos: "adverb", meaning: "today", example: "Heute trinken Nini und Gigi Kaffee und buchen ein Hotel am See.", translation: "Today, Nini and Gigi drink coffee and book a hotel by the lake." },
  { id: "morgen_adv", word: "morgen", pos: "adverb", meaning: "tomorrow", example: "Morgen wandern Nini und Gigi früh los, damit das Licht weich ist.", translation: "Tomorrow, Nini and Gigi start hiking early so the light is soft." },
  { id: "zusammen", word: "zusammen", pos: "adverb", meaning: "together", example: "Zusammen betrachten Nini und Gigi die Fotos vom letzten Urlaub.", translation: "Together, Nini and Gigi look at the photos from the last vacation." },
  { id: "oft", word: "oft", pos: "adverb", meaning: "often", example: "Nini und Gigi meditieren oft, bevor sie eine neue Stadt besuchen.", translation: "Nini and Gigi often meditate before visiting a new city." },
  { id: "immer", word: "immer", pos: "adverb", meaning: "always", example: "Gigi nimmt immer die Kamera mit, wenn Nini Kaffee für die Reise kauft.", translation: "Gigi always brings the camera when Nini buys coffee for the trip." }
];

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
      return aDue - bDue || a.record.strength - b.record.strength || a.record.dueAt - b.record.dueAt;
    })
    .slice(0, count)
    .map(({ word }) => word);
}

function startSession() {
  const words = pickSessionWords(state.selectedCount);
  session = words.map((word) => ({
    word,
    phase: getRecord(word.id).seen ? "quiz" : "learn",
    quizType: null
  }));
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
  const types = isNoun(word) ? ["meaning", "article", "fill"] : ["meaning", "fill"];
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
    <div class="word-line">
      <div class="word">${displayWord(word)}</div>
      <button class="speak-button" type="button" aria-label="Play German pronunciation" title="Play German pronunciation">${speakerIcon()}</button>
    </div>
    <div class="meaning">${word.meaning}</div>
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

function renderMeaningQuiz(word) {
  const choices = shuffle([
    word.meaning,
    ...shuffle(WORDS.filter((item) => item.id !== word.id)).slice(0, 3).map((item) => item.meaning)
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

  if (germanVoice) {
    showVoiceMessage(`Using German voice: ${germanVoice.name} (${germanVoice.lang})`, "correct");
  } else {
    showVoiceMessage("Requested de-DE pronunciation. If it still sounds English, install a German voice.", "");
  }
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
renderStats();
