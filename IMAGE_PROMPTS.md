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

The article color is the only vivid hue in the image and belongs to the core
subject itself. Every background and supporting element must stay black, white,
or near-achromatic gray, including plants, sky, skin, utensils, fruit, toppings,
reflections and lighting. Preserve texture and shape, not natural food colors.
A colored container with differently colored contents is not a valid cue for a
word naming those contents. For ordinary nouns, use the singular article even
when showing the plural form; yellow is reserved for plural-only cards.

## Unified Style

```text
Use case: photorealistic-natural
Asset type: square vocabulary flashcard image
Primary request: a memorable photorealistic image for the German word "<article> <word>"
Scene/backdrop: clean grayscale studio or tabletop setting, no scenic window, no mountain view, no busy room
Subject: the vocabulary concept, with the article color strongly emphasized on the main subject only
Style/medium: realistic photography, surreal or exaggerated idea allowed, tactile real-world materials
Composition/framing: square, close enough for a flashcard, subject immediately recognizable
Lighting/mood: crisp natural or soft studio light, high clarity, rich texture
Color palette: strict selective color; exactly one article hue on the subject, all remaining elements near-achromatic black/white/gray
Supporting objects: optional grayscale props that explain the word, secondary and not visually dominant
Constraints: one unique composition for this word; no readable text, labels, watermarks, cartoons, illustration, UI style, or repeated template
```

## Example Prompt

```text
Create a square photorealistic memory image for "die Versicherung" (insurance).
The main subject is a vivid red/pink protective umbrella shielding a neutral
miniature house, bicycle, and wallet from clear glass raindrops. Use a clean
light gray tabletop studio background. The house, bicycle, wallet, rain, and
background must stay grayscale. Red/pink on the umbrella is the only
chromatic hue anywhere in the image. The image
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

## Angebot replacement

Generated with the built-in imagegen tool. Asset: `assets/vocab-images/das-angebot-v2.png`, shared by A1 and A2.

Prompt: Square photorealistic vocabulary memory image for das Angebot (offer / special offer). A large vivid green starburst promotion placard bearing only a crisp white % symbol dominates a neutral shop-counter display. Three small ivory ceramic mugs are secondary merchandise. Warm gray studio backdrop, soft light, tactile paper and real shadows. Remove all boxes, packaging and gift imagery. Green appears on the core placard only. No words, prices, branding, watermark, cartoon or busy background. The % symbol is a deliberate exception to the no-label guideline to make the offer concept clear at thumbnail size.

## A2 batch: 50 new images

The built-in imagegen tool generated one independent square photograph for each of 50 previously unmapped A2 nouns. Exact prompts, vocabulary IDs, colors and workspace filenames are recorded in [a2-image-prompts.json](assets/vocab-images/a2-image-prompts.json). The batch adds 20 blue masculine, 20 pink feminine and 10 green neuter images. Local review gallery: [tests/a2-images.html](tests/a2-images.html).

## A2 batch: 100 additional images

Generated with the built-in imagegen tool, one independent square photograph for each previously unmapped word. Exact prompts, vocabulary IDs, article colors and workspace filenames: [a2-image-prompts-100.json](assets/vocab-images/a2-image-prompts-100.json). This batch contains 34 blue masculine, 33 pink feminine and 33 green neuter images; the local preview interleaves them: [tests/a2-images-100.html](tests/a2-images-100.html).

## Review before integration

Inspect every image at thumbnail size for recognizable meaning, the correct
article hue on the core subject, and grayscale surroundings. Any competing
chromatic hue fails the color check and needs a revised sibling image before
being presented as ready. Keep the historical batch prompts above unchanged;
new images and revisions follow the current strict color contract.

## A2 color revisions: 17 approved images

Approved on 2026-10-03. The app manifest now uses the final selective-color revisions for these words, with the original assets retained. Prompts and final filenames: [a2-color-revisions-17.json](assets/vocab-images/a2-color-revisions-17.json). Before/after gallery: [tests/a2-color-revisions.html](tests/a2-color-revisions.html). Historical batch prompt files continue to describe the original images.
