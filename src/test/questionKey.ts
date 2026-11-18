/**
 * A question's identity in tests: its prompt and its options. Shapes such as "Which of these countries covers the
 * most ground?" repeat their prompt in many articles with different options (27-quiz-variety).
 */
export const questionKey = (prompt: string, options: readonly string[]): string => `${prompt}|${[...options].sort().join('|')}`;

/** The key of the question card on screen (read before any hint takes an option away). */
export function questionKeyOnScreen(prompt: string): string {
  const options = [...document.querySelectorAll('.question__options .question__option')].map((el) =>
    (el.textContent ?? '').replace(/\s*\(the answer\)\s*$/, '').trim(),
  );
  return questionKey(prompt, options);
}
