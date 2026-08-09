# Word Wheel — Wordscapes-style Puzzle Game

A React Native (Expo) implementation of a crossword-grid + circular letter-wheel word
puzzle game, built to the "Android Game Developer Assessment" spec.

> Note: the original brief asked for native Kotlin. This build targets **Expo /
> React Native + TypeScript** instead, which still runs as a real installable Android
> app (`expo run:android` / EAS build → APK) but shares the codebase with iOS. The
> architecture patterns below (MVVM-style separation, single-source state, generated
> data model) map directly onto the same evaluation criteria in the brief.

## Running it

```bash
npm install
npx expo start        # then press "a" for Android, or scan the QR code in Expo Go
```

To produce an installable APK: `eas build -p android --profile preview` (requires an
Expo/EAS account) or `npx expo run:android` for a local debug build.

## Architecture

The app follows an **MVVM-style separation**, adapted to React idioms:

| Layer | Where | Responsibility |
|---|---|---|
| **Model** | `src/data/levelLoader.ts`, `src/store/gameStore.ts` | Loads level content from a structured local source and persists durable player progress (unlocked levels, found words, score) via `zustand` + `AsyncStorage`. |
| **ViewModel** | `src/hooks/useGameSession.ts` | Combines the immutable level definition with a *derived* crossword layout and the persisted progress slice, exposes intent functions (`submitPath`, `pause`, `resume`) and derived UI state (`isLevelComplete`, `gridWordsFound`, `feedback`). Screens never touch the store or the generator directly. |
| **View** | `src/screens/*`, `src/components/**` | Purely presentational + gesture-driven. Re-renders from ViewModel output; contains no business logic (word validation, scoring, unlock rules all live in the ViewModel/Model layers). |

Pure logic (`crosswordGenerator.ts`, `wordValidator.ts`, `wheelGeometry.ts`) is kept as
plain, dependency-free TypeScript functions so it's trivially unit-testable in
isolation from React/React Native.

## Custom swipe / gesture logic

`src/components/wheel/LetterWheel.tsx` uses `react-native-gesture-handler`'s
`Gesture.Pan()` API:

- **`onBegin`/`onUpdate`** report the raw finger coordinate on every frame. That point
  is hit-tested (`utils/wheelGeometry.ts::hitTest`) against the precomputed circular
  position of every letter node (`computeWheelPositions`, evenly spaced around a
  circle starting at 12 o'clock).
- When the finger enters a new letter's hit radius, that letter's index is appended
  to a `selected` path (indices, not letters — this correctly supports wheels with
  duplicate letters, e.g. a pool of `A, L, A, R, M`, since each duplicate occupies a
  distinct wheel position). Re-entering an already-selected letter or lifting outside
  any letter is a no-op; letters can't be selected twice in the same swipe.
- A `react-native-svg` `Polyline` (`SwipeTrail.tsx`) is redrawn every update from the
  same point list plus the *live* finger position, so the line visually tracks the
  finger in real time, exactly like the reference app.
- **`onEnd`/`onFinalize`** (finalize covers gesture cancellation, e.g. an interrupting
  system gesture) submit the traced index path to the ViewModel
  (`useGameSession.submitPath`), which resolves it against the level's word list
  (`utils/wordValidator.ts`) and classifies it as a grid word, a bonus word, an
  already-found word, or invalid — each with distinct haptic feedback
  (`expo-haptics`) and toast styling.
- Gesture callbacks run on the UI thread by default (Reanimated worklets); state
  updates are dispatched back to JS via `runOnJS` so React can re-render the trail
  and letter "pop" animations without dropping frames during a fast swipe.

## Level data structure

Levels are authored as plain JSON (`src/data/levels.json`) — a structured local
source, per the brief:

```json
{ "id": 1, "letters": ["T", "C", "A", "R"], "words": ["CART", "CAT", "CAR", "ART", "ACT", "ARC", "RAT", "TAR"] }
```

Rather than hand-authoring pixel/row-col coordinates for every level (error-prone and
hard to extend), the grid layout is **computed at runtime** by a deterministic greedy
crossword generator (`utils/crosswordGenerator.ts`):

1. Words are sorted longest-first; the longest word is anchored horizontally.
2. Each subsequent word is placed at the first valid letter intersection it shares
   with an already-placed word (flipping orientation, across ↔ down), with adjacency
   checks to avoid accidentally merging unrelated words.
3. Any word that can't be geometrically placed becomes a **bonus word** — still
   valid and scoreable from the wheel, just not shown as a grid slot, matching the
   "bonus extra words" requirement.

This keeps the JSON dataset trivial to extend (just add `{ id, letters, words }`) —
`levelLoader.ts` is the only seam that would need to change to swap in Room/SQLite or
a remote source later.

`src/data/levels.json` currently ships **15 levels**, letter pools sized 3–5 as
specified, ramping in word-count/difficulty.

## Back stack & lifecycle

- Navigation is `@react-navigation/native-stack` (`src/navigation/RootNavigator.tsx`)
  with a plain push stack for `Home → LevelSelect → Gameplay`, so the system back
  button pops exactly one screen with no duplicate routes.
- **Pause** is presented as a `transparentModal` on top of `Gameplay` rather than a
  push — `Gameplay` (and its `useGameSession` hook) stays mounted underneath, so
  resuming is instant with **zero state loss**. The hardware back button is
  intercepted in `GameplayScreen` (via `BackHandler` + `useFocusEffect`) to open
  Pause instead of leaving gameplay, and intercepted again in `PauseScreen` to simply
  resume.
- `Gameplay` disables the edge swipe-back gesture (`gestureEnabled: false`) so an
  accidental swipe can't silently abandon a session.
- All durable state (found words, unlocked levels, score) lives in the
  `zustand`-persisted store, not component state, so it survives screen rotation,
  backgrounding, and even a full app kill/restart. Orientation is locked to portrait
  (`expo-screen-orientation`) since the grid/wheel layout is portrait-only by design.

## Polish

- Spring-based micro-interactions throughout: letter nodes scale up while active on
  the wheel, grid cells "pop" in when a word is revealed, buttons compress on press,
  the level-complete card springs in.
- Toast feedback (`components/common/Toast.tsx`) with distinct color/haptic per
  outcome: grid word (green), bonus word (gold), already-found (muted), invalid
  (red shake).
- Animated progress bar tracks grid completion; a bonus-word tray shows discovered
  extra words live.
- Screens fade/translate in on mount (Home) and levels persist star ratings based on
  bonus words found.

## Folder structure

```
word-puzzle-game/
├── App.tsx                     # Entry point: providers, orientation lock
├── app.json / babel.config.js / tsconfig.json
└── src/
    ├── components/
    │   ├── common/              # AnimatedButton, Toast, ProgressBar
    │   ├── grid/                # CrosswordGrid, GridCell
    │   └── wheel/                # LetterWheel, LetterNode, SwipeTrail
    ├── data/
    │   ├── levels.json          # structured level dataset
    │   └── levelLoader.ts       # data-access seam
    ├── hooks/
    │   └── useGameSession.ts    # ViewModel for Gameplay
    ├── models/
    │   └── types.ts             # shared domain types
    ├── navigation/
    │   ├── RootNavigator.tsx
    │   └── types.ts
    ├── screens/
    │   ├── HomeScreen.tsx
    │   ├── LevelSelectScreen.tsx
    │   ├── GameplayScreen.tsx
    │   └── PauseScreen.tsx
    ├── store/
    │   └── gameStore.ts         # persisted Model layer (zustand + AsyncStorage)
    ├── theme/
    │   ├── colors.ts
    │   └── typography.ts
    └── utils/
        ├── crosswordGenerator.ts
        ├── wordValidator.ts
        └── wheelGeometry.ts
```
