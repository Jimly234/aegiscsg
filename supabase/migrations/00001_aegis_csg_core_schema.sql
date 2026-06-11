
-- ============================================================
-- AEGIS CSG Core Schema
-- ============================================================

-- Enable extensions
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";
CREATE EXTENSION IF NOT EXISTS "postgis";

-- ── Enum types ───────────────────────────────────────────────
CREATE TYPE alert_status   AS ENUM ('active','acknowledged','dispatched','resolved','cancelled');
CREATE TYPE alert_priority AS ENUM ('critical','high','medium','low');
CREATE TYPE unit_status    AS ENUM ('available','responding','standby','unavailable');
CREATE TYPE unit_type      AS ENUM ('patrol','rapid_response','k9','air_support','medical');
CREATE TYPE report_category AS ENUM ('suspicious_activity','incident','road_clear','checkpoint','armed_group');
CREATE TYPE log_entry_type AS ENUM ('system','ai','officer','guardian');

-- ── Risk zones ───────────────────────────────────────────────
CREATE TABLE risk_zones (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         text NOT NULL,
  risk_score   numeric(4,3) NOT NULL CHECK (risk_score BETWEEN 0 AND 1),
  min_lng      numeric(9,6) NOT NULL,
  min_lat      numeric(9,6) NOT NULL,
  max_lng      numeric(9,6) NOT NULL,
  max_lat      numeric(9,6) NOT NULL,
  factors      text[] NOT NULL DEFAULT '{}',
  updated_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Response units ───────────────────────────────────────────
CREATE TABLE response_units (
  id              uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name            text NOT NULL,
  unit_type       unit_type NOT NULL,
  region          text NOT NULL,
  status          unit_status NOT NULL DEFAULT 'available',
  lat             numeric(10,7),
  lng             numeric(10,7),
  eta_minutes     int,
  current_alert_id uuid,
  updated_at      timestamptz NOT NULL DEFAULT now()
);

-- ── Alerts ───────────────────────────────────────────────────
CREATE TABLE alerts (
  id                    text PRIMARY KEY,
  victim_name           text NOT NULL,
  victim_age            int NOT NULL,
  victim_gender         char(1) NOT NULL,
  lat                   numeric(10,7) NOT NULL,
  lng                   numeric(10,7) NOT NULL,
  accuracy_meters       int,
  address               text NOT NULL,
  status                alert_status NOT NULL DEFAULT 'active',
  priority              alert_priority NOT NULL DEFAULT 'high',
  battery_level         int NOT NULL DEFAULT 100,
  signal_strength       text NOT NULL DEFAULT 'Unknown',
  guardians_notified    int NOT NULL DEFAULT 0,
  guardians_acknowledged int NOT NULL DEFAULT 0,
  audio_streaming       boolean NOT NULL DEFAULT false,
  speed_kmh             int,
  heading               text,
  movement_pattern      text,
  -- Oracle AI analysis
  ai_voices_detected    int,
  ai_language           text,
  ai_confidence         numeric(4,3),
  ai_keywords           text[],
  ai_stress_level       text,
  ai_vehicle_engine     boolean,
  ai_threat_score       numeric(4,3),
  triggered_at          timestamptz NOT NULL DEFAULT now(),
  updated_at            timestamptz NOT NULL DEFAULT now()
);

-- ── Guardians ────────────────────────────────────────────────
CREATE TABLE guardians (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  name         text NOT NULL,
  relationship text NOT NULL,
  phone        text NOT NULL,
  status       text NOT NULL DEFAULT 'offline',
  lat          numeric(10,7),
  lng          numeric(10,7),
  distance_km  numeric(6,2),
  last_seen    timestamptz NOT NULL DEFAULT now(),
  message      text
);

-- ── Alert log entries ────────────────────────────────────────
CREATE TABLE alert_log_entries (
  id         uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id   text NOT NULL REFERENCES alerts(id) ON DELETE CASCADE,
  timestamp  timestamptz NOT NULL DEFAULT now(),
  message    text NOT NULL,
  author     text NOT NULL,
  entry_type log_entry_type NOT NULL DEFAULT 'system'
);

-- ── Community reports ────────────────────────────────────────
CREATE TABLE community_reports (
  id           uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  lat          numeric(10,7) NOT NULL,
  lng          numeric(10,7) NOT NULL,
  description  text NOT NULL,
  category     report_category NOT NULL,
  votes        int NOT NULL DEFAULT 0,
  verified     boolean NOT NULL DEFAULT false,
  created_at   timestamptz NOT NULL DEFAULT now()
);

-- ── Chat messages ────────────────────────────────────────────
CREATE TABLE chat_messages (
  id          uuid PRIMARY KEY DEFAULT uuid_generate_v4(),
  alert_id    text REFERENCES alerts(id) ON DELETE CASCADE,
  sender_id   text NOT NULL,
  sender_name text NOT NULL,
  content     text NOT NULL,
  created_at  timestamptz NOT NULL DEFAULT now()
);

-- ── System stats (single-row) ────────────────────────────────
CREATE TABLE system_stats (
  id                    int PRIMARY KEY DEFAULT 1,
  total_alerts          int NOT NULL DEFAULT 0,
  active_alerts         int NOT NULL DEFAULT 0,
  resolved_today        int NOT NULL DEFAULT 0,
  avg_response_minutes  numeric(5,2) NOT NULL DEFAULT 0,
  active_guardians      int NOT NULL DEFAULT 0,
  sentinel_devices      int NOT NULL DEFAULT 0,
  mesh_nodes            int NOT NULL DEFAULT 0,
  network_uptime        numeric(5,2) NOT NULL DEFAULT 99.9,
  updated_at            timestamptz NOT NULL DEFAULT now(),
  CONSTRAINT single_row CHECK (id = 1)
);

-- ── Realtime publications ────────────────────────────────────
ALTER PUBLICATION supabase_realtime ADD TABLE alerts;
ALTER PUBLICATION supabase_realtime ADD TABLE chat_messages;
ALTER PUBLICATION supabase_realtime ADD TABLE response_units;

-- ── RLS (all public read for demo, write requires service role) ─
ALTER TABLE risk_zones         ENABLE ROW LEVEL SECURITY;
ALTER TABLE response_units     ENABLE ROW LEVEL SECURITY;
ALTER TABLE alerts             ENABLE ROW LEVEL SECURITY;
ALTER TABLE guardians          ENABLE ROW LEVEL SECURITY;
ALTER TABLE alert_log_entries  ENABLE ROW LEVEL SECURITY;
ALTER TABLE community_reports  ENABLE ROW LEVEL SECURITY;
ALTER TABLE chat_messages      ENABLE ROW LEVEL SECURITY;
ALTER TABLE system_stats       ENABLE ROW LEVEL SECURITY;

-- Public read
CREATE POLICY "public_read_risk_zones"        ON risk_zones        FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_response_units"    ON response_units    FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_alerts"            ON alerts            FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_guardians"         ON guardians         FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_log_entries"       ON alert_log_entries FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_community_reports" ON community_reports FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_chat_messages"     ON chat_messages     FOR SELECT TO anon, authenticated USING (true);
CREATE POLICY "public_read_system_stats"      ON system_stats      FOR SELECT TO anon, authenticated USING (true);

-- Public insert for chat and community reports
CREATE POLICY "public_insert_chat"    ON chat_messages     FOR INSERT TO anon, authenticated WITH CHECK (true);
CREATE POLICY "public_insert_reports" ON community_reports FOR INSERT TO anon, authenticated WITH CHECK (true);
