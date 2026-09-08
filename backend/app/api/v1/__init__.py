from fastapi import APIRouter

from app.api.v1 import (
    admin,
    assessment,
    auth,
    careers,
    community,
    config,
    dashboard,
    marketplace,
    mentor,
    portfolio,
    roadmap,
    service_requests,
    simulations,
    users,
)

api_router = APIRouter()
api_router.include_router(auth.router)
api_router.include_router(users.router)
api_router.include_router(config.router)
api_router.include_router(careers.router)
api_router.include_router(assessment.router)
api_router.include_router(roadmap.router)
api_router.include_router(dashboard.router)
api_router.include_router(mentor.router)
api_router.include_router(portfolio.router)
api_router.include_router(marketplace.router)
api_router.include_router(community.router)
api_router.include_router(simulations.router)
api_router.include_router(service_requests.router)
api_router.include_router(admin.router)
