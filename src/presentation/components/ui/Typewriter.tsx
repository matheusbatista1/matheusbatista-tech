"use client";

import { useEffect, useState } from "react";

interface TypewriterProps {
  phrases: string[];
  speed?: number;
  pause?: number;
}

export function Typewriter({ phrases, speed = 60, pause = 1400 }: TypewriterProps) {
  const [text, setText] = useState("");
  const [index, setIndex] = useState(0);
  const [direction, setDirection] = useState<1 | -1>(1);

  useEffect(() => {
    if (phrases.length === 0) return;
    const word = phrases[index % phrases.length] ?? "";
    let delay = speed;
    if (direction === 1 && text === word) delay = pause;
    if (direction === -1 && text === "") delay = 200;

    const id = window.setTimeout(() => {
      if (direction === 1) {
        if (text === word) {
          setDirection(-1);
        } else {
          setText(word.slice(0, text.length + 1));
        }
      } else {
        if (text === "") {
          setDirection(1);
          setIndex((i) => i + 1);
        } else {
          setText(word.slice(0, text.length - 1));
        }
      }
    }, delay);

    return () => window.clearTimeout(id);
  }, [text, direction, index, phrases, speed, pause]);

  return (
    <span>
      {text}
      <span className="caret">|</span>
    </span>
  );
}
