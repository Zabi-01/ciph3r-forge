import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { Badge } from '@/components/ui/badge';
import { ScrollArea } from '@/components/ui/scroll-area';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { Shield, Key, Lock, Unlock, AlertTriangle, Copy, Check, Loader2 } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import OutputDisplay from '@/components/crypto/OutputDisplay';
import { base44 } from '@/api/base44Client';

export default function RSATool() {
  const [activeTab, setActiveTab] = useState('decrypt');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  
  // Decrypt tab
  const [publicKey, setPublicKey] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  
  // Factor tab
  const [n, setN] = useState('');
  const [e, setE] = useState('65537');
  
  // Common modulus tab
  const [n1, setN1] = useState('');
  const [e1, setE1] = useState('');
  const [c1, setC1] = useState('');
  const [n2, setN2] = useState('');
  const [e2, setE2] = useState('');
  const [c2, setC2] = useState('');

  const parsePublicKey = (pemKey) => {
    try {
      const pemStr = pemKey.replace(/-----(?:BEGIN|END) PUBLIC KEY-----/g, '').replace(/\s+/g, '');
      const binaryStr = atob(pemStr);
      let hexStr = '';
      for (let i = 0; i < binaryStr.length; i++) {
        hexStr += binaryStr.charCodeAt(i).toString(16).padStart(2, '0');
      }
      return hexStr;
    } catch (error) {
      return null;
    }
  };

  const extractNandE = (pemKey) => {
    try {
      const pemStr = pemKey.replace(/-----(?:BEGIN|END) PUBLIC KEY-----/g, '').replace(/\s+/g, '');
      const binary = atob(pemStr);
      
      const bytes = [];
      for (let i = 0; i < binary.length; i++) {
        bytes.push(binary.charCodeAt(i));
      }
      
      let idx = 0;
      if (bytes[idx] === 0x30 && bytes[idx + 1] === 0x82) {
        idx = 4 + bytes[idx + 2] * 256 + bytes[idx + 3];
      }
      
      while (idx < bytes.length - 10) {
        if (bytes[idx] === 0x02) {
          const lenN = bytes[idx + 1];
          const nBytes = bytes.slice(idx + 2, idx + 2 + lenN);
          const nHex = nBytes.map(b => b.toString(16).padStart(2, '0')).join('');
          const nBigInt = BigInt('0x' + nHex);
          
          idx += 2 + lenN;
          if (bytes[idx] === 0x02) {
            const lenE = bytes[idx + 1];
            const eBytes = bytes.slice(idx + 2, idx + 2 + lenE);
            const eHex = eBytes.map(b => b.toString(16).padStart(2, '0')).join('');
            const eBigInt = BigInt('0x' + eHex);
            return { n: nBigInt.toString(), e: eBigInt.toString() };
          }
        }
        idx++;
      }
      return null;
    } catch (error) {
      return null;
    }
  };

  const handleDecrypt = async () => {
    setLoading(true);
    try {
      const extracted = extractNandE(publicKey);
      if (!extracted) {
        setResult({ error: 'Failed to parse public key. Please provide a valid PEM format.' });
        setLoading(false);
        return;
      }

      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `RSA CTF Challenge - Decrypt the ciphertext.
        
Public Key:
- n (modulus): ${extracted.n}
- e (exponent): ${extracted.e}

Ciphertext (decimal): ${ciphertext}

Analyze this RSA challenge for common CTF weaknesses:
1. Check if n can be factored (small primes, weak generation)
2. Check if e is small and if ciphertext is small (e-th root attack)
3. Check for common factors with known weak keys
4. Try Wiener's attack if e is large
5. Check if n is a perfect power

Provide the decrypted plaintext if possible, or explain which attack might work and why. Output the flag in CTF{...} format if found.`,
        response_json_schema: null,
      });

      setResult({ success: response });
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const handleFactor = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `RSA CTF Challenge - Factor the modulus n.
        
n (modulus): ${n}
e (exponent): ${e}

Attempt to factor n using:
1. Trial division for small primes
2. Fermat's factorization (if p and q are close)
3. Pollard's rho algorithm
4. Check if n has small factors
5. Check if n is a perfect square or power

Return the factors p and q if found, and calculate the private exponent d.
Show the mathematical steps.`,
        response_json_schema: null,
      });

      setResult({ success: response });
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  const handleCommonModulus = async () => {
    setLoading(true);
    try {
      const response = await base44.integrations.Core.InvokeLLM({
        prompt: `RSA Common Modulus Attack CTF Challenge.
        
Key 1:
- n: ${n1}
- e1: ${e1}
- c1: ${c1}

Key 2:
- n: ${n2}
- e2: ${e2}
- c2: ${c2}

If n1 == n2 (common modulus), use the common modulus attack:
1. Verify n1 equals n2
2. Use extended Euclidean algorithm to find gcd(e1, e2) = 1
3. Find s1, s2 such that s1*e1 + s2*e2 = 1
4. Compute m = (c1^s1 * c2^s2) mod n

Show all mathematical steps and recover the plaintext message.`,
        response_json_schema: null,
      });

      setResult({ success: response });
    } catch (error) {
      setResult({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-chart-5">RSA</span> CTF Tool
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">Attack weak RSA keys and decrypt CTF challenges</p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="w-full">
        <TabsList className="grid grid-cols-3 w-full bg-secondary/50">
          <TabsTrigger value="decrypt" className="font-mono text-xs">Decrypt</TabsTrigger>
          <TabsTrigger value="factor" className="font-mono text-xs">Factor N</TabsTrigger>
          <TabsTrigger value="common" className="font-mono text-xs">Common Modulus</TabsTrigger>
        </TabsList>

        <TabsContent value="decrypt" className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Lock className="w-4 h-4 text-chart-5" />
                RSA Decryption
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">Public Key (PEM format)</Label>
                <Textarea
                  placeholder="-----BEGIN PUBLIC KEY-----&#10;MIIBIjANBgkq..."
                  value={publicKey}
                  onChange={(e) => setPublicKey(e.target.value)}
                  className="font-mono text-xs h-32 bg-secondary/50 border-border/50"
                />
                {publicKey && extractNandE(publicKey) && (
                  <Alert className="bg-primary/5 border-primary/20">
                    <AlertDescription className="text-xs font-mono">
                      <Check className="w-3 h-3 text-primary inline mr-1" />
                      Parsed: n={extractNandE(publicKey)?.n?.substring(0, 20)}... e={extractNandE(publicKey)?.e}
                    </AlertDescription>
                  </Alert>
                )}
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">Ciphertext (decimal)</Label>
                <Input
                  placeholder="12345678901234567890..."
                  value={ciphertext}
                  onChange={(e) => setCiphertext(e.target.value)}
                  className="font-mono text-sm bg-secondary/50 border-border/50"
                />
              </div>

              <Button onClick={handleDecrypt} disabled={!publicKey || !ciphertext || loading} className="w-full font-mono text-xs gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Unlock className="w-4 h-4" />}
                {loading ? 'Analyzing...' : 'Decrypt'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="factor" className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Key className="w-4 h-4 text-chart-5" />
                Factor Modulus N
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">n (modulus)</Label>
                <Textarea
                  placeholder="Large composite number to factor..."
                  value={n}
                  onChange={(e) => setN(e.target.value)}
                  className="font-mono text-xs h-24 bg-secondary/50 border-border/50"
                />
              </div>

              <div className="space-y-2">
                <Label className="text-xs font-mono text-muted-foreground">e (public exponent)</Label>
                <Input
                  placeholder="65537"
                  value={e}
                  onChange={(e) => setE(e.target.value)}
                  className="font-mono text-sm bg-secondary/50 border-border/50"
                />
              </div>

              <Button onClick={handleFactor} disabled={!n || loading} className="w-full font-mono text-xs gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Factoring...' : 'Factor N'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="common" className="space-y-4">
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <AlertTriangle className="w-4 h-4 text-chart-5" />
                Common Modulus Attack
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">Key 1 - n</Label>
                  <Input
                    placeholder="Modulus n"
                    value={n1}
                    onChange={(e) => setN1(e.target.value)}
                    className="font-mono text-xs bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">Key 1 - e</Label>
                  <Input
                    placeholder="Public exponent"
                    value={e1}
                    onChange={(e) => setE1(e.target.value)}
                    className="font-mono text-xs bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">Key 1 - ciphertext</Label>
                  <Input
                    placeholder="Encrypted message"
                    value={c1}
                    onChange={(e) => setC1(e.target.value)}
                    className="font-mono text-xs bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">Key 2 - n</Label>
                  <Input
                    placeholder="Same modulus n"
                    value={n2}
                    onChange={(e) => setN2(e.target.value)}
                    className="font-mono text-xs bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">Key 2 - e</Label>
                  <Input
                    placeholder="Different exponent"
                    value={e2}
                    onChange={(e) => setE2(e.target.value)}
                    className="font-mono text-xs bg-secondary/50 border-border/50"
                  />
                </div>
                <div className="space-y-2">
                  <Label className="text-xs font-mono text-muted-foreground">Key 2 - ciphertext</Label>
                  <Input
                    placeholder="Encrypted message"
                    value={c2}
                    onChange={(e) => setC2(e.target.value)}
                    className="font-mono text-xs bg-secondary/50 border-border/50"
                  />
                </div>
              </div>

              <Button onClick={handleCommonModulus} disabled={!n1 || !n2 || !c1 || !c2 || loading} className="w-full font-mono text-xs gap-2">
                {loading ? <Loader2 className="w-4 h-4 animate-spin" /> : <Shield className="w-4 h-4" />}
                {loading ? 'Attacking...' : 'Execute Common Modulus Attack'}
              </Button>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      <AnimatePresence>
        {result && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="space-y-4"
          >
            {result.error ? (
              <Alert className="bg-destructive/10 border-destructive/30">
                <AlertTriangle className="w-4 h-4 text-destructive" />
                <AlertDescription className="text-sm font-mono text-destructive">
                  {result.error}
                </AlertDescription>
              </Alert>
            ) : (
              <OutputDisplay label="Analysis Result" value={result.success} mono={false} />
            )}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}