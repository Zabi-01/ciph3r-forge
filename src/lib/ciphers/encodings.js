// === Base64 ===
export function base64Encode(text) {
  return btoa(unescape(encodeURIComponent(text)));
}
export function base64Decode(text) {
  return decodeURIComponent(escape(atob(text.trim())));
}

// === Hex (Base16) ===
export function hexEncode(text) {
  return Array.from(text).map(c => c.charCodeAt(0).toString(16).padStart(2, '0')).join(' ');
}
export function hexDecode(text) {
  return text.replace(/\s+/g, '').match(/.{1,2}/g)?.map(h => String.fromCharCode(parseInt(h, 16))).join('') || '';
}

// === Binary ===
export function binaryEncode(text) {
  return Array.from(text).map(c => c.charCodeAt(0).toString(2).padStart(8, '0')).join(' ');
}
export function binaryDecode(text) {
  return text.trim().split(/\s+/).map(b => String.fromCharCode(parseInt(b, 2))).join('');
}

// === Octal ===
export function octalEncode(text) {
  return Array.from(text).map(c => c.charCodeAt(0).toString(8).padStart(3, '0')).join(' ');
}
export function octalDecode(text) {
  return text.trim().split(/\s+/).map(o => String.fromCharCode(parseInt(o, 8))).join('');
}

// === Decimal ASCII ===
export function decimalEncode(text) {
  return Array.from(text).map(c => c.charCodeAt(0)).join(' ');
}
export function decimalDecode(text) {
  return text.trim().split(/\s+/).map(d => String.fromCharCode(parseInt(d, 10))).join('');
}

// === URL Encoding ===
export function urlEncode(text) {
  return encodeURIComponent(text);
}
export function urlDecode(text) {
  return decodeURIComponent(text);
}

// === HTML Entity Encoding ===
export function htmlEncode(text) {
  return text.replace(/[&<>"']/g, c => ({
    '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;'
  })[c]);
}
export function htmlDecode(text) {
  const el = document.createElement('div');
  el.innerHTML = text;
  return el.textContent;
}

// === Unicode Escape ===
export function unicodeEscape(text) {
  return Array.from(text).map(c => '\\u' + c.charCodeAt(0).toString(16).padStart(4, '0')).join('');
}
export function unicodeUnescape(text) {
  return text.replace(/\\u([0-9a-fA-F]{4})/g, (_, hex) => String.fromCharCode(parseInt(hex, 16)));
}

// === Morse Code ===
const morseMap = {
  'A': '.-', 'B': '-...', 'C': '-.-.', 'D': '-..', 'E': '.', 'F': '..-.',
  'G': '--.', 'H': '....', 'I': '..', 'J': '.---', 'K': '-.-', 'L': '.-..',
  'M': '--', 'N': '-.', 'O': '---', 'P': '.--.', 'Q': '--.-', 'R': '.-.',
  'S': '...', 'T': '-', 'U': '..-', 'V': '...-', 'W': '.--', 'X': '-..-',
  'Y': '-.--', 'Z': '--..', '0': '-----', '1': '.----', '2': '..---',
  '3': '...--', '4': '....-', '5': '.....', '6': '-....', '7': '--...',
  '8': '---..', '9': '----.', ' ': '/'
};
const morseRev = Object.fromEntries(Object.entries(morseMap).map(([k, v]) => [v, k]));

export function morseEncode(text) {
  return text.toUpperCase().split('').map(c => morseMap[c] || c).join(' ');
}
export function morseDecode(text) {
  return text.split(' ').map(c => morseRev[c] || c).join('');
}

// === Base32 ===
const B32 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ234567';
export function base32Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let bits = '';
  bytes.forEach(b => bits += b.toString(2).padStart(8, '0'));
  while (bits.length % 5 !== 0) bits += '0';
  let result = '';
  for (let i = 0; i < bits.length; i += 5) {
    result += B32[parseInt(bits.substring(i, i + 5), 2)];
  }
  while (result.length % 8 !== 0) result += '=';
  return result;
}
export function base32Decode(text) {
  const clean = text.replace(/=+$/, '');
  let bits = '';
  for (const c of clean) {
    const idx = B32.indexOf(c.toUpperCase());
    if (idx === -1) continue;
    bits += idx.toString(2).padStart(5, '0');
  }
  const bytes = [];
  for (let i = 0; i + 8 <= bits.length; i += 8) {
    bytes.push(parseInt(bits.substring(i, i + 8), 2));
  }
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// === Base58 (Bitcoin-style) ===
const B58 = '123456789ABCDEFGHJKLMNPQRSTUVWXYZabcdefghijkmnopqrstuvwxyz';
export function base58Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let num = BigInt(0);
  for (const b of bytes) num = num * 256n + BigInt(b);
  let result = '';
  while (num > 0n) {
    result = B58[Number(num % 58n)] + result;
    num = num / 58n;
  }
  for (const b of bytes) {
    if (b === 0) result = '1' + result;
    else break;
  }
  return result || '1';
}
export function base58Decode(text) {
  let num = BigInt(0);
  for (const c of text) {
    const idx = B58.indexOf(c);
    if (idx === -1) continue;
    num = num * 58n + BigInt(idx);
  }
  const hex = num.toString(16).padStart(2, '0');
  const pairs = hex.match(/.{1,2}/g) || [];
  const bytes = pairs.map(h => parseInt(h, 16));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// === Reverse ===
export function reverseText(text) {
  return text.split('').reverse().join('');
}

// === Base45 ===
const B45 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZ $%*+-./:';
export function base45Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let result = '';
  for (let i = 0; i < bytes.length; i += 2) {
    const v = i + 1 < bytes.length ? (bytes[i] << 8) | bytes[i + 1] : bytes[i] << 8;
    result += B45[v % 45] + B45[Math.floor(v / 45) % 45];
    if (i + 1 < bytes.length) result += B45[Math.floor(v / 2025)];
  }
  return result;
}
export function base45Decode(text) {
  let result = '';
  for (let i = 0; i < text.length; i += 3) {
    const chunk = text.slice(i, i + 3);
    let v = 0;
    for (const c of chunk) {
      const idx = B45.indexOf(c);
      if (idx === -1) return '';
      v = v * 45 + idx;
    }
    if (chunk.length === 3) {
      result += String.fromCharCode((v >> 8) & 0xFF, v & 0xFF);
    } else if (chunk.length === 2) {
      result += String.fromCharCode((v >> 8) & 0xFF);
    }
  }
  return result;
}

// === Base62 ===
const B62 = '0123456789ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz';
export function base62Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let num = BigInt(0);
  for (const b of bytes) num = num * 256n + BigInt(b);
  let result = '';
  while (num > 0n) {
    result = B62[Number(num % 62n)] + result;
    num = num / 62n;
  }
  return result || '0';
}
export function base62Decode(text) {
  let num = BigInt(0);
  for (const c of text) {
    const idx = B62.indexOf(c);
    if (idx === -1) continue;
    num = num * 62n + BigInt(idx);
  }
  const hex = num.toString(16).padStart(2, '0');
  const pairs = hex.match(/.{1,2}/g) || [];
  const bytes = pairs.map(h => parseInt(h, 16));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// === Base85 (Ascii85) ===
export function base85Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let result = '';
  for (let i = 0; i < bytes.length; i += 4) {
    const chunk = bytes.slice(i, i + 4);
    let num = 0n;
    for (let j = 0; j < 4; j++) {
      num = num * 256n + BigInt(chunk[j] || 0);
    }
    let encoded = '';
    for (let j = 0; j < 5; j++) {
      encoded = String.fromCharCode(33 + Number(num % 85n)) + encoded;
      num = num / 85n;
    }
    result += encoded.slice(0, chunk.length > 0 ? Math.ceil((chunk.length * 5) / 4) : 0);
  }
  return result || '!';
}
export function base85Decode(text) {
  let result = '';
  for (let i = 0; i < text.length; i += 5) {
    const chunk = text.slice(i, i + 5);
    let num = 0n;
    for (const c of chunk) {
      num = num * 85n + BigInt(c.charCodeAt(0) - 33);
    }
    const bytes = [];
    for (let j = 0; j < 4; j++) {
      bytes.unshift(Number(num % 256n));
      num = num / 256n;
    }
    result += new TextDecoder().decode(new Uint8Array(bytes.slice(0, Math.ceil((chunk.length * 4) / 5))));
  }
  return result;
}

// === Base92 ===
const B92 = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789&\'()*+,-./:;<=>?@[]^_`{|}~"';
export function base92Encode(text) {
  const bytes = new TextEncoder().encode(text);
  let num = 0n;
  for (const b of bytes) num = num * 256n + BigInt(b);
  let result = '';
  while (num > 0n) {
    result = B92[Number(num % 92n)] + result;
    num = num / 92n;
  }
  return result || 'A';
}
export function base92Decode(text) {
  let num = BigInt(0);
  for (const c of text) {
    const idx = B92.indexOf(c);
    if (idx === -1) continue;
    num = num * 92n + BigInt(idx);
  }
  const hex = num.toString(16).padStart(2, '0');
  const pairs = hex.match(/.{1,2}/g) || [];
  const bytes = pairs.map(h => parseInt(h, 16));
  return new TextDecoder().decode(new Uint8Array(bytes));
}

// === Braille ===
export function toBraille(text) {
  const brailleMap = {
    'a': '⠁', 'b': '⠃', 'c': '⠉', 'd': '⠙', 'e': '⠑', 'f': '⠋', 'g': '⠛', 'h': '⠓', 'i': '⠊', 'j': '⠚',
    'k': '⠅', 'l': '⠇', 'm': '⠍', 'n': '⠝', 'o': '⠕', 'p': '⠏', 'q': '⠟', 'r': '⠗', 's': '⠎', 't': '⠞',
    'u': '⠥', 'v': '⠧', 'w': '⠺', 'x': '⠭', 'y': '⠽', 'z': '⠵', ' ': ' '
  };
  return text.toLowerCase().split('').map(c => brailleMap[c] || c).join('');
}
export function fromBraille(text) {
  const brailleRev = {
    '⠁': 'a', '⠃': 'b', '⠉': 'c', '⠙': 'd', '⠑': 'e', '⠋': 'f', '⠛': 'g', '⠓': 'h', '⠊': 'i', '⠚': 'j',
    '⠅': 'k', '⠇': 'l', '⠍': 'm', '⠝': 'n', '⠕': 'o', '⠏': 'p', '⠟': 'q', '⠗': 'r', '⠎': 's', '⠞': 't',
    '⠥': 'u', '⠧': 'v', '⠺': 'w', '⠭': 'x', '⠽': 'y', '⠵': 'z', ' ': ' '
  };
  return text.split('').map(c => brailleRev[c] || c).join('');
}

// === Charcode ===
export function toCharcode(text) {
  return Array.from(text).map(c => c.charCodeAt(0)).join(',');
}
export function fromCharcode(text) {
  return text.split(',').map(c => String.fromCharCode(parseInt(c.trim()))).join('');
}

// === ROT variants for encoding section ===
export function rotN(text, n) {
  return text.replace(/[a-zA-Z]/g, c => {
    const base = c <= 'Z' ? 65 : 97;
    return String.fromCharCode(((c.charCodeAt(0) - base + n) % 26) + base);
  });
}