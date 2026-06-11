import { useState } from 'react';
import { Shield, MapPin, AlertTriangle, Users, Wifi, Activity, ChevronRight, CheckCircle, Clock, TrendingUp, FileText, Eye } from 'lucide-react';
import { cn } from '@/lib/utils';
import { formatRelativeTime, riskColor, riskBg, riskLabel } from '@/lib/aegis-utils';
import { demoStats } from '@/lib/aegis-data';
import type { CommunityReport, RiskZone } from '@/types/aegis';
import { useNavigate } from 'react-router-dom';
import { useAegisStore } from '@/hooks/useAegisStore';
import { AegisLiveMap } from '@/components/AegisLiveMap';

// ── Stat Card ────────────────────────────────────────────────
function StatCard({ icon: Icon, label, value, sub, color }: { icon: React.ElementType; label: string; value: string; sub?: string; color: string }) {
  return (
    <div className="bg-card border border-border rounded-lg p-4 h-full flex flex-col gap-2">
      <div className={cn('w-8 h-8 rounded flex items-center justify-center', color)}>
        <Icon className="w-4 h-4" />
      </div>
      <div>
        <div className="text-xl font-bold font-mono-data">{value}</div>
        <div className="text-xs text-muted-foreground">{label}</div>
        {sub && <div className="text-xs text-muted-foreground/70 mt-0.5">{sub}</div>}
      </div>
    </div>
  );
}

// ── Risk Zone Card ───────────────────────────────────────────
function RiskZoneCard({ zone }: { zone: RiskZone }) {
  return (
    <div className={cn('border rounded-lg p-3 flex flex-col gap-2', riskBg(zone.riskScore), 'border-border')}>
      <div className="flex items-start justify-between gap-2">
        <span className="text-sm font-medium leading-tight text-balance">{zone.name}</span>
        <span className={cn('text-xs font-bold font-mono-data shrink-0', riskColor(zone.riskScore))}>
          {riskLabel(zone.riskScore)}
        </span>
      </div>
      <div className="h-1.5 bg-muted rounded-full overflow-hidden">
        <div className={cn('h-full rounded-full', zone.riskScore >= 0.8 ? 'bg-red-500' : zone.riskScore >= 0.6 ? 'bg-orange-500' : 'bg-yellow-500')}
          style={{ width: `${zone.riskScore * 100}%` }} />
      </div>
      <div className="flex flex-wrap gap-1">
        {zone.factors.map((f) => (
          <span key={f} className="text-[10px] bg-muted text-muted-foreground rounded px-1.5 py-0.5">{f}</span>
        ))}
      </div>
    </div>
  );
}

// ── Community Report Row ────────────────────────────────────
function ReportRow({ report }: { report: CommunityReport }) {
  const catColor: Record<string, string> = {
    suspicious_activity: 'text-orange-400',
    incident: 'text-red-400',
    road_clear: 'text-green-400',
    checkpoint: 'text-blue-400',
    armed_group: 'text-red-400',
  };
  const catLabel: Record<string, string> = {
    suspicious_activity: 'Suspicious',
    incident: 'Incident',
    road_clear: 'Road Clear',
    checkpoint: 'Checkpoint',
    armed_group: 'Armed Group',
  };
  return (
    <div className="flex items-start gap-3 py-3 border-b border-border last:border-0">
      <span className={cn('text-[10px] font-bold shrink-0 mt-0.5 uppercase', catColor[report.category])}>
        {catLabel[report.category]}
      </span>
      <div className="flex-1 min-w-0">
        <p className="text-sm text-foreground/90 text-pretty">{report.description}</p>
        <div className="flex items-center gap-3 mt-1 text-xs text-muted-foreground">
          <span className="flex items-center gap-1"><MapPin className="w-3 h-3" />{report.location.lat.toFixed(2)}, {report.location.lng.toFixed(2)}</span>
          <span className="flex items-center gap-1"><Clock className="w-3 h-3" />{formatRelativeTime(report.timestamp)}</span>
          <span className="flex items-center gap-1"><TrendingUp className="w-3 h-3" />{report.votes} votes</span>
          {report.verified && <span className="flex items-center gap-1 text-green-400"><CheckCircle className="w-3 h-3" />Verified</span>}
        </div>
      </div>
    </div>
  );
}

// ── Main Page ────────────────────────────────────────────────
export default function PublicPortalPage() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState<'map' | 'zones' | 'reports'>('map');

  // Live Supabase data
  const alerts          = useAegisStore((s) => s.alerts);
  const riskZones       = useAegisStore((s) => s.riskZones);
  const communityReports = useAegisStore((s) => s.communityReports);
  const responseUnits   = useAegisStore((s) => s.responseUnits);
  const stats           = useAegisStore((s) => s.stats) ?? demoStats;

  const activeAlerts = alerts.filter((a) => a.status !== 'resolved' && a.status !== 'cancelled');

  return (
    <div className="min-h-screen bg-background text-foreground">
      {/* Header */}
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-8 h-8 bg-primary/15 border border-primary/30 rounded flex items-center justify-center">
                <Shield className="w-4 h-4 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold tracking-wide">AEGIS CSG</h1>
                <p className="text-[10px] text-muted-foreground hidden md:block">Civilian Safety Grid · Nigeria</p>
              </div>
            </div>

            <nav className="hidden md:flex items-center gap-1">
              {[
                { label: 'Safety Map', id: 'map' },
                { label: 'Risk Zones', id: 'zones' },
                { label: 'Reports', id: 'reports' },
              ].map((t) => (
                <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                  className={cn('px-3 py-1.5 rounded text-sm font-medium transition-colors',
                    activeTab === t.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground hover:bg-muted')}>
                  {t.label}
                </button>
              ))}
            </nav>

            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <span className="status-dot-red" />{activeAlerts.length} Active
              </span>
              <button onClick={() => navigate('/login')}
                className="px-3 py-1.5 text-xs font-medium border border-primary/50 text-primary hover:bg-primary/10 rounded transition-colors flex items-center gap-1">
                Responder Login <ChevronRight className="w-3 h-3" />
              </button>
            </div>
          </div>

          {/* Mobile tabs */}
          <div className="flex md:hidden gap-1 pb-2 overflow-x-auto whitespace-nowrap">
            {[{ label: 'Safety Map', id: 'map' }, { label: 'Risk Zones', id: 'zones' }, { label: 'Reports', id: 'reports' }].map((t) => (
              <button key={t.id} onClick={() => setActiveTab(t.id as typeof activeTab)}
                className={cn('px-3 py-1 rounded text-xs font-medium shrink-0 transition-colors',
                  activeTab === t.id ? 'bg-secondary text-foreground' : 'text-muted-foreground hover:text-foreground')}>
                {t.label}
              </button>
            ))}
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Stats strip */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-6">
          <StatCard icon={AlertTriangle} label="Active Alerts" value={String(stats.activeAlerts)} sub="North Central" color="bg-red-500/15 text-red-400" />
          <StatCard icon={CheckCircle} label="Resolved Today" value={String(stats.resolvedToday)} sub="Avg. 6.4 min resp." color="bg-green-500/15 text-green-400" />
          <StatCard icon={Users} label="Active Guardians" value={String(stats.activeGuardians)} sub="Registered responders" color="bg-blue-500/15 text-blue-400" />
          <StatCard icon={Wifi} label="Sentinel Devices" value={String(stats.sentinelDevices)} sub={`${stats.meshNodes} mesh nodes`} color="bg-primary/15 text-primary" />
        </div>

        {activeTab === 'map' && (
          <div className="space-y-6">
            {/* System status bar */}
            <div className="flex flex-wrap gap-4 text-xs text-muted-foreground border border-border rounded-lg px-4 py-2.5 bg-card">
              <span className="flex items-center gap-1.5"><span className="status-dot-green" />API Nominal</span>
              <span className="flex items-center gap-1.5"><span className="status-dot-green" />SMS Gateway Online</span>
              <span className="flex items-center gap-1.5"><span className="status-dot-amber" />{stats.meshNodes} LoRa Nodes Active</span>
              <span className="flex items-center gap-1.5"><Activity className="w-3 h-3" />Network Uptime {stats.networkUptime}%</span>
            </div>

            <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
              <div className="lg:col-span-2">
                <div className="bg-card border border-border rounded-lg p-4">
                  <div className="flex items-center justify-between mb-3">
                    <h2 className="font-semibold text-sm">North Central Nigeria — Live Safety Map</h2>
                    <span className="text-[10px] text-muted-foreground font-mono-data">Anonymised · ±1 km precision</span>
                  </div>
                  <div style={{ height: 340 }}>
                    <AegisLiveMap alerts={alerts} units={responseUnits} zones={riskZones} height="340px" />
                  </div>
                </div>
              </div>

              <div className="space-y-4">
                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                    <AlertTriangle className="w-4 h-4 text-red-400" />Ongoing Incidents
                  </h3>
                  <div className="space-y-2">
                    {activeAlerts.map((a, i) => (
                      <div key={a.id} className="flex items-start gap-2 p-2 bg-muted/40 rounded text-xs">
                        <span className="status-dot-red mt-1 shrink-0" />
                        <div>
                          <div className="font-medium">Incident #{i + 1}</div>
                          <div className="text-muted-foreground">{a.address.split(',')[0]}</div>
                          <div className="text-muted-foreground mt-0.5 font-mono-data">{formatRelativeTime(a.timestamp)}</div>
                        </div>
                      </div>
                    ))}
                    {activeAlerts.length === 0 && (
                      <p className="text-xs text-muted-foreground py-2 text-center">No active incidents.</p>
                    )}
                  </div>
                </div>

                <div className="bg-card border border-border rounded-lg p-4">
                  <h3 className="text-sm font-semibold mb-3">Risk Zone Summary</h3>
                  <div className="space-y-2">
                    {riskZones.map((z) => (
                      <div key={z.id} className="flex items-center justify-between text-xs">
                        <span className="text-muted-foreground truncate mr-2">{z.name}</span>
                        <span className={cn('font-bold font-mono-data shrink-0', riskColor(z.riskScore))}>
                          {Math.round(z.riskScore * 100)}%
                        </span>
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}

        {activeTab === 'zones' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold">Risk Zones — North Central Nigeria</h2>
              <span className="text-xs text-muted-foreground">Updated every 6 hours via Oracle Engine</span>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {riskZones.map((z) => <RiskZoneCard key={z.id} zone={z} />)}
            </div>
            <div className="bg-card border border-border rounded-lg p-4 text-sm text-muted-foreground">
              <p className="flex items-start gap-2"><Eye className="w-4 h-4 shrink-0 mt-0.5 text-primary" />
                Risk scores are calculated by the Oracle Predictive Intelligence Engine using historical alert frequency, geographic factors, time-of-day patterns, and BLE device clustering data. Scores are updated every 6 hours and reflect aggregate patterns — not individual incidents.
              </p>
            </div>
          </div>
        )}

        {activeTab === 'reports' && (
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h2 className="font-semibold flex items-center gap-2">
                <FileText className="w-4 h-4 text-primary" />Community Safety Reports
              </h2>
              <span className="text-xs text-muted-foreground">All reporters anonymised</span>
            </div>
            <div className="bg-card border border-border rounded-lg px-4 divide-y divide-border">
              {communityReports.map((r) => <ReportRow key={r.id} report={r} />)}
              {communityReports.length === 0 && (
                <p className="text-xs text-muted-foreground py-6 text-center">No community reports yet.</p>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-12 py-6 text-center text-xs text-muted-foreground">
        <p>AEGIS CSG · Civilian Safety Grid · Nigeria · Data anonymised in accordance with NDPR 2019</p>
      </footer>
    </div>
  );
}
