# Custom Vocabulary Units Design

## Intent

Let the learner review one imported TXT unit at a time or review every imported custom unit together. Each future TXT import becomes one unit automatically.

## Goals

- Show `All custom vocabulary` plus every imported TXT unit in the custom-vocabulary screen.
- Treat the existing Schritte PLUS B1.2 Unit 8 and Unit 9 content as two units.
- Build the all-units scope dynamically, so importing or replacing a unit updates it immediately.
- Reuse the same learning record for a card whether it is studied from its unit or from the all-units scope.
- Preserve current progress, TXT replacement behavior, English/Chinese UI, accessibility, and responsive layout.

## Non-goals and anti-goals

- Do not create or maintain a second merged TXT file.
- Do not change the TXT column format or require users to add unit metadata inside a file.
- Do not add folders, nested units, manual ordering, or unit deletion in this change.
- Do not duplicate progress just because the same card is reached through a different scope.

## Chosen approach

### Dynamic aggregate — selected

Each manifest-backed or browser-imported custom wordbook is a unit. `All custom vocabulary` is a virtual scope assembled from those units when selected; it is not stored as another wordbook. Cards retain their originating unit identity inside the aggregate so their progress keys are identical in both scopes. Re-importing the same title replaces that unit while retaining its stable unit ID.

### Alternatives considered

- **Stored merged copy:** simpler to load, but every import must update two sources and they can drift. Rejected because it duplicates data.
- **One TXT with unit tags:** compact, but changes the existing import format and no longer matches “one TXT equals one unit.” Rejected.

## User experience

The main wordbook picker continues to have one `Custom vocabulary` entry. Opening it shows:

1. A visually prominent `All custom vocabulary` row with the combined valid-card count and a `Study all` action.
2. One row per TXT unit with its title, card count/source, and a `Study this unit` action.
3. The existing TXT import form below the list.

Choosing a scope returns to the normal session setup. The summary names the chosen scope and its loaded-card count. The existing word-count selector and study flow remain unchanged. Empty or unreadable units are not added to a session.

## Data and progress behavior

- Split the current 91-card Schritte content into Unit 8 (42 cards) and Unit 9 (49 cards) as separate manifest-backed custom units.
- Keep each future imported TXT as one saved custom unit; importing the same title replaces that unit rather than creating a duplicate.
- A virtual all-units selection loads each custom unit, parses it with the existing parser, and combines the valid cards.
- Each combined card carries its originating unit ID. Progress keys use that origin, not the virtual all-units ID.
- Existing progress from the current combined `custom` wordbook is migrated to the corresponding Unit 8 or Unit 9 card without resetting review history.
- If the same German card ID appears in different future units, each unit keeps separate progress because its origin differs; both cards remain visible in the all-units scope.

## Constraints and verification

- Use the current dependency-free HTML, CSS, and JavaScript architecture.
- Keep keyboard semantics, radio state, visible focus, and bilingual labels correct.
- Add automated coverage for unit creation, aggregate loading, replacement, progress identity/migration, and Unit 8/9 counts.
- Run the full Node test suite and responsive browser checks in English and Chinese at desktop and mobile sizes.
