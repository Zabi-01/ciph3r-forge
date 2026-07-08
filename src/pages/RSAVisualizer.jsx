import { useState, useEffect } from 'react';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Badge } from '@/components/ui/badge';
import { Progress } from '@/components/ui/progress';
import { Alert, AlertDescription } from '@/components/ui/alert';
import { motion, AnimatePresence } from 'framer-motion';
import { Key, Lock, Unlock, Shield, Zap, ChevronRight, Check, X, RefreshCw, Info } from 'lucide-react';
import { AlertCircle } from 'lucide-react';

const smallPrimes = [
  2, 3, 5, 7, 11, 13, 17, 19, 23, 29, 31, 37, 41, 43, 47, 53, 59, 61, 67, 71,
  73, 79, 83, 89, 97, 101, 103, 107, 109, 113, 127, 131, 137, 139, 149, 151
];

const isPrime = (num) => {
  if (num < 2) return false;
  if (num === 2) return true;
  if (num % 2 === 0) return false;
  for (let i = 3; i <= Math.sqrt(num); i += 2) {
    if (num % i === 0) return false;
  }
  return true;
};

const gcd = (a, b) => {
  while (b !== 0n) {
    const temp = b;
    b = a % b;
    a = temp;
  }
  return a;
};

const modInverse = (e, phi) => {
  let [oldR, r] = [e, phi];
  let [oldS, s] = [1n, 0n];
  
  while (r !== 0n) {
    const quotient = oldR / r;
    [oldR, r] = [r, oldR - quotient * r];
    [oldS, s] = [s, oldS - quotient * s];
  }
  
  return oldS < 0n ? oldS + phi : oldS;
};

export default function RSAVisualizer() {
  const [step, setStep] = useState(0);
  const [p, setP] = useState(61n);
  const [q, setQ] = useState(53n);
  const [e, setE] = useState(17n);
  const [animationStage, setAnimationStage] = useState(0);
  const [isAnimating, setIsAnimating] = useState(false);
  const [customInput, setCustomInput] = useState({ p: '61', q: '53', e: '17' });
  const [errors, setErrors] = useState({});

  const n = p * q;
  const phi = (p - 1n) * (q - 1n);
  const d = modInverse(e, phi);

  const validateInputs = () => {
    const newErrors = {};
    const pVal = BigInt(customInput.p);
    const qVal = BigInt(customInput.q);
    const eVal = BigInt(customInput.e);

    if (!isPrime(Number(pVal))) newErrors.p = 'p must be prime';
    if (!isPrime(Number(qVal))) newErrors.q = 'q must be prime';
    if (pVal === qVal) newErrors.q = 'p and q must be different';
    if (eVal < 3n || eVal >= phi) newErrors.e = 'e must be 3 ≤ e < φ(n)';
    if (gcd(eVal, phi) !== 1n) newErrors.e = 'e must be coprime to φ(n)';

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleStartAnimation = () => {
    if (validateInputs()) {
      setP(BigInt(customInput.p));
      setQ(BigInt(customInput.q));
      setE(BigInt(customInput.e));
      setStep(0);
      setAnimationStage(0);
      setIsAnimating(true);
    }
  };

  const steps = [
    {
      title: 'Select Two Prime Numbers',
      description: 'RSA starts with two distinct prime numbers p and q',
      icon: Shield,
      content: (
        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label className="text-xs font-mono">Prime p</Label>
              <Input
                value={customInput.p}
                onChange={(e) => setCustomInput(prev => ({ ...prev, p: e.target.value }))}
                className={`font-mono ${errors.p ? 'border-destructive' : 'border-primary/30'}`}
              />
              {errors.p && <p className="text-xs text-destructive">{errors.p}</p>}
              {!errors.p && isPrime(Number(customInput.p)) && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" /> Prime
                </Badge>
              )}
            </div>
            <div className="space-y-2">
              <Label className="text-xs font-mono">Prime q</Label>
              <Input
                value={customInput.q}
                onChange={(e) => setCustomInput(prev => ({ ...prev, q: e.target.value }))}
                className={`font-mono ${errors.q ? 'border-destructive' : 'border-primary/30'}`}
              />
              {errors.q && <p className="text-xs text-destructive">{errors.q}</p>}
              {!errors.q && isPrime(Number(customInput.q)) && (
                <Badge variant="secondary" className="text-xs">
                  <Check className="w-3 h-3 mr-1" /> Prime
                </Badge>
              )}
            </div>
          </div>
          
          <div className="p-3 rounded-lg bg-primary/5 border border-primary/20">
            <p className="text-xs font-mono text-muted-foreground">
              Security Note: In real RSA, p and q are typically 1024+ bits each
            </p>
          </div>
        </div>
      )
    },
    {
      title: 'Compute Modulus n',
      description: 'Multiply p and q to get the modulus n',
      icon: Zap,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-lg font-mono">
            <span className="text-chart-1">p</span>
            <span className="text-muted-foreground">×</span>
            <span className="text-chart-2">q</span>
            <span className="text-muted-foreground">=</span>
            <span className="text-primary font-bold">n</span>
          </div>
          
          <div className="flex items-center justify-center gap-4 text-2xl font-mono">
            <motion.span
              key={p.toString()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-chart-1"
            >
              {p.toString()}
            </motion.span>
            <span className="text-muted-foreground">×</span>
            <motion.span
              key={q.toString()}
              initial={{ scale: 0.8, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-chart-2"
            >
              {q.toString()}
            </motion.span>
            <span className="text-muted-foreground">=</span>
            <motion.span
              key={n.toString()}
              initial={{ scale: 1.2, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              className="text-primary font-bold"
            >
              {n.toString()}
            </motion.span>
          </div>

          <Alert className="bg-accent/5 border-accent/20">
            <Info className="w-4 h-4 text-accent" />
            <AlertDescription className="text-xs font-mono">
              n is part of both the public and private keys
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: "Compute Euler's Totient φ(n)",
      description: 'Calculate φ(n) = (p-1)(q-1)',
      icon: RefreshCw,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-lg font-mono">
            <span className="text-muted-foreground">φ(</span>
            <span className="text-primary">n</span>
            <span className="text-muted-foreground">) = (</span>
            <span className="text-chart-1">p</span>
            <span className="text-muted-foreground">-1)(</span>
            <span className="text-chart-2">q</span>
            <span className="text-muted-foreground">-1)</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-xl font-mono">
            <span className="text-muted-foreground">(</span>
            <motion.span className="text-chart-1">{p.toString()}</motion.span>
            <span className="text-muted-foreground">-1)(</span>
            <motion.span className="text-chart-2">{q.toString()}</motion.span>
            <span className="text-muted-foreground">-1)</span>
            <span className="text-muted-foreground">=</span>
            <motion.span
              initial={{ scale: 1.2 }}
              animate={{ scale: 1 }}
              className="text-accent font-bold"
            >
              {phi.toString()}
            </motion.span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            φ(n) counts integers coprime to n (used to find private key)
          </p>
        </div>
      )
    },
    {
      title: 'Choose Public Exponent e',
      description: 'Select e where 1 < e < φ(n) and gcd(e, φ(n)) = 1',
      icon: Key,
      content: (
        <div className="space-y-4">
          <div className="space-y-2">
            <Label className="text-xs font-mono">Public exponent e</Label>
            <Input
              value={customInput.e}
              onChange={(e) => setCustomInput(prev => ({ ...prev, e: e.target.value }))}
              className={`font-mono ${errors.e ? 'border-destructive' : 'border-primary/30'}`}
            />
            {errors.e && <p className="text-xs text-destructive">{errors.e}</p>}
            {!errors.e && (
              <Badge variant="secondary" className="text-xs">
                <Check className="w-3 h-3 mr-1" /> Valid (coprime to φ(n))
              </Badge>
            )}
          </div>

          <div className="flex items-center justify-center gap-4 text-xl font-mono">
            <span className="text-muted-foreground">gcd(</span>
            <motion.span className="text-chart-3">{e.toString()}</motion.span>
            <span className="text-muted-foreground">,</span>
            <motion.span className="text-accent">{phi.toString()}</motion.span>
            <motion.span
              animate={{ scale: [1, 1.3, 1] }}
              transition={{ repeat: 2 }}
              className="text-primary font-bold"
            >
              ) = 1 ✓
            </motion.span>
          </div>

          <p className="text-xs text-muted-foreground text-center">
            Common choices: 3, 17, 65537 (Fermat primes)
          </p>
        </div>
      )
    },
    {
      title: 'Compute Private Exponent d',
      description: 'Find d where d × e ≡ 1 (mod φ(n))',
      icon: Lock,
      content: (
        <div className="space-y-4">
          <div className="flex items-center justify-center gap-2 text-lg font-mono">
            <span className="text-chart-3">d</span>
            <span className="text-muted-foreground">×</span>
            <span className="text-chart-3">e</span>
            <span className="text-muted-foreground">≡ 1 (mod</span>
            <span className="text-accent">φ(n)</span>
            <span className="text-muted-foreground">)</span>
          </div>

          <div className="flex items-center justify-center gap-4 text-xl font-mono">
            <motion.span
              key={d.toString()}
              initial={{ scale: 0.5, rotateY: 90 }}
              animate={{ scale: 1, rotateY: 0 }}
              transition={{ type: 'spring', stiffness: 200 }}
              className="text-destructive font-bold"
            >
              {d.toString()}
            </motion.span>
            <span className="text-muted-foreground">×</span>
            <span className="text-chart-3">{e.toString()}</span>
            <span className="text-muted-foreground">mod</span>
            <span className="text-accent">{phi.toString()}</span>
            <span className="text-muted-foreground">=</span>
            <motion.span
              animate={{ opacity: [0.5, 1, 0.5] }}
              transition={{ repeat: Infinity, duration: 2 }}
              className="text-primary font-bold"
            >
              1 ✓
            </motion.span>
          </div>

          <Alert className="bg-destructive/5 border-destructive/20">
            <Lock className="w-4 h-4 text-destructive" />
            <AlertDescription className="text-xs font-mono">
              d is the PRIVATE KEY - never share this!
            </AlertDescription>
          </Alert>
        </div>
      )
    },
    {
      title: 'Key Generation Complete',
      description: 'RSA key pair successfully generated',
      icon: Shield,
      content: (
        <div className="space-y-6">
          <div className="grid grid-cols-2 gap-4">
            <Card className="bg-primary/5 border-primary/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono flex items-center gap-2">
                  <Key className="w-4 h-4 text-primary" />
                  Public Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">n (modulus)</p>
                  <p className="font-mono text-sm break-all">{n.toString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">e (exponent)</p>
                  <p className="font-mono text-sm">{e.toString()}</p>
                </div>
              </CardContent>
            </Card>

            <Card className="bg-destructive/5 border-destructive/20">
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono flex items-center gap-2">
                  <Lock className="w-4 h-4 text-destructive" />
                  Private Key
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-2">
                <div>
                  <p className="text-xs text-muted-foreground font-mono">n (modulus)</p>
                  <p className="font-mono text-sm break-all">{n.toString()}</p>
                </div>
                <div>
                  <p className="text-xs text-muted-foreground font-mono">d (private exponent)</p>
                  <p className="font-mono text-sm break-all">{d.toString()}</p>
                </div>
              </CardContent>
            </Card>
          </div>

          <div className="p-4 rounded-lg bg-secondary/30 border border-border/50">
            <h4 className="text-xs font-mono mb-2 flex items-center gap-2">
              <Info className="w-3 h-3" />
              Key Summary
            </h4>
            <div className="grid grid-cols-2 gap-2 text-xs font-mono">
              <div><span className="text-chart-1">p =</span> {p.toString()}</div>
              <div><span className="text-chart-2">q =</span> {q.toString()}</div>
              <div><span className="text-primary">n =</span> {n.toString()}</div>
              <div><span className="text-accent">φ(n) =</span> {phi.toString()}</div>
              <div><span className="text-chart-3">e =</span> {e.toString()}</div>
              <div><span className="text-destructive">d =</span> {d.toString()}</div>
            </div>
          </div>
        </div>
      )
    }
  ];

  useEffect(() => {
    if (isAnimating && animationStage < steps.length) {
      const timer = setTimeout(() => {
        setAnimationStage(prev => prev + 1);
        setStep(animationStage);
      }, 2500);
      return () => clearTimeout(timer);
    } else if (animationStage >= steps.length) {
      setIsAnimating(false);
    }
  }, [isAnimating, animationStage]);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-primary">RSA</span> Key Visualizer
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">Interactive key generation & factorization</p>
      </div>

      {/* Custom Input Section */}
      <Card className="bg-card/30 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <RefreshCw className="w-4 h-4" />
            Configure Primes
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-3 gap-3">
            <div className="space-y-1">
              <Label className="text-xs font-mono text-muted-foreground">Prime p</Label>
              <Input
                value={customInput.p}
                onChange={(e) => setCustomInput(prev => ({ ...prev, p: e.target.value }))}
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono text-muted-foreground">Prime q</Label>
              <Input
                value={customInput.q}
                onChange={(e) => setCustomInput(prev => ({ ...prev, q: e.target.value }))}
                className="font-mono text-xs h-8"
              />
            </div>
            <div className="space-y-1">
              <Label className="text-xs font-mono text-muted-foreground">Exponent e</Label>
              <Input
                value={customInput.e}
                onChange={(e) => setCustomInput(prev => ({ ...prev, e: e.target.value }))}
                className="font-mono text-xs h-8"
              />
            </div>
          </div>
          <Button onClick={handleStartAnimation} className="w-full font-mono text-xs gap-2">
            <Zap className="w-4 h-4" />
            Generate Keys (Animated)
          </Button>
        </CardContent>
      </Card>

      {/* Progress Indicator */}
      <div className="space-y-2">
        <div className="flex items-center justify-between text-xs font-mono">
          <span className="text-muted-foreground">Step {Math.min(step + 1, steps.length)} of {steps.length}</span>
          <span className="text-primary">{Math.round(((step + 1) / steps.length) * 100)}%</span>
        </div>
        <Progress value={((step + 1) / steps.length) * 100} className="h-2" />
      </div>

      {/* Step Navigation */}
      <div className="flex gap-2 overflow-x-auto pb-2">
        {steps.map((s, i) => (
          <button
            key={i}
            onClick={() => { setStep(i); setAnimationStage(i); setIsAnimating(false); }}
            className={`flex-shrink-0 px-3 py-2 rounded-lg border text-xs font-mono transition-all ${
              i === step
                ? 'bg-primary/10 border-primary/30 text-primary'
                : 'bg-card/30 border-border/50 text-muted-foreground hover:border-primary/20'
            }`}
          >
            <s.icon className="w-3 h-3 inline mr-1" />
            {i + 1}
          </button>
        ))}
      </div>

      {/* Current Step Content */}
      <AnimatePresence mode="wait">
        <motion.div
          key={step}
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          exit={{ opacity: 0, x: -20 }}
          transition={{ duration: 0.3 }}
        >
          <Card className="bg-card/30 border-border/50">
            <CardHeader>
              <CardTitle className="text-sm font-mono flex items-center gap-2">
                {(() => {
                  const StepIcon = steps[step].icon;
                  return StepIcon && <StepIcon className="w-4 h-4 text-primary" />;
                })()}
                {steps[step].title}
              </CardTitle>
            </CardHeader>
            <CardContent>
              <p className="text-xs text-muted-foreground mb-4">{steps[step].description}</p>
              {steps[step].content}
            </CardContent>
          </Card>
        </motion.div>
      </AnimatePresence>

      {/* Factorization Demo */}
      <Card className="bg-card/30 border-border/50">
        <CardHeader>
          <CardTitle className="text-sm font-mono flex items-center gap-2">
            <Unlock className="w-4 h-4 text-chart-4" />
            Prime Factorization Demo
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <p className="text-xs text-muted-foreground">
            Given only n = {n.toString()}, finding p and q is computationally hard for large n
          </p>
          <div className="flex items-center gap-2 text-sm font-mono">
            <span className="text-primary">{n.toString()}</span>
            <span className="text-muted-foreground">=</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.5 }}
              className="text-chart-1"
            >
              {p.toString()}
            </motion.span>
            <span className="text-muted-foreground">×</span>
            <motion.span
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.7 }}
              className="text-chart-2"
            >
              {q.toString()}
            </motion.span>
          </div>
          <Alert className="bg-chart-4/5 border-chart-4/20">
            <AlertCircle className="w-4 h-4 text-chart-4" />
            <AlertDescription className="text-xs font-mono">
              For 2048-bit RSA, factorization would take billions of years with current technology
            </AlertDescription>
          </Alert>
        </CardContent>
      </Card>
    </div>
  );
}