"use client";

import { useEffect, useMemo, useState } from "react";
import type { CSSProperties } from "react";

type Props = {
  items: ReadonlyArray<readonly [id: string, label: string]>;
  label: string;
};

export function SectionNavigator({ items, label }: Props) {
  const ids = useMemo(() => items.map(([id]) => id), [items]);
  const [activeId, setActiveId] = useState(ids[0] ?? "");

  useEffect(() => {
    if (!ids.length) return;
    const sections = ids
      .map((id) => document.getElementById(id))
      .filter((section): section is HTMLElement => Boolean(section));
    if (!sections.length) return;

    const observer = new IntersectionObserver(
      (entries) => {
        const visible = entries
          .filter((entry) => entry.isIntersecting)
          .sort((a, b) => b.intersectionRatio - a.intersectionRatio || a.boundingClientRect.top - b.boundingClientRect.top);
        if (visible[0]?.target.id) setActiveId(visible[0].target.id);
      },
      { rootMargin: "-18% 0px -64% 0px", threshold: [0, 0.12, 0.35, 0.65] },
    );

    sections.forEach((section) => observer.observe(section));
    return () => observer.disconnect();
  }, [ids]);

  const activeIndex = Math.max(0, ids.indexOf(activeId));
  const progress = items.length > 1 ? activeIndex / (items.length - 1) : 1;

  return (
    <nav className="toc toc--interactive" aria-label={label} style={{ "--toc-progress": progress } as CSSProperties}>
      <div className="toc__header">
        <span>{label}</span>
        <output aria-hidden="true">{String(activeIndex + 1).padStart(2, "0")} / {String(items.length).padStart(2, "0")}</output>
      </div>
      <div className="toc__meter" aria-hidden="true"><i /></div>
      <div className="toc__links">
        {items.map(([id, itemLabel], index) => (
          <a
            href={`#${id}`}
            aria-current={activeId === id ? "location" : undefined}
            onClick={() => setActiveId(id)}
            key={id}
          >
            <small aria-hidden="true">{String(index + 1).padStart(2, "0")}</small>
            <span>{itemLabel}</span>
          </a>
        ))}
      </div>
    </nav>
  );
}
