import { Font } from "@react-pdf/renderer";

export const DEVANAGARI_FONT = "Noto Sans Devanagari";

let registered = false;

/** Register the Devanagari font family (regular + bold) once per page load. */
export function registerPdfFonts() {
  if (registered) return;
  registered = true;
  Font.register({
    family: DEVANAGARI_FONT,
    fonts: [
      { src: "/fonts/NotoSansDevanagari-Regular.ttf", fontWeight: 400 },
      { src: "/fonts/NotoSansDevanagari-Bold.ttf", fontWeight: 700 },
    ],
  });
  // Never hyphenate: splitting Devanagari conjuncts breaks shaping.
  Font.registerHyphenationCallback((word) => [word]);
}
