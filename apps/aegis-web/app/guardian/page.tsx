"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Bell,
  MapPin,
  Phone,
  CheckCircle,
  AlertTriangle,
  Mic,
  MessageSquare,
  Send,
  PhoneCall,
  Siren,
  Camera,
  Users,
  ArrowLeft,
  Clock,
  Battery,
  Signal,
  Menu,
  X,
} from "lucide-react";
import { cn, formatRelativeTime, formatTime } from "@/lib/utils";
import { useAegisStore } from "@/hooks/useStore";
import { demoAlerts, demoGuardians, demoChatMessages } from "@/lib/demo-data";
import Link from "next/link";
import { Alert, Guardian, ChatMessage } from "@/types";

export default function GuardianDashboard() {
  const user = useAegisStore((s) => s.user);
  const setAlerts = useAegisStore((s) => s.setAlerts);
  const setGuardians = useAegisStore((s) => s.setGuardians);
  const setChatMessages = useAegisStore((s) => s.setChatMessages);
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [activeTab, setActiveTab] = useState("alerts");
  const [chatInput, setChatInput] = useState("");

  useEffect(() => {
    setAlerts(demoAlerts);
    setGuardians(demoGuardians);
    setChatMessages(demoChatMessages);
  }, [setAlerts, setGuardians, setChatMessages]);

  const alerts = useAegisStore((s) => s.alerts);
  const guardians = useAegisStore((s) => s.guardians);
  const chatMessages = useAegisStore((s) => s.chatMessages);
  const addChatMessage = useAegisStore((s) => s.addChatMessage);

  const activeAlerts = alerts.filter(
    (a) => a.status === "active" || a.status === "acknowledged" || a.status === "dispatched"
  );

  const handleAcknowledge = (alertId: string) => {
    // In a real app, this would call an API
    console.log("Acknowledged alert", alertId);
  };

  const handleSendMessage = () => {
    if (!chatInput.trim()) return;
    const msg: ChatMessage = {
      id: `M${Date.now()}`,
      senderId: user?.id || "me",
      senderName: user?.name || "You",
      content: chatInput,
      timestamp: new Date().toISOString(),
      type: "text",
    };
    addChatMessage(msg);
    setChatInput("");
  };

  if (selectedAlert) {
    return (
      <AlertDetailView
        alert={selectedAlert}
        guardians={guardians}
        chatMessages={chatMessages}
        chatInput={chatInput}
        setChatInput={setChatInput}
        onSendMessage={handleSendMessage}
        onBack={() => setSelectedAlert(null)}
        onAcknowledge={() => handleAcknowledge(selectedAlert.id)}
      />
    );
  }

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-7 w-7 text-emerald-500" />
              <div>
                <h1 className="text-base font-bold">Guardian Dashboard</h1>
                <p className="text-xs text-slate-400">
                  Emergency Contact Interface
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-4">
              <div className="flex items-center space-x-2 text-sm text-slate-300">
                <Users className="h-4 w-4" />
                <span>{guardians.filter((g) => g.status !== "offline").length} Online</span>
              </div>
              <div className="h-8 w-8 bg-emerald-600 rounded-full flex items-center justify-center text-sm font-bold">
                {user?.name?.[0] || "G"}
              </div>
            </div>

            <button
              className="md:hidden p-2"
              onClick={() => setMobileMenuOpen(!mobileMenuOpen)}
            >
              {mobileMenuOpen ? (
                <X className="h-6 w-6" />
              ) : (
                <Menu className="h-6 w-6" />
              )}
            </button>
          </div>
        </div>
      </header>

      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-900 rounded-lg p-1 w-fit mb-6">
          {[
            { id: "alerts", label: "Active Alerts", icon: <Bell className="h-4 w-4" /> },
            { id: "coordination", label: "Coordination", icon: <Users className="h-4 w-4" /> },
          ].map((tab) => (
            <button
              key={tab.id}
              onClick={() => setActiveTab(tab.id)}
              className={cn(
                "flex items-center space-x-2 px-4 py-2 rounded-md text-sm font-medium transition-colors",
                activeTab === tab.id
                  ? "bg-slate-700 text-white"
                  : "text-slate-400 hover:text-white hover:bg-slate-800"
              )}
            >
              {tab.icon}
              <span>{tab.label}</span>
            </button>
          ))}
        </div>

        {activeTab === "alerts" && (
          <div className="space-y-4">
            {activeAlerts.length === 0 ? (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
                <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
                <h3 className="text-lg font-semibold">No Active Alerts</h3>
                <p className="text-slate-400 mt-1">
                  You will be notified when an alert is triggered.
                </p>
              </div>
            ) : (
              activeAlerts.map((alert) => (
                <AlertCard
                  key={alert.id}
                  alert={alert}
                  onView={() => setSelectedAlert(alert)}
                  onAcknowledge={() => handleAcknowledge(alert.id)}
                />
              ))
            )}
          </div>
        )}

        {activeTab === "coordination" && (
          <GuardianCoordination
            guardians={guardians}
            chatMessages={chatMessages}
            chatInput={chatInput}
            setChatInput={setChatInput}
            onSendMessage={handleSendMessage}
          />
        )}
      </main>
    </div>
  );
}

function AlertCard({
  alert,
  onView,
  onAcknowledge,
}: {
  alert: Alert;
  onView: () => void;
  onAcknowledge: () => void;
}) {
  const isCritical = alert.priority === "critical";

  return (
    <div
      className={cn(
        "bg-slate-900 border rounded-xl overflow-hidden transition-all hover:border-opacity-100",
        isCritical
          ? "border-red-900/50 hover:border-red-600"
          : "border-slate-800 hover:border-slate-700"
      )}
    >
      {/* Alert Banner */}
      <div
        className={cn(
          "px-4 py-3 flex items-center justify-between",
          isCritical ? "bg-red-600/20" : "bg-orange-600/10"
        )}
      >
        <div className="flex items-center space-x-3">
          <div className="relative">
            {isCritical && (
              <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
            )}
            <AlertTriangle
              className={cn(
                "h-5 w-5",
                isCritical ? "text-red-400" : "text-orange-400"
              )}
            />
          </div>
          <div>
            <h3 className="font-bold text-sm uppercase tracking-wide">
              Emergency Alert
            </h3>
            <p className="text-xs text-slate-400">
              {formatRelativeTime(alert.timestamp)}
            </p>
          </div>
        </div>
        <span
          className={cn(
            "px-2 py-0.5 rounded-full text-xs font-bold uppercase",
            isCritical
              ? "bg-red-600/30 text-red-400"
              : "bg-orange-600/30 text-orange-400"
          )}
        >
          {alert.priority}
        </span>
      </div>

      {/* Alert Content */}
      <div className="p-4">
        <div className="flex items-start justify-between">
          <div className="space-y-2">
            <div>
              <h4 className="text-xl font-bold">{alert.victimName}</h4>
              <p className="text-sm text-slate-400">
                {alert.victimGender}, {alert.victimAge} years old
              </p>
            </div>

            <div className="flex flex-wrap items-center gap-x-4 gap-y-1 text-sm text-slate-300">
              <span className="flex items-center space-x-1">
                <MapPin className="h-4 w-4 text-slate-500" />
                <span>{alert.address || "Unknown location"}</span>
              </span>
              <span className="flex items-center space-x-1">
                <Clock className="h-4 w-4 text-slate-500" />
                <span>{formatTime(alert.timestamp)}</span>
              </span>
              {alert.batteryLevel && (
                <span className="flex items-center space-x-1">
                  <Battery className="h-4 w-4 text-slate-500" />
                  <span>{alert.batteryLevel}%</span>
                </span>
              )}
              {alert.signalStrength && (
                <span className="flex items-center space-x-1">
                  <Signal className="h-4 w-4 text-slate-500" />
                  <span>{alert.signalStrength}</span>
                </span>
              )}
            </div>

            {alert.audioStreaming && (
              <div className="flex items-center space-x-2 text-sm text-emerald-400">
                <Mic className="h-4 w-4 animate-pulse" />
                <span>Live audio streaming</span>
              </div>
            )}

            <div className="flex items-center space-x-2 text-sm text-slate-400">
              <Users className="h-4 w-4" />
              <span>
                {alert.guardiansNotified} notified,{" "}
                {alert.guardiansAcknowledged} acknowledged
              </span>
            </div>
          </div>
        </div>

        {/* Actions */}
        <div className="flex items-center space-x-3 mt-4 pt-4 border-t border-slate-800">
          <button
            onClick={onAcknowledge}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg font-medium transition-colors"
          >
            <CheckCircle className="h-4 w-4" />
            <span>Acknowledge</span>
          </button>
          <button
            onClick={onView}
            className="flex-1 flex items-center justify-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 border border-slate-700 rounded-lg font-medium transition-colors"
          >
            <MapPin className="h-4 w-4" />
            <span>View on Map</span>
          </button>
        </div>
      </div>
    </div>
  );
}

function AlertDetailView({
  alert,
  guardians,
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
  onBack,
  onAcknowledge,
}: {
  alert: Alert;
  guardians: Guardian[];
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  onSendMessage: () => void;
  onBack: () => void;
  onAcknowledge: () => void;
}) {
  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <div className="bg-red-600 px-4 py-3 sticky top-0 z-50">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <button onClick={onBack} className="p-1 hover:bg-red-700 rounded">
              <ArrowLeft className="h-5 w-5" />
            </button>
            <div>
              <h1 className="text-lg font-bold">EMERGENCY ALERT</h1>
              <p className="text-sm opacity-90">
                {alert.victimName} needs immediate assistance
              </p>
            </div>
          </div>
          <div className="flex items-center space-x-2">
            <span className="animate-ping absolute inline-flex h-3 w-3 rounded-full bg-red-300 opacity-75" />
            <span className="relative inline-flex rounded-full h-3 w-3 bg-red-300" />
          </div>
        </div>
      </div>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Main Info */}
          <div className="lg:col-span-2 space-y-6">
            {/* Victim Info */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">Victim Information</h2>
              <div className="grid grid-cols-2 gap-4 text-sm">
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
                  <div className="text-slate-500">Location</div>
                  <div className="font-medium">{alert.address}</div>
                </div>
                <div>
                  <div className="text-slate-500">Status</div>
                  <div className="font-medium text-red-400 uppercase">
                    {alert.status}
                  </div>
                </div>
              </div>
            </div>

            {/* Live Tracking */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                <MapPin className="h-5 w-5 text-red-400" />
                <span>Live Tracking</span>
              </h2>
              {/* Map Placeholder */}
              <div className="h-64 bg-slate-950 rounded-lg border border-slate-800 relative overflow-hidden">
                <svg viewBox="0 0 400 250" className="w-full h-full">
                  <rect width="400" height="250" fill="#0f172a" />
                  {/* Grid */}
                  {Array.from({ length: 10 }).map((_, i) => (
                    <line key={`v${i}`} x1={i * 40} y1={0} x2={i * 40} y2={250} stroke="rgba(51,65,85,0.2)" strokeWidth={0.5} />
                  ))}
                  {Array.from({ length: 7 }).map((_, i) => (
                    <line key={`h${i}`} x1={0} y1={i * 40} x2={400} y2={i * 40} stroke="rgba(51,65,85,0.2)" strokeWidth={0.5} />
                  ))}
                  {/* Path */}
                  <polyline
                    points="50,200 100,180 150,160 200,140 250,120 300,100"
                    fill="none"
                    stroke="#EF4444"
                    strokeWidth={2}
                    strokeDasharray="5,5"
                  />
                  {/* Victim marker */}
                  <circle cx="300" cy="100" r={8} fill="#EF4444" stroke="white" strokeWidth={2} />
                  {/* Guardian markers */}
                  <circle cx="100" cy="200" r={6} fill="#10B981" />
                  <circle cx="350" cy="180" r={6} fill="#10B981" />
                </svg>
              </div>
              <div className="grid grid-cols-3 gap-4 mt-3 text-sm">
                <div>
                  <div className="text-slate-500">Current Speed</div>
                  <div className="font-medium text-red-400">
                    {alert.speed} km/h
                  </div>
                </div>
                <div>
                  <div className="text-slate-500">Heading</div>
                  <div className="font-medium">{alert.heading}</div>
                </div>
                <div>
                  <div className="text-slate-500">Last Update</div>
                  <div className="font-medium">
                    {formatRelativeTime(alert.timestamp)}
                  </div>
                </div>
              </div>
            </div>

            {/* Audio Stream */}
            {alert.audioStreaming && (
              <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
                <h2 className="text-lg font-semibold mb-3 flex items-center space-x-2">
                  <Mic className="h-5 w-5 text-red-400 animate-pulse" />
                  <span>Live Audio Stream</span>
                </h2>
                <div className="bg-slate-950 rounded-lg p-4 border border-slate-800">
                  {/* Waveform visualization */}
                  <div className="flex items-center justify-center space-x-1 h-16">
                    {Array.from({ length: 40 }).map((_, i) => (
                      <div
                        key={i}
                        className="w-1.5 bg-red-500 rounded-full waveform-bar"
                        style={{
                          height: `${Math.random() * 100}%`,
                          animationDelay: `${i * 0.05}s`,
                        }}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-slate-500 text-center mt-2">
                    Streaming... (32kbps)
                  </p>
                </div>
                {alert.aiAnalysis && (
                  <div className="mt-4 space-y-2 text-sm">
                    <h3 className="font-semibold text-slate-300">
                      AI Audio Analysis:
                    </h3>
                    <ul className="space-y-1 text-slate-400">
                      <li>
                        Multiple male voices detected ({alert.aiAnalysis.voicesDetected} voices)
                      </li>
                      <li>
                        Language: {alert.aiAnalysis.language} (
                        {Math.round(alert.aiAnalysis.confidence * 100)}% confidence)
                      </li>
                      <li>
                        Keywords: {alert.aiAnalysis.keywords.join(", ")}
                      </li>
                      <li className="text-orange-400">
                        Stress level: {alert.aiAnalysis.stressLevel}
                      </li>
                      {alert.aiAnalysis.vehicleEngine && (
                        <li>Vehicle engine audible</li>
                      )}
                    </ul>
                  </div>
                )}
              </div>
            )}

            {/* Guardian Responses */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h2 className="text-lg font-semibold mb-3">Guardian Responses</h2>
              <div className="space-y-3">
                {guardians.map((g) => (
                  <div
                    key={g.id}
                    className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg"
                  >
                    <div
                      className={cn(
                        "w-2 h-2 rounded-full mt-2 flex-shrink-0",
                        g.status === "acknowledged"
                          ? "bg-emerald-500"
                          : g.status === "online"
                          ? "bg-blue-500"
                          : "bg-slate-500"
                      )}
                    />
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">
                          {g.name} ({g.relationship})
                        </span>
                        <span className="text-xs text-slate-500">
                          {g.status === "acknowledged"
                            ? "Acknowledged"
                            : g.status === "online"
                            ? "Online"
                            : "Offline"}
                        </span>
                      </div>
                      {g.message && (
                        <p className="text-sm text-slate-400 mt-1">
                          {g.message}
                        </p>
                      )}
                      {g.distance && (
                        <p className="text-xs text-slate-500 mt-1">
                          {g.distance} km away
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Sidebar */}
          <div className="space-y-4">
            {/* Quick Actions */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3">Quick Actions</h3>
              <div className="space-y-2">
                <button className="w-full flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                  <PhoneCall className="h-4 w-4 text-emerald-400" />
                  <span>Call Victim</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                  <Siren className="h-4 w-4 text-red-400" />
                  <span>Call Police</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                  <Phone className="h-4 w-4 text-blue-400" />
                  <span>Call Hospital</span>
                </button>
                <button className="w-full flex items-center space-x-2 px-4 py-2.5 bg-slate-800 hover:bg-slate-700 rounded-lg text-sm transition-colors">
                  <Bell className="h-4 w-4 text-orange-400" />
                  <span>Broadcast Alert</span>
                </button>
              </div>
            </div>

            {/* Coordination Chat */}
            <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
              <h3 className="font-semibold mb-3 flex items-center space-x-2">
                <MessageSquare className="h-4 w-4" />
                <span>Coordination Chat</span>
              </h3>
              <div className="h-64 overflow-y-auto space-y-3 mb-3 pr-1">
                {chatMessages.map((msg) => (
                  <div key={msg.id} className="text-sm">
                    <div className="flex items-center space-x-2 mb-0.5">
                      <span className="font-medium text-slate-300">
                        {msg.senderName}
                      </span>
                      <span className="text-xs text-slate-600">
                        {formatRelativeTime(msg.timestamp)}
                      </span>
                    </div>
                    <p className="text-slate-400">{msg.content}</p>
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
                  placeholder="Type message..."
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

function GuardianCoordination({
  guardians,
  chatMessages,
  chatInput,
  setChatInput,
  onSendMessage,
}: {
  guardians: Guardian[];
  chatMessages: ChatMessage[];
  chatInput: string;
  setChatInput: (v: string) => void;
  onSendMessage: () => void;
}) {
  return (
    <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
      <div className="lg:col-span-1">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
          <h2 className="text-lg font-semibold mb-4">Guardians Online</h2>
          <div className="space-y-3">
            {guardians.map((g) => (
              <div
                key={g.id}
                className="flex items-center space-x-3 p-3 bg-slate-800/50 rounded-lg"
              >
                <div
                  className={cn(
                    "w-2 h-2 rounded-full",
                    g.status === "acknowledged"
                      ? "bg-emerald-500"
                      : g.status === "online"
                      ? "bg-blue-500"
                      : "bg-slate-500"
                  )}
                />
                <div className="flex-1 min-w-0">
                  <div className="font-medium text-sm truncate">{g.name}</div>
                  <div className="text-xs text-slate-500">
                    {g.relationship}
                    {g.distance && ` | ${g.distance}km`}
                  </div>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      <div className="lg:col-span-2">
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-4 h-full flex flex-col">
          <h2 className="text-lg font-semibold mb-4">Coordination Chat</h2>
          <div className="flex-1 overflow-y-auto space-y-3 mb-4 pr-1 min-h-[300px]">
            {chatMessages.map((msg) => (
              <div key={msg.id} className="text-sm">
                <div className="flex items-center space-x-2 mb-0.5">
                  <span className="font-medium text-slate-300">
                    {msg.senderName}
                  </span>
                  <span className="text-xs text-slate-600">
                    {formatRelativeTime(msg.timestamp)}
                  </span>
                </div>
                <p className="text-slate-400">{msg.content}</p>
              </div>
            ))}
          </div>
          <div className="flex items-center space-x-2">
            <input
              type="text"
              value={chatInput}
              onChange={(e) => setChatInput(e.target.value)}
              onKeyDown={(e) => e.key === "Enter" && onSendMessage()}
              className="flex-1 px-3 py-2.5 bg-slate-800 border border-slate-700 rounded-lg text-sm text-white placeholder-slate-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              placeholder="Type message..."
            />
            <button
              onClick={onSendMessage}
              className="p-2.5 bg-emerald-600 hover:bg-emerald-500 rounded-lg transition-colors"
            >
              <Send className="h-4 w-4" />
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
