export interface User {
  id: string;
  name: string;
  email: string;
  phone: string;
  role: "citizen" | "guardian" | "watch_officer" | "commander" | "analyst" | "admin" | "super_admin";
  avatar?: string;
  region?: string;
  unit?: string;
}

export interface Alert {
  id: string;
  victimName: string;
  victimAge?: number;
  victimGender?: string;
  location: GeoLocation;
  address?: string;
  timestamp: string;
  status: "active" | "acknowledged" | "dispatched" | "resolved" | "false_alarm";
  priority: "critical" | "high" | "medium" | "low";
  batteryLevel?: number;
  signalStrength?: string;
  guardiansNotified: number;
  guardiansAcknowledged: number;
  audioStreaming: boolean;
  speed?: number;
  heading?: string;
  movementPattern?: string;
  aiAnalysis?: AIAnalysis;
  logEntries: LogEntry[];
}

export interface GeoLocation {
  lat: number;
  lng: number;
  accuracy?: number;
}

export interface AIAnalysis {
  voicesDetected: number;
  language: string;
  confidence: number;
  keywords: string[];
  stressLevel: string;
  vehicleEngine: boolean;
  threatScore: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  author: string;
  type: "system" | "officer" | "guardian" | "ai";
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  status: "online" | "acknowledged" | "offline";
  location?: GeoLocation;
  distance?: number;
  lastSeen?: string;
  message?: string;
}

export interface ResponseUnit {
  id: string;
  name: string;
  type: "patrol" | "rapid_response" | "k9" | "air_support" | "medical";
  status: "available" | "responding" | "on_scene" | "standby" | "unavailable";
  location?: GeoLocation;
  eta?: number;
  currentAlert?: string;
  region: string;
}

export interface RiskZone {
  id: string;
  name: string;
  riskScore: number;
  geometry: {
    type: "Polygon";
    coordinates: number[][][];
  };
  factors: string[];
  lastUpdated: string;
}

export interface SafeZone {
  id: string;
  name: string;
  type: "police" | "hospital" | "checkpoint" | "safe_house";
  location: GeoLocation;
  phone?: string;
  capacity?: number;
  status: "operational" | "full" | "unavailable";
}

export interface CommunityReport {
  id: string;
  location: GeoLocation;
  description: string;
  timestamp: string;
  category: "suspicious_activity" | "checkpoint" | "road_clear" | "incident";
  votes: number;
  verified: boolean;
}

export interface SystemStatus {
  meshNodes: number;
  smsGateway: "operational" | "degraded" | "offline";
  loRaGateway: "operational" | "degraded" | "offline";
  database: "operational" | "degraded" | "offline";
  networkUptime: number;
  activeAlerts: number;
  resolvedToday: number;
  activeUsers: number;
  avgResponseTime: number;
}

export interface Statistics {
  totalAlerts: number;
  activeAlerts: number;
  resolvedToday: number;
  activeGuardians: number;
  sentinelDevices: number;
  safeZones: number;
  riskForecast: RiskForecast[];
}

export interface RiskForecast {
  hour: number;
  riskLevel: number;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  type: "text" | "audio" | "location" | "system";
}
