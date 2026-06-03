"use client";

import type { MouseEvent } from "react";
import { useSmoothScrollTo } from "@/presentation/hooks/useSmoothScrollTo";

interface FooterNavItem {
  href: string;
  label: string;
  section: string;
}

interface FooterNavProps {
  heading: string;
  items: FooterNavItem[];
}

export function FooterNav({ heading, items }: FooterNavProps) {
  const scrollTo = useSmoothScrollTo();

  function makeClickHandler(section: string) {
    return (event: MouseEvent<HTMLAnchorElement>) => {
      event.preventDefault();
      scrollTo(section);
    };
  }

  return (
    <div className="footer-col">
      <h5>{heading}</h5>
      {items.map((item) => (
        <a key={item.section} href={item.href} onClick={makeClickHandler(item.section)}>
          {item.label}
        </a>
      ))}
    </div>
  );
}
