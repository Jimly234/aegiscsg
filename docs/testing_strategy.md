# Aegis CSG Testing Strategy

## 1. Testing Pyramid

```
    /\       E2E (Cypress, Appium)
   /  \      Integration (API, DB, Service)
  /____\     Unit (pytest, Jest, Flutter test)
```

## 2. Unit Testing

### Backend (Python/FastAPI)
- Framework: pytest with pytest-asyncio
- Coverage target: 90%
- Mock external services (Neo4j, Redis, Kafka)
- Test files: `*_test.py` or `test_*.py`

```bash
cd apps/aegis-api
pytest --cov=app --cov-report=html tests/
```

### Frontend (Next.js)
- Framework: Jest + React Testing Library
- Coverage target: 80%
- Component tests with mocked API calls

```bash
cd apps/aegis-web
jest --coverage
```

### Mobile (Flutter)
- Framework: flutter_test
- Widget tests for all screens
- Integration tests for critical flows

```bash
cd apps/aegis-mobile
flutter test
```

## 3. Integration Testing

### API Integration
- Test all endpoints with real database
- Verify WebSocket message flows
- Kafka event production/consumption

```bash
# Start test stack
docker-compose -f docker-compose.test.yml up -d
pytest tests/integration/
```

### Database Integration
- Migration tests (up/down)
- Query performance benchmarks
- TimescaleDB hypertable operations

## 4. End-to-End Testing

### Web E2E (Cypress)
- User registration flow
- Emergency alert creation and resolution
- Guardian acknowledgment flow

```bash
cd apps/aegis-web
cypress run
```

### Mobile E2E (Appium + Flutter Driver)
- Sentinel mode activation
- Emergency trigger (3-second hold)
- Shell mode calculator

## 5. Performance Testing

### Load Testing (Locust)
```python
from locust import HttpUser, task

class AegisUser(HttpUser):
    @task(10)
    def trigger_alert(self):
        self.client.post("/api/v1/alerts/", json={...})
    
    @task(1)
    def resolve_alert(self):
        self.client.patch("/api/v1/alerts/RESOLVED")
```

### Stress Testing
- Target: 10,000 concurrent alert triggers
- SLO: p99 latency < 2s for alert creation
- Failure mode: Degrade gracefully to SMS fallback

## 6. Security Testing

- **SAST**: SonarQube, Semgrep
- **DAST**: OWASP ZAP, Burp Suite
- **Dependency Scanning**: Snyk, Dependabot
- **Container Scanning**: Trivy, Clair

## 7. Chaos Engineering

### Failure Injection
- Kill random API pods (verify HPA recovery)
- Drop database connections (verify retry logic)
- Partition Kafka (verify message buffering)
- Network latency injection (mesh resilience)

## 8. Acceptance Criteria

### Definition of Done
- [ ] All unit tests passing
- [ ] Integration tests passing
- [ ] E2E critical path tests passing
- [ ] Security scan clean (no Critical/High)
- [ ] Performance benchmarks met
- [ ] Code review approved
- [ ] Documentation updated
