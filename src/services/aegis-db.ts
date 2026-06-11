// AEGIS Supabase data service — real-time subscriptions and API calls
import { supabase } from '@/db/supabase';
import type { Alert, Guardian, ResponseUnit, RiskZone, CommunityReport, ChatMessage, SystemStats } from '@/types/aegis';

// ── Type mappers (DB snake_case → app camelCase) ──────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapAlert(row: any): Alert {
  return {
    id: row.id,
    victimName: row.victim_name,
    victimAge: row.victim_age,
    victimGender: row.victim_gender,
    location: { lat: Number(row.lat), lng: Number(row.lng), accuracy: row.accuracy_meters },
    address: row.address,
    status: row.status,
    priority: row.priority,
    batteryLevel: row.battery_level,
    signalStrength: row.signal_strength,
    guardiansNotified: row.guardians_notified,
    guardiansAcknowledged: row.guardians_acknowledged,
    audioStreaming: row.audio_streaming,
    speedKmh: row.speed_kmh,
    heading: row.heading,
    movementPattern: row.movement_pattern,
    aiAnalysis: row.ai_threat_score != null ? {
      voicesDetected: row.ai_voices_detected,
      language: row.ai_language,
      confidence: Number(row.ai_confidence ?? 0),
      keywords: row.ai_keywords ?? [],
      stressLevel: row.ai_stress_level,
      vehicleEngine: row.ai_vehicle_engine,
      threatScore: Number(row.ai_threat_score),
    } : undefined,
    timestamp: row.triggered_at,
    logEntries: [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapUnit(row: any): ResponseUnit {
  return {
    id: row.id,
    name: row.name,
    type: row.unit_type,
    region: row.region,
    status: row.status,
    location: row.lat != null ? { lat: Number(row.lat), lng: Number(row.lng) } : undefined,
    eta: row.eta_minutes,
    currentAlert: row.current_alert_id,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapZone(row: any): RiskZone {
  return {
    id: row.id,
    name: row.name,
    riskScore: Number(row.risk_score),
    bounds: [Number(row.min_lng), Number(row.min_lat), Number(row.max_lng), Number(row.max_lat)],
    factors: row.factors ?? [],
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapGuardian(row: any): Guardian {
  return {
    id: row.id,
    name: row.name,
    relationship: row.relationship,
    phone: row.phone,
    status: row.status,
    location: row.lat != null ? { lat: Number(row.lat), lng: Number(row.lng) } : undefined,
    distanceKm: row.distance_km != null ? Number(row.distance_km) : undefined,
    lastSeen: row.last_seen,
    message: row.message ?? undefined,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapReport(row: any): CommunityReport {
  return {
    id: row.id,
    location: { lat: Number(row.lat), lng: Number(row.lng) },
    description: row.description,
    category: row.category,
    votes: row.votes,
    verified: row.verified,
    timestamp: row.created_at,
  };
}

// eslint-disable-next-line @typescript-eslint/no-explicit-any
export function mapChat(row: any): ChatMessage {
  return {
    id: row.id,
    senderId: row.sender_id,
    senderName: row.sender_name,
    content: row.content,
    timestamp: row.created_at,
    alertId: row.alert_id,
  };
}

// ── Fetch functions ──────────────────────────────────────────

export async function fetchAlerts(): Promise<Alert[]> {
  const { data, error } = await supabase
    .from('alerts')
    .select('*')
    .order('triggered_at', { ascending: false })
    .limit(100);
  if (error) { console.error('[AEGIS] fetchAlerts:', error.message); return []; }
  return Array.isArray(data) ? data.map(mapAlert) : [];
}

export async function fetchAlertLogs(alertId: string) {
  const { data, error } = await supabase
    .from('alert_log_entries')
    .select('*')
    .eq('alert_id', alertId)
    .order('timestamp', { ascending: true });
  if (error) { console.error('[AEGIS] fetchLogs:', error.message); return []; }
  return Array.isArray(data) ? data : [];
}

export async function fetchUnits(): Promise<ResponseUnit[]> {
  const { data, error } = await supabase
    .from('response_units')
    .select('*')
    .order('name');
  if (error) { console.error('[AEGIS] fetchUnits:', error.message); return []; }
  return Array.isArray(data) ? data.map(mapUnit) : [];
}

export async function fetchZones(): Promise<RiskZone[]> {
  const { data, error } = await supabase
    .from('risk_zones')
    .select('*')
    .order('risk_score', { ascending: false });
  if (error) { console.error('[AEGIS] fetchZones:', error.message); return []; }
  return Array.isArray(data) ? data.map(mapZone) : [];
}

export async function fetchGuardians(): Promise<Guardian[]> {
  const { data, error } = await supabase
    .from('guardians')
    .select('*')
    .order('name');
  if (error) { console.error('[AEGIS] fetchGuardians:', error.message); return []; }
  return Array.isArray(data) ? data.map(mapGuardian) : [];
}

export async function fetchReports(): Promise<CommunityReport[]> {
  const { data, error } = await supabase
    .from('community_reports')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(50);
  if (error) { console.error('[AEGIS] fetchReports:', error.message); return []; }
  return Array.isArray(data) ? data.map(mapReport) : [];
}

export async function fetchChatMessages(alertId: string): Promise<ChatMessage[]> {
  const { data, error } = await supabase
    .from('chat_messages')
    .select('*')
    .eq('alert_id', alertId)
    .order('created_at', { ascending: true })
    .limit(100);
  if (error) { console.error('[AEGIS] fetchChat:', error.message); return []; }
  return Array.isArray(data) ? data.map(mapChat) : [];
}

export async function fetchStats(): Promise<SystemStats | null> {
  const { data, error } = await supabase
    .from('system_stats')
    .select('*')
    .eq('id', 1)
    .maybeSingle();
  if (error) { console.error('[AEGIS] fetchStats:', error.message); return null; }
  if (!data) return null;
  return {
    totalAlerts: data.total_alerts,
    activeAlerts: data.active_alerts,
    resolvedToday: data.resolved_today,
    avgResponseMinutes: Number(data.avg_response_minutes),
    activeGuardians: data.active_guardians,
    sentinelDevices: data.sentinel_devices,
    meshNodes: data.mesh_nodes,
    networkUptime: Number(data.network_uptime),
  };
}

// ── Mutation functions ────────────────────────────────────────

export async function updateAlertStatus(alertId: string, status: string) {
  const { error } = await supabase
    .from('alerts')
    .update({ status, updated_at: new Date().toISOString() })
    .eq('id', alertId);
  if (error) console.error('[AEGIS] updateAlertStatus:', error.message);
}

export async function dispatchUnit(unitId: string, alertId: string) {
  const { error: unitErr } = await supabase
    .from('response_units')
    .update({ status: 'responding', current_alert_id: alertId, updated_at: new Date().toISOString() })
    .eq('id', unitId);

  const { error: alertErr } = await supabase
    .from('alerts')
    .update({ status: 'dispatched', updated_at: new Date().toISOString() })
    .eq('id', alertId);

  if (unitErr) console.error('[AEGIS] dispatchUnit(unit):', unitErr.message);
  if (alertErr) console.error('[AEGIS] dispatchUnit(alert):', alertErr.message);
}

export async function sendChatMessage(alertId: string, senderId: string, senderName: string, content: string) {
  const { error } = await supabase
    .from('chat_messages')
    .insert({ alert_id: alertId, sender_id: senderId, sender_name: senderName, content });
  if (error) console.error('[AEGIS] sendChat:', error.message);
}

export async function submitCommunityReport(
  lat: number, lng: number,
  description: string,
  category: string,
) {
  const { error } = await supabase
    .from('community_reports')
    .insert({ lat, lng, description, category });
  if (error) console.error('[AEGIS] submitReport:', error.message);
  return !error;
}

// ── Oracle AI analysis (Edge Function, streaming) ────────────
// eslint-disable-next-line @typescript-eslint/no-explicit-any
export async function oracleAnalyze(payload: Record<string, any>, onChunk: (text: string) => void): Promise<string> {
  const { data, error } = await supabase.functions.invoke('oracle-analyze', {
    method: 'POST',
    body: payload,
  });

  if (error) {
    const errMsg = await error?.context?.text?.().catch(() => error.message);
    console.error('[AEGIS] Oracle error:', errMsg);
    throw new Error(errMsg ?? 'Oracle analysis failed');
  }

  // The response is SSE — parse accumulated text from Gemini stream
  try {
    let fullText = '';
    const stream = data as ReadableStream<Uint8Array>;
    const reader = stream.getReader();
    const decoder = new TextDecoder();

    while (true) {
      const { done, value } = await reader.read();
      if (done) break;
      const chunk = decoder.decode(value, { stream: true });
      // Parse SSE data lines
      const lines = chunk.split('\n');
      for (const line of lines) {
        if (!line.startsWith('data: ')) continue;
        try {
          const json = JSON.parse(line.slice(6));
          const text = json?.candidates?.[0]?.content?.parts?.[0]?.text ?? '';
          if (text) { fullText += text; onChunk(fullText); }
        } catch { /* partial frame */ }
      }
    }
    return fullText;
  } catch {
    // Non-streaming fallback — data is already parsed JSON
    const text = typeof data === 'string' ? data : JSON.stringify(data);
    onChunk(text);
    return text;
  }
}
