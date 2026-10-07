from app.models.company import Company


def generate_acquisition_brief(
    company: Company,
    intelligence: dict,
) -> dict:

    summary_parts = []

    summary_parts.append(
        f"{company.name} is a {company.industry.lower()} business"
    )

    if company.sub_industry:
        summary_parts.append(
            f"focused on {company.sub_industry.lower()}"
        )

    summary_parts.append(
        f"based in {company.city}, {company.state}"
    )

    if company.revenue_estimate:
        revenue_millions = company.revenue_estimate / 1_000_000
        summary_parts.append(
            f"with estimated revenue of ${revenue_millions:.1f}M"
        )

    if company.revenue_growth is not None:
        summary_parts.append(
            f"and reported revenue growth of {company.revenue_growth}%"
        )

    executive_summary = ". ".join(summary_parts) + "."

    investment_case = intelligence["why_pursue"][:4]

    key_risks = intelligence["risks"][:4]

    questions_to_validate = intelligence["verification_items"][:5]

    recommended_next_step = intelligence["recommended_action"]

    return {
        "company_id": company.id,
        "company_name": company.name,
        "executive_summary": executive_summary,
        "investment_case": investment_case,
        "key_risks": key_risks,
        "questions_to_validate": questions_to_validate,
        "recommended_next_step": recommended_next_step,
        "confidence": intelligence["intelligence_confidence"],
        "note": "Demo brief generated from available company intelligence. Estimates and unverified signals should be validated before investment decisions.",
    }
