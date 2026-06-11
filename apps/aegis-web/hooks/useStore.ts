import { create } from "zustand";
import {
  Alert,
  Guardian,
  ResponseUnit,
  RiskZone,
  SafeZone,
  CommunityReport,
  SystemStatus,
  ChatMessage,
  User,
} from "@/types";

interface AegisStore {
  user: User | null;
  alerts: Alert[];
  guardians: Guardian[];
  responseUnits: ResponseUnit[];
  riskZones: RiskZone[];
  safeZones: SafeZone[];
  communityReports: CommunityReport[];
  systemStatus: SystemStatus;
  chatMessages: ChatMessage[];
  selectedAlert: Alert | null;
  isLoading: boolean;

  // Actions
  setUser: (user: User | null) => void;
  setAlerts: (alerts: Alert[]) => void;
  addAlert: (alert: Alert) => void;
  updateAlert: (id: string, updates: Partial<Alert>) => void;
  setGuardians: (guardians: Guardian[]) => void;
  setResponseUnits: (units: ResponseUnit[]) => void;
  setRiskZones: (zones: RiskZone[]) => void;
  setSafeZones: (zones: SafeZone[]) => void;
  setCommunityReports: (reports: CommunityReport[]) => void;
  setSystemStatus: (status: SystemStatus) => void;
  setChatMessages: (messages: ChatMessage[]) => void;
  addChatMessage: (message: ChatMessage) => void;
  setSelectedAlert: (alert: Alert | null) => void;
  setIsLoading: (loading: boolean) => void;
}

export const useAegisStore = create<AegisStore>((set) => ({
  user: null,
  alerts: [],
  guardians: [],
  responseUnits: [],
  riskZones: [],
  safeZones: [],
  communityReports: [],
  systemStatus: {
    meshNodes: 1247,
    smsGateway: "operational",
    loRaGateway: "operational",
    database: "operational",
    networkUptime: 99.7,
    activeAlerts: 12,
    resolvedToday: 47,
    activeUsers: 23456,
    avgResponseTime: 8.3,
  },
  chatMessages: [],
  selectedAlert: null,
  isLoading: false,

  setUser: (user) => set({ user }),
  setAlerts: (alerts) => set({ alerts }),
  addAlert: (alert) =>
    set((state) => ({
      alerts: [alert, ...state.alerts],
      systemStatus: {
        ...state.systemStatus,
        activeAlerts: state.systemStatus.activeAlerts + 1,
      },
    })),
  updateAlert: (id, updates) =>
    set((state) => ({
      alerts: state.alerts.map((a) =>
        a.id === id ? { ...a, ...updates } : a
      ),
    })),
  setGuardians: (guardians) => set({ guardians }),
  setResponseUnits: (units) => set({ responseUnits: units }),
  setRiskZones: (zones) => set({ riskZones: zones }),
  setSafeZones: (zones) => set({ safeZones: zones }),
  setCommunityReports: (reports) => set({ communityReports: reports }),
  setSystemStatus: (status) => set({ systemStatus: status }),
  setChatMessages: (messages) => set({ chatMessages: messages }),
  addChatMessage: (message) =>
    set((state) => ({
      chatMessages: [...state.chatMessages, message],
    })),
  setSelectedAlert: (alert) => set({ selectedAlert: alert }),
  setIsLoading: (loading) => set({ isLoading: loading }),
}));
