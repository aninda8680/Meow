# Meow Cross-Device Synced Notes System

A practical implementation guide for adding a notes system to Meow that is:
- cross-device synced
- offline-capable
- connected to productivity activity (VS Code, YouTube, etc.)

This guide is beginner-friendly but technically production-aware.

---

## 1) Goal

Build a Notes System that can:
- store user notes safely
- sync notes across laptop, desktop, and optional mobile app
- work offline and recover automatically when internet returns
- link notes to tracked user activity sessions (productive or distracting)

Example use case:
- User writes a note while coding in VS Code.
- Later, on phone, user opens Meow and sees the same note.
- Note is linked to a specific tracked session for context.

---

## 2) Tech Stack

## Frontend
- React (Web): Primary UI for notes, filters, search, pin/archive actions.
- Optional Mobile App: React Native for Android/iOS parity.

Why this fits Meow:
- Your existing Meow web stack is already modern and component-driven.
- Shared UI and sync logic can be reused across web and mobile.

## Backend
- FastAPI (Python): API layer for notes CRUD, search/filter, and sync coordination.

Why FastAPI:
- Fast development speed.
- Built-in validation with Pydantic.
- Great support for async APIs and WebSockets.

## Database
- MongoDB (NoSQL): Flexible schema for notes, tags, linked metadata, and evolving features.

Why MongoDB:
- Notes are semi-structured and may evolve (rich text, checklist items, metadata fields).
- Tag arrays and nested objects are natural in document databases.
- Easy horizontal scaling for high write volume from sync operations.

## Local Storage (Offline)
- Web: IndexedDB (preferred over localStorage for larger data and indexing).
- Mobile: SQLite (local persistent store for offline-first behavior).

## Sync Mechanism
- Preferred: WebSockets for real-time updates.
- Fallback: API polling every few seconds.

## Authentication
- JWT-based auth.
- Access token (short-lived) + refresh token (long-lived) recommended.

---

## 3) Architecture Overview

The system should be local-first:
- Every write goes to local storage immediately.
- Sync engine pushes to cloud in background.
- Other devices receive updates and patch local stores.

## 3.1 Local-first flow (single device)

```text
[User Types Note]
      |
      v
[Save to Local Store: IndexedDB/SQLite]  <-- immediate UX, works offline
      |
      v
[Mark Note as pending_sync]
      |
      v
[Background Sync Worker]
```

## 3.2 Cloud sync flow

```text
User Action
   |
   v
Local Save -----> Sync Queue -----> FastAPI /notes/sync -----> MongoDB
   ^                                                          |
   |                                                          v
UI Reads Local <----- Merge Ack <----- Sync Result <----- Backend Response
```

## 3.3 Multi-device synchronization

```text
Device A (Web)                               Device B (Mobile)
----------------                               -----------------
Create/Update Note                                 App Open/Online
      |                                                   |
      v                                                   v
Local DB -> Sync API -> MongoDB -> WebSocket Event -> Sync Listener
      |                                                   |
      v                                                   v
Marked Synced                                       Pull/Merge to Local DB
```

## 3.4 End-to-end example

```text
User -> Local Save -> Backend API -> Database -> Sync Broadcast -> Other Devices
```

---

## 4) MongoDB Data Design

Use two core collections:
- notes
- sessions

## 4.1 Notes Collection

Fields required by your spec:
- id
- user_id
- content
- type (text/checklist)
- tags (array)
- linked_session (optional)
- created_at
- updated_at
- is_pinned
- is_archived

Recommended document shape:

```json
{
  "_id": "note_01JXYZ...",
  "id": "note_01JXYZ...",
  "user_id": "user_123",
  "content": "Refactor tracker websocket reconnect logic",
  "type": "text",
  "tags": ["backend", "tracker", "urgent"],
  "linked_session": "session_abc123",
  "created_at": "2026-03-31T10:00:00.000Z",
  "updated_at": "2026-03-31T10:05:00.000Z",
  "is_pinned": true,
  "is_archived": false,
  "version": 4,
  "last_modified_by_device": "device_web_1"
}
```

Checklist type example:

```json
{
  "id": "note_02",
  "user_id": "user_123",
  "content": [
    { "text": "Review report page", "done": true },
    { "text": "Add mobile sync metrics", "done": false }
  ],
  "type": "checklist",
  "tags": ["planning"],
  "linked_session": null,
  "created_at": "2026-03-31T10:00:00.000Z",
  "updated_at": "2026-03-31T10:05:00.000Z",
  "is_pinned": false,
  "is_archived": false,
  "version": 2,
  "last_modified_by_device": "device_mobile_2"
}
```

Suggested indexes:
- { user_id: 1, updated_at: -1 }
- { user_id: 1, tags: 1 }
- { user_id: 1, is_archived: 1, is_pinned: -1 }
- text index on content (or Atlas Search for better relevance)

## 4.2 Sessions Collection (activity integration)

Fields required by your spec:
- session_id
- activity_name
- type (productive/distracting)
- linked_notes

Recommended document shape:

```json
{
  "_id": "session_abc123",
  "session_id": "session_abc123",
  "user_id": "user_123",
  "activity_name": "VS Code",
  "type": "productive",
  "started_at": "2026-03-31T09:30:00.000Z",
  "ended_at": "2026-03-31T10:15:00.000Z",
  "linked_notes": ["note_01", "note_02"]
}
```

Integration idea:
- If user creates a note while active session exists, auto-attach linked_session.
- In reports, show notes created during productive vs distracting windows.

## 4.3 Why NoSQL here

MongoDB is a strong fit because:
- Notes evolve quickly (simple text today, rich blocks/checklists tomorrow).
- Flexible schema reduces migration friction.
- Document model naturally stores arrays (tags, checklist items, linked_notes).
- Good read/write performance for sync-heavy workloads.

---

## 5) Backend API Design (FastAPI)

## 5.1 Project structure (suggested)

```text
backend/
  app/
    main.py
    core/
      config.py
      security.py
    db/
      mongo.py
    models/
      note.py
      session.py
    schemas/
      note_schema.py
    routes/
      notes.py
      sync.py
      auth.py
    services/
      note_service.py
      sync_service.py
```

## 5.2 Pydantic schemas (example)

```python
from pydantic import BaseModel, Field
from typing import List, Optional, Literal, Union
from datetime import datetime

NoteType = Literal["text", "checklist"]

class ChecklistItem(BaseModel):
    text: str
    done: bool = False

class NoteCreate(BaseModel):
    content: Union[str, List[ChecklistItem]]
    type: NoteType = "text"
    tags: List[str] = Field(default_factory=list)
    linked_session: Optional[str] = None
    is_pinned: bool = False
    is_archived: bool = False

class NoteUpdate(BaseModel):
    content: Optional[Union[str, List[ChecklistItem]]] = None
    tags: Optional[List[str]] = None
    linked_session: Optional[str] = None
    is_pinned: Optional[bool] = None
    is_archived: Optional[bool] = None

class NoteOut(BaseModel):
    id: str
    user_id: str
    content: Union[str, List[ChecklistItem]]
    type: NoteType
    tags: List[str]
    linked_session: Optional[str]
    created_at: datetime
    updated_at: datetime
    is_pinned: bool
    is_archived: bool
```

## 5.3 Required endpoints

1. POST /notes
- Create a new note.

2. GET /notes
- Fetch all notes for authenticated user.
- Support pagination and sorting.

3. GET /notes/{id}
- Fetch one note by ID.

4. PUT /notes/{id}
- Update note fields.

5. DELETE /notes/{id}
- Soft delete recommended (mark archived/deleted flag), or hard delete for MVP.

## 5.4 Search endpoint

- GET /notes/search?q=refactor
- Search by content text.

Optional advanced:
- Fuzzy and ranked search with Atlas Search.

## 5.5 Tag filtering endpoint

Two options:
- GET /notes?tags=backend,urgent
- GET /notes/filter?tag=backend

Simple implementation pattern:
- Parse tag list.
- Query with { tags: { $in: [...] } } for any-match.
- Use { tags: { $all: [...] } } for all-match.

## 5.6 FastAPI route sample

```python
from fastapi import APIRouter, Depends, Query
from typing import Optional

router = APIRouter(prefix="/notes", tags=["notes"])

@router.post("")
async def create_note(payload: NoteCreate, user=Depends(get_current_user)):
    return await note_service.create(user.id, payload)

@router.get("")
async def list_notes(
    tags: Optional[str] = Query(default=None),
    q: Optional[str] = Query(default=None),
    user=Depends(get_current_user)
):
    return await note_service.list(user.id, tags=tags, q=q)

@router.get("/{note_id}")
async def get_note(note_id: str, user=Depends(get_current_user)):
    return await note_service.get_one(user.id, note_id)

@router.put("/{note_id}")
async def update_note(note_id: str, payload: NoteUpdate, user=Depends(get_current_user)):
    return await note_service.update(user.id, note_id, payload)

@router.delete("/{note_id}")
async def delete_note(note_id: str, user=Depends(get_current_user)):
    return await note_service.delete(user.id, note_id)
```

---

## 6) Sync System

Two valid approaches:

## Option 1: Polling (simple)

How it works:
- Client sends GET /notes?updated_after=timestamp every 5 to 15 seconds.
- Backend returns changed notes.
- Client merges changes into local storage.

Pros:
- Easy to build and debug.
- Works in environments where sockets are blocked.

Cons:
- Extra network calls.
- Slight delay in cross-device updates.

## Option 2: WebSockets (recommended)

How it works:
- Client opens authenticated socket after login.
- On note create/update/delete, backend emits event to all active user devices.
- Each device applies update to local storage in near real-time.

Pros:
- Fast and real-time.
- Better user experience for multi-device usage.

Cons:
- More infrastructure complexity (connection lifecycle, reconnect handling).

## 6.1 Update propagation model

```text
Device A Update -> API writes MongoDB -> Publish event -> User channels -> Device B/C apply
```

## 6.2 Conflict resolution

Start with Last-Write-Wins (LWW):
- Compare updated_at timestamps and optional version number.
- Newer update wins.

Improved strategy (later):
- Field-level merge for checklist items.
- Keep conflict shadow copy for manual resolution in rare collisions.

Recommended practical rule:
- Use version increment per write.
- Reject stale updates where incoming.version < current.version.
- Client refetches and retries merge.

---

## 7) Offline Support

Core offline strategy:
- Save locally first, always.
- Queue outbound sync operations with status pending_sync.
- Retry with exponential backoff when internet returns.

## 7.1 Offline write flow

```text
User edits note -> IndexedDB/SQLite write success -> UI updates instantly
                        |
                        v
                 add to sync queue
                        |
             (no internet: keep queued)
                        |
              internet restored -> flush queue -> mark synced
```

## 7.2 Why caching matters

- Instant app startup from local DB.
- Better resilience in low-connectivity situations.
- Reduced backend dependency for common reads.

## 7.3 Practical sync queue fields

```json
{
  "op_id": "op_123",
  "note_id": "note_01",
  "operation": "update",
  "payload": {"content": "new text"},
  "created_at": "2026-03-31T10:10:00.000Z",
  "retry_count": 0,
  "status": "pending"
}
```

---

## 8) Feature Set

## 8.1 Basic features

- Create note
- Edit note
- Delete note
- Tagging
- Search
- Pin/unpin
- Archive/unarchive

## 8.2 Advanced features (USP)

- Context-aware notes:
  - Note automatically linked to active session (VS Code, YouTube, etc.).

- Auto-tagging:
  - Suggest tags from activity context and note content.
  - Example: activity_name = VS Code, content has "bug" -> suggest tags: coding, debug.

- Smart reminders:
  - Remind user to revisit notes from unfinished productive sessions.

- Activity-linked insights:
  - Show which notes were created during productive vs distracting behavior.
  - Useful for behavior analysis and habit change.

---

## 9) Key Concepts to Highlight

## Hybrid storage (Local + Cloud)
- Local for speed and offline.
- Cloud for continuity and backup.

## Real-time sync
- WebSocket event channel keeps all devices aligned quickly.

## Scalability
- MongoDB handles flexible note schemas and growth.
- FastAPI can scale horizontally behind a load balancer.

## User-centric design
- Fast local UX even without internet.
- Privacy-aware linking between notes and activity.

---

## 10) Step-by-Step Implementation Plan

## Phase 1: Backend foundation

Tasks:
- Setup FastAPI project with JWT auth.
- Configure MongoDB connection.
- Implement notes CRUD endpoints.
- Add sessions collection read endpoints for linking.

Deliverable:
- Working authenticated API with basic note persistence.

## Phase 2: Frontend integration

Tasks:
- Build notes UI (list, editor, details).
- Connect CRUD APIs.
- Add search and tag filter UI.

Deliverable:
- Users can fully manage notes online.

## Phase 3: Local storage and offline mode

Tasks:
- Add IndexedDB layer on web.
- Add SQLite layer for mobile (if mobile app exists).
- Implement local-first read/write and sync queue.

Deliverable:
- Notes work without internet.

## Phase 4: Sync engine

Tasks:
- Start with polling sync.
- Upgrade to WebSocket real-time updates.
- Add versioning and LWW conflict handling.

Deliverable:
- Multi-device notes stay consistent.

## Phase 5: Advanced productivity intelligence

Tasks:
- Link notes with activity sessions.
- Add auto-tag suggestions from behavior.
- Add reminder and insight cards in Meow reports.

Deliverable:
- Notes become an active productivity assistant, not only a text tool.

---

## 11) Security and Reliability Checklist

- JWT auth with refresh tokens.
- User-level access checks on every note query.
- Input validation with Pydantic.
- Rate limiting for write endpoints.
- Audit fields: created_at, updated_at, last_modified_by_device.
- Backups for MongoDB.
- Idempotent sync API for duplicate retries.

---

## 12) Small API Examples

Create note request:

```http
POST /notes
Authorization: Bearer <token>
Content-Type: application/json

{
  "content": "Fix tab tracker duplicate sessions",
  "type": "text",
  "tags": ["tracker", "bug"],
  "linked_session": "session_abc123",
  "is_pinned": true,
  "is_archived": false
}
```

List with filters:

```http
GET /notes?tags=tracker,bug&q=duplicate
Authorization: Bearer <token>
```

WebSocket event payload:

```json
{
  "event": "note.updated",
  "note_id": "note_01",
  "user_id": "user_123",
  "updated_at": "2026-03-31T10:30:00.000Z",
  "version": 5
}
```

---

## 13) Final Notes

Keep implementation simple at first:
- Start with clean CRUD + polling + local queue.
- Then add WebSockets for better UX.
- Then add activity-linked intelligence features.

This staged approach reduces risk, keeps delivery fast, and fits naturally into Meow's existing productivity tracking architecture.

End of document.
