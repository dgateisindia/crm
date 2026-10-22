import { useLayoutEffect, useRef, useState } from "react";
import { createPortal } from "react-dom";
import "../../styles/floatingActionMenu.css";

export default function FloatingActionMenu({
  anchor,
  menuRef,
  children
}) {
  const localRef = useRef(null);
  const [position, setPosition] = useState(null);

  useLayoutEffect(() => {
    const menu = localRef.current;
    if (!anchor || !menu) return;

    const rect = anchor.getBoundingClientRect();
    const width = menu.offsetWidth;
    const height = menu.offsetHeight;
    const margin = 8;
    const gap = 8;

    const below = window.innerHeight - rect.bottom;
    const above = rect.top;

    const openUp =
      below < height + gap + margin &&
      above > below;

    const preferredTop = openUp
      ? rect.top - height - gap
      : rect.bottom + gap;

    setPosition({
      top: Math.max(
        margin,
        Math.min(
          preferredTop,
          window.innerHeight - height - margin
        )
      ),
      left: Math.max(
        margin,
        Math.min(
          rect.right - width,
          window.innerWidth - width - margin
        )
      )
    });
  }, [anchor]);

  if (!anchor) return null;

  return createPortal(
    <div
      ref={(node) => {
        localRef.current = node;
        if (menuRef) menuRef.current = node;
      }}
      className="crm-floating-action-menu"
      role="menu"
      style={{
        position: "fixed",
        top: position?.top ?? 0,
        left: position?.left ?? 0,
        visibility: position ? "visible" : "hidden",
        zIndex: 10050
      }}
    >
      {children}
    </div>,
    document.body
  );
}
