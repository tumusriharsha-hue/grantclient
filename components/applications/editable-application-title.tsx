"use client";

import { useLayoutEffect, useRef, useState } from "react";

interface EditableApplicationTitleProps {
  initialTitle: string;
  name?: string;
}

export function EditableApplicationTitle({
  initialTitle,
  name,
}: EditableApplicationTitleProps) {
  const [title, setTitle] = useState(initialTitle);
  const textareaRef = useRef<HTMLTextAreaElement>(null);
  const longestLineLength = Math.max(
    16,
    ...title.split("\n").map((line) => Math.ceil(line.length * 0.8) + 3),
  );
  const titleWidth = `${Math.min(longestLineLength, 54)}ch`;

  useLayoutEffect(() => {
    const textarea = textareaRef.current;

    if (!textarea) return;

    textarea.style.height = "0px";
    textarea.style.height = `${textarea.scrollHeight}px`;
  }, [title]);

  return (
    <textarea
      ref={textareaRef}
      aria-label="Application name"
      name={name}
      placeholder="Application Name"
      value={title}
      onChange={(event) => setTitle(event.target.value)}
      rows={1}
      style={{ width: titleWidth }}
      className="-ml-3 block max-h-40 min-h-12 max-w-full resize-none overflow-hidden rounded-md border border-border bg-bg px-3 py-2 text-2xl font-bold leading-tight text-text transition-colors hover:border-border-hover focus:border-border-hover focus:outline-none focus-visible:!outline-none"
    />
  );
}
