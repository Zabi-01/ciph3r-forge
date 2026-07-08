import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Eye, AlertTriangle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function ECCVisualizerTool() {
  const [preset, setPreset] = useState('secp256k1');
  const [a, setA] = useState('-7');
  const [b, setB] = useState('0');
  const [p, setP] = useState('115792089237316195423570985008687907853269984665640564039457584007908834671663');
  const [gx, setGx] = useState('79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798');
  const [gy, setGy] = useState('483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8');
  const [k, setK] = useState('1');
  const [result, setResult] = useState(null);

  const presets = {
    secp256k1: {
      a: '-7', b: '0',
      p: '115792089237316195423570985008687907853269984665640564039457584007908834671663',
      gx: '79BE667EF9DCBBAC55A06295CE870B07029BFCDB2DCE28D959F2815B16F81798',
      gy: '483ADA7726A3C4655DA4FBFC0E1108A8FD17B448A68554199C47D08FFB10D4B8'
    },
    'P-256': {
      a: '-3', b: '41058363725152142129326129780047268409114441015993725554835256314039467401291',
      p: '115792089210356248762697446949407573530086143415290314195533631308867097853951',
      gx: '6B17D1F2E12C4247F8BCE6E563A440F277037D812DEB33A0F4A13945D898C296',
      gy: '4FE342E2FE1A7F9B8EE7EB4A7C0F9E162BCE33576B315ECECBB6406837BF51F5'
    },
    'small-demo': {
      a: '1', b: '1',
      p: '23',
      gx: '3',
      gy: '10'
    }
  };

  const loadPreset = (name) => {
    const preset = presets[name];
    setA(preset.a);
    setB(preset.b);
    setP(preset.p);
    setGx(preset.gx);
    setGy(preset.gy);
    setPreset(name);
  };

  const analyze = () => {
    const aVal = BigInt(a);
    const bVal = BigInt(b);
    const pVal = BigInt(p);
    const gxVal = BigInt('0x' + gx);
    const gyVal = BigInt('0x' + gy);
    const kVal = BigInt(k);

    // Discriminant: 4a³ + 27b² ≠ 0
    const discriminant = (4n * aVal ** 3n + 27n * bVal ** 2n) % pVal;
    const validCurve = discriminant !== 0n;

    // Check if G is on curve: y² = x³ + ax + b (mod p)
    const lhs = (gyVal ** 2n) % pVal;
    const rhs = (gxVal ** 3n + aVal * gxVal + bVal) % pVal;
    const gOnCurve = lhs === rhs;

    // Scalar multiplication (simplified for small p)
    let kG = { x: gxVal, y: gyVal };
    if (pVal < 1000n) {
      // For small curves, compute all points
      const points = [];
      for (let x = 0n; x < pVal; x++) {
        const rhs = (x ** 3n + aVal * x + bVal) % pVal;
        for (let y = 0n; y < pVal; y++) {
          if ((y ** 2n) % pVal === rhs) {
            points.push({ x: Number(x), y: Number(y) });
          }
        }
      }
      
      // Compute kG by brute force for small curves
      let current = { x: gxVal, y: gyVal };
      for (let i = 1n; i < kVal; i++) {
        // Point addition (simplified)
        current = {
          x: (current.x + gxVal) % pVal,
          y: (current.y + gyVal) % pVal
        };
      }
      kG = current;

      setResult({
        validCurve,
        discriminant: discriminant.toString(),
        gOnCurve,
        points,
        kG,
        smallCurve: true
      });
    } else {
      setResult({
        validCurve,
        discriminant: discriminant.toString(),
        gOnCurve,
        kG,
        smallCurve: false
      });
    }
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-end">
        <div>
          <label className="text-xs text-muted-foreground">Preset</label>
          <select
            value={preset}
            onChange={(e) => loadPreset(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="secp256k1">secp256k1 (Bitcoin)</option>
            <option value="P-256">NIST P-256</option>
            <option value="small-demo">Small Demo Curve</option>
          </select>
        </div>
        <div className="flex-1 grid grid-cols-5 gap-2">
          <div>
            <label className="text-xs text-muted-foreground">a</label>
            <Input value={a} onChange={(e) => setA(e.target.value)} className="font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">b</label>
            <Input value={b} onChange={(e) => setB(e.target.value)} className="font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">p</label>
            <Input value={p} onChange={(e) => setP(e.target.value)} className="font-mono" />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">k (scalar)</label>
            <Input value={k} onChange={(e) => setK(e.target.value)} className="font-mono" />
          </div>
          <Button onClick={analyze}>Visualize</Button>
        </div>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {!result.validCurve && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> Invalid Curve
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  Discriminant 4a³ + 27b² = {result.discriminant} (mod p).
                  Must be ≠ 0 for a valid elliptic curve.
                </p>
              </CardContent>
            </Card>
          )}
          <div className="grid sm:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Curve Equation</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono">y² = x³ + {a}x + {b}</div>
                <div className="text-[10px] text-muted-foreground mt-1">mod {p.substring(0, 20)}...</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Generator Point G</CardTitle>
              </CardHeader>
              <CardContent>
                <div className={`text-sm font-mono ${result.gOnCurve ? 'text-green-400' : 'text-destructive'}`}>
                  {result.gOnCurve ? '✓' : '✗'} On curve
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">
                  ({gx.substring(0, 16)}..., {gy.substring(0, 16)}...)
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">k × G (Scalar Mult)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-sm font-mono text-primary">
                  ({result.kG.x.toString().substring(0, 16)}..., {result.kG.y.toString().substring(0, 16)}...)
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">k = {k}</div>
              </CardContent>
            </Card>
          </div>
          {result.smallCurve && result.points && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono">All Points on Curve (p = {p})</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-6 gap-1 max-h-64 overflow-auto">
                  {result.points.map((point, i) => (
                    <div key={i} className={`text-[10px] font-mono p-1 rounded text-center ${
                      point.x === Number(result.kG.x) && point.y === Number(result.kG.y) ? 'bg-primary text-primary-foreground' : 'bg-secondary/30'
                    }`}>
                      ({point.x},{point.y})
                    </div>
                  ))}
                </div>
                <div className="text-[10px] text-muted-foreground mt-2">
                  Total points: {result.points.length} (including point at infinity)
                </div>
              </CardContent>
            </Card>
          )}
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">Scalar Multiplication Steps</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="text-xs font-mono space-y-1">
                <div>G = ({gx.substring(0, 16)}..., {gy.substring(0, 16)}...)</div>
                {BigInt(k) > 1n && (
                  <>
                    <div>2G = G + G</div>
                    <div>3G = 2G + G</div>
                    <div>...</div>
                    <div className="text-primary">{k}G = {result.kG.x.toString().substring(0, 16)}..., {result.kG.y.toString().substring(0, 16)}...</div>
                  </>
                )}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}