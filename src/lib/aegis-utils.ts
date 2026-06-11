// AEGIS CSG — shared formatting helpers
import type { AlertPriority, AlertStatus, UnitStatus, GuardianStatus } from '@/types/aegis';

export function formatRelativeTime(iso: string): string {
  const diff = Math.floor((Date.now() - new Date(iso).getTime()) / 1000);
  if (diff < 60) return `${diff}s ago`;
  if (diff < 3600) return `${Math.floor(diff / 60)}m ago`;
  if (diff < 86400) return `${Math.floor(diff / 3600)}h ago`;
  return `${Math.floor(diff / 86400)}d ago`;
}

export function formatTime(iso: string): string {
  return new Date(iso).toLocaleTimeString('en-NG', { hour: '2-digit', minute: '2-digit', second: '2-digit', hour12: false });
}

export function priorityColor(p: AlertPriority): string {
  return { critical: 'text-red-400', high: 'text-orange-400', medium: 'text-yellow-400', low: 'text-blue-400' }[p];
}
export function priorityBg(p: AlertPriority): string {
  return { critical: 'bg-red-500/15 border-red-500/30', high: 'bg-orange-500/15 border-orange-500/30', medium: 'bg-yellow-500/15 border-yellow-500/30', low: 'bg-blue-500/15 border-blue-500/30' }[p];
}
export function statusColor(s: AlertStatus): string {
  return { active: 'text-red-400', acknowledged: 'text-yellow-400', dispatched: 'text-blue-400', resolved: 'text-green-400', cancelled: 'text-muted-foreground' }[s];
}
export function unitStatusColor(s: UnitStatus): string {
  return { available: 'text-green-400', responding: 'text-blue-400', standby: 'text-yellow-400', unavailable: 'text-red-400' }[s];
}
export function guardianStatusDot(s: GuardianStatus): string {
  return { acknowledged: 'status-dot-amber', online: 'status-dot-green', offline: 'status-dot-muted' }[s];
}
export function riskColor(score: number): string {
  if (score >= 0.8) return 'text-red-400';
  if (score >= 0.6) return 'text-orange-400';
  if (score >= 0.4) return 'text-yellow-400';
  return 'text-green-400';
}
export function riskBg(score: number): string {
  if (score >= 0.8) return 'bg-red-500/20';
  if (score >= 0.6) return 'bg-orange-500/20';
  if (score >= 0.4) return 'bg-yellow-500/20';
  return 'bg-green-500/20';
}
export function riskLabel(score: number): string {
  if (score >= 0.8) return 'CRITICAL';
  if (score >= 0.6) return 'HIGH';
  if (score >= 0.4) return 'MEDIUM';
  return 'LOW';
}
