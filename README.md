# German Vocabulary Flashcards

A small local flashcard app for German vocabulary practice.

## Run Locally

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Start-GermanFlashcards.ps1 -Port 8780
```

Then open:

```text
http://127.0.0.1:8780/
```

## Wordbooks

The app reads available wordbooks from:

```text
wordbooks/manifest.json
```

Each entry points to a vocabulary text file:

```json
{
  "id": "goethe-a1",
  "title": "Goethe-Institut A1 level",
  "description": "Expanded A1 set based on the Goethe A1 wordlist.",
  "url": "wordbooks/goethe-a1.txt"
}
```

The home screen lets you choose a wordbook before starting a session. Learning progress is stored separately per wordbook. Each session randomizes words with equal study priority instead of following vocabulary-file or article order; due dates, weaker memories and image priority still guide selection.

The independent A2 wordbook covers the alphabetical section and thematic groups of the [official Goethe-Zertifikat A2 wordlist](https://www.goethe.de/pro/relaunch/prf/vi/Goethe-Zertifikat_A2_Wortliste.pdf), including words shared with A1. Its 1,498 cards split gender variants, meanings and useful time/date phrases. The official list describes approximately 1,300 lexical units; card counts use a different convention. Short everyday German examples and English translations are independently written or adapted from our existing A1 cards; official example sentences are not reproduced.

## English and Chinese

The top-right English / 中文 buttons switch the interface, meanings, example translations and memory hints. The browser remembers the language choice. Switching during study preserves the current card, answer input, question choices and progress. German words and sentences stay in German.

Chinese learning text is stored in `wordbooks/zh-CN.json`, keyed by the original English text. Context-specific meanings use `German word | English meaning` keys, for example `Rücken | back`. When editing or adding a vocabulary entry, add its Chinese meaning and example translation to this file as well; unknown text falls back to English. Translation services are not called by the app.

Run `node tests/content-language.test.cjs` for coverage and meaning-choice checks. Open `tests/language.html` for language-switching checks and `tests/responsive.html` for desktop and mobile layout checks. These browser tests use isolated storage.

## Replace Or Create A Vocabulary List

The app reads vocabulary from:

```text
vocabulary.txt
```

To use a quick custom vocabulary list, replace `vocabulary.txt` and refresh the page. To add a named wordbook, create a new `.txt` file in `wordbooks/` and add it to `wordbooks/manifest.json`.

Supported formats:

```text
hallo, Gruezi, der Kaffee, die Stadt, das Hotel
```

or one richer entry per line:

```text
der Kaffee | coffee | Nini bestellt im Cafe einen Kaffee. | Nini orders a coffee in the cafe.
gehen | to go | Nini und Gigi gehen zum Bahnhof. | Nini and Gigi go to the train station.
```

Optional fields can add a word-building memory aid, a custom image URL/path, and a noun plural form:

```text
der Bahnhof | train station | Der Bahnhof ist nah. | The train station is near. | die Bahn = train; der Hof = yard | assets/vocab-images/der-bahnhof.png | die Bahnhoefe
die Terrasse | terrace | Die Terrasse ist gross. | The terrace is large. | | die Terrassen
```

If the sixth field does not look like an image path or URL, the app treats it as the plural form. Plurals are shown in small text under the meaning on noun learning cards. Use `(Pl.)` after plural-only nouns and `(Sg.)` after singular-only nouns. If an example uses an inflected or separated form that cannot be blanked, word-recall questions use the meaning in the selected language as the clue.

If meanings are provided, the app enables meaning-choice review questions. If the file only contains German words, the app uses article and fill-in-the-word review questions.

## Memory Scheduling

The app uses a lightweight spaced-repetition scheduler inspired by Ebbinghaus-style review timing and Anki's SM-2 approach.

Each word keeps its own learning state in the browser:

```text
easeFactor
intervalDays
dueAt
reviewCount
lapses
correct / wrong counts
```

New or forgotten words return quickly during the current session. Correct answers increase the word's interval from minutes to days, then multiply future intervals by the word's ease factor. Wrong answers lower the ease factor, reset the word into a short learning step, and return it to the session queue until answered correctly.

The review ladder starts with short learning steps, then graduates to longer intervals:

```text
immediate -> 5 minutes -> 20 minutes -> 1 day -> 3 days -> 7 days -> dynamic interval
```

The `Mastered` counter counts words whose dynamic interval has reached at least 7 days.

## Vocabulary Images

The app looks for optional images in:

```text
assets/vocab-images/
```

Images are enabled through:

```text
assets/vocab-images/manifest.json
```

Images are individually generated PNGs. A2 currently has 181 illustrated cards, including batches of 50 and 100 new images. Review the first batch locally at `http://127.0.0.1:8780/tests/a2-images.html` and the additional 100 at `http://127.0.0.1:8780/tests/a2-images-100.html`. Exact prompts and filenames are in `assets/vocab-images/a2-image-prompts.json` and `assets/vocab-images/a2-image-prompts-100.json`. The manifest can map a word id to any image filename:

```json
[
  { "id": "der-vertrag", "file": "der-vertrag-v2.png" },
  { "id": "die-versicherung", "file": "die-versicherung-v2.png" }
]
```

This lets you test new image versions without deleting old images.

For the full image prompt style, see:

```text
IMAGE_PROMPTS.md
```

Short version:

```text
Photorealistic memory image, square flashcard format.
One unique image per word; do not reuse the same composition across words.
The main subject uses the article color strongly and clearly.
Only the core subject carries the article color; all other elements are grayscale.
Background stays clean and uncluttered, without scenic windows or busy rooms.
Supporting objects may explain the noun but stay grayscale and secondary.
Images may be imaginative or surreal and do not need to match the example sentence themes.
No readable text, labels, watermarks, cartoons, illustrations, or UI style.
```

Article color rule:

```text
der = blue
die = red/pink
das = green
plural = yellow
```

## Responsive Layout

The desktop setup uses two columns. Learning cards place images beside word details and use the space left below the header and session controls. Card height and compact typography adapt to the available viewport, including short laptop windows. Phone layouts remain stacked; long content can scroll inside the card while rating buttons stay visible. Scrollable content accepts touch scrolling without starting a card swipe.

Run the local server, then open `http://127.0.0.1:8780/tests/responsive.html` and click **Run layout checks**. The checks use the actual app renderers and all wordbooks without saving learning progress or playing audio. They cover ten viewport sizes, every desktop learning card and missed-card state, long review questions, and completion. Desktop checks reject both page scrolling and card-content scrolling. Mobile setup pages may scroll naturally.

Vocabulary and parser checks require only Node.js: `node tests/wordbooks.test.cjs`.
