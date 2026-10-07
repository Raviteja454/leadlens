from app.models.company import Company
from app.schemas.thesis import AcquisitionThesis


def match_company(
    company: Company,
    thesis: AcquisitionThesis,
) -> dict:

    checks = []
    matched = 0
    applicable = 0

    # Industry
    if thesis.industry:
        applicable += 1

        if company.industry.lower() == thesis.industry.lower():
            matched += 1
            checks.append({
                "criterion": "Industry",
                "status": "match",
                "detail": f"{company.industry} matches {thesis.industry}",
            })
        else:
            checks.append({
                "criterion": "Industry",
                "status": "miss",
                "detail": f"{company.industry} does not match {thesis.industry}",
            })

    # Sub-industry
    if thesis.sub_industry:
        applicable += 1

        company_sub = (company.sub_industry or "").lower()
        thesis_sub = thesis.sub_industry.lower()

        if company_sub == thesis_sub:
            matched += 1
            checks.append({
                "criterion": "Sub-industry",
                "status": "match",
                "detail": f"{company.sub_industry} matches {thesis.sub_industry}",
            })
        else:
            checks.append({
                "criterion": "Sub-industry",
                "status": "miss",
                "detail": f"{company.sub_industry or 'Unknown'} does not match {thesis.sub_industry}",
            })

    # Geography
    if thesis.states:
        applicable += 1

        if company.state.lower() in [state.lower() for state in thesis.states]:
            matched += 1
            checks.append({
                "criterion": "Geography",
                "status": "match",
                "detail": f"{company.state} is in the target geography",
            })
        else:
            checks.append({
                "criterion": "Geography",
                "status": "miss",
                "detail": f"{company.state} is outside the target geography",
            })

    # Employee range
    if thesis.min_employees is not None or thesis.max_employees is not None:
        applicable += 1

        min_ok = (
            thesis.min_employees is None
            or company.employee_count >= thesis.min_employees
        )

        max_ok = (
            thesis.max_employees is None
            or company.employee_count <= thesis.max_employees
        )

        if min_ok and max_ok:
            matched += 1
            checks.append({
                "criterion": "Employees",
                "status": "match",
                "detail": f"{company.employee_count} employees fits the target range",
            })
        else:
            checks.append({
                "criterion": "Employees",
                "status": "miss",
                "detail": f"{company.employee_count} employees is outside the target range",
            })

    # Growth
    if thesis.min_growth is not None:
        applicable += 1

        company_growth = company.revenue_growth or 0

        if company_growth >= thesis.min_growth:
            matched += 1
            checks.append({
                "criterion": "Growth",
                "status": "match",
                "detail": f"{company_growth}% growth meets the {thesis.min_growth}% target",
            })
        else:
            checks.append({
                "criterion": "Growth",
                "status": "miss",
                "detail": f"{company_growth}% growth is below the {thesis.min_growth}% target",
            })

    # Profitability
    if thesis.profitability_required is True:
        applicable += 1

        if company.profitability is True:
            matched += 1
            checks.append({
                "criterion": "Profitability",
                "status": "match",
                "detail": "Company is reported as profitable",
            })
        else:
            checks.append({
                "criterion": "Profitability",
                "status": "miss",
                "detail": "Company is not currently reported as profitable",
            })

    # Recurring revenue
    if thesis.recurring_revenue_required is True:
        applicable += 1

        if company.recurring_revenue is True:
            matched += 1
            checks.append({
                "criterion": "Recurring Revenue",
                "status": "match",
                "detail": "Recurring revenue is present",
            })
        else:
            checks.append({
                "criterion": "Recurring Revenue",
                "status": "miss",
                "detail": "Recurring revenue is not currently indicated",
            })

    # No criteria means no meaningful match
    if applicable == 0:
        match_score = 0
    else:
        match_score = round((matched / applicable) * 100)

    if match_score >= 80:
        match_level = "Strong Match"
    elif match_score >= 50:
        match_level = "Partial Match"
    else:
        match_level = "No Match"

    return {
        "company_id": company.id,
        "company_name": company.name,
        "match_score": match_score,
        "match_level": match_level,
        "matched_criteria": matched,
        "total_criteria": applicable,
        "checks": checks,
    }


def match_companies(
    companies: list[Company],
    thesis: AcquisitionThesis,
) -> list[dict]:

    results = [
        match_company(company, thesis)
        for company in companies
    ]

    return sorted(
        results,
        key=lambda result: result["match_score"],
        reverse=True,
    )
