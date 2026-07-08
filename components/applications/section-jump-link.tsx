"use client";

interface SectionJumpLinkProps {
  targetId: string;
  className?: string;
  children: React.ReactNode;
}

export function SectionJumpLink({
  targetId,
  className,
  children,
}: SectionJumpLinkProps) {
  function handleClick(event: React.MouseEvent<HTMLAnchorElement>) {
    const target = document.getElementById(targetId);

    if (!target) return;

    event.preventDefault();
    window.history.pushState(null, "", `#${targetId}`);
    target.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <a href={`#${targetId}`} className={className} onClick={handleClick}>
      {children}
    </a>
  );
}
