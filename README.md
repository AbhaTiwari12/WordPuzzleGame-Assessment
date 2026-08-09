# WordPuzzleGame-Assessment
The app uses MVVM-style architecture: the Model manages data and state, the ViewModel manages game logic and actions, and the View only handles UI presentation.
Swipe logic: As the player swipes around the wheel, the app detects which letter position the finger enters and stores its index. This handles duplicate letters correctly. A line follows the finger in real time, and when released, the word is checked as grid, bonus, repeat, or invalid, with matching feedback.
Level data: Each level only stores id, letters, and words. The app generates the crossword layout at runtime: it places the longest word first, then tries to intersect other words with it or existing words. Words that cannot fit become bonus words instead of grid entries.
