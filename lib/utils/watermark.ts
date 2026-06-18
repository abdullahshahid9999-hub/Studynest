// lib/utils/watermark.ts
// Stamps a faint, tiled "StudyNest" watermark across every page of a PDF.
// Works in the browser (used by the admin approve flow) and in Node.

import { PDFDocument, StandardFonts, rgb, degrees } from 'pdf-lib';

export async function watermarkPdfBytes(input: ArrayBuffer | Uint8Array): Promise<Uint8Array> {
  const pdf = await PDFDocument.load(input, { ignoreEncryption: true });
  const font = await pdf.embedFont(StandardFonts.HelveticaBold);
  const text = 'StudyNest';

  for (const page of pdf.getPages()) {
    const { width, height } = page.getSize();
    const size = Math.max(16, Math.min(width, height) * 0.045);
    const stepX = 220;
    const stepY = 150;
    for (let y = -40; y < height + stepY; y += stepY) {
      for (let x = -60; x < width + stepX; x += stepX) {
        page.drawText(text, {
          x, y, size, font,
          color: rgb(0.45, 0.47, 0.55),
          rotate: degrees(35),
          opacity: 0.12,
        });
      }
    }
  }

  return pdf.save();
}
