import React from "react";
import { Link } from "react-router-dom";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { Shield, Lock, Key, Code, ChevronRight, MessageCircle, Atom } from "lucide-react";
import CrypticBackground from "@/components/CrypticBackground";

export default function Landing() {
  return (
    <div className="min-h-screen relative overflow-hidden">
      <CrypticBackground />
      
      {/* Navigation */}
      <nav className="relative z-10 flex items-center justify-between px-6 py-4">
        <motion.div 
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-3"
        >
          <div className="w-10 h-10 rounded-xl bg-primary/10 border border-primary/30 flex items-center justify-center backdrop-blur-sm">
            <img 
              src="https://media.base44.com/images/public/6a19d09b0f19eac407544a92/4917590fb_generated_image.png" 
              alt="CipherForge Logo"
              className="w-8 h-8 object-contain"
            />
          </div>
          <span className="text-xl font-bold font-mono text-primary glow-text">CipherForge</span>
        </motion.div>
        
        <motion.div 
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          className="flex items-center gap-4"
        >
          <a
            href="https://discord.com/users/z33hax"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-primary transition-colors"
          >
            <MessageCircle className="w-4 h-4" />
            <span className="hidden sm:inline">z33hax</span>
          </a>
          <Link to="/login">
            <Button variant="ghost" className="text-sm">Log In</Button>
          </Link>
          <Link to="/register">
            <Button className="text-sm">Get Started</Button>
          </Link>
        </motion.div>
      </nav>

      {/* Hero Section */}
      <main className="relative z-10 flex flex-col items-center justify-center min-h-[calc(100vh-80px)] px-6 text-center">
        <motion.div
          initial={{ opacity: 0, y: 30 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8 }}
          className="max-w-4xl mx-auto"
        >
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full bg-primary/10 border border-primary/30 mb-6 backdrop-blur-sm">
            <Shield className="w-4 h-4 text-primary" />
            <span className="text-sm font-mono text-primary">Advanced Cryptographic Toolkit</span>
          </div>
          
          <h1 className="text-5xl sm:text-6xl md:text-7xl font-bold mb-6 tracking-tight">
            <span className="text-foreground">Master the Art of</span>
            <br />
            <span className="text-primary glow-text font-mono">Cryptography</span>
          </h1>
          
          <p className="text-lg sm:text-xl text-muted-foreground mb-10 max-w-2xl mx-auto leading-relaxed">
            Explore quantum encryption, crack hashes, analyze ciphers, and conquer CTF challenges 
            with professional-grade cryptanalysis tools.
          </p>
          
          <div className="flex flex-col sm:flex-row gap-4 justify-center items-center">
            <Link to="/register">
              <Button size="lg" className="h-14 px-8 text-base font-medium group">
                Access Toolkit
                <ChevronRight className="w-5 h-5 ml-2 group-hover:translate-x-1 transition-transform" />
              </Button>
            </Link>
            <Link to="/toolkit">
              <Button size="lg" variant="outline" className="h-14 px-8 text-base font-medium">
                Explore Toolkit
              </Button>
            </Link>
          </div>
        </motion.div>

        {/* Feature Cards */}
        <motion.div
          initial={{ opacity: 0, y: 50 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.8, delay: 0.3 }}
          className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mt-20 max-w-6xl mx-auto"
        >
          {[
            { icon: Lock, title: "Encryption", desc: "AES, RSA, ECC & more" },
            { icon: Key, title: "Hash Cracking", desc: "MD5, SHA-1, SHA-256" },
            { icon: Atom, title: "Quantum Crypto", desc: "BB84, QRNG, Lattice" },
            { icon: Shield, title: "Analysis", desc: "Frequency & entropy" }
          ].map((feature, i) => (
            <motion.div
              key={i}
              whileHover={{ scale: 1.05, y: -5 }}
              className="p-6 rounded-2xl bg-card/50 backdrop-blur-xl border border-border/50 hover:border-primary/50 transition-all"
            >
              <feature.icon className="w-10 h-10 text-primary mb-4" />
              <h3 className="text-lg font-semibold mb-2">{feature.title}</h3>
              <p className="text-sm text-muted-foreground">{feature.desc}</p>
            </motion.div>
          ))}
        </motion.div>

        {/* Footer */}
        <motion.footer
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ duration: 0.8, delay: 0.6 }}
          className="mt-20 text-center"
        >
          <div className="space-y-2 text-center">
            <div className="flex items-center justify-center gap-2 text-sm text-muted-foreground">
              <span>Dev by</span>
              <a
                href="https://discord.com/users/z33hax"
                target="_blank"
                rel="noopener noreferrer"
                className="text-primary font-semibold hover:underline flex items-center gap-1"
              >
                <MessageCircle className="w-3 h-3" />
                zeehaX
              </a>
            </div>
            <p className="text-xs text-muted-foreground/60 max-w-md mx-auto">
              Advanced cryptographic toolkit for security researchers, CTF players, and quantum cryptography enthusiasts.
            </p>
            <p className="text-xs text-muted-foreground/50 font-mono">
              2026 © CipherForge
            </p>
          </div>
        </motion.footer>
      </main>
    </div>
  );
}