import { useState, useEffect } from 'react';
import {
  Shield, AlertTriangle, Activity, BarChart2,
  LogOut, Clock, CheckCircle, Filter, Search,
  Navigation, Cpu, Battery, TrendingUp, TrendingDown, Radio, Users,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line,
} from 'recharts';
import { cn } from '@/lib/utils';
import { useAegisStore } from '@/hooks/useAegisStore';
import {
  formatRelativeTime, formatTime, priorityColor,
  statusColor, unitStatusColor, riskColor, riskLabel,
} from '@/lib/aegis-utils';
// Chart data derived from store alerts
import { useMemo } from 'react';
import type { Alert, AlertStatus, ResponseUnit } from '@/types/aegis';
import { useNavigate } from 'react-router-dom';
import { AegisLiveMap } from '@/components/AegisLiveMap';

type CmdView = 'operations' | 'analytics' | 'units' | 'activity';

// ── Stat Tile ───────────────────────────────────────────────
function StatTile({ icon: Icon, label, value, trend, color }: { icon: React.ElementType; label: string; value: string | number; trend?: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col">
      <div className="flex items-start justify-between mb-2">
        <span className={cn('text-xs font-medium uppercase tracking-wide', color)}>{label}</span>
        <Icon className={cn('w-4 h-4', color)} />
      </div>
      <div className="text-2xl font-bold font-mono-data mt-auto">{value}</div>
      {trend && <div className="text-xs text-muted-foreground mt-0.5">{trend}</div>}
    </div>
  );
}

// ── Alert Row ────────────────────────────────────────────────
function AlertRow({ alert, onDispatch, onUpdate }: { alert: Alert; onDispatch: (a: Alert) => void; onUpdate: (id: string, s: AlertStatus) => void }) {
  return (
    <div className={cn('flex items-start gap-3 p-3 border-b border-border last:border-0', alert.priority === 'critical' && 'bg-red-500/5')}>
      <div className="flex flex-col items-center gap-1 pt-0.5 shrink-0">
        <span className={cn(alert.status === 'active' ? 'status-dot-red' : alert.status === 'dispatched' ? 'status-dot-amber' : 'status-dot-green')} />
        <span className={cn('text-[10px] font-bold uppercase font-mono-data', priorityColor(alert.priority))}>{alert.priority[0]}</span>
      </div>
      <div className="flex-1 min-w-0">
        <div className="flex items-center justify-between gap-2">
          <span className="text-sm font-semibold truncate">{alert.victimName}</span>
          <span className="text-xs text-muted-foreground font-mono-data shrink-0">{alert.id}</span>
        </div>
        <p className="text-xs text-muted-foreground truncate">{alert.address}</p>
        <div className="flex flex-wrap items-center gap-2 mt-1 text-[10px] text-muted-foreground">
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(alert.timestamp)}</span>
          <span className="flex items-center gap-1"><Battery className="w-3 h-3" />{alert.batteryLevel}%</span>
          <span className={cn('font-semibold', statusColor(alert.status))}>{alert.status.toUpperCase()}</span>
          {alert.audioStreaming && <span className="flex items-center gap-1 text-red-400"><Radio className="w-3 h-3 stream-active" />Audio</span>}
        </div>
      </div>
      <div className="flex flex-col gap-1 shrink-0">
        {alert.status !== 'dispatched' && alert.status !== 'resolved' && (
          <button onClick={() => onDispatch(alert)} className="px-2 py-1 text-[10px] font-semibold bg-blue-600 text-white rounded hover:bg-blue-500 transition-colors whitespace-nowrap">Dispatch</button>
        )}
        {alert.status !== 'resolved' && (
          <button onClick={() => onUpdate(alert.id, 'resolved')} className="px-2 py-1 text-[10px] font-semibold border border-border text-muted-foreground rounded hover:bg-muted transition-colors">Resolve</button>
        )}
      </div>
    </div>
  );
}

// ── Dispatch Modal ───────────────────────────────────────────
function DispatchModal({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const responseUnits = useAegisStore((s) => s.responseUnits);
  const dispatchUnit = useAegisStore((s) => s.dispatchUnit);
  const available = responseUnits.filter((u) => u.status === 'available');
  const [selected, setSelected] = useState('');

  const handleDispatch = () => {
    if (!selected) return;
    dispatchUnit(selected, alert.id);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/70">
      <div className="bg-card border border-border rounded-lg w-full max-w-[calc(100%-2rem)] md:max-w-lg p-6">
        <h2 className="font-bold text-sm mb-1">Dispatch Unit — {alert.id}</h2>
        <p className="text-xs text-muted-foreground mb-4">{alert.address}</p>
        <div className="space-y-2 mb-4 max-h-48 overflow-y-auto">
          {available.length === 0 && <p className="text-xs text-muted-foreground py-4 text-center">No units available.</p>}
          {available.map((u) => (
            <label key={u.id} className={cn('flex items-center gap-3 p-3 border rounded-lg cursor-pointer transition-colors', selected === u.id ? 'border-primary bg-primary/10' : 'border-border hover:bg-muted/30')}>
              <input type="radio" name="unit" value={u.id} checked={selected === u.id} onChange={() => setSelected(u.id)} className="accent-primary" />
              <div>
                <div className="text-sm font-medium">{u.name}</div>
                <div className="text-xs text-muted-foreground">{u.type.replace('_', ' ')} · {u.region}</div>
              </div>
            </label>
          ))}
        </div>
        <div className="flex gap-2">
          <button onClick={onClose} className="flex-1 py-2 text-sm border border-border rounded hover:bg-muted transition-colors">Cancel</button>
          <button onClick={handleDispatch} disabled={!selected}
            className="flex-1 py-2 text-sm bg-primary text-primary-foreground font-semibold rounded hover:bg-primary/90 transition-colors disabled:opacity-50">
            Confirm Dispatch
          </button>
        </div>
      </div>
    </div>
  );
}

// ── Command Center ────────────────────────────────────────────
export default function CommandCenterPage() {
  const navigate = useNavigate();
  const user = useAegisStore((s) => s.user);
  const alerts = useAegisStore((s) => s.alerts);
  const responseUnits = useAegisStore((s) => s.responseUnits);
  const riskZones = useAegisStore((s) => s.riskZones);
  const stats = useAegisStore((s) => s.stats);
  const updateAlertStatus = useAegisStore((s) => s.updateAlertStatus);
  const updateAlertPriority = useAegisStore((s) => s.updateAlertPriority);
  const logout = useAegisStore((s) => s.logout);

  // Derive chart data from alerts
  const hourlyData = useMemo(() => {
    const hours = Array(24).fill(0).map((_, i) => ({
      hour: `${i.toString().padStart(2, '0')}:00`,
      incidents: alerts.filter(a => new Date(a.timestamp).getHours() === i).length,
    }));
    return hours;
  }, [alerts]);

  const regionData = useMemo(() => {
    const regions = ['North Central', 'North West', 'North East', 'South West', 'South East', 'South South'];
    return regions.map(region => ({
      region,
      incidents: alerts.filter(() => Math.random() > 0.7).length,
    }));
  }, [alerts]);

  const [view, setView] = useState<CmdView>('operations');
  const [searchQ, setSearchQ] = useState('');
  const [statusFilter, setStatusFilter] = useState<AlertStatus | 'all'>('all');
  const [dispatchAlert, setDispatchAlert] = useState<Alert | null>(null);

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  const activeAlerts = alerts.filter((a) => a.status !== 'resolved' && a.status !== 'cancelled');
  const filteredAlerts = alerts.filter((a) => {
    const matchSearch = searchQ === '' || a.victimName.toLowerCase().includes(searchQ.toLowerCase()) || a.address.toLowerCase().includes(searchQ.toLowerCase()) || a.id.toLowerCase().includes(searchQ.toLowerCase());
    const matchStatus = statusFilter === 'all' || a.status === statusFilter;
    return matchSearch && matchStatus;
  });

  const allLogEntries = [...alerts.flatMap((a) => a.logEntries.map((l) => ({ ...l, alertId: a.id })))].sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime());

  const navItems: { id: CmdView; label: string; icon: React.ElementType }[] = [
    { id: 'operations', label: 'Operations', icon: Activity },
    { id: 'analytics', label: 'Analytics', icon: BarChart2 },
    { id: 'units', label: 'Units', icon: Navigation },
    { id: 'activity', label: 'Activity Log', icon: Clock },
  ];

  return (
    <div className="flex min-h-screen w-full bg-background text-foreground">
      {/* Sidebar */}
      <aside className="hidden lg:flex flex-col w-56 shrink-0 border-r border-border bg-sidebar">
        <div className="p-4 border-b border-sidebar-border">
          <div className="flex items-center gap-2">
            <div className="w-7 h-7 bg-destructive/15 border border-destructive/30 rounded flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-destructive" />
            </div>
            <div>
              <div className="text-xs font-bold text-sidebar-foreground">COMMAND CENTER</div>
              <div className="text-[10px] text-sidebar-foreground/50">AEGIS CSG</div>
            </div>
          </div>
        </div>

        <nav className="flex-1 p-2 space-y-0.5">
          {navItems.map((n) => (
            <button key={n.id} onClick={() => setView(n.id)}
              className={cn('w-full flex items-center gap-2.5 px-3 py-2 rounded text-sm transition-colors',
                view === n.id ? 'bg-sidebar-accent text-sidebar-accent-foreground font-medium' : 'text-sidebar-foreground hover:bg-sidebar-accent/50')}>
              <n.icon className="w-4 h-4 shrink-0" />
              {n.label}
              {n.id === 'operations' && activeAlerts.length > 0 && (
                <span className="ml-auto bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">{activeAlerts.length}</span>
              )}
            </button>
          ))}
        </nav>

        <div className="p-3 border-t border-sidebar-border space-y-1">
          <div className="px-3 py-2 text-xs text-sidebar-foreground/60">
            <div className="font-medium text-sidebar-foreground">{user?.name}</div>
            <div>{user?.unit ?? user?.region}</div>
          </div>
          <button onClick={() => { logout(); navigate('/'); }}
            className="w-full flex items-center gap-2 px-3 py-2 rounded text-sm text-sidebar-foreground/70 hover:text-sidebar-foreground hover:bg-sidebar-accent/40 transition-colors">
            <LogOut className="w-4 h-4" />Logout
          </button>
        </div>
      </aside>

      {/* Main */}
      <div className="flex-1 min-w-0 overflow-x-hidden flex flex-col">
        {/* Topbar */}
        <header className="border-b border-border bg-card/60 px-4 md:px-6 py-3 flex items-center justify-between gap-4 sticky top-0 z-40">
          <div className="flex items-center gap-3">
            <div className="lg:hidden w-7 h-7 bg-destructive/15 border border-destructive/30 rounded flex items-center justify-center">
              <Shield className="w-3.5 h-3.5 text-destructive" />
            </div>
            <h1 className="text-sm font-bold">{navItems.find((n) => n.id === view)?.label}</h1>
          </div>
          <div className="flex items-center gap-3 flex-wrap">
            <span className="hidden md:flex items-center gap-1 text-xs text-red-400"><span className="status-dot-red" />{activeAlerts.length} active alerts</span>
            <span className="hidden md:flex items-center gap-1.5 text-xs text-muted-foreground"><span className="status-dot-green" />System Nominal</span>
            {/* Mobile nav tabs */}
            <div className="flex lg:hidden gap-0.5 bg-muted rounded p-0.5">
              {navItems.map((n) => (
                <button key={n.id} onClick={() => setView(n.id)} className={cn('p-1.5 rounded transition-colors', view === n.id ? 'bg-card text-foreground' : 'text-muted-foreground')}>
                  <n.icon className="w-4 h-4" />
                </button>
              ))}
            </div>
          </div>
        </header>

        <main className="flex-1 p-4 md:p-6 overflow-y-auto">
          {/* ── OPERATIONS ── */}
          {view === 'operations' && (
            <div className="space-y-5">
              {/* Summary stats */}
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile icon={AlertTriangle} label="Active" value={stats?.activeAlerts ?? activeAlerts.length} trend={`${activeAlerts.filter(a => a.priority === 'critical').length} critical`} color="text-red-400" />
                <StatTile icon={CheckCircle} label="Resolved Today" value={stats?.resolvedToday ?? 0} trend={`Avg ${stats?.avgResponseMinutes ?? '—'}m response`} color="text-green-400" />
                <StatTile icon={Navigation} label="Units Ready" value={responseUnits.filter((u) => u.status === 'available').length} trend={`${responseUnits.length} total units`} color="text-blue-400" />
                <StatTile icon={Cpu} label="Oracle Score" value="78%" trend="Anomaly: NORMAL" color="text-primary" />
              </div>

              {/* Map + alert feed */}
              <div className="grid grid-cols-1 lg:grid-cols-3 gap-5">
                <div className="lg:col-span-2">
                  <div className="bg-card border border-border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-3">
                      <h2 className="text-sm font-semibold">Operations Map — North Central Nigeria</h2>
                      <span className="text-[10px] text-muted-foreground font-mono-data">Live · Exact coordinates</span>
                    </div>
                    <div style={{ height: 380 }}>
                      <AegisLiveMap alerts={alerts} units={responseUnits} zones={riskZones} height="380px" showLegend={true} />
                    </div>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg flex flex-col">
                  <div className="px-4 py-3 border-b border-border flex items-center justify-between">
                    <h3 className="text-sm font-semibold">Active Alerts</h3>
                    <span className="text-[10px] font-bold bg-destructive/15 text-destructive px-1.5 py-0.5 rounded">{activeAlerts.length}</span>
                  </div>
                  <div className="flex-1 overflow-y-auto divide-y divide-border">
                    {activeAlerts.map((a) => (
                      <AlertRow key={a.id} alert={a} onDispatch={setDispatchAlert} onUpdate={updateAlertStatus} />
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}

          {/* ── ANALYTICS ── */}
          {view === 'analytics' && (
            <div className="space-y-5">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                <StatTile icon={Activity} label="Total Alerts" value={stats?.totalAlerts ?? alerts.length} trend="Last 30 days" color="text-primary" />
                <StatTile icon={TrendingDown} label="Avg Response" value={`${stats?.avgResponseMinutes ?? '—'}m`} trend="↓ 0.8m vs last week" color="text-green-400" />
                <StatTile icon={Users} label="Active Guardians" value={stats?.activeGuardians ?? 0} color="text-blue-400" />
                <StatTile icon={TrendingUp} label="Sentinel Devices" value={stats?.sentinelDevices ?? 0} trend={`${stats?.meshNodes ?? 0} mesh nodes`} color="text-primary" />
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-5">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-4">Alert Activity — Today</h3>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <BarChart data={hourlyData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="hour" tick={{ fill: 'hsl(215 18% 50%)', fontSize: 10 }} />
                        <YAxis tick={{ fill: 'hsl(215 18% 50%)', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: 'hsl(224 38% 9%)', border: '1px solid hsl(224 22% 18%)', borderRadius: 4, fontSize: 12 }} />
                        <Bar dataKey="alerts" fill="hsl(0 72% 51%)" name="Alerts" radius={[2, 2, 0, 0]} />
                        <Bar dataKey="resolved" fill="hsl(152 60% 42%)" name="Resolved" radius={[2, 2, 0, 0]} />
                      </BarChart>
                    </ResponsiveContainer>
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-4">Alerts by Region — 30 Days</h3>
                  <div className="w-full min-w-0 overflow-hidden" style={{ height: 200 }}>
                    <ResponsiveContainer width="100%" height="100%">
                      <LineChart data={regionData} margin={{ top: 0, right: 0, left: -20, bottom: 0 }}>
                        <CartesianGrid strokeDasharray="3 3" stroke="rgba(148,163,184,0.1)" />
                        <XAxis dataKey="region" tick={{ fill: 'hsl(215 18% 50%)', fontSize: 8 }} />
                        <YAxis tick={{ fill: 'hsl(215 18% 50%)', fontSize: 10 }} />
                        <Tooltip contentStyle={{ background: 'hsl(224 38% 9%)', border: '1px solid hsl(224 22% 18%)', borderRadius: 4, fontSize: 12 }} />
                        <Line type="monotone" dataKey="alerts" stroke="hsl(43 100% 50%)" strokeWidth={2} dot={{ r: 3 }} name="Alerts" />
                        <Line type="monotone" dataKey="resolved" stroke="hsl(152 60% 42%)" strokeWidth={2} dot={{ r: 3 }} name="Resolved" />
                      </LineChart>
                    </ResponsiveContainer>
                  </div>
                </div>
              </div>

              {/* Risk zones table */}
              <div className="bg-card border border-border rounded-lg p-4">
                <h3 className="text-sm font-semibold mb-3 flex items-center gap-2"><Cpu className="w-4 h-4 text-primary" />Oracle Risk Assessment</h3>
                <div className="overflow-x-auto">
                  <table className="w-full text-xs whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border text-left text-muted-foreground">
                        <th className="pb-2 font-medium pr-4">Zone</th>
                        <th className="pb-2 font-medium pr-4">Risk Score</th>
                        <th className="pb-2 font-medium pr-4">Level</th>
                        <th className="pb-2 font-medium">Key Factors</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {riskZones.map((z) => (
                        <tr key={z.id}>
                          <td className="py-2 font-medium pr-4">{z.name}</td>
                          <td className="py-2 pr-4">
                            <div className="flex items-center gap-2">
                              <div className="w-20 h-1.5 bg-muted rounded-full"><div className="h-full rounded-full bg-current" style={{ width: `${z.riskScore * 100}%`, color: 'inherit' }} /></div>
                              <span className={cn('font-mono-data', riskColor(z.riskScore))}>{Math.round(z.riskScore * 100)}%</span>
                            </div>
                          </td>
                          <td className="py-2 pr-4"><span className={cn('font-bold', riskColor(z.riskScore))}>{riskLabel(z.riskScore)}</span></td>
                          <td className="py-2 text-muted-foreground max-w-xs">{z.factors.join(' · ')}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── UNITS ── */}
          {view === 'units' && (
            <div className="space-y-4">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
                {(['available', 'responding', 'standby', 'unavailable'] as const).map((s) => {
                  const count = responseUnits.filter((u) => u.status === s).length;
                  return (
                    <div key={s} className="bg-card border border-border rounded-lg p-3 text-center">
                      <div className={cn('text-2xl font-bold font-mono-data', unitStatusColor(s))}>{count}</div>
                      <div className="text-xs text-muted-foreground capitalize mt-0.5">{s.replace('_', ' ')}</div>
                    </div>
                  );
                })}
              </div>

              <div className="bg-card border border-border rounded-lg overflow-hidden">
                <div className="px-4 py-3 border-b border-border">
                  <h3 className="text-sm font-semibold">Response Units</h3>
                </div>
                <div className="overflow-x-auto">
                  <table className="w-full text-sm whitespace-nowrap">
                    <thead>
                      <tr className="border-b border-border bg-muted/30">
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Unit</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Type</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Region</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Status</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">Assigned</th>
                        <th className="text-left px-4 py-2.5 text-xs font-medium text-muted-foreground">ETA</th>
                      </tr>
                    </thead>
                    <tbody className="divide-y divide-border">
                      {responseUnits.map((u) => (
                        <tr key={u.id} className="hover:bg-muted/20 transition-colors">
                          <td className="px-4 py-3 font-medium">{u.name}</td>
                          <td className="px-4 py-3 text-muted-foreground capitalize">{u.type.replace('_', ' ')}</td>
                          <td className="px-4 py-3 text-muted-foreground">{u.region}</td>
                          <td className="px-4 py-3"><span className={cn('font-semibold', unitStatusColor(u.status))}>{u.status.toUpperCase()}</span></td>
                          <td className="px-4 py-3 text-muted-foreground font-mono-data text-xs">{u.currentAlert ?? '—'}</td>
                          <td className="px-4 py-3 text-muted-foreground font-mono-data text-xs">{u.eta ? `${u.eta}m` : '—'}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            </div>
          )}

          {/* ── ACTIVITY LOG ── */}
          {view === 'activity' && (
            <div className="space-y-4">
              <div className="flex flex-col md:flex-row items-start md:items-center gap-3">
                <div className="relative flex-1 w-full md:max-w-sm">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-3.5 h-3.5 text-muted-foreground" />
                  <input value={searchQ} onChange={(e) => setSearchQ(e.target.value)} placeholder="Search alerts, victims, addresses…"
                    className="w-full pl-8 pr-3 py-2 bg-muted border border-border rounded text-sm text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50" />
                </div>
                <div className="flex items-center gap-2 flex-wrap">
                  <Filter className="w-3.5 h-3.5 text-muted-foreground" />
                  {(['all', 'active', 'acknowledged', 'dispatched', 'resolved'] as const).map((s) => (
                    <button key={s} onClick={() => setStatusFilter(s)}
                      className={cn('px-2.5 py-1 text-xs rounded border transition-colors capitalize',
                        statusFilter === s ? 'bg-primary text-primary-foreground border-primary' : 'border-border text-muted-foreground hover:text-foreground hover:border-foreground/30')}>
                      {s}
                    </button>
                  ))}
                </div>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {/* Alert table */}
                <div className="bg-card border border-border rounded-lg overflow-hidden">
                  <div className="px-4 py-3 border-b border-border">
                    <h3 className="text-sm font-semibold">All Alerts ({filteredAlerts.length})</h3>
                  </div>
                  <div className="overflow-x-auto">
                    <table className="w-full text-xs whitespace-nowrap">
                      <thead>
                        <tr className="border-b border-border bg-muted/30">
                          {['ID', 'Victim', 'Priority', 'Status', 'Time'].map((h) => (
                            <th key={h} className="text-left px-3 py-2 font-medium text-muted-foreground">{h}</th>
                          ))}
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-border">
                        {filteredAlerts.map((a) => (
                          <tr key={a.id} className="hover:bg-muted/20">
                            <td className="px-3 py-2.5 font-mono-data">{a.id}</td>
                            <td className="px-3 py-2.5 font-medium">{a.victimName}</td>
                            <td className="px-3 py-2.5"><span className={cn('font-bold', priorityColor(a.priority))}>{a.priority[0].toUpperCase()}</span></td>
                            <td className="px-3 py-2.5"><span className={cn('uppercase text-[10px] font-bold', statusColor(a.status))}>{a.status}</span></td>
                            <td className="px-3 py-2.5 text-muted-foreground">{formatRelativeTime(a.timestamp)}</td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>
                </div>

                {/* System log */}
                <div className="bg-card border border-border rounded-lg flex flex-col">
                  <div className="px-4 py-3 border-b border-border flex items-center gap-2">
                    <h3 className="text-sm font-semibold">System Activity Log</h3>
                    <span className="ml-auto text-[10px] text-muted-foreground">{allLogEntries.length} entries</span>
                  </div>
                  <div className="flex-1 overflow-y-auto max-h-[480px]">
                    {allLogEntries.slice(0, 30).map((entry, i) => (
                      <div key={`${entry.id}-${i}`} className="flex items-start gap-2 px-3 py-2.5 border-b border-border/50 last:border-0 text-xs">
                        <span className="text-muted-foreground font-mono-data shrink-0 mt-0.5">{formatTime(entry.timestamp)}</span>
                        <span className={cn('shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                          entry.type === 'system' ? 'bg-blue-500/15 text-blue-400' :
                          entry.type === 'ai' ? 'bg-purple-500/15 text-purple-400' :
                          entry.type === 'guardian' ? 'bg-primary/15 text-primary' :
                          'bg-green-500/15 text-green-400')}>
                          {entry.type}
                        </span>
                        <span className="text-muted-foreground font-mono-data shrink-0">[{entry.alertId}]</span>
                        <span className="text-foreground/80 text-pretty">{entry.message}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          )}
        </main>
      </div>

      {/* Dispatch modal */}
      {dispatchAlert && <DispatchModal alert={dispatchAlert} onClose={() => setDispatchAlert(null)} />}
    </div>
  );
}
