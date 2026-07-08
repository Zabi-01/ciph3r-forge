import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Shield, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateEntropy } from '@/lib/ciphers/analysis';

export default function OneTimePadTool() {
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState('encrypt');
  const [cipher2, setCipher2] = useState('');
  const [result, setResult] = useState(null);

  const xorStrings = (a, b) => {
    const aBytes = new TextEncoder().encode(a);
    const bBytes = b.match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [];
    const result = new Uint8Array(aBytes.length);
    for (let i = 0; i < aBytes.length; i++) {
      result[i] = aBytes[i] ^ (bBytes[i] || 0);
    }
    return Array.from(result).map(b => b.toString(16).padStart(2, '0')).join('');
  };

  const analyze = () => {
    if (!plaintext || !key) return;

    const keyLengthValid = key.length >= plaintext.length * 2;
    const keyEntropy = calculateEntropy(key);
    const maxEntropy = Math.log2(16); // hex has 16 possible chars
    
    // XOR operation
    const ciphertext = xorStrings(plaintext, key);
    const xorTable = [];
    const pBytes = new TextEncoder().encode(plaintext);
    const kBytes = key.match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [];
    for (let i = 0; i < pBytes.length; i++) {
      xorTable.push({
        pos: i,
        p: pBytes[i],
        k: kBytes[i] || 0,
        c: pBytes[i] ^ (kBytes[i] || 0)
      });
    }

    // Key reuse detection
    let keyReuseWarning = null;
    if (cipher2) {
      const c1Bytes = ciphertext.match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [];
      const c2Bytes = cipher2.match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [];
      const xorResult = c1Bytes.map((b, i) => b ^ (c2Bytes[i] || 0));
      const xorText = xorResult.map(b => {
        if (b >= 32 && b <= 126) return String.fromCharCode(b);
        return '.';
      }).join('');
      keyReuseWarning = {
        xorHex: xorResult.map(b => b.toString(16).padStart(2, '0')).join(''),
        xorText,
        desc: 'If two ciphertexts use the same key, XORing them reveals plaintext XOR plaintext'
      };
    }

    setResult({
      ciphertext,
      xorTable: xorTable.slice(0, 16), // First 16 bytes
      keyLengthValid,
      keyEntropy,
      keyRandom: keyEntropy > maxEntropy * 0.9,
      keyReuseWarning
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Plaintext/Ciphertext</label>
          <Textarea
            placeholder="Enter text..."
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="font-mono text-sm min-h-[80px]"
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Key (hex, same length as plaintext)</label>
            <Input
              placeholder="00112233445566778899aabbccddeeff"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="encrypt">Encrypt</option>
              <option value="decrypt">Decrypt</option>
              <option value="analyze">Analyze Only</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Second Ciphertext (for key reuse detection, optional)</label>
        <Input
          placeholder="Paste another ciphertext encrypted with same key..."
          value={cipher2}
          onChange={(e) => setCipher2(e.target.value)}
          className="font-mono"
        />
      </div>
      <Button onClick={analyze} className="w-full">
        <Shield className="w-4 h-4 mr-2" /> {mode === 'encrypt' ? 'Encrypt' : mode === 'decrypt' ? 'Decrypt' : 'Analyze'}
      </Button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {!result.keyLengthValid && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> Key Length Mismatch
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Key must be at least {plaintext.length * 2} hex characters (same length as plaintext).
                  Current key: {key.length} characters.
                </p>
              </CardContent>
            </Card>
          )}
          {!result.keyRandom && (
            <Card className="border-yellow-500/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-yellow-400">
                  <AlertTriangle className="w-4 h-4" /> Key May Not Be Random
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Key entropy: {result.keyEntropy.toFixed(3)} bits/char.
                  A truly random key should have entropy {'>'} {((Math.log2(16) * 0.9)).toFixed(3)} bits/char.
                </p>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">Ciphertext (Hex)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-lg font-mono font-bold text-primary break-all">{result.ciphertext}</div>
              <div className="text-[10px] text-muted-foreground mt-2">
                ASCII: {result.ciphertext.match(/.{1,2}/g)?.map(x => {
                  const c = parseInt(x, 16);
                  return c >= 32 && c <= 126 ? String.fromCharCode(c) : '.';
                }).join('')}
              </div>
            </CardContent>
          </Card>
          {result.xorTable.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono">XOR Step Table (First 16 bytes)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs font-mono">
                    <thead>
                      <tr className="border-b border-border">
                        <th className="text-left p-2">Pos</th>
                        <th className="text-left p-2">Plaintext</th>
                        <th className="text-left p-2">Key</th>
                        <th className="text-left p-2">Ciphertext</th>
                      </tr>
                    </thead>
                    <tbody>
                      {result.xorTable.map(row => (
                        <tr key={row.pos} className="border-b border-border/50">
                          <td className="p-2 text-muted-foreground">{row.pos}</td>
                          <td className="p-2">{row.p.toString(16).padStart(2, '0')}</td>
                          <td className="p-2">{row.k.toString(16).padStart(2, '0')}</td>
                          <td className="p-2 text-primary">{row.c.toString(16).padStart(2, '0')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </CardContent>
            </Card>
          )}
          {result.keyReuseWarning && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> Key Reuse Detected!
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  <div className="text-xs font-mono">
                    C1 ⊕ C2 (hex): {result.keyReuseWarning.xorHex}
                  </div>
                  <div className="text-xs font-mono">
                    C1 ⊕ C2 (text): {result.keyReuseWarning.xorText}
                  </div>
                  <p className="text-[10px] text-muted-foreground">
                    {result.keyReuseWarning.desc}
                  </p>
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}