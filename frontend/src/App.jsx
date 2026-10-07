import { useEffect, useState } from "react";
import "./App.css";

const API_BASE = "http://localhost:8000";

function Header({ queueCount, onQueue }) {
  return (
    <header className="header">
      <div className="brand">
        <div className="brand-mark">L</div>
        <div>
          <div className="brand-name">LeadLens</div>
          <div className="brand-subtitle">AI Acquisition Intelligence</div>
        </div>
      </div>

      <div className="header-actions">
        <button className="queue-button" onClick={onQueue}>
          Searcher Queue
          <span className="queue-count">{queueCount}</span>
        </button>
      </div>
    </header>
  );
}

function ThesisPills({ thesis }) {
  if (!thesis) return null;

  const pills = [];

  if (thesis.industry) {
    pills.push(["Industry", thesis.industry]);
  }

  if (thesis.sub_industry) {
    pills.push(["Sub-industry", thesis.sub_industry]);
  }

  if (thesis.states?.length) {
    pills.push(["Geography", thesis.states.join(", ")]);
  }

  if (thesis.min_employees || thesis.max_employees) {
    const range = `${thesis.min_employees || 0}-${thesis.max_employees || "∞"}`;
    pills.push(["Employees", range]);
  }

  if (thesis.min_growth !== null && thesis.min_growth !== undefined) {
    pills.push(["Growth", `${thesis.min_growth}%+`]);
  }

  if (thesis.profitability_required) {
    pills.push(["Profitability", "Required"]);
  }

  if (thesis.recurring_revenue_required) {
    pills.push(["Recurring Revenue", "Required"]);
  }

  return (
    <div className="thesis-summary">
      {pills.map(([label, value]) => (
        <div className="criteria-pill" key={label}>
          <strong>{label}:</strong> {value}
        </div>
      ))}
    </div>
  );
}

function PriorityBadge({ priority }) {
  const className =
    priority === "Contact Now"
      ? "priority-contact"
      : priority === "Research First"
        ? "priority-research"
        : "priority-monitor";

  return (
    <span className={`badge ${className}`}>
      {priority}
    </span>
  );
}

function MatchBadge({ level }) {
  const className =
    level === "Strong Match"
      ? "badge-strong"
      : level === "Partial Match"
        ? "badge-partial"
        : "badge-none";

  return (
    <span className={`badge ${className}`}>
      {level}
    </span>
  );
}


function CompanyCard({
  company,
  queueDecision,
  onDecision,
  onIntelligence,
}) {
  return (
    <div className="company-card">
      <div className="company-card-top">
        <div>
          <h3 className="company-title">{company.company_name}</h3>

          <div className="company-meta">
            {company.industry || "Business"} · {company.match_score}% thesis fit
          </div>

          <MatchBadge level={company.match_level} />
        </div>

        <div>
          <div className="priority-score">
            {company.priority_score}
          </div>
          <div className="priority-caption">Priority</div>
        </div>
      </div>

      <div className="signal-list">
        {company.positive_signals?.map((signal) => (
          <span className="signal" key={signal}>
            {signal}
          </span>
        ))}
      </div>

      {/* Verification intelligence shown directly in search results */}
      {company.verification_items?.length > 0 && (
        <div className="card-verification">
          <div className="card-verification-header">
            <span className="card-verification-title">
              Verify before outreach
            </span>

            <span className="card-verification-count">
              {company.verification_items.length} items
            </span>
          </div>

          <ul className="card-verification-list">
            {company.verification_items.slice(0, 3).map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>

          {company.verification_items.length > 3 && (
            <button
              className="verification-more"
              onClick={() => onIntelligence(company.company_id)}
            >
              +{company.verification_items.length - 3} more to verify
            </button>
          )}
        </div>
      )}

      <div className="company-actions">
        <div className="company-decision-actions">
          <PriorityBadge priority={company.priority} />

          {queueDecision && (
            <span className="badge badge-partial">
              In Queue
            </span>
          )}

          <button
            className={`small-button ${
              queueDecision === "Contact Now" ? "active" : ""
            }`}
            onClick={() => onDecision(company.company_id, "Contact Now")}
          >
            Contact Now
          </button>

          <button
            className={`small-button ${
              queueDecision === "Research First" ? "active" : ""
            }`}
            onClick={() => onDecision(company.company_id, "Research First")}
          >
            Research First
          </button>

          <button
            className={`small-button ${
              queueDecision === "Monitor" ? "active" : ""
            }`}
            onClick={() => onDecision(company.company_id, "Monitor")}
          >
            Monitor
          </button>
        </div>

        <button
          className="intelligence-button"
          onClick={() => onIntelligence(company.company_id)}
        >
          <span>View Company Intelligence</span>
          <span className="intelligence-arrow">→</span>
        </button>
      </div>

    </div>
  );
}



function Workspace({
  thesisText,
  setThesisText,
  onAnalyze,
  loading,
  analysis,
  queue,
  onQueue,
  onDecision,
  onIntelligence,
}) {
  return (
    <div className="page">
      <div className="hero">
        <div className="eyebrow">ACQUISITION WORKSPACE</div>

        <h1>What are you looking to acquire?</h1>

        <p>
          Describe your acquisition thesis in plain English.
          LeadLens turns it into structured criteria and prioritizes
          the companies worth pursuing.
        </p>
      </div>

      <div className="thesis-card">
        <textarea
          className="thesis-input"
          value={thesisText}
          onChange={(event) => setThesisText(event.target.value)}
          placeholder="Example: Profitable field-service businesses in Texas with 20-500 employees, strong growth and recurring revenue."
        />

        <div className="thesis-footer">
          <span className="helper-text">
            Use natural language - LeadLens will interpret the thesis.
          </span>

          <button
            className="primary-button"
            onClick={onAnalyze}
            disabled={!thesisText.trim() || loading}
          >
            {loading ? "Analyzing..." : "Analyze Companies"}
          </button>
        </div>
      </div>

      {analysis && (
        <div className="section">
          <div className="section-header">
            <div>
              <div className="eyebrow">THESIS RESULTS</div>
              <h2>Prioritized acquisition targets</h2>
            </div>

            <button
              className="text-button"
              onClick={onQueue}
            >
              Open Searcher Queue →
            </button>
          </div>

          <ThesisPills thesis={analysis.thesis} />

          <div className="metrics-grid">
            <div className="metric-card">
              <div className="metric-label">Companies Analyzed</div>
              <div className="metric-value">
                {analysis.summary.companies_analyzed}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Strong Matches</div>
              <div className="metric-value">
                {analysis.summary.strong_matches}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Contact Now</div>
              <div className="metric-value">
                {analysis.summary.contact_now}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Research First</div>
              <div className="metric-value">
                {analysis.summary.research_first}
              </div>
            </div>

            <div className="metric-card">
              <div className="metric-label">Monitor</div>
              <div className="metric-value">
                {analysis.summary.monitor}
              </div>
            </div>
          </div>

          <div className="results-list">
            {analysis.results.map((company) => (
              <CompanyCard
                key={company.company_id}
                company={company}
                queueDecision={queue[company.company_id]}
                onDecision={onDecision}
                onIntelligence={onIntelligence}
              />
            ))}
          </div>
        </div>
      )}
    </div>
  );
}

function IntelligenceView({
  company,
  thesisText,
  onBack,
  onBrief,
  onDecision,
  queueDecision,
}) {
  if (!company) return null;

  return (
    <div className="page">
      <button className="back-button" onClick={onBack}>
        ← Back to Workspace
      </button>

      <div className="eyebrow">COMPANY INTELLIGENCE</div>

      <div className="intelligence-header">
        <div className="intelligence-header-top">
          <div>
            <h1 className="intelligence-title">
              {company.company_name}
            </h1>

            <p className="description">
              {company.description}
            </p>
          </div>

          <div className="intelligence-score">
            <div className="intelligence-score-value">
              {company.acquisition_priority.score}
            </div>

            <div className="intelligence-score-label">
              Acquisition Priority
            </div>

            <PriorityBadge
              priority={company.acquisition_priority.classification}
            />
          </div>
        </div>

        <div className="workflow-decision">
          <div className="workflow-label">Searcher decision</div>

          <div className="workflow-current">
            {queueDecision
              ? `Currently queued as ${queueDecision}`
              : "Not currently in the queue"}
          </div>

          <div className="workflow-actions">
            {["Contact Now", "Research First", "Monitor"].map((decision) => (
              <button
                key={decision}
                className={`small-button ${
                  queueDecision === decision ? "active" : ""
                }`}
                onClick={() => onDecision(company.company_id, decision)}
              >
                {decision}
              </button>
            ))}

            {queueDecision && (
              <button
                className="small-button danger"
                onClick={() => onDecision(company.company_id, null)}
              >
                Remove
              </button>
            )}
          </div>
        </div>
      </div>

      <div className="intelligence-grid">
        <div className="intelligence-section">
          <h3>Why pursue?</h3>
          <ul>
            {company.why_pursue.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="intelligence-section">
          <h3>Positive signals</h3>
          <ul>
            {company.positive_signals.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="intelligence-section">
          <h3>Risks</h3>
          {company.risks.length ? (
            <ul>
              {company.risks.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="description">
              No material negative signals are currently identified.
            </p>
          )}
        </div>

        <div className="intelligence-section">
          <h3>What we know</h3>
          <ul>
            {company.what_we_know.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="intelligence-section">
          <h3>What we don't know</h3>
          {company.what_we_dont_know.length ? (
            <ul>
              {company.what_we_dont_know.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          ) : (
            <p className="description">
              Acquisition diligence items still require verification.
            </p>
          )}
        </div>

        <div className="intelligence-section">
          <h3>Verify before outreach</h3>

          <ul>
            {company.verification_items.map((item) => (
              <li key={item}>{item}</li>
            ))}
          </ul>
        </div>

        <div className="intelligence-section full">
          <h3>Recommended next action</h3>

          <div className="recommended-action">
            {company.recommended_action}
          </div>

          <div className="confidence-row">
            Intelligence confidence: <strong>{company.intelligence_confidence}</strong>
            · Data confidence: <strong>{Math.round(company.data_confidence * 100)}%</strong>
          </div>

          <div className="company-actions">
            <button
              className="primary-button"
              onClick={() => onBrief(company.company_id)}
            >
              Prepare Acquisition Brief →
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}

function BriefView({
  brief,
  onBack,
  onOutreach,
}) {
  if (!brief) return null;

  return (
    <div className="page">
      <button className="back-button" onClick={onBack}>
        ← Back to Intelligence
      </button>

      <div className="eyebrow">AI ACQUISITION BRIEF</div>

      <div className="brief-card">
        <div className="brief-header">
          <div>
            <h1 className="brief-title">
              {brief.company_name}
            </h1>

            <p className="description">
              Investment-oriented summary for initial evaluation.
            </p>
          </div>

          <span className="badge badge-strong">
            Confidence: {brief.confidence}
          </span>
        </div>

        <div className="brief-content-grid">
          <div className="brief-section">
            <h3>Executive Summary</h3>
            <p>{brief.executive_summary}</p>
          </div>

          <div className="brief-section">
            <h3>Investment Case</h3>

            <ul>
              {brief.investment_case.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="brief-section">
            <h3>Key Risks</h3>

            {brief.key_risks.length ? (
              <ul>
                {brief.key_risks.map((item) => (
                  <li key={item}>{item}</li>
                ))}
              </ul>
            ) : (
              <p>
                No additional negative signals identified from
                the current dataset.
              </p>
            )}
          </div>

          <div className="brief-section">
            <h3>Questions to Validate</h3>

            <ul>
              {brief.questions_to_validate.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="brief-section brief-next-step">
          <div className="brief-next-step-header">
            <div>
              <h3>Recommended Next Step</h3>
              <p>{brief.recommended_next_step}</p>
            </div>

            <span className="next-step-label">
              NEXT ACTION
            </span>
          </div>
        </div>

        {brief.note && (
          <div className="brief-note">
            {brief.note}
          </div>
        )}

        <div className="brief-action">
          <button
            className="primary-button"
            onClick={() => onOutreach(brief.company_id)}
          >
            Prepare Outreach →
          </button>
        </div>
      </div>
    </div>
  );
}

function OutreachView({
  outreach,
  onBack,
}) {
  const [copied, setCopied] = useState(false);

  if (!outreach) return null;

  const copyMessage = async () => {
    try {
      await navigator.clipboard.writeText(
        outreach.suggested_message
      );

      setCopied(true);

      setTimeout(() => {
        setCopied(false);
      }, 1800);
    } catch {
      setCopied(false);
    }
  };

  return (
    <div className="page">
      <button className="back-button" onClick={onBack}>
        ← Back to Acquisition Brief
      </button>

      <div className="eyebrow">OUTREACH PREPARATION</div>

      <div className="brief-card">
        <div className="brief-header">
          <div>
            <h1 className="brief-title">
              {outreach.company_name}
            </h1>

            <p className="description">
              Prepare the searcher for a relevant first conversation.
            </p>
          </div>

          <span className="badge badge-strong">
            {outreach.readiness}
          </span>
        </div>

        <div className="brief-content-grid outreach-grid">
          <div className="brief-section">
            <h3>Why contact?</h3>

            <ul>
              {outreach.why_contact.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>

            <p className="description">
              {outreach.readiness_reason}
            </p>
          </div>

          <div className="brief-section">
            <h3>Facts to reference</h3>

            <ul>
              {outreach.facts_to_reference.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>

          <div className="brief-section">
            <h3>Conversation angle</h3>

            <p>{outreach.conversation_angle}</p>
          </div>

          <div className="brief-section">
            <h3>What to verify</h3>

            <ul>
              {outreach.what_to_verify.map((item) => (
                <li key={item}>{item}</li>
              ))}
            </ul>
          </div>
        </div>

        <div className="outreach-message">
          <div className="outreach-message-header">
            <div>
              <h3>Suggested first message</h3>
              <p>
                A starting point for the searcher's initial outreach.
              </p>
            </div>

            <button
              className="small-button"
              onClick={copyMessage}
            >
              {copied ? "Copied" : "Copy Message"}
            </button>
          </div>

          <div className="message-box">
            {outreach.suggested_message}
          </div>
        </div>

        <div className="brief-section outreach-next-action">
          <h3>Next action</h3>

          <p>{outreach.next_action}</p>
        </div>

        <div className="brief-note">
          {outreach.disclaimer}
        </div>
      </div>
    </div>
  );
}

function QueueView({
  queue,
  companies,
  onBack,
  onDecision,
  onIntelligence,
}) {
  const [filter, setFilter] = useState("All");

  const queueItems = companies.filter(
    (company) => queue[company.company_id]
  );

  const counts = {
    All: queueItems.length,
    "Contact Now": queueItems.filter(
      (company) => queue[company.company_id] === "Contact Now"
    ).length,
    "Research First": queueItems.filter(
      (company) => queue[company.company_id] === "Research First"
    ).length,
    Monitor: queueItems.filter(
      (company) => queue[company.company_id] === "Monitor"
    ).length,
  };

  const visibleItems =
    filter === "All"
      ? queueItems
      : queueItems.filter(
          (company) => queue[company.company_id] === filter
        );

  return (
    <div className="page-wide">
      <button className="back-button" onClick={onBack}>
        ← Back to Workspace
      </button>

      <div className="queue-page-header">
        <div className="eyebrow">SEARCHER WORKFLOW</div>

        <h1>Searcher's Queue</h1>

        <p>
          Companies you have decided to contact, research, or monitor.
        </p>
      </div>

      <div className="queue-tabs">
        {["All", "Contact Now", "Research First", "Monitor"].map(
          (tab) => (
            <button
              key={tab}
              className={`queue-tab ${
                filter === tab ? "active" : ""
              }`}
              onClick={() => setFilter(tab)}
            >
              {tab}

              <span className="queue-tab-count">
                {counts[tab]}
              </span>
            </button>
          )
        )}
      </div>

      {visibleItems.length === 0 ? (
        <div className="queue-empty">
          <strong>No companies in this queue.</strong>

          <span>
            Add companies from the acquisition workspace to see them here.
          </span>
        </div>
      ) : (
        <div className="queue-list">
          {visibleItems.map((company) => {
            const decision = queue[company.company_id];

            return (
              <div
                className="queue-card"
                key={company.company_id}
              >
                <div className="queue-card-top">
                  <div>
                    <h3 className="queue-company-name">
                      {company.company_name}
                    </h3>

                    <div className="queue-company-meta">
                      Priority score {company.priority_score} · Thesis fit{" "}
                      {company.match_score}%
                    </div>
                  </div>

                  <div className="priority-score">
                    {company.priority_score}
                  </div>
                </div>

                <div className="queue-card-actions">
                  <div className="queue-primary-row">
                    <div className="queue-status">
                      <span className="queue-status-label">
                        {decision}
                      </span>
                    </div>

                    <button
                      className="queue-view-intelligence"
                      onClick={() =>
                        onIntelligence(company.company_id)
                      }
                    >
                      <span>View Intelligence</span>
                      <span className="intelligence-arrow">
                        →
                      </span>
                    </button>
                  </div>

                  <div className="queue-secondary-row">
                  {decision !== "Contact Now" && (
                    <button
                      className="small-button"
                      onClick={() =>
                        onDecision(
                          company.company_id,
                          "Contact Now"
                        )
                      }
                    >
                      Change to Contact Now
                    </button>
                  )}

                  {decision !== "Research First" && (
                    <button
                      className="small-button"
                      onClick={() =>
                        onDecision(
                          company.company_id,
                          "Research First"
                        )
                      }
                    >
                      Change to Research First
                    </button>
                  )}

                  {decision !== "Monitor" && (
                    <button
                      className="small-button"
                      onClick={() =>
                        onDecision(
                          company.company_id,
                          "Monitor"
                        )
                      }
                    >
                      Change to Monitor
                    </button>
                  )}

                  <button
                    className="queue-remove-button"
                    onClick={() =>
                      onDecision(company.company_id, null)
                    }
                  >
                    Remove
                  </button>
                </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

function App() {
  const [view, setView] = useState("workspace");
  const [thesisText, setThesisText] = useState("");
  const [analysis, setAnalysis] = useState(null);
  const [selectedCompany, setSelectedCompany] = useState(null);
  const [brief, setBrief] = useState(null);
  const [outreach, setOutreach] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");
  const [queue, setQueue] = useState(() => {
    try {
      return JSON.parse(
        localStorage.getItem("leadlens_queue") || "{}"
      );
    } catch {
      return {};
    }
  });

  useEffect(() => {
    localStorage.setItem(
      "leadlens_queue",
      JSON.stringify(queue)
    );
  }, [queue]);

  const analyze = async () => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/thesis/analyze`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thesis: thesisText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to analyze thesis");
      }

      const data = await response.json();
      setAnalysis(data);
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const setDecision = (companyId, decision) => {
    setQueue((current) => {
      const next = { ...current };

      if (!decision) {
        delete next[companyId];
      } else {
        next[companyId] = decision;
      }

      return next;
    });
  };

  const getCompany = (companyId) => {
    return analysis?.results?.find(
      (company) => company.company_id === companyId
    );
  };

  const openIntelligence = async (companyId) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/companies/${companyId}/intelligence`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thesis: thesisText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to load company intelligence");
      }

      const data = await response.json();
      setSelectedCompany(data);
      setView("intelligence");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openBrief = async (companyId) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/companies/${companyId}/brief`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thesis: thesisText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to generate acquisition brief");
      }

      const data = await response.json();
      setBrief(data);
      setView("brief");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const openOutreach = async (companyId) => {
    setLoading(true);
    setError("");

    try {
      const response = await fetch(
        `${API_BASE}/api/companies/${companyId}/outreach`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
          },
          body: JSON.stringify({
            thesis: thesisText,
          }),
        }
      );

      if (!response.ok) {
        throw new Error("Failed to prepare outreach");
      }

      const data = await response.json();
      setOutreach(data);
      setView("outreach");
    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  const queueCount = Object.keys(queue).length;

  return (
    <div className="app">
      <Header
        queueCount={queueCount}
        onQueue={() => setView("queue")}
      />

      <main className="main">
        {error && <div className="error">{error}</div>}

        {loading && view !== "workspace" ? (
          <div className="loading">Loading...</div>
        ) : view === "workspace" ? (
          <Workspace
            thesisText={thesisText}
            setThesisText={setThesisText}
            onAnalyze={analyze}
            loading={loading}
            analysis={analysis}
            queue={queue}
            onQueue={() => setView("queue")}
            onDecision={setDecision}
            onIntelligence={openIntelligence}
          />
        ) : view === "intelligence" ? (
          <IntelligenceView
            company={selectedCompany}
            thesisText={thesisText}
            onBack={() => setView("workspace")}
            onBrief={openBrief}
            onDecision={setDecision}
            queueDecision={
              selectedCompany
                ? queue[selectedCompany.company_id]
                : null
            }
          />
        ) : view === "brief" ? (
          <BriefView
            brief={brief}
            onBack={() => setView("intelligence")}
            onOutreach={openOutreach}
          />
        ) : view === "outreach" ? (
          <OutreachView
            outreach={outreach}
            onBack={() => setView("brief")}
          />
        ) : (
          <QueueView
            queue={queue}
            companies={analysis?.results || []}
            onBack={() => setView("workspace")}
            onDecision={setDecision}
            onIntelligence={openIntelligence}
          />
        )}
      </main>
    </div>
  );
}

export default App;
