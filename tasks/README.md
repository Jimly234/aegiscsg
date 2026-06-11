# Aegis CSG - Civilian Safety Grid

Aegis CSG is a multi-layered civilian safety technology system for Nigeria, designed to rapidly alert, track, and coordinate rescue for citizens in distress.

## System Architecture

```
┌─────────────────┐     ┌─────────────────┐     ┌─────────────────┐
│  Sentinel App   │     │  Public Portal  │     │ Guardian Portal │
│  (Flutter)      │     │  (Next.js)      │     │  (Next.js)      │
└────────┬────────┘     └────────┬────────┘     └────────┬────────┘
         │                       │                       │
         └───────────────────────┼───────────────────────┘
                                 │
                    ┌─────────────▼─────────────┐
                    │     Aegis API (FastAPI)     │
                    │     WebSocket / REST        │
                    └─────────────┬─────────────┘
                                  │
        ┌──────────┬────────────┼────────────┬──────────┐
        │          │            │            │          │
   ┌────▼────┐ ┌───▼───┐ ┌─────▼─────┐ ┌────▼────┐ ┌────▼────┐
   │PostgreSQL│ │ Neo4j │ │   Kafka   │ │  Redis  │ │ Blockchain│
   │+Timescale│ │ Graph │ │  Events   │ │  Cache  │ │ (Hyperledger)
   └─────────┘ └───────┘ └───────────┘ └─────────┘ └─────────┘
```

## Components

### Applications
- **aegis-web** - Next.js 14 web application (Public Portal, Guardian Dashboard, Command Center)
- **aegis-api** - FastAPI Python backend with WebSocket support
- **aegis-mobile** - Flutter mobile app (Sentinel Mode, Emergency Trigger, Shell Mode)

### Services
- **oracle** - Predictive Intelligence Engine (anomaly detection, risk assessment)
- **mesh** - AegisNet LoRaWAN mesh network firmware for ESP32

### Infrastructure
- **blockchain/pillar** - Hyperledger Fabric evidence ledger
- **infra/docker** - Docker Compose and Dockerfiles
- **infra/k8s** - Kubernetes deployment manifests
- **infra/ci-cd** - GitHub Actions CI/CD pipeline

## Quick Start

### Prerequisites
- Docker and Docker Compose
- Node.js 20+ (for web development)
- Python 3.11+ (for API development)
- Flutter 3.22+ (for mobile development)

### Run with Docker Compose

```bash
# Clone and enter directory
cd aegis-csg

# Start all services
docker-compose -f infra/docker/docker-compose.yml up -d

# Access:
# Web Portal: http://localhost:3000
# API Docs:   http://localhost:8000/docs
# API:        http://localhost:8000
```

### Development Setup

```bash
# API Backend
cd apps/aegis-api
python -m venv venv
source venv/bin/activate
pip install -r requirements.txt
uvicorn app.main:app --reload

# Web Frontend
cd apps/aegis-web
npm install
npm run dev

# Mobile App
cd apps/aegis-mobile
flutter pub get
flutter run
```

## Project Structure

```
aegis-csg/
├── apps/
│   ├── aegis-web/          # Next.js 14 + React + TypeScript + TailwindCSS
│   │   ├── app/            # Next.js app router pages
│   │   ├── components/     # React components
│   │   ├── lib/            # Utilities, demo data, store
│   │   └── types/          # TypeScript type definitions
│   ├── aegis-api/          # FastAPI Python backend
│   │   ├── app/
│   │   │   ├── main.py     # FastAPI entry point
│   │   │   ├── routers/    # API route handlers
│   │   │   ├── models/     # Pydantic schemas
│   │   │   └── services/   # Business logic services
│   │   └── migrations/     # SQL schema migrations
│   └── aegis-mobile/       # Flutter mobile application
│       └── lib/
│           ├── screens/    # UI screens
│           └── models/     # Data models
├── services/
│   ├── oracle/             # Predictive intelligence engine
│   └── mesh/               # LoRaWAN mesh firmware
├── blockchain/
│   └── pillar/             # Hyperledger Fabric evidence ledger
├── infra/
│   ├── docker/             # Docker configurations
│   ├── k8s/                # Kubernetes manifests
│   └── ci-cd/              # GitHub Actions workflows
└── docs/
    ├── security_protocols.md
    └── testing_strategy.md
```

## Key Features

### Sentinel Mobile App
- **Emergency Trigger**: 3-second press-and-hold activation with audio stream
- **Sentinel Mode**: Passive background scanning (Bluetooth, Wi-Fi, cell towers)
- **Shell Mode**: Decoy calculator interface for safety
- **Guardian Setup**: Configure emergency contacts with priority levels
- **Offline Resilience**: SMS fallback, local queue, LoRaWAN broadcast

### Web Dashboards
- **Public Transparency Portal**: Real-time safety map, risk zones, community reports
- **Guardian Dashboard**: Active alerts, victim tracking, coordination chat, audio stream
- **Command Center**: Operations map, dispatch controls, analytics, alert management

### Backend Services
- **Oracle Engine**: Anomaly detection, risk forecasting, behavioral clustering
- **Evidence Ledger**: Immutable blockchain evidence storage with multi-signature
- **AegisNet Mesh**: LoRaWAN mesh network for off-grid emergency communication

## Database Schema

The system uses multiple databases for different data types:
- **PostgreSQL + TimescaleDB**: Relational data, time-series sensor events
- **Neo4j**: Relationship graphs (device co-occurrence, guardian networks)
- **Redis**: Session cache, rate limiting, real-time pub/sub
- **Hyperledger Fabric**: Immutable evidence ledger

See `apps/aegis-api/migrations/001_initial_schema.sql` for full PostgreSQL schema.

## API Documentation

When running the API locally, interactive documentation is available at:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc

## Security

Security protocols and compliance information:
- See `docs/security_protocols.md`
- Encryption: AES-256-GCM at rest, TLS 1.3 in transit
- Authentication: Role-based access control with MFA
- Privacy: PII anonymization, location fuzzing, data minimization
- Compliance: NDPR, Cybercrimes Act, ISO 27001

## Testing

Testing strategy and procedures:
- See `docs/testing_strategy.md`
- Unit tests: pytest (backend), Jest (frontend), flutter_test (mobile)
- Integration tests: Docker Compose test stack
- E2E tests: Cypress (web), Appium (mobile)
- Security: SAST, DAST, dependency scanning, container scanning

## Deployment

### Docker Compose
```bash
docker-compose -f infra/docker/docker-compose.yml up -d
```

### Kubernetes
```bash
kubectl apply -f infra/k8s/ --namespace=aegis
```

### CI/CD
GitHub Actions pipeline defined in `infra/ci-cd/github-actions.yml`:
- Automated testing on every PR
- Security scanning with Trivy
- Docker image build and push to GHCR
- Staging and production deployment gates

## Contributing

1. Fork the repository
2. Create a feature branch (`git checkout -b feature/amazing-feature`)
3. Commit your changes (`git commit -m 'Add amazing feature'`)
4. Push to the branch (`git push origin feature/amazing-feature`)
5. Open a Pull Request

## License

Copyright 2026 Aegis CSG. All rights reserved.

This project is proprietary software. See LICENSE file for details.

## Contact

- **Project**: Aegis CSG - Civilian Safety Grid
- **Version**: 2.0 - Production Build
- **Support**: support@aegis.ng
- **Security**: security@aegis.ng

---

**Built for Nigeria. Built for safety.**
