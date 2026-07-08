import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { Card, CardContent } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { 
  Lock, Network, Shield, CheckCircle, Brain, Eye, X
} from 'lucide-react';
import AESTool from '@/components/analysis/AESTool';
import DiffieHellmanTool from '@/components/analysis/DiffieHellmanTool';
import OneTimePadTool from '@/components/analysis/OneTimePadTool';
import HMACTool from '@/components/analysis/HMACTool';
import KDFDetectionTool from '@/components/analysis/KDFDetectionTool';
import ECCVisualizerTool from '@/components/analysis/ECCVisualizerTool';

const tools = [
  { id: 'aes', name: 'AES Structure Analysis', desc: 'Block cipher visualization', icon: Lock, color: 'text-destructive', component: AESTool },
  { id: 'dh', name: 'Diffie-Hellman', desc: 'Key exchange simulation', icon: Network, color: 'text-chart-1', component: DiffieHellmanTool },
  { id: 'otp', name: 'One-Time Pad', desc: 'Perfect encryption', icon: Shield, color: 'text-chart-2', component: OneTimePadTool },
  { id: 'hmac', name: 'HMAC Tool', desc: 'Message authentication', icon: CheckCircle, color: 'text-chart-3', component: HMACTool },
  { id: 'kdf', name: 'KDF Detection', desc: 'Identify hash formats', icon: Brain, color: 'text-chart-4', component: KDFDetectionTool },
  { id: 'ecc', name: 'ECC Curve Visualizer', desc: 'Elliptic curves', icon: Eye, color: 'text-accent', component: ECCVisualizerTool },
];

export default function AdvancedAnalysis() {
  const [selectedTool, setSelectedTool] = useState(null);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold font-mono tracking-tight">
          <span className="text-chart-4">Advanced</span> Crypto Analysis
        </h1>
        <p className="text-xs text-muted-foreground font-mono mt-1">6 advanced cryptography tools</p>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map((tool) => {
          const Icon = tool.icon;
          return (
            <motion.button
              key={tool.id}
              onClick={() => setSelectedTool(tool.id)}
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              className="flex items-center gap-3 p-4 rounded-lg border border-border bg-card/50 hover:bg-card hover:border-primary/30 transition-all text-left"
            >
              <Icon className={`w-5 h-5 ${tool.color}`} />
              <div>
                <div className="font-semibold text-sm">{tool.name}</div>
                <div className="text-xs text-muted-foreground">{tool.desc}</div>
              </div>
            </motion.button>
          );
        })}
      </div>

      <AnimatePresence>
        {selectedTool && (
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
            onClick={() => setSelectedTool(null)}
          >
            <motion.div
              initial={{ scale: 0.95, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              exit={{ scale: 0.95, opacity: 0 }}
              className="w-full max-w-4xl max-h-[90vh] overflow-y-auto"
              onClick={(e) => e.stopPropagation()}
            >
              <Card className="bg-card border-border">
                <CardContent className="pt-6">
                  <div className="flex items-center justify-between mb-4">
                    <h2 className="text-lg font-semibold font-mono">
                      {tools.find(t => t.id === selectedTool)?.name}
                    </h2>
                    <Button 
                      variant="ghost" 
                      size="icon" 
                      onClick={() => setSelectedTool(null)}
                      className="hover:bg-secondary"
                    >
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                  {(() => {
                    const ToolComponent = tools.find(t => t.id === selectedTool)?.component;
                    return ToolComponent ? <ToolComponent /> : null;
                  })()}
                </CardContent>
              </Card>
            </motion.div>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  );
}