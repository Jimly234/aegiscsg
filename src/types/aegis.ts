// AEGIS CSG — shared TypeScript types

export type AlertStatus = 'active' | 'acknowledged' | 'dispatched' | 'resolved' | 'cancelled';
export type AlertPriority = 'critical' | 'high' | 'medium' | 'low';
export type GuardianStatus = 'acknowledged' | 'online' | 'offline';
export type UnitStatus = 'available' | 'responding' | 'standby' | 'unavailable';
export type UnitType = 'patrol' | 'rapid_response' | 'k9' | 'air_support' | 'medical';
export type UserRole = 'guardian' | 'commander' | 'analyst' | 'public';
export type LogEntryType = 'system' | 'ai' | 'officer' | 'guardian';
export type ReportCategory =
  | 'suspicious_activity'
  | 'incident'
  | 'road_clear'
  | 'checkpoint'
  | 'armed_group';

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
  stressLevel: 'Low' | 'Moderate' | 'High';
  vehicleEngine: boolean;
  threatScore: number;
}

export interface LogEntry {
  id: string;
  timestamp: string;
  message: string;
  author: string;
  type: LogEntryType;
}

export interface Alert {
  id: string;
  victimName: string;
  victimAge?: number | null;
  victimGender?: 'M' | 'F' | null;
  location: GeoLocation;
  address?: string | null;
  status: AlertStatus;
  priority: AlertPriority;
  timestamp: string;
  batteryLevel: number;
  signalStrength: string;
  guardiansNotified: number;
  guardiansAcknowledged: number;
  audioStreaming: boolean;
  speedKmh?: number;
  speed?: number;
  heading?: string;
  movementPattern?: string;
  aiAnalysis?: AIAnalysis;
  logEntries: LogEntry[];
  // Unified schema fields for device-originated alerts
  deviceId?: string;
  triggerMethod?: string;
  networkType?: string;
}

export interface Guardian {
  id: string;
  name: string;
  relationship: string;
  phone: string;
  status: GuardianStatus;
  location?: GeoLocation;
  distanceKm?: number;
  /** @deprecated use distanceKm */
  distance?: number;
  lastSeen: string;
  message?: string;
}

export interface ResponseUnit {
  id: string;
  name: string;
  type: UnitType;
  region: string;
  status: UnitStatus;
  location?: GeoLocation;
  eta?: number;
  currentAlert?: string;
}

export interface RiskZone {
  id: string;
  name: string;
  riskScore: number;
  bounds: [number, number, number, number]; // [minLng, minLat, maxLng, maxLat]
  factors: string[];
}

export interface CommunityReport {
  id: string;
  location: GeoLocation;
  description: string;
  category: ReportCategory;
  timestamp: string;
  votes: number;
  verified: boolean;
}

export interface ChatMessage {
  id: string;
  senderId: string;
  senderName: string;
  content: string;
  timestamp: string;
  alertId?: string;
}

export interface HourlyDataPoint {
  hour: string;
  alerts: number;
  resolved: number;
}

export interface RegionDataPoint {
  region: string;
  alerts: number;
  resolved: number;
}

export interface User {
  id: string;
  name: string;
  role: UserRole;
  region?: string;
  unit?: string;
}

export interface SystemStats {
  totalAlerts: number;
  activeAlerts: number;
  resolvedToday: number;
  avgResponseMinutes: number;
  activeGuardians: number;
  sentinelDevices: number;
  meshNodes: number;
  networkUptime: number;
}
