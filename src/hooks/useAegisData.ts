/**
 * useAegisData — React hook that:
 * 1. Fetches all AEGIS data from Supabase on mount
 * 2. Subscribes to Realtime for alerts, chat, units
 * 3. Syncs changes into the Zustand store
 */
import { useEffect, useRef } from 'react';
import { supabase } from '@/db/supabase';
import { useAegisStore } from '@/hooks/useAegisStore';
import {
  fetchAlerts, fetchUnits, fetchZones, fetchGuardians,
  fetchReports, fetchStats,
  mapAlert, mapUnit,
} from '@/services/aegis-db';

export function useAegisData() {
  const setAlerts      = useAegisStore((s) => s.setAlerts);
  const setUnits       = useAegisStore((s) => s.setResponseUnits);
  const setZones       = useAegisStore((s) => s.setRiskZones);
  const setGuardians   = useAegisStore((s) => s.setGuardians);
  const setReports     = useAegisStore((s) => s.setCommunityReports);
  const setStats       = useAegisStore((s) => s.setStats);
  const patchAlert     = useAegisStore((s) => s.updateAlert);
  const patchUnit      = useAegisStore((s) => s.patchUnit);
  const loaded         = useRef(false);

  useEffect(() => {
    if (loaded.current) return;
    loaded.current = true;

    // ── Initial fetch ──────────────────────────────────────
    Promise.all([
      fetchAlerts(),
      fetchUnits(),
      fetchZones(),
      fetchGuardians(),
      fetchReports(),
      fetchStats(),
    ]).then(([alerts, units, zones, guardians, reports, stats]) => {
      setAlerts(alerts);
      setUnits(units);
      setZones(zones);
      setGuardians(guardians);
      setReports(reports);
      if (stats) setStats(stats);
    });

    // ── Realtime: alerts ───────────────────────────────────
    const alertChannel = supabase
      .channel('aegis-alerts')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'alerts' }, (payload) => {
        if (payload.eventType === 'INSERT' || payload.eventType === 'UPDATE') {
          patchAlert(payload.new.id, mapAlert(payload.new));
        }
      })
      .subscribe();

    // ── Realtime: units ────────────────────────────────────
    const unitChannel = supabase
      .channel('aegis-units')
      .on('postgres_changes', { event: '*', schema: 'public', table: 'response_units' }, (payload) => {
        if (payload.eventType === 'UPDATE') {
          patchUnit(payload.new.id, mapUnit(payload.new));
        }
      })
      .subscribe();

    return () => {
      supabase.removeChannel(alertChannel);
      supabase.removeChannel(unitChannel);
    };
  }, [setAlerts, setUnits, setZones, setGuardians, setReports, setStats, patchAlert, patchUnit]);
}
