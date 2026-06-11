// AEGIS CSG — Zustand store (Supabase-backed)
import { create } from 'zustand';
import type {
  Alert, Guardian, ResponseUnit, RiskZone, CommunityReport,
  ChatMessage, User, AlertStatus, AlertPriority, SystemStats,
} from '@/types/aegis';
import { demoUsers } from '@/lib/aegis-data';
import * as db from '@/services/aegis-db';

interface AegisState {
  user: User | null;
  alerts: Alert[];
  guardians: Guardian[];
  responseUnits: ResponseUnit[];
  riskZones: RiskZone[];
  communityReports: CommunityReport[];
  chatMessages: ChatMessage[];
  stats: SystemStats | null;

  // Setters (used by useAegisData realtime hook)
  setAlerts: (a: Alert[]) => void;
  setResponseUnits: (u: ResponseUnit[]) => void;
  setRiskZones: (z: RiskZone[]) => void;
  setGuardians: (g: Guardian[]) => void;
  setCommunityReports: (r: CommunityReport[]) => void;
  setStats: (s: SystemStats) => void;

  // Partial update (realtime patch)
  updateAlert: (id: string, patch: Partial<Alert>) => void;
  patchUnit: (id: string, patch: Partial<ResponseUnit>) => void;

  // Auth
  login: (role: keyof typeof demoUsers) => void;
  logout: () => void;

  // Alerts (write-through to Supabase)
  updateAlertStatus: (id: string, status: AlertStatus) => void;
  updateAlertPriority: (id: string, priority: AlertPriority) => void;

  // Chat
  addChatMessage: (msg: ChatMessage) => void;
  sendChatMessage: (alertId: string, content: string) => void;

  // Units (write-through to Supabase)
  dispatchUnit: (unitId: string, alertId: string) => void;
}

export const useAegisStore = create<AegisState>((set, get) => ({
  user: null,
  alerts: [],
  guardians: [],
  responseUnits: [],
  riskZones: [],
  communityReports: [],
  chatMessages: [],
  stats: null,

  // ── Setters ──────────────────────────────────────────────
  setAlerts: (alerts) => set({ alerts }),
  setResponseUnits: (responseUnits) => set({ responseUnits }),
  setRiskZones: (riskZones) => set({ riskZones }),
  setGuardians: (guardians) => set({ guardians }),
  setCommunityReports: (communityReports) => set({ communityReports }),
  setStats: (stats) => set({ stats }),

  // ── Realtime patches ─────────────────────────────────────
  updateAlert: (id, patch) =>
    set((s) => ({
      alerts: s.alerts.some((a) => a.id === id)
        ? s.alerts.map((a) => (a.id === id ? { ...a, ...patch } : a))
        : [...s.alerts, patch as Alert],
    })),

  patchUnit: (id, patch) =>
    set((s) => ({
      responseUnits: s.responseUnits.map((u) => (u.id === id ? { ...u, ...patch } : u)),
    })),

  // ── Auth ─────────────────────────────────────────────────
  login: (role) => set({ user: demoUsers[role] }),
  logout: () => set({ user: null }),

  // ── Alert mutations ──────────────────────────────────────
  updateAlertStatus: (id, status) => {
    // Optimistic update
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, status } : a)) }));
    // Persist
    db.updateAlertStatus(id, status);
  },

  updateAlertPriority: (id, priority) =>
    set((s) => ({ alerts: s.alerts.map((a) => (a.id === id ? { ...a, priority } : a)) })),

  // ── Chat ─────────────────────────────────────────────────
  addChatMessage: (msg) =>
    set((s) => ({ chatMessages: [...s.chatMessages, msg] })),

  sendChatMessage: (alertId, content) => {
    const user = get().user;
    const msg: ChatMessage = {
      id: crypto.randomUUID(),
      senderId: user?.id ?? 'anon',
      senderName: user?.name ?? 'Officer',
      content,
      timestamp: new Date().toISOString(),
      alertId,
    };
    set((s) => ({ chatMessages: [...s.chatMessages, msg] }));
    db.sendChatMessage(alertId, msg.senderId, msg.senderName, content);
  },

  // ── Unit dispatch (write-through) ────────────────────────
  dispatchUnit: (unitId, alertId) => {
    // Optimistic update
    set((s) => ({
      responseUnits: s.responseUnits.map((u) =>
        u.id === unitId ? { ...u, status: 'responding', currentAlert: alertId } : u
      ),
      alerts: s.alerts.map((a) =>
        a.id === alertId ? { ...a, status: 'dispatched' } : a
      ),
    }));
    // Persist
    db.dispatchUnit(unitId, alertId);
  },
}));
