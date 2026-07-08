import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Scan, BarChart3, Zap, Hash, Brain } from 'lucide-react';
import { motion } from 'framer-motion';
import {
  frequencyAnalysis, englishFreq, calculateEntropy,
  indexOfCoincidence, kasiskiExamination, ngramAnalysis,
  detectType, detectBlockRepetition
} from '@/lib/ciphers/analysis';
import { detectHashType } from '@/lib/ciphers/hashing';

export default function Analysis() {
  const [input, setInput] = useState('');
  const [freqData, setFreqData] = useState(null);
  const [entropy, setEntropy] = useState(null);
  const [ioc, setIoc] = useState(null);
  const [kasiski, setKasiski] = useState(null);
  const [ngrams, setNgrams] = useState(null);
  const [detection, setDetection] = useState(null);
  const [hashType, setHashType] = useState(null);
  const [blockAnalysis, setBlockAnalysis] = useState(null);

  const runAnalysis = () => {
    if (!input) return;
    setFreqData(frequencyAnalysis(input));
    setEntropy(calculateEntropy(input));
    setIoc(indexOfCoincidence(input));
    setKasiski(kasiskiExamination(input));
    setNgrams(ngramAnalysis(input, 2));
    setDetection(detectType(input));
    setHashType(detectHashType(input));
    setBlockAnalysis(detectBlockRepetition(input));
  };

  const getEntropyLevel = (e) => {
    if (e < 2) return { label: 'Very Low', color: 'text-green-400' };
    if (e < 3.5) return { label: 'Low', color: 'text-chart-4' };
    if (e < 4.5) return { label: 'Medium', color: 'text-yellow-400' };
    if (e < 5.5) return { label: 'High', color: 'text-orange-400' };
    return { label: 'Very High', color: 'text-red-400' };
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-chart-4">Crypto</span> Analysis
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">Frequency analysis, entropy scoring, cipher detection</p>
      </div>

      {/* Input */}
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="rounded-xl border border-border/50 bg-card/30 p-4 relative overflow-hidden"
      >
        <div className="absolute top-0 right-0 w-48 h-48 bg-chart-4/5 rounded-full blur-3xl" />
        <Textarea
          placeholder="Paste ciphertext or encoded data to analyze..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono text-sm min-h-[100px] bg-background/50 border-border/50 resize-none focus:border-chart-4/50 transition-colors relative z-10"
        />
        <motion.div 
          className="flex justify-center mt-3 relative z-10"
          whileHover={{ scale: 1.02 }}
          whileTap={{ scale: 0.98 }}
        >
          <Button 
            onClick={runAnalysis} 
            disabled={!input} 
            className="font-mono text-xs gap-1.5 bg-chart-4 hover:bg-chart-4/90 text-primary-foreground"
          >
            <Scan className="w-3.5 h-3.5" /> Run Full Analysis
          </Button>
        </motion.div>
      </motion.div>

      {detection && detection.length > 0 && (
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 10 }} 
          animate={{ opacity: 1, scale: 1, y: 0 }} 
          className="rounded-xl border border-accent/30 bg-card/30 p-4 glow-cyan relative overflow-hidden"
        >
          <div className="absolute inset-0 bg-gradient-to-r from-accent/5 via-transparent to-accent/5" />
          <motion.div 
            className="absolute -top-20 -right-20 w-40 h-40 bg-accent/10 rounded-full blur-3xl"
            animate={{ scale: [1, 1.2, 1] }}
            transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
          />
          <div className="flex items-center gap-2 mb-3 relative z-10">
            <motion.div
              animate={{ rotate: [0, 10, -10, 0] }}
              transition={{ duration: 2, repeat: Infinity, repeatDelay: 3 }}
            >
              <Brain className="w-4 h-4 text-accent" />
            </motion.div>
            <h3 className="font-mono font-bold text-sm text-accent">Cipher Detection</h3>
          </div>
          <div className="space-y-2 relative z-10">
            {detection.map((d, i) => (
              <motion.div 
                key={i} 
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.1 }}
                className="flex items-center justify-between p-2 rounded-lg bg-secondary/30 hover:bg-secondary/50 transition-colors"
              >
                <span className="font-mono text-xs">{d.type}</span>
                <div className="flex items-center gap-2">
                  <div className="h-1.5 w-24 bg-secondary rounded-full overflow-hidden">
                    <motion.div 
                      className="h-full bg-accent rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${d.confidence}%` }}
                      transition={{ duration: 0.5, delay: i * 0.1 }}
                    />
                  </div>
                  <span className="text-[10px] font-mono text-accent">{d.confidence}%</span>
                </div>
              </motion.div>
            ))}
          </div>
          {hashType && hashType.length > 0 && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="mt-2 p-2 rounded-lg bg-secondary/30 border border-chart-4/30"
            >
              <span className="text-[10px] font-mono text-muted-foreground">Hash type detected: </span>
              <span className="font-mono text-xs text-chart-4">{hashType.join(', ')}</span>
            </motion.div>
          )}
        </motion.div>
      )}

      {entropy !== null && (
        <div className="grid sm:grid-cols-3 gap-4">
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-card/30 p-4 text-center">
            <Hash className="w-5 h-5 text-primary mx-auto mb-2" />
            <div className={`text-2xl font-bold font-mono ${getEntropyLevel(entropy).color}`}>
              {entropy.toFixed(3)}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-1">
              Entropy ({getEntropyLevel(entropy).label})
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.05 }} className="rounded-xl border border-border/50 bg-card/30 p-4 text-center">
            <BarChart3 className="w-5 h-5 text-accent mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono text-accent">
              {ioc?.toFixed(4) || '—'}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-1">
              Index of Coincidence
            </div>
          </motion.div>
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.1 }} className="rounded-xl border border-border/50 bg-card/30 p-4 text-center">
            <Zap className="w-5 h-5 text-chart-4 mx-auto mb-2" />
            <div className="text-2xl font-bold font-mono text-chart-4">
              {freqData?.totalLetters || 0}
            </div>
            <div className="text-[10px] font-mono text-muted-foreground mt-1">Total Letters</div>
          </motion.div>
        </div>
      )}

      {freqData && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-card/30 p-4">
          <h3 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
            <BarChart3 className="w-4 h-4 text-primary" />
            Letter Frequency
          </h3>
          <div className="grid grid-cols-13 gap-1">
            {'ABCDEFGHIJKLMNOPQRSTUVWXYZ'.split('').map(letter => {
              const freq = freqData.frequencies[letter];
              const pct = freq ? parseFloat(freq.percentage) : 0;
              const expectedPct = englishFreq[letter] || 0;
              const maxPct = Math.max(pct, expectedPct, 1);
              return (
                <div key={letter} className="text-center">
                  <div className="h-24 flex flex-col justify-end gap-0.5 mb-1">
                    <div
                      className="bg-primary/30 rounded-t w-full transition-all"
                      style={{ height: `${(expectedPct / 15) * 100}%` }}
                      title={`Expected: ${expectedPct}%`}
                    />
                    <div
                      className="bg-primary rounded-t w-full transition-all"
                      style={{ height: `${(pct / 15) * 100}%` }}
                      title={`Actual: ${pct}%`}
                    />
                  </div>
                  <div className="text-[9px] font-mono text-muted-foreground">{letter}</div>
                  <div className="text-[8px] font-mono text-primary">{pct > 0 ? `${pct}%` : ''}</div>
                </div>
              );
            })}
          </div>
          <div className="flex gap-4 mt-3 text-[10px] font-mono text-muted-foreground">
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-primary rounded" /> Actual</span>
            <span className="flex items-center gap-1"><span className="w-3 h-2 bg-primary/30 rounded" /> English Expected</span>
          </div>
        </motion.div>
      )}

      <div className="grid sm:grid-cols-2 gap-4">
        {kasiski && kasiski.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-card/30 p-4">
            <h3 className="font-mono font-bold text-sm mb-3">Kasiski Test — Key Length Guesses</h3>
            <div className="space-y-2">
              {kasiski.map((k, i) => (
                <div key={i} className="flex items-center justify-between p-2 rounded-lg bg-secondary/30">
                  <span className="font-mono text-xs">Length {k.keyLength}</span>
                  <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary">
                    Score: {k.score}
                  </Badge>
                </div>
              ))}
            </div>
          </motion.div>
        )}

        {ngrams && ngrams.length > 0 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-card/30 p-4">
            <h3 className="font-mono font-bold text-sm mb-3">Top Bigrams</h3>
            <div className="grid grid-cols-2 gap-1">
              {ngrams.slice(0, 10).map((g, i) => (
                <div key={i} className="flex items-center justify-between p-1.5 rounded bg-secondary/30 text-xs font-mono">
                  <span className="text-primary">{g.gram}</span>
                  <span className="text-muted-foreground">{g.count}</span>
                </div>
              ))}
            </div>
          </motion.div>
        )}
      </div>

      {blockAnalysis && blockAnalysis.totalBlocks > 1 && (
        <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} className="rounded-xl border border-border/50 bg-card/30 p-4">
          <h3 className="font-mono font-bold text-sm mb-3">Block Repetition (ECB Detection)</h3>
          <div className="grid grid-cols-3 gap-3 text-center">
            <div>
              <div className="text-lg font-mono font-bold">{blockAnalysis.totalBlocks}</div>
              <div className="text-[10px] text-muted-foreground font-mono">Total Blocks</div>
            </div>
            <div>
              <div className="text-lg font-mono font-bold">{blockAnalysis.uniqueBlocks}</div>
              <div className="text-[10px] text-muted-foreground font-mono">Unique Blocks</div>
            </div>
            <div>
              <div className={`text-lg font-mono font-bold ${blockAnalysis.isECB ? 'text-destructive' : 'text-green-400'}`}>
                {blockAnalysis.isECB ? 'ECB Likely' : 'No ECB'}
              </div>
              <div className="text-[10px] text-muted-foreground font-mono">Repetition: {blockAnalysis.repetitionRate}%</div>
            </div>
          </div>
        </motion.div>
      )}
    </div>
  );
}