import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Network, AlertTriangle, CheckCircle } from 'lucide-react';
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

const modPow = (base, exp, mod) => {
  let result = 1n;
  base = BigInt(base) % BigInt(mod);
  exp = BigInt(exp);
  mod = BigInt(mod);
  while (exp > 0n) {
    if (exp % 2n === 1n) result = (result * base) % mod;
    exp = exp / 2n;
    base = (base * base) % mod;
  }
  return result;
};

export default function DiffieHellmanTool() {
  const [p, setP] = useState('');
  const [g, setG] = useState('');
  const [a, setA] = useState('');
  const [b, setB] = useState('');
  const [mitmMode, setMitmMode] = useState(false);
  const [result, setResult] = useState(null);

  const simulate = () => {
    const pVal = BigInt(p);
    const gVal = BigInt(g);
    const aVal = BigInt(a);
    const bVal = BigInt(b);
    
    if (!pVal || !gVal || !aVal || !bVal) return;

    // Alice and Bob's public values
    const A = modPow(gVal, aVal, pVal);
    const B = modPow(gVal, bVal, pVal);
    
    // Shared secrets
    const sAlice = modPow(B, aVal, pVal);
    const sBob = modPow(A, bVal, pVal);

    let mitmData = null;
    if (mitmMode) {
      const mVal = 7n; // Eve's private key
      const M = modPow(gVal, mVal, pVal);
      const sAM = modPow(M, aVal, pVal); // Alice-Eve shared
      const sMB = modPow(M, bVal, pVal); // Eve-Bob shared
      mitmData = { mVal, M, sAM, sMB };
    }

    setResult({
      A, B,
      sAlice, sBob,
      match: sAlice === sBob,
      pPrime: isPrime(Number(p)),
      mitmData,
      validation: {
        pPrime: isPrime(Number(p)),
        gValid: Number(g) < Number(p),
        secretMatch: sAlice === sBob
      }
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-5 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">p (prime modulus)</label>
          <Input
            type="number"
            placeholder="23"
            value={p}
            onChange={(e) => setP(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">g (generator)</label>
          <Input
            type="number"
            placeholder="5"
            value={g}
            onChange={(e) => setG(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">a (Alice's private)</label>
          <Input
            type="number"
            placeholder="6"
            value={a}
            onChange={(e) => setA(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">b (Bob's private)</label>
          <Input
            type="number"
            placeholder="15"
            value={b}
            onChange={(e) => setB(e.target.value)}
            className="font-mono"
          />
        </div>
        <div className="flex items-end gap-2">
          <Button onClick={simulate} className="flex-1">Simulate</Button>
        </div>
      </div>
      <div className="flex items-center gap-2">
        <input
          type="checkbox"
          id="mitm"
          checked={mitmMode}
          onChange={(e) => setMitmMode(e.target.checked)}
          className="rounded"
        />
        <label htmlFor="mitm" className="text-sm text-muted-foreground">Enable MITM Attack Simulation</label>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid sm:grid-cols-4 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">A = g^a mod p</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-mono font-bold text-primary">{result.A.toString()}</div>
                <div className="text-[10px] text-muted-foreground">Alice's public</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">B = g^b mod p</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-mono font-bold text-accent">{result.B.toString()}</div>
                <div className="text-[10px] text-muted-foreground">Bob's public</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Shared Secret (Alice)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-mono font-bold text-chart-4">{result.sAlice.toString()}</div>
                <div className="text-[10px] text-muted-foreground">s = B^a mod p</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Shared Secret (Bob)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xl font-mono font-bold text-chart-2">{result.sBob.toString()}</div>
                <div className="text-[10px] text-muted-foreground">s = A^b mod p</div>
              </CardContent>
            </Card>
          </div>
          <Card className={result.match ? 'border-green-500/50' : 'border-destructive/50'}>
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                {result.match ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                Validation Results
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid sm:grid-cols-3 gap-3">
                <div className="flex items-center gap-2">
                  {result.validation.pPrime ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                  <span className="text-xs font-mono">p is prime: {result.validation.pPrime ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.validation.gValid ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                  <span className="text-xs font-mono">g {'<'} p: {result.validation.gValid ? 'Yes' : 'No'}</span>
                </div>
                <div className="flex items-center gap-2">
                  {result.validation.secretMatch ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                  <span className="text-xs font-mono">Secrets match: {result.validation.secretMatch ? 'Yes' : 'No'}</span>
                </div>
              </div>
            </CardContent>
          </Card>
          {result.mitmData && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-destructive">
                  <Network className="w-4 h-4" /> MITM Attack Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="grid sm:grid-cols-2 gap-3">
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <div className="text-[10px] text-muted-foreground">Eve's public value M = g^m mod p</div>
                      <div className="text-lg font-mono font-bold">{result.mitmData.M.toString()}</div>
                    </div>
                    <div className="p-3 rounded-lg bg-destructive/10">
                      <div className="text-[10px] text-muted-foreground">Eve intercepts and creates two shared secrets</div>
                      <div className="text-xs font-mono mt-2">
                        Alice-Eve: {result.mitmData.sAM.toString()}<br/>
                        Eve-Bob: {result.mitmData.sMB.toString()}
                      </div>
                    </div>
                  </div>
                  <p className="text-xs text-muted-foreground">
                    In MITM mode, Eve intercepts A and B, sends M to both parties, and establishes separate shared secrets with Alice and Bob.
                    This allows Eve to decrypt, read, and re-encrypt all messages without detection.
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