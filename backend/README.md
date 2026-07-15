# CareerOS Backend

Spring Boot 3 backend starter for CareerOS.

## Run locally

1. Set database environment variables.
2. Start PostgreSQL on port `5432`.
3. Run the Spring Boot app from this folder.

## Default local database settings

- host: `localhost`
- port: `5432`
- username: `admin`

Use the password you provided in your local environment, not in source control.

## Current API

- `GET /api/health`
- `POST /api/auth/register`
- `POST /api/auth/login`
- `GET /api/dashboard`
- `GET /api/dashboard/activity`
- `GET /api/dashboard/statistics`
- `GET /api/plans`
- `POST /api/plans`
- `PUT /api/plans/{planId}`
- `PATCH /api/plans/{planId}/archive`
- `DELETE /api/plans/{planId}`
- `GET /api/tasks`
- `POST /api/tasks`
- `PUT /api/tasks/{taskId}`
- `DELETE /api/tasks/{taskId}`
- `PATCH /api/tasks/{taskId}/complete`
- `GET /api/checkins`
- `POST /api/checkins`
- `PUT /api/checkins/{checkInId}`
- `GET /api/checkins/today`
- `PUT /api/checkins/today`
- `GET /api/checkins/recent`
- `GET /api/notifications`
- `GET /api/analytics/summary`
- `GET /api/analytics/overview`
- `GET /api/analytics/study`
- `GET /api/analytics/tasks`
- `GET /api/analytics/plans`
- `GET /api/analytics/checkins`
- `GET /api/analytics/productivity`

## Core entities

- `UserAccount`
- `Role`
- `Plan`
- `CareerTask`
- `LearningTopic`
- `DsaProblem`
- `BackendTopic`
- `CoreSubject`
- `InterviewExperience`
- `KnowledgeNote`
