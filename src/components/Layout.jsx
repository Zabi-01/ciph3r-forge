import { Outlet, Link, useLocation, useNavigate } from 'react-router-dom';
import { Shield, Binary, Fingerprint, Cpu, Wand2, Trophy, Scan, FlaskConical, Home, Key, Lock, Brain, Bot, ShieldCheck, Atom, LogOut } from 'lucide-react';
import { base44 } from '@/api/base44Client';
import { cn } from '@/lib/utils';
import { useState, useEffect } from 'react';
import { motion } from 'framer-motion';
import React from 'react';
import FloatingChat from '@/components/chat/FloatingChat';
import { usePageVisitLogger } from '@/hooks/usePageVisitLogger';

const navItems = [
  { path: '/dashboard', label: 'Dashboard', icon: Home },
  { path: '/toolkit', label: 'Cipher Toolkit', icon: Shield },
  { path: '/pipeline', label: 'Pipeline', icon: Wand2 },
  { path: '/analysis', label: 'Crypto Analysis', icon: Scan },
  { path: '/hashing', label: 'Hashing', icon: Fingerprint },
  { path: '/advanced-analysis', label: 'Advanced Analysis', icon: Brain },
  { path: '/quantum-crypto', label: 'Quantum Crypto', icon: Atom },
  { path: '/rsa-tool', label: 'RSA CTF Tool', icon: Key },
  { path: '/rsa-visualizer', label: 'RSA Visualizer', icon: Lock },
  { path: '/rsa-toolkit', label: 'RSA Attack Toolkit', icon: Shield },
];

const adminNavItems = [
  { path: '/admin', label: 'Admin Panel', icon: ShieldCheck },
];

export default function Layout() {
  const location = useLocation();
  const navigate = useNavigate();
  const [mobileOpen, setMobileOpen] = useState(false);
  const [isAdmin, setIsAdmin] = useState(null);

  // Log page visits
  usePageVisitLogger();

  React.useEffect(() => {
    const checkAdmin = async () => {
      const user = await base44.auth.me();
      setIsAdmin(user?.role === 'admin');
    };
    checkAdmin();
  }, []);

  return (
    <div className="min-h-screen bg-background grid-bg relative flex">
      {/* Sidebar */}
      <aside className="fixed left-0 top-0 bottom-0 w-64 border-r border-border/50 bg-background/80 backdrop-blur-xl z-50 hidden lg:flex flex-col">
        {/* Logo */}
        <div className="p-6 border-b border-border/50">
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-10 h-10 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-green">
              <Shield className="w-5 h-5 text-primary" />
            </div>
            <div>
              <span className="font-mono font-bold text-base tracking-wider text-primary glow-text block">
                CIPHERFORGE
              </span>
              <span className="font-mono text-xs text-accent block">AI</span>
            </div>
          </Link>
        </div>

        {/* Navigation */}
        <nav className="flex-1 p-4 space-y-1 overflow-y-auto">
          {navItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-all",
                  active
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
          {isAdmin && adminNavItems.map(item => {
            const Icon = item.icon;
            const active = location.pathname === item.path;
            return (
              <Link
                key={item.path}
                to={item.path}
                className={cn(
                  "flex items-center gap-3 px-3 py-2.5 rounded-lg text-sm font-mono transition-all",
                  active
                    ? "bg-primary/10 text-primary border border-primary/30"
                    : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                )}
              >
                <Icon className="w-4 h-4" />
                {item.label}
              </Link>
            );
          })}
        </nav>

        {/* Status & Logout */}
        <div className="p-4 border-t border-border/50 space-y-2">
          <div className="flex items-center gap-2 text-xs font-mono text-muted-foreground">
            <div className="h-2 w-2 rounded-full bg-primary animate-pulse" />
            SYSTEM ONLINE
          </div>
          <button
            onClick={async () => {
              await base44.auth.logout();
              window.location.href = "/";
            }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm font-mono text-muted-foreground hover:text-foreground hover:bg-secondary transition-all"
          >
            <LogOut className="w-4 h-4" />
            Log Out
          </button>
        </div>
      </aside>

      {/* Mobile header */}
      <header className="fixed top-0 left-0 right-0 z-50 border-b border-border/50 bg-background/80 backdrop-blur-xl lg:hidden">
        <div className="flex items-center justify-between h-14 px-4">
          <button
            className="p-1.5 rounded-lg hover:bg-secondary transition-colors"
            onClick={() => setMobileOpen(!mobileOpen)}
          >
            <div className="w-5 h-4 flex flex-col justify-between">
              <span className={cn("block h-0.5 w-5 bg-primary transition-all", mobileOpen && "rotate-45 translate-y-1.5")} />
              <span className={cn("block h-0.5 w-5 bg-primary transition-all", mobileOpen && "opacity-0")} />
              <span className={cn("block h-0.5 w-5 bg-primary transition-all", mobileOpen && "-rotate-45 -translate-y-1.5")} />
            </div>
          </button>
          <Link to="/dashboard" className="flex items-center gap-2.5">
            <div className="w-8 h-8 rounded-lg bg-primary/10 border border-primary/30 flex items-center justify-center glow-green">
              <Shield className="w-4 h-4 text-primary" />
            </div>
            <span className="font-mono font-bold text-sm tracking-wider text-primary glow-text">
              CIPHERFORGE<span className="text-accent">_AI</span>
            </span>
          </Link>
          <div className="w-6" />
        </div>
      </header>

      {/* Mobile nav overlay */}
      {mobileOpen && (
        <div className="fixed inset-0 z-40 lg:hidden">
          <div className="absolute inset-0 bg-black/60" onClick={() => setMobileOpen(false)} />
          <nav className="absolute top-14 left-0 right-0 bg-background border-b border-border p-4 space-y-1 max-h-[80vh] overflow-y-auto">
            {navItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-mono transition-all",
                    active
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
            {isAdmin && adminNavItems.map(item => {
              const Icon = item.icon;
              const active = location.pathname === item.path;
              return (
                <Link
                  key={item.path}
                  to={item.path}
                  onClick={() => setMobileOpen(false)}
                  className={cn(
                    "flex items-center gap-3 px-4 py-2.5 rounded-lg text-sm font-mono transition-all",
                    active
                      ? "bg-primary/10 text-primary border border-primary/30"
                      : "text-muted-foreground hover:text-foreground hover:bg-secondary"
                  )}
                >
                  <Icon className="w-4 h-4" />
                  {item.label}
                </Link>
              );
            })}
          </nav>
        </div>
      )}

      {/* Main content */}
      <main className="lg:ml-64 pt-14 min-h-screen">
        <div className="p-4 lg:p-6 max-w-7xl mx-auto">
          <Outlet />
        </div>
      </main>

      {/* Floating AI Chat - Global overlay */}
      <FloatingChat />
    </div>
  );
}