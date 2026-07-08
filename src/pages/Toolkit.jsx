import { useState, useCallback } from 'react';
import { cipherRegistry, categories } from '@/lib/ciphers/registry';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { Input } from '@/components/ui/input';
import { Shield, Binary, Fingerprint, ArrowDownUp, Search, Zap } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import CipherParamInput from '@/components/crypto/CipherParamInput';
import OutputDisplay from '@/components/crypto/OutputDisplay';
import { cn } from '@/lib/utils';

const catIcons = { classical: Shield, encoding: Binary, hashing: Fingerprint };

export default function Toolkit() {
  const [input, setInput] = useState('');
  const [output, setOutput] = useState('');
  const [selectedCipher, setSelectedCipher] = useState('rot13');
  const [params, setParams] = useState({});
  const [mode, setMode] = useState('encode');
  const [searchQuery, setSearchQuery] = useState('');
  const [activeCat, setActiveCat] = useState('all');
  const [processing, setProcessing] = useState(false);

  const cipher = cipherRegistry[selectedCipher];

  const handleParamChange = (name, value) => {
    setParams(prev => ({ ...prev, [name]: value }));
  };

  const handleProcess = useCallback(async () => {
    if (!input || !cipher) return;
    setProcessing(true);
    const fn = mode === 'encode' ? cipher.encode : cipher.decode;
    const result = await fn(input, params);
    setOutput(result);
    setProcessing(false);
  }, [input, cipher, mode, params]);

  const filteredCiphers = Object.entries(cipherRegistry).filter(([key, c]) => {
    const matchCat = activeCat === 'all' || c.category === activeCat;
    const matchSearch = !searchQuery || c.name.toLowerCase().includes(searchQuery.toLowerCase());
    return matchCat && matchSearch;
  });

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-primary">Cipher</span> Toolkit
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">30+ ciphers & encodings at your fingertips</p>
      </div>

      <div className="grid lg:grid-cols-[280px,1fr] gap-6">
        {/* Cipher selector */}
        <div className="space-y-3">
          <motion.div 
            initial={{ opacity: 0, x: -20 }}
            animate={{ opacity: 1, x: 0 }}
            className="relative"
          >
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
            <Input
              placeholder="Search ciphers..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-9 h-9 text-xs font-mono bg-secondary/50 border-border/50 focus:border-primary/50 transition-colors"
            />
          </motion.div>
          
          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.1 }}
            className="flex gap-1 flex-wrap"
          >
            <button
              onClick={() => setActiveCat('all')}
              className={cn(
                "px-2.5 py-1 rounded-md text-[10px] font-mono transition-all",
                activeCat === 'all' ? 'bg-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/10' : 'text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary/50'
              )}
            >
              All
            </button>
            {Object.entries(categories).map(([key, cat]) => {
              const Icon = catIcons[key];
              return (
                <motion.button
                  key={key}
                  onClick={() => setActiveCat(key)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className={cn(
                    "px-2.5 py-1 rounded-md text-[10px] font-mono transition-all flex items-center gap-1",
                    activeCat === key ? 'bg-primary/10 text-primary border border-primary/30 shadow-lg shadow-primary/10' : 'text-muted-foreground hover:text-foreground bg-secondary/30 hover:bg-secondary/50'
                  )}
                >
                  <Icon className="w-3 h-3" />
                  {cat.name}
                </motion.button>
              );
            })}
          </motion.div>

          <motion.div 
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2 }}
            className="space-y-1 max-h-[500px] overflow-y-auto pr-1 scrollbar-thin scrollbar-thumb-primary/20 scrollbar-track-transparent"
          >
            {filteredCiphers.map(([key, c]) => (
              <motion.button
                key={key}
                onClick={() => { setSelectedCipher(key); setParams({}); setOutput(''); }}
                whileHover={{ x: 4 }}
                className={cn(
                  "w-full text-left px-3 py-2 rounded-lg transition-all text-xs relative overflow-hidden",
                  selectedCipher === key
                    ? 'bg-primary/10 border border-primary/30 text-primary shadow-lg shadow-primary/5'
                    : 'hover:bg-secondary/50 text-muted-foreground hover:text-foreground'
                )}
              >
                {selectedCipher === key && (
                  <motion.div
                    layoutId="selectedCipher"
                    className="absolute left-0 top-0 bottom-0 w-0.5 bg-primary"
                  />
                )}
                <div className="font-mono font-medium">{c.name}</div>
                <div className="text-[10px] opacity-70 mt-0.5 line-clamp-1">{c.description}</div>
              </motion.button>
            ))}
          </motion.div>
        </div>

        {/* Main workarea */}
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ delay: 0.3 }}
          className="space-y-4"
        >
          {/* Cipher info */}
          <div className="rounded-xl border border-border/50 bg-card/30 p-4 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-32 h-32 bg-primary/5 rounded-full blur-2xl" />
            <div className="flex items-center justify-between mb-3 relative z-10">
              <motion.div
                initial={{ opacity: 0, x: -10 }}
                animate={{ opacity: 1, x: 0 }}
                key={selectedCipher}
              >
                <h2 className="font-mono font-bold text-primary text-lg">{cipher?.name}</h2>
                <p className="text-xs text-muted-foreground mt-0.5">{cipher?.description}</p>
              </motion.div>
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                key={cipher?.category}
              >
                <Badge variant="outline" className="text-[10px] font-mono border-primary/30 text-primary bg-primary/5">
                  {cipher?.category}
                </Badge>
              </motion.div>
            </div>

            {/* Mode toggle */}
            <div className="flex gap-2 mb-4">
              <Button
                variant={mode === 'encode' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('encode')}
                className="text-xs font-mono h-8"
              >
                Encode
              </Button>
              <Button
                variant={mode === 'decode' ? 'default' : 'outline'}
                size="sm"
                onClick={() => setMode('decode')}
                className="text-xs font-mono h-8"
                disabled={!cipher?.reversible && mode !== 'encode'}
              >
                Decode
              </Button>
              {cipher?.bruteForce && (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={async () => {
                    if (!input) return;
                    const results = cipher.bruteForce(input);
                    setOutput(results.map(r => `[Shift ${r.shift}] ${r.result}`).join('\n'));
                  }}
                  className="text-xs font-mono h-8 border-chart-4/30 text-chart-4 hover:bg-chart-4/10"
                >
                  <Zap className="w-3 h-3 mr-1" />
                  Brute Force
                </Button>
              )}
            </div>

            {/* Params */}
            {cipher?.params?.length > 0 && (
              <div className="grid grid-cols-2 gap-3 mb-4">
                {cipher.params.map(p => (
                  <CipherParamInput
                    key={p.name}
                    param={p}
                    value={params[p.name]}
                    onChange={handleParamChange}
                  />
                ))}
              </div>
            )}

            {/* Input */}
            <div className="space-y-2">
              <label className="text-xs font-mono text-muted-foreground uppercase tracking-wider">Input</label>
              <Textarea
                placeholder="Enter text to process..."
                value={input}
                onChange={(e) => setInput(e.target.value)}
                className="font-mono text-sm min-h-[100px] bg-background/50 border-border/50 resize-none focus:border-primary/50"
              />
            </div>

            {/* Process button */}
            <div className="flex justify-center my-4">
              <Button
                onClick={handleProcess}
                disabled={!input || processing}
                className="font-mono text-xs gap-2"
              >
                <ArrowDownUp className="w-3.5 h-3.5" />
                {processing ? 'Processing...' : `${mode === 'encode' ? 'Encode' : 'Decode'}`}
              </Button>
            </div>

            {/* Output */}
            <OutputDisplay label="Output" value={output} />
          </div>
        </motion.div>
      </div>
    </div>
  );
}