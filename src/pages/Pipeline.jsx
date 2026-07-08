import { useState, useCallback } from 'react';
import { cipherRegistry } from '@/lib/ciphers/registry';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Plus, Trash2, Play, ArrowDown, Wand2, RotateCcw } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CipherParamInput from '@/components/crypto/CipherParamInput';
import OutputDisplay from '@/components/crypto/OutputDisplay';
import { cn } from '@/lib/utils';

export default function Pipeline() {
  const [input, setInput] = useState('');
  const [steps, setSteps] = useState([{ id: 1, cipher: 'base64', mode: 'encode', params: {} }]);
  const [results, setResults] = useState([]);
  const [processing, setProcessing] = useState(false);
  const [nextId, setNextId] = useState(2);

  const addStep = () => {
    setSteps(prev => [...prev, { id: nextId, cipher: 'rot13', mode: 'encode', params: {} }]);
    setNextId(prev => prev + 1);
  };

  const removeStep = (id) => {
    if (steps.length <= 1) return;
    setSteps(prev => prev.filter(s => s.id !== id));
  };

  const updateStep = (id, field, value) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, [field]: value } : s));
  };

  const updateStepParam = (id, paramName, value) => {
    setSteps(prev => prev.map(s => s.id === id ? { ...s, params: { ...s.params, [paramName]: value } } : s));
  };

  const executePipeline = useCallback(async () => {
    if (!input) return;
    setProcessing(true);
    const stepResults = [];
    let current = input;

    for (const step of steps) {
      const cipher = cipherRegistry[step.cipher];
      if (!cipher) { stepResults.push({ input: current, output: 'Error: cipher not found', error: true }); break; }
      const fn = step.mode === 'encode' ? cipher.encode : cipher.decode;
      const output = await fn(current, step.params);
      stepResults.push({ input: current, output, cipherName: cipher.name, mode: step.mode });
      current = output;
    }

    setResults(stepResults);
    setProcessing(false);
  }, [input, steps]);

  const resetPipeline = () => {
    setSteps([{ id: 1, cipher: 'base64', mode: 'encode', params: {} }]);
    setResults([]);
    setNextId(2);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-accent glow-text-cyan">Pipeline</span> Builder
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">Chain multiple transformations together</p>
      </div>

      {/* Input */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-4">
        <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider mb-2 block">Pipeline Input</label>
        <Textarea
          placeholder="Enter text to process through the pipeline..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono text-sm min-h-[80px] bg-background/50 border-border/50 resize-none"
        />
      </div>

      {/* Steps */}
      <div className="space-y-3">
        <AnimatePresence>
          {steps.map((step, idx) => {
            const cipher = cipherRegistry[step.cipher];
            return (
              <motion.div
                key={step.id}
                initial={{ opacity: 0, x: -20 }}
                animate={{ opacity: 1, x: 0 }}
                exit={{ opacity: 0, x: 20 }}
              >
                {idx > 0 && (
                  <div className="flex justify-center py-1">
                    <ArrowDown className="w-4 h-4 text-primary/50" />
                  </div>
                )}
                <div className="rounded-xl border border-border/50 bg-card/30 p-4">
                  <div className="flex items-center justify-between mb-3">
                    <span className="text-[10px] font-mono text-primary bg-primary/10 px-2 py-0.5 rounded-full">
                      STEP {idx + 1}
                    </span>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => removeStep(step.id)}
                      disabled={steps.length <= 1}
                      className="h-7 w-7 p-0 text-muted-foreground hover:text-destructive"
                    >
                      <Trash2 className="w-3.5 h-3.5" />
                    </Button>
                  </div>
                  <div className="grid grid-cols-2 gap-3">
                    <Select value={step.cipher} onValueChange={(v) => updateStep(step.id, 'cipher', v)}>
                      <SelectTrigger className="h-9 text-xs font-mono bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        {Object.entries(cipherRegistry).map(([key, c]) => (
                          <SelectItem key={key} value={key} className="text-xs font-mono">
                            {c.name}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                    <Select value={step.mode} onValueChange={(v) => updateStep(step.id, 'mode', v)}>
                      <SelectTrigger className="h-9 text-xs font-mono bg-secondary/50 border-border/50">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="encode" className="text-xs font-mono">Encode</SelectItem>
                        <SelectItem value="decode" className="text-xs font-mono">Decode</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  {cipher?.params?.length > 0 && (
                    <div className="grid grid-cols-2 gap-3 mt-3">
                      {cipher.params.map(p => (
                        <CipherParamInput
                          key={p.name}
                          param={p}
                          value={step.params[p.name]}
                          onChange={(name, val) => updateStepParam(step.id, name, val)}
                        />
                      ))}
                    </div>
                  )}
                  {/* Step result */}
                  {results[idx] && (
                    <div className={cn(
                      "mt-3 p-3 rounded-lg text-xs font-mono break-all",
                      results[idx].error ? 'bg-destructive/10 text-destructive' : 'bg-primary/5 text-foreground border border-primary/10'
                    )}>
                      <span className="text-[10px] text-muted-foreground block mb-1">→ {results[idx].cipherName} ({results[idx].mode})</span>
                      {results[idx].output}
                    </div>
                  )}
                </div>
              </motion.div>
            );
          })}
        </AnimatePresence>
      </div>

      {/* Controls */}
      <div className="flex items-center gap-3 justify-center">
        <Button variant="outline" size="sm" onClick={addStep} className="font-mono text-xs gap-1.5">
          <Plus className="w-3.5 h-3.5" /> Add Step
        </Button>
        <Button onClick={executePipeline} disabled={!input || processing} className="font-mono text-xs gap-1.5">
          <Play className="w-3.5 h-3.5" />
          {processing ? 'Running...' : 'Execute Pipeline'}
        </Button>
        <Button variant="outline" size="sm" onClick={resetPipeline} className="font-mono text-xs gap-1.5">
          <RotateCcw className="w-3.5 h-3.5" /> Reset
        </Button>
      </div>

      {/* Final output */}
      {results.length > 0 && (
        <div className="rounded-xl border border-primary/30 bg-card/30 p-4 glow-green">
          <OutputDisplay label="Final Output" value={results[results.length - 1]?.output || ''} />
        </div>
      )}
    </div>
  );
}