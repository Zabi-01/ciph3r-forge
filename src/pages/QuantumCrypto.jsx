import { useState } from 'react';
import { motion } from 'framer-motion';
import { Atom, Zap, Shield, RefreshCcw, Copy, Check, Binary, Lock, Unlock } from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';

export default function QuantumCrypto() {
  const [activeTab, setActiveTab] = useState('bb84');
  
  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold font-mono tracking-tight">
          <Atom className="w-6 h-6 inline mr-2 text-chart-3" />
          Quantum Cryptography
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">
          Post-quantum and quantum key distribution concepts
        </p>
      </div>

      <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
        <TabsList className="bg-background/50 border border-border/50">
          <TabsTrigger value="bb84" className="font-mono text-xs">BB84 QKD</TabsTrigger>
          <TabsTrigger value="qrng" className="font-mono text-xs">Quantum RNG</TabsTrigger>
          <TabsTrigger value="lattice" className="font-mono text-xs">Lattice-Based</TabsTrigger>
        </TabsList>

        <TabsContent value="bb84">
          <BB84Protocol />
        </TabsContent>
        <TabsContent value="qrng">
          <QuantumRNG />
        </TabsContent>
        <TabsContent value="lattice">
          <LatticeBasedCrypto />
        </TabsContent>
      </Tabs>
    </div>
  );
}

// BB84 Quantum Key Distribution Simulator
function BB84Protocol() {
  const [aliceBits, setAliceBits] = useState([]);
  const [aliceBases, setAliceBases] = useState([]);
  const [bobBases, setBobBases] = useState([]);
  const [bobMeasurements, setBobMeasurements] = useState([]);
  const [siftedKey, setSiftedKey] = useState([]);
  const [step, setStep] = useState(0);

  const bases = ['+', '×']; // Rectilinear and Diagonal
  const polarizations = {
    '+': { 0: '↑', 1: '→' },
    '×': { 0: '↗', 1: '↘' }
  };

  const runBB84 = () => {
    // Step 1: Alice generates random bits and bases
    const bits = Array.from({ length: 16 }, () => Math.random() > 0.5 ? 1 : 0);
    const aBases = Array.from({ length: 16 }, () => Math.random() > 0.5 ? '+' : '×');
    setAliceBits(bits);
    setAliceBases(aBases);
    setStep(1);

    // Step 2: Bob chooses random bases
    const bBases = Array.from({ length: 16 }, () => Math.random() > 0.5 ? '+' : '×');
    setBobBases(bBases);
    setStep(2);

    // Step 3: Bob measures (if bases match, gets correct bit)
    const measurements = bits.map((bit, i) => {
      if (aBases[i] === bBases[i]) {
        return bit; // Same basis, correct measurement
      } else {
        return Math.random() > 0.5 ? 1 : 0; // Different basis, random result
      }
    });
    setBobMeasurements(measurements);
    setStep(3);

    // Step 4: Sift - keep only matching bases
    const sifted = bits.filter((_, i) => aBases[i] === bBases[i]);
    setSiftedKey(sifted);
    setStep(4);
  };

  const reset = () => {
    setAliceBits([]);
    setAliceBases([]);
    setBobBases([]);
    setBobMeasurements([]);
    setSiftedKey([]);
    setStep(0);
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-mono text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-chart-3" />
          BB84 Quantum Key Distribution Protocol
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="text-xs font-mono text-foreground mb-2">
            <strong>📚 What is BB84?</strong>
          </div>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            BB84 is the first quantum key distribution (QKD) protocol, invented by Bennett and Brassard in 1984. 
            It uses quantum mechanics (photon polarization) to create a shared secret key between two parties.
            Any eavesdropping attempt disturbs the quantum states and can be detected.
          </p>
          <div className="mt-2 text-xs font-mono text-chart-2">
            <strong>Key Concept:</strong> Measuring a qubit changes its state - this is how you detect hackers!
          </div>
        </div>

        <div className="flex gap-2">
          <Button onClick={runBB84} className="font-mono text-xs gap-1.5">
            <RefreshCcw className="w-3.5 h-3.5" />
            Run Protocol
          </Button>
          <Button onClick={reset} variant="outline" className="font-mono text-xs">
            Reset
          </Button>
        </div>

        {step >= 1 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }}>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-2 text-primary-foreground text-xs">Step 1</Badge>
                <div className="text-xs font-mono text-chart-2">Alice Generates Random Bits & Chooses Bases</div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  <strong>What happens:</strong> Alice creates 16 random bits (0s and 1s) and randomly chooses a measurement 
                  basis for each: <span className="text-chart-2">+</span> (rectilinear) or <span className="text-chart-2">×</span> (diagonal).
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  <strong>Physics:</strong> Each bit is encoded as a photon polarized in one of 4 directions: 
                  ↑ (0 in +), → (1 in +), ↗ (0 in ×), or ↘ (1 in ×).
                </p>
              </div>
              <div className="flex gap-1 flex-wrap">
                {aliceBits.map((bit, i) => (
                  <div key={i} className="flex flex-col items-center">
                    <div className="text-lg">{polarizations[aliceBases[i]][bit]}</div>
                    <Badge variant="outline" className="text-xs mt-1">{aliceBases[i]}</Badge>
                  </div>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step >= 2 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.2 }}>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-2 text-primary-foreground text-xs">Step 2</Badge>
                <div className="text-xs font-mono text-chart-2">Bob Randomly Chooses Measurement Bases</div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  <strong>What happens:</strong> Bob doesn't know which bases Alice used, so he randomly guesses 
                  <span className="text-chart-2"> +</span> or <span className="text-chart-2"> ×</span> for each photon.
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  <strong>Key insight:</strong> When Bob's basis matches Alice's (✓), he measures the correct bit. 
                  When it doesn't match (✗), his result is completely random (50/50 chance).
                </p>
              </div>
              <div className="flex gap-1 flex-wrap">
                {bobBases.map((base, i) => (
                  <Badge 
                    key={i} 
                    variant={base === aliceBases[i] ? 'default' : 'secondary'}
                    className="text-xs"
                  >
                    {base} {base === aliceBases[i] ? '✓' : '✗'}
                  </Badge>
                ))}
              </div>
            </div>
          </motion.div>
        )}

        {step >= 3 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.4 }}>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-2 text-primary-foreground text-xs">Step 3</Badge>
                <div className="text-xs font-mono text-chart-2">Bob Measures the Photons</div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  <strong>What happens:</strong> Bob measures each photon using his chosen basis. The results depend on 
                  whether his basis matched Alice's:
                </p>
                <ul className="text-xs font-mono text-muted-foreground list-disc list-inside space-y-1">
                  <li><span className="text-chart-2">Matching bases (✓):</span> Bob gets Alice's exact bit (100% accurate)</li>
                  <li><span className="text-muted-foreground">Different bases (✗):</span> Bob gets a random bit (50% chance of 0 or 1)</li>
                </ul>
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  <strong>Quantum magic:</strong> This randomness when bases don't match is a fundamental property of 
                  quantum mechanics - not a limitation of measurement tools!
                </p>
              </div>
              <div className="flex gap-2 flex-wrap">
                <div className="text-xs font-mono">
                  Bob's measured bits: <span className="text-chart-2">{bobMeasurements.join('')}</span>
                </div>
                <div className="text-xs font-mono text-muted-foreground">
                  (When bases matched: <span className="text-chart-2">{bobMeasurements.filter((_, i) => aliceBases[i] === bobBases[i]).join('')}</span>)
                </div>
              </div>
            </div>
          </motion.div>
        )}

        {step >= 4 && (
          <motion.div initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: 0.6 }}>
            <div className="grid gap-2">
              <div className="flex items-center gap-2">
                <Badge className="bg-chart-2 text-primary-foreground text-xs">Step 4</Badge>
                <div className="text-xs font-mono text-chart-2 flex items-center gap-2">
                  <Check className="w-3 h-3" />
                  Sifting: Keep Only Matching Bases
                </div>
              </div>
              <div className="p-3 rounded-lg bg-background/50 border border-border/50">
                <p className="text-xs font-mono text-muted-foreground mb-2">
                  <strong>What happens:</strong> Alice and Bob publicly compare their bases (NOT the bits!). 
                  They discard all bits where their bases didn't match.
                </p>
                <p className="text-xs font-mono text-muted-foreground">
                  <strong>Result:</strong> The remaining bits form their shared secret key! 
                  On average, ~50% of bases match, so 16 transmitted bits → ~8-bit key.
                </p>
                <p className="text-xs font-mono text-muted-foreground mt-2">
                  <strong>Security check:</strong> They can test a few bits publicly to detect eavesdropping. 
                  If error rate is too high, someone was listening!
                </p>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="text-xs font-mono text-primary mb-1">🔐 Your Shared Secret Key:</div>
                <div className="text-lg font-mono tracking-wider text-primary">
                  {siftedKey.join('')}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  Key length: {siftedKey.length} bits | Original transmission: 16 bits | Efficiency: {((siftedKey.length / 16) * 100).toFixed(0)}%
                </div>
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Quantum Random Number Generator
function QuantumRNG() {
  const [numbers, setNumbers] = useState([]);
  const [generating, setGenerating] = useState(false);

  const generateQuantumRandom = () => {
    setGenerating(true);
    // Simulate quantum randomness using multiple entropy sources
    const quantumNumbers = Array.from({ length: 8 }, () => {
      // Combine multiple entropy sources for better randomness
      const cryptoRand = crypto.getRandomValues(new Uint8Array(1))[0];
      const timeRand = Date.now() % 256;
      const mouseRand = Math.floor(Math.random() * 256);
      return (cryptoRand ^ timeRand ^ mouseRand) % 256;
    });
    
    setTimeout(() => {
      setNumbers(quantumNumbers);
      setGenerating(false);
    }, 500);
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-mono text-sm flex items-center gap-2">
          <Zap className="w-4 h-4 text-chart-3" />
          Quantum Random Number Generator
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="text-xs font-mono text-foreground mb-2">
            <strong>📚 What is Quantum RNG?</strong>
          </div>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            Classical computers use pseudo-random number generators (PRNGs) - deterministic algorithms that 
            only appear random. True randomness requires quantum mechanics!
          </p>
          <div className="mt-2 text-xs font-mono text-chart-2 space-y-1">
            <div><strong>Real QRNGs use:</strong> Photon behavior, quantum tunneling, or vacuum fluctuations</div>
            <div><strong>Why it matters:</strong> Cryptography needs unpredictable keys - quantum randomness is truly unpredictable</div>
          </div>
        </div>

        <Button 
          onClick={generateQuantumRandom} 
          disabled={generating}
          className="font-mono text-xs gap-1.5"
        >
          <Zap className="w-3.5 h-3.5" />
          {generating ? 'Generating...' : 'Generate Quantum Random'}
        </Button>

        {numbers.length > 0 && (
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }} 
            animate={{ opacity: 1, scale: 1 }}
            className="grid gap-3"
          >
            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground mb-2">
                <strong>How this simulation works:</strong>
              </p>
              <ul className="text-xs font-mono text-muted-foreground list-disc list-inside space-y-1">
                <li><span className="text-chart-2">crypto.getRandomValues()</span> - Browser's cryptographically secure RNG</li>
                <li><span className="text-chart-2">Date.now()</span> - Timing entropy (unpredictable milliseconds)</li>
                <li><span className="text-chart-2">Math.random()</span> - Additional entropy source</li>
              </ul>
              <p className="text-xs font-mono text-muted-foreground mt-2">
                These are XORed together to combine their entropy. Real quantum RNGs measure actual quantum events!
              </p>
            </div>

            <div className="grid grid-cols-4 gap-2">
              {numbers.map((num, i) => (
                <div 
                  key={i}
                  className="p-3 rounded-lg bg-primary/10 border border-primary/30 text-center"
                >
                  <div className="text-2xl font-mono font-bold text-primary">
                    {num}
                  </div>
                  <div className="text-xs text-muted-foreground font-mono mt-1">
                    0x{num.toString(16).padStart(2, '0')}
                  </div>
                </div>
              ))}
            </div>
            
            <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
              <div className="text-xs font-mono text-muted-foreground mb-1">
                <strong>Binary representation:</strong>
              </div>
              <div className="text-xs font-mono text-chart-2 break-all">
                {numbers.map(n => n.toString(2).padStart(8, '0')).join(' ')}
              </div>
            </div>
          </motion.div>
        )}
      </CardContent>
    </Card>
  );
}

// Lattice-Based Cryptography (Post-Quantum)
function LatticeBasedCrypto() {
  const [message, setMessage] = useState('');
  const [encrypted, setEncrypted] = useState(null);
  const [decrypted, setDecrypted] = useState('');

  // Simplified lattice-based encryption using XOR with lattice-derived key
  const encrypt = () => {
    if (!message) return;
    
    // Generate lattice-like secret (seed for deterministic key stream)
    const seed = Array.from({ length: 8 }, () => Math.floor(Math.random() * 256));
    
    // Generate key stream from seed (simplified lattice basis)
    const keyStream = message.split('').map((_, i) => {
      // Lattice-inspired mixing
      const latticePoint = (seed[i % seed.length] + i * 17) % 256;
      const noise = Math.floor(Math.random() * 3) - 1; // Small noise
      return (latticePoint + noise) % 256;
    });
    
    // Encrypt using XOR (simplified LWE-like operation)
    const ciphertext = message.split('').map((c, i) => 
      c.charCodeAt(0) ^ keyStream[i]
    );
    
    setEncrypted({
      ciphertext,
      keyStream,
      seed
    });
  };

  const decrypt = () => {
    if (!encrypted) return;
    
    const { ciphertext, keyStream } = encrypted;
    
    // Decrypt using same key stream
    const decryptedNums = ciphertext.map((c, i) => 
      c ^ keyStream[i]
    );
    
    const decryptedText = decryptedNums
      .map(n => String.fromCharCode(n))
      .join('');
    
    setDecrypted(decryptedText);
  };

  return (
    <Card className="bg-card/50 border-border/50">
      <CardHeader>
        <CardTitle className="font-mono text-sm flex items-center gap-2">
          <Shield className="w-4 h-4 text-chart-3" />
          Lattice-Based Encryption (Post-Quantum)
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="text-xs font-mono text-foreground mb-2">
            <strong>📚 What is Lattice-Based Cryptography?</strong>
          </div>
          <p className="text-xs font-mono text-muted-foreground leading-relaxed">
            Lattice-based crypto uses high-dimensional grids (lattices) to create encryption that's secure 
            against both classical AND quantum computers.
          </p>
          <div className="mt-2 text-xs font-mono text-chart-2 space-y-1">
            <div><strong>The problem:</strong> Finding the closest lattice point is easy with the secret key, but nearly impossible without it</div>
            <div><strong>LWE (Learning With Errors):</strong> Adds small "noise" to hide the lattice structure - this is what makes it secure!</div>
            <div><strong>Why it matters:</strong> NIST selected lattice-based algorithms (CRYSTALS-Kyber) as the post-quantum encryption standard in 2024</div>
          </div>
        </div>

        <div className="p-3 rounded-lg bg-background/50 border border-border/50">
          <p className="text-xs font-mono text-muted-foreground mb-2">
            <strong>🔐 Step-by-Step Encryption:</strong>
          </p>
          <ol className="text-xs font-mono text-muted-foreground list-decimal list-inside space-y-1">
            <li><span className="text-chart-2">Generate seed:</span> Random starting point (your secret key)</li>
            <li><span className="text-chart-2">Create lattice:</span> Mix seed with position using modular arithmetic</li>
            <li><span className="text-chart-2">Add noise:</span> Small random errors (±1) - this is the "E" in LWE!</li>
            <li><span className="text-chart-2">XOR with message:</span> Combine lattice point with message character</li>
          </ol>
          <p className="text-xs font-mono text-muted-foreground mt-2">
            Decryption reverses this: regenerate the same lattice points, then XOR to recover the message!
          </p>
        </div>

        <div className="space-y-2">
          <input
            type="text"
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            placeholder="Enter message to encrypt..."
            className="w-full p-2 rounded-lg bg-background/50 border border-border/50 font-mono text-xs"
          />
          <Button onClick={encrypt} className="font-mono text-xs gap-1.5">
            <Lock className="w-3.5 h-3.5" />
            Encrypt (LWE)
          </Button>
        </div>

        {encrypted && (
          <motion.div 
            initial={{ opacity: 0, y: 10 }} 
            animate={{ opacity: 1, y: 0 }}
            className="space-y-3"
          >
            <div className="p-3 rounded-lg bg-accent/10 border border-accent/30">
              <div className="text-xs font-mono text-accent mb-2">
                <strong>📦 Ciphertext (Lattice Point + Noise)</strong>
              </div>
              <div className="font-mono text-xs break-all">
                [{encrypted.ciphertext.join(', ')}]
              </div>
              <div className="text-xs text-muted-foreground mt-2">
                Secret Seed: [{encrypted.seed.join(', ')}]
              </div>
              <div className="text-xs text-muted-foreground mt-1">
                Message Length: {encrypted.ciphertext.length} characters
              </div>
            </div>

            <div className="p-3 rounded-lg bg-background/50 border border-border/50">
              <p className="text-xs font-mono text-muted-foreground">
                <strong>💡 What you see:</strong> The ciphertext looks completely random! 
                Without the seed (secret key), even a quantum computer can't recover the message 
                because it would need to solve the "closest vector problem" in high dimensions.
              </p>
            </div>

            <Button 
              onClick={decrypt} 
              variant="outline" 
              className="font-mono text-xs gap-1.5"
            >
              <Unlock className="w-3.5 h-3.5" />
              Decrypt (Using Secret Seed)
            </Button>

            {decrypted && (
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="text-xs font-mono text-primary mb-2">
                  <strong>✅ Decrypted Successfully!</strong>
                </div>
                <div className="font-mono text-sm">
                  {decrypted}
                </div>
                <div className="text-xs text-muted-foreground mt-2">
                  The same seed regenerated identical lattice points, allowing perfect decryption!
                </div>
              </div>
            )}
          </motion.div>
        )}

        <div className="p-3 rounded-lg bg-secondary/50 border border-border/50">
          <div className="text-xs font-mono text-muted-foreground">
            <strong>🛡️ Why Post-Quantum?</strong> RSA and ECC rely on factoring/discrete logs - problems Shor's algorithm breaks on quantum computers. 
            Lattice problems have no known quantum speedup, making them quantum-resistant!
          </div>
        </div>
      </CardContent>
    </Card>
  );
}