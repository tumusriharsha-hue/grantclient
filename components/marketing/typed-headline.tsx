"use client";

import { useEffect, useState } from "react";

const HEADLINE = "Find grants. Draft faster. Track everything.";
const UNDERLINED_WORD = "everything";
const UNDERLINED_PHRASE = "everything.";
const START_DELAY_MS = 250;
const PHRASE_PAUSE_MS = 520;
const CHARACTER_DELAYS_MS = [34, 42, 29, 38, 46, 31, 36, 44, 33, 40];

function getNextCharacterDelay(characterCount: number) {
  const typedCharacter = HEADLINE[characterCount - 1];

  if (typedCharacter === "." && characterCount < HEADLINE.length) {
    return PHRASE_PAUSE_MS;
  }

  if (typedCharacter === " ") {
    return 70;
  }

  return CHARACTER_DELAYS_MS[characterCount % CHARACTER_DELAYS_MS.length];
}

export function TypedHeadline() {
  const [characterCount, setCharacterCount] = useState(0);
  const [cursorIsBlack, setCursorIsBlack] = useState(true);
  const isComplete = characterCount >= HEADLINE.length;

  useEffect(() => {
    let timeout: number | undefined;
    let nextCharacterCount = 0;

    function typeNextCharacter(delay: number) {
      timeout = window.setTimeout(() => {
        nextCharacterCount += 1;
        setCharacterCount(nextCharacterCount);

        if (nextCharacterCount < HEADLINE.length) {
          typeNextCharacter(getNextCharacterDelay(nextCharacterCount));
        }
      }, delay);
    }

    typeNextCharacter(START_DELAY_MS);

    return () => {
      if (timeout !== undefined) {
        window.clearTimeout(timeout);
      }
    };
  }, []);

  useEffect(() => {
    if (!isComplete) {
      return;
    }

    const interval = window.setInterval(() => {
      setCursorIsBlack((isBlack) => !isBlack);
    }, 500);

    return () => window.clearInterval(interval);
  }, [isComplete]);

  return (
    <span className="relative inline-block" aria-label={HEADLINE}>
      <span className="invisible" aria-hidden="true">
        {HEADLINE}
      </span>
      <span className="absolute inset-0" aria-hidden="true">
        {HEADLINE.slice(0, characterCount).includes(UNDERLINED_WORD) ? (
          <>
            {HEADLINE.slice(0, HEADLINE.indexOf(UNDERLINED_WORD))}
            <span className="relative inline-block whitespace-nowrap">
              {UNDERLINED_WORD}
              <span
                className="headline-underline"
                data-visible={isComplete ? "true" : "false"}
                aria-hidden="true"
              />
              {HEADLINE.slice(
                HEADLINE.indexOf(UNDERLINED_WORD) + UNDERLINED_WORD.length,
                Math.min(
                  characterCount,
                  HEADLINE.indexOf(UNDERLINED_WORD) + UNDERLINED_PHRASE.length,
                ),
              )}
            </span>
            {HEADLINE.slice(
              HEADLINE.indexOf(UNDERLINED_WORD) + UNDERLINED_PHRASE.length,
              characterCount,
            )}
          </>
        ) : (
          HEADLINE.slice(0, characterCount)
        )}
        <span
          className="typed-headline-cursor ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.08em]"
          data-visible={cursorIsBlack ? "true" : "false"}
        />
      </span>
    </span>
  );
}
