"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  AlertTriangle,
  MapPin,
  Clock,
  Phone,
  Siren,
  CheckCircle,
  XCircle,
  Users,
  Activity,
  ChevronRight,
  ArrowRight,
  Send,
  FileText,
  Plus,
  Filter,
  Zap,
  AlertOctagon,
  Navigation,
  BarChart3,
  Settings,
} from "lucide-react";
import { cn, formatRelativeTime, formatTime, getRiskColor, getRiskLabel } from "@/lib/utils";
import { useAegisStore } from "@/hooks/useStore";
import {
  demoAlerts,
  demoGuardians,
  demoResponseUnits,
  demoSafeZones,
  demoRiskZones,
  demoChatMessages,
} from "@/lib/demo-data";
import Link from "next/link";
import { Alert, ResponseUnit, LogEntry } from "@/types";

export default function CommandCenter() {
  const user = useAegisStore((s) => s.user);
  const setAlerts = useAegisStore((s) => s.setAlerts);
  const setResponseUnits = useAegisStore((s) => s.setResponseUnits);
  const setChatMessages = useAegisStore((s) => s.setChatMessages);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [activeView, setActiveView] = useState("operations");
  const [chatInput, setChatInput] = useState("");
  const [newNote, setNewNote] = useState("");
  const [filterPriority, setFilterPriority] = useState<string | null>(null);

  useEffect(() => {
    setAlerts(demoAlerts);
    setResponseUnits(demoResponseUnits);
    setChatMessages(demoChatMessages);
  }, [setAlerts, setResponseUnits, setChatMessages]);

  const alerts = useAegisStore((s) => s.alerts);
  const responseUnits = useAegisStore((s) => s.responseUnits);
  const systemStatus = useAegisStore((s) => s.systemStatus);
  const chatMessages = useAegisStore((s) => s.chatMessages);
  const addChatMessage = useAegisStore((s) => s.addChatMessage);
  const updateAlert = useAegisStore((s) => s.updateAlert);

  const filteredAlerts = filterPriority
    ? alerts.filter((a) => a.priority === filterPriority)
    : alerts;

  const handleDispatch = (alertId: string, unitId: string) => {
    updateAlert(alertId, { status: "dispatched" });
    console.log(`Dispatched unit ${unitId} to alert ${alertId}`);
  };

  const handleEscalate = (alertId: string) => {
    updateAlert(alertId, { priority: "critical" });
    console.log(`Escalated alert ${alertId}`);
  };

  const handleResolve = (alertId: string) => {
    updateAlert(alertId, { status: "resolved" });
    console.log(`Resolved alert ${alertId}`);
  };

  const handleAddNote = () => {
    if (!newNote.trim() || !selectedAlert) return;
    const note: LogEntry = {
      id: `L${Date.now()}`,
      timestamp: new Date().toISOString(),
      message: newNote,
      author: user?.name || "Officer",
      type: "officer",
    };
    updateAlert(selectedAlert.id, {
      logEntries: [...selectedAlert.logEntries, note],
    });
    setNewNote("");
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg = {
      id: `M${Date.now()}`,
      senderId: user?.id || "officer",
      senderName: user?.name || "Officer",
      content: chatInput,
      timestamp: new Date().toISOString(),
      type: "text" as const,
    };
    addChatMessage(msg);
    setChatInput("");
  };

  if (selectedAlert) {
    return (
      <AlertDetailPanel
        alert={selectedAlert}
        responseUnits={responseUnits}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onSendMessage={handleSendMessage}
        newNote={newNote}
        setNewNote={setNewNote}
        onAddNote={handleAddNote}
        onBack={() => setSelectedAlert(null)}
        onDispatch={(unitId) => handleDispatch(selectedAlert.id, unitId)}
        onEscalate={() => handleEscalate(selectedAlert.id)}
        onResolve={() => {
          handleResolve(selectedAlert.id);
          setSelectedAlert(null);
        }}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Top Bar */}
      <header className="border-b border-slate-800 bg-slate-900/90 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex items-center justify-between h-14">
            <div className="flex items-center space-x-4">
              <Shield className="h-6 w-6 text-emerald-500" />
              <div>
                <h1 className="text-sm font-bold">AEGIS COMMAND CENTER</h1>
                <div className="flex items-center space-x-2 text-xs">
                  <span className="flex items-center space-x-1 text-emerald-400">
                    <span className="w-1.5 h-1.5 rounded-full bg-emerald-500" />
                    <span>System Nominal</span>
                  </span>
                  <span className="text-slate-500">|</span>
                  <span className="text-slate-400">
                    {user?.name || "Watch Officer"}
                  </span>
                </div>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6 text-sm">
              <div className="flex items-center space-x-2">
                <AlertTriangle className="h-4 w-4 text-red-400" />
                <span>
                  Active: {alerts.filter((a) => a.status === "active").length}
                </span>
                <span className="text-red-400">
                  Critical:{" "}
                  {
                    alerts.filter(
                      (a) =>
                        a.priority === "critical" && a.status !== "resolved"
                    ).length
                  }
                </span>
              </div>
              <div className="h-8 w-8 bg-slate-700 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.name?.[0] || "O"}
              </div>
            </div>
          </div>
        </div>
      </header>

      {/* View Navigation */}
      <div className="border-b border-slate-800 bg-slate-900/50">
        <div className="max-w-[1600px] mx-auto px-4 sm:px-6">
          <div className="flex space-x-1 py-2">
            {[
              { id: "operations", label: "Operations", icon: <Siren className="h-4 w-4" /> },
              { id: "analytics", label: "Analytics", icon: <BarChart3 className="h-4 w-4" /> },
              { id: "units", label: "Units", icon: <Navigation className="h-4 w-4" /> },
              { id: "settings", label: "Settings", icon: <Settings className="h-4 w-4" /> },
            ].map((view) => (
              <button
                key={view.id}
                onClick={() => setActiveView(view.id)}
                className={cn(
                  "flex items-center space-x-2 px-4 py-1.5 rounded-md text-sm font-medium transition-colors",
                  activeView === view.id
                    ? "bg-slate-700 text-white"
                    : "text-slate-400 hover:text-white hover:bg-slate-800"
                )}
              >
                {view.icon}
                <span className="hidden sm:inline">{view.label}</span>
              </button>
            ))}
          </div>
        </div>
      </div>

      <main className="max-w-[1600px] mx-auto px-4 sm:px-6 py-4">
        {activeView === "operations" && (
          <OperationsView
            alerts={filteredAlerts}
            responseUnits={responseUnits}
            systemStatus={systemStatus}
            riskZones={demoRiskZones}
            onSelectAlert={setSelectedAlert}
            onDispatch={handleDispatch}
            onEscalate={handleEscalate}
            filterPriority={filterPriority}
            setFilterPriority={setFilterPriority}
          />
        )}

        {activeView === "analytics" && <AnalyticsView alerts={alerts} />}

        {activeView === "units" && (
          <UnitsView
            units={responseUnits}
            onSelectUnit={(unit) => console.log("Selected unit", unit)}
          />
        )}

        {activeView === "settings" && <SettingsView />}
      </main>
    </div>
  );
}

function OperationsView({
  alerts,
  responseUnits,
  systemStatus,
  riskZones,
  onSelectAlert,
  onDispatch,
  onEscalate,
  filterPriority,
  setFilterPriority,
}: {
  alerts: Alert[];
  responseUnits: ResponseUnit[];
  systemStatus: ReturnType<typeof useAegisStore.getState>["systemStatus"];
  riskZones: typeof demoRiskZones;
  onSelectAlert: (alert: Alert) => void;
  onDispatch: (alertId: string, unitId: string) => void;
  onEscalate: (alertId: string) => void;
  filterPriority: string | null;
  setFilterPriority: (p: string | null) => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-4 h-[calc(100vh-180px)]">
      {/* Map Area */}
      <div className="lg:col-span-2 bg-slate-900 border border-slate-800 rounded-xl overflow-hidden flex flex-col">
        <div className="p-3 border-b border-slate-800 flex items-center justify-between">
          <h2 className="font-semibold flex items-center space-x-2">
            <MapPin className="h-4 w-4 text-emerald-400" />
            <span>Operations Map</span>
          </h2>
          <div className="flex items-center space-x-2 text-xs">
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-red-500 animate-pulse" />
              <span className="text-slate-400">Alerts</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-blue-500" />
              <span className="text-slate-400">Units</span>
            </span>
            <span className="flex items-center space-x-1">
              <span className="w-2 h-2 rounded-full bg-emerald-500" />
              <span className="text-slate-400">Safe Zones</span>
            </span>
          </div>
        </div>
        <div className="flex-1 relative bg-slate-950">
          <svg viewBox="0 0 600 400" className="w-full h-full">
            {/* Grid */}
            {Array.from({ length: 15 }).map((_, i) => (
              <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={400} stroke="rgba(51,65,85,0.3)" strokeWidth={0.5} />
            ))}
            {Array.from({ length: 10 }).map((_, i) => (
              <line key={`h${i}`} x1={0} y1={i * 40} x2={600} y2={i * 40} stroke="rgba(51,65,85,0.3)" strokeWidth={0.5} />
            ))}

            {/* Risk Zones */}
            {riskZones.map((zone) => {
              const color = getRiskColor(zone.riskScore);
              return (
                <polygon
                  key={zone.id}
                  points={zone.geometry.coordinates[0].map((c) => `${(c[0] - 6.5) * 150},${(11.5 - c[1]) * 150}`).join(" ")}
                  fill={color}
                  fillOpacity={0.15}
                  stroke={color}
                  strokeWidth={1}
                  strokeDasharray="4,4"
                />
              );
            })}

            {/* Safe zones */}
            {demoSafeZones.map((sz) => (
              <g key={sz.id}>
                <rect
                  x={(sz.location.lng - 6.5) * 150 - 6}
                  y={(11.5 - sz.location.lat) * 150 - 6}
                  width={12}
                  height={12}
                  fill="#10B981"
                  stroke="white"
                  strokeWidth={1}
                  rx={2}
                />
                <text
                  x={(sz.location.lng - 6.5) * 150 + 10}
                  y={(11.5 - sz.location.lat) * 150 + 4}
                  fill="#10B981"
                  fontSize={9}
                >
                  {sz.name}
                </text>
              </g>
            ))}

            {/* Alert markers */}
            {alerts
              .filter((a) => a.status !== "resolved" && a.status !== "false_alarm")
              .map((alert) => (
                <g key={alert.id}>
                  <circle
                    cx={(alert.location.lng - 6.5) * 150}
                    cy={(11.5 - alert.location.lat) * 150}
                    r={14}
                    fill={alert.priority === "critical" ? "#EF4444" : "#F59E0B"}
                    fillOpacity={0.3}
                    className={alert.priority === "critical" ? "animate-pulse" : ""}
                  />
                  <circle
                    cx={(alert.location.lng - 6.5) * 150}
                    cy={(11.5 - alert.location.lat) * 150}
                    r={7}
                    fill={alert.priority === "critical" ? "#EF4444" : "#F59E0B"}
                    stroke="white"
                    strokeWidth={2}
                  />
                </g>
              ))}

            {/* Unit markers */}
            {responseUnits
              .filter((u) => u.status === "responding")
              .map((unit) => (
                <g key={unit.id}>
                  <polygon
                    points={`${(unit.location!.lng - 6.5) * 150},${(11.5 - unit.location!.lat) * 150 - 8} ${(unit.location!.lng - 6.5) * 150 - 6},${(11.5 - unit.location!.lat) * 150 + 6} ${(unit.location!.lng - 6.5) * 150 + 6},${(11.5 - unit.location!.lat) * 150 + 6}`}
                    fill="#3B82F6"
                    stroke="white"
                    strokeWidth={1}
                  />
                  <text
                    x={(unit.location!.lng - 6.5) * 150 + 10}
                    y={(11.5 - unit.location!.lat) * 150 + 4}
                    fill="#3B82F6"
                    fontSize={9}
                  >
                    {unit.name}
                  </text>
                </g>
              ))}
          </svg>
        </div>
      </div>

      {/* Side Panel */}
      <div className="space-y-4 overflow-y-auto">
        {/* Filters */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <div className="flex items-center space-x-2 mb-2">
            <Filter className="h-4 w-4 text-slate-400" />
            <span className="text-sm font-medium">Filter</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {["critical", "high", "medium", "low"].map((p) => (
              <button
                key={p}
                onClick={() =>
                  setFilterPriority(filterPriority === p ? null : p)
                }
                className={cn(
                  "px-2 py-1 rounded-md text-xs font-medium uppercase transition-colors",
                  filterPriority === p
                    ? "bg-slate-600 text-white"
                    : "bg-slate-800 text-slate-400 hover:bg-slate-700"
                )}
              >
                {p}
              </button>
            ))}
          </div>
        </div>

        {/* Active Alerts */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <h3 className="font-semibold text-sm mb-3 flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-400" />
            <span>Active Alerts</span>
            <span className="text-xs text-slate-500">
              ({alerts.filter((a) => a.status !== "resolved").length})
            </span>
          </h3>
          <div className="space-y-2">
            {alerts
              .filter((a) => a.status !== "resolved" && a.status !== "false_alarm")
              .map((alert) => (
                <div
                  key={alert.id}
                  className={cn(
                    "p-3 rounded-lg border cursor-pointer transition-all",
                    alert.priority === "critical"
                      ? "bg-red-900/20 border-red-900/50 hover:border-red-600"
                      : alert.priority === "high"
                      ? "bg-orange-900/20 border-orange-900/30 hover:border-orange-600"
                      : "bg-slate-800/50 border-slate-700 hover:border-slate-600"
                  )}
                  onClick={() => onSelectAlert(alert)}
                >
                  <div className="flex items-start justify-between">
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center space-x-2">
                        <span
                          className={cn(
                            "w-2 h-2 rounded-full",
                            alert.status === "active"
                              ? "bg-red-500 animate-pulse"
                              : alert.status === "acknowledged"
                              ? "bg-yellow-500"
                              : "bg-blue-500"
                          )}
                        />
                        <span className="font-medium text-sm truncate">
                          #{alert.id}
                        </span>
                        <span
                          className={cn(
                            "text-[10px] px-1.5 py-0.5 rounded-full font-bold uppercase",
                            alert.priority === "critical"
                              ? "bg-red-600/30 text-red-400"
                              : alert.priority === "high"
                              ? "bg-orange-600/30 text-orange-400"
                              : "bg-yellow-600/30 text-yellow-400"
                          )}
                        >
                          {alert.priority}
                        </span>
                      </div>
                      <p className="text-xs text-slate-400 mt-1">
                        {alert.victimName} - {alert.address}
                      </p>
                      <div className="flex items-center space-x-3 mt-1 text-xs text-slate-500">
                        <span>{formatRelativeTime(alert.timestamp)}</span>
                        <span>{alert.guardiansNotified} guardians</span>
                      </div>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2 mt-2">
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onDispatch(alert.id, "U2");
                      }}
                      className="flex-1 px-2 py-1 bg-blue-600/30 hover:bg-blue-600/50 text-blue-400 rounded text-xs font-medium transition-colors"
                    >
                      Dispatch
                    </button>
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        onEscalate(alert.id);
                      }}
                      className="flex-1 px-2 py-1 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded text-xs font-medium transition-colors"
                    >
                      Escalate
                    </button>
                  </div>
                </div>
              ))}
          </div>
        </div>

        {/* Unit Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <h3 className="font-semibold text-sm mb-3">Unit Status</h3>
          <div className="space-y-2">
            {responseUnits.map((unit) => (
              <div
                key={unit.id}
                className="flex items-center justify-between text-sm"
              >
                <div className="flex items-center space-x-2">
                  <span
                    className={cn(
                      "w-2 h-2 rounded-full",
                      unit.status === "available"
                        ? "bg-emerald-500"
                        : unit.status === "responding"
                        ? "bg-blue-500"
                        : unit.status === "standby"
                        ? "bg-yellow-500"
                        : "bg-red-500"
                    )}
                  />
                  <span className="text-slate-300">{unit.name}</span>
                </div>
                <span className="text-xs text-slate-500 capitalize">
                  {unit.status.replace("_", " ")}
                  {unit.eta && ` (ETA ${unit.eta}m)`}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* System Status */}
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-3">
          <h3 className="font-semibold text-sm mb-3">System Status</h3>
          <div className="space-y-2 text-sm">
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Mesh Network</span>
              <span className="text-emerald-400">
                {systemStatus.meshNodes} nodes
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">SMS Gateway</span>
              <span className="text-emerald-400 capitalize">
                {systemStatus.smsGateway}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Database</span>
              <span className="text-emerald-400 capitalize">
                {systemStatus.database}
              </span>
            </div>
            <div className="flex items-center justify-between">
              <span className="text-slate-400">Network Uptime</span>
              <span className="text-emerald-400">
                {systemStatus.networkUptime}%
              </span>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AlertDetailPanel({
  alert,
  responseUnits,
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
  newNote,
  setNewNote,
  onAddNote,
  onBack,
  onDispatch,
  onEscalate,
  onResolve,
}: {
  alert: Alert;
  responseUnits: ResponseUnit[];
  chatMessages: typeof demoChatMessages;
  chatInput: string;
  setChatInput: (v: string) => void;
  onSendMessage: () => void;
  newNote: string;
  setNewNote: (v: string) => void;
  onAddNote: () => void;
  onBack: () => void;
  onDispatch: (unitId: string) => void;
  onEscalate: () => void;
  onResolve: () => void;
}) {
  const availableUnits = responseUnits.filter((u) => u.status === "available");

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-slate-900 border-b border-slate-800 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-[1600px] mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button
              onClick={onBack}
              className="p-2 hover:bg-slate-800 rounded-lg transition-colors"
            >
              <ArrowRight className="h-5 w-5 rotate-180" />
            </button>
            <div>
              <h1 className="text-lg font-bold">
                Alert Details: {alert.id}
              </h1>
              <p className="text-sm text-slate-400">
                {alert.victimName} - {alert.address}
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <button
              onClick={onEscalate}
              className="px-4 py-2 bg-red-600/30 hover:bg-red-600/50 text-red-400 rounded-lg text-sm font-medium transition-colors"
            >
              Escalate
            </button>
            <button
              onClick={onResolve}
              className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 text-white rounded-lg text-sm font-medium transition-colors"
            >
              Resolve
            </button>
          </div>
        </div>
      </div>

      <div className="max-w-[1600px] mx-auto px-4 sm:px-6 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Content */}
          <div className="lg:col-span-2 space-y-6">
            {/* Victim Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">
                Victim Information
              </h2>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <div className="text-slate-500">Name</div>
                  <div className="font-medium">{alert.victimName}</div>
                </div>
                <div>
                  <div className="text-slate-500">Age</div>
                  <div className="font-medium">
                    {alert.victimAge} ({alert.victimGender})
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="font-medium text-red-400 uppercase">
                    {alert.status}
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Priority</div>
                  <div className="font-medium uppercase">
                    {alert.priority}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Location */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-400" />
                <span>Live Location & Movement</span>
              </h2>
              <div className="h-48 bg-slate-950 rounded-lg border border-slate-800 mb-3">
                <svg viewBox="0 0 400 200" className="w-full h-full">
                  <rect width="400" height="200" fill="#0f172a" />
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={200} stroke="rgba(51,65,85,0.2)" strokeWidth={0.5} />
                  ))}
                  {Array.from({ length: 5 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="rgba(51,65,85,0.2)" strokeWidth={0.5} />
                  ))}
                  <polyline
                    points="50,150 100,140 150,120 200,110 250,90 300,80"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="4,4"
                  />
                  <circle cx="300" cy="80" r={6} fill="#EF4444" stroke="white" strokeWidth={2} />
                </svg>
              </div>
              <div className="space-y-2 text-sm">
                <div className="flex items-center space-x-2 text-orange-400">
                  <AlertTriangle className="h-4 w-4" />
                  <span>{alert.movementPattern}</span>
                </div>
                {alert.aiAnalysis && (
                  <div className="text-orange-400">
                    {Math.round(alert.aiAnalysis.threatScore * 100)}% match with
                    known kidnapping route pattern
                  </div>
                )}
              </div>
            </div>

            {/* Audio Analysis */}
            {alert.aiAnalysis && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-3">
                  AI Audio Analysis
                </h2>
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-500">Voices Detected</div>
                    <div className="text-lg font-bold">
                      {alert.aiAnalysis.voicesDetected}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-500">Language</div>
                    <div className="text-lg font-bold">
                      {alert.aiAnalysis.language}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-500">Stress Level</div>
                    <div className="text-lg font-bold text-red-400">
                      {alert.aiAnalysis.stressLevel}
                    </div>
                  </div>
                  <div className="p-3 bg-slate-800/50 rounded-lg">
                    <div className="text-slate-500">Vehicle Engine</div>
                    <div className="text-lg font-bold">
                      {alert.aiAnalysis.vehicleEngine ? "Yes" : "No"}
                    </div>
                  </div>
                </div>
              </div>
            )}

            {/* Response Log */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <FileText className="h-5 w-5 text-slate-400" />
                <span>Officer Notes / Log</span>
              </h2>
              <div className="space-y-2 mb-4 max-h-64 overflow-y-auto">
                {alert.logEntries.map((entry) => (
                  <div
                    key={entry.id}
                    className="flex items-start space-x-3 text-sm p-2 bg-slate-800/30 rounded"
                  >
                    <span className="text-slate-500 whitespace-nowrap text-xs">
                      {formatTime(entry.timestamp)}
                    </span>
                    <span
                      className={cn(
                        "text-xs px-1.5 py-0.5 rounded capitalize",
                        entry.type === "system"
                          ? "bg-blue-900/30 text-blue-400"
                          : entry.type === "ai"
                          ? "bg-purple-900/30 text-purple-400"
                          : "bg-emerald-900/30 text-emerald-400"
                      )}
                    >
                      {entry.type}
                    </span>
                    <span className="text-slate-300">{entry.message}</span>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={newNote}
                  onChange={(e) => setNewNote(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onAddNote()}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Add note..."
                />
                <button
                  onClick={onAddNote}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  <Plus className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Dispatch Units */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Response Coordination</h3>
              <div className="space-y-2 mb-4">
                {availableUnits.map((unit) => (
                  <div
                    key={unit.id}
                    className="flex items-center justify-between p-2 bg-slate-800/50 rounded-lg"
                  >
                    <div className="text-sm">
                      <div className="font-medium">{unit.name}</div>
                      <div className="text-xs text-slate-500 capitalize">
                        {unit.type.replace("_", " ")} - {unit.region}
                      </div>
                    </div>
                    <button
                      onClick={() => onDispatch(unit.id)}
                      className="px-3 py-1.5 bg-blue-600 hover:bg-blue-500 rounded text-xs font-medium transition-colors"
                    >
                      Dispatch
                    </button>
                  </div>
                ))}
                {availableUnits.length === 0 && (
                  <p className="text-sm text-slate-500 text-center py-4">
                    No available units
                  </p>
                )}
              </div>

              <div className="border-t border-slate-800 pt-3">
                <h4 className="text-sm font-medium text-slate-300 mb-2">
                  Recommended Actions
                </h4>
                <div className="space-y-2">
                  {[
                    "Set up roadblock at suspected route",
                    "Alert nearest police station",
                    "Request drone surveillance",
                    "Notify military checkpoint",
                  ].map((action, i) => (
                    <div
                      key={i}
                      className="flex items-center space-x-2 text-sm text-slate-400"
                    >
                      <Zap className="h-3.5 w-3.5 text-yellow-500" />
                      <span>{action}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>

            {/* Chat */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Coordination</h3>
              <div className="h-48 overflow-y-auto space-y-2 mb-3 pr-1">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="flex items-center space-x-1 mb-0.5">
                      <span className="font-medium text-xs text-slate-300">
                        {msg.senderName}
                      </span>
                    </div>
                    <p className="text-slate-400 text-xs">{msg.content}</p>
                  </div>
                ))}
              </div>
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={chatInput}
                  onChange={(e) => setChatInput(e.target.value)}
                  onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
                  className="flex-1 px-3 py-2 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                  placeholder="Message..."
                />
                <button
                  onClick={onSendMessage}
                  className="p-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
                >
                  <Send className="h-4 w-4" />
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

function AnalyticsView({ alerts }: { alerts: Alert[] }) {
  const resolved = alerts.filter((a) => a.status === "resolved").length;
  const active = alerts.filter(
    (a) => a.status === "active" || a.status === "dispatched"
  ).length;
  const critical = alerts.filter((a) => a.priority === "critical").length;

  const hourlyData = [
    { hour: "00:00", alerts: 2, resolved: 1 },
    { hour: "03:00", alerts: 1, resolved: 1 },
    { hour: "06:00", alerts: 0, resolved: 0 },
    { hour: "09:00", alerts: 3, resolved: 2 },
    { hour: "12:00", alerts: 5, resolved: 3 },
    { hour: "15:00", alerts: 4, resolved: 2 },
    { hour: "18:00", alerts: 7, resolved: 4 },
    { hour: "21:00", alerts: 8, resolved: 5 },
  ];

  const regionData = [
    { region: "North Central", alerts: 15, resolved: 12 },
    { region: "North East", alerts: 8, resolved: 5 },
    { region: "North West", alerts: 22, resolved: 18 },
    { region: "South East", alerts: 4, resolved: 4 },
    { region: "South South", alerts: 6, resolved: 5 },
    { region: "South West", alerts: 3, resolved: 3 },
  ];

  return (
    <div className="space-y-6">
      {/* Summary Cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <SummaryCard label="Total Alerts" value={alerts.length.toString()} color="blue" />
        <SummaryCard label="Active" value={active.toString()} color="red" />
        <SummaryCard label="Resolved" value={resolved.toString()} color="emerald" />
        <SummaryCard label="Critical" value={critical.toString()} color="orange" />
      </div>

      {/* Charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Hourly Alert Volume</h3>
          <div className="h-64 flex items-end space-x-4 px-4">
            {hourlyData.map((d) => (
              <div key={d.hour} className="flex-1 flex flex-col items-center">
                <div className="w-full flex items-end space-x-1">
                  <div
                    className="flex-1 bg-blue-600/70 rounded-t"
                    style={{ height: `${d.alerts * 20}px` }}
                  />
                  <div
                    className="flex-1 bg-emerald-600/70 rounded-t"
                    style={{ height: `${d.resolved * 20}px` }}
                  />
                </div>
                <span className="text-xs text-slate-500 mt-2">{d.hour}</span>
              </div>
            ))}
          </div>
          <div className="flex items-center justify-center space-x-6 mt-4 text-sm">
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-blue-600/70 rounded" />
              <span className="text-slate-400">Alerts</span>
            </span>
            <span className="flex items-center space-x-2">
              <span className="w-3 h-3 bg-emerald-600/70 rounded" />
              <span className="text-slate-400">Resolved</span>
            </span>
          </div>
        </div>

        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h3 className="font-semibold mb-4">Alerts by Region</h3>
          <div className="space-y-3">
            {regionData.map((r) => (
              <div key={r.region}>
                <div className="flex items-center justify-between text-sm mb-1">
                  <span className="text-slate-300">{r.region}</span>
                  <span className="text-slate-500">
                    {r.resolved}/{r.alerts}
                  </span>
                </div>
                <div className="h-2 bg-slate-800 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-blue-600 rounded-full"
                    style={{
                      width: `${(r.resolved / r.alerts) * 100}%`,
                    }}
                  />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}

function SummaryCard({
  label,
  value,
  color,
}: {
  label: string;
  value: string;
  color: string;
}) {
  const colorClasses: Record<string, string> = {
    blue: "text-blue-400",
    red: "text-red-400",
    emerald: "text-emerald-400",
    orange: "text-orange-400",
  };

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="text-sm text-slate-400">{label}</div>
      <div className={`text-2xl font-bold ${colorClasses[color] || "text-white"}`}>
        {value}
      </div>
    </div>
  );
}

function UnitsView({
  units,
  onSelectUnit,
}: {
  units: ResponseUnit[];
  onSelectUnit: (unit: ResponseUnit) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-semibold">Response Units</h2>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors">
          Manage Units
        </button>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {units.map((unit) => (
          <div
            key={unit.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-slate-700 transition-colors cursor-pointer"
            onClick={() => onSelectUnit(unit)}
          >
            <div className="flex items-start justify-between">
              <div>
                <h3 className="font-semibold">{unit.name}</h3>
                <p className="text-sm text-slate-400 capitalize">
                  {unit.type.replace("_", " ")}
                </p>
              </div>
              <span
                className={cn(
                  "px-2 py-0.5 rounded-full text-xs font-medium capitalize",
                  unit.status === "available"
                    ? "bg-emerald-600/30 text-emerald-400"
                    : unit.status === "responding"
                    ? "bg-blue-600/30 text-blue-400"
                    : unit.status === "standby"
                    ? "bg-yellow-600/30 text-yellow-400"
                    : "bg-red-600/30 text-red-400"
                )}
              >
                {unit.status.replace("_", " ")}
              </span>
            </div>
            <div className="mt-3 space-y-1 text-sm text-slate-400">
              <div>Region: {unit.region}</div>
              {unit.eta && <div>ETA: {unit.eta} minutes</div>}
              {unit.currentAlert && (
                <div className="text-blue-400">
                  Responding to {unit.currentAlert}
                </div>
              )}
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function SettingsView() {
  return (
    <div className="max-w-2xl">
      <h2 className="text-xl font-semibold mb-6">System Settings</h2>
      <div className="space-y-4">
        {[
          { label: "Auto-dispatch nearest unit", enabled: true },
          { label: "Enable AI audio analysis", enabled: true },
          { label: "Real-time guardian notifications", enabled: true },
          { label: "SMS fallback for alerts", enabled: true },
          { label: "LoRa mesh broadcast", enabled: true },
          { label: "Public portal data publishing", enabled: true },
        ].map((setting, i) => (
          <div
            key={i}
            className="flex items-center justify-between p-4 bg-slate-900 border border-slate-800 rounded-xl"
          >
            <span className="text-slate-300">{setting.label}</span>
            <button
              className={cn(
                "w-11 h-6 rounded-full transition-colors relative",
                setting.enabled ? "bg-emerald-600" : "bg-slate-700"
              )}
            >
              <span
                className={cn(
                  "absolute top-1 w-4 h-4 rounded-full bg-white transition-transform",
                  setting.enabled ? "left-6" : "left-1"
                )}
              />
            </button>
          </div>
        ))}
      </div>
    </div>
  );
}
