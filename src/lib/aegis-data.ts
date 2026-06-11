// AEGIS CSG — Nigeria-based demo data

import type {
  Alert, Guardian, ResponseUnit, RiskZone, CommunityReport,
  ChatMessage, User, SystemStats,
} from '@/types/aegis';

const now = new Date();
const minsAgo = (m: number) => new Date(now.getTime() - m * 60000).toISOString();

// ── Alerts ──────────────────────────────────────────────────
export const demoAlerts: Alert[] = [
  {
    id: 'ALT-2341',
    victimName: 'Amina Bello',
    victimAge: 34,
    victimGender: 'F',
    location: { lat: 10.5234, lng: 7.4356, accuracy: 5 },
    address: 'Kaduna-Zaria Road, Km 47',
    status: 'active',
    priority: 'critical',
    timestamp: minsAgo(12),
    batteryLevel: 67,
    signalStrength: 'Low (2G)',
    guardiansNotified: 3,
    guardiansAcknowledged: 2,
    audioStreaming: true,
    speed: 45,
    heading: '278° West',
    movementPattern: 'Vehicle on highway, moving away from city',
    aiAnalysis: {
      voicesDetected: 4,
      language: 'Hausa',
      confidence: 0.87,
      keywords: ['road', 'forest', 'village'],
      stressLevel: 'High',
      vehicleEngine: true,
      threatScore: 0.78,
    },
    logEntries: [
      { id: 'L1', timestamp: minsAgo(12), message: 'Alert received from Sentinel device', author: 'System', type: 'system' },
      { id: 'L2', timestamp: minsAgo(11), message: 'Watch Officer Musa assigned', author: 'System', type: 'system' },
      { id: 'L3', timestamp: minsAgo(10), message: 'AI audio analysis — 4 voices, stress HIGH, vehicle engine detected', author: 'Oracle', type: 'ai' },
      { id: 'L4', timestamp: minsAgo(8), message: 'Rapid Response 3 dispatched — ETA 8 mins', author: 'Cmdr. Musa', type: 'officer' },
      { id: 'L5', timestamp: minsAgo(7), message: 'Birnin Gwari station alerted for route intercept', author: 'System', type: 'system' },
    ],
  },
  {
    id: 'ALT-2342',
    victimName: 'Ibrahim Yusuf',
    victimAge: 42,
    victimGender: 'M',
    location: { lat: 10.6123, lng: 7.5123, accuracy: 12 },
    address: 'Abuja-Kaduna Highway, Near Toll Gate',
    status: 'acknowledged',
    priority: 'critical',
    timestamp: minsAgo(25),
    batteryLevel: 34,
    signalStrength: 'None (SMS Fallback)',
    guardiansNotified: 5,
    guardiansAcknowledged: 2,
    audioStreaming: false,
    logEntries: [
      { id: 'L6', timestamp: minsAgo(25), message: 'Alert received via SMS fallback (no data connection)', author: 'System', type: 'system' },
      { id: 'L7', timestamp: minsAgo(23), message: 'Last GPS fix: 10.6123, 7.5123 — 12m accuracy', author: 'System', type: 'system' },
      { id: 'L8', timestamp: minsAgo(21), message: 'Guardian Dr. Bello acknowledged via SMS', author: 'System', type: 'guardian' },
    ],
  },
  {
    id: 'ALT-2343',
    victimName: 'Sarah Abubakar',
    victimAge: 27,
    victimGender: 'F',
    location: { lat: 10.7123, lng: 6.8234, accuracy: 8 },
    address: 'Birnin Gwari Town Centre',
    status: 'dispatched',
    priority: 'high',
    timestamp: minsAgo(45),
    batteryLevel: 82,
    signalStrength: 'Good (4G)',
    guardiansNotified: 4,
    guardiansAcknowledged: 3,
    audioStreaming: true,
    movementPattern: 'Stationary — possible building confinement',
    logEntries: [
      { id: 'L9', timestamp: minsAgo(45), message: 'Alert received — full data connection', author: 'System', type: 'system' },
      { id: 'L10', timestamp: minsAgo(42), message: '3 of 4 guardians acknowledged within 2 minutes', author: 'System', type: 'system' },
      { id: 'L11', timestamp: minsAgo(40), message: 'Patrol 12 dispatched from Birnin Gwari station', author: 'Cmdr. Musa', type: 'officer' },
    ],
  },
  {
    id: 'ALT-2344',
    victimName: 'John Okonkwo',
    victimAge: 55,
    victimGender: 'M',
    location: { lat: 11.1234, lng: 7.7234, accuracy: 6 },
    address: 'Zaria City, Sabon Gari District',
    status: 'resolved',
    priority: 'medium',
    timestamp: minsAgo(90),
    batteryLevel: 91,
    signalStrength: 'Excellent (4G)',
    guardiansNotified: 3,
    guardiansAcknowledged: 3,
    audioStreaming: false,
    logEntries: [
      { id: 'L12', timestamp: minsAgo(90), message: 'Alert received', author: 'System', type: 'system' },
      { id: 'L13', timestamp: minsAgo(80), message: 'Guardian confirmed false alarm — device triggered accidentally', author: 'System', type: 'guardian' },
      { id: 'L14', timestamp: minsAgo(75), message: 'Alert resolved — false alarm confirmed by user', author: 'Cmdr. Musa', type: 'officer' },
    ],
  },
  {
    id: 'ALT-2345',
    victimName: 'Fatima Aliyu',
    victimAge: 19,
    victimGender: 'F',
    location: { lat: 10.3456, lng: 7.6789, accuracy: 15 },
    address: 'Gwagwalada Road, Nassarawa',
    status: 'active',
    priority: 'high',
    timestamp: minsAgo(5),
    batteryLevel: 45,
    signalStrength: 'Low (2G)',
    guardiansNotified: 2,
    guardiansAcknowledged: 1,
    audioStreaming: true,
    logEntries: [
      { id: 'L15', timestamp: minsAgo(5), message: 'Alert received — audio stream active', author: 'System', type: 'system' },
      { id: 'L16', timestamp: minsAgo(4), message: 'Guardian Aisha Aliyu notified via push + SMS', author: 'System', type: 'system' },
    ],
  },
];

// ── Guardians ────────────────────────────────────────────────
export const demoGuardians: Guardian[] = [
  {
    id: 'G1',
    name: 'Dr. Ibrahim Bello',
    relationship: 'Husband',
    phone: '+234 810 123 4567',
    status: 'acknowledged',
    location: { lat: 10.5145, lng: 7.4234 },
    distance: 3.2,
    lastSeen: minsAgo(2),
    message: "I'm mobilizing. Heading to last known location.",
  },
  {
    id: 'G2',
    name: 'Sarah Abubakar',
    relationship: 'Sister',
    phone: '+234 810 234 5678',
    status: 'acknowledged',
    location: { lat: 10.4987, lng: 7.4456 },
    distance: 12.7,
    lastSeen: minsAgo(5),
    message: "I've contacted police. Unit dispatching now.",
  },
  {
    id: 'G3',
    name: 'John Okonkwo',
    relationship: 'Colleague',
    phone: '+234 810 345 6789',
    status: 'online',
    location: { lat: 10.5567, lng: 7.3890 },
    distance: 25.3,
    lastSeen: minsAgo(10),
  },
  {
    id: 'G4',
    name: 'Mary Johnson',
    relationship: 'Friend',
    phone: '+234 810 456 7890',
    status: 'offline',
    lastSeen: minsAgo(120),
  },
];

// ── Response Units ───────────────────────────────────────────
export const demoUnits: ResponseUnit[] = [
  { id: 'RU1', name: 'Patrol 7', type: 'patrol', region: 'Kaduna Central', status: 'available' },
  { id: 'RU2', name: 'Rapid Response 3', type: 'rapid_response', region: 'Kaduna Central', status: 'responding', location: { lat: 10.5234, lng: 7.4356 }, eta: 8, currentAlert: 'ALT-2341' },
  { id: 'RU3', name: 'Patrol 12', type: 'patrol', region: 'Zaria', status: 'available' },
  { id: 'RU4', name: 'K9 Unit 2', type: 'k9', region: 'Kaduna Central', status: 'standby' },
  { id: 'RU5', name: 'Air Support 1', type: 'air_support', region: 'North Central', status: 'unavailable' },
  { id: 'RU6', name: 'Medical Response 4', type: 'medical', region: 'Kaduna Central', status: 'available' },
];

// ── Risk Zones ───────────────────────────────────────────────
export const demoRiskZones: RiskZone[] = [
  { id: 'RZ1', name: 'Kaduna-Zaria Corridor', riskScore: 0.85, bounds: [7.3, 10.4, 7.6, 10.7], factors: ['High incident rate', 'Remote area', 'Limited cell coverage'] },
  { id: 'RZ2', name: 'Birnin Gwari Forest', riskScore: 0.92, bounds: [6.7, 10.6, 7.0, 10.9], factors: ['Known kidnapping route', 'Dense forest cover', 'No police presence'] },
  { id: 'RZ3', name: 'Abuja-Kaduna Highway N.', riskScore: 0.65, bounds: [7.4, 10.5, 7.7, 10.8], factors: ['Highway banditry', 'Inadequate lighting'] },
  { id: 'RZ4', name: 'Funtua-Gusau Corridor', riskScore: 0.78, bounds: [6.5, 11.0, 6.9, 11.4], factors: ['Frequent armed robbery', 'Low visibility routes'] },
];

// ── Community Reports ────────────────────────────────────────
export const demoCommunityReports: CommunityReport[] = [
  { id: 'CR1', location: { lat: 10.5234, lng: 7.4356 }, description: 'Suspicious unmarked checkpoint on Kaduna-Zaria Road near Km 47. Men in civilian clothing stopping vehicles.', category: 'suspicious_activity', timestamp: minsAgo(30), votes: 12, verified: true },
  { id: 'CR2', location: { lat: 10.7222, lng: 6.8111 }, description: 'Unknown vehicles with no plates spotted in Birnin Gwari — 3 SUVs parked near forest entrance.', category: 'suspicious_activity', timestamp: minsAgo(60), votes: 8, verified: false },
  { id: 'CR3', location: { lat: 10.6123, lng: 7.5123 }, description: 'Abuja-Kaduna Highway near Toll Gate appears clear — light traffic, no incidents.', category: 'road_clear', timestamp: minsAgo(120), votes: 5, verified: true },
  { id: 'CR4', location: { lat: 11.0234, lng: 7.3456 }, description: 'Armed group of 5-6 individuals on Saminaka road. Community urges caution after dark.', category: 'armed_group', timestamp: minsAgo(180), votes: 22, verified: true },
  { id: 'CR5', location: { lat: 10.4567, lng: 7.2345 }, description: 'Military convoy passing through — route secure 14:00–17:00 today. Travel window open.', category: 'checkpoint', timestamp: minsAgo(240), votes: 31, verified: true },
];

// ── Chat Messages ────────────────────────────────────────────
export const demoChatMessages: ChatMessage[] = [
  { id: 'M1', senderId: 'G1', senderName: 'Dr. Bello', content: 'I am on Kaduna-Zaria road heading west. ETA 15 mins to Km 47.', timestamp: minsAgo(10) },
  { id: 'M2', senderId: 'G2', senderName: 'Sarah A.', content: 'I have alerted Kaduna State Police. They are coordinating with Rapid Response 3.', timestamp: minsAgo(9) },
  { id: 'M3', senderId: 'sys', senderName: 'System', content: 'Audio stream active. AI detected 4 voices — Hausa language. Stress level HIGH.', timestamp: minsAgo(8) },
  { id: 'M4', senderId: 'cmd', senderName: 'Cmdr. Musa', content: 'RR3 dispatched. Set up roadblock at Birnin Gwari junction. All units maintain radio silence.', timestamp: minsAgo(7) },
  { id: 'M5', senderId: 'G1', senderName: 'Dr. Bello', content: 'Roger. Approaching Km 42. No suspicious vehicles visible yet.', timestamp: minsAgo(4) },
];

// ── Demo Users ───────────────────────────────────────────────
export const demoUsers: Record<string, User> = {
  guardian: { id: 'U1', name: 'Dr. Ibrahim Bello', role: 'guardian', region: 'North Central' },
  commander: { id: 'U2', name: 'Cmdr. Musa Aliyu', role: 'commander', region: 'North Central', unit: 'Rapid Response HQ' },
  analyst: { id: 'U3', name: 'Analyst Sarah Obi', role: 'analyst', region: 'North Central' },
  public: { id: 'U4', name: 'Public User', role: 'public' },
};

// ── System Stats ─────────────────────────────────────────────
export const demoStats: SystemStats = {
  totalAlerts: 247,
  activeAlerts: 3,
  resolvedToday: 18,
  avgResponseMinutes: 6.4,
  activeGuardians: 134,
  sentinelDevices: 892,
  meshNodes: 44,
  networkUptime: 99.7,
};

// ── Analytics hourly data ────────────────────────────────────
export const demoHourlyData = [
  { hour: '00:00', alerts: 2, resolved: 1 },
  { hour: '03:00', alerts: 1, resolved: 1 },
  { hour: '06:00', alerts: 0, resolved: 0 },
  { hour: '09:00', alerts: 3, resolved: 2 },
  { hour: '12:00', alerts: 5, resolved: 3 },
  { hour: '15:00', alerts: 4, resolved: 2 },
  { hour: '18:00', alerts: 7, resolved: 4 },
  { hour: '21:00', alerts: 8, resolved: 5 },
];

export const demoRegionData = [
  { region: 'North Central', alerts: 15, resolved: 12 },
  { region: 'North East', alerts: 8, resolved: 5 },
  { region: 'North West', alerts: 22, resolved: 18 },
  { region: 'South East', alerts: 4, resolved: 4 },
  { region: 'South South', alerts: 6, resolved: 5 },
  { region: 'South West', alerts: 3, resolved: 3 },
];
