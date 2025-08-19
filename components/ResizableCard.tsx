"use client";

import React, { useRef, useState } from "react";

type Props = {
  minWidth?: number;
  minHeight?: number;
  maxWidth?: number;
  maxHeight?: number;
  className?: string;
  children: React.ReactNode;
};

export default function ResizableCard({
  minWidth = 280,
  minHeight = 200,
  maxWidth,
  maxHeight,
  className = "",
  children,
}: Props) {
  const ref = useRef<HTMLDivElement>(null);
  const [size, setSize] = useState<{ w?: number; h?: number }>({});

  function onMouseDown(e: React.MouseEvent) {
    e.preventDefault();
    const startX = e.clientX;
    const startY = e.clientY;
    const rect = ref.current?.getBoundingClientRect();
    const startW = rect?.width || 0;
    const startH = rect?.height || 0;

    function onMove(ev: MouseEvent) {
      let w = startW + (ev.clientX - startX);
      let h = startH + (ev.clientY - startY);
      if (minWidth) w = Math.max(w, minWidth);
      if (minHeight) h = Math.max(h, minHeight);
      if (maxWidth) w = Math.min(w, maxWidth);
      if (maxHeight) h = Math.min(h, maxHeight);
      setSize({ w, h });
    }
    function onUp() {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
    }
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
  }

  return (
    <div
      ref={ref}
      className={`relative rounded border bg-white ${className}`}
      style={{ width: size.w, height: size.h }}
    >
      <div className="p-4">{children}</div>
      {/* handle */}
      <div
        onMouseDown={onMouseDown}
        className="absolute bottom-1 right-1 h-3 w-3 cursor-nwse-resize rounded bg-neutral-300"
        title="Drag to resize"
      />
    </div>
  );
}