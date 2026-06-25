-- ============================================================
-- Migration: Unified Alert Schema
-- Adds device-originated alert fields and makes victim info
-- nullable to support both device-only and victim-info alerts.
-- Also adds user_id and is_active to guardians table.
-- Idempotent: safe to run multiple times.
-- ============================================================

-- ── Alerts table: add new columns ────────────────────────────

-- Device that triggered the alert (nullable for backward compat with existing alerts)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'device_id'
  ) THEN
    ALTER TABLE alerts ADD COLUMN device_id UUID;
  END IF;
END $$;

-- Method used to trigger the alert (e.g. 'button_hold', 'voice', 'shake')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'trigger_method'
  ) THEN
    ALTER TABLE alerts ADD COLUMN trigger_method VARCHAR(50);
  END IF;
END $$;

-- Network type at time of alert (e.g. 'wifi', '4g', '5g', 'none')
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'alerts' AND column_name = 'network_type'
  ) THEN
    ALTER TABLE alerts ADD COLUMN network_type VARCHAR(50);
  END IF;
END $$;

-- ── Alerts table: make victim fields nullable ────────────────

-- victim_name: allow NULL for device-only alerts
ALTER TABLE alerts ALTER COLUMN victim_name DROP NOT NULL;

-- victim_age: allow NULL for device-only alerts
ALTER TABLE alerts ALTER COLUMN victim_age DROP NOT NULL;

-- victim_gender: allow NULL for device-only alerts
ALTER TABLE alerts ALTER COLUMN victim_gender DROP NOT NULL;

-- address: allow NULL for device-only alerts
ALTER TABLE alerts ALTER COLUMN address DROP NOT NULL;

-- ── Guardians table: add user_id column ──────────────────────

-- Associate guardian with authenticated user (nullable for backward compat)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'guardians' AND column_name = 'user_id'
  ) THEN
    ALTER TABLE guardians ADD COLUMN user_id UUID;
  END IF;
END $$;

-- ── Guardians table: add is_active column ────────────────────

-- Soft-delete flag for guardians (default true)
DO $$
BEGIN
  IF NOT EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_name = 'guardians' AND column_name = 'is_active'
  ) THEN
    ALTER TABLE guardians ADD COLUMN is_active BOOLEAN NOT NULL DEFAULT true;
  END IF;
END $$;
