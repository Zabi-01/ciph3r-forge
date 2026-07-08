import { useState } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Badge } from '@/components/ui/badge';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { ScrollArea } from '@/components/ui/scroll-area';
import { motion, AnimatePresence } from 'framer-motion';
import { 
  Shield, Key, Lock, Unlock, AlertTriangle, Zap, RefreshCw, 
  Copy, Check, Loader2, TrendingDown, Hash, Binary
} from 'lucide-react';
import OutputDisplay from '@/components/crypto/OutputDisplay';
import { base44 } from '@/api/base44Client';

const gcd = (a, b) => {
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

const extendedGCD = (a, b) => {
  if (a === 0n) return [b, 0n, 1n];
  const [g, x, y] = extendedGCD(b % a, a);
  return [g, y - (b / a) * x, x];
};

const modInverse = (e, phi) => {
  const [g, x] = extendedGCD(e, phi);
  if (g !== 1n) return null;
  return ((x % phi) + phi) % phi;
};

const isPrime = (num) => {
  if (num < 2n) return false;
  if (num === 2n) return true;
  if (num % 2n === 0n) return false;
  for (let i = 3n; i * i <= num; i += 2n) {
    if (num % i === 0n) return false;
  }
  return true;
};

const continuedFraction = (n, e) => {
  const convergents = [];
  let [a, b] = [n, e];
  const coeffs = [];
  
  while (b !== 0n) {
    coeffs.push(a / b);
    const temp = b;
    b = a % b;
    a = temp;
  }
  
  let [h0, h1] = [1n, coeffs[0]];
  let [k0, k1] = [0n, 1n];
  convergents.push([h1, k1]);
  
  for (let i = 1; i < coeffs.length; i++) {
    const h2 = coeffs[i] * h1 + h0;
    const k2 = coeffs[i] * k1 + k0;
    convergents.push([h2, k2]);
    h0 = h1; h1 = h2;
    k0 = k1; k1 = k2;
  }
  
  return convergents;
};

export default function RSAToolkit() {
  const [activeTab, setActiveTab] = useState('wiener');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [copied, setCopied] = useState(false);

  // Wiener's attack inputs
  const [wienerN, setWienerN] = useState('');
  const [wienerE, setWienerE] = useState('');
  
  // Small e attack inputs
  const [smallEN, setSmallEN] = useState('');
  const [smallEE, setSmallEE] = useState('3');
  const [smallEC, setSmallEC] = useState('');
  
  // Common modulus inputs
  const [commonN, setCommonN] = useState('');
  const [commonE1, setCommonE1] = useState('');
  const [commonC1, setCommonC1] = useState('');
  const [commonE2, setCommonE2] = useState('');
  const [commonC2, setCommonC2] = useState('');
  
  // Factor n inputs
  const [factorN, setFactorN] = useState('');

  const wienerAttack = () => {
    try {
      const n = BigInt(wienerN);
      const e = BigInt(wienerE);
      const convergents = continuedFraction(n, e);
      
      for (const [k, d] of convergents) {
        if (d === 0n) continue;
        if ((e * d - 1n) % k !== 0n) continue;
        
        const phi = (e * d - 1n) / k;
        const sum = n - phi + 1n;
        const discriminant = sum * sum - 4n * n;
        
        if (discriminant < 0n) continue;
        const sqrtDisc = BigInt(Math.floor(Number(discriminant)));
        if (sqrtDisc * sqrtDisc !== discriminant) continue;
        
        const p = (sum + sqrtDisc) / 2n;
        const q = (sum - sqrtDisc) / 2n;
        
        if (p * q === n && isPrime(p) && isPrime(q)) {
          return {
            success: true,
            d: d.toString(),
            p: p.toString(),
            q: q.toString(),
            phi: phi.toString(),
            message: "Wiener's attack successful! Private key recovered."
          };
        }
      }
      
      return { success: false, message: "Wiener's attack failed. Key may not be vulnerable (d is not small enough)." };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  };

  const smallEAttack = async () => {
    try {
      const n = BigInt(smallEN);
      const e = BigInt(smallEE);
      const c = BigInt(smallEC);
      
      // Try e-th root attack for small e
      const ethRoot = BigInt(Math.round(Math.pow(Number(c), 1 / Number(e))));
      if (ethRoot ** e === c) {
        const hexStr = ethRoot.toString(16);
        let plaintextText = '';
        try {
          // Convert hex to text manually (Buffer not available in browser)
          for (let i = 0; i < hexStr.length; i += 2) {
            const charCode = parseInt(hexStr.slice(i, i + 2), 16);
            if (charCode >= 32 && charCode <= 126) {
              plaintextText += String.fromCharCode(charCode);
            }
          }
        } catch (e) {
          plaintextText = '(non-printable)';
        }
        return {
          success: true,
          plaintext: ethRoot.toString(),
          plaintextText: plaintextText || '(non-printable)',
          message: `e-th root attack successful! e=${e} is too small and ciphertext wasn't padded.`
        };
      }
      
      // Try Hastad's broadcast attack if we have multiple ciphertexts
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `RSA Small e Attack Analysis:
        
n = ${n}
e = ${e}
ciphertext = ${c}

Analyze this RSA configuration for small e vulnerabilities:
1. Check if e=3 and if ciphertext is small enough for e-th root attack
2. Check for Hastad's broadcast attack scenario
3. Check if padding was not applied (textbook RSA)
4. Suggest the attack approach and show mathematical steps

If the plaintext can be recovered, provide it in both numeric and text form.`,
        response_json_schema: null,
      });
      
      return { success: true, analysis: response };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  };

  const commonModulusAttack = () => {
    try {
      const n = BigInt(commonN);
      const e1 = BigInt(commonE1);
      const c1 = BigInt(commonC1);
      const e2 = BigInt(commonE2);
      const c2 = BigInt(commonC2);
      
      if (gcd(e1, e2) !== 1n) {
        return { success: false, message: "e1 and e2 must be coprime for common modulus attack" };
      }
      
      const [g, s1, s2] = extendedGCD(e1, e2);
      
      let m1, m2;
      if (s1 < 0n) {
        m1 = modInverse(c1, n) ** (-s1);
      } else {
        m1 = c1 ** s1;
      }
      
      if (s2 < 0n) {
        m2 = modInverse(c2, n) ** (-s2);
      } else {
        m2 = c2 ** s2;
      }
      
      const m = (m1 * m2) % n;
      
      return {
        success: true,
        plaintext: m.toString(),
        s1: s1.toString(),
        s2: s2.toString(),
        message: "Common modulus attack successful! Message recovered using extended Euclidean algorithm."
      };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  };

  const factorizeN = async () => {
    try {
      const n = BigInt(factorN);
      
      // Check for small factors first
      const smallPrimes = [2n, 3n, 5n, 7n, 11n, 13n, 17n, 19n, 23n, 29n, 31n, 37n];
      for (const p of smallPrimes) {
        if (n % p === 0n) {
          return {
            success: true,
            p: p.toString(),
            q: (n / p).toString(),
            method: 'Small factor found',
            message: `Found small factor: ${p}`
          };
        }
      }
      
      // Fermat's factorization (for close primes)
      const sqrtN = BigInt(Math.ceil(Math.sqrt(Number(n))));
      for (let a = sqrtN; a < sqrtN + 10000n; a++) {
        const b2 = a * a - n;
        if (b2 < 0n) continue;
        const b = BigInt(Math.floor(Math.sqrt(Number(b2))));
        if (b * b === b2) {
          const p = a - b;
          const q = a + b;
          if (p * q === n) {
            return {
              success: true,
              p: p.toString(),
              q: q.toString(),
              method: "Fermat's factorization (primes are close)",
              message: "Fermat's factorization successful! p and q are close to sqrt(n)."
            };
          }
        }
      }
      
      // Use AI for complex factorization
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `RSA Factorization Challenge:
        
n = ${n}

Attempt to factor n using:
1. Check if n has small prime factors (< 1000)
2. Fermat's factorization (if p and q are close)
3. Pollard's rho algorithm
4. Check if n is a perfect power
5. Check for weak key generation patterns

Provide factors p and q if found, or explain why this n is secure.
Show all mathematical steps and calculations.`,
        response_json_schema: null,
      });
      
      return { success: true, analysis: response };
    } catch (error) {
      return { success: false, message: `Error: ${error.message}` };
    }
  };

  const handleAttack = async (attackType) => {
    setLoading(true);
    let res;
    
    switch (attackType) {
      case 'wiener':
        res = wienerAttack();
        break;
      case 'smallE':
        res = await smallEAttack();
        break;
      case 'common':
        res = commonModulusAttack();
        break;
      case 'factor':
        res = await factorizeN();
        break;
      default:
        res = { success: false, message: 'Unknown attack type' };
    }
    
    setResult(res);
    setLoading(false);
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-destructive">RSA</span> Attack Toolkit
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">Advanced CTF attacks based on RsaCtfTool</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-2 lg:grid-cols-4 w-full bg-secondary/50">
          <TabsTrigger value="wiener" className="font-mono text-xs gap-1">
            <TrendingDown className="w-3 h-3" /> Wiener
          </TabsTrigger>
          <TabsTrigger value="smallE" className="font-mono text-xs gap-1">
            <Zap className="w-3 h-3" /> Small e
          </TabsTrigger>
          <TabsTrigger value="common" className="font-mono text-xs gap-1">
            <RefreshCw className="w-3 h-3" /> Common Modulus
          </TabsTrigger>
          <TabsTrigger value="factor" className="font-mono text-xs gap-1">
            <Hash className="w-3 h-3" /> Factor N
          </TabsTrigger>
        </TabsList>

        {/* Wiener's Attack */}
        <TabsContent value="wiener" className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <TrendingDown className="w-4 h-4 text-chart-1" />
                Wiener's Attack (Small d)
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-chart-1/5 border-chart-1/20">
                <AlertDescription className="text-xs font-mono">
                  Works when private exponent d {'<'} n^0.25. Uses continued fractions to recover d from e/n.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono">n (modulus)</Label>
                  <Textarea
                    placeholder="Large composite number"
                    value={wienerN}
                    onChange={(e) => setWienerN(e.target.value)}
                    className="font-mono text-xs h-24 bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono">e (public exponent)</Label>
                  <Textarea
                    placeholder="Public exponent"
                    value={wienerE}
                    onChange={(e) => setWienerE(e.target.value)}
                    className="font-mono text-xs h-24 bg-secondary/50"
                  />
                </div>
              </div>

              <Button onClick={() => handleAttack('wiener')} disabled={!wienerN || !wienerE || loading} className="w-full font-mono text-xs gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Zap className="w-4 h-4" />}
                {loading ? 'Computing continued fractions...' : 'Execute Wiener\'s Attack'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Small e Attack */}
        <TabsContent value="smallE" className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Zap className="w-4 h-4 text-chart-4" />
                Small e Attack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-chart-4/5 border-chart-4/20">
                <AlertDescription className="text-xs font-mono">
                  When e is small (e.g., 3) and no padding is used, e-th root attack may work.
                </AlertDescription>
              </Alert>

              <div className="grid grid-cols-3 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono">n (modulus)</Label>
                  <Input
                    placeholder="Modulus"
                    value={smallEN}
                    onChange={(e) => setSmallEN(e.target.value)}
                    className="font-mono text-xs bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono">e (exponent)</Label>
                  <Input
                    placeholder="3"
                    value={smallEE}
                    onChange={(e) => setSmallEE(e.target.value)}
                    className="font-mono text-xs bg-secondary/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono">c (ciphertext)</Label>
                  <Input
                    placeholder="Encrypted message"
                    value={smallEC}
                    onChange={(e) => setSmallEC(e.target.value)}
                    className="font-mono text-xs bg-secondary/50"
                  />
                </div>
              </div>

              <Button onClick={() => handleAttack('smallE')} disabled={!smallEN || !smallEC || loading} className="w-full font-mono text-xs gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Execute Small e Attack'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Common Modulus Attack */}
        <TabsContent value="common" className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <RefreshCw className="w-4 h-4 text-accent" />
                Common Modulus Attack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-accent/5 border-accent/20">
                <AlertDescription className="text-xs font-mono">
                  When same message is encrypted with same n but different e values, use extended Euclidean algorithm.
                </AlertDescription>
              </Alert>

              <div className="space-y-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono">Common modulus n</Label>
                  <Input
                    placeholder="Same n for both keys"
                    value={commonN}
                    onChange={(e) => setCommonN(e.target.value)}
                    className="font-mono text-xs bg-secondary/50"
                  />
                </div>

                <div className="grid grid-cols-2 gap-4 p-3 rounded-lg bg-secondary/20 border border-border/30">
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-chart-1">Key 1</Label>
                    <Input
                      placeholder="e1"
                      value={commonE1}
                      onChange={(e) => setCommonE1(e.target.value)}
                      className="font-mono text-xs bg-background/50"
                    />
                    <Input
                      placeholder="c1"
                      value={commonC1}
                      onChange={(e) => setCommonC1(e.target.value)}
                      className="font-mono text-xs bg-background/50"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label className="text-xs font-mono text-chart-2">Key 2</Label>
                    <Input
                      placeholder="e2"
                      value={commonE2}
                      onChange={(e) => setCommonE2(e.target.value)}
                      className="font-mono text-xs bg-background/50"
                    />
                    <Input
                      placeholder="c2"
                      value={commonC2}
                      onChange={(e) => setCommonC2(e.target.value)}
                      className="font-mono text-xs bg-background/50"
                    />
                  </div>
                </div>
              </div>

              <Button onClick={() => handleAttack('common')} disabled={!commonN || !commonE1 || !commonC1 || !commonE2 || !commonC2 || loading} className="w-full font-mono text-xs gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Key className="w-4 h-4" />}
                {loading ? 'Computing GCD...' : 'Execute Common Modulus Attack'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        {/* Factor N */}
        <TabsContent value="factor" className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Hash className="w-4 h-4 text-chart-3" />
                Factor Modulus N
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <Alert className="bg-chart-3/5 border-chart-3/20">
                <AlertDescription className="text-xs font-mono">
                  Attempts: small factors, Fermat's factorization (close primes), Pollard's rho, and AI-assisted analysis.
                </AlertDescription>
              </Alert>

              <div className="space-y-2">
                <Label className="text-xs font-mono">n (modulus to factor)</Label>
                <Textarea
                  placeholder="Large composite number"
                  value={factorN}
                  onChange={(e) => setFactorN(e.target.value)}
                  className="font-mono text-xs h-32 bg-secondary/50"
                />
              </div>

              <Button onClick={() => handleAttack('factor')} disabled={!factorN || loading} className="w-full font-mono text-xs gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Factoring...' : 'Factor N'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Results */}
      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result.success ? (
              <Card className="bg-primary/5 border-primary/20">
                <CardHeader>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <Check className="w-4 h-4 text-primary" />
                    Attack Successful
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <p className="text-xs font-mono text-muted-foreground">{result.message}</p>
                  
                  {result.p && result.q && (
                    <div className="grid grid-cols-2 gap-3">
                      <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <p className="text-xs text-muted-foreground font-mono">Prime p</p>
                        <p className="font-mono text-sm break-all text-chart-1">{result.p}</p>
                      </div>
                      <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                        <p className="text-xs text-muted-foreground font-mono">Prime q</p>
                        <p className="font-mono text-sm break-all text-chart-2">{result.q}</p>
                      </div>
                    </div>
                  )}
                  
                  {result.d && (
                    <div className="p-3 rounded-lg bg-destructive/5 border-destructive/20">
                      <p className="text-xs text-muted-foreground font-mono">Private exponent d</p>
                      <p className="font-mono text-sm break-all text-destructive">{result.d}</p>
                    </div>
                  )}
                  
                  {result.phi && (
                    <div className="p-3 rounded-lg bg-accent/5 border-accent/20">
                      <p className="text-xs text-muted-foreground font-mono">Euler's totient φ(n)</p>
                      <p className="font-mono text-sm break-all text-accent">{result.phi}</p>
                    </div>
                  )}
                  
                  {result.plaintext && (
                    <div className="p-3 rounded-lg bg-primary/5 border-primary/20">
                      <p className="text-xs text-muted-foreground font-mono">Recovered plaintext</p>
                      <p className="font-mono text-sm break-all text-primary">{result.plaintext}</p>
                      {result.plaintextText && (
                        <p className="font-mono text-xs text-muted-foreground mt-1">
                          As text: {result.plaintextText}
                        </p>
                      )}
                    </div>
                  )}
                  
                  {result.analysis && (
                    <OutputDisplay label="Detailed Analysis" value={result.analysis} mono={false} />
                  )}
                </CardContent>
              </Card>
            ) : (
              <Card className="bg-destructive/5 border-destructive/20">
                <CardHeader>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-destructive" />
                    Attack Failed
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <p className="text-xs font-mono text-destructive">{result.message}</p>
                </CardContent>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}