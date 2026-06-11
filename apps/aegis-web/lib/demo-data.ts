import { Alert, Guardian, ResponseUnit, SafeZone, CommunityReport, RiskZone, ChatMessage, User } from "@/types";

export const demoAlerts: Alert[] = [
  {
    id: "ALT-2341",
    victimName: "Amina Bello",
    victimAge: 34,
    victimGender: "F",
    location: { lat: 10.5234, lng: 7.4356, accuracy: 5 },
    address: "Kaduna-Zaria Road, Km 47",
    timestamp: new Date(Date.now() - 12 * 60000).toISOString(),
    status: "active",
    priority: "critical",
    batteryLevel: 67,
    signalStrength: "Low (2G)",
    guardiansNotified: 3,
    guardiansAcknowledged: 2,
    audioStreaming: true,
    speed: 45,
    heading: "278 (West)",
    movementPattern: "Vehicle on highway, moving away from city",
    aiAnalysis: {
      voicesDetected: 4,
      language: "Hausa",
      confidence: 0.87,
      keywords: ["road", "forest", "village"],
      stressLevel: "High",
      vehicleEngine: true,
      threatScore: 0.78,
    },
    logEntries: [
      { id: "L1", timestamp: new Date(Date.now() - 12 * 60000).toISOString(), message: "Alert received from Sentinel device", author: "System", type: "system" },
      { id: "L2", timestamp: new Date(Date.now() - 11 * 60000).toISOString(), message: "Watch Officer Musa assigned", author: "System", type: "system" },
      { id: "L3", timestamp: new Date(Date.now() - 10 * 60000).toISOString(), message: "Audio analysis initiated", author: "System", type: "ai" },
      { id: "L4", timestamp: new Date(Date.now() - 8 * 60000).toISOString(), message: "Rapid Response 3 dispatched", author: "Cmdr. Musa", type: "officer" },
      { id: "L5", timestamp: new Date(Date.now() - 7 * 60000).toISOString(), message: "Birnin Gwari station notified", author: "System", type: "system" },
    ],
  },
  {
    id: "ALT-2342",
    victimName: "Ibrahim Yusuf",
    victimAge: 42,
    victimGender: "M",
    location: { lat: 10.6123, lng: 7.5123, accuracy: 12 },
    address: "Abuja-Kaduna Highway, Near Toll Gate",
    timestamp: new Date(Date.now() - 25 * 60000).toISOString(),
    status: "acknowledged",
    priority: "critical",
    batteryLevel: 34,
    signalStrength: "None (SMS)",
    guardiansNotified: 5,
    guardiansAcknowledged: 2,
    audioStreaming: false,
    logEntries: [
      { id: "L6", timestamp: new Date(Date.now() - 25 * 60000).toISOString(), message: "Alert received via SMS fallback", author: "System", type: "system" },
      { id: "L7", timestamp: new Date(Date.now() - 23 * 60000).toISOString(), message: "Watch Officer assigned", author: "System", type: "system" },
    ],
  },
  {
    id: "ALT-2343",
    victimName: "Sarah Abubakar",
    location: { lat: 10.7123, lng: 6.8234, accuracy: 8 },
    address: "Birnin Gwari Town Center",
    timestamp: new Date(Date.now() - 45 * 60000).toISOString(),
    status: "dispatched",
    priority: "high",
    batteryLevel: 82,
    signalStrength: "Good (4G)",
    guardiansNotified: 4,
    guardiansAcknowledged: 3,
    audioStreaming: true,
    logEntries: [
      { id: "L8", timestamp: new Date(Date.now() - 45 * 60000).toISOString(), message: "Alert received", author: "System", type: "system" },
      { id: "L9", timestamp: new Date(Date.now() - 40 * 60000).toISOString(), message: "Patrol 12 dispatched", author: "Cmdr. Musa", type: "officer" },
    ],
  },
  {
    id: "ALT-2344",
    victimName: "John Okonkwo",
    location: { lat: 11.1234, lng: 7.7234, accuracy: 6 },
    address: "Zaria City, Sabon Gari",
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    status: "resolved",
    priority: "medium",
    batteryLevel: 91,
    signalStrength: "Good (4G)",
    guardiansNotified: 3,
    guardiansAcknowledged: 3,
    audioStreaming: false,
    logEntries: [
      { id: "L10", timestamp: new Date(Date.now() - 60 * 60000).toISOString(), message: "Alert received", author: "System", type: "system" },
      { id: "L11", timestamp: new Date(Date.now() - 50 * 60000).toISOString(), message: "False alarm - user accidentally triggered", author: "Cmdr. Musa", type: "officer" },
    ],
  },
];

export const demoGuardians: Guardian[] = [
  {
    id: "G1",
    name: "Dr. Ibrahim Bello",
    relationship: "Husband",
    phone: "+234 810 123 4567",
    status: "acknowledged",
    location: { lat: 10.5145, lng: 7.4234 },
    distance: 3.2,
    lastSeen: new Date(Date.now() - 2 * 60000).toISOString(),
    message: "I'm mobilizing family members. Heading to last known location now.",
  },
  {
    id: "G2",
    name: "Sarah Abubakar",
    relationship: "Sister",
    phone: "+234 810 234 5678",
    status: "acknowledged",
    location: { lat: 10.4987, lng: 7.4456 },
    distance: 12.7,
    lastSeen: new Date(Date.now() - 5 * 60000).toISOString(),
    message: "I've called police. They're dispatching unit. ETA 20 minutes.",
  },
  {
    id: "G3",
    name: "John Okonkwo",
    relationship: "Colleague",
    phone: "+234 810 345 6789",
    status: "online",
    location: { lat: 10.5567, lng: 7.3890 },
    distance: 25.3,
    lastSeen: new Date(Date.now() - 10 * 60000).toISOString(),
  },
  {
    id: "G4",
    name: "Mary Johnson",
    relationship: "Friend",
    phone: "+234 810 456 7890",
    status: "offline",
    lastSeen: new Date(Date.now() - 120 * 60000).toISOString(),
  },
];

export const demoResponseUnits: ResponseUnit[] = [
  { id: "U1", name: "Patrol 7", type: "patrol", status: "available", region: "Kaduna Central" },
  { id: "U2", name: "Rapid Response 3", type: "rapid_response", status: "responding", location: { lat: 10.5234, lng: 7.4356 }, eta: 8, currentAlert: "ALT-2341", region: "Kaduna Central" },
  { id: "U3", name: "Patrol 12", type: "patrol", status: "available", region: "Zaria" },
  { id: "U4", name: "K9 Unit 2", type: "k9", status: "standby", region: "Kaduna Central" },
  { id: "U5", name: "Air Support 1", type: "air_support", status: "unavailable", region: "North Central" },
  { id: "U6", name: "Medical Response 4", type: "medical", status: "available", region: "Kaduna Central" },
];

export const demoSafeZones: SafeZone[] = [
  { id: "SZ1", name: "Kaduna Central Police Station", type: "police", location: { lat: 10.5167, lng: 7.4333 }, phone: "+234 810 111 1111", status: "operational" },
  { id: "SZ2", name: "Kaduna Central Hospital", type: "hospital", location: { lat: 10.5189, lng: 7.4312 }, phone: "+234 810 222 2222", capacity: 150, status: "operational" },
  { id: "SZ3", name: "Zaria Police Station", type: "police", location: { lat: 11.1111, lng: 7.7222 }, phone: "+234 810 333 3333", status: "operational" },
  { id: "SZ4", name: "Birnin Gwari Checkpoint", type: "checkpoint", location: { lat: 10.7222, lng: 6.8111 }, status: "operational" },
];

export const demoCommunityReports: CommunityReport[] = [
  {
    id: "CR1",
    location: { lat: 10.5234, lng: 7.4356 },
    description: "Suspicious checkpoint reported on Kaduna-Zaria Road",
    timestamp: new Date(Date.now() - 30 * 60000).toISOString(),
    category: "suspicious_activity",
    votes: 12,
    verified: true,
  },
  {
    id: "CR2",
    location: { lat: 10.7222, lng: 6.8111 },
    description: "Unknown vehicles in Birnin Gwari area",
    timestamp: new Date(Date.now() - 60 * 60000).toISOString(),
    category: "suspicious_activity",
    votes: 8,
    verified: false,
  },
  {
    id: "CR3",
    location: { lat: 10.6123, lng: 7.5123 },
    description: "Road appears clear on Abuja-Kaduna Highway",
    timestamp: new Date(Date.now() - 120 * 60000).toISOString(),
    category: "road_clear",
    votes: 5,
    verified: true,
  },
];

export const demoRiskZones: RiskZone[] = [
  {
    id: "RZ1",
    name: "Kaduna-Zaria Corridor",
    riskScore: 0.85,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [7.3, 10.4],
          [7.6, 10.4],
          [7.6, 10.7],
          [7.3, 10.7],
          [7.3, 10.4],
        ],
      ],
    },
    factors: ["High incident rate", "Remote area", "Limited cell coverage"],
    lastUpdated: new Date().toISOString(),
  },
  {
    id: "RZ2",
    name: "Birnin Gwari Forest",
    riskScore: 0.92,
    geometry: {
      type: "Polygon",
      coordinates: [
        [
          [6.7, 10.6],
          [7.0, 10.6],
          [7.0, 10.9],
          [6.7, 10.9],
          [6.7, 10.6],
        ],
      ],
    },
    factors: ["Known kidnapping route", "Dense forest cover", "No police presence"],
    lastUpdated: new Date().toISOString(),
  },
];

export const demoChatMessages: ChatMessage[] = [
  { id: "M1", senderId: "G1", senderName: "Dr. Ibrahim Bello", content: "I'm heading to last known location. Who else is close?", timestamp: new Date(Date.now() - 10 * 60000).toISOString(), type: "text" },
  { id: "M2", senderId: "G2", senderName: "Sarah Abubakar", content: "I'm 3km out. Mobilizing community security.", timestamp: new Date(Date.now() - 9 * 60000).toISOString(), type: "text" },
  { id: "M3", senderId: "G3", senderName: "John Okonkwo", content: "I've called police. They're dispatching unit. ETA 20 minutes.", timestamp: new Date(Date.now() - 8 * 60000).toISOString(), type: "text" },
];

export const demoUsers: User[] = [
  { id: "U1", name: "Dr. Ibrahim Bello", email: "ibrahim@example.com", phone: "+234 810 123 4567", role: "guardian" },
  { id: "U2", name: "Cmdr. Musa", email: "musa@police.ng", phone: "+234 810 999 9999", role: "commander", region: "North Central", unit: "Rapid Response" },
  { id: "U3", name: "Analyst Sarah", email: "sarah@aegis.ng", phone: "+234 810 888 8888", role: "analyst" },
  { id: "U4", name: "Admin User", email: "admin@aegis.ng", phone: "+234 810 777 7777", role: "admin" },
];
