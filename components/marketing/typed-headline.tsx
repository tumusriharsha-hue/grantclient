"use client";

import { useEffect, useState } from "react";

const HEADLINE = "Find grants. Draft faster. Track everything.";
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
        {HEADLINE.slice(0, characterCount)}
        <span
          className={`ml-1 inline-block h-[0.9em] w-[3px] translate-y-[0.08em] ${
            cursorIsBlack ? "bg-black" : "bg-white"
          }`}
        />
      </span>
    </span>
  );
}
