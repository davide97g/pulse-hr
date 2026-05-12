export interface TextToken {
  text: string;
  brand: boolean;
}

/**
 * Split text into per-word tokens. Words wrapped between `*` markers render
 * in brand color. Markers may span a single word (`*now*`) or several
 * (`*plain English*`). Trailing punctuation after a closing marker is kept.
 */
export const tokenizeBrandText = (raw: string): TextToken[] => {
  const words = raw.split(" ");
  const result: TextToken[] = [];
  let inBrand = false;
  for (const word of words) {
    let text = word;
    let opens = false;
    if (text.startsWith("*")) {
      opens = true;
      text = text.slice(1);
    }
    let closes = false;
    const tail = text.match(/^(.*)\*([.,!?:;]?)$/);
    if (tail) {
      text = tail[1] + tail[2];
      closes = true;
    }
    const brand = inBrand || opens;
    result.push({ text, brand });
    if (opens) inBrand = true;
    if (closes) inBrand = false;
  }
  return result;
};
