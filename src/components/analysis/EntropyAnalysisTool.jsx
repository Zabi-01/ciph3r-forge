import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Activity } from 'lucide-react';
import { motion } from 'framer-motion';
import { calculateEntropy } from '@/lib/ciphers/analysis';

export default function EntropyAnalysisTool() {
  const [input, setInput] = useState('');
  const [result, setResult] = useState(null);

  const analyze = () => {
    if (!input) return;
    const shannon = calculateEntropy(input);
    const freq = {};
    for (const c of input) freq[c] = (freq[c] || 0) + 1;
    const maxFreq = Math.max(...Object.values(freq));
    const minEnt = -Math.log2(maxFreq / input.length);
    const uniqueChars = new Set(input).size;
    const maxPossible = Math.log2(uniqueChars);
    const ratio = shannon / (maxPossible || 1);
    
    let verdict = 'Low';
    if (ratio > 0.9) verdict = 'Random';
    else if (ratio > 0.7) verdict = 'High';
    else if (ratio > 0.5) verdict = 'Medium';

    setResult({ shannon, minEntropy: minEnt, maxPossible, verdict, ratio: (ratio * 100).toFixed(1) });
  };

  return (
    <div className="space-y-4">
      <Textarea
        placeholder="Enter text to analyze entropy..."
        value={input}
        onChange={(e) => setInput(e.target.value)}
        className="font-mono text-sm min-h-[80px]"
      />
      <Button onClick={analyze} className="w-full">
        <Activity className="w-4 h-4 mr-2" /> Analyze Entropy
      </Button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="grid sm:grid-cols-4 gap-3">
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground">Shannon Entropy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-primary">{result.shannon.toFixed(3)}</div>
              <div className="text-[10px] text-muted-foreground">bits/char (0-8)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground">Min Entropy</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-chart-2">{result.minEntropy.toFixed(3)}</div>
              <div className="text-[10px] text-muted-foreground">worst-case</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground">Max Possible</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-mono font-bold text-chart-4">{result.maxPossible.toFixed(3)}</div>
              <div className="text-[10px] text-muted-foreground">log₂(unique)</div>
            </CardContent>
          </Card>
          <Card>
            <CardHeader className="pb-2">
              <CardTitle className="text-xs font-mono text-muted-foreground">Verdict</CardTitle>
            </CardHeader>
            <CardContent>
              <div className={`text-2xl font-mono font-bold ${
                result.verdict === 'Random' ? 'text-green-400' :
                result.verdict === 'High' ? 'text-chart-2' :
                result.verdict === 'Medium' ? 'text-yellow-400' : 'text-destructive'
              }`}>{result.verdict}</div>
              <div className="text-[10px] text-muted-foreground">{result.ratio}% of max</div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}