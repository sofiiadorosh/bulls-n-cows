# Bulls n Cows — Design

## Architecture overview

The project follows a "functional core, imperative shell" split. Everything that can be pure is pure; side effects live in two small, clearly named places.

```
src/
  engine/    pure game functions required by the task (covered by tests)
  core/      other pure logic: game state, records, settings, formatting
  storage/   localStorage access — the only module that touches persistence
  ui/        DOM rendering and event handlers — the only code that touches the DOM
  styles/    SCSS (abstracts, core, layout, components, pages)
tests/       Jest tests for every function in src/engine
```

`engine/` and `core/` never import from `ui/` or `storage/`, so all game logic can be tested in Node without a browser.

## 1. Data structures and algorithms

### Secret and guesses — `string`

A secret is stored as a lowercase string such as `'0123'` or `'a3f1'` ([generateSecret.ts](src/engine/generateSecret.ts)).

- A string keeps leading zeros. The number `0123` would collapse to `123` and lose a digit.
- Hex digits `a`–`f` are ordinary characters, so every base is handled the same way.
- Strings are immutable in JavaScript, so a secret can never be changed by accident.
- Guesses are lowercased before they are stored or compared ([game.ts](src/core/game.ts) → `makeGuess`), so `A1F9` and `a1f9` are the same guess.

### Game state — one read-only object

[types.ts](src/core/types.ts) → `GameState`:

```ts
type GameState = {
  readonly settings: Settings;
  readonly secret: string;
  readonly history: readonly GuessEntry[];
  readonly status: 'playing' | 'won';
  readonly startedAt: number;
  readonly finishedAt: number | null;
};
```

- The whole round lives in a single object, so it can be passed around, compared and replaced as one value.
- Every field is `readonly`, so TypeScript rejects mutations such as `state.status = 'won'` or `state.history.push(entry)` at compile time.
- Each action returns a **new** state instead of changing the old one: `createGame` builds the first state, `makeGuess` returns the next one ([game.ts](src/core/game.ts)).
- `status` is a union of string literals rather than a boolean, so an invalid status cannot be represented.
- The number of attempts is **not** stored. It is derived from `history.length` (`getAttempts`), so the counter can never disagree with the history.
- Elapsed time is derived the same way: `getElapsedTime` returns `finishedAt - startedAt` after a win, or `now - startedAt` while the round is running.

### Guess history — an append-only array

`history` is a `readonly GuessEntry[]`, where each entry is `{ guess, bulls, cows }`.

- An array keeps the order of attempts, which is exactly what the history list shows.
- Entries are only ever added at the end: `makeGuess` returns `{ ...state, history: [...history, entry] }`. Old entries are never changed or removed, and the previous state stays valid.
- A repeated guess is detected with `hasGuessed` (`history.some(...)`). `makeGuess` then returns the **same** state object, so the history is not duplicated and the UI can show a hint instead.

### Other structures

| Structure                              | Where                                         | Why                                                                                                                                                                                        |
| -------------------------------------- | --------------------------------------------- | ------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------------ |
| `Set`                                  | [isValidGuess.ts](src/engine/isValidGuess.ts) | Detects repeated digits: if `new Set(chars).size` is smaller than `chars.length`, a digit repeats.                                                                                         |
| `Map`                                  | [memoize.ts](src/engine/memoize.ts)           | Cache from a serialized argument list to a result. Built for key–value lookups and has no inherited keys like a plain object.                                                              |
| Sorted array of `GameRecord`           | [records.ts](src/core/records.ts)             | The records table: sorted by attempts, then by time, cut to the top N (`RECORDS_LIMIT = 10`). Each record keeps `length` and `base`, so the table shows a settings badge for every result. |
| Union type `Base = 2 \| 8 \| 10 \| 16` | [types.ts](src/core/types.ts)                 | Only valid number systems can be passed; `createDigitValidator(7)` does not compile.                                                                                                       |
| String alphabet `DIGITS`               | [constants.ts](src/core/constants.ts)         | `'0123456789abcdef'`. The digits of base `b` are `DIGITS.slice(0, b)`, so one constant serves all four bases.                                                                              |

### Algorithm: `evaluateGuess`

[evaluateGuess.ts](src/engine/evaluateGuess.ts)

```ts
const bulls = guessChars.filter(
  (char, index) => char === secretChars[index],
).length;
const matches = guessChars.filter((char) => secretChars.includes(char)).length;
return { bulls, cows: matches - bulls };
```

1. Lowercase both strings and split them into arrays of characters.
2. **Bulls** — keep the guess characters that equal the secret character at the same index (`filter` with the index argument).
3. **Matches** — keep the guess characters that appear anywhere in the secret.
4. **Cows** = matches − bulls. Every bull is also counted as a match, so subtracting removes it and a digit is never counted as both a bull and a cow.

This is correct because both the secret and a valid guess contain unique digits: each guess digit can match at most one secret digit.

Example — secret `1234`, guess `5241`: bulls = 1 (`2` in place), matches = 3 (`2`, `4`, `1`), cows = 3 − 1 = 2.

The function uses only `filter` and `includes`; there are no loops with manual counters.

### Algorithm: `countPossibleSecrets`

[countPossibleSecrets.ts](src/engine/countPossibleSecrets.ts)

The number of secrets is the number of arrangements of `length` distinct digits out of `base`:
P(base, length) = base! / (base − length)!. A secret may start with `0`, so nothing is subtracted.

The function uses the recursive form of this formula:

```
count(0, base)      = 1                               base case: one way to pick nothing
count(length, base) = base × count(length − 1, base − 1)
```

Pick the first digit in `base` ways; the rest is the same problem with one position and one digit fewer. For example, `count(4, 10) = 10 × 9 × 8 × 7 × 1 = 5040`. When `length > base` a factor of `0` appears, so the result is `0`.

The function is wrapped in a generic `memoize` higher-order function ([memoize.ts](src/engine/memoize.ts)). The recursive call goes through the memoized version, so every intermediate step is cached too: after `count(4, 10)`, the values for `(3, 9)`, `(2, 8)`, `(1, 7)` and `(0, 6)` are also in the cache. The settings screen calls this function on every change of base or length, and repeated calls are a single map lookup.

`memoize` keeps its `Map` inside a closure. The cache is mutated, but it is private, and the memoized function still returns the same output for the same input, so it behaves as a pure function from the outside.

## 2. Complexity

Notation: `n` is the secret length (2–6) and `b` is the base (2, 8, 10 or 16), with `n ≤ b`.

| Function               | Time                         | Extra space |
| ---------------------- | ---------------------------- | ----------- |
| `generateSecret`       | O(n · b)                     | O(n · b)    |
| `evaluateGuess`        | O(n²)                        | O(n)        |
| `isValidGuess`         | O(n · b), effectively O(n)   | O(n + b)    |
| `countPossibleSecrets` | O(n) first call, O(1) cached | O(n)        |

**`generateSecret(length, base, random)`** — [generateSecret.ts](src/engine/generateSecret.ts). `pickDigits` recurses `n` times. Each step calls `random()` once and builds the remaining alphabet with two `slice` calls and a concatenation, which copies at most `b` characters: O(b) per step, O(n · b) in total. Joining the picked digits adds O(n²), which is within O(n · b) because `n ≤ b`. Each recursion level holds its own copy of the remaining alphabet, so extra space is also O(n · b). In the largest game (n = 6, b = 16) that is about 100 character operations.

**`evaluateGuess(secret, guess)`** — [evaluateGuess.ts](src/engine/evaluateGuess.ts). Lowercasing and splitting both strings is O(n). Counting bulls is one pass: O(n). Counting matches calls `secretChars.includes` (O(n)) for each of the `n` guess characters: O(n²). Total O(n²). A `Set` of secret digits would make matches O(n), but with `n ≤ 6` (at most 36 comparisons) the simpler array version was kept for readability.

**`isValidGuess(guess, length, base)`** — [isValidGuess.ts](src/engine/isValidGuess.ts). Creating the validator slices the alphabet: O(b). `every(isDigit)` checks `n` characters, and each check is an `includes` over the `b` allowed digits: O(n · b). Building the `Set` for the uniqueness check is O(n). Total O(n · b). Since `b ≤ 16` is a constant of the game, this is O(n) in practice. The `&&` chain stops early: a guess of the wrong length is rejected in O(1) after splitting.

**`countPossibleSecrets(length, base)`** — [countPossibleSecrets.ts](src/engine/countPossibleSecrets.ts). The recursion goes from `length` down to `0`: `n + 1` calls, each doing one multiplication and one cache lookup (`JSON.stringify` of two numbers is constant time). The first call is O(n) time with O(n) stack depth, and it adds O(n) entries to the cache. A repeated call with the same arguments is a single `Map` lookup: O(1).

Related functions:

- `addRecord` — [records.ts](src/core/records.ts): O(r log r) for sorting, where `r ≤ RECORDS_LIMIT + 1 = 11`.
- `makeGuess` — [game.ts](src/core/game.ts): O(h) to copy the history of `h` previous attempts with `[...history, entry]` and to check for a repeated guess with `some`.

## 3. Clean code principles

**Single responsibility.** Each module and function does one thing.

- [src/engine/](src/engine): one required function per file (`createDigitValidator`, `isValidGuess`, `evaluateGuess`, `countPossibleSecrets`, `generateSecret`) plus the generic `memoize`.
- [recordsStorage.ts](src/storage/recordsStorage.ts) only reads and writes `localStorage`. It knows nothing about the game rules.
- [records.ts](src/core/records.ts) splits into `createRecord` (build), `compareRecords` (order) and `addRecord` (insert and trim).
- In the UI, [settingsFields.ts](src/ui/settingsFields.ts) only manages the two dropdowns, [recordsTable.ts](src/ui/recordsTable.ts) only renders the table, and [dropdown.ts](src/ui/dropdown.ts) is a reusable component that knows nothing about the game.

**Pure functions and explicit dependencies.** Randomness and time are passed in, not hidden inside.

- `generateSecret(length, base, random = Math.random)` — the tests pass a deterministic `random` and get a predictable secret ([generateSecret.test.ts](tests/generateSecret.test.ts)).
- `createGame(settings, random, now)`, `makeGuess(state, guess, now)` and `getElapsedTime(state, now)` in [game.ts](src/core/game.ts) take the current time as a parameter.

**Separation of logic from side effects.** `engine/` and `core/` do not use the DOM or `localStorage`. All mutable application state (`screen`, `records`, `timerId`) is kept in one function, `startApp` in [app.ts](src/ui/app.ts), which calls the pure functions and renders the result.

**Immutability.** All state types in [types.ts](src/core/types.ts) are `readonly`. `makeGuess` returns a new state with `[...history, entry]`. `addRecord` copies the array (`[...records, record]`) before calling `sort`, which would otherwise mutate the caller's array. `generateSecret` removes a picked digit with `slice` instead of `splice`.

**Meaningful names.** Functions say what they return: `isValidGuess`, `hasGuessed` and `isGameRecord` return booleans; `createDigitValidator`, `createRecord` and `createGame` build values; `getAttempts` and `getElapsedTime` derive values; `normalizeSettings` and `filterGuessInput` describe their transformation. Variables such as `normalizedGuess`, `secretChars` and `allowedDigits` name what they hold.

**No magic values.** Repeated values are named once in [constants.ts](src/core/constants.ts): `DIGITS`, `LENGTHS`, `BASES`, `BASE_NAMES`, `RECORDS_LIMIT`, `DEFAULT_SETTINGS`. The storage key is `STORAGE_KEY` in [recordsStorage.ts](src/storage/recordsStorage.ts). In the styles, colors and sizes are SCSS variables in [\_variables.scss](src/styles/abstracts/_variables.scss).

**DRY — reuse instead of duplication.**

- `createDigitValidator` is the single definition of "a valid digit". It is used in `isValidGuess` ([isValidGuess.ts](src/engine/isValidGuess.ts)) and for live input filtering in [gameScreen.ts](src/ui/gameScreen.ts) through `filterGuessInput` ([input.ts](src/core/input.ts)).
- `isValidGuess` is reused in `makeGuess` and in the `generateSecret` tests, so "a valid secret" is checked by the same rule as "a valid guess".
- `memoize` is a generic higher-order function, not caching code written inside `countPossibleSecrets`.
- `createElement` in [dom.ts](src/ui/dom.ts) is the single way the UI creates elements.
- The repeated border-and-shadow look is the `ui-box` mixin, and the hover effect is `ui-press`, in [\_mixins.scss](src/styles/abstracts/_mixins.scss).

**Small functions and guard clauses.** `makeGuess` starts with one guard that returns the unchanged state for a finished game, an invalid guess or a repeated guess, so the main path has no nesting. `pickDigits` starts with its base case. `handleGuess` in [app.ts](src/ui/app.ts) returns early when the game screen is not active.

**Types instead of comments.** The `Base` union, the `'playing' | 'won'` status and `GameRecord | null` from `createRecord` document the possible values and are checked by the compiler. Data from `localStorage` is typed as `unknown` and checked with the `isGameRecord` type guard before use ([recordsStorage.ts](src/storage/recordsStorage.ts)), so corrupted storage cannot break the records table.

**Safe DOM output.** No `innerHTML` or `insertAdjacentHTML` is used. All markup is created with `createElement` and text is set through `textContent` ([dom.ts](src/ui/dom.ts)), so a value can never be interpreted as HTML.

**Tests that follow FIRST.** Tests in [tests/](tests) are **f**ast (pure functions, no DOM or timers), **i**ndependent (each test creates its own validator, `jest.fn` or random sequence), **r**epeatable (`generateSecret` gets a deterministic `random`), **s**elf-validating (every test asserts with `expect`) and **t**imely (each test file was committed before its implementation).

**Consistent style, enforced by tools.** ESLint ([eslint.config.js](eslint.config.js)) enforces `eqeqeq`, `curly`, `prefer-const`, `no-var` and bans `any`. Prettier ([.prettierrc](.prettierrc)) formats every file. Husky runs `lint-staged` before every commit and `npm test` before every push.
