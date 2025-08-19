// lib/exportToPdf.ts
import html2canvas from "html2canvas";
import jsPDF from "jspdf";

export type ExportOptions = {
  logo?: string;            // dataURL
  title?: string;           // header title
  orientation?: "p" | "l";  // portrait|landscape (default landscape)
  pageSize?: "a4" | "letter";
  margin?: number;          // pt
  scale?: number;           // html2canvas scale multiplier
};

/**
 * Export a DOM element to PDF, capturing the full scroll size (not just the visible part).
 * If a child has data-export-width/height (as in TaktPlanSection), those are preferred.
 */
export async function exportElementToPdf(
  el: HTMLElement,
  filename: string,
  opts: ExportOptions = {}
) {
  const {
    logo,
    title = "",
    orientation = "l",
    pageSize = "a4",
    margin = 24, // points
    scale = 2,
  } = opts;

  // If TaktPlanSection exposed explicit dimensions, use them
  const size = (window as any).__TAKTR_GET_EXPORT_SIZE?.();
  const target = (size ? el.querySelector("[data-export-width][data-export-height]") : null) as HTMLElement | null;
  const width = size?.w || (target ? target.scrollWidth : el.scrollWidth);
  const height = size?.h || (target ? target.scrollHeight : el.scrollHeight);

  // Clone offscreen at full size so we can render everything in one go
  const clone = el.cloneNode(true) as HTMLElement;
  clone.style.width = width + "px";
  clone.style.height = height + "px";
  clone.style.maxWidth = "none";
  clone.style.maxHeight = "none";
  clone.style.overflow = "visible";

  const wrapper = document.createElement("div");
  wrapper.style.position = "fixed";
  wrapper.style.left = "-100000px";
  wrapper.style.top = "0";
  wrapper.appendChild(clone);
  document.body.appendChild(wrapper);

  try {
    const canvas = await html2canvas(clone, {
      backgroundColor: "#ffffff",
      scale,
      useCORS: true,
      logging: false,
      width,
      height,
      windowWidth: width,
      windowHeight: height,
    });

    const pdf = new jsPDF({ orientation, unit: "pt", format: pageSize });
    const pageW = pdf.internal.pageSize.getWidth();
    const pageH = pdf.internal.pageSize.getHeight();

    // Header space
    const headerH = 36; // pt
    const usableW = pageW - margin * 2;
    const usableH = pageH - margin * 2 - headerH;

    // Scale image to page width, then slice vertically across pages
    const imgW = usableW;
    const imgH = (canvas.height * imgW) / canvas.width;

    let remaining = imgH;
    let sy = 0; // source y within big canvas
    const sliceH = (usableH / imgH) * canvas.height; // source slice height per page
    let pageIndex = 0;

    while (remaining > 0) {
      if (pageIndex > 0) pdf.addPage();

      // Header: logo (left) + title (center)
      if (logo) {
        try {
          const logoW = headerH * 2.2;
          pdf.addImage(logo, "PNG", margin, margin, logoW, headerH);
        } catch {
          // ignore bad logo data
        }
      }
      if (title) {
        pdf.setFontSize(12);
        pdf.text(title, pageW / 2, margin + headerH / 2 + 4, {
          align: "center",
          baseline: "middle" as any,
        });
      }

      // Slice a portion of the big canvas for this page
      const sWidth = canvas.width;
      const sHeight = Math.min(sliceH, canvas.height - sy);
      const dWidth = imgW;
      const dHeight = (sHeight / canvas.height) * imgH;

      const pageCanvas = document.createElement("canvas");
      pageCanvas.width = sWidth;
      pageCanvas.height = sHeight;
      const ctx = pageCanvas.getContext("2d")!;
      ctx.drawImage(canvas, 0, sy, sWidth, sHeight, 0, 0, sWidth, sHeight);
      const pageImg = pageCanvas.toDataURL("image/png");

      pdf.addImage(pageImg, "PNG", margin, margin + headerH, dWidth, dHeight, undefined, "FAST");

      remaining -= dHeight;
      sy += sHeight;
      pageIndex++;
    }

    pdf.save(filename);
  } finally {
    document.body.removeChild(wrapper);
  }
}

// ---- Logo helpers (optional) ----------------------------------------------

export const EXPORT_LOGO_KEY = "exportLogo";

/** Return the saved logo dataURL from localStorage (if any). */
export function getStoredLogo(): string | null {
  if (typeof window === "undefined") return null;
  try {
    return localStorage.getItem(EXPORT_LOGO_KEY);
  } catch {
    return null;
  }
}

/** Remove the saved logo from localStorage. */
export function clearStoredLogo(): void {
  if (typeof window === "undefined") return;
  try {
    localStorage.removeItem(EXPORT_LOGO_KEY);
  } catch {
    /* ignore */
  }
}

/**
 * Opens a file picker for an image, stores it in localStorage under EXPORT_LOGO_KEY,
 * and returns the dataURL (or null if the user cancels).
 *
 * Usage:
 *   const logo = await chooseAndStoreLogo();
 *   if (logo) setExportLogo(logo);
 */
export async function chooseAndStoreLogo(): Promise<string | null> {
  if (typeof window === "undefined") return null;

  return new Promise<string | null>((resolve) => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.style.position = "fixed";
    input.style.left = "-9999px";
    document.body.appendChild(input);

    input.onchange = () => {
      const file = input.files?.[0];
      if (!file) {
        cleanup();
        resolve(null);
        return;
      }
      const reader = new FileReader();
      reader.onload = () => {
        const dataUrl = String(reader.result || "");
        try {
          localStorage.setItem(EXPORT_LOGO_KEY, dataUrl);
        } catch {
          // ignore quota or storage errors
        }
        cleanup();
        resolve(dataUrl);
      };
      reader.onerror = () => {
        cleanup();
        resolve(null);
      };
      reader.readAsDataURL(file);
    };

    function cleanup() {
      document.body.removeChild(input);
    }

    input.click();
  });
}