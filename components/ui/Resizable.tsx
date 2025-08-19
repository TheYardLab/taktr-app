// components/ui/Resizable.tsx
import React, { useCallback, useEffect, useRef, useState } from "react";

type Dir = "vertical" | "horizontal" | "both";

type Props = {
  children: React.ReactNode;
  /** default size in px (height for vertical, width for horizontal) */
  defaultSize?: number;
  /** min size in px */
  minSize?: number;
  /** max size in px; omit for none */
  maxSize?: number;
  /** which direction the panel can be resized */
  direction?: Dir;
  /** unique key to persist the size in localStorage */
  storageKey?: string;
  /** extra classes on the wrapper */
  className?: string;
};

/**
 * Lightweight, dependency-free resizable panel.
 * - direction="vertical": drags the bottom edge to change height
 * - direction="horizontal": drags the right edge to change width
 * - direction="both": shows both handles
 */
const Resizable: React.FC<Props> = ({
  children,
  defaultSize = 560,
  minSize = 280,
  maxSize,
  direction = "vertical",
  storageKey,
  className = "",
}) => {
  const isV = direction === "vertical" || direction === "both";
  const isH = direction === "horizontal" || direction === "both";

  const [size, setSize] = useState<number>(() => {
    if (storageKey && typeof window !== "undefined") {
      const raw = localStorage.getItem(`resizable:${storageKey}`);
      const n = raw ? Number(raw) : NaN;
      if (Number.isFinite(n) && n > 0) return n;
    }
    return defaultSize;
  });

  const save = useCallback(
    (val: number) => {
      if (storageKey && typeof window !== "undefined") {
        localStorage.setItem(`resizable:${storageKey}`, String(val));
      }
    },
    [storageKey]
  );

  useEffect(() => {
    // clamp once on mount
    setSize((prev) => {
      const clamped = Math.max(minSize, maxSize ? Math.min(prev, maxSize) : prev);
      if (clamped !== prev) save(clamped);
      return clamped;
    });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const startPos = useRef(0);
  const startSize = useRef(0);
  const dragging = useRef<"v" | "h" | null>(null);

  const onMove = useCallback(
    (clientX: number, clientY: number) => {
      if (!dragging.current) return;
      let next = startSize.current;

      if (dragging.current === "v") {
        const delta = clientY - startPos.current;
        next = startSize.current + delta;
      } else if (dragging.current === "h") {
        const delta = clientX - startPos.current;
        next = startSize.current + delta;
      }

      next = Math.max(minSize, maxSize ? Math.min(next, maxSize) : next);
      setSize(next);
    },
    [maxSize, minSize]
  );

  const mouseMove = useCallback(
    (e: MouseEvent) => onMove(e.clientX, e.clientY),
    [onMove]
  );
  const touchMove = useCallback(
    (e: TouchEvent) => {
      if (e.cancelable) e.preventDefault();
      const t = e.touches[0];
      if (t) onMove(t.clientX, t.clientY);
    },
    [onMove]
  );

  const stop = useCallback(() => {
    if (dragging.current) {
      save(size);
      dragging.current = null;
      document.body.style.cursor = "";
    }
    window.removeEventListener("mousemove", mouseMove);
    window.removeEventListener("mouseup", stop);
    window.removeEventListener("touchmove", touchMove);
    window.removeEventListener("touchend", stop);
  }, [save, size, mouseMove, touchMove]);

  const startDrag = (kind: "v" | "h") => (e: React.MouseEvent | React.TouchEvent) => {
    dragging.current = kind;
    if ("touches" in e) {
      const t = e.touches[0];
      startPos.current = kind === "v" ? t.clientY : t.clientX;
    } else {
      startPos.current = kind === "v" ? e.clientY : e.clientX;
    }
    startSize.current = size;
    document.body.style.cursor = kind === "v" ? "ns-resize" : "ew-resize";
    window.addEventListener("mousemove", mouseMove);
    window.addEventListener("mouseup", stop);
    window.addEventListener("touchmove", touchMove, { passive: false });
    window.addEventListener("touchend", stop);
  };

  return (
    <div
      className={`relative overflow-auto rounded border bg-white shadow ${className}`}
      style={{
        height: isV ? size : undefined,
        width: isH ? size : undefined,
      }}
    >
      {children}

      {isV && (
        <div
          role="separator"
          aria-label="Resize vertically"
          onMouseDown={startDrag("v")}
          onTouchStart={startDrag("v")}
          className="absolute inset-x-0 bottom-0 h-2 cursor-ns-resize select-none"
          style={{
            // visual grip
            background:
              "linear-gradient(to right, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
          }}
          title="Drag to resize"
        />
      )}

      {isH && (
        <div
          role="separator"
          aria-label="Resize horizontally"
          onMouseDown={startDrag("h")}
          onTouchStart={startDrag("h")}
          className="absolute inset-y-0 right-0 w-2 cursor-ew-resize select-none"
          style={{
            background:
              "linear-gradient(to bottom, transparent 0%, rgba(0,0,0,0.06) 50%, transparent 100%)",
          }}
          title="Drag to resize"
        />
      )}
    </div>
  );
};

export default Resizable;