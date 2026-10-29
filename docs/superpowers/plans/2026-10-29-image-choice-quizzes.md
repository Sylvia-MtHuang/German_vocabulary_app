# Image Choice Quizzes Implementation Plan

> **For agentic workers:** Use superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox syntax for tracking.

**Goal:** Mix word-image and image-word questions into review, with article-free image-word options.
**Architecture:** Extend the existing quiz types and cache four word objects per image question. Reuse the current scheduler, feedback, bilingual UI, and preview flow.
**Tech Stack:** Dependency-free JavaScript, CSS, Node assertions and real-browser HTML checks.
**Spec:** docs/superpowers/specs/2026-10-29-image-choice-quizzes-design.md

## Global Constraints

- Current scope only: preserve existing assets and progress; no publishing or commits.
- Four distinct options from current WORDS; no articles or gender styling in image-word options.
- Neutral image-question cards and previews; no answer leaked through audio, alt or titles.
- Failed images and text-question switching never score a review.

## Review Focus

- Cached/slow/failed images: no early submission or stale callback affecting the next card.
- Homographs across custom units: deduplicate visible article-free words and image paths.
- Language switching after an answer and after missed-card return: stable choices and one score.
- Long phrases and short phone screens: reachable choices and feedback, no overflow.
- Switching away while images load: no late render or focus theft.

### Task 1: Candidate selection and probability

**Files:** app.js; tests/image-quizzes.test.cjs.
**Interfaces:** getImageChoices(item) returns cached four word objects or []; chooseQuizType(word, allowImages = true) returns an eligible quiz type.

- [ ] Write assertions for five equal random buckets, missing image fallback, non-noun eligibility, duplicate paths/labels/meanings and preserved umlauts.
- [ ] Run `node tests/image-quizzes.test.cjs`; expected: fails before image types exist.
- [ ] Implement candidate selection with session-level failed-path tracking and cached choices. Preserve existing type eligibility.
- [ ] Run the same test; expected: pass.

### Task 2: Rendering, loading and feedback

**Files:** app.js; styles.css; tests/image-quizzes.html; index.html; README.md.
**Interfaces:** imageQuizMarkup(item, preview) shares layout across current/preview; renderImageQuiz(item) binds input and image readiness; useTextQuestion(item) performs a non-scoring fallback.

- [ ] Add browser assertions for neutral cards, article-free escaped choices, image readiness, scoring once, failed-image and stale-callback safety, bilingual switching, missed-card return, keyboard controls, and narrow layouts.
- [ ] Run browser checks before implementation; expected: fail on missing image-question rendering.
- [ ] Implement the two layouts and loading gate, stable choice state, choice feedback, text fallback, safe generic accessible image names, and full-word post-answer feedback.
- [ ] Add responsive CSS and bilingual copy; update cache tokens and README.
- [ ] Run Node suite and real-browser checks at desktop and 360px phone size; expected: all new checks pass, existing tests unchanged.
- [ ] Review the final diff independently; fix material findings and verify. Leave changes uncommitted for user review.
