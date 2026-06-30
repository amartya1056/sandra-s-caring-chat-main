// Collapse immediately-repeated phrases of 1..6 words.
// e.g. "my name is my name is Amartya" -> "my name is Amartya"
export function collapseRepeats(input: string): string {
  if (!input) return input;
  let words = input.trim().split(/\s+/);
  for (let n = 6; n >= 1; n--) {
    let i = 0;
    const out: string[] = [];
    while (i < words.length) {
      if (i + 2 * n <= words.length) {
        let equal = true;
        for (let k = 0; k < n; k++) {
          if (words[i + k].toLowerCase().replace(/[^\p{L}\p{N}]/gu, "") !==
              words[i + n + k].toLowerCase().replace(/[^\p{L}\p{N}]/gu, "")) {
            equal = false; break;
          }
        }
        if (equal) {
          // drop one copy: push first n, skip next n
          for (let k = 0; k < n; k++) out.push(words[i + k]);
          i += 2 * n;
          continue;
        }
      }
      out.push(words[i]);
      i++;
    }
    words = out;
  }
  return words.join(" ");
}
