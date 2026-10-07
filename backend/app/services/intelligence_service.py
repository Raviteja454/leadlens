from app.models.company import Company


def build_company_intelligence(
    company: Company,
    match_result: dict,
    priority_result: dict,
) -> dict:

    positive_signals = list(priority_result["positive_signals"])
    risks = list(priority_result["risks"])

    what_we_know = []
    what_we_dont_know = []
    verification_items = []

    # Business profile
    what_we_know.append(
        f"Industry: {company.industry}"
    )

    if company.sub_industry:
        what_we_know.append(
            f"Sub-industry: {company.sub_industry}"
        )

    what_we_know.append(
        f"Location: {company.city}, {company.state}"
    )

    what_we_know.append(
        f"Employees: {company.employee_count}"
    )

    # Financial signals
    if company.revenue_estimate:
        revenue_millions = company.revenue_estimate / 1_000_000

        what_we_know.append(
            f"Estimated revenue: ${revenue_millions:.1f}M"
        )
    else:
        what_we_dont_know.append(
            "Revenue estimate"
        )

    if company.revenue_growth is not None:
        what_we_know.append(
            f"Revenue growth: {company.revenue_growth}%"
        )
    else:
        what_we_dont_know.append(
            "Revenue growth"
        )

    if company.profitability is True:
        what_we_know.append(
            "Reported profitable"
        )
    elif company.profitability is False:
        what_we_know.append(
            "Currently reported as not profitable"
        )
    else:
        what_we_dont_know.append(
            "Profitability"
        )

    if company.recurring_revenue is True:
        what_we_know.append(
            "Recurring revenue indicated"
        )
    elif company.recurring_revenue is False:
        what_we_know.append(
            "Recurring revenue not indicated"
        )
    else:
        what_we_dont_know.append(
            "Recurring revenue mix"
        )

    # Ownership
    if company.ownership_type:
        what_we_know.append(
            f"Ownership signal: {company.ownership_type}"
        )
    else:
        what_we_dont_know.append(
            "Ownership structure"
        )

    # Verification logic
    if company.revenue_estimate:
        verification_items.append(
            "Verify revenue and recent financial performance"
        )

    if company.revenue_growth is not None:
        verification_items.append(
            "Validate the reported growth rate and understand its drivers"
        )

    if company.profitability is True:
        verification_items.append(
            "Verify profitability and normalized EBITDA margins"
        )
    else:
        verification_items.append(
            "Investigate profitability and normalized EBITDA"
        )

    if company.recurring_revenue:
        verification_items.append(
            "Confirm recurring revenue percentage and customer retention"
        )
    else:
        verification_items.append(
            "Determine recurring versus project-based revenue mix"
        )

    verification_items.append(
        "Confirm owner willingness and transaction objectives"
    )

    verification_items.append(
        "Assess customer concentration and major account dependencies"
    )

    verification_items.append(
        "Understand management depth and owner dependency"
    )

    verification_items.append(
        "Review competitive position and local market dynamics"
    )

    # Why pursue
    reasons = []

    if match_result["match_score"] >= 80:
        reasons.append(
            "The company closely matches the acquisition thesis"
        )
    elif match_result["match_score"] >= 50:
        reasons.append(
            "The company partially matches the acquisition thesis"
        )

    if company.revenue_growth and company.revenue_growth >= 20:
        reasons.append(
            f"Revenue growth is attractive at {company.revenue_growth}%"
        )

    if company.profitability:
        reasons.append(
            "The business has a positive profitability signal"
        )

    if company.recurring_revenue:
        reasons.append(
            "Recurring revenue can provide greater revenue visibility"
        )

    if company.ownership_type == "Founder-owned":
        reasons.append(
            "Founder ownership may create a potentially relevant succession or exit conversation"
        )

    if not reasons:
        reasons.append(
            "Limited positive signals are currently available"
        )

    # Recommended action
    if priority_result["priority"] == "Contact Now":
        recommended_action = (
            "Prioritize for initial outreach while validating the key financial and ownership assumptions."
        )
    elif priority_result["priority"] == "Research First":
        recommended_action = (
            "Conduct targeted research and resolve the largest information gaps before outreach."
        )
    else:
        recommended_action = (
            "Keep on the monitoring list and revisit if new information improves thesis fit."
        )

    # Confidence
    if company.data_confidence >= 0.85:
        intelligence_confidence = "High"
    elif company.data_confidence >= 0.70:
        intelligence_confidence = "Medium"
    else:
        intelligence_confidence = "Low"

    return {
        "company_id": company.id,
        "company_name": company.name,
        "description": company.description,
        "acquisition_priority": {
            "score": priority_result["priority_score"],
            "classification": priority_result["priority"],
        },
        "why_pursue": reasons,
        "positive_signals": positive_signals,
        "risks": risks,
        "what_we_know": what_we_know,
        "what_we_dont_know": what_we_dont_know,
        "verification_items": verification_items,
        "recommended_action": recommended_action,
        "data_confidence": company.data_confidence,
        "intelligence_confidence": intelligence_confidence,
        "sources": company.sources,
    }
