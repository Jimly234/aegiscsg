import { useState } from 'react';
import { Shield, Eye, EyeOff, ChevronRight, AlertTriangle, Users, Cpu } from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAegisStore } from '@/hooks/useAegisStore';
import { useNavigate } from 'react-router-dom';

type DemoRole = { key: 'guardian' | 'commander'; label: string; desc: string; dest: string };

const demoRoles: DemoRole[] = [
  { key: 'guardian', label: 'Guardian', desc: 'Emergency contact — manage assigned alerts, stream audio, coordinate response', dest: '/guardian' },
  { key: 'commander', label: 'Command Officer', desc: 'Security forces — full operations map, dispatch, analytics, activity log', dest: '/command' },
];

export default function LoginPage() {
  const navigate = useNavigate();
  const login = useAegisStore((s) => s.login);
  const [showPwd, setShowPwd] = useState(false);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!email || !password) { setError('Please enter your credentials.'); return; }
    setError('');
    setIsLoading(true);
    setTimeout(() => {
      setIsLoading(false);
      setError('Use a demo account below to explore the system.');
    }, 800);
  };

  const handleDemoLogin = (role: DemoRole) => {
    login(role.key);
    navigate(role.dest);
  };

  return (
    <div className="min-h-screen bg-background flex flex-col">
      {/* Top bar */}
      <header className="border-b border-border bg-card/60 px-4 py-3">
        <button onClick={() => navigate('/')} className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors">
          <Shield className="w-4 h-4 text-primary" />
          <span className="font-semibold tracking-wide text-foreground">AEGIS CSG</span>
          <span className="text-muted-foreground/50">·</span>
          <span>Public Portal</span>
        </button>
      </header>

      <div className="flex-1 flex items-center justify-center p-4">
        <div className="w-full max-w-md">
          {/* Logo */}
          <div className="text-center mb-8">
            <div className="inline-flex w-16 h-16 bg-primary/10 border-2 border-primary/40 rounded-lg items-center justify-center mb-4 glow-amber">
              <Shield className="w-8 h-8 text-primary" />
            </div>
            <h1 className="text-2xl font-bold tracking-tight text-balance">Responder Access</h1>
            <p className="text-sm text-muted-foreground mt-1 text-pretty">
              Authorised personnel only — Civilian Safety Grid
            </p>
          </div>

          {/* Login form */}
          <form onSubmit={handleSubmit} className="bg-card border border-border rounded-lg p-6 space-y-4 mb-4">
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Email / Phone</label>
              <input
                type="text"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="officer@aegis.ng"
                className="w-full px-3 py-2.5 bg-muted border border-border rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 transition-all"
              />
            </div>
            <div>
              <label className="text-xs font-medium text-muted-foreground uppercase tracking-wider block mb-1.5">Password</label>
              <div className="relative">
                <input
                  type={showPwd ? 'text' : 'password'}
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••••"
                  className="w-full px-3 py-2.5 bg-muted border border-border rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-2 focus:ring-primary/50 pr-10 transition-all"
                />
                <button type="button" onClick={() => setShowPwd(!showPwd)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors">
                  {showPwd ? <EyeOff className="w-4 h-4" /> : <Eye className="w-4 h-4" />}
                </button>
              </div>
            </div>

            {error && (
              <div className="flex items-start gap-2 text-xs text-yellow-400 bg-yellow-400/10 border border-yellow-400/20 rounded p-2.5">
                <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{error}
              </div>
            )}

            <button type="submit" disabled={isLoading}
              className="w-full py-2.5 bg-primary text-primary-foreground rounded font-semibold text-sm hover:bg-primary/90 transition-colors disabled:opacity-60 flex items-center justify-center gap-2">
              {isLoading ? (
                <span className="flex items-center gap-2"><span className="w-4 h-4 border-2 border-primary-foreground/30 border-t-primary-foreground rounded-full animate-spin" />Authenticating…</span>
              ) : (
                <span className="flex items-center gap-2">Sign In <ChevronRight className="w-4 h-4" /></span>
              )}
            </button>
          </form>

          {/* Demo role cards */}
          <div className="space-y-2">
            <p className="text-xs text-center text-muted-foreground uppercase tracking-wider mb-3">
              — Demo Access — No credentials required —
            </p>
            {demoRoles.map((role) => (
              <button key={role.key} onClick={() => handleDemoLogin(role)}
                className="w-full bg-card border border-border hover:border-primary/40 rounded-lg p-4 text-left transition-all group hover:bg-muted/30">
                <div className="flex items-start justify-between gap-3">
                  <div className="flex items-start gap-3">
                    <div className={cn('w-8 h-8 rounded flex items-center justify-center shrink-0 mt-0.5', role.key === 'commander' ? 'bg-red-500/15 text-red-400' : 'bg-primary/15 text-primary')}>
                      {role.key === 'commander' ? <Cpu className="w-4 h-4" /> : <Users className="w-4 h-4" />}
                    </div>
                    <div>
                      <div className="text-sm font-semibold">{role.label}</div>
                      <div className="text-xs text-muted-foreground mt-0.5 text-pretty">{role.desc}</div>
                    </div>
                  </div>
                  <ChevronRight className="w-4 h-4 text-muted-foreground group-hover:text-foreground shrink-0 mt-1 transition-colors" />
                </div>
              </button>
            ))}
          </div>

          <p className="text-center text-xs text-muted-foreground mt-6">
            Unauthorised access is a criminal offence under the Cybercrime Act 2015 (Nigeria)
          </p>
        </div>
      </div>
    </div>
  );
}
