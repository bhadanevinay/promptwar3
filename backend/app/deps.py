"""Dependency wiring (FastAPI dependency-injection providers).

Centralises construction of the repository so routes depend on the abstract
interface, not a concrete backend. The choice of Firestore vs in-memory is driven
by configuration, and the repository is built once and reused (cached).
"""

from __future__ import annotations

from functools import lru_cache

from app.config import Settings, get_settings
from app.repository.base import EntryRepository
from app.repository.firestore_repo import FirestoreEntryRepository
from app.repository.memory_repo import InMemoryEntryRepository


@lru_cache
def get_repository() -> EntryRepository:
    """Return the configured entry repository (Firestore or in-memory), cached."""
    settings: Settings = get_settings()
    if settings.use_firestore:
        return FirestoreEntryRepository(project_id=settings.project_id)
    return InMemoryEntryRepository()
