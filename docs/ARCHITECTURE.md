# SkillForge — Architecture Documentation

## Overview

SkillForge follows a **monorepo** structure with a decoupled frontend and backend communicating via REST APIs. The frontend is a React 19 SPA built with TypeScript and Vite. The backend is a Python Flask 3.0 API with SQLAlchemy ORM.

---

## System Architecture

```
┌─────────────────────────────────────────────────────┐
│                     CLIENT BROWSER                   │
│  React 19 SPA  ←→  Vite Dev Server (port 5173)      │
│  Zustand (auth/theme) + TanStack Query (server data) │
└───────────────────────┬─────────────────────────────┘
                        │  HTTP REST (JSON)
                        │  Vite Proxy: /api → :5000
                        ▼
┌─────────────────────────────────────────────────────┐
│                  FLASK API SERVER (port 5000)         │
│                                                       │
│  ┌─────────────┐  ┌──────────────────┐              │
│  │  JWT Auth    │  │  CORS Middleware │              │
│  │  Middleware  │  │  (all origins)   │              │
│  └──────┬──────┘  └──────────────────┘              │
│         ▼                                            │
│  ┌──────────────────────────────────────────┐       │
│  │          18 Route Blueprints              │       │
│  │  auth · profile · careers · skills       │       │
│  │  roadmap · assessments · resources       │       │
│  │  projects · learning · analytics         │       │
│  │  recommendations · goals · achievements  │       │
│  │  community · mentors · notifications     │       │
│  │  admin · github                          │       │
│  └──────────────┬───────────────────────────┘       │
│                 ▼                                    │
│  ┌──────────────────────────────────────────┐       │
│  │         5 Intelligence Services           │       │
│  │  GapAnalyzer · ReadinessCalculator       │       │
│  │  RecommendationEngine · RoadmapGenerator │       │
│  │  AIService                               │       │
│  └──────────────┬───────────────────────────┘       │
│                 ▼                                    │
│  ┌──────────────────────────────────────────┐       │
│  │      SQLAlchemy 2.0 ORM (25 Models)       │       │
│  └──────────────┬───────────────────────────┘       │
└─────────────────┼───────────────────────────────────┘
                  ▼
┌─────────────────────────────────────────────────────┐
│        DATABASE (SQLite default / PostgreSQL)         │
│        25 tables · auto-created · auto-seeded        │
└─────────────────────────────────────────────────────┘
```

---

## Intelligence Services

### GapAnalyzer (`gap_analyzer.py`)
Quantifies the difference between a user's current skill proficiencies and the target career's required benchmarks.

**Algorithm:**
1. Fetch all skills required for target career via `CareerSkill` join
2. Compare user's `UserSkill.current_level` against `CareerSkill.required_level`
3. Categorize each skill gap:
   - **Critical Gap** — deficit ≥ 3 levels
   - **Moderate Gap** — deficit 1-2 levels
   - **Strong / Mastered** — meets or exceeds target
4. Compute weighted readiness percentage

### ReadinessCalculator (`readiness_calculator.py`)
Synthesizes a composite **Career Readiness Index** from four weighted factors:

| Factor | Weight | Data Source |
|---|---|---|
| Skills Proficiency | 40% | `UserSkill` levels vs career requirements |
| Project Completion | 25% | `Project` status and milestone completion |
| Assessment Performance | 20% | `AssessmentAttempt` scores |
| Learning Consistency | 15% | `LearningSession` streak data |

### RecommendationEngine (`recommendation_engine.py`)
Generates prioritized **Next Best Actions** with explainability:

1. **Skill Assessment** — recommends assessments for untested skills
2. **Learning Resources** — suggests resources for critical gap skills
3. **Project Ideas** — proposes projects that exercise gap skills
4. **Roadmap Progression** — identifies next unlockable roadmap steps

Each recommendation includes a `why_this` explanation string.

### RoadmapGenerator (`roadmap_generator.py`)
Converts career roadmaps into interactive DAG (Directed Acyclic Graph) layouts:

1. Loads `RoadmapStep` records for a career path
2. Resolves prerequisite dependencies
3. Computes node positions for graph rendering
4. Determines step status (Completed, In Progress, Available, Locked) based on user progress

### AIService (`ai_service.py`)
Provides deterministic reasoning-based explanations. Currently operates with template-based generation (no external API dependency). Extensible for LLM integration.

---

## Authentication Flow

```
┌─────────┐        ┌────────────────┐        ┌──────────────┐
│  Client  │───────▶│ POST /api/auth │───────▶│  User Model  │
│          │        │   /login       │        │  Werkzeug    │
│          │        │                │◀───────│  verify hash │
│          │◀───────│  JWT Token     │        └──────────────┘
│          │        └────────────────┘
│          │
│          │  Authorization: Bearer <token>
│          │────────────────────────────────▶ Protected Routes
│          │                                  ├── @jwt_required
│          │                                  └── get_jwt_identity()
└─────────┘
```

- Passwords hashed with **PBKDF2-SHA256** via Werkzeug
- JWT tokens issued by **Flask-JWT-Extended** with configurable expiry (default: 24h)
- Custom error handlers for expired, invalid, and missing tokens

---

## Frontend State Architecture

```
┌──────────────────────────────────────────┐
│              Zustand Store               │
│  ├── authStore.ts                        │
│  │   ├── user (User | null)              │
│  │   ├── token (string | null)           │
│  │   ├── isAuthenticated (boolean)       │
│  │   ├── login(credentials)              │
│  │   ├── logout()                        │
│  │   └── fetchUser()                     │
│  │                                       │
│  └── (Theme state integrated)            │
└──────────────┬───────────────────────────┘
               │ reads/writes
               ▼
┌──────────────────────────────────────────┐
│          TanStack Query (v5)             │
│  ├── 5-minute stale time                 │
│  ├── refetchOnWindowFocus: false         │
│  └── Server-state cache per query key    │
└──────────────────────────────────────────┘
```

---

## Routing Architecture

### Public Routes (no auth required)
| Path | Component | Description |
|---|---|---|
| `/` | `LandingPage` | Marketing homepage |
| `/onboarding` | `OnboardingPage` | Multi-step career selection |

### Authenticated Routes (wrapped in `AppLayout`)
| Path | Component | Description |
|---|---|---|
| `/dashboard` | `DashboardPage` | Main analytics hub |
| `/roadmap` | `RoadmapPage` | Interactive skill graph |
| `/skills` | `SkillsPage` | Skill matrix & gaps |
| `/skills/:id` | `SkillDetailPage` | Individual skill view |
| `/assessments` | `AssessmentsPage` | Quiz engine |
| `/learning` | `LearningPage` | Session logging |
| `/projects` | `ProjectsPage` | Portfolio tracker |
| `/analytics` | `AnalyticsPage` | Career analytics |
| `/goals` | `GoalsPage` | Goal management |
| `/community` | `CommunityPage` | Discussions |
| `/mentors` | `MentorsPage` | Mentor network |
| `/achievements` | `AchievementsPage` | Badges |
| `/admin` | `AdminPage` | Admin panel |
| `/profile` | `ProfilePage` | Settings |
| `*` | `NotFoundPage` | 404 handler |

---

## Database Seed Strategy

On first server start (`python run.py`), the application:

1. Calls `db.create_all()` to create all 25 tables
2. Checks if `User.query.count() == 0`
3. If empty, executes `seed_database()` from `seed_data.py` which creates:
   - 3 demo users (Student, Mentor, Admin) with profiles
   - 10+ career paths with descriptions
   - 50+ skills across 6 categories
   - Career-skill mappings with required levels
   - Roadmaps with step dependencies
   - Learning resources linked to skills
   - Assessment questions
   - Sample projects with milestones
   - Badges and achievements
   - Community posts
   - Mentor profiles
   - Notifications

The seed script is ~60,000 characters and produces a fully functional demo environment.

---

## Security Considerations

| Layer | Implementation |
|---|---|
| **Password Storage** | PBKDF2-SHA256 via Werkzeug (never plaintext) |
| **Authentication** | JWT Bearer tokens with configurable expiry |
| **Authorization** | Role-based checks (student/mentor/admin) in route handlers |
| **CORS** | Configurable origins (default: all for development) |
| **Input Validation** | Request body validation in each route handler |
| **Error Handling** | Global 404/500 handlers with DB rollback on server errors |
| **Secrets** | Environment variable-based configuration (`.env` not committed) |
