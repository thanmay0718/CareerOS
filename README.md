# CareerOS

CareerOS is a modular, AI-ready career operating system for software engineering students and professionals.

It is designed as a premium dashboard-first platform that combines:

- career planning
- DSA tracking
- backend learning
- core CS revision
- interview preparation
- note taking
- analytics

## Current foundation

This workspace now includes:

- a product and architecture guide
- a Spring Boot backend starter with `/api/health` and `/api/dashboard`
- a backend-driven frontend shell for the dashboard experience

## Repository layout

```text
careeros/
  frontend/
  backend/
  docs/
```

## Suggested next build order

1. Finish authentication and protected routing.
2. Add the dashboard data model and API contracts.
3. Implement plan, roadmap, DSA, and notes modules.
4. Wire analytics so every module updates the dashboard automatically.
5. Add AI mentor and integration-ready service boundaries.
