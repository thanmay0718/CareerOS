# CareerOS Architecture

## Product shape

CareerOS is a modular monolith with a React frontend and a Spring Boot backend.
The first release should focus on a strong dashboard, unified data model, and authenticated user workspace.

## Frontend modules

- Authentication
- Dashboard
- Plan Manager
- Learning Roadmap
- DSA Tracker
- Backend Tracker
- Core CS Tracker
- Interview Notebook
- Notes Management
- Analytics

## Backend modules

- Auth service
- User profile service
- Plan service
- Task service
- Learning roadmap service
- DSA service
- Notes service
- Interview service
- Analytics service

## Core data model

- `UserAccount` and `Role` handle identity and authorization.
- `Plan` and `CareerTask` capture the placement and growth workflows.
- `LearningTopic`, `DsaProblem`, `BackendTopic`, and `CoreSubject` store progress data.
- `InterviewExperience` stores interview prep and postmortems.
- `KnowledgeNote` stores the Notion-style knowledge base.

## Core design rules

- Keep modules isolated by feature.
- Share contracts through DTOs, not entity leakage.
- Use API aggregation for dashboard cards and charts.
- Make analytics read models independent from source-of-truth writes.
- Leave room for future services such as Redis, Kafka, AWS, and AI mentor features.

## Initial data flow

1. A user completes a task or updates a learning item.
2. The backend persists the change.
3. Analytics aggregates recompute derived values.
4. The dashboard fetches a unified summary endpoint.
5. Widgets and charts update without duplicate data entry.
