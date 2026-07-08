// === Frequency Analysis ===
export function frequencyAnalysis(text) {
  const freq = {};
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  for (const c of letters) {
    freq[c] = (freq[c] || 0) + 1;
  }
  const total = letters.length || 1;
  const result = {};
  for (const c in freq) {
    result[c] = { count: freq[c], percentage: ((freq[c] / total) * 100).toFixed(2) };
  }
  return { frequencies: result, totalLetters: letters.length };
}

// English letter frequency (expected)
export const englishFreq = {
  E: 12.7, T: 9.1, A: 8.2, O: 7.5, I: 7.0, N: 6.7, S: 6.3, H: 6.1,
  R: 6.0, D: 4.3, L: 4.0, C: 2.8, U: 2.8, M: 2.4, W: 2.4, F: 2.2,
  G: 2.0, Y: 2.0, P: 1.9, B: 1.5, V: 1.0, K: 0.8, J: 0.15, X: 0.15,
  Q: 0.10, Z: 0.07
};

// === Entropy Calculation ===
export function calculateEntropy(text) {
  if (!text) return 0;
  const freq = {};
  for (const c of text) {
    freq[c] = (freq[c] || 0) + 1;
  }
  const len = text.length;
  let entropy = 0;
  for (const c in freq) {
    const p = freq[c] / len;
    entropy -= p * Math.log2(p);
  }
  return entropy;
}

// === English Score ===
export function englishScore(text) {
  const common = 'ETAOINSHRDLCUMWFGYPBVKJXQZ';
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  if (!letters.length) return 0;
  let score = 0;
  for (const c of letters) {
    const idx = common.indexOf(c);
    if (idx !== -1) score += (26 - idx);
  }
  // Bonus for spaces & common words
  const words = text.toLowerCase().split(/\s+/);
  const commonWords = ['the', 'is', 'in', 'it', 'of', 'and', 'to', 'a', 'for', 'on', 'are', 'was', 'with'];
  for (const w of words) {
    if (commonWords.includes(w)) score += 50;
  }
  return score / letters.length;
}

// === Index of Coincidence ===
export function indexOfCoincidence(text) {
  const letters = text.toUpperCase().replace(/[^A-Z]/g, '');
  const n = letters.length;
  if (n < 2) return 0;
  const freq = {};
  for (const c of letters) freq[c] = (freq[c] || 0) + 1;
  let sum = 0;
  for (const c in freq) sum += freq[c] * (freq[c] - 1);
  return sum / (n * (n - 1));
}

// === Kasiski Examination (Vigenère key length) ===
export function kasiskiExamination(text, minLen = 3) {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const distances = {};
  
  for (let len = minLen; len <= Math.min(6, clean.length / 2); len++) {
    for (let i = 0; i <= clean.length - len; i++) {
      const sub = clean.substring(i, i + len);
      for (let j = i + len; j <= clean.length - len; j++) {
        if (clean.substring(j, j + len) === sub) {
          const dist = j - i;
          distances[dist] = (distances[dist] || 0) + 1;
        }
      }
    }
  }

  // Find GCDs of distances
  const dists = Object.keys(distances).map(Number).filter(d => d > 1);
  const factors = {};
  for (const d of dists) {
    for (let f = 2; f <= Math.min(d, 20); f++) {
      if (d % f === 0) factors[f] = (factors[f] || 0) + distances[d];
    }
  }

  return Object.entries(factors)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 5)
    .map(([len, score]) => ({ keyLength: parseInt(len), score }));
}

// === N-gram Analysis ===
export function ngramAnalysis(text, n = 2) {
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const grams = {};
  for (let i = 0; i <= clean.length - n; i++) {
    const gram = clean.substring(i, i + n);
    grams[gram] = (grams[gram] || 0) + 1;
  }
  return Object.entries(grams)
    .sort((a, b) => b[1] - a[1])
    .slice(0, 20)
    .map(([gram, count]) => ({ gram, count }));
}

// === Detect Encoding / Cipher Type ===
export function detectType(text) {
  const suggestions = [];
  
  // Check Base64
  if (/^[A-Za-z0-9+/]+=*$/.test(text.trim()) && text.length > 3) {
    suggestions.push({ type: 'Base64', confidence: 85 });
  }
  
  // Check Hex
  if (/^[0-9a-fA-F\s]+$/.test(text.trim()) && text.replace(/\s/g, '').length % 2 === 0) {
    suggestions.push({ type: 'Hexadecimal', confidence: 80 });
  }
  
  // Check Binary
  if (/^[01\s]+$/.test(text.trim())) {
    suggestions.push({ type: 'Binary', confidence: 90 });
  }
  
  // Check Morse
  if (/^[.\-/ ]+$/.test(text.trim())) {
    suggestions.push({ type: 'Morse Code', confidence: 85 });
  }
  
  // Check Octal
  if (/^[0-7\s]+$/.test(text.trim())) {
    suggestions.push({ type: 'Octal', confidence: 60 });
  }
  
  // Check URL encoded
  if (/%[0-9A-Fa-f]{2}/.test(text)) {
    suggestions.push({ type: 'URL Encoded', confidence: 90 });
  }
  
  // Check Unicode escape
  if (/\\u[0-9a-fA-F]{4}/.test(text)) {
    suggestions.push({ type: 'Unicode Escape', confidence: 95 });
  }
  
  // Check Bacon's cipher
  if (/^[AaBb\s]+$/.test(text.trim()) && text.replace(/\s/g, '').length % 5 === 0) {
    suggestions.push({ type: "Bacon's Cipher", confidence: 75 });
  }
  
  // Check Polybius
  if (/^[1-5\s]+$/.test(text.trim()) && text.replace(/\s/g, '').length % 2 === 0) {
    suggestions.push({ type: 'Polybius Square', confidence: 70 });
  }

  // Entropy-based detection
  const entropy = calculateEntropy(text);
  if (entropy > 4.5 && /^[A-Za-z]+$/.test(text.trim())) {
    const ioc = indexOfCoincidence(text);
    if (ioc < 0.05) {
      suggestions.push({ type: 'Polyalphabetic Cipher (Vigenère)', confidence: 65 });
    } else if (ioc > 0.06) {
      suggestions.push({ type: 'Monoalphabetic Cipher (Caesar/Substitution)', confidence: 60 });
    }
  }

  // Check for shifted text (Caesar)
  if (/^[A-Za-z\s]+$/.test(text.trim()) && entropy < 4.5) {
    suggestions.push({ type: 'Caesar Cipher', confidence: 50 });
  }

  return suggestions.sort((a, b) => b.confidence - a.confidence);
}

// === Block Repetition Detection (ECB detection) ===
export function detectBlockRepetition(hex, blockSize = 16) {
  const clean = hex.replace(/\s/g, '');
  const blocks = [];
  for (let i = 0; i < clean.length; i += blockSize * 2) {
    blocks.push(clean.substring(i, i + blockSize * 2));
  }
  const unique = new Set(blocks);
  return {
    totalBlocks: blocks.length,
    uniqueBlocks: unique.size,
    repeatedBlocks: blocks.length - unique.size,
    isECB: unique.size < blocks.length,
    repetitionRate: ((blocks.length - unique.size) / blocks.length * 100).toFixed(1)
  };
}