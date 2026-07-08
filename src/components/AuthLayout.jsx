import React from "react";
import CrypticBackground from "@/components/CrypticBackground";

export default function AuthLayout({ icon: Icon, title, subtitle, footer, children }) {
  return (
    <div className="min-h-screen flex items-center justify-center bg-background px-4 relative overflow-hidden">
      <CrypticBackground />
      <div className="w-full max-w-md relative z-10">
        <div className="text-center mb-10">
          <div className="inline-flex items-center justify-center w-20 h-20 rounded-2xl bg-primary/10 border border-primary/30 mb-4 backdrop-blur-sm glow-green">
            <img 
              src="https://media.base44.com/images/public/6a19d09b0f19eac407544a92/4917590fb_generated_image.png" 
              alt="CipherForge Logo"
              className="w-16 h-16 object-contain"
            />
          </div>
          <h1 className="text-3xl font-bold tracking-tight text-foreground font-mono">
            <span className="text-primary glow-text">{title}</span>
          </h1>
          {subtitle && <p className="text-muted-foreground mt-2 font-mono text-sm">{subtitle}</p>}
        </div>
        <div className="bg-card/80 backdrop-blur-xl rounded-2xl shadow-sm border border-border/50 p-8">
          {children}
        </div>
        {footer && (
          <p className="text-center text-sm text-muted-foreground mt-6 font-mono">{footer}</p>
        )}
      </div>
    </div>
  );
}