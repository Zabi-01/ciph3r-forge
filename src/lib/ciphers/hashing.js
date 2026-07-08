// === Hashing using Web Crypto API ===

async function hashText(algorithm, text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest(algorithm, data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export async function sha1(text) {
  return hashText('SHA-1', text);
}

export async function sha256(text) {
  return hashText('SHA-256', text);
}

export async function sha512(text) {
  return hashText('SHA-512', text);
}

export async function md5(text) {
  // Simple MD5 implementation
  function md5core(str) {
    function rotateLeft(val, shift) { return (val << shift) | (val >>> (32 - shift)); }
    function addUnsigned(x, y) {
      const x4 = (x & 0x40000000), y4 = (y & 0x40000000);
      const x8 = (x & 0x80000000), y8 = (y & 0x80000000);
      const result = (x & 0x3FFFFFFF) + (y & 0x3FFFFFFF);
      if (x4 & y4) return (result ^ 0x80000000 ^ x8 ^ y8);
      if (x4 | y4) {
        if (result & 0x40000000) return (result ^ 0xC0000000 ^ x8 ^ y8);
        return (result ^ 0x40000000 ^ x8 ^ y8);
      }
      return (result ^ x8 ^ y8);
    }
    function F(x, y, z) { return (x & y) | ((~x) & z); }
    function G(x, y, z) { return (x & z) | (y & (~z)); }
    function H(x, y, z) { return (x ^ y ^ z); }
    function I(x, y, z) { return (y ^ (x | (~z))); }
    function FF(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(F(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
    function GG(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(G(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
    function HH(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(H(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
    function II(a, b, c, d, x, s, ac) { a = addUnsigned(a, addUnsigned(addUnsigned(I(b, c, d), x), ac)); return addUnsigned(rotateLeft(a, s), b); }
    
    function convertToWordArray(str) {
      const len = str.length;
      const numWords = (((len + 8) >>> 6) + 1) * 16;
      const arr = new Array(numWords).fill(0);
      for (let i = 0; i < len; i++) arr[i >>> 2] |= str.charCodeAt(i) << ((i % 4) * 8);
      arr[len >>> 2] |= 0x80 << ((len % 4) * 8);
      arr[numWords - 2] = len * 8;
      return arr;
    }
    function wordToHex(val) {
      let hex = '';
      for (let i = 0; i <= 3; i++) hex += ((val >>> (i * 8)) & 255).toString(16).padStart(2, '0');
      return hex;
    }

    const x = convertToWordArray(str);
    let a = 0x67452301, b = 0xEFCDAB89, c = 0x98BADCFE, d = 0x10325476;
    const S = [7,12,17,22, 5,9,14,20, 4,11,16,23, 6,10,15,21];
    const T = [];
    for (let i = 1; i <= 64; i++) T.push(Math.floor(Math.abs(Math.sin(i)) * 4294967296));

    for (let k = 0; k < x.length; k += 16) {
      const AA = a, BB = b, CC = c, DD = d;
      a = FF(a,b,c,d,x[k+0],S[0],T[0]); d = FF(d,a,b,c,x[k+1],S[1],T[1]); c = FF(c,d,a,b,x[k+2],S[2],T[2]); b = FF(b,c,d,a,x[k+3],S[3],T[3]);
      a = FF(a,b,c,d,x[k+4],S[0],T[4]); d = FF(d,a,b,c,x[k+5],S[1],T[5]); c = FF(c,d,a,b,x[k+6],S[2],T[6]); b = FF(b,c,d,a,x[k+7],S[3],T[7]);
      a = FF(a,b,c,d,x[k+8],S[0],T[8]); d = FF(d,a,b,c,x[k+9],S[1],T[9]); c = FF(c,d,a,b,x[k+10],S[2],T[10]); b = FF(b,c,d,a,x[k+11],S[3],T[11]);
      a = FF(a,b,c,d,x[k+12],S[0],T[12]); d = FF(d,a,b,c,x[k+13],S[1],T[13]); c = FF(c,d,a,b,x[k+14],S[2],T[14]); b = FF(b,c,d,a,x[k+15],S[3],T[15]);
      a = GG(a,b,c,d,x[k+1],S[4],T[16]); d = GG(d,a,b,c,x[k+6],S[5],T[17]); c = GG(c,d,a,b,x[k+11],S[6],T[18]); b = GG(b,c,d,a,x[k+0],S[7],T[19]);
      a = GG(a,b,c,d,x[k+5],S[4],T[20]); d = GG(d,a,b,c,x[k+10],S[5],T[21]); c = GG(c,d,a,b,x[k+15],S[6],T[22]); b = GG(b,c,d,a,x[k+4],S[7],T[23]);
      a = GG(a,b,c,d,x[k+9],S[4],T[24]); d = GG(d,a,b,c,x[k+14],S[5],T[25]); c = GG(c,d,a,b,x[k+3],S[6],T[26]); b = GG(b,c,d,a,x[k+8],S[7],T[27]);
      a = GG(a,b,c,d,x[k+13],S[4],T[28]); d = GG(d,a,b,c,x[k+2],S[5],T[29]); c = GG(c,d,a,b,x[k+7],S[6],T[30]); b = GG(b,c,d,a,x[k+12],S[7],T[31]);
      a = HH(a,b,c,d,x[k+5],S[8],T[32]); d = HH(d,a,b,c,x[k+8],S[9],T[33]); c = HH(c,d,a,b,x[k+11],S[10],T[34]); b = HH(b,c,d,a,x[k+14],S[11],T[35]);
      a = HH(a,b,c,d,x[k+1],S[8],T[36]); d = HH(d,a,b,c,x[k+4],S[9],T[37]); c = HH(c,d,a,b,x[k+7],S[10],T[38]); b = HH(b,c,d,a,x[k+10],S[11],T[39]);
      a = HH(a,b,c,d,x[k+13],S[8],T[40]); d = HH(d,a,b,c,x[k+0],S[9],T[41]); c = HH(c,d,a,b,x[k+3],S[10],T[42]); b = HH(b,c,d,a,x[k+6],S[11],T[43]);
      a = HH(a,b,c,d,x[k+9],S[8],T[44]); d = HH(d,a,b,c,x[k+12],S[9],T[45]); c = HH(c,d,a,b,x[k+15],S[10],T[46]); b = HH(b,c,d,a,x[k+2],S[11],T[47]);
      a = II(a,b,c,d,x[k+0],S[12],T[48]); d = II(d,a,b,c,x[k+7],S[13],T[49]); c = II(c,d,a,b,x[k+14],S[14],T[50]); b = II(b,c,d,a,x[k+5],S[15],T[51]);
      a = II(a,b,c,d,x[k+12],S[12],T[52]); d = II(d,a,b,c,x[k+3],S[13],T[53]); c = II(c,d,a,b,x[k+10],S[14],T[54]); b = II(b,c,d,a,x[k+1],S[15],T[55]);
      a = II(a,b,c,d,x[k+8],S[12],T[56]); d = II(d,a,b,c,x[k+15],S[13],T[57]); c = II(c,d,a,b,x[k+6],S[14],T[58]); b = II(b,c,d,a,x[k+13],S[15],T[59]);
      a = II(a,b,c,d,x[k+4],S[12],T[60]); d = II(d,a,b,c,x[k+11],S[13],T[61]); c = II(c,d,a,b,x[k+2],S[14],T[62]); b = II(b,c,d,a,x[k+9],S[15],T[63]);
      a = addUnsigned(a, AA); b = addUnsigned(b, BB); c = addUnsigned(c, CC); d = addUnsigned(d, DD);
    }
    return wordToHex(a) + wordToHex(b) + wordToHex(c) + wordToHex(d);
  }
  return md5core(text);
}

// === Hash Detection ===
export function detectHashType(hash) {
  const clean = hash.trim().toLowerCase();
  const types = [];
  if (/^[a-f0-9]{32}$/.test(clean)) types.push('MD5');
  if (/^[a-f0-9]{40}$/.test(clean)) types.push('SHA-1');
  if (/^[a-f0-9]{64}$/.test(clean)) types.push('SHA-256');
  if (/^[a-f0-9]{128}$/.test(clean)) types.push('SHA-512');
  if (/^\$2[aby]\$\d+\$/.test(hash)) types.push('bcrypt');
  if (/^\$pbkdf2/.test(hash)) types.push('PBKDF2');
  return types;
}