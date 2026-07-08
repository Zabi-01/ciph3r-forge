import { useState } from 'react';
import { Textarea } from '@/components/ui/textarea';
import { Button } from '@/components/ui/button';
import { Fingerprint, Loader2, Search, Key, Zap } from 'lucide-react';
import { sha1, sha256, sha512, md5, detectHashType } from '@/lib/ciphers/hashing';
import OutputDisplay from '@/components/crypto/OutputDisplay';
import { Input } from '@/components/ui/input';
import { motion } from 'framer-motion';
import { base44 } from '@/api/base44Client';

const hashAlgos = [
  { key: 'md5', name: 'MD5', bits: 128, fn: md5, secure: false },
  { key: 'sha1', name: 'SHA-1', bits: 160, fn: sha1, secure: false },
  { key: 'sha256', name: 'SHA-256', bits: 256, fn: sha256, secure: true },
  { key: 'sha512', name: 'SHA-512', bits: 512, fn: sha512, secure: true },
];

export default function Hashing() {
  const [input, setInput] = useState('');
  const [hashes, setHashes] = useState({});
  const [loading, setLoading] = useState(false);
  const [identifyInput, setIdentifyInput] = useState('');
  const [identified, setIdentified] = useState(null);
  const [crackInput, setCrackInput] = useState('');
  const [crackResult, setCrackResult] = useState(null);
  const [crackMode, setCrackMode] = useState('auto');
  const [crackLoading, setCrackLoading] = useState(false);

  const computeAll = async () => {
    if (!input) return;
    setLoading(true);
    const results = {};
    for (const algo of hashAlgos) {
      results[algo.key] = await algo.fn(input);
    }
    setHashes(results);
    setLoading(false);
  };

  const identifyHash = async () => {
    if (!identifyInput) return;
    setLoading(true);
    try {
      // First try local detection
      const localResult = detectHashType(identifyInput);
      
      // Also try hashes.com API for more accurate identification
      const apiResult = await base44.functions.invoke('identifyHash', { hash: identifyInput });
      
      setIdentified({
        local: localResult,
        api: apiResult.identified ? [apiResult.hashType] : [],
        details: apiResult.details
      });
    } catch (error) {
      setIdentified({ error: error.message });
    }
    setLoading(false);
  };

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-chart-3">Hash</span> Functions
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">MD5, SHA-1, SHA-256, SHA-512 generation, identification & cracking</p>
      </div>

      {/* Hash Generator */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-4">
        <h2 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
          <Fingerprint className="w-4 h-4 text-chart-3" />
          Hash Generator
        </h2>
        <Textarea
          placeholder="Enter text to hash..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono text-sm min-h-[80px] bg-background/50 border-border/50 resize-none mb-3"
        />
        <div className="flex justify-center">
          <Button onClick={computeAll} disabled={!input || loading} className="font-mono text-xs gap-1.5">
            {loading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Fingerprint className="w-3.5 h-3.5" />}
            Compute All Hashes
          </Button>
        </div>
      </div>

      {Object.keys(hashes).length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          {hashAlgos.map(algo => (
            <div key={algo.key} className="rounded-xl border border-border/50 bg-card/30 p-4">
              <div className="flex items-center gap-2 mb-2">
                <span className="font-mono font-bold text-xs text-chart-3">{algo.name}</span>
                <span className="text-[10px] font-mono text-muted-foreground">({algo.bits}-bit)</span>
                <span className={`text-[10px] font-mono px-1.5 py-0.5 rounded-full ${algo.secure ? 'bg-green-400/10 text-green-400' : 'bg-red-400/10 text-red-400'}`}>
                  {algo.secure ? 'Secure' : 'Legacy'}
                </span>
              </div>
              <OutputDisplay label="" value={hashes[algo.key] || ''} />
            </div>
          ))}
        </motion.div>
      )}

      {/* Hash Identifier */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-4">
        <h2 className="font-mono font-bold text-sm mb-3">Hash Identifier</h2>
        <div className="flex gap-2">
          <Input
            placeholder="Paste a hash to identify..."
            value={identifyInput}
            onChange={(e) => setIdentifyInput(e.target.value)}
            className="font-mono text-sm bg-background/50 border-border/50"
          />
          <Button onClick={identifyHash} className="font-mono text-xs shrink-0">
            Identify
          </Button>
        </div>
        {identified && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-3 space-y-2">
            {identified.error ? (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <span className="text-xs font-mono text-destructive">Error: {identified.error}</span>
              </div>
            ) : (
              <>
                {identified.api && identified.api.length > 0 && (
                  <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                    <div className="flex items-center gap-2 mb-1">
                      <Search className="w-3 h-3 text-primary" />
                      <span className="text-xs font-mono text-primary font-bold">hashes.com API Result</span>
                    </div>
                    <div className="text-sm font-mono text-primary">{identified.api.join(', ')}</div>
                    {identified.details && (
                      <div className="text-xs font-mono text-muted-foreground mt-1">{identified.details}</div>
                    )}
                  </div>
                )}
                {identified.local && identified.local.length > 0 && (
                  <div className="p-3 rounded-lg bg-secondary/30 border border-border/50">
                    <span className="text-xs font-mono text-muted-foreground">Local detection: </span>
                    <span className="font-mono text-sm text-foreground">{identified.local.join(', ')}</span>
                  </div>
                )}
                {(!identified.api || identified.api.length === 0) && (!identified.local || identified.local.length === 0) && (
                  <div className="p-3 rounded-lg bg-secondary/30">
                    <span className="text-xs font-mono text-muted-foreground">Unknown hash format</span>
                  </div>
                )}
              </>
            )}
          </motion.div>
        )}
      </div>

      {/* Hash Cracker */}
      <div className="rounded-xl border border-border/50 bg-card/30 p-4">
        <h2 className="font-mono font-bold text-sm mb-3 flex items-center gap-2">
          <Key className="w-4 h-4 text-destructive" />
          Hash Cracker (Hashcat Techniques)
        </h2>
        <div className="space-y-3">
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">Hash to crack</label>
            <Input
              placeholder="Paste hash here..."
              value={crackInput}
              onChange={(e) => setCrackInput(e.target.value)}
              className="font-mono text-sm bg-background/50 border-border/50"
            />
          </div>
          
          <div>
            <label className="text-xs font-mono text-muted-foreground mb-1 block">Attack mode</label>
            <div className="grid grid-cols-2 lg:grid-cols-5 gap-2">
              {[
                { value: 'auto', label: 'Auto', icon: Zap },
                { value: 'dictionary', label: 'Dictionary', icon: Search },
                { value: 'brute_force', label: 'Brute Force', icon: Key },
                { value: 'rule_based', label: 'Rule-Based', icon: Zap },
                { value: 'hybrid', label: 'Hybrid', icon: Zap },
              ].map(m => (
                <Button
                  key={m.value}
                  variant={crackMode === m.value ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setCrackMode(m.value)}
                  className="text-xs font-mono h-8"
                >
                  <m.icon className="w-3 h-3 mr-1" />
                  {m.label}
                </Button>
              ))}
            </div>
          </div>
          
          <Button 
            onClick={async () => {
              if (!crackInput) return;
              setCrackLoading(true);
              try {
                const result = await base44.functions.invoke('crackHash', { 
                  hash: crackInput, 
                  mode: crackMode === 'auto' ? undefined : crackMode 
                });
                setCrackResult(result);
              } catch (error) {
                setCrackResult({ error: error.message });
              }
              setCrackLoading(false);
            }} 
            disabled={!crackInput || crackLoading} 
            className="font-mono text-xs gap-1.5 w-full"
          >
            {crackLoading ? <Loader2 className="w-3.5 h-3.5 animate-spin" /> : <Key className="w-3.5 h-3.5" />}
            {crackLoading ? 'Cracking...' : 'Crack Hash'}
          </Button>
        </div>
        
        {crackResult && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="mt-4 space-y-2">
            <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
              <div className="flex items-start gap-2">
                <Zap className="w-3 h-3 text-primary mt-0.5" />
                <div className="space-y-1">
                  <div className="text-xs font-mono font-bold text-primary">Advanced Cracking Engine</div>
                  <div className="text-xs font-mono text-primary-foreground">
                    Hashcat/John the Ripper integration coming soon. Currently using online rainbow tables + custom attacks (dictionary, brute-force, rule-based).
                  </div>
                </div>
              </div>
            </div>
            {crackResult.error ? (
              <div className="p-3 rounded-lg bg-destructive/10 border border-destructive/30">
                <span className="text-xs font-mono text-destructive">Error: {crackResult.error}</span>
              </div>
            ) : crackResult.cracked ? (
              <div className="p-4 rounded-lg bg-primary/10 border border-primary/30">
                <div className="flex items-center gap-2 mb-2">
                  <Zap className="w-4 h-4 text-primary" />
                  <span className="text-sm font-mono font-bold text-primary">Successfully Cracked!</span>
                </div>
                <div className="space-y-2 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground">Plaintext: </span>
                    <span className="text-primary text-sm">{crackResult.plaintext}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Hash Type: </span>
                    <span className="text-foreground">{crackResult.hashType}</span>
                  </div>
                  <div>
                    <span className="text-muted-foreground">Method: </span>
                    <span className="text-foreground">{crackResult.method}</span>
                  </div>
                  {crackResult.attempts && (
                    <div>
                      <span className="text-muted-foreground">Attempts: </span>
                      <span className="text-foreground">{crackResult.attempts.toLocaleString()}</span>
                    </div>
                  )}
                  {crackResult.timeMs && (
                    <div>
                      <span className="text-muted-foreground">Time: </span>
                      <span className="text-foreground">{crackResult.timeMs}ms</span>
                    </div>
                  )}
                </div>
              </div>
            ) : (
              <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
                <div className="text-xs font-mono text-muted-foreground mb-2">Hash not cracked</div>
                <div className="space-y-1 text-xs font-mono">
                  <div>
                    <span className="text-muted-foreground">Hash Type: </span>
                    <span className="text-foreground">{crackResult.hashType}</span>
                  </div>
                  {crackResult.suggestions && (
                    <div className="mt-2">
                      <span className="text-muted-foreground">Suggestions:</span>
                      <ul className="list-disc list-inside mt-1 space-y-0.5">
                        {crackResult.suggestions.map((s, i) => (
                          <li key={i} className="text-muted-foreground">{s}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              </div>
            )}
          </motion.div>
        )}
      </div>
    </div>
  );
}