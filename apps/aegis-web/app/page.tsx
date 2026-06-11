"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Activity,
  AlertTriangle,
  CheckCircle,
  Users,
  Smartphone,
  MapPin,
  Menu,
  X,
  Clock,
  ChevronRight,
  Globe,
} from "lucide-react";
import { cn, getRiskColor, getRiskLabel, formatRelativeTime } from "@/lib/utils";
import {
  demoAlerts,
  demoSafeZones,
  demoCommunityReports,
  demoRiskZones,
} from "@/lib/demo-data";
import { Alert, SafeZone, CommunityReport, RiskZone } from "@/types";
import Link from "next/link";

export default function PublicPortal() {
  const [activeTab, setActiveTab] = useState("map");
  const [mobileMenuOpen, setMobileMenuOpen] = useState(false);
  const [currentTime, setCurrentTime] = useState(new Date());

  useEffect(() => {
    const timer = setInterval(() => setCurrentTime(new Date()), 1000);
    return () => clearInterval(timer);
  }, []);

  const activeAlerts = demoAlerts.filter((a) => a.status === "active");
  const resolvedToday = 47;
  const activeGuardians = 23456;
  const sentinelDevices = 5678;
  const safeZones = demoSafeZones.length;

  return (
    <div className="min-h-screen bg-slate-950 text-white">
      {/* Header */}
      <header className="border-b border-slate-800 bg-slate-900/80 backdrop-blur-md sticky top-0 z-50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center space-x-3">
              <Shield className="h-8 w-8 text-emerald-500" />
              <div>
                <h1 className="text-lg font-bold tracking-tight">
                  AEGIS PUBLIC SAFETY PORTAL
                </h1>
                <p className="text-xs text-slate-400">
                  Transparency for Safer Communities
                </p>
              </div>
            </div>

            <div className="hidden md:flex items-center space-x-6">
              <div className="flex items-center space-x-2 text-emerald-400">
                <span className="relative flex h-2 w-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                </span>
                <span className="text-sm font-medium">System Active</span>
              </div>
              <div className="flex items-center space-x-1 text-sm text-slate-400">
                <Globe className="h-4 w-4" />
                <span>EN / HA</span>
              </div>
              <Link
                href="/login/"
                className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors"
              >
                Sign In
              </Link>
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

        {mobileMenuOpen && (
          <div className="md:hidden border-t border-slate-800 px-4 py-3 space-y-3">
            <Link
              href="/login/"
              className="block w-full px-4 py-2 bg-emerald-600 rounded-lg text-center font-medium"
            >
              Sign In
            </Link>
          </div>
        )}
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <StatCard
            icon={<AlertTriangle className="h-5 w-5 text-red-400" />}
            label="Active Alerts"
            value={activeAlerts.length.toString()}
            subtext="Across all regions"
          />
          <StatCard
            icon={<CheckCircle className="h-5 w-5 text-emerald-400" />}
            label="Resolved Today"
            value={resolvedToday.toString()}
            subtext="Successfully handled"
          />
          <StatCard
            icon={<Users className="h-5 w-5 text-blue-400" />}
            label="Active Guardians"
            value={activeGuardians.toLocaleString()}
            subtext="Emergency contacts"
          />
          <StatCard
            icon={<Smartphone className="h-5 w-5 text-purple-400" />}
            label="Sentinel Devices"
            value={sentinelDevices.toLocaleString()}
            subtext="Active safety devices"
          />
        </div>

        {/* Tab Navigation */}
        <div className="flex space-x-1 bg-slate-900 rounded-lg p-1 w-fit">
          {[
            { id: "map", label: "Safety Map", icon: <MapPin className="h-4 w-4" /> },
            { id: "alerts", label: "Active Alerts", icon: <AlertTriangle className="h-4 w-4" /> },
            { id: "reports", label: "Community Reports", icon: <Activity className="h-4 w-4" /> },
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
              <span className="hidden sm:inline">{tab.label}</span>
            </button>
          ))}
        </div>

        {/* Tab Content */}
        {activeTab === "map" && <MapTab riskZones={demoRiskZones} safeZones={demoSafeZones} />}
        {activeTab === "alerts" && <AlertsTab alerts={activeAlerts} />}
        {activeTab === "reports" && <ReportsTab reports={demoCommunityReports} />}

        {/* System Status */}
        <SystemStatusPanel />

        {/* Risk Forecast */}
        <RiskForecastPanel />

        {/* Footer */}
        <footer className="border-t border-slate-800 pt-6 pb-8">
          <div className="flex flex-col md:flex-row items-center justify-between text-sm text-slate-400">
            <div className="flex flex-wrap items-center gap-4">
              <Link href="/" className="hover:text-white transition-colors">
                About Aegis
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                How It Works
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Privacy Policy
              </Link>
              <Link href="/" className="hover:text-white transition-colors">
                Contact
              </Link>
            </div>
            <div className="mt-4 md:mt-0 text-center md:text-right">
              <p>
                &copy; 2026 Aegis Civilian Safety Grid | Regulated by NITDA |
                Audited Quarterly
              </p>
              <p className="text-xs mt-1">
                Last Independent Audit: May 15, 2026
              </p>
            </div>
          </div>
        </footer>
      </main>
    </div>
  );
}

function StatCard({
  icon,
  label,
  value,
  subtext,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
  subtext: string;
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <div className="flex items-center justify-between mb-2">
        {icon}
        <ChevronRight className="h-4 w-4 text-slate-600" />
      </div>
      <div className="text-2xl font-bold">{value}</div>
      <div className="text-sm font-medium text-slate-300">{label}</div>
      <div className="text-xs text-slate-500 mt-1">{subtext}</div>
    </div>
  );
}

function MapTab({
  riskZones,
  safeZones,
}: {
  riskZones: RiskZone[];
  safeZones: SafeZone[];
}) {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl overflow-hidden">
      <div className="p-4 border-b border-slate-800 flex items-center justify-between">
        <h2 className="text-lg font-semibold flex items-center space-x-2">
          <MapPin className="h-5 w-5 text-emerald-400" />
          <span>Live Safety Map</span>
        </h2>
        <div className="flex items-center space-x-4 text-sm">
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-emerald-500" />
            <span className="text-slate-400">Low</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-yellow-500" />
            <span className="text-slate-400">Moderate</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-orange-500" />
            <span className="text-slate-400">High</span>
          </span>
          <span className="flex items-center space-x-1">
            <span className="w-3 h-3 rounded-full bg-red-600" />
            <span className="text-slate-400">Critical</span>
          </span>
        </div>
      </div>

      {/* Static Map Representation */}
      <div className="relative h-[500px] bg-slate-950 overflow-hidden">
        <svg viewBox="0 0 800 500" className="w-full h-full">
          {/* Grid */}
          {Array.from({ length: 20 }).map((_, i) => (
            <line
              key={`v${i}`}
              x1={i * 40}
              y1={0}
              x2={i * 40}
              y2={500}
              stroke="rgba(51,65,85,0.3)"
              strokeWidth={0.5}
            />
          ))}
          {Array.from({ length: 13 }).map((_, i) => (
            <line
              key={`h${i}`}
              x1={0}
              y1={i * 40}
              x2={800}
              y2={i * 40}
              stroke="rgba(51,65,85,0.3)"
              strokeWidth={0.5}
            />
          ))}

          {/* Risk Zones */}
          {riskZones.map((zone) => {
            const color = getRiskColor(zone.riskScore);
            return (
              <g key={zone.id}>
                <polygon
                  points={zone.geometry.coordinates[0]
                    .map((c) => `${(c[0] - 6.5) * 200},${(11 - c[1]) * 200}`)
                    .join(" ")}
                  fill={color}
                  fillOpacity={0.2}
                  stroke={color}
                  strokeWidth={2}
                  strokeDasharray="5,5"
                />
                <text
                  x={(zone.geometry.coordinates[0][0][0] - 6.5) * 200}
                  y={(11 - zone.geometry.coordinates[0][0][1]) * 200 - 10}
                  fill={color}
                  fontSize={12}
                  fontWeight="bold"
                >
                  {zone.name}
                </text>
              </g>
            );
          })}

          {/* Safe Zones */}
          {safeZones.map((zone) => (
            <g key={zone.id}>
              <circle
                cx={(zone.location.lng - 6.5) * 200}
                cy={(11 - zone.location.lat) * 200}
                r={8}
                fill="#10B981"
                stroke="white"
                strokeWidth={2}
              />
              <text
                x={(zone.location.lng - 6.5) * 200 + 12}
                y={(11 - zone.location.lat) * 200 + 4}
                fill="#10B981"
                fontSize={11}
              >
                {zone.name}
              </text>
            </g>
          ))}

          {/* Alert markers */}
          {demoAlerts
            .filter((a) => a.status === "active")
            .map((alert) => (
              <g key={alert.id}>
                <circle
                  cx={(alert.location.lng - 6.5) * 200}
                  cy={(11 - alert.location.lat) * 200}
                  r={12}
                  fill="#EF4444"
                  fillOpacity={0.3}
                  className="animate-pulse"
                />
                <circle
                  cx={(alert.location.lng - 6.5) * 200}
                  cy={(11 - alert.location.lat) * 200}
                  r={6}
                  fill="#EF4444"
                  stroke="white"
                  strokeWidth={2}
                />
                <text
                  x={(alert.location.lng - 6.5) * 200 + 14}
                  y={(11 - alert.location.lat) * 200 + 4}
                  fill="#EF4444"
                  fontSize={11}
                  fontWeight="bold"
                >
                  {alert.victimName}
                </text>
              </g>
            ))}
        </svg>
      </div>

      {/* Zone Details */}
      <div className="p-4 border-t border-slate-800">
        <h3 className="text-sm font-semibold text-slate-300 mb-3">
          Risk Zone Details
        </h3>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {riskZones.map((zone) => (
            <div
              key={zone.id}
              className="flex items-start space-x-3 p-3 bg-slate-800/50 rounded-lg"
            >
              <div
                className="w-3 h-3 rounded-full mt-1 flex-shrink-0"
                style={{ backgroundColor: getRiskColor(zone.riskScore) }}
              />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between">
                  <span className="font-medium text-sm">{zone.name}</span>
                  <span
                    className="text-xs font-bold px-2 py-0.5 rounded-full"
                    style={{
                      backgroundColor: getRiskColor(zone.riskScore) + "30",
                      color: getRiskColor(zone.riskScore),
                    }}
                  >
                    {getRiskLabel(zone.riskScore)}
                  </span>
                </div>
                <div className="text-xs text-slate-400 mt-1">
                  {zone.factors.join(" | ")}
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}

function AlertsTab({ alerts }: { alerts: Alert[] }) {
  return (
    <div className="space-y-4">
      {alerts.length === 0 ? (
        <div className="bg-slate-900 border border-slate-800 rounded-xl p-8 text-center">
          <CheckCircle className="h-12 w-12 text-emerald-500 mx-auto mb-3" />
          <h3 className="text-lg font-semibold">No Active Alerts</h3>
          <p className="text-slate-400 mt-1">All alerts have been resolved.</p>
        </div>
      ) : (
        alerts.map((alert) => (
          <div
            key={alert.id}
            className="bg-slate-900 border border-slate-800 rounded-xl p-4 hover:border-red-900/50 transition-colors"
          >
            <div className="flex items-start justify-between">
              <div className="flex items-start space-x-3">
                <div className="mt-1">
                  <span className="relative flex h-3 w-3">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-red-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-3 w-3 bg-red-500" />
                  </span>
                </div>
                <div>
                  <div className="flex items-center space-x-2">
                    <h3 className="font-semibold text-lg">
                      Alert #{alert.id}
                    </h3>
                    <span className="px-2 py-0.5 bg-red-600/20 text-red-400 text-xs font-bold rounded-full uppercase">
                      {alert.priority}
                    </span>
                  </div>
                  <p className="text-slate-300 mt-1">
                    {alert.victimName}
                    {alert.victimAge && (
                      <span className="text-slate-500">
                        {" "}
                        ({alert.victimGender}, {alert.victimAge})
                      </span>
                    )}
                  </p>
                  <div className="flex flex-wrap items-center gap-x-4 gap-y-1 mt-2 text-sm text-slate-400">
                    <span className="flex items-center space-x-1">
                      <MapPin className="h-3.5 w-3.5" />
                      <span>{alert.address || "Unknown location"}</span>
                    </span>
                    <span className="flex items-center space-x-1">
                      <Clock className="h-3.5 w-3.5" />
                      <span>{formatRelativeTime(alert.timestamp)}</span>
                    </span>
                    {alert.batteryLevel && (
                      <span className="flex items-center space-x-1">
                        <Smartphone className="h-3.5 w-3.5" />
                        <span>{alert.batteryLevel}% battery</span>
                      </span>
                    )}
                  </div>
                  {alert.movementPattern && (
                    <p className="text-sm text-orange-400 mt-2">
                      <AlertTriangle className="h-3.5 w-3.5 inline mr-1" />
                      {alert.movementPattern}
                    </p>
                  )}
                </div>
              </div>
              <div className="text-right text-sm text-slate-500">
                <div>{alert.guardiansNotified} guardians notified</div>
                <div>{alert.guardiansAcknowledged} acknowledged</div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
}

function ReportsTab({ reports }: { reports: CommunityReport[] }) {
  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-semibold">Community Reports</h2>
        <button className="px-4 py-2 bg-emerald-600 hover:bg-emerald-500 rounded-lg text-sm font-medium transition-colors">
          Submit Report
        </button>
      </div>

      {reports.map((report) => (
        <div
          key={report.id}
          className="bg-slate-900 border border-slate-800 rounded-xl p-4"
        >
          <div className="flex items-start justify-between">
            <div className="flex items-start space-x-3">
              <MapPin className="h-5 w-5 text-slate-400 mt-0.5" />
              <div>
                <p className="text-slate-200">{report.description}</p>
                <div className="flex items-center space-x-3 mt-2 text-sm text-slate-400">
                  <span>{formatRelativeTime(report.timestamp)}</span>
                  <span className="flex items-center space-x-1">
                    <Users className="h-3.5 w-3.5" />
                    <span>{report.votes} votes</span>
                  </span>
                  {report.verified && (
                    <span className="flex items-center space-x-1 text-emerald-400">
                      <CheckCircle className="h-3.5 w-3.5" />
                      <span>Verified</span>
                    </span>
                  )}
                </div>
              </div>
            </div>
          </div>
        </div>
      ))}
    </div>
  );
}

function SystemStatusPanel() {
  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <Activity className="h-5 w-5 text-emerald-400" />
        <span>System Status</span>
      </h2>
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
        <StatusItem label="Mesh Network" value="1,247 nodes" status="operational" />
        <StatusItem label="SMS Gateway" value="Operational" status="operational" />
        <StatusItem label="Response Time" value="8.3 min avg" status="operational" />
        <StatusItem label="Data Integrity" value="Verified" status="operational" />
      </div>
    </div>
  );
}

function StatusItem({
  label,
  value,
  status,
}: {
  label: string;
  value: string;
  status: string;
}) {
  const statusColor =
    status === "operational"
      ? "bg-emerald-500"
      : status === "degraded"
      ? "bg-yellow-500"
      : "bg-red-500";

  return (
    <div className="flex items-center space-x-2">
      <span className={`w-2 h-2 rounded-full ${statusColor}`} />
      <div>
        <div className="text-slate-400 text-xs">{label}</div>
        <div className="font-medium">{value}</div>
      </div>
    </div>
  );
}

function RiskForecastPanel() {
  const hours = Array.from({ length: 8 }, (_, i) => i * 3);
  const forecast = [
    0.4, 0.35, 0.3, 0.2, 0.15, 0.25, 0.45, 0.55,
  ];

  return (
    <div className="bg-slate-900 border border-slate-800 rounded-xl p-4">
      <h2 className="text-lg font-semibold mb-4 flex items-center space-x-2">
        <Clock className="h-5 w-5 text-orange-400" />
        <span>Risk Forecast - Next 24 Hours</span>
      </h2>
      <div className="flex items-end space-x-2 h-32">
        {forecast.map((level, i) => (
          <div key={i} className="flex-1 flex flex-col items-center">
            <div
              className="w-full rounded-t-md transition-all"
              style={{
                height: `${level * 100}%`,
                backgroundColor: getRiskColor(level),
                opacity: 0.8,
              }}
            />
            <div className="text-xs text-slate-500 mt-1">
              {String(hours[i]).padStart(2, "0")}:00
            </div>
          </div>
        ))}
      </div>
      <div className="flex items-center justify-between mt-4 text-sm text-slate-400">
        <span>Peak Risk: 21:00 - 03:00</span>
        <span>Lowest Risk: 09:00 - 15:00</span>
      </div>
    </div>
  );
}
