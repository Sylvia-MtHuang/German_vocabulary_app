# Nini & Gigi German Flashcards

A small local flashcard app for German vocabulary practice.

## Run Locally

```powershell
powershell -NoProfile -ExecutionPolicy Bypass -File .\Start-GermanFlashcards.ps1 -Port 8780
```

Then open:

```text
http://127.0.0.1:8780/
```

## Replace The Vocabulary List

The app reads vocabulary from:

```text
vocabulary.txt
```

To use a new vocabulary list, replace `vocabulary.txt` and refresh the page.

Supported formats:

```text
hallo, Gruezi, der Kaffee, die Stadt, das Hotel
```

or one richer entry per line:

```text
der Kaffee | coffee | Nini bestellt im Cafe einen Kaffee. | Nini orders a coffee in the cafe.
gehen | to go | Nini und Gigi gehen zum Bahnhof. | Nini and Gigi go to the train station.
```

If meanings are provided, the app enables meaning-choice review questions. If the file only contains German words, the app uses article and fill-in-the-word review questions.

## Vocabulary Images

The app looks for optional images in:

```text
assets/vocab-images/
```

Images are enabled through:

```text
assets/vocab-images/manifest.json
```

The current visual test set uses individually generated PNG images for B1-B2 daily-life vocabulary. The manifest can map a word id to any image filename:

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
Background and supporting objects avoid the article color.
Background stays clean and uncluttered, without scenic windows or busy rooms.
Supporting objects may explain the noun but stay neutral-colored and secondary.
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
