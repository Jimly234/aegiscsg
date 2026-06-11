# Requirements Document

## 1. Application Overview

**Application Name**: Aegis CSG (Civilian Safety Grid)

**Description**: A multi-layered civilian safety technology system for Nigeria, consisting of three interconnected applications: aegis-web (web dashboards), aegis-api (backend services), and aegis-mobile (mobile sentinel app). The system enables real-time emergency response, predictive risk intelligence, and transparent public safety monitoring.

---

## 2. Users and Usage Scenarios

**Target Users**:
- **Public Citizens**: View safety information, risk zones, community reports, and active alerts
- **Guardians**: Emergency contacts who receive alerts, manage victim tracking, coordinate responses
- **Security Forces**: Command center operators managing full alert lifecycle, dispatch, and analytics
- **Mobile App Users**: Civilians using the Sentinel App for emergency triggering and passive monitoring

**Core Usage Scenarios**:
- Citizens access public transparency portal to view safety statistics and risk zones
- Mobile app users trigger emergency alerts via 3-second hold activation
- Guardians receive real-time alerts, stream audio, and coordinate response actions
- Security forces monitor operations map, dispatch units, and analyze alert patterns
- System performs predictive risk assessment using Oracle intelligence engine

---

## 3. Page Structure and Functional Description

### 3.1 Application Structure

```
Aegis CSG System
├── aegis-web (Next.js Web Application)
│   ├── Public Transparency Portal
│   ├── Guardian Dashboard
│   └── Security Forces Command Center
├── aegis-api (FastAPI Backend)
│   ├── REST API Endpoints
│   ├── WebSocket Real-time Communication
│   └── Oracle Predictive Intelligence Engine
└── aegis-mobile (Flutter Mobile App)
    ├── Authentication Screens
    ├── Emergency Trigger Screens
    ├── Sentinel Mode Screens
    └── Guardian Management Screens
```

### 3.2 aegis-web (Web Application)

#### 3.2.1 Public Transparency Portal

**Purpose**: Provide public access to anonymized safety data and community insights

**Core Features**:
- **Safety Map**: Display Nigeria-based geographic map with risk zones color-coded by severity level
- **Risk Zones**: List risk zones with location, severity rating, and recent incident count
- **Community Reports**: Show anonymized community-submitted safety reports with timestamp and category
- **Statistics Dashboard**: Display aggregate metrics (total alerts, response times, active guardians, resolved incidents)
- **Active Alerts**: Show ongoing alerts with anonymized location, alert type, and status (anonymized victim details excluded)

#### 3.2.2 Guardian Dashboard

**Purpose**: Enable emergency contacts to manage alerts and coordinate responses

**Core Features**:
- **Alert Management**: Display assigned alerts with victim name, location, alert type, timestamp, and current status
- **Victim Tracking**: Show real-time location updates of victims on map interface
- **Audio Streaming**: Stream live audio from victim's device during active alert
- **Coordination Chat**: Group chat interface for guardians assigned to same alert
- **Response Unit Dispatch**: Request security force unit dispatch with location and urgency level
- **Alert Actions**: Mark alert as acknowledged, escalate priority, or mark as resolved

#### 3.2.3 Security Forces Command Center

**Purpose**: Provide full operational control for security force personnel

**Core Features**:
- **Operations Map**: Display all active alerts, response units, and risk zones on Nigeria map
- **Full Alert Control**: View complete alert details including victim identity, guardian contacts, evidence files, and audio streams
- **Unit Dispatch**: Assign response units to alerts, track unit location and status
- **Analytics Dashboard**: View alert trends, response time metrics, geographic hotspots, and resolution rates
- **Activity Logging**: Access complete audit log of all system actions with timestamp and user attribution
- **Alert Lifecycle Management**: Update alert status, add notes, attach evidence, and close alerts

### 3.3 aegis-api (Backend API)

#### 3.3.1 API Router Structure

**8 Core Routers**:
1. **auth**: User authentication, OTP verification, session management
2. **alerts**: Alert creation, retrieval, status updates, assignment to guardians
3. **guardians**: Guardian registration, contact management, priority levels
4. **evidence**: Evidence file upload, retrieval, metadata storage
5. **notifications**: Push notification dispatch, delivery status tracking
6. **oracle**: Predictive intelligence queries, risk assessment requests
7. **public**: Public-facing endpoints for transparency portal data
8. **units**: Response unit registration, location updates, dispatch management

#### 3.3.2 Data Models (Pydantic Schemas)

**Core Entities**:
- **User**: user_id, phone, email, role (public/guardian/security), created_at
- **Alert**: alert_id, victim_user_id, location (lat/lon), alert_type, status, triggered_at, resolved_at
- **Guardian**: guardian_id, user_id, priority_level, contact_phone, contact_email
- **ResponseUnit**: unit_id, unit_name, current_location, status, assigned_alert_id
- **Evidence**: evidence_id, alert_id, file_type, file_url, uploaded_at
- **RiskZone**: zone_id, location_polygon, severity_level, incident_count, last_updated
- **CommunityReport**: report_id, location, category, description, submitted_at, anonymized_reporter

#### 3.3.3 Database Schema (PostgreSQL/TimescaleDB)

**Tables**:
- alerts (hypertable with time-series partitioning on triggered_at)
- users
- guardians
- response_units
- evidence_files
- risk_zones
- community_reports
- activity_logs (hypertable with time-series partitioning)

#### 3.3.4 Oracle Predictive Intelligence Engine

**Core Capabilities**:
- **Anomaly Detection**: Identify unusual alert patterns by location, time, or frequency
- **Risk Assessment**: Calculate risk scores for geographic zones based on historical data
- **Device Co-occurrence Clustering**: Detect clusters of devices appearing together across multiple alerts
- **Risk Forecasting**: Predict future risk levels for zones based on trend analysis

**Data Processing**:
- Use in-memory data stores for demo/development environment
- Process alert history, location data, and temporal patterns
- Output risk scores, anomaly flags, and forecast predictions

#### 3.3.5 Real-time Communication

**WebSocket Endpoints**:
- `/ws/alerts`: Real-time alert updates for guardians and security forces
- `/ws/location`: Live victim location streaming during active alerts
- `/ws/audio`: Live audio stream from victim device
- `/ws/chat`: Coordination chat messages between guardians

### 3.4 aegis-mobile (Flutter Mobile App)

#### 3.4.1 Splash Screen

**Purpose**: App initialization and branding display

**Core Features**:
- Display Aegis CSG logo and app name
- Check authentication status and navigate to appropriate screen

#### 3.4.2 Login Screen

**Purpose**: User authentication via phone OTP or email

**Core Features**:
- **Phone OTP Login**: User enters phone number, receives OTP via SMS, enters OTP to authenticate
- **Email Login**: User enters email and password to authenticate
- Navigate to Home Screen upon successful authentication

#### 3.4.3 Home Screen

**Purpose**: Display user status overview and provide quick action access

**Core Features**:
- **Status Overview**: Show current safety status (safe/alert active), guardian count, sentinel mode status
- **Quick Actions**: Buttons for emergency trigger, sentinel mode toggle, guardian setup, settings
- Display recent alerts (if any) with timestamp and status

#### 3.4.4 Emergency Trigger Screen

**Purpose**: Enable rapid emergency alert activation

**Core Features**:
- **3-Second Hold Activation**: User presses and holds emergency button for 3 seconds to trigger alert
- **Audio Recording**: Automatically start recording audio upon alert activation
- **Location Tracking**: Capture and continuously update user's GPS location
- **Alert Confirmation**: Display confirmation message with alert ID and guardian notification status
- **Cancel Option**: Allow user to cancel alert within first 10 seconds if triggered accidentally

#### 3.4.5 Sentinel Mode Screen

**Purpose**: Enable passive background monitoring

**Core Features**:
- **Passive Monitoring Toggle**: Enable/disable background BLE and WiFi scanning
- **Scanning Status**: Display current scanning status and detected device count
- **Battery Impact Warning**: Show estimated battery consumption when sentinel mode is active
- **Background Operation**: Continue scanning when app is in background or screen is locked

#### 3.4.6 Shell Mode Screen

**Purpose**: Provide decoy interface to hide app functionality

**Core Features**:
- **Calculator Interface**: Display functional calculator UI as decoy
- **Hidden Access**: Enter specific code sequence (e.g., \"911=\") to exit shell mode and return to Home Screen
- **Full Functionality**: Emergency trigger remains accessible via hidden gesture (e.g., long-press on calculator display)

#### 3.4.7 Guardian Setup Screen

**Purpose**: Manage emergency contacts and priority levels

**Core Features**:
- **Add Guardian**: Enter guardian name, phone number, email, and assign priority level (1-5, where 1 is highest)
- **Guardian List**: Display all configured guardians with name, contact info, and priority
- **Edit/Delete Guardian**: Modify guardian details or remove from list
- **Priority Explanation**: Show tooltip explaining priority levels (Level 1 guardians notified first)

#### 3.4.8 Settings Screen

**Purpose**: Configure app preferences and account settings

**Core Features**:
- **Account Information**: Display user phone/email, registration date
- **Notification Preferences**: Toggle push notifications, SMS alerts, email alerts
- **Shell Mode Configuration**: Enable/disable shell mode, set access code
- **Logout**: Sign out of current session

---

## 4. Business Rules and Logic

### 4.1 Alert Lifecycle

1. **Triggered**: Alert created when user activates emergency trigger (3-second hold)
2. **Active**: Alert status after guardians are notified and audio/location streaming begins
3. **Acknowledged**: Guardian marks alert as acknowledged
4. **Dispatched**: Response unit assigned to alert location
5. **Resolved**: Alert closed by security forces or guardian after situation is safe
6. **Cancelled**: User cancels alert within 10-second window

### 4.2 Guardian Notification Priority

- Guardians notified in order of priority level (1 = highest priority)
- All guardians with same priority level notified simultaneously
- If no guardian acknowledges within 2 minutes, escalate to security forces automatically

### 4.3 Audio and Location Streaming

- Audio recording starts immediately upon alert trigger
- Location updates sent every 5 seconds during active alert
- Audio and location streams accessible to assigned guardians and security forces only
- Streams terminate when alert status changes to Resolved or Cancelled

### 4.4 Sentinel Mode Device Detection

- App scans for BLE and WiFi devices in background when sentinel mode is enabled
- Detected device MAC addresses stored locally with timestamp and location
- Device co-occurrence data sent to Oracle engine for clustering analysis
- No personal device identification performed (MAC addresses anonymized before transmission)

### 4.5 Shell Mode Access Control

- Shell mode activated via Settings Screen toggle
- Calculator interface displayed as default screen when shell mode is active
- Hidden access code (configurable in Settings) required to exit shell mode
- Emergency trigger remains functional via hidden gesture even in shell mode

### 4.6 Public Data Anonymization

- Public Transparency Portal displays alerts with location rounded to nearest 1km
- Victim names, guardian contacts, and audio streams excluded from public view
- Community reports show anonymized reporter ID (e.g., \"Reporter #1234\")
- Statistics aggregated at city/state level, not individual incident level

### 4.7 Oracle Risk Assessment

- Risk zones calculated based on alert density, severity, and recency
- Severity levels: Low (green), Medium (yellow), High (orange), Critical (red)
- Risk scores updated every 6 hours using historical alert data
- Anomaly detection flags unusual patterns (e.g., sudden alert spike in low-risk zone)

### 4.8 Response Unit Dispatch

- Guardians can request unit dispatch from Guardian Dashboard
- Security forces assign available units to alerts from Command Center
- Unit status: Available, Dispatched, On-Scene, Returning
- Unit location updated every 10 seconds when dispatched

---

## 5. Exceptions and Edge Cases

| Scenario | Handling |
|----------|----------|
| User triggers alert without network connection | Alert queued locally, sent when connection restored, guardians notified with delay warning |
| No guardians configured when alert triggered | Alert escalated directly to security forces |
| Guardian does not acknowledge alert within 2 minutes | Automatic escalation to security forces with notification to all guardians |
| User cancels alert after 10-second window | Cancellation request sent to guardians and security forces, marked as \"User Cancelled\" in logs |
| Audio recording fails due to permission denial | Alert still triggered, guardians notified of audio unavailability |
| Location services disabled on mobile device | Alert triggered with last known location, guardians warned of stale location data |
| Sentinel mode battery drain exceeds 20% per hour | App displays warning and suggests disabling sentinel mode |
| Shell mode access code forgotten | User must uninstall and reinstall app (data loss warning displayed) |
| Multiple alerts triggered by same user within 5 minutes | Second alert treated as update to first alert, not separate incident |
| Response unit marked as dispatched but does not update location | Security forces notified of stale unit location after 2 minutes |
| Oracle engine detects anomaly in alert pattern | Security forces receive anomaly alert with affected zone and recommended action |
| Public portal accessed during high traffic | Rate limiting applied (max 100 requests per minute per IP) |

---

## 6. Acceptance Criteria

1. User registers on mobile app using phone OTP, configures 2 guardians with priority levels 1 and 2
2. User activates emergency trigger via 3-second hold, alert status changes to Active, audio recording and location streaming begin
3. Guardian with priority 1 receives push notification, opens Guardian Dashboard, views victim location on map, and streams live audio
4. Guardian requests response unit dispatch, security forces assign unit from Command Center, unit status updates to Dispatched
5. Security forces view alert on Operations Map, access full alert details including victim identity and evidence files
6. Guardian marks alert as Resolved, alert status updates across all dashboards, audio and location streams terminate
7. Public user accesses Public Transparency Portal, views anonymized active alerts and risk zones on safety map
8. Oracle engine calculates risk scores for all zones, security forces view risk forecast on Analytics Dashboard

---

## 7. Out of Scope for This Release

- AegisNet LoRaWAN mesh network firmware integration
- Pillar Hyperledger Fabric blockchain evidence ledger integration
- Multi-language support (English only for initial release)
- Offline mode for web dashboards
- Video streaming from victim device
- Two-way voice communication between victim and guardians
- Automated response unit routing optimization
- Integration with external emergency services (police, ambulance)
- User-generated risk zone reporting
- Social media sharing of alerts or statistics
- File type/size restrictions for evidence uploads
- Multi-device synchronization for mobile app
- Browser compatibility testing beyond Chrome/Firefox/Safari latest versions
- Performance optimization for >10,000 concurrent users
- Advanced analytics (machine learning model training, predictive policing)
- Custom alert types beyond predefined categories
- Guardian response time SLA enforcement
- Automated alert resolution based on inactivity timeout