import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Bomb, AlertTriangle, CheckCircle } from 'lucide-react';
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

export default function RSASecurityTool() {
  const [n, setN] = useState('');
  const [e, setE] = useState('');
  const [ciphertext, setCiphertext] = useState('');
  const [result, setResult] = useState(null);

  const analyze = () => {
    const nVal = BigInt('0x' + n.replace(/^0x/, ''));
    const eVal = parseInt(e);
    const keySize = nVal.toString(2).length;

    const analysis = {
      keySize,
      eAnalysis: [],
      nAnalysis: [],
      verdict: 'strong',
      suggestions: []
    };

    // e analysis
    if (eVal === 1) {
      analysis.eAnalysis.push({ type: 'e=1', severity: 'critical', desc: 'e=1 means no encryption' });
      analysis.verdict = 'broken';
      analysis.suggestions.push('Use e=65537 (0x10001) for security');
    }
    if (eVal === 3) {
      analysis.eAnalysis.push({ type: 'e=3', severity: 'high', desc: 'Small e vulnerable to Hastad broadcast attack' });
      analysis.suggestions.push('Use e=65537 to prevent Hastad broadcast attacks');
    }
    if (eVal === 65537) {
      analysis.eAnalysis.push({ type: 'e=65537', severity: 'good', desc: 'Standard secure value' });
    }
    if (eVal > 1000000) {
      analysis.eAnalysis.push({ type: 'Large e', severity: 'medium', desc: 'Very large e may be vulnerable to Wiener attack' });
      analysis.suggestions.push('Check if d is small using Wiener attack');
    }

    // n analysis
    const sqrtN = Math.floor(Math.sqrt(Number(nVal)));
    const diff = sqrtN * sqrtN - Number(nVal);
    if (Math.abs(diff) < 10000) {
      analysis.nAnalysis.push({ type: 'Near-square', severity: 'high', desc: 'n is close to a perfect square - Fermat attack works' });
      analysis.verdict = analysis.verdict === 'broken' ? 'broken' : 'weak';
      analysis.suggestions.push('Ensure p and q are randomly chosen, not close to √n');
    }

    // Check small primes
    const smallPrimes = [2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47];
    const divisibleBy = smallPrimes.find(p => Number(nVal) % p === 0);
    if (divisibleBy) {
      analysis.nAnalysis.push({ type: 'Small Factor', severity: 'critical', desc: `n divisible by ${divisibleBy}` });
      analysis.verdict = 'broken';
      analysis.suggestions.push('n should be product of two large primes only');
    }

    if (keySize < 512) {
      analysis.nAnalysis.push({ type: 'Small Key', severity: 'critical', desc: `${keySize}-bit key is factorable` });
      analysis.verdict = 'broken';
      analysis.suggestions.push('Use at least 2048-bit keys for security');
    } else if (keySize < 1024) {
      analysis.nAnalysis.push({ type: 'Weak Key', severity: 'high', desc: `${keySize}-bit key is deprecated` });
      analysis.verdict = analysis.verdict === 'broken' ? 'broken' : 'weak';
      analysis.suggestions.push('Upgrade to 2048-bit or larger keys');
    } else if (keySize < 2048) {
      analysis.nAnalysis.push({ type: 'Moderate Key', severity: 'medium', desc: `${keySize}-bit key is acceptable but not recommended` });
      analysis.suggestions.push('Consider upgrading to 2048-bit or 4096-bit keys');
    } else {
      analysis.nAnalysis.push({ type: 'Good Key Size', severity: 'good', desc: `${keySize}-bit key is secure` });
    }

    setResult(analysis);
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-3 gap-3">
        <div>
          <label className="text-xs text-muted-foreground">n (modulus, hex or decimal)</label>
          <Input
            placeholder="Enter n..."
            value={n}
            onChange={(e) => setN(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">e (public exponent)</label>
          <Input
            placeholder="65537"
            value={e}
            onChange={(e) => setE(e.target.value)}
            className="font-mono"
          />
        </div>
        <div>
          <label className="text-xs text-muted-foreground">Ciphertext (optional, hex)</label>
          <Input
            placeholder="Optional..."
            value={ciphertext}
            onChange={(e) => setCiphertext(e.target.value)}
            className="font-mono"
          />
        </div>
      </div>
      <Button onClick={analyze} className="w-full">
        <Bomb className="w-4 h-4 mr-2" /> Analyze RSA Security
      </Button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid sm:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Key Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-primary">{result.keySize}</div>
                <div className="text-[10px] text-muted-foreground">bits</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Overall Verdict</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-2xl font-mono font-bold ${
                  result.verdict === 'broken' ? 'text-destructive' :
                  result.verdict === 'weak' ? 'text-yellow-400' :
                  result.verdict === 'acceptable' ? 'text-chart-2' : 'text-green-400'
                }`}>{result.verdict.toUpperCase()}</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                Public Exponent (e) Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.eAnalysis.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${
                    item.severity === 'critical' ? 'bg-destructive/10' :
                    item.severity === 'high' ? 'bg-orange-500/10' :
                    item.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      {item.severity === 'good' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <div>
                        <div className="text-xs font-mono font-bold">{item.type}</div>
                        <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${
                      item.severity === 'critical' ? 'border-destructive text-destructive' :
                      item.severity === 'high' ? 'border-orange-500 text-orange-500' :
                      item.severity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-green-500 text-green-500'
                    }`}>{item.severity.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                Modulus (n) Analysis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {result.nAnalysis.map((item, i) => (
                  <div key={i} className={`flex items-center justify-between p-2 rounded-lg ${
                    item.severity === 'critical' ? 'bg-destructive/10' :
                    item.severity === 'high' ? 'bg-orange-500/10' :
                    item.severity === 'medium' ? 'bg-yellow-500/10' : 'bg-green-500/10'
                  }`}>
                    <div className="flex items-center gap-2">
                      {item.severity === 'good' ? <CheckCircle className="w-4 h-4 text-green-400" /> : <AlertTriangle className="w-4 h-4 text-destructive" />}
                      <div>
                        <div className="text-xs font-mono font-bold">{item.type}</div>
                        <div className="text-[10px] text-muted-foreground">{item.desc}</div>
                      </div>
                    </div>
                    <Badge variant="outline" className={`text-[10px] ${
                      item.severity === 'critical' ? 'border-destructive text-destructive' :
                      item.severity === 'high' ? 'border-orange-500 text-orange-500' :
                      item.severity === 'medium' ? 'border-yellow-500 text-yellow-500' :
                      'border-green-500 text-green-500'
                    }`}>{item.severity.toUpperCase()}</Badge>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {result.suggestions.length > 0 && (
            <Card className="border-chart-4/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Bomb className="w-4 h-4 text-chart-4" /> Attack Suggestions
                </CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2 text-xs">
                  {result.suggestions.map((s, i) => (
                    <li key={i} className="flex items-start gap-2">
                      <span className="text-chart-4">•</span>
                      <span>{s}</span>
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}