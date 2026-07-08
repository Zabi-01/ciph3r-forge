import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Hash } from 'lucide-react';
import { motion } from 'framer-motion';
import { md5, sha256, sha512 } from '@/lib/ciphers/hashing';
import { toast } from 'sonner';

export default function HashGeneratorTool() {
  const [input, setInput] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA256');
  const [result, setResult] = useState(null);
  const [avalanche, setAvalanche] = useState(null);

  const generateHash = async () => {
    if (!input) return;
    let hash;
    let bits;
    switch (algorithm) {
      case 'MD5': hash = await md5(input); bits = 128; break;
      case 'SHA256': hash = await sha256(input); bits = 256; break;
      case 'SHA512': hash = await sha512(input); bits = 512; break;
      default: hash = await sha256(input); bits = 256;
    }
    const base64 = btoa(hash.match(/.{1,2}/g).map(b => String.fromCharCode(parseInt(b, 16))).join(''));
    setResult({ hash, base64, bits });

    // Avalanche effect
    const modifiedInput = input + 'x';
    let hash2;
    switch (algorithm) {
      case 'MD5': hash2 = await md5(modifiedInput); break;
      case 'SHA256': hash2 = await sha256(modifiedInput); break;
      case 'SHA512': hash2 = await sha512(modifiedInput); break;
      default: hash2 = await sha256(modifiedInput);
    }
    const bits1 = hash.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
    const bits2 = hash2.split('').map(c => parseInt(c, 16).toString(2).padStart(4, '0')).join('');
    let diff = 0;
    for (let i = 0; i < bits1.length; i++) {
      if (bits1[i] !== bits2[i]) diff++;
    }
    setAvalanche(((diff / bits1.length) * 100).toFixed(1));
  };

  const copyToClipboard = (text) => {
    navigator.clipboard.writeText(text);
    toast.success('Copied to clipboard');
  };

  return (
    <div className="space-y-4">
      <div className="flex gap-2 items-start">
        <Textarea
          placeholder="Enter text or hex string to hash..."
          value={input}
          onChange={(e) => setInput(e.target.value)}
          className="font-mono text-sm min-h-[80px] flex-1"
        />
        <div className="space-y-2">
          <select
            value={algorithm}
            onChange={(e) => setAlgorithm(e.target.value)}
            className="h-10 px-3 rounded-md border border-input bg-transparent text-sm"
          >
            <option value="MD5">MD5 (128-bit)</option>
            <option value="SHA256">SHA-256 (256-bit)</option>
            <option value="SHA512">SHA-512 (512-bit)</option>
          </select>
          <Button onClick={generateHash} className="w-full">Generate Hash</Button>
        </div>
      </div>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          <div className="grid sm:grid-cols-3 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Hash (Hex)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono break-all cursor-pointer hover:text-primary" onClick={() => copyToClipboard(result.hash)}>
                  {result.hash}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Click to copy</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Hash (Base64)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono break-all cursor-pointer hover:text-primary" onClick={() => copyToClipboard(result.base64)}>
                  {result.base64}
                </div>
                <div className="text-[10px] text-muted-foreground mt-1">Click to copy</div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">Hash Length</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-mono font-bold text-primary">{result.bits}</div>
                <div className="text-[10px] text-muted-foreground">bits</div>
              </CardContent>
            </Card>
          </div>
          {avalanche && (
            <Card>
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  <Hash className="w-4 h-4" /> Avalanche Effect Demo
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-4">
                  <div className="flex-1">
                    <div className="text-[10px] text-muted-foreground mb-1">Original input hash</div>
                    <div className="text-xs font-mono">{result.hash.substring(0, 32)}...</div>
                  </div>
                  <div className="text-center">
                    <div className="text-3xl font-mono font-bold text-chart-4">{avalanche}%</div>
                    <div className="text-[10px] text-muted-foreground">bits flipped</div>
                  </div>
                  <div className="flex-1 text-right">
                    <div className="text-[10px] text-muted-foreground mb-1">Input + 'x' hash</div>
                    <div className="text-xs font-mono">...completely different</div>
                  </div>
                </div>
                <div className="mt-3 text-[10px] text-muted-foreground">
                  Good hash functions should flip ~50% of bits when input changes slightly
                </div>
              </CardContent>
            </Card>
          )}
        </motion.div>
      )}
    </div>
  );
}