# Fleet360 — AI-Powered Fleet Profitability & Management Intelligence

> **Backend-only FastAPI POC** that transforms accounting and operational data into vehicle P&L, route profitability, customer contract analytics, driver scorecards, and AI-generated management insights.

---

## Business Problem

Transportation companies using QuickBooks have excellent financial records but lack visibility into:

- **Which vehicles are actually profitable?**
- **Which routes generate the best returns?**
- **Which customers are low-margin risks?**
- **Which drivers are underperforming?**
- **Where are the cost anomalies hiding?**

Fleet360 solves this by bridging accounting data and operational data into a unified analytics layer.

---

## Solution Architecture

```
QuickBooks (or Seed Data)
        │
        ▼
Financial Transactions + Operational Data
        │
        ▼
Cost Allocation Engine
        │
   ┌────┴────┐
   ▼         ▼
Vehicle P&L  Route P&L  Customer P&L  Driver Scorecard
        │
        ▼
AI Insight Engine (Rule-Based → LLM-Ready)
        │
        ▼
REST API (FastAPI + Swagger)
```

---

## Technology Stack

| Layer | Technology |
|---|---|
| Framework | FastAPI 0.111+ |
| Database | SQLite (POC) / PostgreSQL (production) |
| ORM | SQLAlchemy 2.0 |
| Validation | Pydantic v2 |
| Authentication | JWT (python-jose + bcrypt) |
| Analytics | Python stdlib + Pandas |
| External API | HTTPX |
| Testing | Pytest |
| Runtime | Uvicorn |

---

## Project Structure

```
fleet360/
├── app/
│   ├── main.py                         # FastAPI app, routers, middleware
│   ├── core/
│   │   ├── config.py                   # Settings via pydantic-settings
│   │   ├── database.py                 # SQLAlchemy engine + session
│   │   └── security.py                 # JWT + bcrypt + role dependency
│   ├── models/                         # SQLAlchemy ORM models
│   │   ├── user.py
│   │   ├── vehicle.py
│   │   ├── route.py
│   │   ├── customer.py
│   │   ├── driver.py
│   │   ├── trip.py
│   │   ├── transaction.py
│   │   ├── fuel.py
│   │   ├── maintenance.py
│   │   └── quickbooks.py               # OAuth token + sync log
│   ├── schemas/                        # Pydantic response models
│   │   ├── vehicle.py
│   │   ├── route.py
│   │   ├── customer.py
│   │   ├── driver.py
│   │   ├── analytics.py                # KPIs, rankings, profitability
│   │   ├── insight.py                  # AI insight schema
│   │   └── quickbooks.py               # QB + auth schemas
│   ├── api/routes/                     # FastAPI routers
│   │   ├── auth.py
│   │   ├── dashboard.py
│   │   ├── vehicles.py
│   │   ├── routes.py
│   │   ├── customers.py
│   │   ├── drivers.py
│   │   ├── insights.py
│   │   └── quickbooks.py
│   ├── services/                       # Business logic
│   │   ├── analytics_service.py        # Executive dashboard
│   │   ├── vehicle_service.py          # Vehicle P&L
│   │   ├── route_service.py            # Route P&L
│   │   ├── customer_service.py         # Customer profitability
│   │   ├── driver_service.py           # Driver scorecard
│   │   ├── cost_allocation_service.py  # Shared cost allocation engine
│   │   ├── ai_insight_service.py       # Rule-based + LLM provider
│   │   └── quickbooks_service.py       # OAuth 2.0 + QB API
│   └── utils/
│       ├── calculations.py             # safe_divide, normalize, utilization
│       └── data_loader.py              # CSV → DB loader
├── data/                               # Master + generated CSV data
├── tests/                              # Pytest test suite
├── seed.py                             # Database seeder
├── .env.example
├── requirements.txt
└── README.md
```

---

## Installation

### 1. Clone / Navigate

```bash
cd fleet360
```

### 2. Create Virtual Environment

```bash
python -m venv venv
# Windows
venv\Scripts\activate
# Linux / macOS
source venv/bin/activate
```

### 3. Install Dependencies

```bash
pip install -r requirements.txt
```

### 4. Configure Environment

```bash
cp .env.example .env
# Edit .env — minimum required: SECRET_KEY
```

---

## Environment Variables

| Variable | Required | Description |
|---|---|---|
| `DATABASE_URL` | No | SQLite default. Change to PostgreSQL for production |
| `SECRET_KEY` | **Yes** | Strong random string for JWT signing |
| `ACCESS_TOKEN_EXPIRE_MINUTES` | No | Default: 1440 (24 hours) |
| `QUICKBOOKS_CLIENT_ID` | No | Leave blank — QB features disabled gracefully |
| `QUICKBOOKS_CLIENT_SECRET` | No | Leave blank — QB features disabled gracefully |
| `QUICKBOOKS_REDIRECT_URI` | No | OAuth callback URL |
| `QUICKBOOKS_ENVIRONMENT` | No | `sandbox` or `production` |
| `LLM_PROVIDER` | No | `rule_based` (default), `openai`, or `gemini` |
| `LLM_API_KEY` | No | Required only if LLM_PROVIDER ≠ rule_based |

---

## Database Seeding

```bash
python seed.py
```

**Output:**
```
============================================================
  Fleet360 — Database Seeder
============================================================

[1/7] Initialising database tables...
[2/7] Clearing existing data...
[3/7] Loading master data from CSVs...
[4/7] Generating trips...
[5/7] Generating fuel records...
[6/7] Generating maintenance records...
[6b/7] Generating financial transactions...
[7/7] Creating demo users...

============================================================
  Fleet360 Demo Data Summary
------------------------------------------------------------
  Vehicles:       10
  Routes:          8
  Customers:       8
  Drivers:        15
  Trips:         515
  Transactions:  700+
  Fuel Records:  250+
  Maintenance:    80+
============================================================
  ✅ Database seeded successfully!
```

**Demo credentials (after seeding):**

| Role | Email | Password |
|---|---|---|
| Admin | admin@fleet360.in | Fleet360Admin! |
| Manager | manager@fleet360.in | Fleet360Manager! |
| Analyst | analyst@fleet360.in | Fleet360Analyst! |

---

## Running the Server

```bash
uvicorn app.main:app --reload
```

- **API Base:** `http://localhost:8000`
- **Swagger UI:** `http://localhost:8000/docs`
- **ReDoc:** `http://localhost:8000/redoc`
- **Health:** `http://localhost:8000/health`

---

## API Documentation

### Authentication

All analytics endpoints require a Bearer JWT token. Obtain one via:

```
POST /api/v1/auth/login
{
  "email": "admin@fleet360.in",
  "password": "Fleet360Admin!"
}
```

Use the returned `access_token` as `Authorization: Bearer <token>`.

---

### API Groups

| Tag | Prefix | Description |
|---|---|---|
| Authentication | `/api/v1/auth` | Register, login, profile |
| Dashboard | `/api/v1/dashboard` | Executive KPIs + trend |
| Vehicles | `/api/v1/vehicles` | Fleet vehicle management + P&L |
| Routes | `/api/v1/routes` | Route master + profitability |
| Customers | `/api/v1/customers` | Customer contracts + P&L |
| Drivers | `/api/v1/drivers` | Driver records + scorecard |
| AI Insights | `/api/v1/insights` | AI-generated anomalies + recommendations |
| QuickBooks | `/api/v1/quickbooks` | QB OAuth + sync integration |

---

### Key Endpoints

```
GET  /api/v1/dashboard/summary              → Executive fleet KPIs
GET  /api/v1/dashboard/trend                → Monthly trend (12 months)

GET  /api/v1/vehicles                       → List all vehicles
GET  /api/v1/vehicles/{id}/profitability    → Vehicle P&L
GET  /api/v1/vehicles/profitability/ranking → Ranked vehicle list

GET  /api/v1/routes                         → List all routes
GET  /api/v1/routes/{id}/profitability      → Route P&L
GET  /api/v1/routes/profitability/ranking   → Ranked route list

GET  /api/v1/customers                      → List all customers
GET  /api/v1/customers/{id}/profitability   → Customer P&L
GET  /api/v1/customers/profitability/ranking→ Ranked customer list

GET  /api/v1/drivers                        → List all drivers
GET  /api/v1/drivers/{id}/performance       → Driver performance
GET  /api/v1/drivers/scorecard              → Full driver scorecard

GET  /api/v1/insights                       → All AI insights
GET  /api/v1/insights/vehicles              → Vehicle insights only
GET  /api/v1/insights/routes                → Route insights only
GET  /api/v1/insights/customers             → Customer insights only
GET  /api/v1/insights/drivers               → Driver insights only

GET  /api/v1/quickbooks/status              → QB connection status
GET  /api/v1/quickbooks/connect             → Start OAuth flow
GET  /api/v1/quickbooks/callback            → OAuth callback
POST /api/v1/quickbooks/sync                → Trigger data sync
```

### Date Filtering

All analytics endpoints support:

```
?start_date=2026-08-01&end_date=2026-08-20
```

---

## Analytics Formulas

### Vehicle Profitability

```
Revenue                = Σ trip revenues
Fuel Cost              = Σ fuel record amounts
Maintenance Cost       = Σ maintenance record amounts
Driver Cost            = Σ (driver_salary × vehicle_hours / total_driver_hours)
Other Cost             = insurance + toll + other_operating_cost
Operating Cost         = Fuel + Maintenance + Driver + Other
Contribution           = Revenue - Operating Cost
Contribution Margin %  = (Contribution / Revenue) × 100
Revenue/km             = Revenue / Total Distance km
Cost/km                = Operating Cost / Total Distance km
Fuel Efficiency        = Total Distance / Total Liters (km/l)
Utilization %          = Actual Service Hours / (Period Days × 16h) × 100
```

### Driver Productivity Score (0–100)

```
Productivity Score     = (Actual Trips / Expected Trips) × 100
Utilization Score      = (Service Hours / Available Hours) × 100
Attendance Score       = (Actual Service Days / Working Days) × 100
Cost Efficiency Score  = (Revenue Generated / Driver Cost × 4) × 100

Overall Score = Productivity × 0.30
              + Utilization × 0.25
              + Attendance × 0.20
              + Cost Efficiency × 0.25
```

### Cost Allocation Methodology

```
Shared Cost (Fuel, Maintenance, Salary, Insurance, Toll)
    │
    ▼ allocated proportionally by service_hours
Vehicle Level
    │
    ▼ allocated by trip count ratio (per route)
Route Level
    │
    ▼ allocated by service_hours ratio (per customer)
Customer Level
```

---

## AI Insight Architecture

```
AIInsightProvider (Abstract Base Class)
    │
    ├── RuleBasedInsightProvider  ← Active in POC
    │       Rules:
    │       V1: Cost/km > fleet average × 1.20 → COST_ANOMALY
    │       V2: Utilization < 70% while fleet avg > 80% → UNDER_UTILIZATION
    │       V3: Margin < 15% → LOW_MARGIN
    │       R1: Route margin < 20% → LOW_MARGIN
    │       C1: Customer margin < 15% → LOW_MARGIN
    │       C2: High revenue + margin < 20% → RISK
    │       D1: Driver score < 50 → UNDER_UTILIZATION
    │       V4/D2: Top performers → HIGH_PERFORMER
    │
    └── LLMInsightProvider        ← Stub (enable via LLM_PROVIDER + LLM_API_KEY)
            Falls back to rule-based in POC
```

Switch providers without changing the API layer:

```env
LLM_PROVIDER=openai
LLM_API_KEY=sk-...
```

---

## QuickBooks Integration Architecture

### OAuth 2.0 Flow

```
User                Fleet360 Backend           QuickBooks
 │                       │                         │
 │  GET /qb/connect       │                         │
 │──────────────────────►│                         │
 │  authorization_url     │                         │
 │◄──────────────────────│                         │
 │                        │                         │
 │  Redirect to QB URL    │                         │
 │──────────────────────────────────────────────────►│
 │  QB Login + Grant      │                         │
 │◄──────────────────────────────────────────────────│
 │  Redirect /qb/callback?code=...&realm_id=...      │
 │──────────────────────►│                         │
 │                        │  POST token exchange     │
 │                        │──────────────────────────►│
 │                        │  access_token + refresh  │
 │                        │◄──────────────────────────│
 │                        │  Store in DB             │
 │  Connected!            │                         │
 │◄──────────────────────│                         │
```

### QB Data Mapping

| QuickBooks Entity | Fleet360 Entity |
|---|---|
| Customer | Customer |
| Invoice | FinancialTransaction (type=revenue) |
| Purchase | FinancialTransaction (type=fuel/maintenance/etc.) |
| Employee | Driver (partial) |
| Account | Chart of Accounts reference |

---

## Running Tests

```bash
pytest tests/ -v
```

```bash
# Run specific test modules
pytest tests/test_vehicles.py -v
pytest tests/test_insights.py -v
pytest tests/test_cost_allocation.py -v
```

---

## Demo Flow (Swagger)

1. **Login:** `POST /api/v1/auth/login` → copy `access_token`
2. Click **Authorize** in Swagger → paste token
3. **Executive Summary:** `GET /api/v1/dashboard/summary`
4. **Vehicle Ranking:** `GET /api/v1/vehicles/profitability/ranking`
5. **Route Ranking:** `GET /api/v1/routes/profitability/ranking`
6. **Customer Ranking:** `GET /api/v1/customers/profitability/ranking`
7. **Driver Scorecards:** `GET /api/v1/drivers/scorecard`
8. **AI Insights:** `GET /api/v1/insights`
9. **QB Status:** `GET /api/v1/quickbooks/status`

---

## Production Roadmap

### Phase 1 — POC (Current)
- Mock/seed data + FastAPI + analytics + rule-based AI insights

### Phase 2 — QuickBooks Live
- OAuth 2.0 token management
- QuickBooks Accounting API sync
- Automatic transaction mapping
- Daily scheduled sync

### Phase 3 — Operational Integrations
- GPS / Telematics (real-time route tracking)
- Fuel management systems
- Maintenance scheduling systems
- HR / Payroll integration
- Customer contract management

### Phase 4 — Automation
- Daily KPI calculation jobs
- Weekly management report generation
- Monthly P&L reports (PDF/Excel export)
- Automated anomaly detection alerts (Email / SMS)

### Phase 5 — Production Hardening
- PostgreSQL (NeonDB recommended)
- Monitoring (Prometheus + Grafana)
- Structured audit logging
- Fine-grained RBAC
- API rate limiting
- Token encryption at rest

---

## Error Response Format

All errors follow a consistent structure:

```json
{
  "success": false,
  "error": {
    "code": "VEHICLE_NOT_FOUND",
    "message": "Vehicle with ID 25 was not found."
  }
}
```

---

## Logging

The application logs structured output to stdout:

```
2026-08-20 12:00:00 | INFO     | fleet360 | → GET /api/v1/dashboard/summary
2026-08-20 12:00:00 | INFO     | fleet360 | ← GET /api/v1/dashboard/summary 200
```

**Never logged:** passwords, JWT tokens, QB client secrets, OAuth access tokens.

---

## License

Fleet360 POC — Internal demonstration use only.
