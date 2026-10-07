from pydantic import BaseModel, Field
from typing import List, Optional


class AcquisitionThesis(BaseModel):
    industry: Optional[str] = None
    sub_industry: Optional[str] = None

    states: List[str] = Field(default_factory=list)

    min_employees: Optional[int] = None
    max_employees: Optional[int] = None

    min_growth: Optional[float] = None

    profitability_required: Optional[bool] = None
    recurring_revenue_required: Optional[bool] = None

    business_model: Optional[str] = None

    raw_text: str
