"""
Import every model module so Base.metadata is fully populated for Alembic
autogenerate and for `Base.metadata.create_all()` in tests/dev bootstrap.
"""
from app.models.ai import AIConversation, AIMessage  # noqa: F401
from app.models.assessment import Assessment  # noqa: F401
from app.models.audit import AuditLog  # noqa: F401
from app.models.career import CareerPath, PathFitRule  # noqa: F401
from app.models.community import (  # noqa: F401
    Community,
    CommunityComment,
    CommunityPost,
    LeaderboardEntry,
)
from app.models.marketplace import (  # noqa: F401
    Mentor,
    MentorApplication,
    MentorNote,
    MentorRecommendation,
    MentorReview,
    MentorSession,
)
from app.models.portfolio import PortfolioItem  # noqa: F401
from app.models.progress import (  # noqa: F401
    DailyMission,
    ReadinessScore,
    Simulation,
    Streak,
    UserProgress,
    UserSimulationAttempt,
    UserSkillProgress,
    XPEvent,
)
from app.models.roadmap import (  # noqa: F401
    Exercise,
    Lesson,
    Project,
    Quiz,
    Roadmap,
    RoadmapCustomItem,
    RoadmapPhase,
    SkillEdge,
    SkillNode,
)
from app.models.user import User  # noqa: F401
