import { Link } from 'react-router-dom';
import { Shield, Wand2, Scan, Fingerprint, Trophy, Cpu, ArrowRight, Zap, Lock, Binary, Key, Network, Bomb, Brain } from 'lucide-react';
import { motion } from 'framer-motion';

const tools = [
  { path: '/toolkit', label: 'Cipher Toolkit', desc: '25+ classical & modern ciphers', icon: Shield, color: 'text-primary' },
  { path: '/pipeline', label: 'Pipeline Builder', desc: 'Chain transformations visually', icon: Wand2, color: 'text-accent' },
  { path: '/analysis', label: 'Crypto Analysis', desc: 'Frequency, entropy & detection', icon: Scan, color: 'text-chart-4' },
  { path: '/hashing', label: 'Hash Functions', desc: 'MD5, SHA-1, SHA-256, SHA-512', icon: Fingerprint, color: 'text-chart-3' },
  { path: '/advanced-analysis', label: 'Advanced Analysis', desc: '12 crypto analysis tools', icon: Brain, color: 'text-chart-4' },
  { path: '/ai-assistant', label: 'AI Assistant', desc: 'AI-powered cipher intelligence', icon: Cpu, color: 'text-chart-2' },
  { path: '/rsa-tool', label: 'RSA CTF Tool', desc: 'Attack weak RSA keys', icon: Key, color: 'text-destructive' },
  { path: '/rsa-visualizer', label: 'RSA Visualizer', desc: 'Key generation visualization', icon: Network, color: 'text-chart-1' },
  { path: '/rsa-toolkit', label: 'RSA Attack Toolkit', desc: 'Wiener, small e & factorization', icon: Bomb, color: 'text-destructive' },
];

const stats = [
  { label: 'Ciphers', value: '25+', icon: Lock },
  { label: 'Encodings', value: '12+', icon: Binary },
  { label: 'Hash Algos', value: '4', icon: Fingerprint },
  { label: 'RSA Tools', value: '3', icon: Key },
];

const container = { hidden: {}, show: { transition: { staggerChildren: 0.06 } } };
const item = { hidden: { opacity: 0, y: 20 }, show: { opacity: 1, y: 0 } };

export default function Dashboard() {
  return (
    <div className="space-y-8">
      {/* Hero */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="relative overflow-hidden rounded-2xl border border-border/50 bg-card/50 p-8 lg:p-12"
      >
        <div className="absolute inset-0 bg-gradient-to-br from-primary/10 via-primary/5 to-accent/10" />
        <div className="absolute top-0 right-0 w-96 h-96 bg-primary/20 rounded-full blur-3xl" />
        <div className="absolute bottom-0 left-0 w-96 h-96 bg-accent/20 rounded-full blur-3xl" />
        <motion.div 
          className="absolute top-4 right-4 opacity-10"
          animate={{ rotate: 360 }}
          transition={{ duration: 60, repeat: Infinity, ease: "linear" }}
        >
          <Shield className="w-40 h-40 text-primary" />
        </motion.div>
        <div className="relative z-10">
          <motion.div 
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.2 }}
            className="inline-flex items-center gap-2 px-3 py-1 rounded-full border border-primary/30 bg-primary/10 text-primary text-xs font-mono mb-4"
          >
            <Zap className="w-3 h-3" />
            FULL CRYPTO TOOLKIT
          </motion.div>
          <h1 className="text-3xl lg:text-5xl font-bold tracking-tight mb-3">
            <span className="text-primary glow-text">Cipher</span>
            <span className="text-foreground">Forge</span>
            <span className="text-accent glow-text-cyan"> AI</span>
          </h1>
          <p className="text-muted-foreground max-w-lg text-sm lg:text-base leading-relaxed">
            Professional-grade cryptography toolkit for CTF competitions, 
            security research, and cryptanalysis education.
          </p>
        </div>
      </motion.div>

      {/* Stats */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid grid-cols-2 lg:grid-cols-4 gap-3">
        {stats.map(s => (
          <motion.div
            key={s.label}
            variants={item}
            whileHover={{ scale: 1.05, y: -2 }}
            className="rounded-xl border border-border/50 bg-card/30 p-4 text-center relative overflow-hidden group"
          >
            <div className="absolute inset-0 bg-gradient-to-br from-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity" />
            <s.icon className="w-5 h-5 text-primary mx-auto mb-2 opacity-60 group-hover:opacity-100 group-hover:scale-110 transition-all duration-300" />
            <div className="text-2xl font-bold font-mono text-primary">{s.value}</div>
            <div className="text-xs text-muted-foreground font-mono">{s.label}</div>
          </motion.div>
        ))}
      </motion.div>

      {/* Tool Grid */}
      <motion.div variants={container} initial="hidden" animate="show" className="grid sm:grid-cols-2 lg:grid-cols-3 gap-4">
        {tools.map(tool => (
          <motion.div key={tool.path} variants={item}>
            <Link
              to={tool.path}
              className="group block rounded-xl border border-border/50 bg-card/30 p-6 hover:bg-card/60 hover:border-primary/30 transition-all duration-300 relative overflow-hidden"
            >
              <div className="absolute inset-0 bg-gradient-to-br from-transparent via-primary/5 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <motion.div
                whileHover={{ scale: 1.1, rotate: 5 }}
                className="absolute -right-4 -top-4 w-24 h-24 bg-primary/10 rounded-full blur-2xl opacity-0 group-hover:opacity-100 transition-opacity"
              />
              <div className="relative z-10">
                <div className="flex items-start justify-between mb-4">
                  <div className={`p-2.5 rounded-lg bg-secondary/50 ${tool.color} group-hover:scale-110 transition-transform duration-300`}>
                    <tool.icon className="w-5 h-5" />
                  </div>
                  <ArrowRight className="w-4 h-4 text-muted-foreground opacity-0 group-hover:opacity-100 group-hover:translate-x-1 transition-all" />
                </div>
                <h3 className="font-semibold text-sm mb-1 group-hover:text-primary transition-colors">{tool.label}</h3>
                <p className="text-xs text-muted-foreground">{tool.desc}</p>
              </div>
            </Link>
          </motion.div>
        ))}
      </motion.div>
    </div>
  );
}