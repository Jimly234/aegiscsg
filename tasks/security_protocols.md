# Aegis CSG Security Protocols

## Document Control
- **Version**: 2.0
- **Classification**: Confidential
- **Date**: 2026-06-10

## 1. Threat Model

### Attack Surfaces
| Surface | Risk Level | Mitigation |
|---------|-----------|------------|
| Mobile app reverse engineering | High | Code obfuscation, anti-tamper |
| API endpoint enumeration | High | Rate limiting, API key rotation |
| Blockchain ledger tampering | Critical | Multi-organization consensus |
| Database breach | Critical | Encryption at rest, field-level encryption |
| Man-in-the-middle | High | mTLS, certificate pinning |
| Supply chain | Medium | Signed commits, dependency scanning |

## 2. Encryption Standards

### Data at Rest
- Database: AES-256-GCM
- Mobile storage: AES-256-GCM with hardware-backed keystore
- Evidence files: SHA-256 hash + blockchain anchoring

### Data in Transit
- All APIs: TLS 1.3 with mTLS for internal services
- WebSocket: WSS with pinned certificates
- Mesh network: AES-256-GCM with per-session keys

### Key Management
- Production keys stored in HSM or AWS KMS
- Development keys in .env files (never committed)
- Key rotation every 90 days

## 3. Authentication & Authorization

### MFA Requirements
| Role | MFA Required | Methods |
|------|-------------|---------|
| Admin | Yes | TOTP + hardware key |
| Analyst | Yes | TOTP |
| Guardian | Yes | TOTP or SMS |
| Citizen | Optional | TOTP |

### RBAC Matrix
- **citizen**: View own alerts, manage guardians, community reporting
- **guardian**: Citizen rights + view assigned alerts, respond to alerts
- **commander**: Guardian rights + dispatch units, view all alerts, manage zones
- **analyst**: Read-only access to all data, export reports
- **admin**: Full system access, user management, configuration

## 4. Data Privacy

### PII Handling
- Names stored encrypted with user-specific keys
- Phone numbers: one-way hash for lookups, encrypted for storage
- Location data: 50m grid fuzzing, auto-expire after 90 days
- Delete logs anonymized, not deleted (compliance requirement)

### Anonymization Pipeline
```
Raw Data -> PII Strip -> Grid Fuzz -> AES Encrypt -> Hash Anchor -> Blockchain
```

## 5. Incident Response

### Severity Levels
| Level | Response Time | Escalation |
|-------|-------------|------------|
| P1 Critical | 15 minutes | CEO + CTO + Legal |
| P2 High | 1 hour | CTO + Security Lead |
| P3 Medium | 4 hours | Security Lead |
| P4 Low | 24 hours | Operations |

### Forensics Chain
1. Preserve all evidence (blockchain-anchored)
2. Isolate affected systems
3. Engage legal counsel
4. Notify NITDA within 72 hours (NDPR compliance)
5. Public disclosure per policy

## 6. Compliance

- **NDPR**: Nigeria Data Protection Regulation 2023
- **Cybercrimes Act**: Compliance with lawful intercept requirements
- **ISO 27001**: Information Security Management
- **SOC 2 Type II**: Annual audit requirement

## 7. Security Testing

- SAST: SonarQube on every commit
- DAST: OWASP ZAP weekly scans
- Penetration Testing: Quarterly by certified firm
- Bug Bounty: HackerOne program (P1=$5000, P2=$2000)
