-- Seed data for Aegis CSG

INSERT INTO users (id, name, email, phone, password_hash, role, region, unit)
VALUES
    ('11111111-1111-1111-1111-111111111111', 'Dr. Ibrahim Bello', 'ibrahim@example.com', '+2348101234567', '$2b$12$hashed', 'guardian', 'North Central', NULL),
    ('22222222-2222-2222-2222-222222222222', 'Cmdr. Musa', 'musa@police.ng', '+2348109999999', '$2b$12$hashed', 'commander', 'North Central', 'Rapid Response'),
    ('33333333-3333-3333-3333-333333333333', 'Analyst Sarah', 'sarah@aegis.ng', '+2348108888888', '$2b$12$hashed', 'analyst', 'North Central', NULL),
    ('44444444-4444-4444-4444-444444444444', 'Admin User', 'admin@aegis.ng', '+2348107777777', '$2b$12$hashed', 'admin', NULL, NULL),
    ('55555555-5555-5555-5555-555555555555', 'Amina Bello', 'amina@example.com', '+2348105555555', '$2b$12$hashed', 'citizen', 'North Central', NULL)
ON CONFLICT (id) DO NOTHING;

INSERT INTO safe_zones (name, zone_type, location, address, phone, capacity, status)
VALUES
    ('Kaduna Central Police Station', 'police', ST_SetSRID(ST_MakePoint(7.4333, 10.5167), 4326), 'Kaduna Central', '+2348101111111', NULL, 'operational'),
    ('Kaduna Central Hospital', 'hospital', ST_SetSRID(ST_MakePoint(7.4312, 10.5189), 4326), 'Kaduna Central', '+2348102222222', 150, 'operational'),
    ('Zaria Police Station', 'police', ST_SetSRID(ST_MakePoint(7.7222, 11.1111), 4326), 'Zaria', '+2348103333333', NULL, 'operational'),
    ('Birnin Gwari Checkpoint', 'checkpoint', ST_SetSRID(ST_MakePoint(6.8111, 10.7222), 4326), 'Birnin Gwari', NULL, NULL, 'operational')
ON CONFLICT DO NOTHING;
