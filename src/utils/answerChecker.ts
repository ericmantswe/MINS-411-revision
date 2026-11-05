/**
 * Helper to normalize and check typed answers against acceptable variants.
 */

export function normalizeAnswer(ans: string): string {
  return ans
    .trim()
    .toLowerCase()
    .replace(/\s+/g, ' ')
    .replace(/,\s*/g, ',')
    .replace(/;\s*/g, ';')
    .replace(/=\s*/g, '=');
}

/**
 * Normalizes hex numbers: e.g., '0a5h' -> 'a5', '0xa5' -> 'a5', 'a5h' -> 'a5', '#0a5h' -> 'a5'
 */
export function normalizeHexToken(token: string): string {
  let cleaned = token.trim().toLowerCase().replace(/^#/, '').replace(/^0x/, '');
  if (cleaned.endsWith('h')) {
    cleaned = cleaned.slice(0, -1);
  }
  // Remove leading zeros but keep at least 1 digit
  cleaned = cleaned.replace(/^0+([0-9a-f]+)$/, '$1');
  return cleaned;
}

/**
 * Normalize a bit address like "27H.2" or "27.2" or "byte 27H bit 2" into a canonical "27.2"
 * We do NOT blindly strip 'h' — we first parse the byte part as hex.
 */
function normalizeBitAddress(input: string): string {
  const lower = input.trim().toLowerCase();

  // Try to match patterns: "27h.2", "27.2", "byte 27h bit 2", "27h bit 2", "27 bit 2"
  // Pattern 1: 0x__ or __H.__ or just __.__ with possible spaces
  const dotPattern = lower.match(/^(0x[0-9a-f]+|[0-9a-f]+h?)\s*\.\s*([0-7])$/);
  if (dotPattern) {
    const byteHex = normalizeHexToken(dotPattern[1]);
    return `${byteHex}.${dotPattern[2]}`;
  }

  // Pattern 2: "byte 27h bit 2" or "27h bit 2"
  const wordPattern = lower.match(/(?:byte\s+)?(0x[0-9a-f]+|[0-9a-f]+h?)\s+bit\s+([0-7])$/);
  if (wordPattern) {
    const byteHex = normalizeHexToken(wordPattern[1]);
    return `${byteHex}.${wordPattern[2]}`;
  }

  return lower; // fallback: return unchanged
}

export function checkTypedAnswer(userVal: string, acceptableVariants: string[]): boolean {
  if (!userVal || !userVal.trim()) return false;

  const normUser = normalizeAnswer(userVal);

  for (const variant of acceptableVariants) {
    const normVariant = normalizeAnswer(variant);

    // 1. Exact string match after normalization
    if (normUser === normVariant) return true;

    // 2. Direct hex equivalency check (e.g. 15H vs 0x15 vs 15 vs 015H)
    const userHex = normalizeHexToken(normUser);
    const variantHex = normalizeHexToken(normVariant);
    if (userHex.length > 0 && userHex === variantHex) {
      // Guard: only trust if both look like valid hex strings
      if (/^[0-9a-f]+$/.test(userHex)) {
        return true;
      }
    }

    // 3. Bit address normalization: e.g., 27H.2 vs 27.2 vs "byte 27H bit 2"
    const userBit = normalizeBitAddress(normUser);
    const variantBit = normalizeBitAddress(normVariant);
    if (
      userBit !== normUser || variantBit !== normVariant // at least one was actually a bit address
    ) {
      if (userBit === variantBit) return true;
    }

    // 4. Multi-token flag matches (e.g. A=00H, CY=1, AC=1, OV=0, P=0 in any order)
    if (normVariant.includes('cy=') || normVariant.includes('a=') || normVariant.includes('ov=')) {
      const extractFlags = (str: string) => {
        const map: Record<string, string> = {};
        const matches = str.match(/([a-z0-9_]+)\s*[:=]\s*([0-9a-f]+h?)/gi);
        if (matches) {
          for (const m of matches) {
            const eqIdx = m.search(/[:=]/);
            if (eqIdx !== -1) {
              const k = m.slice(0, eqIdx).trim().toLowerCase();
              const v = m.slice(eqIdx + 1).trim().toLowerCase();
              if (k && v) {
                map[k] = normalizeHexToken(v);
              }
            }
          }
        }
        return map;
      };

      const userMap = extractFlags(normUser);
      const varMap = extractFlags(normVariant);

      if (Object.keys(varMap).length > 0 && Object.keys(userMap).length === Object.keys(varMap).length) {
        let allMatch = true;
        for (const k of Object.keys(varMap)) {
          if (userMap[k] !== varMap[k]) {
            allMatch = false;
            break;
          }
        }
        if (allMatch) return true;
      }
    }
  }

  return false;
}
