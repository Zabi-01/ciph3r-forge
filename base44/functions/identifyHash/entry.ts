import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hash } = await req.json();
    
    if (!hash) {
      return Response.json({ error: 'Hash is required' }, { status: 400 });
    }

    // Analyze hash using pattern matching and characteristics
    const result = analyzeHash(hash);
    
    return Response.json({ 
      hash,
      identified: result.identified || false,
      hashType: result.hashType || 'Unknown',
      details: result.details || null,
      possibleTypes: result.possibleTypes || []
    });
  } catch (error) {
    return Response.json({ 
      error: error.message,
      identified: false 
    }, { status: 500 });
  }
});

function analyzeHash(hash) {
  const hashStr = hash.toString().trim();
  const len = hashStr.length;
  const lower = hashStr.toLowerCase();
  const upper = hashStr.toUpperCase();
  
  // Check character set
  const isHex = /^[a-fA-F0-9]+$/.test(hashStr);
  const isBase64 = /^[A-Za-z0-9+/]+=*$/.test(hashStr);
  const isBase64Url = /^[A-Za-z0-9_-]+$/.test(hashStr);
  const hasSpecialChars = /[^a-zA-Z0-9+/=_-]/.test(hashStr);
  
  const possibleTypes = [];
  let mostLikely = null;
  
  // MD5 - 32 hex characters
  if (len === 32 && isHex) {
    possibleTypes.push({
      name: 'MD5',
      probability: 'high',
      details: '128-bit hash, commonly used for checksums (not secure for passwords)'
    });
    mostLikely = 'MD5';
  }
  
  // SHA-1 - 40 hex characters
  if (len === 40 && isHex) {
    possibleTypes.push({
      name: 'SHA-1',
      probability: 'high',
      details: '160-bit hash, deprecated for cryptographic use'
    });
    mostLikely = 'SHA-1';
  }
  
  // SHA-256 - 64 hex characters
  if (len === 64 && isHex) {
    possibleTypes.push({
      name: 'SHA-256',
      probability: 'high',
      details: '256-bit hash, part of SHA-2 family, widely used'
    });
    mostLikely = 'SHA-256';
  }
  
  // SHA-512 - 128 hex characters
  if (len === 128 && isHex) {
    possibleTypes.push({
      name: 'SHA-512',
      probability: 'high',
      details: '512-bit hash, part of SHA-2 family, high security'
    });
    mostLikely = 'SHA-512';
  }
  
  // SHA-384 - 96 hex characters
  if (len === 96 && isHex) {
    possibleTypes.push({
      name: 'SHA-384',
      probability: 'high',
      details: '384-bit hash, part of SHA-2 family'
    });
    mostLikely = 'SHA-384';
  }
  
  // bcrypt - starts with $2a$, $2b$, or $2y$
  if (/^\$2[aby]\$[0-9]{2}\$[./A-Za-z0-9]{53}$/.test(hashStr)) {
    possibleTypes.push({
      name: 'bcrypt',
      probability: 'high',
      details: 'Adaptive hash function, commonly used for password storage'
    });
    mostLikely = 'bcrypt';
  }
  
  // MD5-Crypt - starts with $1$
  if (/^\$1\$[a-zA-Z0-9]{8}\$[a-zA-Z0-9]{22}$/.test(hashStr)) {
    possibleTypes.push({
      name: 'MD5-Crypt',
      probability: 'high',
      details: 'Unix MD5-based password hash'
    });
    mostLikely = 'MD5-Crypt';
  }
  
  // SHA-256-Crypt - starts with $5$
  if (/^\$5\$[a-zA-Z0-9]{16}\$[a-zA-Z0-9]{43}$/.test(hashStr)) {
    possibleTypes.push({
      name: 'SHA-256-Crypt',
      probability: 'high',
      details: 'Unix SHA-256-based password hash'
    });
    mostLikely = 'SHA-256-Crypt';
  }
  
  // SHA-512-Crypt - starts with $6$
  if (/^\$6\$[a-zA-Z0-9]{16}\$[a-zA-Z0-9]{86}$/.test(hashStr)) {
    possibleTypes.push({
      name: 'SHA-512-Crypt',
      probability: 'high',
      details: 'Unix SHA-512-based password hash'
    });
    mostLikely = 'SHA-512-Crypt';
  }
  
  // DES-Crypt - 13 characters, alphanumeric
  if (len === 13 && /^[a-zA-Z0-9./]+$/.test(hashStr)) {
    possibleTypes.push({
      name: 'DES-Crypt',
      probability: 'medium',
      details: 'Traditional Unix password hash, 56-bit DES'
    });
    mostLikely = 'DES-Crypt';
  }
  
  // NTLM - 32 hex characters (like MD5 but different context)
  if (len === 32 && isHex) {
    possibleTypes.push({
      name: 'NTLM',
      probability: 'medium',
      details: 'Windows NT LAN Manager hash, used in Windows authentication'
    });
  }
  
  // RIPEMD-160 - 40 hex characters (like SHA-1)
  if (len === 40 && isHex) {
    possibleTypes.push({
      name: 'RIPEMD-160',
      probability: 'low',
      details: '160-bit hash, used in Bitcoin addresses'
    });
  }
  
  // Whirlpool - 128 hex characters (like SHA-512)
  if (len === 128 && isHex) {
    possibleTypes.push({
      name: 'Whirlpool',
      probability: 'low',
      details: '512-bit hash, ISO/IEC 10118-3 standard'
    });
  }
  
  // Base64 encoded data (not necessarily a hash)
  if (isBase64 && len > 20 && !isHex) {
    possibleTypes.push({
      name: 'Base64 Encoded',
      probability: 'medium',
      details: 'May be encoded data rather than a hash'
    });
  }
  
  // CRC32 - 8 hex characters
  if (len === 8 && isHex) {
    possibleTypes.push({
      name: 'CRC32',
      probability: 'medium',
      details: '32-bit checksum, not cryptographically secure'
    });
    mostLikely = 'CRC32';
  }
  
  // SHA-224 - 56 hex characters
  if (len === 56 && isHex) {
    possibleTypes.push({
      name: 'SHA-224',
      probability: 'high',
      details: '224-bit hash, part of SHA-2 family'
    });
    mostLikely = 'SHA-224';
  }
  
  // MySQL SHA1 - 41 characters (starts with *)
  if (len === 41 && hashStr.startsWith('*') && isHexUpper(upper.substring(1))) {
    possibleTypes.push({
      name: 'MySQL SHA1',
      probability: 'high',
      details: 'MySQL password hash format (SHA1 with * prefix)'
    });
    mostLikely = 'MySQL SHA1';
  }
  
  // LM Hash - 32 hex characters, uppercase only
  if (len === 32 && /^[A-F0-9]+$/.test(hashStr)) {
    possibleTypes.push({
      name: 'LM Hash',
      probability: 'medium',
      details: 'Windows LAN Manager hash, very weak'
    });
  }
  
  // PostgreSQL MD5 - 35 characters (md5 prefix + 32 hex)
  if (len === 35 && lower.startsWith('md5') && isHex) {
    possibleTypes.push({
      name: 'PostgreSQL MD5',
      probability: 'high',
      details: 'PostgreSQL password hash format'
    });
    mostLikely = 'PostgreSQL MD5';
  }
  
  // PBKDF2 formats
  if (hashStr.startsWith('pbkdf2-sha256:') || hashStr.toLowerCase().startsWith('pbkdf2')) {
    possibleTypes.push({
      name: 'PBKDF2',
      probability: 'high',
      details: 'Password-Based Key Derivation Function 2'
    });
    mostLikely = 'PBKDF2';
  }
  
  // scrypt
  if (hashStr.startsWith('$s$') || hashStr.toLowerCase().startsWith('scrypt')) {
    possibleTypes.push({
      name: 'scrypt',
      probability: 'high',
      details: 'Memory-hard function, resistant to GPU attacks'
    });
    mostLikely = 'scrypt';
  }
  
  // Argon2
  if (hashStr.startsWith('$argon2')) {
    possibleTypes.push({
      name: 'Argon2',
      probability: 'high',
      details: 'Memory-hard function, winner of Password Hashing Competition'
    });
    mostLikely = 'Argon2';
  }
  
  // Blake2 - 64 or 128 hex characters
  if ((len === 64 || len === 128) && isHex) {
    possibleTypes.push({
      name: 'BLAKE2',
      probability: 'low',
      details: 'High-speed cryptographic hash function'
    });
  }
  
  // If no types matched
  if (possibleTypes.length === 0) {
    return {
      identified: false,
      hashType: 'Unknown',
      details: 'Hash format not recognized. May be custom format, truncated, or corrupted.',
      possibleTypes: []
    };
  }
  
  return {
    identified: true,
    hashType: mostLikely,
    details: mostLikely ? possibleTypes.find(t => t.name === mostLikely)?.details : null,
    possibleTypes: possibleTypes,
    characteristics: {
      length: len,
      characterSet: isHex ? 'hexadecimal' : isBase64 ? 'base64' : 'mixed',
      hasPrefix: hashStr.startsWith('$') || hashStr.startsWith('*'),
      isSalted: hashStr.includes('$') && hashStr.split('$').length > 3
    }
  };
}

function isHexUpper(str) {
  return /^[A-F0-9]+$/.test(str);
}