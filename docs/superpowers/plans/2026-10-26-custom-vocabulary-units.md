# Custom Vocabulary Units Implementation Plan

> **For agentic workers:** REQUIRED SUB-SKILL: Use superpowers:subagent-driven-development (recommended) or superpowers:executing-plans to implement this plan task-by-task. Steps use checkbox (`- [ ]`) syntax for tracking.

**Goal:** Let learners review one imported TXT unit or a dynamic aggregate of every custom unit without splitting learning progress by review scope.

**Architecture:** Keep each custom wordbook as the source of one unit and add a synthetic `custom-all` selection at runtime. The existing 91-line `vocabulary.txt` remains the single source file for the two built-in units, whose manifest entries select lines 0–41 and 42–90; future browser imports remain one saved TXT unit each. Every parsed card receives its origin unit ID, and progress keys use that origin in both unit and aggregate modes.

**Tech Stack:** Dependency-free HTML, CSS, JavaScript, Node.js built-in test modules, browser regression pages.

**Spec:** `docs/superpowers/specs/2026-10-26-custom-vocabulary-units-design.md`

## Global Constraints

- One imported TXT equals one custom unit; importing the same title replaces that stable unit.
- `All custom vocabulary` is assembled dynamically and is never stored as a merged TXT copy.
- Unit and aggregate study modes use the same progress record for a card.
- Current Unit 8 and Unit 9 progress must migrate without reset.
- Preserve English/Chinese switching, keyboard semantics, responsive behavior, and the existing TXT format.
- Add no dependency and do not restructure unrelated application code.

## Review Focus

- A saved state whose selection is the old `custom` ID must open the new all-units scope and keep legacy progress; Task 1 tests both behaviors.
- Re-importing a built-in or saved title must keep the unit ID, replace its text, discard its old line range, and refresh counts; Task 1 tests replacement.
- The same word ID in two future units must remain two aggregate cards with separate origin-based records; Task 1 tests duplicate IDs.
- An empty or unreadable unit must not erase valid cards from the aggregate or enable an empty session; Task 1 tests valid/empty combinations.
- Long unit names and translated controls must remain usable on 320px mobile and short desktop viewports; Task 2 adds responsive checks.

---

### Task 1: Unit data model, dynamic aggregate, and progress identity

**Files:**
- Create: `tests/custom-vocabulary-units.test.cjs`
- Modify: `tests/custom-wordbooks.test.cjs`
- Modify: `tests/custom-vocabulary-unit9.test.cjs`
- Modify: `wordbooks/manifest.json`
- Modify: `app.js:1-175, 735-850, 1065-1125, 1215-1280, 2100-2220`

**Interfaces:**
- Manifest unit fields: `group: "custom"`, `rangeStart`, `rangeCount`, `cardCount`, and optional `legacyId`.
- `getCustomUnits(books = WORDBOOKS) -> Array<Wordbook>` excludes aggregate entries.
- `withCustomAggregate(books) -> Array<Wordbook>` prepends one virtual `{id: "custom-all", aggregate: true}` entry.
- `loadUnitWords(wordbook) -> Promise<Array<Word>>` loads text, applies the optional range, and adds `unitId` and `legacyId` to every card.
- `loadSelectedWordbook() -> Promise<void>` loads one unit or flattens all valid unit results when `aggregate` is true.
- `recordKey(word) -> string` uses `word.unitId`; `getRecord(word) -> Record` falls back to `legacyId::word.id` and the original unprefixed legacy key.

- [ ] **Step 1: Write the failing unit/aggregate tests**

Add assertions that:

- the manifest exposes Unit 8 as 42 cards and Unit 9 as 49 cards from the correct ranges;
- `withCustomAggregate()` creates exactly one `custom-all` entry and never persists it through saved custom units;
- combining two units keeps both copies of a duplicate word ID and attaches different `unitId` values;
- replacement by case-insensitive title keeps the existing ID, uses all replacement text, and removes manifest range fields;
- aggregate loading keeps valid units when another unit parses to zero cards;
- old `custom::word-id` and unprefixed records migrate to the proper origin key;
- old `selectedWordbookId: "custom"` resolves to `custom-all`.

- [ ] **Step 2: Run the new test and verify RED**

Run: `node tests/custom-vocabulary-units.test.cjs`

Expected: FAIL because the manifest units and aggregate/progress helpers do not exist.

- [ ] **Step 3: Update the built-in custom-unit manifest**

Replace the single custom manifest entry with:

- `custom-unit-8`, title `Schritte PLUS B1.2 · Unit 8`, `rangeStart: 0`, `rangeCount: 42`, `cardCount: 42`, `legacyId: "custom"`;
- `custom-unit-9`, title `Schritte PLUS B1.2 · Unit 9`, `rangeStart: 42`, `rangeCount: 49`, `cardCount: 49`, `legacyId: "custom"`.

Both entries continue to read `vocabulary.txt`; this avoids a duplicate merged source and preserves the current 91-card file.

- [ ] **Step 4: Implement the minimal unit and aggregate helpers**

Normalize the new manifest fields, retain one unit per saved TXT, compute saved-unit counts from parsed text, clear manifest ranges when saved text replaces a built-in unit, and wrap the final merged list with the synthetic aggregate.

- [ ] **Step 5: Implement origin-aware loading and progress migration**

Update loading, record lookup, pruning, session selection, stats, answer handling, and progress counting to pass full word objects and use origin-aware card keys. Skip prefix pruning for `custom-all`; retain the old record until all matching built-in cards have had a chance to migrate.

- [ ] **Step 6: Update existing custom-content tests**

Make Unit 8/9 tests read the manifest ranges while preserving all 91-card content and Unit 9 image assertions.

- [ ] **Step 7: Run Task 1 tests and verify GREEN**

Run:

```powershell
node tests/custom-vocabulary-units.test.cjs
node tests/custom-wordbooks.test.cjs
node tests/custom-vocabulary-unit9.test.cjs
```

Expected: all three exit 0 and report 42 Unit 8 cards, 49 Unit 9 cards, and 91 aggregate cards.

- [ ] **Step 8: Commit Task 1**

```powershell
git add app.js wordbooks/manifest.json tests/custom-vocabulary-units.test.cjs tests/custom-wordbooks.test.cjs tests/custom-vocabulary-unit9.test.cjs
git commit -m "Add custom vocabulary unit model"
```

### Task 2: Custom scope picker and bilingual responsive UI

**Files:**
- Modify: `tests/custom-vocabulary-units.test.cjs`
- Modify: `tests/responsive.html`
- Modify: `app.js:14-100, 2138-2270`
- Modify: `styles.css:157-305, 860-890`
- Modify: `index.html:68-88, 120`

**Interfaces:**
- Custom manager actions: `data-custom-wordbook-id="custom-all"` for aggregate and the stable unit ID for each unit.
- Copy keys: `All custom vocabulary`, `Study all`, `Study this unit`, `TXT unit`, `Import a TXT unit`, `Unit name`, `Import or replace unit`, and count/source summary templates.
- `renderCustomWordbooks() -> void` renders one emphasized aggregate row followed by unit rows with accessible actions and card counts.

- [ ] **Step 1: Extend the test with failing UI assertions**

Assert that rendered English and Chinese markup contains the all-units action, both Unit 8/9 actions and counts, unit-oriented import copy, selected-scope state, and no stored duplicate aggregate book.

- [ ] **Step 2: Run the UI assertions and verify RED**

Run: `node tests/custom-vocabulary-units.test.cjs`

Expected: FAIL because the aggregate row, translations, and unit copy are absent.

- [ ] **Step 3: Implement the smallest UI change**

Keep the main picker as one `Custom vocabulary` entry. In the custom manager, render `All custom vocabulary` first, then each actual unit. Selecting either closes the manager, loads that scope, updates the setup summary with its name/count, and preserves radio/ARIA state.

- [ ] **Step 4: Style aggregate and unit rows**

Reuse the existing panel, row, and button system. Add only the modifier needed to distinguish the aggregate row and allow long titles/actions to stack cleanly below the mobile breakpoint. Preserve visible focus and 48px minimum targets.

- [ ] **Step 5: Extend responsive checks**

Teach `tests/responsive.html` to display and measure the custom manager in English and Chinese. Check no horizontal overflow and that every scope/import control remains inside 320×568, 1280×600, and the existing viewport matrix.

- [ ] **Step 6: Run Task 2 checks and verify GREEN**

Run: `node tests/custom-vocabulary-units.test.cjs`

Then serve the repository and run `tests/responsive.html?book=custom-unit-8`, verifying the result ends with `0 failures` in both languages and all configured viewports.

- [ ] **Step 7: Commit Task 2**

```powershell
git add app.js styles.css index.html tests/custom-vocabulary-units.test.cjs tests/responsive.html
git commit -m "Add custom vocabulary scope picker"
```

### Task 3: Full regression and delivery audit

**Files:**
- Modify if required by failures: only files already listed in Tasks 1–2
- Verify: `docs/superpowers/specs/2026-10-26-custom-vocabulary-units-design.md`
- Verify: `docs/superpowers/plans/2026-10-26-custom-vocabulary-units.md`

**Interfaces:**
- No new interfaces; this task verifies the approved ones end to end.

- [ ] **Step 1: Run the full Node suite**

Run:

```powershell
$tests = rg --files tests -g '*.test.cjs'
$failed = $false
foreach ($test in $tests) { node $test; if ($LASTEXITCODE -ne 0) { $failed = $true } }
if ($failed) { exit 1 }
Write-Output "ALL $($tests.Count) NODE TESTS PASSED"
```

Expected: every test exits 0.

- [ ] **Step 2: Perform one bounded visual QA pass**

Check the setup page and custom manager at desktop and mobile sizes in English and Chinese. Exercise `All custom vocabulary`, Unit 8, Unit 9, and one simulated imported TXT unit. Fix all observed defects in one batch, then perform at most one confirmation pass.

- [ ] **Step 3: Verify the shipped behavior checklist**

Confirm 42 Unit 8 cards, 49 Unit 9 cards, 91 all-custom cards before extra imports, dynamic count growth after an import, stable count after same-title replacement, shared records between unit and aggregate modes, preserved legacy progress, and unchanged Goethe wordbooks.

- [ ] **Step 4: Inspect the final diff and repository state**

Run:

```powershell
git diff --check
git status --short --branch
git diff --stat
```

Expected: no whitespace errors; only this feature's files and the two approved documents are intended changes. Leave all pre-existing untracked files untouched.

- [ ] **Step 5: Commit the plan/spec and any final verified fixes**

```powershell
git add docs/superpowers/specs/2026-10-26-custom-vocabulary-units-design.md docs/superpowers/plans/2026-10-26-custom-vocabulary-units.md
git commit -m "Document custom vocabulary unit workflow"
```
