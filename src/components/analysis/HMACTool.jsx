import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';
import { sha256, sha512, md5 } from '@/lib/ciphers/hashing';
import { toast } from 'sonner';

export default function HMACTool() {
  const [message, setMessage] = useState('');
  const [key, setKey] = useState('');
  const [algorithm, setAlgorithm] = useState('SHA256');
  const [expectedHmac, setExpectedHmac] = useState('');
  const [result, setResult] = useState(null);

  const xorWithPad = (keyBytes, pad) => {
    const result = new Uint8Array(64);
    for (let i = 0; i < 64; i++) {
      result[i] = (keyBytes[i] || 0) ^ pad;
    }
    return result;
  };

  const calculateHMAC = async () => {
    if (!message || !key) return;

    const keyBytes = new TextEncoder().encode(key);
    const messageBytes = new TextEncoder().encode(message);

    // Pad key to block size (64 bytes for SHA-256/512)
    const paddedKey = new Uint8Array(64);
    if (keyBytes.length > 64) {
      // Hash key if too long
      const hashedKey = await sha256(key);
      const hashBytes = hashedKey.match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [];
      paddedKey.set(hashBytes);
    } else {
      paddedKey.set(keyBytes);
    }

    // Create ipad and opad
    const ipad = xorWithPad(paddedKey, 0x36);
    const opad = xorWithPad(paddedKey, 0x5c);

    // Inner hash: H(ipad || message)
    const innerData = new Uint8Array(ipad.length + messageBytes.length);
    innerData.set(ipad);
    innerData.set(messageBytes, ipad.length);
    
    // Outer hash: H(opad || inner_hash)
    let innerHash, outerHash;
    switch (algorithm) {
      case 'MD5':
        innerHash = await md5(String.fromCharCode(...innerData));
        break;
      case 'SHA256':
        innerHash = await sha256(String.fromCharCode(...innerData));
        break;
      case 'SHA512':
        innerHash = await sha512(String.fromCharCode(...innerData));
        break;
    }

    const innerBytes = innerHash.match(/.{1,2}/g)?.map(x => parseInt(x, 16)) || [];
    const outerData = new Uint8Array(opad.length + innerBytes.length);
    outerData.set(opad);
    outerData.set(innerBytes, opad.length);

    switch (algorithm) {
      case 'MD5':
        outerHash = await md5(String.fromCharCode(...outerData));
        break;
      case 'SHA256':
        outerHash = await sha256(String.fromCharCode(...outerData));
        break;
      case 'SHA512':
        outerHash = await sha512(String.fromCharCode(...outerData));
        break;
    }

    const hmacHex = outerHash;
    const hmacBase64 = btoa(hmacHex.match(/.{1,2}/g)?.map(x => parseInt(x, 16)).map(b => String.fromCharCode(b)).join(''));

    setResult({
      hmacHex,
      hmacBase64,
      innerHash,
      outerHash,
      ipad: Array.from(ipad).map(b => b.toString(16).padStart(2, '0')).join(' ').substring(0, 100) + '...',
      opad: Array.from(opad).map(b => b.toString(16).padStart(2, '0')).join(' ').substring(0, 100) + '...',
      match: expectedHmac ? hmacHex.toLowerCase() === expectedHmac.toLowerCase() : null
    });
  };

  return (
    <div className="space-y-4">
      <div className="grid sm:grid-cols-2 gap-4">
        <div>
          <label className="text-xs text-muted-foreground">Message</label>
          <Textarea
            placeholder="Enter message..."
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            className="font-mono text-sm min-h-[80px]"
          />
        </div>
        <div className="space-y-3">
          <div>
            <label className="text-xs text-muted-foreground">Key</label>
            <Input
              placeholder="Enter secret key..."
              value={key}
              onChange={(e) => setKey(e.target.value)}
              className="font-mono"
            />
          </div>
          <div>
            <label className="text-xs text-muted-foreground">Algorithm</label>
            <select
              value={algorithm}
              onChange={(e) => setAlgorithm(e.target.value)}
              className="w-full h-10 px-3 rounded-md border border-input bg-transparent text-sm"
            >
              <option value="MD5">HMAC-MD5</option>
              <option value="SHA256">HMAC-SHA256</option>
              <option value="SHA512">HMAC-SHA512</option>
            </select>
          </div>
        </div>
      </div>
      <div>
        <label className="text-xs text-muted-foreground">Expected HMAC (for verification, optional)</label>
        <Input
          placeholder="Paste expected HMAC to verify..."
          value={expectedHmac}
          onChange={(e) => setExpectedHmac(e.target.value)}
          className="font-mono"
        />
      </div>
      <Button onClick={calculateHMAC} className="w-full">
        <CheckCircle className="w-4 h-4 mr-2" /> Calculate HMAC
      </Button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {result.match !== null && (
            <Card className={result.match ? 'border-green-500/50' : 'border-destructive/50'}>
              <CardHeader>
                <CardTitle className="text-sm font-mono flex items-center gap-2">
                  {result.match ? <CheckCircle className="w-4 h-4 text-green-400" /> : <CheckCircle className="w-4 h-4 text-destructive" />}
                  Verification Result
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-lg font-mono font-bold">
                  {result.match ? '✓ HMAC Match' : '✗ HMAC Mismatch'}
                </div>
              </CardContent>
            </Card>
          )}
          <div className="grid sm:grid-cols-2 gap-3">
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">HMAC (Hex)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono break-all cursor-pointer hover:text-primary" onClick={() => {
                  navigator.clipboard.writeText(result.hmacHex);
                  toast.success('Copied');
                }}>
                  {result.hmacHex}
                </div>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="pb-2">
                <CardTitle className="text-xs font-mono text-muted-foreground">HMAC (Base64)</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="text-xs font-mono break-all cursor-pointer hover:text-primary" onClick={() => {
                  navigator.clipboard.writeText(result.hmacBase64);
                  toast.success('Copied');
                }}>
                  {result.hmacBase64}
                </div>
              </CardContent>
            </Card>
          </div>
          <Card>
            <CardHeader>
              <CardTitle className="text-sm font-mono">Structure Breakdown</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground mb-1">ipad = key ⊕ 0x36</div>
                  <div className="text-xs font-mono break-all">{result.ipad}</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground mb-1">opad = key ⊕ 0x5C</div>
                  <div className="text-xs font-mono break-all">{result.opad}</div>
                </div>
              </div>
              <div className="grid sm:grid-cols-2 gap-3">
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground mb-1">Inner Hash = H(ipad || message)</div>
                  <div className="text-xs font-mono break-all">{result.innerHash}</div>
                </div>
                <div className="p-3 rounded-lg bg-secondary/30">
                  <div className="text-[10px] text-muted-foreground mb-1">Outer Hash = H(opad || inner)</div>
                  <div className="text-xs font-mono break-all">{result.outerHash}</div>
                </div>
              </div>
              <div className="p-3 rounded-lg bg-primary/10 border border-primary/30">
                <div className="text-[10px] text-muted-foreground mb-1">Final HMAC</div>
                <div className="text-xs font-mono">HMAC = Outer Hash</div>
                <div className="text-xs font-mono text-primary mt-1">{result.hmacHex}</div>
              </div>
            </CardContent>
          </Card>
        </motion.div>
      )}
    </div>
  );
}