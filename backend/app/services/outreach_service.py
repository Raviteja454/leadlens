from app.models.company import Company


def prepare_outreach(
    company: Company,
    intelligence: dict,
    brief: dict,
) -> dict:

    reasons = intelligence.get("why_pursue", [])
    verification_items = intelligence.get("verification_items", [])

    if company.revenue_growth is not None:
        growth_context = (
            f"reported {company.revenue_growth}% revenue growth"
        )
    else:
        growth_context = "positive business growth signals"

    if company.recurring_revenue:
        model_context = "a recurring revenue model"
    else:
        model_context = "the company's service model"

    conversation_angle = (
        f"Explore the company's growth trajectory, {model_context}, "
        "and the owner's plans for the business."
    )

    facts_to_reference = [
        f"{company.city}, {company.state} based",
        f"{company.employee_count} employees",
        f"Reported revenue growth of {company.revenue_growth}%"
        if company.revenue_growth is not None
        else "Positive growth signal",
        "Recurring revenue model"
        if company.recurring_revenue
        else "Service-based business model",
    ]

    what_to_verify = verification_items[:5]

    outreach_message = (
        f"Hi, I came across {company.name} and was impressed by the "
        f"company's {growth_context} and position in the "
        f"{company.sub_industry.lower() if company.sub_industry else company.industry.lower()} "
        f"market. I'm exploring businesses in this space and would be "
        "interested in learning more about the company and your plans "
        "for the business. Would you be open to a brief conversation?"
    )

    return {
        "company_id": company.id,
        "company_name": company.name,
        "readiness": "Ready for initial outreach",
        "readiness_reason": (
            "The company has strong thesis alignment and sufficient "
            "initial signals to justify a first conversation."
        ),
        "why_contact": reasons[:4],
        "facts_to_reference": facts_to_reference,
        "what_to_verify": what_to_verify,
        "conversation_angle": conversation_angle,
        "suggested_message": outreach_message,
        "next_action": (
            "Use the message as a starting point, personalize it for "
            "the appropriate contact, and validate key business "
            "assumptions during the first conversation."
        ),
        "disclaimer": (
            "Outreach preparation only. LeadLens has not contacted the "
            "company and does not have verified owner contact information."
        ),
    }
