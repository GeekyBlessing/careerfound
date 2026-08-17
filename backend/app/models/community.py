import uuid

from sqlalchemy import ForeignKey, Integer, String, Text
from sqlalchemy.orm import Mapped, mapped_column

from app.db.base import Base, GUID, TimestampMixin, UUIDMixin


class Community(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "communities"

    path_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("career_paths.id"), unique=True)
    name: Mapped[str] = mapped_column(String(160))
    description: Mapped[str] = mapped_column(Text, default="")


class CommunityPost(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "community_posts"

    community_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("communities.id"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"))
    kind: Mapped[str] = mapped_column(String(20), default="discussion")  # discussion|question|showcase|challenge
    title: Mapped[str] = mapped_column(String(200))
    body: Mapped[str] = mapped_column(Text)
    upvotes: Mapped[int] = mapped_column(Integer, default=0)


class CommunityComment(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "community_comments"

    post_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("community_posts.id"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"))
    body: Mapped[str] = mapped_column(Text)


class LeaderboardEntry(Base, UUIDMixin, TimestampMixin):
    __tablename__ = "leaderboard_entries"

    community_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("communities.id"), index=True)
    user_id: Mapped[uuid.UUID] = mapped_column(GUID(), ForeignKey("users.id"))
    period: Mapped[str] = mapped_column(String(20), default="weekly")
    xp: Mapped[int] = mapped_column(Integer, default=0)
    rank: Mapped[int] = mapped_column(Integer, default=0)
