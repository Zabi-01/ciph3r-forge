// === ROT13 / ROT47 ===
export function rot13(text) {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + 13) % 26) + base);
  });
}

export function rot47(text) {
  return text.replace(/[!-~]/g, c => {
    return String.fromCharCode(((c.charCodeAt(0) - 33 + 47) % 94) + 33);
  });
}

// === Caesar Cipher ===
export function caesarEncrypt(text, shift) {
  shift = ((shift % 26) + 26) % 26;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

export function caesarDecrypt(text, shift) {
  return caesarEncrypt(text, 26 - shift);
}

export function caesarBruteForce(text) {
  const results = [];
  for (let i = 0; i < 26; i++) {
    results.push({ shift: i, result: caesarDecrypt(text, i) });
  }
  return results;
}

// === Vigenère Cipher ===
export function vigenereEncrypt(text, key) {
  if (!key) return text;
  key = key.toUpperCase();
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = key.charCodeAt(ki % key.length) - 65;
    ki++;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

export function vigenereDecrypt(text, key) {
  if (!key) return text;
  key = key.toUpperCase();
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = key.charCodeAt(ki % key.length) - 65;
    ki++;
    return String.fromCharCode(((c.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
}

// === Affine Cipher ===
function modInverse(a, m) {
  for (let i = 1; i < m; i++) {
    if ((a * i) % m === 1) return i;
  }
  return -1;
}

export function affineEncrypt(text, a, b) {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    return String.fromCharCode(((a * x + b) % 26) + base);
  });
}

export function affineDecrypt(text, a, b) {
  const aInv = modInverse(a, 26);
  if (aInv === -1) return 'Error: a has no modular inverse (gcd(a,26) ≠ 1)';
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const x = c.charCodeAt(0) - base;
    return String.fromCharCode((((aInv * (x - b + 26)) % 26) + 26) % 26 + base);
  });
}

// === Rail Fence Cipher ===
export function railFenceEncrypt(text, rails) {
  if (rails < 2) return text;
  const fence = Array.from({ length: rails }, () => []);
  let rail = 0, dir = 1;
  for (const c of text) {
    fence[rail].push(c);
    if (rail === 0) dir = 1;
    if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  return fence.flat().join('');
}

export function railFenceDecrypt(text, rails) {
  if (rails < 2) return text;
  const n = text.length;
  const fence = Array.from({ length: rails }, () => []);
  const pattern = [];
  let rail = 0, dir = 1;
  for (let i = 0; i < n; i++) {
    pattern.push(rail);
    if (rail === 0) dir = 1;
    if (rail === rails - 1) dir = -1;
    rail += dir;
  }
  const counts = new Array(rails).fill(0);
  pattern.forEach(r => counts[r]++);
  const offsets = [0];
  for (let i = 1; i < rails; i++) offsets[i] = offsets[i - 1] + counts[i - 1];
  const positions = new Array(rails).fill(0);
  const result = new Array(n);
  for (let i = 0; i < n; i++) {
    const r = pattern[i];
    result[i] = text[offsets[r] + positions[r]];
    positions[r]++;
  }
  return result.join('');
}

// === XOR Cipher ===
export function xorEncrypt(text, key) {
  if (!key) return text;
  return Array.from(text).map((c, i) => {
    const keyChar = typeof key === 'number' ? key : key.charCodeAt(i % key.length);
    return String.fromCharCode(c.charCodeAt(0) ^ keyChar);
  }).join('');
}

export function xorToHex(text, key) {
  if (!key) return text;
  return Array.from(text).map((c, i) => {
    const keyChar = typeof key === 'number' ? key : key.charCodeAt(i % key.length);
    return (c.charCodeAt(0) ^ keyChar).toString(16).padStart(2, '0');
  }).join(' ');
}

// === Bacon's Cipher ===
const baconMap = {
  'A': 'AAAAA', 'B': 'AAAAB', 'C': 'AAABA', 'D': 'AAABB', 'E': 'AABAA',
  'F': 'AABAB', 'G': 'AABBA', 'H': 'AABBB', 'I': 'ABAAA', 'J': 'ABAAB',
  'K': 'ABABA', 'L': 'ABABB', 'M': 'ABBAA', 'N': 'ABBAB', 'O': 'ABBBA',
  'P': 'ABBBB', 'Q': 'BAAAA', 'R': 'BAAAB', 'S': 'BAABA', 'T': 'BAABB',
  'U': 'BABAA', 'V': 'BABAB', 'W': 'BABBA', 'X': 'BABBB', 'Y': 'BAAAA',
  'Z': 'BAAAB'
};

export function baconEncrypt(text) {
  return text.toUpperCase().replace(/[A-Z]/g, c => baconMap[c] || c).replace(/[^AB\s]/g, '');
}

export function baconDecrypt(text) {
  const clean = text.toUpperCase().replace(/[^AB]/g, '');
  const revMap = Object.fromEntries(Object.entries(baconMap).map(([k, v]) => [v, k]));
  let result = '';
  for (let i = 0; i + 5 <= clean.length; i += 5) {
    result += revMap[clean.substring(i, i + 5)] || '?';
  }
  return result;
}

// === Polybius Square ===
const polybiusGrid = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';

export function polybiusEncrypt(text) {
  return text.toUpperCase().replace(/J/g, 'I').replace(/[A-Z]/g, c => {
    const idx = polybiusGrid.indexOf(c);
    if (idx === -1) return c;
    return `${Math.floor(idx / 5) + 1}${(idx % 5) + 1}`;
  });
}

export function polybiusDecrypt(text) {
  const digits = text.replace(/[^1-5]/g, '');
  let result = '';
  for (let i = 0; i + 2 <= digits.length; i += 2) {
    const row = parseInt(digits[i]) - 1;
    const col = parseInt(digits[i + 1]) - 1;
    result += polybiusGrid[row * 5 + col];
  }
  return result;
}

// === Columnar Transposition ===
export function columnarEncrypt(text, key) {
  if (!key) return text;
  const cols = key.length;
  const rows = Math.ceil(text.length / cols);
  const padded = text.padEnd(rows * cols, 'X');
  const order = [...key].map((c, i) => [c, i]).sort((a, b) => a[0].localeCompare(b[0])).map(x => x[1]);
  let result = '';
  for (const col of order) {
    for (let row = 0; row < rows; row++) {
      result += padded[row * cols + col];
    }
  }
  return result;
}

export function columnarDecrypt(text, key) {
  if (!key) return text;
  const cols = key.length;
  const rows = Math.ceil(text.length / cols);
  const order = [...key].map((c, i) => [c, i]).sort((a, b) => a[0].localeCompare(b[0])).map(x => x[1]);
  const grid = Array.from({ length: rows }, () => new Array(cols).fill(''));
  let idx = 0;
  for (const col of order) {
    for (let row = 0; row < rows; row++) {
      if (idx < text.length) grid[row][col] = text[idx++];
    }
  }
  return grid.flat().join('').replace(/X+$/, '');
}

// === Beaufort Cipher ===
export function beaufortEncrypt(text, key) {
  if (!key) return text;
  key = key.toUpperCase();
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const k = key.charCodeAt(ki % key.length) - 65;
    const p = c.charCodeAt(0) - base;
    ki++;
    return String.fromCharCode(((k - p + 26) % 26) + base);
  });
}

// Beaufort is its own inverse
export const beaufortDecrypt = beaufortEncrypt;

// === Autokey Cipher ===
export function autokeyEncrypt(text, key) {
  if (!key) return text;
  const keyStream = key.toUpperCase().split('');
  let result = '';
  let ki = 0;
  for (const c of text) {
    if (/[a-zA-Z]/.test(c)) {
      const base = c <= 'Z' ? 65 : 97;
      const shift = (ki < keyStream.length ? keyStream[ki] : '').charCodeAt(0) - 65;
      const enc = String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
      result += enc;
      keyStream.push(c.toUpperCase());
      ki++;
    } else {
      result += c;
    }
  }
  return result;
}

export function autokeyDecrypt(text, key) {
  if (!key) return text;
  const keyStream = key.toUpperCase().split('');
  let result = '';
  let ki = 0;
  for (const c of text) {
    if (/[a-zA-Z]/.test(c)) {
      const base = c <= 'Z' ? 65 : 97;
      const shift = (ki < keyStream.length ? keyStream[ki] : '').charCodeAt(0) - 65;
      const dec = String.fromCharCode(((c.charCodeAt(0) - base - shift + 26) % 26) + base);
      result += dec;
      keyStream.push(dec.toUpperCase());
      ki++;
    } else {
      result += c;
    }
  }
  return result;
}

// === Atbash Cipher ===
export function atbash(text) {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(base + 25 - (c.charCodeAt(0) - base));
  });
}

// === Playfair Cipher ===
export function playfairEncrypt(text, key) {
  if (!key) return text;
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const keyUpper = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const keyChars = new Set();
  const matrix = [];
  
  for (const c of keyUpper + alphabet) {
    if (!keyChars.has(c)) {
      keyChars.add(c);
      matrix.push(c);
    }
  }
  
  const pos = {};
  for (let i = 0; i < 25; i++) {
    pos[matrix[i]] = { row: Math.floor(i / 5), col: i % 5 };
  }
  
  const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const pairs = [];
  for (let i = 0; i < clean.length; i += 2) {
    let a = clean[i], b = clean[i + 1] || 'X';
    if (a === b) { b = 'X'; i--; }
    pairs.push([a, b]);
  }
  
  return pairs.map(([a, b]) => {
    const pa = pos[a], pb = pos[b];
    if (!pa || !pb) return a + b;
    if (pa.row === pb.row) {
      return matrix[(pa.row * 5 + (pa.col + 1) % 5)] + matrix[(pb.row * 5 + (pb.col + 1) % 5)];
    } else if (pa.col === pb.col) {
      return matrix[((pa.row + 1) % 5) * 5 + pa.col] + matrix[((pb.row + 1) % 5) * 5 + pb.col];
    } else {
      return matrix[pa.row * 5 + pb.col] + matrix[pb.row * 5 + pa.col];
    }
  }).join('');
}

export function playfairDecrypt(text, key) {
  if (!key) return text;
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const keyUpper = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const keyChars = new Set();
  const matrix = [];
  
  for (const c of keyUpper + alphabet) {
    if (!keyChars.has(c)) {
      keyChars.add(c);
      matrix.push(c);
    }
  }
  
  const pos = {};
  for (let i = 0; i < 25; i++) {
    pos[matrix[i]] = { row: Math.floor(i / 5), col: i % 5 };
  }
  
  const clean = text.toUpperCase().replace(/[^A-Z]/g, '');
  const pairs = [];
  for (let i = 0; i < clean.length; i += 2) {
    pairs.push([clean[i], clean[i + 1] || 'X']);
  }
  
  return pairs.map(([a, b]) => {
    const pa = pos[a], pb = pos[b];
    if (!pa || !pb) return a + b;
    if (pa.row === pb.row) {
      return matrix[(pa.row * 5 + (pa.col + 4) % 5)] + matrix[(pb.row * 5 + (pb.col + 4) % 5)];
    } else if (pa.col === pb.col) {
      return matrix[((pa.row + 4) % 5) * 5 + pa.col] + matrix[((pb.row + 4) % 5) * 5 + pb.col];
    } else {
      return matrix[pa.row * 5 + pb.col] + matrix[pb.row * 5 + pa.col];
    }
  }).join('');
}

// === Four-Square Cipher ===
export function foursquareEncrypt(text, key1, key2) {
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const buildMatrix = (key) => {
    const keyUpper = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const seen = new Set();
    for (const c of keyUpper + alphabet) if (!seen.has(c)) seen.add(c);
    return Array.from(seen);
  };
  
  const m1 = buildMatrix(key1 || 'KEY1');
  const m2 = buildMatrix(key2 || 'KEY2');
  const pos1 = {}, pos2 = {};
  m1.forEach((c, i) => pos1[c] = { row: Math.floor(i / 5), col: i % 5 });
  m2.forEach((c, i) => pos2[c] = { row: Math.floor(i / 5), col: i % 5 });
  
  const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const pairs = [];
  for (let i = 0; i < clean.length; i += 2) {
    pairs.push([clean[i], clean[i + 1] || 'X']);
  }
  
  return pairs.map(([a, b]) => {
    const pa = pos1[a] || pos2[a], pb = pos2[b] || pos1[b];
    if (!pa || !pb) return a + b;
    return m1[pa.row * 5 + pb.col] + m2[pb.row * 5 + pa.col];
  }).join('');
}

export const foursquareDecrypt = foursquareEncrypt;

// === Running Key Cipher ===
export function runningKeyEncrypt(text, key) {
  if (!key || !text) return text;
  const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = keyUpper.charCodeAt(ki % keyUpper.length) - 65;
    ki++;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

export function runningKeyDecrypt(text, key) {
  if (!key || !text) return text;
  const keyUpper = key.toUpperCase().replace(/[^A-Z]/g, '');
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = keyUpper.charCodeAt(ki % keyUpper.length) - 65;
    ki++;
    return String.fromCharCode(((c.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
}

// === Gronsfeld Cipher ===
export function gronsfeldEncrypt(text, key) {
  if (!key) return text;
  const keyDigits = key.toString().split('').map(Number);
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = keyDigits[ki % keyDigits.length] || 0;
    ki++;
    return String.fromCharCode(((c.charCodeAt(0) - base + shift) % 26) + base);
  });
}

export function gronsfeldDecrypt(text, key) {
  if (!key) return text;
  const keyDigits = key.toString().split('').map(Number);
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    const shift = keyDigits[ki % keyDigits.length] || 0;
    ki++;
    return String.fromCharCode(((c.charCodeAt(0) - base - shift + 26) % 26) + base);
  });
}

// === ADFGX Cipher ===
const adfgxGrid = [
  ['P', 'G', 'C', 'E', 'N'],
  ['O', 'Y', 'Z', 'Q', 'F'],
  ['D', 'V', 'S', 'I', 'K'],
  ['U', 'X', 'A', 'M', 'H'],
  ['T', 'B', 'W', 'L', 'R']
];

export function adfgxEncrypt(text, key) {
  const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  let fractionated = '';
  for (const c of clean) {
    for (let r = 0; r < 5; r++) {
      for (let col = 0; col < 5; col++) {
        if (adfgxGrid[r][col] === c) {
          fractionated += (r === 0 ? 'A' : r === 1 ? 'D' : r === 2 ? 'F' : r === 3 ? 'G' : 'X');
          fractionated += (col === 0 ? 'A' : col === 1 ? 'D' : col === 2 ? 'F' : col === 3 ? 'G' : 'X');
        }
      }
    }
  }
  return key ? columnarEncrypt(fractionated, key) : fractionated;
}

export function adfgxDecrypt(text, key) {
  let fractionated = key ? columnarDecrypt(text, key) : text;
  fractionated = fractionated.replace(/[^ADFGX]/g, '');
  let result = '';
  for (let i = 0; i + 2 <= fractionated.length; i += 2) {
    const rowMap = { 'A': 0, 'D': 1, 'F': 2, 'G': 3, 'X': 4 };
    const row = rowMap[fractionated[i]], col = rowMap[fractionated[i + 1]];
    if (row !== undefined && col !== undefined) {
      result += adfgxGrid[row][col];
    }
  }
  return result;
}

// === Nihilist Cipher ===
const nihilistGrid = [
  [11, 12, 13, 14, 15],
  [21, 22, 23, 24, 25],
  [31, 32, 33, 34, 35],
  [41, 42, 43, 44, 45],
  [51, 52, 53, 54, 55]
];
const nihilistAlpha = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';

export function nihilistEncrypt(text, keyword, keyNumbers) {
  if (!keyword || !keyNumbers) return text;
  const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const keyUpper = keyword.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const keys = keyNumbers.toString().split('').map(Number);
  let result = '';
  let ki = 0;
  
  for (let i = 0; i < clean.length; i++) {
    const charIdx = nihilistAlpha.indexOf(clean[i]);
    if (charIdx === -1) continue;
    const row = Math.floor(charIdx / 5) + 1;
    const col = (charIdx % 5) + 1;
    const keyNum = keys[ki % keys.length] || 0;
    const sum = row * 10 + col + keyNum;
    result += sum + ' ';
    ki++;
  }
  return result.trim();
}

export function nihilistDecrypt(text, keyword, keyNumbers) {
  if (!keyword || !keyNumbers) return text;
  const keyUpper = keyword.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const keys = keyNumbers.toString().split('').map(Number);
  const nums = text.split(/\s+/).filter(n => n).map(Number);
  let result = '';
  let ki = 0;
  
  for (const num of nums) {
    const keyNum = keys[ki % keys.length] || 0;
    const coord = num - keyNum;
    const row = Math.floor(coord / 10);
    const col = coord % 10;
    if (row >= 1 && row <= 5 && col >= 1 && col <= 5) {
      result += nihilistAlpha[(row - 1) * 5 + (col - 1)];
    }
    ki++;
  }
  return result;
}

// === Porta Cipher ===
const portaTables = {
  'A': 'ABCDEFGHIJKLM', 'B': 'ABCDEFGHIJKLM', 'C': 'ABCDEFGHIJKLM', 'D': 'ABCDEFGHIJKLM',
  'E': 'ABCDEFGHIJKLM', 'F': 'ABCDEFGHIJKLM', 'G': 'ABCDEFGHIJKLM', 'H': 'ABCDEFGHIJKLM',
  'I': 'ABCDEFGHIJKLM', 'J': 'ABCDEFGHIJKLM', 'K': 'ABCDEFGHIJKLM', 'L': 'ABCDEFGHIJKLM',
  'M': 'ABCDEFGHIJKLM', 'N': 'NOPQRSTUVWXYZ', 'O': 'NOPQRSTUVWXYZ', 'P': 'NOPQRSTUVWXYZ',
  'Q': 'NOPQRSTUVWXYZ', 'R': 'NOPQRSTUVWXYZ', 'S': 'NOPQRSTUVWXYZ', 'T': 'NOPQRSTUVWXYZ',
  'U': 'NOPQRSTUVWXYZ', 'V': 'NOPQRSTUVWXYZ', 'W': 'NOPQRSTUVWXYZ', 'X': 'NOPQRSTUVWXYZ',
  'Y': 'NOPQRSTUVWXYZ', 'Z': 'NOPQRSTUVWXYZ'
};

export function portaEncrypt(text, key) {
  if (!key) return text;
  const keyUpper = key.toUpperCase();
  let ki = 0;
  return text.replace(/[a-zA-Z]/g, c => {
    const upper = c.toUpperCase();
    const idx = 'ABCDEFGHIJKLM'.indexOf(upper);
    const keyChar = keyUpper.charCodeAt(ki % keyUpper.length);
    const table = keyChar >= 65 && keyChar <= 77 ? 'A' : 'N';
    ki++;
    if (idx === -1) return c;
    const tableStr = portaTables[table];
    const result = tableStr ? tableStr[idx] : upper;
    return c === upper ? result : result.toLowerCase();
  });
}

export const portaDecrypt = portaEncrypt;

// === Two-Square Cipher ===
export function twosquareEncrypt(text, key1, key2) {
  const alphabet = 'ABCDEFGHIKLMNOPQRSTUVWXYZ';
  const buildMatrix = (key) => {
    const keyUpper = key.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
    const seen = new Set();
    for (const c of keyUpper + alphabet) if (!seen.has(c)) seen.add(c);
    return Array.from(seen);
  };
  
  const m1 = buildMatrix(key1 || 'KEY1');
  const m2 = buildMatrix(key2 || 'KEY2');
  const pos1 = {}, pos2 = {};
  m1.forEach((c, i) => pos1[c] = { row: Math.floor(i / 5), col: i % 5 });
  m2.forEach((c, i) => pos2[c] = { row: Math.floor(i / 5), col: i % 5 });
  
  const clean = text.toUpperCase().replace(/J/g, 'I').replace(/[^A-Z]/g, '');
  const pairs = [];
  for (let i = 0; i < clean.length; i += 2) {
    pairs.push([clean[i], clean[i + 1] || 'X']);
  }
  
  return pairs.map(([a, b]) => {
    const pa = pos1[a], pb = pos2[b];
    if (!pa || !pb) return a + b;
    if (pa.col === pb.col) {
      return m1[((pa.row + 1) % 5) * 5 + pa.col] + m2[((pb.row + 1) % 5) * 5 + pb.col];
    } else {
      return m1[pa.row * 5 + pb.col] + m2[pb.row * 5 + pa.col];
    }
  }).join('');
}

export const twosquareDecrypt = twosquareEncrypt;