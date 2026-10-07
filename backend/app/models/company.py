from pydantic import BaseModel, Field
from typing import List, Optional


class Company(BaseModel):
    id: str
    name: str

    # Business profile
    industry: str
    sub_industry: Optional[str] = None
    description: str
    business_model: Optional[str] = None

    # Geography
    city: str
    state: str

    # Company size
    employee_count: int = Field(ge=1)

    # Financial signals
    revenue_estimate: Optional[float] = None
    revenue_growth: Optional[float] = None
    profitability: Optional[bool] = None
    recurring_revenue: Optional[bool] = None

    # Acquisition signals
    ownership_type: Optional[str] = None
    data_confidence: float = Field(default=0.8, ge=0, le=1)

    # Data provenance
    sources: List[str] = Field(default_factory=list)
