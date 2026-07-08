import { createClientFromRequest } from 'npm:@base44/sdk@0.8.25';

Deno.serve(async (req) => {
  try {
    const base44 = createClientFromRequest(req);
    const user = await base44.auth.me();
    
    if (!user) {
      return Response.json({ error: 'Unauthorized' }, { status: 401 });
    }

    const { hash, mode } = await req.json();
    
    if (!hash) {
      return Response.json({ error: 'Hash is required' }, { status: 400 });
    }

    const startTime = Date.now();
    const hashLower = hash.toLowerCase();
    
    // Determine hash type
    const hashType = detectHashType(hashLower);
    
    // Try online databases first
    const onlineResult = await searchOnlineDatabases(hashLower);
    if (onlineResult.found) {
      return Response.json({
        success: true,
        cracked: true,
        plaintext: onlineResult.plaintext,
        method: 'online_database',
        source: onlineResult.source,
        hashType,
        timeMs: Date.now() - startTime
      });
    }

    // Try common passwords
    const commonResult = await commonPasswordsAttack(hashLower, hashType);
    if (commonResult.cracked) {
      return Response.json({
        ...commonResult,
        method: 'common_passwords',
        hashType,
        timeMs: Date.now() - startTime
      });
    }

    // Try dictionary attack
    const dictResult = await dictionaryAttack(hashLower, hashType);
    if (dictResult.cracked) {
      return Response.json({
        ...dictResult,
        method: 'dictionary',
        hashType,
        timeMs: Date.now() - startTime
      });
    }

    // Try simple brute force
    const bruteResult = await bruteForceSimple(hashLower, hashType);
    if (bruteResult.cracked) {
      return Response.json({
        ...bruteResult,
        method: 'brute_force_simple',
        hashType,
        timeMs: Date.now() - startTime
      });
    }

    return Response.json({
      success: true,
      cracked: false,
      message: 'Hash not cracked with available techniques',
      hashType,
      suggestions: getSuggestions(hashType),
      timeMs: Date.now() - startTime
    });

  } catch (error) {
    return Response.json({ 
      error: error.message,
      success: false
    }, { status: 500 });
  }
});

function detectHashType(hash) {
  if (/^[a-f0-9]{32}$/i.test(hash)) return 'MD5';
  if (/^[a-f0-9]{40}$/i.test(hash)) return 'SHA-1';
  if (/^[a-f0-9]{64}$/i.test(hash)) return 'SHA-256';
  if (/^[a-f0-9]{128}$/i.test(hash)) return 'SHA-512';
  if (/^\$2[aby]?\$[0-9]{2}\$[./A-Za-z0-9]{53}$/i.test(hash)) return 'bcrypt';
  return 'Unknown';
}

async function searchOnlineDatabases(hash) {
  const startTime = Date.now();
  
  // Try CrackStation (free, no API key required for basic usage)
  try {
    const response = await fetch(`https://crackstation.net/api.php?hash=${encodeURIComponent(hash)}`, {
      method: 'GET',
      headers: { 'Accept': 'application/json' }
    });
    if (response.ok) {
      const result = await response.json();
      if (result.found && result.plaintext) {
        return {
          found: true,
          plaintext: result.plaintext,
          source: 'CrackStation',
          timeMs: Date.now() - startTime
        };
      }
    }
  } catch (e) { /* ignore */ }
  
  // Try hashes.com as fallback
  try {
    const response = await fetch(`https://hashes.com/api/decrypt?hash=${hash}`);
    if (response.ok) {
      const result = await response.json();
      if (result.plaintext) {
        return {
          found: true,
          plaintext: result.plaintext,
          source: 'hashes.com',
          timeMs: Date.now() - startTime
        };
      }
    }
  } catch (e) { /* ignore */ }
  
  return { found: false, timeMs: Date.now() - startTime };
}

async function commonPasswordsAttack(hash, hashType) {
  const commonPasswords = [
    'password', '123456', '12345678', 'qwerty', 'abc123', 'monkey', '1234567',
    'letmein', 'trustno1', 'dragon', 'baseball', 'iloveyou', 'master', 'sunshine',
    'ashley', 'bailey', 'shadow', '123123', '654321', 'superman', 'qazwsx',
    'michael', 'football', 'password1', 'password123', 'welcome', 'jesus',
    'ninja', 'mustang', 'password12', 'admin', 'admin123', 'root', 'toor',
    'pass', 'test', 'guest', 'master', 'changeme', '123456789', '1234567890',
    'welcome1', 'welcome123', 'hello', 'charlie', 'donald', 'password1!',
    'qwerty123', '1q2w3e4r', '1q2w3e', '1234qwer', '123456a', '123456!',
    'P@ssw0rd', 'P@ssword', 'Password1', 'Password123', 'Secret123',
    'letmein123', 'qwerty!', 'abc123!', 'password!', 'admin!',
    '111111', '222222', '333333', '444444', '555555', '666666',
    '777777', '888888', '999999', '000000', '121212', '123321'
  ];
  
  for (const pwd of commonPasswords) {
    const computed = await computeHash(pwd, hashType);
    if (computed === hash) {
      return { success: true, cracked: true, plaintext: pwd, attempts: commonPasswords.indexOf(pwd) + 1 };
    }
  }
  
  return { success: true, cracked: false };
}

async function dictionaryAttack(hash, hashType) {
  const words = generateDictionary();
  let attempts = 0;
  
  for (const word of words) {
    attempts++;
    if (attempts > 5000) break;
    
    const computed = await computeHash(word, hashType);
    if (computed === hash) {
      return { success: true, cracked: true, plaintext: word, attempts };
    }
    
    // Try variations
    const variations = applyRules(word);
    for (const variation of variations) {
      attempts++;
      const computed = await computeHash(variation, hashType);
      if (computed === hash) {
        return { success: true, cracked: true, plaintext: variation, attempts };
      }
    }
  }
  
  return { success: true, cracked: false, attempts };
}

async function bruteForceSimple(hash, hashType) {
  // CrackStation-style: fast brute-force for 1-4 character passwords
  const chars = 'abcdefghijklmnopqrstuvwxyzABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789!?';
  const maxLen = 4;
  let attempts = 0;
  
  for (let len = 1; len <= maxLen; len++) {
    const combinations = generateCombinations(chars, len);
    for (const combo of combinations) {
      attempts++;
      if (attempts > 50000) {
        return { success: true, cracked: false, attempts };
      }
      
      const computed = await computeHash(combo, hashType);
      if (computed === hash) {
        return { success: true, cracked: true, plaintext: combo, attempts };
      }
    }
  }
  
  return { success: true, cracked: false, attempts };
}

async function computeHash(text, hashType) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  
  switch (hashType) {
    case 'SHA-1':
      return await hashSHA1(text);
    case 'SHA-256':
      return await hashSHA256(text);
    case 'SHA-512':
      return await hashSHA512(text);
    default:
      return await hashSHA256(text);
  }
}

async function hashSHA1(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-1', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashSHA256(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

async function hashSHA512(text) {
  const encoder = new TextEncoder();
  const data = encoder.encode(text);
  const hashBuffer = await crypto.subtle.digest('SHA-512', data);
  return Array.from(new Uint8Array(hashBuffer))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('');
}

function generateDictionary() {
  const base = [
    'password', 'admin', 'user', 'test', 'guest', 'root', 'oracle',
    'mysql', 'postgres', 'linux', 'windows', 'unix', 'ubuntu',
    'welcome', 'hello', 'secret', 'private', 'public', 'access',
    'login', 'register', 'account', 'profile', 'settings',
    'qwerty', 'asdfgh', 'zxcvbn', 'letmein', 'trustno1',
    'dragon', 'master', 'monkey', 'shadow', 'sunshine', 'princess',
    'football', 'baseball', 'soccer', 'hockey', 'basketball',
    'iloveyou', 'starwars', 'hello123', 'welcome1', 'admin123'
  ];
  
  const variations = [];
  for (const word of base) {
    variations.push(word);
    variations.push(word.toUpperCase());
    variations.push(word.charAt(0).toUpperCase() + word.slice(1));
    variations.push(word + '1');
    variations.push(word + '123');
    variations.push(word + '!');
    variations.push('1' + word);
    variations.push('123' + word);
  }
  
  return variations;
}

function applyRules(word) {
  const variations = new Set();
  variations.add(word);
  variations.add(word.toUpperCase());
  variations.add(word.toLowerCase());
  variations.add(word.charAt(0).toUpperCase() + word.slice(1));
  variations.add(word + '1');
  variations.add(word + '123');
  variations.add(word + '!');
  variations.add(word + '@');
  variations.add('1' + word);
  variations.add('123' + word);
  variations.add(word.split('').reverse().join(''));
  
  return Array.from(variations);
}

function generateCombinations(chars, length) {
  const results = [];
  const backtrack = (current) => {
    if (current.length === length) {
      results.push(current.join(''));
      return;
    }
    for (const char of chars) {
      current.push(char);
      backtrack(current);
      current.pop();
    }
  };
  backtrack([]);
  return results;
}

function getSuggestions(hashType) {
  return [
    'Try using a larger wordlist',
    'Use mask attack if you know the password pattern',
    'Try rule-based attacks for common variations',
    'Consider using GPU-accelerated hashcat locally for complex hashes',
    'Check if the hash type is correctly identified'
  ];
}