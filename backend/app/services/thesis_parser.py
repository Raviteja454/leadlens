import re

from app.schemas.thesis import AcquisitionThesis


STATE_NAMES = [
    "Alabama",
    "Arizona",
    "California",
    "Colorado",
    "Florida",
    "Georgia",
    "Illinois",
    "Indiana",
    "North Carolina",
    "Ohio",
    "Tennessee",
    "Texas",
]


def parse_thesis(text: str) -> AcquisitionThesis:
    text_lower = text.lower()

    industry = None
    sub_industry = None

    industry_keywords = {
        "field services": "Field Services",
        "field service": "Field Services",
        "facility services": "Facility Services",
        "industrial services": "Industrial Services",
        "it services": "IT Services",
        "healthcare services": "Healthcare Services",
        "business services": "Business Services",
        "logistics": "Logistics",
        "manufacturing": "Manufacturing",
        "equipment services": "Equipment Services",
    }

    for keyword, value in industry_keywords.items():
        if keyword in text_lower:
            industry = value
            break

    sub_industry_keywords = [
        "hvac",
        "plumbing",
        "landscaping",
        "pest control",
        "commercial cleaning",
        "managed it",
        "medical billing",
        "security",
        "packaging",
        "equipment rental",
    ]

    for keyword in sub_industry_keywords:
        if keyword in text_lower:
            sub_industry = keyword.title()
            break

    states = []

    for state in STATE_NAMES:
        if state.lower() in text_lower:
            states.append(state)

    min_employees = None
    max_employees = None

    employee_range = re.search(
        r"(\d+)\s*(?:-|to)\s*(\d+)\s*employees?",
        text_lower,
    )

    if employee_range:
        min_employees = int(employee_range.group(1))
        max_employees = int(employee_range.group(2))

    growth_match = re.search(
        r"(?:growth|growing|grow(?:th)?)[^0-9]{0,20}(\d+)\s*%",
        text_lower,
    )

    min_growth = None

    if growth_match:
        min_growth = float(growth_match.group(1))
    elif "strong growth" in text_lower:
        min_growth = 20.0
    elif "high growth" in text_lower:
        min_growth = 25.0

    profitability_required = None

    if any(
        phrase in text_lower
        for phrase in [
            "profitable",
            "profitability",
            "profitable business",
            "profitable businesses",
        ]
    ):
        profitability_required = True

    recurring_revenue_required = None

    if any(
        phrase in text_lower
        for phrase in [
            "recurring revenue",
            "recurring revenues",
            "recurring",
            "subscription",
            "subscriptions",
            "service contracts",
        ]
    ):
        recurring_revenue_required = True

    business_model = None

    if "recurring service contracts" in text_lower:
        business_model = "Recurring service contracts"
    elif "subscription" in text_lower:
        business_model = "Subscription"
    elif "service contracts" in text_lower:
        business_model = "Service contracts"

    return AcquisitionThesis(
        industry=industry,
        sub_industry=sub_industry,
        states=states,
        min_employees=min_employees,
        max_employees=max_employees,
        min_growth=min_growth,
        profitability_required=profitability_required,
        recurring_revenue_required=recurring_revenue_required,
        business_model=business_model,
        raw_text=text,
    )
