# LeadLens — Architecture & Engineering Decisions

**Built for:** Caprae Capital

## 1. Product Direction

The main product decision was to build an **acquisition intelligence layer** rather than another lead-generation or scraping tool.

The intended workflow is:

```text
Acquisition Thesis
        ↓
Company Matching
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

The goal is to help a searcher answer:

> Which discovered companies are actually worth pursuing, why, and what should I verify next?

This keeps LeadLens complementary to an existing sourcing workflow such as SaaSquatch.

---

## 2. Architecture Choice

I chose a lightweight **React + FastAPI** architecture.

### Frontend

* React
* Vite
* JavaScript
* CSS

### Backend

* Python
* FastAPI
* Pydantic
* Uvicorn

The backend separates the main business capabilities into services:

```text
Thesis Parser
Matching Engine
Priority Engine
Intelligence Service
Brief Service
Outreach Service
```

This keeps acquisition logic independent from the UI and makes the individual components easier to test and replace.

---

## 3. Why FastAPI?

FastAPI was selected because:

* Python is well suited to AI/data workflows.
* It provides simple REST API development.
* Pydantic provides structured validation.
* Interactive API documentation is available through Swagger/OpenAPI.
* The architecture can later integrate LLMs, data providers, background jobs, and databases without changing the frontend contract.

An alternative would have been Node.js/Express, but Python provides a stronger foundation for the expected AI/data-processing direction.

---

## 4. Why React + Vite?

React was selected for the frontend because the product has several interactive states:

* Thesis input
* Results
* Company intelligence
* Acquisition brief
* Queue decisions
* Outreach preparation

Vite keeps the prototype setup lightweight and fast.

A larger frontend framework was not necessary for the scope of the prototype.

---

## 5. Explainable Scoring Instead of AI-Only Ranking

One important decision was to keep acquisition scoring deterministic.

The current score uses:

| Signal            | Weight |
| ----------------- | -----: |
| Thesis Fit        |     40 |
| Revenue Growth    |     20 |
| Profitability     |     15 |
| Recurring Revenue |     10 |
| Data Confidence   |      5 |
| Ownership Signal  |     10 |

The resulting score determines:

* Contact Now
* Research First
* Monitor

The reasoning is visible to the user.

I rejected an approach where an LLM would simply return:

```text
Company A → 94
Company B → 82
Company C → 61
```

without explaining how those values were produced.

For an acquisition workflow, explainability is important because a searcher needs to understand and challenge the recommendation.

---

## 6. Where AI Is Used

AI is best suited to interpretation and synthesis rather than every business rule.

The architecture therefore separates:

### Deterministic

* Thesis matching
* Priority scoring
* Classification
* Validation

### AI-oriented

* Natural-language thesis interpretation
* Company synthesis
* Acquisition briefs
* Outreach context

The current prototype keeps the brief generation deterministic to make the demo reproducible.

A production version could introduce an LLM behind the same service interface without requiring major frontend changes.

---

## 7. Data Decision

The prototype uses a synthetic dataset of 20 companies.

This was intentional because the objective was to demonstrate the product workflow rather than claim access to verified real-world company or owner data.

The application therefore does **not** claim to:

* Scrape real businesses
* Verify real owner information
* Enrich real companies
* Contact real owners

A production system could consume approved data sources through dedicated adapters.

---

## 8. Why No Database?

For this prototype, the company dataset is small and static.

Introducing PostgreSQL immediately would add infrastructure without materially improving the demonstration of the core workflow.

The production design would move company and searcher state into PostgreSQL.

Potential production data:

```text
companies
acquisition_theses
searches
priority_decisions
queue_items
intelligence_results
source_records
users
workspaces
```

---

## 9. Why No Redis?

The current prototype does not have expensive repeated operations or a large dataset requiring distributed caching.

For production, Redis would be useful for:

* Cached thesis parsing
* Company intelligence
* AI briefs
* Search results
* Session state
* Rate limiting

This was deliberately left out of the prototype to keep infrastructure proportional to the scope.

---

## 10. Rejected Product Alternatives

### Generic CRM

Rejected because the problem is not primarily contact management.

LeadLens is focused on acquisition decisions before or around initial outreach.

### Scraper

Rejected because duplicating the lead-generation layer would not demonstrate meaningful additional value.

### CSV Exporter

Rejected because exporting discovered companies does not help the searcher decide which opportunities deserve attention.

### AI Chatbot

Rejected because a general chatbot would make the workflow less structured.

Instead, AI is embedded into specific acquisition tasks.

### Fully AI-Generated Ranking

Rejected because opaque rankings are difficult to trust and debug.

---

## 11. Trade-offs

The prototype intentionally prioritizes workflow depth over production infrastructure.

### Benefits

* Fast to build and evaluate
* Easy to run locally
* Explainable business logic
* Clear separation of services
* Easy to extend

### Limitations

* In-memory dataset
* No authentication
* No production database
* No live enrichment
* No external LLM dependency
* No cloud deployment
* Prototype scoring weights are manually defined

These are appropriate trade-offs for a take-home prototype but would need to change for production.

---

## 12. Testing and Validation

The primary workflow was manually tested end-to-end using:

```text
Profitable field-service businesses in Texas with 20–500 employees,
strong growth and recurring revenue.
```

Expected thesis interpretation:

```text
Industry: Field Services
Geography: Texas
Employees: 20–500
Growth: 20%+
Profitability: Required
Recurring Revenue: Required
```

The following were validated:

* Thesis parsing
* Company matching
* Priority scoring
* Strong/partial/no match classification
* Company intelligence
* Acquisition brief
* Outreach preparation
* Searcher queue transitions
* Contact Now
* Research First
* Monitor

The backend was also tested through FastAPI's interactive API documentation.

---

## 13. Breakpoints / Issues Encountered

During development, several environment and implementation issues were encountered.

### Python Virtual Environment Activation

PowerShell execution policy prevented normal activation.

Instead of changing system execution policy, the project uses:

```powershell
.\venv\Scripts\python.exe
```

This keeps the environment isolated without requiring a machine-level policy change.

### npm PowerShell Wrapper

The `npm` PowerShell command was affected by execution-policy behavior.

The project uses:

```powershell
npm.cmd install
npm.cmd run dev
```

### Development Scope

The prototype initially focused on the core scoring and intelligence workflow before adding the queue and outreach preparation layers.

This helped validate the central acquisition workflow before expanding the surrounding functionality.

---

## 14. What I Would Do With Two More Weeks

If the prototype were continued for another two weeks, I would prioritize the following in order.

### 1. Connect Real Data Sources

Build adapters for approved lead/enrichment sources.

Add:

* Source provenance
* Data freshness
* Deduplication
* Entity resolution

### 2. Add PostgreSQL

Persist:

* Companies
* Searcher decisions
* Acquisition theses
* Queue state
* Intelligence history

### 3. Add LLM-Based Thesis Interpretation

Allow more flexible natural-language acquisition criteria without relying on a fixed set of phrases.

The LLM output would still be validated against a structured schema.

### 4. Improve Intelligence

Add deeper diligence signals such as:

* EBITDA / margin information
* Customer concentration
* Owner dependency
* Revenue concentration
* Customer retention
* Revenue mix
* Management depth
* Business cyclicality

### 5. Add Feedback Learning

Capture searcher actions:

```text
Contacted
Passed
Research Further
Acquired
```

Use these outcomes to calibrate the prioritization model.

### 6. Production Infrastructure

Move toward:

```text
React
  ↓
API
  ↓
FastAPI Services
  ↓
PostgreSQL + Redis
  ↓
Approved Data Providers
```

and deploy using appropriate cloud infrastructure.

---

## 15. Final Architecture Principle

The most important architectural principle is keeping **discovery, intelligence, and decision-making separate**.

```text
Discovery
   ↓
"What companies exist?"

Intelligence
   ↓
"What do we know about them?"

Decision
   ↓
"Which ones deserve attention?"

Action
   ↓
"What should the searcher do next?"
```

LeadLens is primarily focused on the last three layers.

That allows it to add value on top of an existing lead-generation workflow rather than attempting to replace it.
