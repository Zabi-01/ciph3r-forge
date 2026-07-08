import { useState } from 'react';
import { Copy, Check } from 'lucide-react';
import { Button } from '@/components/ui/button';

export default function OutputDisplay({ label, value, mono = true }) {
  const [copied, setCopied] = useState(false);

  const handleCopy = () => {
    navigator.clipboard.writeText(value);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="space-y-2">
      <div className="flex items-center justify-between">
        <span className="text-xs font-mono text-muted-foreground uppercase tracking-wider">{label}</span>
        <Button
          variant="ghost"
          size="sm"
          onClick={handleCopy}
          className="h-7 px-2 text-xs font-mono text-muted-foreground hover:text-primary"
        >
          {copied ? <Check className="w-3 h-3 mr-1" /> : <Copy className="w-3 h-3 mr-1" />}
          {copied ? 'Copied' : 'Copy'}
        </Button>
      </div>
      <div className={`p-4 rounded-lg bg-background/80 border border-border/50 min-h-[80px] ${mono ? 'font-mono' : ''} text-sm break-all whitespace-pre-wrap text-foreground`}>
        {value || <span className="text-muted-foreground italic">No output yet...</span>}
      </div>
    </div>
  );
}