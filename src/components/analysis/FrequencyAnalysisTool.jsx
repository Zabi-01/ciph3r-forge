import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { BarChart3 } from 'lucide-react';
import { motion } from 'framer-motion';
import { frequencyAnalysis, indexOfCoincidence, ngramAnalysis, englishFreq } from '@/lib/ciphers/analysis';

export default function FrequencyAnalysisTool() {
  const [input, setInput] = useState('');
  const [alphabet, setAlphabet] = useState('letters');
  const [result, setResult] = useState(null);

  const analyze = () => {
    if (!input) return;
    const freq = frequencyAnalysis(input);
    const ic = indexOfCoincidence(input);
    const sorted = Object.entries(freq.frequencies)
      .sort((a, b) => b[1].count - a[1].count)
      .map(([char, data]) => ({ char, ...data }));
    
    const deviations = sorted.map(item => {
      const expected = englishFreq[item.char] || 0;
      const actual = parseFloat(item.percentage);
      return Math.abs(actual - expected);
    });
    const avgDeviation = deviations.reduce((a, b) => a + b, 0) / (deviations.length || 1);
    let language = 'Unknown';
    if (avgDeviation < 2) language = 'English (likely)';
    else if (avgDeviation < 4) language = 'English (possible)';
    else language = 'Not English';

    setResult({
      sorted,
      ic,
      language,
      avgDeviation,
      bigrams: ngramAnalysis(input, 2),
      trigrams: ngramAnalysis(input, 3),
      totalLetters: freq.totalLetters
    });
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2">
        <Textarea
          placeholder="Paste ciphertext..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono text-sm min-h-[100px] flex-1"
        />
        <div className="space-y-2">
          <select
            value={alphabet}
            onChange={(e) => setAlphabet(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="letters">Letters only</option>
            <option value="all">All characters</option>
            <option value="hex">Hex only</option>
          </select>
          <Button onClick={analyze} className="w-full">Analyze</Button>
        </div>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Index of Coincidence</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-accent">{result.ic.toFixed(4)}</div>
                <div className="text-[10px] text-muted-foreground">
                  {result.ic > 0.06 ? 'Monoalphabetic' : result.ic > 0.04 ? 'Polyalphabetic' : 'Random'}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Language Match</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-mono font-bold text-chart-4">{result.language}</div>
                <div className="text-[10px] text-muted-foreground">Deviation: {result.avgDeviation.toFixed(2)}%</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Total Letters</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-primary">{result.totalLetters}</div>
                <div className="text-[10px] text-muted-foreground">{result.sorted.length} unique</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">Letter Frequencies</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-13 gap-1">
                {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
                  const item = result.sorted.find(x => x.char === letter);
                  const pct = item ? parseFloat(item.percentage) : 0;
                  const expected = englishFreq[letter] || 0;
                  return (
                    <div key={letter} className="text-center">
                      <div className="h-20 flex flex-col justify-end gap-0.5 mb-1">
                        <div className="bg-primary/30 rounded-t w-full" style={{ height: `${(expected / 15) * 100}%` }} />
                        <div className="bg-primary rounded-t w-full" style={{ height: `${(pct / 15) * 100}%` }} />
                      </div>
                      <div className="text-[9px] font-mono">{letter}</div>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>
          <div className="grid sm:grid-cols-2 gap-4">
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono">Top Bigrams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1">
                  {result.bigrams.slice(0, 8).map(g => (
                    <div key={g.gram} className="flex justify-between text-xs font-mono">
                      <span className="text-primary">{g.gram}</span>
                      <span className="text-muted-foreground">{g.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono">Top Trigrams</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-2 gap-1">
                  {result.trigrams.slice(0, 8).map(g => (
                    <div key={g.gram} className="flex justify-between text-xs font-mono">
                      <span className="text-accent">{g.gram}</span>
                      <span className="text-muted-foreground">{g.count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>
        </motion.div>
      )}
    </div>
  );
}