"""
Startup seed data for Aegis CSG API.
Pre-populates all in-memory stores with realistic Nigeria-based demo data
so all GET endpoints return useful data from the first request.
"""

from datetime import datetime, timedelta
from app.models.schemas import (
    AlertResponse, AlertStatus, AlertPriority, AIAnalysis, LogEntry,
    GeoLocation, GuardianResponse, ResponseUnitResponse,
    RiskZoneResponse, SafeZone, CommunityReportResponse,
)


def seed_alerts() -> dict:
    now = datetime.utcnow()
    return {
        "ALT-2341": AlertResponse(
            id="ALT-2341",
            victim_name="Amina Bello",
            victim_age=34,
            victim_gender="F",
            location=GeoLocation(lat=10.5234, lng=7.4356, accuracy=5),
            address="Kaduna-Zaria Road, Km 47",
            status=AlertStatus.ACTIVE,
            priority=AlertPriority.CRITICAL,
            timestamp=now - timedelta(minutes=12),
            battery_level=67,
            signal_strength="Low (2G)",
            guardians_notified=3,
            guardians_acknowledged=2,
            audio_streaming=True,
            speed=45.0,
            heading="278 (West)",
            movement_pattern="Vehicle on highway, moving away from city",
            ai_analysis=AIAnalysis(
                voices_detected=4,
                language="Hausa",
                confidence=0.87,
                keywords=["road", "forest", "village"],
                stress_level="High",
                vehicle_engine=True,
                threat_score=0.78,
            ),
            log_entries=[
                LogEntry(id="L1", timestamp=(now - timedelta(minutes=12)).isoformat(), message="Alert received from Sentinel device", author="System", type="system"),
                LogEntry(id="L2", timestamp=(now - timedelta(minutes=11)).isoformat(), message="Watch Officer Musa assigned", author="System", type="system"),
                LogEntry(id="L3", timestamp=(now - timedelta(minutes=10)).isoformat(), message="AI audio analysis initiated — 4 voices detected, stress HIGH", author="Oracle", type="ai"),
                LogEntry(id="L4", timestamp=(now - timedelta(minutes=8)).isoformat(), message="Rapid Response 3 dispatched — ETA 8 mins", author="Cmdr. Musa", type="officer"),
                LogEntry(id="L5", timestamp=(now - timedelta(minutes=7)).isoformat(), message="Birnin Gwari station alerted for intercept", author="System", type="system"),
            ],
        ),
        "ALT-2342": AlertResponse(
            id="ALT-2342",
            victim_name="Ibrahim Yusuf",
            victim_age=42,
            victim_gender="M",
            location=GeoLocation(lat=10.6123, lng=7.5123, accuracy=12),
            address="Abuja-Kaduna Highway, Near Toll Gate",
            status=AlertStatus.ACKNOWLEDGED,
            priority=AlertPriority.CRITICAL,
            timestamp=now - timedelta(minutes=25),
            battery_level=34,
            signal_strength="None (SMS Fallback)",
            guardians_notified=5,
            guardians_acknowledged=2,
            audio_streaming=False,
            log_entries=[
                LogEntry(id="L6", timestamp=(now - timedelta(minutes=25)).isoformat(), message="Alert received via SMS fallback (no data connection)", author="System", type="system"),
                LogEntry(id="L7", timestamp=(now - timedelta(minutes=23)).isoformat(), message="Last GPS fix: 10.6123, 7.5123 — 12m accuracy", author="System", type="system"),
                LogEntry(id="L8", timestamp=(now - timedelta(minutes=21)).isoformat(), message="Guardian Dr. Bello acknowledged via SMS", author="System", type="system"),
            ],
        ),
        "ALT-2343": AlertResponse(
            id="ALT-2343",
            victim_name="Sarah Abubakar",
            victim_age=27,
            victim_gender="F",
            location=GeoLocation(lat=10.7123, lng=6.8234, accuracy=8),
            address="Birnin Gwari Town Center",
            status=AlertStatus.DISPATCHED,
            priority=AlertPriority.HIGH,
            timestamp=now - timedelta(minutes=45),
            battery_level=82,
            signal_strength="Good (4G)",
            guardians_notified=4,
            guardians_acknowledged=3,
            audio_streaming=True,
            log_entries=[
                LogEntry(id="L9", timestamp=(now - timedelta(minutes=45)).isoformat(), message="Alert received — full data connection", author="System", type="system"),
                LogEntry(id="L10", timestamp=(now - timedelta(minutes=42)).isoformat(), message="3 of 4 guardians acknowledged within 2 minutes", author="System", type="system"),
                LogEntry(id="L11", timestamp=(now - timedelta(minutes=40)).isoformat(), message="Patrol 12 dispatched from Birnin Gwari station", author="Cmdr. Musa", type="officer"),
            ],
        ),
        "ALT-2344": AlertResponse(
            id="ALT-2344",
            victim_name="John Okonkwo",
            victim_age=55,
            victim_gender="M",
            location=GeoLocation(lat=11.1234, lng=7.7234, accuracy=6),
            address="Zaria City, Sabon Gari District",
            status=AlertStatus.RESOLVED,
            priority=AlertPriority.MEDIUM,
            timestamp=now - timedelta(minutes=90),
            battery_level=91,
            signal_strength="Excellent (4G)",
            guardians_notified=3,
            guardians_acknowledged=3,
            audio_streaming=False,
            log_entries=[
                LogEntry(id="L12", timestamp=(now - timedelta(minutes=90)).isoformat(), message="Alert received", author="System", type="system"),
                LogEntry(id="L13", timestamp=(now - timedelta(minutes=80)).isoformat(), message="Guardian confirmed false alarm — device triggered accidentally", author="System", type="guardian"),
                LogEntry(id="L14", timestamp=(now - timedelta(minutes=75)).isoformat(), message="Alert resolved — false alarm confirmed by user", author="Cmdr. Musa", type="officer"),
            ],
        ),
        "ALT-2345": AlertResponse(
            id="ALT-2345",
            victim_name="Fatima Aliyu",
            victim_age=19,
            victim_gender="F",
            location=GeoLocation(lat=10.3456, lng=7.6789, accuracy=15),
            address="Gwagwalada Road, Nassarawa",
            status=AlertStatus.ACTIVE,
            priority=AlertPriority.HIGH,
            timestamp=now - timedelta(minutes=5),
            battery_level=45,
            signal_strength="Low (2G)",
            guardians_notified=2,
            guardians_acknowledged=1,
            audio_streaming=True,
            log_entries=[
                LogEntry(id="L15", timestamp=(now - timedelta(minutes=5)).isoformat(), message="Alert received — active audio stream started", author="System", type="system"),
                LogEntry(id="L16", timestamp=(now - timedelta(minutes=4)).isoformat(), message="Guardian Aisha Aliyu notified via push + SMS", author="System", type="system"),
            ],
        ),
    }


def seed_guardians() -> dict:
    now = datetime.utcnow()
    return {
        "G-DEMO1": GuardianResponse(
            id="G-DEMO1",
            name="Dr. Ibrahim Bello",
            relationship="Husband",
            phone="+234 810 123 4567",
            user_id="U-DEMO1",
            status="acknowledged",
            location=GeoLocation(lat=10.5145, lng=7.4234),
            distance=3.2,
            last_seen=now - timedelta(minutes=2),
            message="I'm mobilizing. Heading to last known location.",
        ),
        "G-DEMO2": GuardianResponse(
            id="G-DEMO2",
            name="Sarah Abubakar",
            relationship="Sister",
            phone="+234 810 234 5678",
            user_id="U-DEMO1",
            status="acknowledged",
            location=GeoLocation(lat=10.4987, lng=7.4456),
            distance=12.7,
            last_seen=now - timedelta(minutes=5),
            message="I've contacted police. Unit dispatching now.",
        ),
        "G-DEMO3": GuardianResponse(
            id="G-DEMO3",
            name="John Okonkwo",
            relationship="Colleague",
            phone="+234 810 345 6789",
            user_id="U-DEMO1",
            status="online",
            location=GeoLocation(lat=10.5567, lng=7.3890),
            distance=25.3,
            last_seen=now - timedelta(minutes=10),
        ),
        "G-DEMO4": GuardianResponse(
            id="G-DEMO4",
            name="Mary Johnson",
            relationship="Friend",
            phone="+234 810 456 7890",
            user_id="U-DEMO1",
            status="offline",
            last_seen=now - timedelta(hours=2),
        ),
    }


def seed_units() -> dict:
    return {
        "RU-DEMO1": ResponseUnitResponse(
            id="RU-DEMO1",
            name="Patrol 7",
            unit_type="patrol",
            region="Kaduna Central",
            status="available",
        ),
        "RU-DEMO2": ResponseUnitResponse(
            id="RU-DEMO2",
            name="Rapid Response 3",
            unit_type="rapid_response",
            region="Kaduna Central",
            status="responding",
            location=GeoLocation(lat=10.5234, lng=7.4356),
            eta=8,
            current_alert="ALT-2341",
        ),
        "RU-DEMO3": ResponseUnitResponse(
            id="RU-DEMO3",
            name="Patrol 12",
            unit_type="patrol",
            region="Zaria",
            status="available",
        ),
        "RU-DEMO4": ResponseUnitResponse(
            id="RU-DEMO4",
            name="K9 Unit 2",
            unit_type="k9",
            region="Kaduna Central",
            status="standby",
        ),
        "RU-DEMO5": ResponseUnitResponse(
            id="RU-DEMO5",
            name="Air Support 1",
            unit_type="air_support",
            region="North Central",
            status="unavailable",
        ),
        "RU-DEMO6": ResponseUnitResponse(
            id="RU-DEMO6",
            name="Medical Response 4",
            unit_type="medical",
            region="Kaduna Central",
            status="available",
        ),
    }


def seed_risk_zones() -> dict:
    now = datetime.utcnow()
    return {
        "RZ1": RiskZoneResponse(
            id="RZ1",
            name="Kaduna-Zaria Corridor",
            risk_score=0.85,
            geometry={"type": "Polygon", "coordinates": [[[7.3, 10.4], [7.6, 10.4], [7.6, 10.7], [7.3, 10.7], [7.3, 10.4]]]},
            factors=["High incident rate", "Remote area", "Limited cell coverage"],
            last_updated=now,
        ),
        "RZ2": RiskZoneResponse(
            id="RZ2",
            name="Birnin Gwari Forest",
            risk_score=0.92,
            geometry={"type": "Polygon", "coordinates": [[[6.7, 10.6], [7.0, 10.6], [7.0, 10.9], [6.7, 10.9], [6.7, 10.6]]]},
            factors=["Known kidnapping route", "Dense forest cover", "No police presence"],
            last_updated=now,
        ),
        "RZ3": RiskZoneResponse(
            id="RZ3",
            name="Abuja-Kaduna Highway North",
            risk_score=0.65,
            geometry={"type": "Polygon", "coordinates": [[[7.4, 10.5], [7.7, 10.5], [7.7, 10.8], [7.4, 10.8], [7.4, 10.5]]]},
            factors=["Highway banditry", "Inadequate lighting at night"],
            last_updated=now,
        ),
        "RZ4": RiskZoneResponse(
            id="RZ4",
            name="Funtua-Gusau Corridor",
            risk_score=0.78,
            geometry={"type": "Polygon", "coordinates": [[[6.5, 11.0], [6.9, 11.0], [6.9, 11.4], [6.5, 11.4], [6.5, 11.0]]]},
            factors=["Frequent armed robbery", "Low visibility routes"],
            last_updated=now,
        ),
    }


def seed_safe_zones() -> dict:
    return {
        "SZ1": SafeZone(
            id="SZ1",
            name="Kaduna Central Police Station",
            type="police",
            location=GeoLocation(lat=10.5167, lng=7.4333),
            phone="+234 810 111 1111",
            status="operational",
        ),
        "SZ2": SafeZone(
            id="SZ2",
            name="Kaduna Central Hospital",
            type="hospital",
            location=GeoLocation(lat=10.5189, lng=7.4312),
            phone="+234 810 222 2222",
            capacity=150,
            status="operational",
        ),
        "SZ3": SafeZone(
            id="SZ3",
            name="Zaria Police Headquarters",
            type="police",
            location=GeoLocation(lat=11.1111, lng=7.7222),
            phone="+234 810 333 3333",
            status="operational",
        ),
        "SZ4": SafeZone(
            id="SZ4",
            name="Birnin Gwari Army Checkpoint",
            type="checkpoint",
            location=GeoLocation(lat=10.7222, lng=6.8111),
            status="operational",
        ),
        "SZ5": SafeZone(
            id="SZ5",
            name="Kachia Forest Reserve Outpost",
            type="checkpoint",
            location=GeoLocation(lat=9.8765, lng=7.9234),
            status="operational",
        ),
    }


def seed_community_reports() -> dict:
    now = datetime.utcnow()
    return {
        "CR1": CommunityReportResponse(
            id="CR1",
            location=GeoLocation(lat=10.5234, lng=7.4356),
            description="Suspicious unmarked checkpoint reported on Kaduna-Zaria Road near Km 47. Men in civilian clothing stopping vehicles.",
            category="suspicious_activity",
            timestamp=now - timedelta(minutes=30),
            votes=12,
            verified=True,
        ),
        "CR2": CommunityReportResponse(
            id="CR2",
            location=GeoLocation(lat=10.7222, lng=6.8111),
            description="Unknown vehicles with no plates spotted in Birnin Gwari area — 3 SUVs parked near forest entrance.",
            category="suspicious_activity",
            timestamp=now - timedelta(hours=1),
            votes=8,
            verified=False,
        ),
        "CR3": CommunityReportResponse(
            id="CR3",
            location=GeoLocation(lat=10.6123, lng=7.5123),
            description="Road appears clear on Abuja-Kaduna Highway near Toll Gate — light traffic, no incidents observed.",
            category="road_clear",
            timestamp=now - timedelta(hours=2),
            votes=5,
            verified=True,
        ),
        "CR4": CommunityReportResponse(
            id="CR4",
            location=GeoLocation(lat=11.0234, lng=7.3456),
            description="Armed group of 5-6 individuals spotted on Saminaka road. Community urges caution after dark.",
            category="incident",
            timestamp=now - timedelta(hours=3),
            votes=22,
            verified=True,
        ),
        "CR5": CommunityReportResponse(
            id="CR5",
            location=GeoLocation(lat=10.4567, lng=7.2345),
            description="Military convoy passing through — route secure between 14:00-17:00. Travel window open.",
            category="checkpoint",
            timestamp=now - timedelta(hours=4),
            votes=31,
            verified=True,
        ),
    }


def populate_all_stores():
    """
    Called at application startup. Injects demo data into all in-memory router stores.
    """
    # Alerts
    from app.routers.alerts import alerts_db
    alerts_db.update(seed_alerts())

    # Guardians
    from app.routers.guardians import guardians_db
    guardians_db.update(seed_guardians())

    # Units
    from app.routers.units import units_db
    units_db.update(seed_units())

    # Public data
    from app.routers.public import community_reports_db, risk_zones_db
    community_reports_db.update(seed_community_reports())
    risk_zones_db.update(seed_risk_zones())

    print(f"[Seed] ✓ {len(alerts_db)} alerts")
    print(f"[Seed] ✓ {len(guardians_db)} guardians")
    print(f"[Seed] ✓ {len(units_db)} response units")
    print(f"[Seed] ✓ {len(community_reports_db)} community reports")
    print(f"[Seed] ✓ {len(risk_zones_db)} risk zones")
    print("[Seed] Demo data population complete.")
