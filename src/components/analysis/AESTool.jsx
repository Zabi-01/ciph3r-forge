import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { AlertTriangle, Lock } from 'lucide-react';
import { motion } from 'framer-motion';
import { toast } from 'sonner';

export default function AESTool() {
  const [plaintext, setPlaintext] = useState('');
  const [key, setKey] = useState('');
  const [mode, setMode] = useState('ECB');
  const [iv, setIv] = useState('');
  const [result, setResult] = useState(null);

  const analyze = () => {
    if (!plaintext || !key) return;
    const keyBits = key.length * 4;
    let rounds = 10;
    if (keyBits === 192) rounds = 12;
    if (keyBits === 256) rounds = 14;

    // Simple XOR-based "encryption" for demonstration (not real AES)
    const plaintextBytes = new TextEncoder().encode(plaintext);
    const keyBytes = new Uint8Array(key.match(/.{1,2}/g)?.map(b => parseInt(b, 16)) || []);
    
    // Pad to block size (16 bytes)
    const padded = new Uint8Array(Math.ceil(plaintextBytes.length / 16) * 16);
    padded.set(plaintextBytes);
    padded.fill(16 - (plaintextBytes.length % 16), plaintextBytes.length);

    // XOR with key (repeated)
    const cipher = new Uint8Array(padded.length);
    for (let i = 0; i < padded.length; i++) {
      cipher[i] = padded[i] ^ keyBytes[i % keyBytes.length];
    }

    const ciphertextHex = Array.from(cipher).map(b => b.toString(16).padStart(2, '0')).join('');
    const ciphertextBase64 = btoa(String.fromCharCode(...cipher));

    // Block breakdown
    const blocks = [];
    for (let i = 0; i < cipher.length; i += 16) {
      blocks.push(Array.from(cipher.slice(i, i + 16)).map(b => b.toString(16).padStart(2, '0')).join(' '));
    }

    setResult({
      ciphertextHex,
      ciphertextBase64,
      keyBits,
      rounds,
      blocks,
      isECB: mode === 'ECB'
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Plaintext (string or hex)</label>
          <Textarea
            placeholder="Enter plaintext..."
            value={plaintext}
            onChange={(e) => setPlaintext(e.target.value)}
            className="font-mono text-sm min-h-[80px]"
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Key (hex, 128/192/256 bit)</label>
            <Input
              placeholder="00112233445566778899aabbccddeeff"
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Mode</label>
            <select
              value={mode}
              onChange={(e) => setMode(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="ECB">ECB (Electronic Codebook)</option>
              <option value="CBC">CBC (Cipher Block Chaining)</option>
              <option value="CTR">CTR (Counter)</option>
              <option value="GCM">GCM (Galois/Counter)</option>
            </select>
          </div>
          {(mode === 'CBC' || mode === 'CTR') && (
            <div>
              <label className="text-xs text-muted-foreground">IV (hex, 16 bytes)</label>
              <Input
                placeholder="00112233445566778899aabbccddeeff"
                value={iv}
                onChange={(e) => setIv(e.target.value)}
                className="font-mono"
              />
            </div>
          )}
        </div>
      </div>
      <Button onClick={analyze} className="w-full">
        <Lock className="w-4 h-4 mr-2" /> Analyze AES Structure
      </Button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {result.isECB && (
            <Card className="border-destructive/50">
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2 text-destructive">
                  <AlertTriangle className="w-4 h-4" /> ECB Mode Warning
                </CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-xs text-muted-foreground">
                  ECB mode is <strong>insecure</strong> - identical plaintext blocks produce identical ciphertext blocks.
                  This reveals patterns in the data. Always use CBC, CTR, or GCM for real applications.
                </p>
              </CardContent>
            </Card>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Ciphertext (Hex)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono break-all">{result.ciphertextHex}</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Ciphertext (Base64)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono break-all">{result.ciphertextBase64}</div>
              </CardContent>
            </Card>
          </div>
          <div className="grid sm:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Key Size</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-primary">{result.keyBits}</div>
                <div className="text-[10px] text-muted-foreground">bits</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Rounds</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-chart-4">{result.rounds}</div>
                <div className="text-[10px] text-muted-foreground">AES rounds</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Mode</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-accent">{result.isECB ? 'ECB ⚠️' : mode}</div>
                <div className="text-[10px] text-muted-foreground">{mode}</div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">Block Breakdown (16 bytes each)</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-1">
                {result.blocks.map((block, i) => (
                  <div key={i} className="text-xs font-mono p-2 rounded bg-secondary/30">
                    <span className="text-muted-foreground">Block {i + 1}: </span>
                    {block}
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}