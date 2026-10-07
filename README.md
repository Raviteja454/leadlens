# LeadLens

**Built for:** Caprae Capital  
**Status:** Prototype / Take-Home Submission

## AI Acquisition Intelligence Workspace

**Status:** Prototype / Caprae Capital Take-Home Submission

LeadLens is an acquisition intelligence layer designed to sit on top of a lead-generation workflow such as SaaSquatch.

Instead of stopping at *"here are companies that match your search,"* LeadLens helps a searcher answer:

> **Which companies are actually worth pursuing, why, and what should I verify next?**

The prototype turns an acquisition thesis into a prioritized pipeline, explains the reasoning behind each target, identifies information that still needs verification, and prepares the next outreach action.

---

# 1. Problem Understanding

SaaSquatch is primarily positioned around sourcing and discovering potential businesses.

The opportunity I focused on is the decision-making layer that comes immediately after discovery.

A searcher may have hundreds or thousands of potentially relevant businesses, but the real bottleneck becomes:

* Which businesses deserve attention first?
* Which companies best fit the acquisition thesis?
* Why is a company attractive?
* What are the risks or unknowns?
* Which assumptions should be verified before spending more time?
* Which companies are ready for an initial conversation?

LeadLens is designed to reduce that decision-making overhead.

### Core idea

```text
Discovered Companies
        ↓
Acquisition Thesis
        ↓
Thesis Matching
        ↓
Acquisition Priority
        ↓
Company Intelligence
        ↓
AI Acquisition Brief
        ↓
Searcher Queue
        ↓
Outreach Preparation
```

---

# 2. Why This Adds Value

The product deliberately does **not** attempt to rebuild SaaSquatch's core sourcing/scraping functionality.

Instead, LeadLens focuses on the intelligence layer:

> **SaaSquatch helps a searcher find companies. LeadLens helps the searcher decide which companies are worth pursuing.**

The intended workflow is:

```text
1,247 discovered
        ↓
183 thesis matches
        ↓
42 high-priority targets
        ↓
11 ready for deeper enrichment/outreach
```

The numbers above illustrate the intended workflow and are not claims about production SaaSquatch data.

---

# 3. Product Workflow

## Step 1 — Acquisition Thesis

The searcher enters a natural-language acquisition thesis.

Example:

> Profitable field-service businesses in Texas with 20–500 employees, strong growth and recurring revenue.

LeadLens interprets the thesis into structured criteria:

* Industry
* Sub-industry
* Geography
* Employee range
* Revenue growth
* Profitability
* Recurring revenue
* Business model

---

## Step 2 — Analyze Companies

The matching engine evaluates available companies against the thesis.

Each criterion is evaluated individually so that the resulting score can be explained rather than acting as a black box.

The result includes:

* Match score
* Match level
* Matched criteria
* Failed or missing criteria
* Criterion-level explanations

Companies are then sorted by acquisition priority.

---

## Step 3 — Acquisition Priority

The priority engine combines thesis fit with additional acquisition signals.

### Current scoring model

| Signal            |  Weight |
| ----------------- | ------: |
| Thesis Fit        |      40 |
| Revenue Growth    |      20 |
| Profitability     |      15 |
| Recurring Revenue |      10 |
| Data Confidence   |       5 |
| Ownership Signal  |      10 |
| **Total**         | **100** |

### Priority classification

|  Score | Decision       |
| -----: | -------------- |
| 80–100 | Contact Now    |
|  60–79 | Research First |
|    <60 | Monitor        |

The score is intentionally explainable. The user can see the underlying signals rather than receiving only a single unexplained number.

---

# 4. Company Intelligence

Each prioritized company has an intelligence view containing:

* Acquisition Priority
* Thesis Fit
* Why Pursue?
* Positive Signals
* Risks
* What We Know
* What We Don't Know
* Verification Items
* Recommended Action
* Data Confidence
* Intelligence Confidence
* Data Sources

The purpose is to turn raw company attributes into an acquisition-oriented decision context.

---

# 5. AI Acquisition Brief

The acquisition brief condenses the intelligence into an investment-oriented summary.

It contains:

### Executive Summary

A concise explanation of the opportunity.

### Investment Case

The strongest positive signals supporting further investigation.

### Key Risks

Known negative signals or concerns.

### Questions to Validate

Important diligence questions that cannot be answered confidently from the initial dataset.

### Recommended Next Step

A concrete action for the searcher.

The current prototype uses deterministic business logic for the brief generation so that the output remains reproducible and easy to evaluate.

An external LLM can be introduced as a production enhancement for richer synthesis while retaining the deterministic scoring layer for explainability and consistency.

---

# 6. Searcher's Queue

The Searcher's Queue provides a lightweight working pipeline:

* Contact Now
* Research First
* Monitor

A searcher can:

* Add a company to a decision category
* Change its decision
* Remove it from the queue
* Open its intelligence view

This is intentionally not positioned as a full CRM.

The purpose is to preserve the searcher's immediate acquisition decisions after analysis.

---

# 7. Outreach Preparation

For companies that are ready for initial contact, LeadLens prepares:

* Why the company is worth contacting
* Facts to reference
* Information to verify
* Conversation angle
* Suggested initial message
* Recommended next action

The system explicitly avoids pretending that outreach has occurred.

The prototype displays a disclaimer that LeadLens has not contacted the company and does not have verified owner contact information.

---

# 8. Architecture

```text
                         React Frontend
                              │
                              │ REST
                              ▼
                         FastAPI API
                              │
             ┌────────────────┼────────────────┐
             │                │                │
             ▼                ▼                ▼
       Thesis Parser    Matching Engine   Priority Engine
             │                │                │
             └────────────────┼────────────────┘
                              ▼
                   Company Intelligence
                              │
                    ┌─────────┴─────────┐
                    ▼                   ▼
              Brief Service      Outreach Service
                    │                   │
                    └─────────┬─────────┘
                              ▼
                       Searcher Queue
```

---

# 9. Backend Architecture

The backend is separated into focused services.

## Thesis Parser

Responsible for converting natural-language acquisition criteria into structured `AcquisitionThesis` data.

## Matching Engine

Responsible for comparing a company against the parsed acquisition thesis.

It evaluates criteria independently and produces:

```text
match_score
match_level
matched_criteria
total_criteria
checks
```

## Priority Engine

Combines thesis fit with additional acquisition signals and produces the 0–100 acquisition priority score.

## Intelligence Service

Transforms matching and priority results into an acquisition-oriented intelligence object.

## Brief Service

Produces the acquisition brief from the company's available information and intelligence.

## Outreach Service

Prepares a grounded initial outreach package without claiming that communication has actually occurred.

---

# 10. Data Model

Each company contains information such as:

```text
Company
├── id
├── name
├── industry
├── sub_industry
├── description
├── business_model
├── city
├── state
├── employee_count
├── revenue_estimate
├── revenue_growth
├── profitability
├── recurring_revenue
├── ownership_type
├── data_confidence
└── sources
```

The acquisition thesis is represented separately:

```text
AcquisitionThesis
├── industry
├── sub_industry
├── states
├── min_employees
├── max_employees
├── min_growth
├── profitability_required
├── recurring_revenue_required
├── business_model
└── raw_text
```

---

# 11. Data Storage Strategy

### Prototype

The current prototype uses an in-memory synthetic dataset stored in:

```text
backend/app/data/companies.py
```

No production database is required to demonstrate the core acquisition-intelligence workflow.

This was an intentional scope decision because the objective of the prototype is to demonstrate the prioritization and intelligence layer rather than spend the limited implementation time on database infrastructure.

### Production Architecture

A production implementation could use:

* PostgreSQL for structured company and thesis data
* Redis for frequently accessed search results and short-lived analysis state
* Object storage such as Amazon S3 for larger source documents and enrichment artifacts
* A search/indexing layer such as OpenSearch or PostgreSQL full-text search for large-scale company discovery

---

# 12. Caching and Performance

### Prototype

The current prototype performs deterministic calculations in memory.

There is no external cache because the dataset is intentionally small and local.

### Production

For a production-scale implementation, I would introduce caching at the following points:

1. Parsed acquisition theses
2. Company enrichment results
3. Expensive intelligence calculations
4. LLM-generated briefs
5. Frequently repeated searches

Redis would be a suitable cache.

Cache keys could include:

```text
thesis:{hash}
company:{id}:intelligence:{thesis_hash}
company:{id}:brief:{intelligence_hash}
```

This would prevent repeated expensive processing when a searcher revisits the same company or thesis.

---

# 13. AI Strategy

AI is used where interpretation provides meaningful value.

### AI-suitable tasks

* Natural-language acquisition thesis interpretation
* Summarization
* Investment-oriented synthesis
* Generating acquisition briefs
* Preparing contextual outreach

### Deterministic tasks

The prototype intentionally keeps these deterministic:

* Thesis matching
* Priority scoring
* Threshold classification
* Data validation
* Queue decisions

This separation provides better reproducibility and explainability.

A production system could combine LLM-based interpretation with deterministic business rules rather than allowing an LLM to make the entire acquisition decision.

---

# 14. Dataset

The prototype contains **20 synthetic companies** covering multiple industries and geographies.

Examples include:

* Field Services
* Facility Services
* Industrial Services
* IT Services
* Healthcare Services
* Business Services
* Logistics
* Manufacturing
* Equipment Services

The dataset contains synthetic values for:

* Employee count
* Revenue
* Revenue growth
* Profitability
* Recurring revenue
* Ownership
* Geography
* Data confidence

### Important

The companies and business attributes in this prototype are **synthetic demonstration data**.

The application does not claim to have scraped or verified real company or owner information.

In production, the same intelligence layer could consume data from permitted sourcing/enrichment systems such as an existing SaaSQuatch workflow or approved data providers.

---

# 15. Technology Stack

## Frontend

* React
* Vite
* JavaScript
* CSS

## Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

## Development Environment

The prototype was developed on:

```text
Operating System: Windows
Python: 3.11
Node.js: 24.19.0
npm: 11.6.0
```

> If the locally installed npm version differs, run `npm.cmd --version` to confirm the exact version on the development machine.

### Python Environment

A dedicated Python virtual environment is used:

```text
backend/venv/
```

The virtual environment is intentionally excluded from Git.

---

# 16. Project Structure

```text
leadlens/
│
├── backend/
│   ├── app/
│   │   ├── data/
│   │   │   └── companies.py
│   │   │
│   │   ├── models/
│   │   │   └── company.py
│   │   │
│   │   ├── schemas/
│   │   │   └── thesis.py
│   │   │
│   │   ├── services/
│   │   │   ├── thesis_parser.py
│   │   │   ├── matching_engine.py
│   │   │   ├── priority_engine.py
│   │   │   ├── intelligence_service.py
│   │   │   ├── brief_service.py
│   │   │   └── outreach_service.py
│   │   │
│   │   └── main.py
│   │
│   ├── requirements.txt
│   └── venv/
│
├── frontend/
│   ├── src/
│   │   ├── App.jsx
│   │   └── App.css
│   ├── package.json
│   └── ...
│
├── .gitignore
└── README.md
```

---

# 17. Local Setup

The application can be run locally from a clean checkout.

## Prerequisites

Install:

* Python 3.11+
* Node.js 24+
* npm
* Git

---

## Backend Setup

From the project root:

```powershell
cd backend
```

Create the virtual environment:

```powershell
python -m venv venv
```

Install backend dependencies:

```powershell
.\venv\Scripts\python.exe -m pip install -r requirements.txt
```

Start the API:

```powershell
.\venv\Scripts\python.exe -m uvicorn app.main:app --reload
```

Backend:

```text
http://127.0.0.1:8000
```

Health check:

```text
http://127.0.0.1:8000/health
```

API documentation:

```text
http://127.0.0.1:8000/docs
```

### PowerShell note

The project uses the virtual environment's Python executable directly rather than activating the environment.

This avoids PowerShell execution-policy issues with the activation script.

---

# 18. Frontend Setup

Open a second terminal:

```powershell
cd frontend
```

Install dependencies:

```powershell
npm.cmd install
```

Start the development server:

```powershell
npm.cmd run dev
```

Frontend:

```text
http://localhost:5173/
```

### PowerShell note

`npm.cmd` is used instead of `npm` because PowerShell execution-policy settings on the development machine can prevent the npm PowerShell wrapper from executing.

---

# 19. API Endpoints

## Health

```http
GET /health
```

## Companies

```http
GET /api/companies
```

## Parse Thesis

```http
POST /api/thesis/parse
```

## Analyze Thesis

```http
POST /api/thesis/analyze
```

## Company Intelligence

```http
POST /api/companies/{company_id}/intelligence
```

## Acquisition Brief

```http
POST /api/companies/{company_id}/brief
```

## Outreach Preparation

```http
POST /api/companies/{company_id}/outreach
```

FastAPI's interactive API documentation is available at:

```text
http://127.0.0.1:8000/docs
```

---

# 20. Example Thesis

Use the following thesis to demonstrate the complete workflow:

```text
Profitable field-service businesses in Texas with 20–500 employees,
strong growth and recurring revenue.
```

The application should identify criteria approximately equivalent to:

```text
Industry: Field Services
Geography: Texas
Employees: 20–500
Growth: Strong / 20%+
Profitability: Required
Recurring Revenue: Required
```

---

# 21. Demo Flow

A recommended 1–2 minute demonstration is:

### 1. Enter Thesis

Enter:

```text
Profitable field-service businesses in Texas with 20–500 employees,
strong growth and recurring revenue.
```

### 2. Analyze

Click:

```text
Analyze Companies
```

Show the prioritized results.

### 3. Open Intelligence

Select a high-priority company.

Show:

* Acquisition Priority
* Thesis Fit
* Positive Signals
* Risks
* Unknowns
* Verification Items

### 4. Generate Brief

Open the:

```text
AI Acquisition Brief
```

Show:

* Executive Summary
* Investment Case
* Risks
* Questions to Validate
* Recommended Next Step

### 5. Prepare Outreach

Open:

```text
Prepare Outreach
```

Show the contextual outreach preparation.

### 6. Searcher's Queue

Move companies into:

```text
Contact Now
Research First
Monitor
```

This demonstrates the complete acquisition workflow.

---

# 22. Validation Performed

The main end-to-end workflow was manually validated using the example acquisition thesis.

Validated flow:

```text
Thesis Input
    ↓
Thesis Parsing
    ↓
Company Matching
    ↓
Priority Scoring
    ↓
Company Intelligence
    ↓
Acquisition Brief
    ↓
Outreach Preparation
    ↓
Searcher Queue
```

The queue decisions were also tested across the three states:

```text
Contact Now
Research First
Monitor
```

The backend and frontend were run locally during development.

---

# 23. Design Decisions

### Decision 1 — Build the intelligence layer instead of another scraper

The reference product already addresses lead discovery.

Building another scraper would duplicate the core value of the existing sourcing workflow.

The prototype therefore focuses on prioritization and decision support.

### Decision 2 — Explainable scoring

Acquisition decisions can be high consequence.

Instead of returning only an opaque AI score, LeadLens exposes the factors contributing to the priority score.

### Decision 3 — Separate AI from deterministic rules

LLMs are useful for interpreting language and synthesizing information.

They are less suitable as the sole source of deterministic business rules.

Therefore:

```text
LLM / AI
    ↓
Interpretation + Synthesis

Deterministic Logic
    ↓
Matching + Scoring + Classification
```

### Decision 4 — Synthetic data

The objective is to demonstrate the workflow without presenting fabricated company information as real-world verified data.

---

# 24. Trade-offs

Given the prototype scope, several production concerns were intentionally not implemented.

### No production database

The synthetic dataset is small enough for in-memory processing.

### No external enrichment provider

The prototype demonstrates where enrichment would fit without depending on third-party API credentials.

### No real owner contact information

This avoids presenting unverified contact data as factual.

### No production deployment

The prototype is currently designed to run locally.

### No real outbound communication

LeadLens prepares outreach but does not automatically contact companies.

These are deliberate scope boundaries rather than hidden limitations.

---

# 25. Production Evolution

If this prototype were taken toward production, the next priorities would be:

### Data Layer

* PostgreSQL
* Company identity resolution
* Deduplication
* Source-level provenance
* Historical company snapshots

### Search

* OpenSearch or PostgreSQL search
* Semantic search
* Advanced filtering
* Large-scale company indexing

### Enrichment

* Approved third-party enrichment providers
* Financial data
* Company websites
* Industry information
* Verified contact data

### AI

* LLM-based thesis interpretation
* Retrieval-augmented company analysis
* Structured extraction
* Confidence-aware synthesis
* Cached AI outputs

### Infrastructure

A possible deployment architecture:

```text
CloudFront / CDN
       ↓
React Frontend
       ↓
API Gateway / Load Balancer
       ↓
FastAPI Services
       ↓
PostgreSQL + Redis
       ↓
Object Storage
```

AWS would be a suitable cloud provider because the architecture maps naturally to:

* S3
* CloudFront
* ECS/Fargate or Lambda
* RDS PostgreSQL
* ElastiCache Redis
* CloudWatch

The production infrastructure was not implemented in this prototype.

---

# 26. Security and Data Considerations

For a production implementation:

* API credentials should be stored in a secrets manager.
* User access should be authenticated and authorized.
* Sensitive company/contact information should have appropriate access controls.
* External data sources should comply with their terms of service.
* Source provenance should be retained for important acquisition claims.
* AI-generated statements should remain distinguishable from verified facts.
* Outreach should require user approval before being sent.

The prototype does not send outbound messages automatically.

---

# 27. Known Limitations

1. The company dataset is synthetic.
2. No live external data sources are connected.
3. No production database is used.
4. No production caching layer is implemented.
5. AI synthesis is currently deterministic/demo-oriented.
6. No real owner/contact verification is performed.
7. No production authentication is implemented.
8. No cloud deployment is included.
9. Priority scoring is a prototype model and would require calibration against real searcher outcomes.

These limitations are intentionally documented rather than hidden.

---

# 28. Future Improvements

With additional development time, I would prioritize:

1. Connect LeadLens to an approved company discovery/enrichment source.
2. Add PostgreSQL persistence.
3. Add Redis caching.
4. Add source-level provenance and freshness tracking.
5. Calibrate priority scoring using actual searcher decisions.
6. Add LLM-powered thesis interpretation and acquisition briefs.
7. Add feedback loops from searcher decisions.
8. Add deduplication and entity resolution.
9. Add authenticated multi-user workspaces.
10. Add approved CRM/outreach integrations.

The most important long-term improvement would be a feedback loop:

```text
Searcher Decision
       ↓
Observed Outcome
       ↓
Scoring Calibration
       ↓
Better Prioritization
```

This would allow the system to improve from actual acquisition workflows rather than relying solely on manually selected weights.

---

# 29. Caprae Challenge Alignment

The prototype was designed around the stated challenge of improving the value generated from a lead-generation workflow.

### Business Use Case

LeadLens focuses on:

* Lead prioritization
* Relevance
* Acquisition signals
* Verification needs
* Searcher workflow

### UX/UI

The interface guides the user through:

```text
Thesis → Analyze → Intelligence → Brief → Queue → Outreach
```

### Technicality

The implementation includes:

* Natural-language thesis parsing
* Structured data models
* Matching logic
* Explainable priority scoring
* Service separation
* REST APIs
* Acquisition intelligence generation

### Design

The interface uses a focused acquisition-analyst workflow rather than attempting to reproduce a generic CRM.

### Additional Value

The prototype adds an intelligence layer beyond basic company discovery:

* Acquisition priority
* Explainable reasoning
* Verification gaps
* Investment brief
* Searcher decision queue
* Outreach preparation

---

# 30. Submission Materials

The intended repository should contain:

```text
leadlens/
├── README.md
├── DECISIONS.md
├── logs/
├── backend/
├── frontend/
└── .gitignore
```

The README provides:

* Product explanation
* Setup instructions
* Architecture
* Technology versions
* API documentation
* Data strategy
* AI strategy
* Limitations
* Production roadmap
* Demo flow

The repository should also include the required development/session logs and the separate design/architecture write-up where applicable.

---

# 31. Version

```text
LeadLens v1.0.0
```

This version represents the initial complete prototype covering the core workflow:

```text
Acquisition Thesis
        ↓
Prioritization
        ↓
Company Intelligence
        ↓
Acquisition Brief
        ↓
Searcher Queue
        ↓
Outreach Preparation
```

---

## License

This project was created as a private take-home prototype for Caprae Capital and is not intended for independent commercial distribution.
