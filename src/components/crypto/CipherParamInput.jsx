import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';

export default function CipherParamInput({ param, value, onChange }) {
  return (
    <div className="space-y-1.5">
      <Label className="text-xs font-mono text-muted-foreground">{param.label}</Label>
      <Input
        type={param.type === 'number' ? 'number' : 'text'}
        value={value ?? param.default}
        onChange={(e) => onChange(param.name, param.type === 'number' ? parseInt(e.target.value) || 0 : e.target.value)}
        min={param.min}
        max={param.max}
        className="h-9 font-mono text-sm bg-secondary/50 border-border/50 focus:border-primary/50"
        placeholder={String(param.default)}
      />
    </div>
  );
}