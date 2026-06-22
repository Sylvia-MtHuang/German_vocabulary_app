# Vocabulary Image Prompt Guide

Use one freshly generated image per vocabulary word. Do not reuse a template,
camera angle, room, prop layout, or near-identical composition across words.

## Article Color Rule

```text
der = blue
die = red/pink
das = green
plural = yellow
```

The article color should appear mainly on the core subject. The background and
supporting objects should avoid that color so the memory cue stays clear.

## Unified Style

```text
Use case: photorealistic-natural
Asset type: square vocabulary flashcard image
Primary request: a memorable photorealistic image for the German word "<article> <word>"
Scene/backdrop: clean neutral studio or tabletop setting, no scenic window, no mountain view, no busy room
Subject: the vocabulary concept, with the article color strongly emphasized on the main subject only
Style/medium: realistic photography, surreal or exaggerated idea allowed, tactile real-world materials
Composition/framing: square, close enough for a flashcard, subject immediately recognizable
Lighting/mood: crisp natural or soft studio light, high clarity, rich texture
Color palette: neutral or contrasting background; supporting objects avoid the article color
Supporting objects: optional neutral props that explain the word, secondary and not visually dominant
Constraints: one unique composition for this word; no readable text, labels, watermarks, cartoons, illustration, UI style, or repeated template
```

## Example Prompt

```text
Create a square photorealistic memory image for "die Versicherung" (insurance).
The main subject is a vivid red/pink protective umbrella shielding a neutral
miniature house, bicycle, and wallet from clear glass raindrops. Use a clean
light gray tabletop studio background. The house, bicycle, wallet, rain, and
background must stay neutral-colored and must not use red or pink. The image
should feel slightly surreal but look like real product photography. No readable
text, no logos, no watermarks, no cartoon or illustration style.
```

## Manifest Mapping

The app can map a word id to any image filename:

```json
[
  { "id": "der-vertrag", "file": "der-vertrag-v2.png" },
  { "id": "die-versicherung", "file": "die-versicherung-v2.png" }
]
```

This makes it easy to test new versions without deleting old images.
