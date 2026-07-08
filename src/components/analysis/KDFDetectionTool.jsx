import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Brain, AlertTriangle, CheckCircle } from 'lucide-react';
import { motion } from 'framer-motion';

export default function KDFDetectionTool() {
  const [hashString, setHashString] = useState('');
  const [result, setResult] = useState(null);

  const detectKDF = (input) => {
    const trimmed = input.trim();
    
    // bcrypt: $2a$, $2b$, $2y$ followed by cost$hash
    const bcryptMatch = trimmed.match(/^\$2[aby]\$(\d{2})\$(.{53})$/);
    if (bcryptMatch) {
      return {
        format: 'bcrypt',
        confidence: 95,
        algorithm: 'bcrypt',
        version: bcryptMatch[0].substring(1, 4),
        cost: parseInt(bcryptMatch[1]),
        salt: bcryptMatch[2].substring(0, 22),
        hash: bcryptMatch[2].substring(22),
        security: parseInt(bcryptMatch[1]) >= 12 ? 'strong' : parseInt(bcryptMatch[1]) >= 10 ? 'acceptable' : 'weak',
        recommendation: parseInt(bcryptMatch[1]) < 12 ? 'Increase cost to at least 12' : 'Good configuration'
      };
    }

    // argon2: $argon2id$v=19$m=65536,t=3,p=4$salt$hash
    const argon2Match = trimmed.match(/^\$argon2(id|d|i)\$v=(\d+)\$m=(\d+),t=(\d+),p=(\d+)\$(.+)\$(.+)$/);
    if (argon2Match) {
      return {
        format: 'argon2',
        confidence: 95,
        algorithm: `argon2${argon2Match[1]}`,
        version: argon2Match[2],
        memory: parseInt(argon2Match[3]),
        iterations: parseInt(argon2Match[4]),
        parallelism: parseInt(argon2Match[5]),
        salt: argon2Match[6],
        hash: argon2Match[7],
        security: parseInt(argon2Match[3]) >= 65536 && parseInt(argon2Match[4]) >= 3 ? 'strong' : 'acceptable',
        recommendation: 'Good modern KDF for password hashing'
      };
    }

    // scrypt: $s8$ or similar
    const scryptMatch = trimmed.match(/^\$s\d+\$(\d+)\$(.{16,})\$(.+)$/);
    if (scryptMatch) {
      return {
        format: 'scrypt',
        confidence: 90,
        algorithm: 'scrypt',
        cost: parseInt(scryptMatch[1]),
        salt: scryptMatch[2],
        hash: scryptMatch[3],
        security: 'acceptable',
        recommendation: 'Good memory-hard KDF'
      };
    }

    // PBKDF2: usually stored as algorithm:iterations:salt:hash
    const pbkdf2Match = trimmed.match(/^(sha\d+|md5):(\d+):(.+):(.+)$/i);
    if (pbkdf2Match) {
      return {
        format: 'pbkdf2',
        confidence: 85,
        algorithm: pbkdf2Match[1].toUpperCase(),
        iterations: parseInt(pbkdf2Match[2]),
        salt: pbkdf2Match[3],
        hash: pbkdf2Match[4],
        security: parseInt(pbkdf2Match[2]) >= 100000 ? 'strong' : parseInt(pbkdf2Match[2]) >= 10000 ? 'acceptable' : 'weak',
        recommendation: parseInt(pbkdf2Match[2]) < 100000 ? 'Increase iterations to at least 100,000' : 'Good configuration'
      };
    }

    // Plain hash detection
    if (/^[a-f0-9]{32}$/i.test(trimmed)) {
      return {
        format: 'MD5',
        confidence: 90,
        algorithm: 'MD5',
        hash: trimmed,
        security: 'weak',
        recommendation: 'MD5 is cryptographically broken. Use bcrypt, argon2, or PBKDF2'
      };
    }
    if (/^[a-f0-9]{40}$/i.test(trimmed)) {
      return {
        format: 'SHA-1',
        confidence: 90,
        algorithm: 'SHA-1',
        hash: trimmed,
        security: 'weak',
        recommendation: 'SHA-1 is deprecated. Use bcrypt, argon2, or PBKDF2'
      };
    }
    if (/^[a-f0-9]{64}$/i.test(trimmed)) {
      return {
        format: 'SHA-256',
        confidence: 90,
        algorithm: 'SHA-256',
        hash: trimmed,
        security: 'weak',
        recommendation: 'Plain SHA-256 is not suitable for passwords. Use bcrypt, argon2, or PBKDF2'
      };
    }
    if (/^[a-f0-9]{128}$/i.test(trimmed)) {
      return {
        format: 'SHA-512',
        confidence: 90,
        algorithm: 'SHA-512',
        hash: trimmed,
        security: 'weak',
        recommendation: 'Plain SHA-512 is not suitable for passwords. Use bcrypt, argon2, or PBKDF2'
      };
    }

    return null;
  };

  const analyze = () => {
    if (!hashString) return;
    const detected = detectKDF(hashString);
    setResult(detected || { error: 'Unknown format' });
  };

  return (
    <div className="space-y-4">
      <div>
        <label className="text-xs text-muted-foreground">Hash String</label>
        <Input
          placeholder="Paste hash to detect format (e.g., $2a$12$..., $argon2id$..., sha256:10000:salt:hash)"
          value={hashString}
          onChange={(e) => setHashString(e.target.value)}
          className="font-mono"
        />
      </div>
      <Button onClick={analyze} className="w-full">
        <Brain className="w-4 h-4 mr-2" /> Detect KDF Format
      </Button>
      {result && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {result.error ? (
            <Card className="border-muted/50">
              <CardContent className="pt-6">
                <div className="text-center text-muted-foreground">
                  {result.error} - Could not detect format
                </div>
              </CardContent>
            </Card>
          ) : (
            <>
              <div className="grid sm:grid-cols-3 gap-3">
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground">Detected Format</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-mono font-bold text-primary">{result.format}</div>
                    <div className="text-[10px] text-muted-foreground">Confidence: {result.confidence}%</div>
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground">Algorithm</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="text-xl font-mono font-bold text-chart-4">{result.algorithm}</div>
                    {result.version && <div className="text-[10px] text-muted-foreground">v{result.version}</div>}
                  </CardContent>
                </Card>
                <Card>
                  <CardHeader className="pb-2">
                    <CardTitle className="text-xs font-mono text-muted-foreground">Security Verdict</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className={`text-xl font-mono font-bold ${
                      result.security === 'strong' ? 'text-green-400' :
                      result.security === 'acceptable' ? 'text-yellow-400' : 'text-destructive'
                    }`}>{result.security.toUpperCase()}</div>
                  </CardContent>
                </Card>
              </div>
              {result.cost && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-mono">Parameters</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="grid sm:grid-cols-3 gap-3">
                      {result.cost && (
                        <div>
                          <div className="text-[10px] text-muted-foreground">Cost Factor</div>
                          <div className="text-lg font-mono font-bold">{result.cost}</div>
                        </div>
                      )}
                      {result.iterations && (
                        <div>
                          <div className="text-[10px] text-muted-foreground">Iterations</div>
                          <div className="text-lg font-mono font-bold">{result.iterations.toLocaleString()}</div>
                        </div>
                      )}
                      {result.memory && (
                        <div>
                          <div className="text-[10px] text-muted-foreground">Memory (KB)</div>
                          <div className="text-lg font-mono font-bold">{result.memory.toLocaleString()}</div>
                        </div>
                      )}
                      {result.parallelism && (
                        <div>
                          <div className="text-[10px] text-muted-foreground">Parallelism</div>
                          <div className="text-lg font-mono font-bold">{result.parallelism}</div>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              {(result.salt || result.hash) && (
                <Card>
                  <CardHeader>
                    <CardTitle className="text-sm font-mono">Parsed Fields</CardTitle>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-2">
                      {result.salt && (
                        <div className="text-xs font-mono">
                          <span className="text-muted-foreground">Salt: </span>
                          <span className="text-primary">{result.salt}</span>
                        </div>
                      )}
                      {result.hash && (
                        <div className="text-xs font-mono">
                          <span className="text-muted-foreground">Hash: </span>
                          <span className="text-accent">{result.hash}</span>
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )}
              <Card className={result.security === 'weak' ? 'border-destructive/50' : 'border-green-500/50'}>
                <CardHeader>
                  <CardTitle className="text-sm font-mono flex items-center gap-2">
                    {result.security === 'weak' ? <AlertTriangle className="w-4 h-4 text-destructive" /> : <CheckCircle className="w-4 h-4 text-green-400" />}
                    Recommendation
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="text-sm">{result.recommendation}</div>
                </CardContent>
              </Card>
            </>
          )}
        </motion.div>
      )}
    </div>
  );
}