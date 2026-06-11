// AEGIS Live Map — Google Maps API with animated markers, risk overlays, unit tracking
import { useCallback, useEffect, useRef, useState } from 'react';
import {
  APIProvider,
  Map,
  useMap,
  AdvancedMarker,
  Pin,
} from '@vis.gl/react-google-maps';
import type { Alert, ResponseUnit, RiskZone } from '@/types/aegis';

const GOOGLE_MAPS_API_KEY = import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '';

// Nigeria North Central default centre
const DEFAULT_CENTER = { lat: 10.5, lng: 7.4 };
const DEFAULT_ZOOM = 9;

// Map styling — dark tactical night-ops theme
const DARK_MAP_STYLE: google.maps.MapTypeStyle[] = [
  { elementType: 'geometry', stylers: [{ color: '#0d1628' }] },
  { elementType: 'labels.text.fill', stylers: [{ color: '#8fa8c8' }] },
  { elementType: 'labels.text.stroke', stylers: [{ color: '#0d1628' }] },
  { featureType: 'administrative', elementType: 'geometry', stylers: [{ visibility: 'off' }] },
  { featureType: 'administrative.country', elementType: 'labels', stylers: [{ color: '#4a6080' }] },
  { featureType: 'administrative.locality', elementType: 'labels.text.fill', stylers: [{ color: '#6080a0' }] },
  { featureType: 'road', elementType: 'geometry', stylers: [{ color: '#1a2840' }] },
  { featureType: 'road', elementType: 'labels.text.fill', stylers: [{ color: '#4a6080' }] },
  { featureType: 'road.highway', elementType: 'geometry', stylers: [{ color: '#1e3050' }] },
  { featureType: 'road.highway', elementType: 'geometry.stroke', stylers: [{ color: '#243a5e' }] },
  { featureType: 'road.arterial', elementType: 'geometry', stylers: [{ color: '#151f30' }] },
  { featureType: 'water', elementType: 'geometry', stylers: [{ color: '#0a1520' }] },
  { featureType: 'water', elementType: 'labels.text.fill', stylers: [{ color: '#1a3050' }] },
  { featureType: 'landscape', elementType: 'geometry', stylers: [{ color: '#0f1c2e' }] },
  { featureType: 'landscape.natural', elementType: 'geometry', stylers: [{ color: '#0d1a28' }] },
  { featureType: 'poi', stylers: [{ visibility: 'off' }] },
  { featureType: 'transit', stylers: [{ visibility: 'off' }] },
];

// ── Risk Zone Rectangle overlay ──────────────────────────────
function RiskZoneOverlay({ zone, map }: { zone: RiskZone; map: google.maps.Map }) {
  const rectRef = useRef<google.maps.Rectangle | null>(null);

  useEffect(() => {
    const fillColor =
      zone.riskScore >= 0.8 ? '#ef4444' :
      zone.riskScore >= 0.6 ? '#f97316' : '#eab308';

    rectRef.current = new google.maps.Rectangle({
      bounds: {
        south: zone.bounds[1],
        west: zone.bounds[0],
        north: zone.bounds[3],
        east: zone.bounds[2],
      },
      strokeColor: fillColor,
      strokeOpacity: 0.7,
      strokeWeight: 1.5,
      fillColor,
      fillOpacity: 0.12,
      map,
      clickable: false,
    });

    return () => { rectRef.current?.setMap(null); };
  }, [zone, map]);

  return null;
}

// ── Alert pulse circle overlay ───────────────────────────────
function AlertPulseOverlay({ alert, map }: { alert: Alert; map: google.maps.Map }) {
  const circleRef = useRef<google.maps.Circle | null>(null);
  const [opacity, setOpacity] = useState(0.3);

  useEffect(() => {
    const color = alert.priority === 'critical' ? '#ef4444' : alert.priority === 'high' ? '#f97316' : '#eab308';
    circleRef.current = new google.maps.Circle({
      center: { lat: alert.location.lat, lng: alert.location.lng },
      radius: 2500,
      strokeColor: color,
      strokeOpacity: 0.6,
      strokeWeight: 1,
      fillColor: color,
      fillOpacity: opacity,
      map,
      clickable: false,
    });
    return () => { circleRef.current?.setMap(null); };
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [alert, map]);

  // Animate pulse
  useEffect(() => {
    let frame = 0;
    const id = setInterval(() => {
      frame = (frame + 1) % 60;
      const pulse = 0.08 + 0.2 * Math.abs(Math.sin((frame / 60) * Math.PI * 2));
      circleRef.current?.setOptions({ fillOpacity: pulse });
    }, 50);
    return () => clearInterval(id);
  }, []);

  return null;
}

// ── Alert marker HTML ────────────────────────────────────────
function AlertMarkerContent({ alert, onClick }: { alert: Alert; onClick: () => void }) {
  const color = alert.priority === 'critical' ? '#ef4444' : alert.priority === 'high' ? '#f97316' : '#eab308';
  return (
    <div onClick={onClick} style={{ cursor: 'pointer', position: 'relative', transform: 'translate(-50%, -50%)' }}>
      <div style={{
        width: 32, height: 32, borderRadius: '50%',
        background: `${color}30`, border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        animation: 'aegis-ping 1.4s ease-in-out infinite',
        position: 'absolute', inset: -4,
      }} />
      <div style={{
        width: 28, height: 28, borderRadius: '50%',
        background: `${color}20`, border: `2px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative', zIndex: 1,
      }}>
        <div style={{ width: 10, height: 10, borderRadius: '50%', background: color }} />
      </div>
      <div style={{
        position: 'absolute', top: -28, left: '50%', transform: 'translateX(-50%)',
        background: '#0d1628', border: `1px solid ${color}`,
        color, padding: '1px 5px', borderRadius: 3, fontSize: 9, fontFamily: 'monospace',
        whiteSpace: 'nowrap', zIndex: 10,
      }}>
        {alert.id}
      </div>
    </div>
  );
}

// ── Unit marker ──────────────────────────────────────────────
function UnitMarkerContent({ unit }: { unit: ResponseUnit }) {
  const color = unit.status === 'responding' ? '#3b82f6' : unit.status === 'available' ? '#22c55e' : '#6b7280';
  return (
    <div style={{ cursor: 'default', position: 'relative', transform: 'translate(-50%, -50%)' }}>
      <div style={{
        width: 20, height: 20, borderRadius: 3,
        background: `${color}30`, border: `1.5px solid ${color}`,
        display: 'flex', alignItems: 'center', justifyContent: 'center',
        position: 'relative',
      }}>
        <div style={{ width: 8, height: 8, borderRadius: 2, background: color }} />
      </div>
      <div style={{
        position: 'absolute', top: -20, left: '50%', transform: 'translateX(-50%)',
        background: '#0d1628', border: `1px solid ${color}40`,
        color: '#8fa8c8', padding: '1px 4px', borderRadius: 3, fontSize: 8, fontFamily: 'monospace',
        whiteSpace: 'nowrap',
      }}>
        {unit.name}
      </div>
    </div>
  );
}

// ── Dispatch route line ──────────────────────────────────────
function DispatchRoute({ unit, alert, map }: { unit: ResponseUnit; alert: Alert; map: google.maps.Map }) {
  useEffect(() => {
    if (!unit.location) return;
    const line = new google.maps.Polyline({
      path: [unit.location, alert.location],
      geodesic: true,
      strokeColor: '#3b82f6',
      strokeOpacity: 0.7,
      strokeWeight: 2,
      icons: [{
        icon: { path: 'M 0,-1 0,1', strokeOpacity: 1, scale: 3 },
        offset: '0', repeat: '20px',
      }],
      map,
    });
    return () => line.setMap(null);
  }, [unit, alert, map]);
  return null;
}

// ── Inner map component (has access to map instance) ─────────
function AegisMapInner({
  alerts, units, zones, onAlertClick,
}: {
  alerts: Alert[];
  units: ResponseUnit[];
  zones: RiskZone[];
  onAlertClick: (a: Alert) => void;
}) {
  const map = useMap();

  if (!map) return null;

  const activeAlerts = alerts.filter((a) => a.status !== 'resolved' && a.status !== 'cancelled');
  const dispatchedUnits = units.filter((u) => u.status === 'responding' && u.location);

  return (
    <>
      {/* Risk zone overlays */}
      {zones.map((z) => <RiskZoneOverlay key={z.id} zone={z} map={map} />)}

      {/* Alert pulse circles */}
      {activeAlerts.map((a) => <AlertPulseOverlay key={a.id} alert={a} map={map} />)}

      {/* Dispatch route lines */}
      {dispatchedUnits.map((u) => {
        const target = activeAlerts.find((a) => a.id === u.currentAlert);
        return target ? <DispatchRoute key={u.id} unit={u} alert={target} map={map} /> : null;
      })}

      {/* Alert markers */}
      {activeAlerts.map((a) => (
        <AdvancedMarker key={a.id} position={a.location}>
          <AlertMarkerContent alert={a} onClick={() => onAlertClick(a)} />
        </AdvancedMarker>
      ))}

      {/* Unit markers */}
      {units.filter((u) => u.location).map((u) => (
        <AdvancedMarker key={u.id} position={u.location!}>
          <UnitMarkerContent unit={u} />
        </AdvancedMarker>
      ))}
    </>
  );
}

// ── Selected alert info card ─────────────────────────────────
function AlertInfoCard({ alert, onClose }: { alert: Alert; onClose: () => void }) {
  const color = alert.priority === 'critical' ? '#ef4444' : alert.priority === 'high' ? '#f97316' : '#eab308';
  return (
    <div style={{
      position: 'absolute', bottom: 16, left: 16, zIndex: 20,
      background: '#0f1523', border: `1px solid ${color}60`,
      borderRadius: 6, padding: '10px 14px', minWidth: 220,
      boxShadow: `0 0 16px ${color}30`,
    }}>
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: 6 }}>
        <div>
          <div style={{ color, fontSize: 10, fontFamily: 'monospace', fontWeight: 700, textTransform: 'uppercase' }}>{alert.id} · {alert.priority}</div>
          <div style={{ color: '#d0e4f7', fontSize: 13, fontWeight: 600, marginTop: 2 }}>{alert.victimName}</div>
        </div>
        <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#4a6080', cursor: 'pointer', fontSize: 16, lineHeight: 1 }}>×</button>
      </div>
      <div style={{ color: '#6080a0', fontSize: 11 }}>{alert.address}</div>
      <div style={{ display: 'flex', gap: 12, marginTop: 6, fontSize: 10, color: '#4a6080', fontFamily: 'monospace' }}>
        <span>🔋 {alert.batteryLevel}%</span>
        <span>📡 {alert.signalStrength}</span>
        {alert.audioStreaming && <span style={{ color: '#ef4444' }}>● AUDIO LIVE</span>}
      </div>
    </div>
  );
}

// ── Main exported map component ───────────────────────────────
interface AegisLiveMapProps {
  alerts: Alert[];
  units: ResponseUnit[];
  zones: RiskZone[];
  height?: string;
  showLegend?: boolean;
  defaultZoom?: number;
}

export function AegisLiveMap({ alerts, units, zones, height = '100%', showLegend = true, defaultZoom }: AegisLiveMapProps) {
  const [selectedAlert, setSelectedAlert] = useState<Alert | null>(null);

  // Auto-centre on single alert when zoomed in
  const center = (defaultZoom && alerts.length === 1)
    ? { lat: alerts[0].location.lat, lng: alerts[0].location.lng }
    : DEFAULT_CENTER;

  return (
    <div style={{ width: '100%', height, position: 'relative', borderRadius: 6, overflow: 'hidden' }}>
      <style>{`
        @keyframes aegis-ping {
          0%, 100% { transform: scale(1); opacity: 0.8; }
          50% { transform: scale(1.6); opacity: 0.2; }
        }
      `}</style>

      <APIProvider apiKey={GOOGLE_MAPS_API_KEY}>
        <Map
          defaultCenter={center}
          defaultZoom={defaultZoom ?? DEFAULT_ZOOM}
          mapId="aegis-ops-map"
          styles={DARK_MAP_STYLE}
          gestureHandling="greedy"
          disableDefaultUI={false}
          mapTypeControl={false}
          streetViewControl={false}
          fullscreenControl={true}
          zoomControl={true}
          style={{ width: '100%', height: '100%' }}
        >
          <AegisMapInner
            alerts={alerts}
            units={units}
            zones={zones}
            onAlertClick={setSelectedAlert}
          />
        </Map>
      </APIProvider>

      {/* Selected alert card */}
      {selectedAlert && (
        <AlertInfoCard alert={selectedAlert} onClose={() => setSelectedAlert(null)} />
      )}

      {/* Legend */}
      {showLegend && (
        <div style={{
          position: 'absolute', bottom: 16, right: 16, zIndex: 20,
          background: 'rgba(13,22,40,0.92)', border: '1px solid rgba(74,96,128,0.4)',
          borderRadius: 6, padding: '8px 12px', fontSize: 10,
          color: '#6080a0', fontFamily: 'monospace', display: 'flex', flexDirection: 'column', gap: 4,
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#ef4444', display: 'inline-block' }} />Critical alert</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: '50%', background: '#f97316', display: 'inline-block' }} />High alert</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 8, borderRadius: 2, background: '#3b82f6', display: 'inline-block' }} />Response unit</div>
          <div style={{ display: 'flex', alignItems: 'center', gap: 6 }}><span style={{ width: 8, height: 4, background: 'rgba(239,68,68,0.4)', display: 'inline-block' }} />Risk zone</div>
        </div>
      )}
    </div>
  );
}

export default AegisLiveMap;
