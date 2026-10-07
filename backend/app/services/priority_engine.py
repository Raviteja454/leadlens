from app.models.company import Company


def calculate_priority(
    company: Company,
    match_result: dict,
) -> dict:

    # 1. Thesis Fit - 40 points
    thesis_fit_score = match_result["match_score"] * 0.40

    # 2. Growth - 20 points
    growth = company.revenue_growth or 0

    if growth >= 40:
        growth_score = 20
    elif growth >= 30:
        growth_score = 18
    elif growth >= 20:
        growth_score = 15
    elif growth >= 10:
        growth_score = 10
    elif growth > 0:
        growth_score = 5
    else:
        growth_score = 0

    # 3. Profitability - 15 points
    profitability_score = (
        15 if company.profitability is True else 0
    )

    # 4. Recurring Revenue - 10 points
    recurring_revenue_score = (
        10 if company.recurring_revenue is True else 0
    )

    # 5. Data Confidence - 5 points
    data_confidence_score = company.data_confidence * 5

    # 6. Ownership Signal - 10 points
    ownership_score = 0

    if company.ownership_type == "Founder-owned":
        ownership_score = 10
    elif company.ownership_type == "Family-owned":
        ownership_score = 8
    elif company.ownership_type:
        ownership_score = 5

    # Total score
    total_score = round(
        thesis_fit_score
        + growth_score
        + profitability_score
        + recurring_revenue_score
        + data_confidence_score
        + ownership_score
    )

    # Priority classification
    if total_score >= 80:
        priority = "Contact Now"
    elif total_score >= 60:
        priority = "Research First"
    else:
        priority = "Monitor"

    # Positive signals and risks
    positive_signals = []
    risks = []

    if match_result["match_score"] >= 80:
        positive_signals.append(
            "Strong alignment with acquisition thesis"
        )
    elif match_result["match_score"] >= 50:
        positive_signals.append(
            "Partial alignment with acquisition thesis"
        )
    else:
        risks.append(
            "Weak alignment with acquisition thesis"
        )

    if growth >= 20:
        positive_signals.append(
            f"Strong revenue growth ({growth}%)"
        )
    elif growth > 0:
        positive_signals.append(
            f"Positive revenue growth ({growth}%)"
        )
    else:
        risks.append(
            "Limited growth signal"
        )

    if company.profitability:
        positive_signals.append(
            "Reported profitable"
        )
    else:
        risks.append(
            "Profitability is not currently confirmed"
        )

    if company.recurring_revenue:
        positive_signals.append(
            "Recurring revenue model"
        )
    else:
        risks.append(
            "Recurring revenue is not indicated"
        )

    if company.data_confidence >= 0.85:
        positive_signals.append(
            "High data confidence"
        )
    elif company.data_confidence < 0.75:
        risks.append(
            "Lower data confidence - verification recommended"
        )

    return {
        "company_id": company.id,
        "company_name": company.name,
        "priority_score": total_score,
        "priority": priority,
        "score_breakdown": {
            "thesis_fit": round(thesis_fit_score),
            "growth": growth_score,
            "profitability": profitability_score,
            "recurring_revenue": recurring_revenue_score,
            "data_confidence": round(data_confidence_score),
            "ownership": ownership_score,
        },
        "positive_signals": positive_signals,
        "risks": risks,
    }
