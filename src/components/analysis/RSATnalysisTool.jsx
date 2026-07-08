import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Key } from 'lucide-react';
import { motion } from 'framer-motion';

const isPrime = (num) => {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => (b === 0 ? a : gcd(b, a % b));

const modInverse = (a, m) => {
  let m0 = m;
  let y = 0;
  let x = 1;
  if (m === 1) return 0;
  while (a > 1) {
    const q = Math.floor(a / m);
    const t = m;
    m = a % m;
    a = t;
    const t2 = y;
    y = x - q * y;
    x = t2;
  }
  if (x < 0) x += m0;
  return x;
};

export default function RSATnalysisTool() {
  const [p, setP] = useState('');
  const [q, setQ] = useState('');
  const [e, setE] = useState('65537');
  const [result, setResult] = useState(null);

  const analyze = () => {
    const pVal = parseInt(p);
    const qVal = parseInt(q);
    const eVal = parseInt(e);
    
    if (!pVal || !qVal || !eVal) return;

    const n = pVal * qVal;
    const phiN = (pVal - 1) * (qVal - 1);
    const d = modInverse(eVal, phiN);
    const keySize = Math.floor(Math.log2(n));

    // Warnings
    const warnings = [];
    
    // p ≈ q check (Fermat attack)
    const ratio = Math.max(pVal, qVal) / Math.min(pVal, qVal);
    if (ratio < 1.5) {
      warnings.push({ type: 'Fermat Attack Risk', desc: 'p and q are too close in value', severity: 'high' });
    }

    // Small e check
    if (eVal === 3) {
      warnings.push({ type: 'Small e Risk', desc: 'e=3 is vulnerable to certain attacks', severity: 'medium' });
    }

    // Small n check
    if (keySize < 512) {
      warnings.push({ type: 'Weak Key Size', desc: `${keySize}-bit key is factorable`, severity: 'critical' });
    }

    // p-1 smoothness check (simplified)
    const pMinus1 = pVal - 1;
    let smooth = true;
    for (const prime of [2, 3, 5, 7, 11, 13, 17, 19, 23]) {
      let temp = pMinus1;
      while (temp % prime === 0) temp /= prime;
      if (temp === 1) {
        smooth = false;
        break;
      }
    }
    if (!smooth) {
      warnings.push({ type: 'Pollard p-1 Risk', desc: 'p-1 may be smooth', severity: 'medium' });
    }

    // Primality check
    if (!isPrime(pVal)) {
      warnings.push({ type: 'P Not Prime', desc: 'p must be prime', severity: 'critical' });
    }
    if (!isPrime(qVal)) {
      warnings.push({ type: 'Q Not Prime', desc: 'q must be prime', severity: 'critical' });
    }

    // Encryption demo
    const message = 42n;
    const nBig = BigInt(n);
    const eBig = BigInt(eVal);
    const dBig = BigInt(d);
    const encrypted = BigInt(message) ** eBig % nBig;
    const decrypted = encrypted ** dBig % nBig;

    setResult({ n, phiN, d, keySize, warnings, demo: { message, encrypted, decrypted } });
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-4 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">p (prime 1)</label>
          <Input
            type="number"
            placeholder="61"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">q (prime 2)</label>
          <Input
            type="number"
            placeholder="53"
            value={q}
            onChange={(e) => setQ(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">e (public exponent)</label>
          <Input
            type="number"
            placeholder="65537"
            value={e}
            onChange={(e) => setE(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="flex items-end">
          <Button onClick={analyze} className="w-full">Analyze RSA</Button>
        </div>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">n = p × q</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-mono font-bold text-primary">{result.n}</div>
                <div className="text-[10px] text-muted-foreground">modulus</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">φ(n)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-mono font-bold text-chart-4">{result.phiN}</div>
                <div className="text-[10px] text-muted-foreground">totient</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">d (private)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-mono font-bold text-accent">{result.d}</div>
                <div className="text-[10px] text-muted-foreground">private exponent</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Key Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-chart-2">{result.keySize}</div>
                <div className="text-[10px] text-muted-foreground">bits</div>
              </CardContent>
            </Card>
          </div>
          {result.warnings.length > 0 && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> Security Warnings
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.warnings.map((w, i) => (
                    <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-destructive/10">
                      <div>
                        <div className="text-xs font-mono font-bold text-destructive">{w.type}</div>
                        <div className="text-[10px] text-muted-foreground">{w.desc}</div>
                      </div>
                      <Badge variant="outline" className={`text-[10px] ${
                        w.severity === 'critical' ? 'border-destructive text-destructive' :
                        w.severity === 'high' ? 'border-orange-500 text-orange-500' :
                        'border-yellow-500 text-yellow-500'
                      }`}>{w.severity.toUpperCase()}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Key className="w-4 h-4" /> Encryption Demo
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3 text-center">
                <div>
                  <div className="text-[10px] text-muted-foreground">Message (m)</div>
                  <div className="text-lg font-mono font-bold">{result.demo.message.toString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Encrypted (m^e mod n)</div>
                  <div className="text-lg font-mono font-bold text-primary">{result.demo.encrypted.toString()}</div>
                </div>
                <div>
                  <div className="text-[10px] text-muted-foreground">Decrypted (c^d mod n)</div>
                  <div className="text-lg font-mono font-bold text-green-400">{result.demo.decrypted.toString()}</div>
                </div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}