import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Calculator, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';
import { indexOfCoincidence, kasiskiExamination } from '@/lib/ciphers/analysis';

export default function IOCTool() {
  const [input, setInput] = useState('');
  const [maxKeyLength, setMaxKeyLength] = useState(20);
  const [result, setResult] = useState(null);

  const analyze = () => {
    if (!input) return;
    const ic = indexOfCoincidence(input);
    const kasiski = kasiskiExamination(input);
    
    // IC by key length
    const icByLength = [];
    for (let len = 1; len <= maxKeyLength; len++) {
      const subsets = [];
      for (let i = 0; i < input.length; i += len) {
        subsets.push(input[i]);
      }
      const subsetIc = indexOfCoincidence(subsets.join(''));
      icByLength.push({ length: len, ic: subsetIc });
    }

    // Find likely key length (IC closest to 0.065)
    const likelyKeyLength = icByLength.reduce((prev, curr) => {
      return Math.abs(curr.ic - 0.065) < Math.abs(prev.ic - 0.065) ? curr : prev;
    });

    let verdict = 'Random';
    if (ic > 0.06) verdict = 'Monoalphabetic';
    else if (ic > 0.04) verdict = 'Polyalphabetic';

    setResult({ ic, icByLength, likelyKeyLength, kasiski, verdict });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start">
        <Textarea
          placeholder="Paste ciphertext for Kasiski examination..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono text-sm min-h-[100px] flex-1"
        />
        <div className="space-y-2">
          <div>
            <label className="text-xs text-muted-foreground">Max Key Length</label>
            <Input
              type="number"
              value={maxKeyLength}
              onChange={(e) => setMaxKeyLength(parseInt(e.target.value) || 20)}
              className="w-20"
              min="2"
              max="50"
            />
          </div>
          <Button onClick={analyze} className="w-full">Analyze</Button>
        </div>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Overall IC</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-accent">{result.ic.toFixed(4)}</div>
                <div className="text-[10px] text-muted-foreground">English ≈ 0.065</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Likely Key Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-chart-4">{result.likelyKeyLength.length}</div>
                <div className="text-[10px] text-muted-foreground">IC: {result.likelyKeyLength.ic.toFixed(4)}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Verdict</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-mono font-bold text-primary">{result.verdict}</div>
                <div className="text-[10px] text-muted-foreground">Cipher type</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                <Calculator className="w-4 h-4" /> IC by Key Length
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-5 gap-2">
                {result.icByLength.map(item => (
                  <div key={item.length} className={`p-2 rounded-lg text-center border ${
                    item.length === result.likelyKeyLength.length ? 'border-primary bg-primary/10' : 'border-border'
                  }`}>
                    <div className="text-[10px] text-muted-foreground">Len {item.length}</div>
                    <div className="text-sm font-mono font-bold">{item.ic.toFixed(3)}</div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
          {result.kasiski && result.kasiski.length > 0 && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <AlertTriangle className="w-4 h-4" /> Kasiski Test Results
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-2">
                  {result.kasiski.map(k => (
                    <div key={k.keyLength} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                      <span className="font-mono text-xs">Key Length {k.keyLength}</span>
                      <Badge variant="outline" className="text-[10px] font-mono">Score: {k.score}</Badge>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}