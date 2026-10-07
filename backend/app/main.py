from fastapi import FastAPI, HTTPException
from fastapi.middleware.cors import CORSMiddleware
from pydantic import BaseModel

from app.data.companies import COMPANIES
from app.services.thesis_parser import parse_thesis
from app.services.matching_engine import match_companies
from app.services.priority_engine import calculate_priority
from app.services.intelligence_service import build_company_intelligence
from app.services.brief_service import generate_acquisition_brief
from app.services.outreach_service import prepare_outreach


app = FastAPI(
    title="LeadLens",
    description="AI Acquisition Intelligence for Caprae Capital",
    version="1.0.0",
)


app.add_middleware(
    CORSMiddleware,
    allow_origins=[
        "http://localhost:5173",
        "http://127.0.0.1:5173",
    ],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


class ThesisRequest(BaseModel):
    thesis: str


def get_company_or_404(company_id: str):
    company = next(
        (
            company
            for company in COMPANIES
            if company.id == company_id
        ),
        None,
    )

    if company is None:
        raise HTTPException(
            status_code=404,
            detail="Company not found",
        )

    return company


def get_company_context(company_id: str, thesis_text: str):
    company = get_company_or_404(company_id)

    thesis = parse_thesis(thesis_text)

    match_result = match_companies(
        [company],
        thesis,
    )[0]

    priority_result = calculate_priority(
        company,
        match_result,
    )

    intelligence = build_company_intelligence(
        company,
        match_result,
        priority_result,
    )

    return company, intelligence


@app.get("/health")
def health_check():
    return {
        "status": "ok",
        "service": "LeadLens",
    }


@app.get("/api/companies")
def get_companies():
    return COMPANIES


@app.post("/api/thesis/parse")
def parse_acquisition_thesis(request: ThesisRequest):
    return parse_thesis(request.thesis)


@app.post("/api/thesis/analyze")
def analyze_acquisition_thesis(request: ThesisRequest):

    thesis = parse_thesis(request.thesis)

    matches = match_companies(
        COMPANIES,
        thesis,
    )

    analyzed_companies = []

    for match_result in matches:

        company = next(
            company
            for company in COMPANIES
            if company.id == match_result["company_id"]
        )

        priority = calculate_priority(
            company,
            match_result,
        )

        analyzed_companies.append({
            **match_result,
            **priority,
        })

    analyzed_companies.sort(
        key=lambda company: company["priority_score"],
        reverse=True,
    )

    return {
        "thesis": thesis,
        "summary": {
            "companies_analyzed": len(COMPANIES),
            "strong_matches": len([
                c for c in analyzed_companies
                if c["match_level"] == "Strong Match"
            ]),
            "partial_matches": len([
                c for c in analyzed_companies
                if c["match_level"] == "Partial Match"
            ]),
            "contact_now": len([
                c for c in analyzed_companies
                if c["priority"] == "Contact Now"
            ]),
            "research_first": len([
                c for c in analyzed_companies
                if c["priority"] == "Research First"
            ]),
            "monitor": len([
                c for c in analyzed_companies
                if c["priority"] == "Monitor"
            ]),
        },
        "results": analyzed_companies,
    }


@app.post("/api/companies/{company_id}/intelligence")
def get_company_intelligence(
    company_id: str,
    request: ThesisRequest,
):

    company, intelligence = get_company_context(
        company_id,
        request.thesis,
    )

    return intelligence


@app.post("/api/companies/{company_id}/brief")
def get_acquisition_brief(
    company_id: str,
    request: ThesisRequest,
):

    company, intelligence = get_company_context(
        company_id,
        request.thesis,
    )

    return generate_acquisition_brief(
        company,
        intelligence,
    )


@app.post("/api/companies/{company_id}/outreach")
def get_outreach_preparation(
    company_id: str,
    request: ThesisRequest,
):

    company, intelligence = get_company_context(
        company_id,
        request.thesis,
    )

    brief = generate_acquisition_brief(
        company,
        intelligence,
    )

    return prepare_outreach(
        company,
        intelligence,
        brief,
    )
