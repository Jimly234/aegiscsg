import { useState, useEffect, useRef } from 'react';
import {
  Shield, Bell, Users, MapPin, Mic, MicOff, Send, ArrowLeft,
  LogOut, CheckCircle, Zap, AlertTriangle, Battery, Signal,
  Radio, Clock, Navigation, Phone, Activity, Cpu, Loader2,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { useAegisStore } from '@/hooks/useAegisStore';
import { formatRelativeTime, formatTime, priorityBg, priorityColor, statusColor, guardianStatusDot } from '@/lib/aegis-utils';
import type { Alert, ChatMessage } from '@/types/aegis';
import { useNavigate } from 'react-router-dom';
import { AegisLiveMap } from '@/components/AegisLiveMap';
import { fetchChatMessages, oracleAnalyze } from '@/services/aegis-db';

// ── Waveform bars ────────────────────────────────────────────
function WaveformBars({ active }: { active: boolean }) {
  const heights = [4, 8, 12, 6, 16, 10, 14, 8, 5, 12, 9, 16, 6, 11, 7, 13, 5, 10, 15, 8];
  return (
    <div className="flex items-center gap-[2px] h-8">
      {heights.map((h, i) => (
        <div
          key={i}
          className={cn('w-1 rounded-full transition-all', active ? 'bg-red-400 stream-active' : 'bg-muted')}
          style={{ height: active ? `${h}px` : '4px', animationDelay: `${i * 70}ms` }}
        />
      ))}
    </div>
  );
}

// ── Alert Card ───────────────────────────────────────────────
function AlertCard({
  alert,
  onView,
  onAcknowledge,
}: {
  alert: Alert;
  onView: () => void;
  onAcknowledge: () => void;
}) {
  return (
    <div
      className={cn('border rounded-lg p-4 cursor-pointer transition-all hover:border-border/80', priorityBg(alert.priority))}
      onClick={onView}
    >
      <div className="flex items-start justify-between gap-3 mb-3">
        <div>
          <div className="flex items-center gap-2 flex-wrap">
            <span className="font-semibold text-sm">{alert.victimName}</span>
            <span className={cn('text-[10px] font-bold uppercase px-1.5 py-0.5 rounded', priorityColor(alert.priority), 'bg-current/10')}>
              {alert.priority}
            </span>
            <span className={cn('text-[10px] uppercase', statusColor(alert.status))}>{alert.status}</span>
          </div>
          <p className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1">
            <MapPin className="w-3 h-3 shrink-0" />{alert.address}
          </p>
        </div>
        <span className="text-xs text-muted-foreground font-mono-data shrink-0">{formatRelativeTime(alert.timestamp)}</span>
      </div>

      <div className="flex items-center gap-4 text-xs text-muted-foreground mb-3">
        <span className="flex items-center gap-1"><Battery className="w-3 h-3" />{alert.batteryLevel}%</span>
        <span className="flex items-center gap-1"><Signal className="w-3 h-3" />{alert.signalStrength}</span>
        <span className="flex items-center gap-1"><Users className="w-3 h-3" />{alert.guardiansAcknowledged}/{alert.guardiansNotified} ack.</span>
        {alert.audioStreaming && (
          <span className="flex items-center gap-1 text-red-400"><Radio className="w-3 h-3 stream-active" />Live Audio</span>
        )}
      </div>

      <div className="flex items-center gap-2">
        <button
          onClick={(e) => { e.stopPropagation(); onView(); }}
          className="flex-1 py-1.5 text-xs font-medium border border-border rounded hover:bg-muted/50 transition-colors"
        >
          View Details
        </button>
        {alert.status !== 'acknowledged' && alert.status !== 'resolved' && (
          <button
            onClick={(e) => { e.stopPropagation(); onAcknowledge(); }}
            className="flex-1 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors"
          >
            Acknowledge
          </button>
        )}
      </div>
    </div>
  );
}

// ── Alert Detail View ────────────────────────────────────────
function AlertDetailView({
  alert,
  onBack,
  onAcknowledge,
  onResolve,
}: {
  alert: Alert;
  onBack: () => void;
  onAcknowledge: () => void;
  onResolve: () => void;
}) {
  const guardians       = useAegisStore((s) => s.guardians);
  const sendChat        = useAegisStore((s) => s.sendChatMessage);
  const user            = useAegisStore((s) => s.user);
  const [chatMessages, setChatMessages]     = useState<ChatMessage[]>([]);
  const [chatInput, setChatInput]           = useState('');
  const [oracleText, setOracleText]         = useState('');
  const [oracleLoading, setOracleLoading]   = useState(false);
  const bottomRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchChatMessages(alert.id).then(setChatMessages);
  }, [alert.id]);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: 'smooth' });
  }, [chatMessages]);

  const handleSend = () => {
    if (!chatInput.trim()) return;
    sendChat(alert.id, chatInput);
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: user?.id ?? 'g',
      senderName: user?.name ?? 'Guardian',
      content: chatInput,
      timestamp: new Date().toISOString(),
      alertId: alert.id,
    };
    setChatMessages((prev) => [...prev, msg]);
    setChatInput('');
  };

  const handleOracleAnalysis = async () => {
    setOracleLoading(true);
    setOracleText('');
    try {
      await oracleAnalyze(
        {
          type: 'alert',
          alert: {
            id: alert.id,
            victimName: alert.victimName,
            victimAge: alert.victimAge,
            victimGender: alert.victimGender,
            address: alert.address,
            priority: alert.priority,
            batteryLevel: alert.batteryLevel,
            signalStrength: alert.signalStrength,
            speed: alert.speedKmh ?? alert.speed,
            heading: alert.heading,
            movementPattern: alert.movementPattern,
            aiVoicesDetected: alert.aiAnalysis?.voicesDetected,
            aiLanguage: alert.aiAnalysis?.language,
            aiKeywords: alert.aiAnalysis?.keywords,
            aiStressLevel: alert.aiAnalysis?.stressLevel,
            aiVehicleEngine: alert.aiAnalysis?.vehicleEngine,
            aiThreatScore: alert.aiAnalysis?.threatScore,
            guardians_notified: alert.guardiansNotified,
            guardians_acknowledged: alert.guardiansAcknowledged,
            audioStreaming: alert.audioStreaming,
          },
        },
        (text) => setOracleText(text),
      );
    } catch (e) {
      setOracleText(`Oracle error: ${e instanceof Error ? e.message : 'Unknown error'}`);
    } finally {
      setOracleLoading(false);
    }
  };

  let oracleJson: Record<string, unknown> | null = null;
  try {
    const match = oracleText.match(/\{[\s\S]*\}/);
    if (match) oracleJson = JSON.parse(match[0]);
  } catch { /* raw text fallback */ }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 sticky top-0 z-50 px-4 py-3">
        <div className="max-w-7xl mx-auto flex items-center justify-between gap-3">
          <div className="flex items-center gap-3 min-w-0">
            <button onClick={onBack} className="p-1.5 hover:bg-muted rounded transition-colors shrink-0">
              <ArrowLeft className="w-4 h-4" />
            </button>
            <div className="min-w-0">
              <h1 className="font-bold text-sm truncate">Alert {alert.id} — {alert.victimName}</h1>
              <p className="text-xs text-muted-foreground truncate">{alert.address}</p>
            </div>
          </div>
          <div className="flex items-center gap-2 shrink-0">
            {alert.status !== 'resolved' && alert.status !== 'acknowledged' && (
              <button onClick={onAcknowledge} className="px-3 py-1.5 text-xs font-medium bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors">
                Acknowledge
              </button>
            )}
            {alert.status !== 'resolved' && (
              <button onClick={onResolve} className="px-3 py-1.5 text-xs font-medium bg-green-600 text-white rounded hover:bg-green-500 transition-colors">
                Resolve
              </button>
            )}
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main column */}
          <div className="lg:col-span-2 space-y-4">
            {/* Victim info */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3">Victim Information</h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 text-sm">
                {[
                  ['Name', alert.victimName],
                  ['Age', `${alert.victimAge} (${alert.victimGender})`],
                  ['Status', alert.status.toUpperCase()],
                  ['Priority', alert.priority.toUpperCase()],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="font-medium">{v}</div>
                  </div>
                ))}
              </div>
              <div className="grid grid-cols-2 md:grid-cols-3 gap-3 text-sm mt-3 pt-3 border-t border-border">
                {[
                  ['Battery', `${alert.batteryLevel}%`],
                  ['Signal', alert.signalStrength],
                  ['Notified', `${alert.guardiansNotified} guardians`],
                ].map(([k, v]) => (
                  <div key={k}>
                    <div className="text-xs text-muted-foreground">{k}</div>
                    <div className="font-medium">{v}</div>
                  </div>
                ))}
              </div>
            </div>

            {/* Audio stream */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  {alert.audioStreaming
                    ? <Mic className="w-4 h-4 text-red-400" />
                    : <MicOff className="w-4 h-4 text-muted-foreground" />}
                  Audio Stream
                </h2>
                {alert.audioStreaming && (
                  <span className="text-xs text-red-400 flex items-center gap-1">
                    <span className="status-dot-red" />LIVE
                  </span>
                )}
              </div>
              <WaveformBars active={alert.audioStreaming} />
              {alert.aiAnalysis && (
                <div className="grid grid-cols-2 md:grid-cols-4 gap-2 mt-3">
                  {[
                    ['Voices', String(alert.aiAnalysis.voicesDetected)],
                    ['Language', alert.aiAnalysis.language],
                    ['Stress', alert.aiAnalysis.stressLevel],
                    ['Threat', `${Math.round(alert.aiAnalysis.threatScore * 100)}%`],
                  ].map(([k, v]) => (
                    <div key={k} className="bg-muted/40 rounded p-2 text-xs">
                      <div className="text-muted-foreground">{k}</div>
                      <div className={cn('font-semibold mt-0.5',
                        k === 'Stress' && v === 'High' ? 'text-red-400' :
                        k === 'Threat' ? 'text-orange-400' : ''
                      )}>{v}</div>
                    </div>
                  ))}
                </div>
              )}
            </div>

            {/* Live Location — Google Maps */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Navigation className="w-4 h-4 text-primary" />Live Location
              </h2>
              <div style={{ height: 260 }}>
                <AegisLiveMap alerts={[alert]} units={[]} zones={[]} height="260px" defaultZoom={13} />
              </div>
              {alert.movementPattern && (
                <div className="flex items-start gap-2 mt-3 text-xs text-orange-400 bg-orange-400/10 border border-orange-400/20 rounded p-2.5">
                  <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />{alert.movementPattern}
                </div>
              )}
            </div>

            {/* Oracle AI Analysis */}
            <div className="bg-card border border-border rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h2 className="text-sm font-semibold flex items-center gap-2">
                  <Cpu className="w-4 h-4 text-primary" />Oracle AI Analysis
                </h2>
                <button
                  onClick={handleOracleAnalysis}
                  disabled={oracleLoading}
                  className="flex items-center gap-1.5 px-3 py-1.5 text-xs font-medium bg-primary/15 text-primary border border-primary/30 rounded hover:bg-primary/25 transition-colors disabled:opacity-50"
                >
                  {oracleLoading
                    ? <Loader2 className="w-3.5 h-3.5 animate-spin" />
                    : <Zap className="w-3.5 h-3.5" />}
                  {oracleLoading ? 'Analysing…' : 'Run Analysis'}
                </button>
              </div>
              {oracleJson ? (
                <div className="space-y-3">
                  <div className="grid grid-cols-2 md:grid-cols-3 gap-2">
                    {[
                      ['Threat Score', `${Math.round(((oracleJson.threatScore as number) ?? 0) * 100)}%`],
                      ['Level', String(oracleJson.threatLevel ?? '—')],
                      ['Confidence', `${Math.round(((oracleJson.confidence as number) ?? 0) * 100)}%`],
                    ].map(([k, v]) => (
                      <div key={k} className="bg-muted/40 rounded p-2 text-xs">
                        <div className="text-muted-foreground">{k}</div>
                        <div className="font-semibold mt-0.5">{v}</div>
                      </div>
                    ))}
                  </div>
                  {(() => {
                    const summary = oracleJson.summary ? String(oracleJson.summary) : null;
                    const rec = oracleJson.recommendation ? String(oracleJson.recommendation) : null;
                    return (
                      <>
                        {summary && <p className="text-sm text-foreground/85 text-pretty">{summary}</p>}
                        {rec && (
                          <div className="flex items-start gap-2 text-xs text-orange-300 bg-orange-400/10 border border-orange-400/20 rounded p-2.5">
                            <AlertTriangle className="w-3.5 h-3.5 shrink-0 mt-0.5" />
                            <span>{rec}</span>
                          </div>
                        )}
                      </>
                    );
                  })()}
                </div>
              ) : oracleText ? (
                <pre className="text-xs text-muted-foreground whitespace-pre-wrap font-mono overflow-x-auto max-h-48">{oracleText}</pre>
              ) : (
                <p className="text-xs text-muted-foreground">
                  Click "Run Analysis" to get an AI-powered tactical assessment from Oracle.
                </p>
              )}
            </div>

            {/* Response log */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h2 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Activity className="w-4 h-4 text-muted-foreground" />Response Log
              </h2>
              <div className="space-y-2 max-h-52 overflow-y-auto">
                {alert.logEntries.map((entry) => (
                  <div key={entry.id} className="flex items-start gap-2 text-xs">
                    <span className="text-muted-foreground font-mono-data shrink-0 mt-0.5">
                      {formatTime(entry.timestamp)}
                    </span>
                    <span className={cn('shrink-0 px-1.5 py-0.5 rounded text-[10px] font-semibold uppercase',
                      entry.type === 'system' ? 'bg-blue-500/15 text-blue-400' :
                      entry.type === 'ai' ? 'bg-purple-500/15 text-purple-400' :
                      entry.type === 'guardian' ? 'bg-primary/15 text-primary' :
                      'bg-green-500/15 text-green-400'
                    )}>
                      {entry.type}
                    </span>
                    <span className="text-foreground/85 text-pretty">{entry.message}</span>
                  </div>
                ))}
                {alert.logEntries.length === 0 && (
                  <p className="text-xs text-muted-foreground">No log entries yet.</p>
                )}
              </div>
            </div>
          </div>

          {/* Right sidebar */}
          <div className="space-y-4">
            {/* Chat */}
            <div className="bg-card border border-border rounded-lg flex flex-col h-72">
              <div className="px-3 py-2 border-b border-border text-xs font-semibold flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />Guardian Coordination
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((m) => (
                  <div key={m.id} className="text-xs">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn('font-medium',
                        m.senderId === 'sys' ? 'text-blue-400' :
                        m.senderId === 'cmd' ? 'text-red-400' : 'text-primary'
                      )}>{m.senderName}</span>
                      <span className="text-muted-foreground font-mono-data">{formatTime(m.timestamp)}</span>
                    </div>
                    <p className="text-foreground/85 leading-relaxed text-pretty">{m.content}</p>
                  </div>
                ))}
                <div ref={bottomRef} />
              </div>
              <div className="border-t border-border p-2 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message guardians…"
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-muted border border-border rounded text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={handleSend}
                  className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Guardian network */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />Guardian Network
              </h3>
              <div className="space-y-2">
                {guardians.map((g) => (
                  <div key={g.id} className="flex items-start gap-2 text-xs">
                    <span className={cn('mt-1 shrink-0', guardianStatusDot(g.status))} />
                    <div className="flex-1 min-w-0">
                      <div className="font-medium truncate">{g.name}</div>
                      <div className="text-muted-foreground">{g.relationship}</div>
                      {(g.distanceKm ?? g.distance) != null && (
                        <div className="text-muted-foreground font-mono-data">{g.distanceKm ?? g.distance} km away</div>
                      )}
                      {g.message && (
                        <div className="text-foreground/70 text-pretty mt-0.5 italic">"{g.message}"</div>
                      )}
                    </div>
                    <button className="p-1 hover:bg-muted rounded shrink-0">
                      <Phone className="w-3.5 h-3.5 text-muted-foreground" />
                    </button>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

// ── Guardian Dashboard ───────────────────────────────────────
export default function GuardianDashboardPage() {
  const navigate = useNavigate();
  const user = useAegisStore((s) => s.user);
  const alerts = useAegisStore((s) => s.alerts);
  const guardians = useAegisStore((s) => s.guardians);
  const chatMessages = useAegisStore((s) => s.chatMessages);
  const sendChatMessage = useAegisStore((s) => s.sendChatMessage);
  const updateAlertStatus = useAegisStore((s) => s.updateAlertStatus);
  const logout = useAegisStore((s) => s.logout);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeTab, setActiveTab] = useState<'alerts' | 'coordination'>('alerts');
  const [chatInput, setChatInput] = useState('');

  const activeAlerts = alerts.filter((a) => a.status !== 'resolved' && a.status !== 'cancelled');

  useEffect(() => { if (!user) navigate('/login'); }, [user, navigate]);

  const handleAcknowledge = (id: string) => updateAlertStatus(id, 'acknowledged');
  const handleResolve = (id: string) => { updateAlertStatus(id, 'resolved'); setSelectedAlert(null); };

  const handleSend = () => {
    if (!chatInput.trim() || !alerts[0]) return;
    sendChatMessage(alerts[0].id, chatInput);
    setChatInput('');
  };

  if (selectedAlert) {
    return (
      <AlertDetailView
        alert={selectedAlert}
        onBack={() => setSelectedAlert(null)}
        onAcknowledge={() => handleAcknowledge(selectedAlert.id)}
        onResolve={() => handleResolve(selectedAlert.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-background text-foreground">
      <header className="border-b border-border bg-card/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center gap-3">
              <div className="w-7 h-7 bg-primary/15 border border-primary/30 rounded flex items-center justify-center">
                <Shield className="w-3.5 h-3.5 text-primary" />
              </div>
              <div>
                <h1 className="text-sm font-bold">Guardian Dashboard</h1>
                <p className="text-[10px] text-muted-foreground hidden md:block">
                  {user?.name} · Emergency Contact Interface
                </p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <span className="text-xs text-muted-foreground hidden md:flex items-center gap-1.5">
                <Users className="w-3.5 h-3.5" />{guardians.filter((g) => g.status !== 'offline').length} online
              </span>
              {activeAlerts.length > 0 && (
                <span className="flex items-center gap-1 text-xs text-red-400 font-medium">
                  <span className="status-dot-red" />{activeAlerts.length} active
                </span>
              )}
              <button
                onClick={() => { logout(); navigate('/'); }}
                className="p-1.5 hover:bg-muted rounded transition-colors text-muted-foreground hover:text-foreground"
              >
                <LogOut className="w-4 h-4" />
              </button>
            </div>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 md:px-6 py-6">
        {/* Tabs */}
        <div className="flex gap-1 bg-muted rounded-lg p-1 w-fit mb-6">
          {[{ id: 'alerts', label: 'Active Alerts', icon: Bell }, { id: 'coordination', label: 'Coordination', icon: Users }].map((t) => (
            <button
              key={t.id}
              onClick={() => setActiveTab(t.id as typeof activeTab)}
              className={cn('flex items-center gap-2 px-4 py-2 rounded text-sm font-medium transition-colors',
                activeTab === t.id ? 'bg-card text-foreground shadow-sm' : 'text-muted-foreground hover:text-foreground'
              )}
            >
              <t.icon className="w-4 h-4" />
              <span className="hidden md:inline">{t.label}</span>
              {t.id === 'alerts' && activeAlerts.length > 0 && (
                <span className="bg-destructive text-destructive-foreground text-[10px] font-bold px-1.5 py-0.5 rounded-full">
                  {activeAlerts.length}
                </span>
              )}
            </button>
          ))}
        </div>

        {activeTab === 'alerts' && (
          <div className="space-y-3">
            {activeAlerts.length === 0 ? (
              <div className="bg-card border border-border rounded-lg p-10 text-center">
                <CheckCircle className="w-10 h-10 text-green-400 mx-auto mb-3" />
                <h3 className="font-semibold">No Active Alerts</h3>
                <p className="text-sm text-muted-foreground mt-1">
                  You will be notified immediately when an alert is triggered.
                </p>
              </div>
            ) : (
              activeAlerts.map((a) => (
                <AlertCard
                  key={a.id}
                  alert={a}
                  onView={() => setSelectedAlert(a)}
                  onAcknowledge={() => handleAcknowledge(a.id)}
                />
              ))
            )}
            {alerts.filter((a) => a.status === 'resolved').length > 0 && (
              <div className="mt-4">
                <h3 className="text-xs font-semibold text-muted-foreground uppercase tracking-wider mb-2">Resolved Today</h3>
                <div className="space-y-2">
                  {alerts.filter((a) => a.status === 'resolved').map((a) => (
                    <div key={a.id} className="flex items-center justify-between px-3 py-2.5 bg-card border border-border rounded-lg text-sm">
                      <div className="flex items-center gap-2">
                        <CheckCircle className="w-4 h-4 text-green-400 shrink-0" />
                        <span className="font-medium">{a.victimName}</span>
                        <span className="text-muted-foreground hidden md:inline">· {a.address}</span>
                      </div>
                      <span className="text-xs text-muted-foreground font-mono-data shrink-0">
                        {formatRelativeTime(a.timestamp)}
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            )}
          </div>
        )}

        {activeTab === 'coordination' && (
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Chat panel */}
            <div className="bg-card border border-border rounded-lg flex flex-col h-80">
              <div className="px-3 py-2 border-b border-border text-xs font-semibold flex items-center gap-2">
                <Users className="w-3.5 h-3.5 text-primary" />Guardian Coordination Chat
              </div>
              <div className="flex-1 overflow-y-auto p-3 space-y-2">
                {chatMessages.map((m) => (
                  <div key={m.id} className="text-xs">
                    <div className="flex items-center gap-1.5 mb-0.5">
                      <span className={cn('font-medium',
                        m.senderId === 'sys' ? 'text-blue-400' :
                        m.senderId === 'cmd' ? 'text-red-400' : 'text-primary'
                      )}>{m.senderName}</span>
                      <span className="text-muted-foreground font-mono-data">{formatTime(m.timestamp)}</span>
                    </div>
                    <p className="text-foreground/85 leading-relaxed text-pretty">{m.content}</p>
                  </div>
                ))}
              </div>
              <div className="border-t border-border p-2 flex items-center gap-2">
                <input
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === 'Enter' && handleSend()}
                  placeholder="Message guardians…"
                  className="flex-1 min-w-0 px-2.5 py-1.5 bg-muted border border-border rounded text-xs text-foreground placeholder-muted-foreground focus:outline-none focus:ring-1 focus:ring-primary/50"
                />
                <button
                  onClick={handleSend}
                  className="p-1.5 bg-primary text-primary-foreground rounded hover:bg-primary/90 transition-colors shrink-0"
                >
                  <Send className="w-3.5 h-3.5" />
                </button>
              </div>
            </div>

            {/* Guardian network */}
            <div className="bg-card border border-border rounded-lg p-4">
              <h3 className="text-sm font-semibold mb-3 flex items-center gap-2">
                <Users className="w-4 h-4 text-primary" />Guardian Network Status
              </h3>
              <div className="space-y-3">
                {guardians.map((g) => (
                  <div key={g.id} className="flex items-start gap-3">
                    <span className={cn('mt-1.5 shrink-0', guardianStatusDot(g.status))} />
                    <div className="flex-1 min-w-0">
                      <div className="text-sm font-medium">
                        {g.name} <span className="text-muted-foreground font-normal">— {g.relationship}</span>
                      </div>
                      <div className="text-xs text-muted-foreground flex items-center gap-2 mt-0.5 flex-wrap">
                        <span className="flex items-center gap-1"><Phone className="w-3 h-3" />{g.phone}</span>
                        {(g.distanceKm ?? g.distance) != null && (
                          <span className="flex items-center gap-1">
                            <MapPin className="w-3 h-3" />{g.distanceKm ?? g.distance} km
                          </span>
                        )}
                        <span className="flex items-center gap-1">
                          <Clock className="w-3 h-3" />{formatRelativeTime(g.lastSeen)}
                        </span>
                      </div>
                      {g.message && (
                        <p className="text-xs text-foreground/70 italic mt-1 text-pretty">"{g.message}"</p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        )}
      </main>
    </div>
  );
}
