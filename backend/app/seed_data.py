import json
import os
import sys
from datetime import datetime, timezone, timedelta

# Ensure backend directory is in python search path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app.models import (
    db, User, Profile, Career, Skill, CareerSkill, UserSkill,
    Roadmap, RoadmapStep, Resource, ResourceProgress,
    Assessment, Question, AssessmentAttempt,
    Project, ProjectMilestone, LearningSession, Goal,
    Badge, UserBadge, Notification, Post, Comment, Vote,
    MentorProfile, MentorRequest
)

def seed_database():
    print("[SkillForge] Seeding database with realistic startup dataset...")

    # Clear existing data
    db.drop_all()
    db.create_all()

    # 1. CREATE USERS & ROLES
    # Student: ashutosh
    student = User(
        email='student@skillforge.io',
        username='ashutosh',
        role='student'
    )
    student.set_password('password123')
    db.session.add(student)

    # Mentor: sarah.chen
    mentor = User(
        email='mentor@skillforge.io',
        username='sarah.chen',
        role='mentor'
    )
    mentor.set_password('password123')
    db.session.add(mentor)

    # Admin: admin
    admin = User(
        email='admin@skillforge.io',
        username='admin',
        role='admin'
    )
    admin.set_password('password123')
    db.session.add(admin)

    db.session.flush()

    # 2. CREATE CAREERS (10 careers)
    careers_data = [
        {
            'slug': 'full-stack-developer',
            'title': 'Full Stack Developer',
            'description': 'Architect and build complete modern web applications across scalable client interfaces, robust backend APIs, and distributed data layers.',
            'icon': 'Layers',
            'category': 'Software Engineering',
            'average_salary': '$125,000 / yr',
            'estimated_months': 6,
            'demand_level': 'Very High',
            'difficulty': 'Intermediate'
        },
        {
            'slug': 'ai-ml-engineer',
            'title': 'AI / ML Engineer',
            'description': 'Develop, train, optimize, and deploy machine learning models, LLM pipelines, and computer vision systems into high-throughput production.',
            'icon': 'Cpu',
            'category': 'Artificial Intelligence',
            'average_salary': '$145,000 / yr',
            'estimated_months': 8,
            'demand_level': 'Very High',
            'difficulty': 'Advanced'
        },
        {
            'slug': 'backend-developer',
            'title': 'Backend Systems Engineer',
            'description': 'Design high-performance distributed systems, microservices, asynchronous message queues, and resilient database architectures.',
            'icon': 'Server',
            'category': 'Backend Engineering',
            'average_salary': '$130,000 / yr',
            'estimated_months': 6,
            'demand_level': 'High',
            'difficulty': 'Intermediate'
        },
        {
            'slug': 'frontend-developer',
            'title': 'Frontend Engineer',
            'description': 'Create silky smooth, high-fidelity user interfaces, design systems, WebGL experiences, and client-side performance architectures.',
            'icon': 'Layout',
            'category': 'Frontend Engineering',
            'average_salary': '$120,000 / yr',
            'estimated_months': 5,
            'demand_level': 'High',
            'difficulty': 'Intermediate'
        },
        {
            'slug': 'devops-cloud-engineer',
            'title': 'DevOps & Cloud Engineer',
            'description': 'Automate multi-cloud infrastructure, CI/CD pipelines, Kubernetes orchestration, observability telemetry, and zero-downtime deployments.',
            'icon': 'Cloud',
            'category': 'Infrastructure & Cloud',
            'average_salary': '$138,000 / yr',
            'estimated_months': 6,
            'demand_level': 'Very High',
            'difficulty': 'Intermediate'
        },
        {
            'slug': 'data-scientist',
            'title': 'Data Scientist',
            'description': 'Extract actionable commercial insights from massive datasets through statistical modeling, feature engineering, and predictive analytics.',
            'icon': 'BarChart3',
            'category': 'Data Science',
            'average_salary': '$128,000 / yr',
            'estimated_months': 7,
            'demand_level': 'High',
            'difficulty': 'Intermediate'
        },
        {
            'slug': 'data-engineer',
            'title': 'Data Engineer',
            'description': 'Build resilient ETL pipelines, streaming architectures with Kafka, data warehouses with Snowflake/BigQuery, and Lakehouse storage.',
            'icon': 'Database',
            'category': 'Data Engineering',
            'average_salary': '$135,000 / yr',
            'estimated_months': 6,
            'demand_level': 'High',
            'difficulty': 'Intermediate'
        },
        {
            'slug': 'cybersecurity-engineer',
            'title': 'Cybersecurity Engineer',
            'description': 'Protect systems and networks against advanced threats through threat modeling, ethical penetration testing, cryptography, and SIEM monitoring.',
            'icon': 'ShieldCheck',
            'category': 'Security',
            'average_salary': '$132,000 / yr',
            'estimated_months': 7,
            'demand_level': 'High',
            'difficulty': 'Advanced'
        },
        {
            'slug': 'mobile-engineer',
            'title': 'Mobile App Developer',
            'description': 'Ship responsive, native-performance iOS and Android applications using React Native, Flutter, Swift, and offline-first data sync.',
            'icon': 'Smartphone',
            'category': 'Mobile Engineering',
            'average_salary': '$122,000 / yr',
            'estimated_months': 5,
            'demand_level': 'Steady',
            'difficulty': 'Intermediate'
        },
        {
            'slug': 'solutions-architect',
            'title': 'Cloud Solutions Architect',
            'description': 'Guide enterprise cloud migrations, multi-region fault tolerance, security postures, cost optimization, and systems blueprints.',
            'icon': 'GitMerge',
            'category': 'Architecture',
            'average_salary': '$155,000 / yr',
            'estimated_months': 10,
            'demand_level': 'Very High',
            'difficulty': 'Advanced'
        }
    ]

    career_objs = {}
    for c_data in careers_data:
        c = Career(**c_data)
        db.session.add(c)
        career_objs[c.slug] = c

    db.session.flush()

    # 3. CREATE SKILLS (50+ skills across 8 categories)
    skills_data = [
        # Frontend
        ('html-css', 'HTML5 & Modern CSS', 'Frontend', 'Layout', 'Semantic markup, modern CSS Grid/Flexbox, responsive design, and CSS custom properties.', ['semantic-html', 'css-grid', 'flexbox', 'animations']),
        ('javascript', 'JavaScript (ES6+)', 'Frontend', 'Code', 'Modern ECMAScript standards, asynchronous promises, event loop, closures, and DOM manipulation.', ['async-await', 'closures', 'event-loop', 'es6']),
        ('typescript', 'TypeScript', 'Frontend', 'FileCode', 'Strict static typing, interfaces, generics, utility types, and AST compilation.', ['types', 'generics', 'interfaces', 'type-inference']),
        ('react', 'React & Next.js', 'Frontend', 'Atom', 'Component lifecycles, custom hooks, React Server Components, state management, and SSR.', ['hooks', 'nextjs', 'rsc', 'virtual-dom']),
        ('tailwind', 'Tailwind CSS', 'Frontend', 'Paintbrush', 'Utility-first styling, design token systems, responsive variants, and dark mode theming.', ['utility-css', 'responsive', 'dark-mode', 'tokens']),
        ('state-management', 'State Management (Zustand/Redux)', 'Frontend', 'Share2', 'Global predictable state containers, selectors, middleware, and immutable update patterns.', ['zustand', 'redux', 'immutability', 'actions']),
        ('web-performance', 'Web Performance & Core Web Vitals', 'Frontend', 'Activity', 'LCP, FID/INP, CLS optimization, code splitting, lazy loading, and asset minification.', ['core-web-vitals', 'code-splitting', 'profiling', 'tree-shaking']),
        
        # Backend
        ('nodejs', 'Node.js & Express', 'Backend', 'Server', 'Non-blocking I/O runtime, REST routing, middleware chaining, and streaming buffers.', ['event-driven', 'express', 'streams', 'middleware']),
        ('python', 'Python', 'Programming', 'Terminal', 'Pythonic idiomatic programming, generators, decorators, object-oriented principles, and type hints.', ['pythonic', 'decorators', 'generators', 'oop']),
        ('fastapi', 'FastAPI & Flask', 'Backend', 'Zap', 'Modern async REST/GraphQL APIs, Pydantic data schemas, dependency injection, and OpenAPI documentation.', ['pydantic', 'async-routes', 'openapi', 'validation']),
        ('rest-apis', 'RESTful API Architecture', 'Backend', 'Globe', 'HTTP verb semantics, status codes, HATEOAS, idempotent requests, and rate limiting.', ['http-spec', 'rate-limiting', 'pagination', 'versioning']),
        ('graphql', 'GraphQL & Apollo', 'Backend', 'Network', 'Declarative schema definitions, queries, mutations, resolvers, and DataLoader N+1 prevention.', ['schemas', 'resolvers', 'apollo', 'batching']),
        ('grpc', 'gRPC & Protocol Buffers', 'Backend', 'Cpu', 'Binary serialization, bidirectional streaming RPCs, and low-latency microservice communication.', ['protobuf', 'rpc', 'streaming', 'microservices']),
        ('auth-security', 'Authentication & JWT', 'Backend', 'Key', 'OAuth2, OpenID Connect, JWT signing/verification, refresh token rotation, and bcrypt hashing.', ['jwt', 'oauth2', 'rbac', 'session-security']),

        # Database
        ('postgresql', 'PostgreSQL & Relational SQL', 'Database', 'Database', 'ACID transactions, relational schema design, complex joins, subqueries, and window functions.', ['acid', 'joins', 'indexing', 'transactions']),
        ('database-indexing', 'Database Indexing & Query Tuning', 'Database', 'Search', 'B-Tree & GIN indexes, EXPLAIN ANALYZE execution plans, and query performance tuning.', ['explain-analyze', 'b-tree', 'query-plan', 'optimization']),
        ('mongodb', 'MongoDB & NoSQL', 'Database', 'Box', 'Document schemas, aggregation pipelines, replica sets, and flexible unstructured data modeling.', ['aggregation', 'documents', 'unstructured', 'collections']),
        ('redis', 'Redis & In-Memory Caching', 'Database', 'Flame', 'Key-value caching, Pub/Sub channels, sorted sets, session storage, and rate limiting buffers.', ['caching', 'pubsub', 'ttl', 'data-structures']),
        ('database-migrations', 'Database Migrations & ORMs', 'Database', 'RefreshCw', 'Alembic, Prisma, SQLAlchemy migrations, rollback scripts, and zero-downtime schema evolution.', ['alembic', 'prisma', 'schema-evolution', 'rollbacks']),

        # DevOps & Cloud
        ('git', 'Git & GitHub Collaboration', 'Tools', 'GitBranch', 'Branching workflows, rebasing, pull requests, merge conflict resolution, and bisect debugging.', ['rebase', 'pull-requests', 'git-flow', 'bisect']),
        ('docker', 'Docker & Containerization', 'DevOps', 'Package', 'Multi-stage Dockerfiles, image optimization, volume mounts, and container networking.', ['dockerfile', 'containers', 'multi-stage', 'compose']),
        ('kubernetes', 'Kubernetes & Container Orchestration', 'DevOps', 'Anchor', 'Pods, Deployments, Services, Ingress controllers, Helm charts, and auto-scaling.', ['helm', 'k8s-manifests', 'ingress', 'autoscaling']),
        ('ci-cd', 'CI/CD Pipelines (GitHub Actions)', 'DevOps', 'PlayCircle', 'Automated testing, linting gates, Docker build cache, and deployment triggers.', ['github-actions', 'pipelines', 'automated-deploy', 'gates']),
        ('aws-cloud', 'AWS Cloud Infrastructure', 'DevOps', 'Cloud', 'EC2, S3, RDS, ECS, Lambda, IAM policies, and VPC network isolation.', ['ec2', 's3', 'lambda', 'iam', 'vpc']),
        ('terraform', 'Infrastructure as Code (Terraform)', 'DevOps', 'Compass', 'Declarative HCL modules, state management, remote backends, and immutable infrastructure.', ['hcl', 'state-locking', 'iac', 'plan-apply']),
        ('observability', 'Observability & Monitoring', 'DevOps', 'Eye', 'Prometheus metrics, Grafana dashboards, OpenTelemetry distributed tracing, and Sentry logging.', ['prometheus', 'grafana', 'tracing', 'opentelemetry']),

        # AI & Machine Learning
        ('math-statistics', 'Mathematics & Probability for ML', 'AI/ML', 'Percent', 'Linear algebra, calculus, probability distributions, matrix factorizations, and gradient descent.', ['linear-algebra', 'calculus', 'probability', 'statistics']),
        ('pandas-numpy', 'Data Analysis with Pandas & NumPy', 'AI/ML', 'Grid', 'Vectorized matrix calculations, data cleaning, aggregation, and exploratory analysis.', ['numpy', 'pandas', 'dataframes', 'vectorization']),
        ('scikit-learn', 'Scikit-Learn & Classical ML', 'AI/ML', 'Cpu', 'Supervised/unsupervised learning, random forests, SVM, clustering, and cross-validation.', ['classification', 'regression', 'clustering', 'validation']),
        ('deep-learning-pytorch', 'Deep Learning & PyTorch', 'AI/ML', 'Sparkles', 'Neural networks, backpropagation, CNNs, Transformers, and tensor gradient calculations.', ['tensors', 'autograd', 'pytorch', 'transformers']),
        ('llm-prompt-engineering', 'LLMs, Prompt Engineering & RAG', 'AI/ML', 'Bot', 'Context window management, vector embeddings, chunking, Pinecone/Chroma, and LangChain.', ['rag', 'vector-search', 'langchain', 'embeddings']),
        ('model-deployment', 'MLOps & Model Deployment', 'AI/ML', 'UploadCloud', 'ONNX runtimes, Triton inference server, FastAPI serving, and model monitoring drift detection.', ['mlops', 'model-serving', 'onnx', 'drift-detection']),

        # System Design & Architecture
        ('system-design', 'Distributed System Design', 'System Design', 'Grid', 'High availability, CAP theorem, load balancing, sharding, and consistent hashing.', ['cap-theorem', 'load-balancing', 'sharding', 'scalability']),
        ('microservices', 'Microservices Architecture', 'System Design', 'Boxes', 'Domain-driven design, event sourcing, CQRS, circuit breakers, and saga transactions.', ['saga-pattern', 'event-driven', 'cqrs', 'ddd']),
        ('message-queues', 'Message Queues (Kafka & RabbitMQ)', 'System Design', 'Mail', 'Partitioned event streaming, consumer groups, backpressure handling, and dead-letter queues.', ['kafka', 'rabbitmq', 'event-streaming', 'dead-letter']),

        # Soft Skills & Engineering Practices
        ('clean-code', 'Clean Architecture & Refactoring', 'Soft Skills', 'CheckCircle2', 'SOLID principles, DRY, separation of concerns, defensive programming, and code smells.', ['solid', 'refactoring', 'design-patterns', 'code-review']),
        ('testing-qa', 'Testing & TDD (Unit & Integration)', 'Soft Skills', 'ShieldCheck', 'Jest, Pytest, Playwright, mock factories, red-green-refactor cycles, and CI coverage.', ['pytest', 'jest', 'playwright', 'tdd']),
        ('technical-writing', 'Technical Documentation & Architecture RFCs', 'Soft Skills', 'BookOpen', 'ADRs (Architecture Decision Records), OpenAPI specs, markdown readmes, and diagrams.', ['rfc', 'adr', 'documentation', 'markdown'])
    ]

    skill_objs = {}
    for s_slug, s_name, s_cat, s_icon, s_desc, s_tags in skills_data:
        s = Skill(
            slug=s_slug,
            name=s_name,
            category=s_cat,
            icon=s_icon,
            description=s_desc
        )
        s.set_tags(s_tags)
        db.session.add(s)
        skill_objs[s_slug] = s

    db.session.flush()

    # 4. MAP CAREER SKILLS FOR "FULL STACK DEVELOPER"
    fs_career = career_objs['full-stack-developer']
    fs_skill_mappings = [
        ('html-css', 90, 'core', 1.0),
        ('javascript', 85, 'core', 1.2),
        ('typescript', 80, 'core', 1.1),
        ('react', 85, 'core', 1.2),
        ('tailwind', 80, 'recommended', 0.9),
        ('state-management', 75, 'recommended', 0.9),
        ('web-performance', 75, 'recommended', 0.8),
        ('nodejs', 80, 'core', 1.1),
        ('fastapi', 75, 'recommended', 0.9),
        ('rest-apis', 85, 'core', 1.1),
        ('auth-security', 80, 'core', 1.0),
        ('postgresql', 80, 'core', 1.1),
        ('redis', 70, 'recommended', 0.8),
        ('database-migrations', 75, 'recommended', 0.8),
        ('git', 85, 'core', 1.0),
        ('docker', 75, 'recommended', 0.9),
        ('ci-cd', 70, 'recommended', 0.8),
        ('system-design', 75, 'core', 1.0),
        ('clean-code', 80, 'core', 1.0),
        ('testing-qa', 75, 'core', 1.0)
    ]

    for s_slug, target_prof, importance, weight in fs_skill_mappings:
        if s_slug in skill_objs:
            cs = CareerSkill(
                career_id=fs_career.id,
                skill_id=skill_objs[s_slug].id,
                target_proficiency=target_prof,
                importance=importance,
                weight=weight
            )
            db.session.add(cs)

    # MAP AI/ML CAREER SKILLS
    ai_career = career_objs['ai-ml-engineer']
    ai_skill_mappings = [
        ('python', 90, 'core', 1.2),
        ('math-statistics', 85, 'core', 1.1),
        ('pandas-numpy', 85, 'core', 1.1),
        ('scikit-learn', 80, 'core', 1.0),
        ('deep-learning-pytorch', 85, 'core', 1.2),
        ('llm-prompt-engineering', 80, 'core', 1.1),
        ('model-deployment', 75, 'core', 1.0),
        ('docker', 75, 'recommended', 0.8),
        ('fastapi', 75, 'recommended', 0.8),
        ('git', 80, 'core', 0.9)
    ]
    for s_slug, target_prof, importance, weight in ai_skill_mappings:
        if s_slug in skill_objs:
            cs = CareerSkill(
                career_id=ai_career.id,
                skill_id=skill_objs[s_slug].id,
                target_proficiency=target_prof,
                importance=importance,
                weight=weight
            )
            db.session.add(cs)

    # 5. CREATE USER PROFILES
    student_profile = Profile(
        user_id=student.id,
        full_name='Ashutosh Verma',
        headline='Aspiring Full Stack Engineer | React & Python Enthusiast',
        bio='Building production web apps and honing system design, scalable databases, and modern UI engineering.',
        avatar_url='https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&auto=format&fit=crop&q=80',
        target_career_id=fs_career.id,
        experience_level='intermediate',
        learning_style='mixed',
        hours_per_week=12,
        current_streak=6,
        longest_streak=14,
        total_learning_minutes=2140, # ~35.6 hours
        github_username='ashutosh-dev',
        onboarding_completed=True,
        theme_preference='dark'
    )
    db.session.add(student_profile)

    mentor_profile = Profile(
        user_id=mentor.id,
        full_name='Sarah Chen',
        headline='Principal Cloud Architect @ Stripe | Ex-Google',
        bio='12+ years building global scale distributed payment rails and high performance web systems. Passionate mentor.',
        avatar_url='https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&auto=format&fit=crop&q=80',
        target_career_id=career_objs['solutions-architect'].id,
        experience_level='advanced',
        hours_per_week=5,
        current_streak=45,
        total_learning_minutes=9800,
        onboarding_completed=True
    )
    db.session.add(mentor_profile)

    admin_profile = Profile(
        user_id=admin.id,
        full_name='SkillForge System Admin',
        headline='Platform Administrator & Curriculum Architect',
        avatar_url='https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&auto=format&fit=crop&q=80',
        onboarding_completed=True
    )
    db.session.add(admin_profile)

    # Add Mentor Specific Profile
    mentor_details = MentorProfile(
        user_id=mentor.id,
        company='Stripe',
        role_title='Principal Distributed Systems Architect',
        bio='Specialized in resilient microservices, high-load PostgreSQL tuning, and career transitions to Tier-1 tech.',
        years_experience=12,
        hourly_rate='Free for Students',
        rating=4.95,
        total_reviews=48,
        availability='Available 2 slots this week'
    )
    mentor_details.set_expertise(['System Design', 'React & Next.js', 'PostgreSQL Scaling', 'Career Strategy'])
    db.session.add(mentor_details)

    db.session.flush()

    # 6. SEED USER SKILLS FOR ASHUTOSH (Realistic mixed proficiency to show clear Gaps)
    user_skill_records = [
        ('html-css', 90, True, 92, 'Master'),
        ('javascript', 75, True, 80, 'Intermediate'),
        ('typescript', 55, False, 58, 'Intermediate'),
        ('react', 62, True, 68, 'Intermediate'),
        ('tailwind', 82, True, 85, 'Advanced'),
        ('state-management', 40, False, 45, 'Beginner'),
        ('nodejs', 50, False, 52, 'Intermediate'),
        ('fastapi', 65, True, 70, 'Intermediate'),
        ('rest-apis', 78, True, 82, 'Advanced'),
        ('auth-security', 45, False, 40, 'Beginner'),
        ('postgresql', 60, True, 65, 'Intermediate'),
        ('redis', 30, False, 0, 'Novice'),
        ('git', 88, True, 90, 'Advanced'),
        ('docker', 35, False, 0, 'Novice'),
        ('testing-qa', 40, False, 45, 'Beginner'),
        ('clean-code', 70, True, 75, 'Intermediate'),
        ('system-design', 35, False, 0, 'Novice')
    ]

    for s_slug, prof, verified, a_score, label in user_skill_records:
        if s_slug in skill_objs:
            us = UserSkill(
                user_id=student.id,
                skill_id=skill_objs[s_slug].id,
                current_proficiency=prof,
                verified=verified,
                assessment_score=a_score,
                level_label=label,
                last_practiced_at=datetime.now(timezone.utc) - timedelta(days=2)
            )
            db.session.add(us)

    # 7. CREATE FULL STACK DEVELOPER ROADMAP GRAPH
    fs_roadmap = Roadmap(
        career_id=fs_career.id,
        title='Full Stack Engineering Mastery Roadmap',
        description='End-to-end curriculum bridging semantic UI, robust reactive web architecture, type-safe fullstack APIs, distributed databases, and production DevOps.',
        version='2026.2',
        total_steps=10
    )
    db.session.add(fs_roadmap)
    db.session.flush()

    roadmap_steps_data = [
        {
            'skill_id': skill_objs['html-css'].id,
            'step_order': 1,
            'stage_name': 'Stage 1: Foundations',
            'title': 'Semantic Web & Modern CSS Engine',
            'description': 'Master HTML5 accessibility semantics, modern CSS Grid/Flexbox layouts, fluid typography, and design token integration.',
            'node_type': 'skill',
            'prerequisites': [],
            'topics': [
                {'title': 'Semantic tags & ARIA landmarks', 'completed': True},
                {'title': 'CSS Grid & Flexbox complex layouts', 'completed': True},
                {'title': 'Fluid clamp() typography & CSS tokens', 'completed': True},
                {'title': 'Keyframe micro-interactions', 'completed': True}
            ],
            'estimated_hours': 15,
            'grid_x': 100,
            'grid_y': 100
        },
        {
            'skill_id': skill_objs['javascript'].id,
            'step_order': 2,
            'stage_name': 'Stage 1: Foundations',
            'title': 'Core JavaScript (ES6+) & Async Runtime',
            'description': 'Deep dive into asynchronous programming, Event Loop microtasks, Closures, Prototypes, Array pipelines, and DOM lifecycles.',
            'node_type': 'skill',
            'prerequisites': [skill_objs['html-css'].id],
            'topics': [
                {'title': 'ES6+ modules, destructuring, spread', 'completed': True},
                {'title': 'Promises, async/await, Promise.allSettled', 'completed': True},
                {'title': 'Closures, lexical scope & this binding', 'completed': True},
                {'title': 'Event bubbling, throttling & debouncing', 'completed': False}
            ],
            'estimated_hours': 25,
            'grid_x': 340,
            'grid_y': 100
        },
        {
            'skill_id': skill_objs['react'].id,
            'step_order': 3,
            'stage_name': 'Stage 2: Frontend Architecture',
            'title': 'React 19 & Component Architecture',
            'description': 'Master declarative state machines, custom hooks, React Server Components (RSC), memoization strategies, and render lifecycle tuning.',
            'node_type': 'skill',
            'prerequisites': [skill_objs['javascript'].id],
            'topics': [
                {'title': 'Component composition & props ergonomics', 'completed': True},
                {'title': 'useState & useReducer state machines', 'completed': True},
                {'title': 'Advanced custom hooks & useEffect sync', 'completed': True},
                {'title': 'React 19 Actions & useTransition', 'completed': False},
                {'title': 'Context vs Zustand performance boundaries', 'completed': False}
            ],
            'estimated_hours': 35,
            'grid_x': 580,
            'grid_y': 100
        },
        {
            'skill_id': skill_objs['typescript'].id,
            'step_order': 4,
            'stage_name': 'Stage 2: Frontend Architecture',
            'title': 'TypeScript Type System & Safety',
            'description': 'Eliminate runtime crashes through strict typing, generics, discriminated unions, utility types, and runtime schema validation with Zod.',
            'node_type': 'skill',
            'prerequisites': [skill_objs['javascript'].id],
            'topics': [
                {'title': 'Primitive types, interfaces & type aliases', 'completed': True},
                {'title': 'Generics & type constraints', 'completed': True},
                {'title': 'Discriminated unions & pattern matching', 'completed': False},
                {'title': 'Zod schema inference & API contracts', 'completed': False}
            ],
            'estimated_hours': 20,
            'grid_x': 580,
            'grid_y': 240
        },
        {
            'skill_id': skill_objs['nodejs'].id,
            'step_order': 5,
            'stage_name': 'Stage 3: Backend & APIs',
            'title': 'Node.js & Backend API Engineering',
            'description': 'Build resilient REST APIs, middleware pipelines, error handling layers, and asynchronous event-driven worker tasks.',
            'node_type': 'skill',
            'prerequisites': [skill_objs['javascript'].id],
            'topics': [
                {'title': 'Express middleware chains & routing', 'completed': True},
                {'title': 'Structured logging & centralized error handlers', 'completed': True},
                {'title': 'Rate limiting, CORS & Helmet security headers', 'completed': False},
                {'title': 'Asynchronous streams & file handling', 'completed': False}
            ],
            'estimated_hours': 30,
            'grid_x': 340,
            'grid_y': 240
        },
        {
            'skill_id': skill_objs['postgresql'].id,
            'step_order': 6,
            'stage_name': 'Stage 3: Backend & APIs',
            'title': 'PostgreSQL & Relational Data Architecture',
            'description': 'Model complex relational schemas, write optimal SQL joins, understand ACID isolation levels, and build automated database migrations.',
            'node_type': 'skill',
            'prerequisites': [skill_objs['nodejs'].id],
            'topics': [
                {'title': 'Relational normalization & foreign key cascading', 'completed': True},
                {'title': 'Complex aggregations & window functions', 'completed': True},
                {'title': 'B-Tree indexing & EXPLAIN ANALYZE tuning', 'completed': False},
                {'title': 'Transactions, row locks & ACID guarantees', 'completed': False}
            ],
            'estimated_hours': 25,
            'grid_x': 100,
            'grid_y': 240
        },
        {
            'skill_id': skill_objs['auth-security'].id,
            'step_order': 7,
            'stage_name': 'Stage 4: Security & Real-Time',
            'title': 'Authentication & Secure Session Architecture',
            'description': 'Implement enterprise JWT authentication, refresh token rotation, bcrypt password hashing, and role-based access control (RBAC).',
            'node_type': 'skill',
            'prerequisites': [skill_objs['nodejs'].id, skill_objs['postgresql'].id],
            'topics': [
                {'title': 'Bcrypt password hashing & salt rounds', 'completed': True},
                {'title': 'Stateless JWT issuance & verification', 'completed': True},
                {'title': 'Refresh token rotation & revoking strategy', 'completed': False},
                {'title': 'Role-based access control middleware (RBAC)', 'completed': False}
            ],
            'estimated_hours': 20,
            'grid_x': 100,
            'grid_y': 380
        },
        {
            'skill_id': skill_objs['docker'].id,
            'step_order': 8,
            'stage_name': 'Stage 5: Deployment & Operations',
            'title': 'Docker Containerization & CI/CD',
            'description': 'Containerize fullstack applications with multi-stage Docker builds, compose dev environments, and automated GitHub Actions testing gates.',
            'node_type': 'skill',
            'prerequisites': [skill_objs['auth-security'].id],
            'topics': [
                {'title': 'Writing optimized multi-stage Dockerfiles', 'completed': False},
                {'title': 'Docker Compose multi-service networks', 'completed': False},
                {'title': 'GitHub Actions workflow testing & linting', 'completed': False},
                {'title': 'Production container image security scanning', 'completed': False}
            ],
            'estimated_hours': 25,
            'grid_x': 340,
            'grid_y': 380
        },
        {
            'skill_id': skill_objs['system-design'].id,
            'step_order': 9,
            'stage_name': 'Stage 5: Deployment & Operations',
            'title': 'Scalable Full Stack System Architecture',
            'description': 'Learn caching strategies with Redis, database connection pooling, CDN edge distribution, and horizontal auto-scaling patterns.',
            'node_type': 'skill',
            'prerequisites': [skill_objs['docker'].id, skill_objs['postgresql'].id],
            'topics': [
                {'title': 'Cache-aside & write-through Redis patterns', 'completed': False},
                {'title': 'Load balancing & health check heartbeats', 'completed': False},
                {'title': 'CDN asset caching & stale-while-revalidate', 'completed': False},
                {'title': 'Disaster recovery & database read replicas', 'completed': False}
            ],
            'estimated_hours': 30,
            'grid_x': 580,
            'grid_y': 380
        },
        {
            'skill_id': skill_objs['clean-code'].id,
            'step_order': 10,
            'stage_name': 'Stage 6: Capstone Portfolio',
            'title': 'Production Capstone: Cloud SaaS Platform',
            'description': 'Architect, build, and deploy an end-to-end full-stack SaaS product with live telemetry, automated tests, and GitHub showcase.',
            'node_type': 'capstone',
            'prerequisites': [skill_objs['system-design'].id, skill_objs['react'].id],
            'topics': [
                {'title': 'Design system & UI architecture', 'completed': False},
                {'title': 'Multi-tenant database schema & RBAC', 'completed': False},
                {'title': 'End-to-end test suite (Playwright/Jest)', 'completed': False},
                {'title': 'Production deployment on Vercel + Railway/AWS', 'completed': False}
            ],
            'estimated_hours': 40,
            'grid_x': 580,
            'grid_y': 520
        }
    ]

    for step_dict in roadmap_steps_data:
        step = RoadmapStep(
            roadmap_id=fs_roadmap.id,
            skill_id=step_dict['skill_id'],
            step_order=step_dict['step_order'],
            stage_name=step_dict['stage_name'],
            title=step_dict['title'],
            description=step_dict['description'],
            node_type=step_dict['node_type'],
            estimated_hours=step_dict['estimated_hours'],
            grid_x=step_dict['grid_x'],
            grid_y=step_dict['grid_y']
        )
        step.set_prerequisites(step_dict['prerequisites'])
        step.set_topics(step_dict['topics'])
        db.session.add(step)

    # 8. SEED LEARNING RESOURCES (50+ curated resources across skills)
    resources_data = [
        # React
        (skill_objs['react'].id, 'Complete Guide to React 19 Custom Hooks & Actions', 'Master creating scalable, pure custom hooks and leveraging React 19 transition primitives.', 'https://react.dev/learn/reusing-logic-with-custom-hooks', 'Documentation', 'Intermediate', 45, 'React Official Docs', 4.9, True),
        (skill_objs['react'].id, 'Building High-Performance React Design Systems', 'Step-by-step walkthrough of building zero-overhead design systems with compound component patterns.', 'https://youtube.com/watch?v=react-design-systems', 'Video', 'Intermediate', 60, 'Frontend Masters', 4.8, True),
        (skill_objs['react'].id, 'Interactive React State Machine Sandbox', 'Practice state machines with useReducer and xstate in interactive browser challenges.', 'https://frontendeval.com/react-state-machines', 'Practice', 'Intermediate', 40, 'FrontendEval', 4.7, True),
        (skill_objs['react'].id, 'React Server Components Architecture in Production', 'Deep architectural explanation of React Server Components, server actions, and streaming SSR.', 'https://nextjs.org/docs/app/building-your-application/rendering/server-components', 'Article', 'Advanced', 35, 'Vercel Engineering', 4.9, True),
        
        # JavaScript
        (skill_objs['javascript'].id, 'JavaScript Visualized: The Event Loop & Microtasks', 'Animated deep-dive into the call stack, Web APIs, task queue, and microtask queue execution order.', 'https://dev.to/lydiahallie/javascript-visualized-event-loop-ecv', 'Article', 'Beginner', 30, 'Lydia Hallie', 4.9, True),
        (skill_objs['javascript'].id, 'Async JavaScript: Deep Dive into Promises & Generators', 'Comprehensive video masterclass covering promise internals, async iterators, and concurrency control.', 'https://youtube.com/watch?v=async-js-deepdive', 'Video', 'Intermediate', 75, 'JavaScript Mastery', 4.8, True),
        (skill_objs['javascript'].id, 'Modern JavaScript Algorithms & Data Structures Practice', '30 interactive code challenges covering closures, tree traversals, and debounce implementations.', 'https://leetcode.com/problemset/javascript/', 'Practice', 'Intermediate', 90, 'LeetCode', 4.7, True),
        
        # TypeScript
        (skill_objs['typescript'].id, 'TypeScript Generics Masterclass from Scratch', 'Learn how to write expressive, reusable generic functions, mapped types, and conditional types.', 'https://totaltypescript.com/tutorials/generics', 'Course', 'Intermediate', 90, 'Total TypeScript', 5.0, True),
        (skill_objs['typescript'].id, 'Runtime Data Validation with TypeScript & Zod', 'Safely validate external API payloads and database records with type-inferred schemas.', 'https://zod.dev', 'Documentation', 'Beginner', 25, 'Zod Docs', 4.8, True),
        
        # PostgreSQL
        (skill_objs['postgresql'].id, 'Use The Index, Luke! SQL Indexing Guide for Developers', 'The definitive guide to database indexing, B-Tree lookups, composite indexes, and query plans.', 'https://use-the-index-luke.com', 'Article', 'Intermediate', 60, 'Markus Winand', 4.9, True),
        (skill_objs['postgresql'].id, 'PostgreSQL Schema Design & ACID Isolation Levels', 'Understand dirty reads, non-repeatable reads, serializable transactions, and locking semantics.', 'https://postgresql.org/docs/current/transaction-iso.html', 'Documentation', 'Advanced', 40, 'PostgreSQL Global Group', 4.8, True),
        
        # Node & APIs
        (skill_objs['nodejs'].id, 'Building Production-Grade REST APIs with Express & TypeScript', 'Structured guide on modular controllers, service layers, DTO validation, and error wrappers.', 'https://khalilstemmler.com/articles/enterprise-typescript-nodejs/', 'Article', 'Intermediate', 50, 'Khalil Stemmler', 4.9, True),
        (skill_objs['rest-apis'].id, 'REST API Design Principles & Richardson Maturity Model', 'Industry standards for HTTP status codes, versioning, idempotent operations, and pagination headers.', 'https://martinfowler.com/articles/richardsonMaturityModel.html', 'Article', 'Beginner', 30, 'Martin Fowler', 4.9, True),
        
        # Auth & Security
        (skill_objs['auth-security'].id, 'The Ultimate Guide to JWT Authentication & Refresh Tokens', 'Avoid common security pitfalls like storing tokens in localStorage; implement secure httpOnly cookies.', 'https://auth0.com/blog/refresh-tokens-what-are-they-and-when-to-use-them/', 'Article', 'Intermediate', 45, 'Auth0 Engineering', 4.8, True),
        (skill_objs['auth-security'].id, 'Role-Based Access Control (RBAC) System Implementation', 'Architecting granular permissions, role hierarchies, and guard middleware in Node.js and Python.', 'https://owasp.org/www-community/Access_Control', 'Documentation', 'Intermediate', 35, 'OWASP', 4.9, True),

        # Docker & DevOps
        (skill_objs['docker'].id, 'Docker for Developers: From Local Dev to Production Image', 'Write multi-stage Dockerfiles that reduce image sizes from 1.2GB down to 65MB alpine packages.', 'https://youtube.com/watch?v=docker-deep-dive', 'Video', 'Beginner', 55, 'TechWorld with Nana', 4.9, True),
        (skill_objs['ci-cd'].id, 'GitHub Actions CI/CD Complete Pipeline Tutorial', 'Automate testing, lint checks, docker image publishing, and SSH production deployments.', 'https://docs.github.com/en/actions/quickstart', 'Documentation', 'Intermediate', 40, 'GitHub Docs', 4.8, True),

        # System Design
        (skill_objs['system-design'].id, 'System Design Primer: High Scalability & Caching', 'Learn how top tech companies scale to millions of concurrent users using Redis and sharding.', 'https://github.com/donnemartin/system-design-primer', 'Documentation', 'Advanced', 120, 'Donne Martin', 5.0, True),
        (skill_objs['redis'].id, 'Redis In-Memory Architecture & Rate Limiting Masterclass', 'Implement sliding window log rate limiters, session caches, and Pub/Sub streams with Redis.', 'https://redis.io/docs/manual/patterns/', 'Article', 'Intermediate', 40, 'Redis Official', 4.8, True)
    ]

    for r_skill_id, r_title, r_desc, r_url, r_type, r_diff, r_dur, r_prov, r_rating, r_free in resources_data:
        res = Resource(
            skill_id=r_skill_id,
            title=r_title,
            description=r_desc,
            url=r_url,
            type=r_type,
            difficulty=r_diff,
            duration_mins=r_dur,
            provider=r_prov,
            rating=r_rating,
            is_free=r_free
        )
        db.session.add(res)

    db.session.flush()

    # Link some resource progresses for Ashutosh
    sample_resources = Resource.query.limit(6).all()
    for idx, r in enumerate(sample_resources):
        status = 'completed' if idx < 3 else 'in_progress'
        rp = ResourceProgress(
            user_id=student.id,
            resource_id=r.id,
            status=status,
            completed_at=datetime.now(timezone.utc) - timedelta(days=idx) if status == 'completed' else None
        )
        db.session.add(rp)

    # 9. SEED ASSESSMENTS & REAL QUESTIONS
    # JavaScript Assessment
    js_assessment = Assessment(
        skill_id=skill_objs['javascript'].id,
        title='JavaScript (ES6+) Core & Async Assessment',
        description='Evaluate your mastery of asynchronous closures, event loop execution order, array manipulations, and modern ES6+ standards.',
        difficulty='Intermediate',
        time_limit_mins=15,
        pass_score=70
    )
    db.session.add(js_assessment)

    # React Assessment
    react_assessment = Assessment(
        skill_id=skill_objs['react'].id,
        title='React 19 & State Management Verification',
        description='Test your understanding of component re-renders, useEffect dependency stability, custom hook composition, and optimistic state.',
        difficulty='Intermediate',
        time_limit_mins=15,
        pass_score=70
    )
    db.session.add(react_assessment)

    # PostgreSQL Assessment
    sql_assessment = Assessment(
        skill_id=skill_objs['postgresql'].id,
        title='PostgreSQL Relational Design & Indexing',
        description='Validate your competency with multi-table joins, subqueries, B-Tree index optimizations, and ACID transaction locks.',
        difficulty='Intermediate',
        time_limit_mins=15,
        pass_score=70
    )
    db.session.add(sql_assessment)

    db.session.flush()

    # Add Questions for JavaScript Assessment
    js_questions = [
        {
            'text': 'What will be logged to the console when executing the following snippet?',
            'type': 'code_output',
            'code': '''console.log('1');
setTimeout(() => console.log('2'), 0);
Promise.resolve().then(() => console.log('3'));
console.log('4');''',
            'options': ['1, 2, 3, 4', '1, 4, 3, 2', '1, 4, 2, 3', '1, 3, 4, 2'],
            'answer': '1, 4, 3, 2',
            'explanation': 'Synchronous code runs first (1, 4). Microtasks from Promise.then run next (3). Macrotasks from setTimeout run in the next event loop tick (2).',
            'concept': 'Event Loop & Microtasks'
        },
        {
            'text': 'Which of the following correctly describes a closure in JavaScript?',
            'type': 'mcq',
            'code': None,
            'options': [
                'A function bundled together with references to its surrounding lexical environment',
                'An asynchronous function that returns a rejected Promise',
                'A built-in garbage collection mechanism that deletes unused variables',
                'A method used exclusively to close active database connections'
            ],
            'answer': 'A function bundled together with references to its surrounding lexical environment',
            'explanation': 'A closure gives an inner function access to an outer function’s scope even after the outer function has finished executing.',
            'concept': 'Closures & Lexical Scope'
        },
        {
            'text': 'What is the value of `result` after running this code?',
            'type': 'code_output',
            'code': '''const numbers = [1, 2, 3, 4, 5];
const result = numbers
  .filter(n => n % 2 !== 0)
  .map(n => n * 2)
  .reduce((acc, curr) => acc + curr, 0);''',
            'options': ['18', '30', '12', '24'],
            'answer': '18',
            'explanation': 'Odds are [1, 3, 5]. Doubled: [2, 6, 10]. Sum: 2 + 6 + 10 = 18.',
            'concept': 'Array Transformations (Functional)'
        },
        {
            'text': 'How does `Promise.allSettled()` differ from `Promise.all()`?',
            'type': 'mcq',
            'code': None,
            'options': [
                'Promise.allSettled waits for all promises to resolve or reject without early termination, whereas Promise.all short-circuits on the first rejection',
                'Promise.allSettled runs sequentially, while Promise.all runs in parallel threads',
                'Promise.allSettled can only be used with HTTP GET requests',
                'Promise.all returns an array of status objects with status "fulfilled" or "rejected"'
            ],
            'answer': 'Promise.allSettled waits for all promises to resolve or reject without early termination, whereas Promise.all short-circuits on the first rejection',
            'explanation': 'Promise.allSettled gives you the outcome of every promise regardless of individual failures, avoiding unhandled catch cascade bugs.',
            'concept': 'Async & Promise Handling'
        }
    ]

    for q_data in js_questions:
        q = Question(
            assessment_id=js_assessment.id,
            question_text=q_data['text'],
            question_type=q_data['type'],
            code_snippet=q_data['code'],
            correct_answer=q_data['answer'],
            explanation=q_data['explanation'],
            concept_tag=q_data['concept']
        )
        q.set_options(q_data['options'])
        db.session.add(q)

    # Add Questions for React Assessment
    react_questions = [
        {
            'text': 'Why should state updates depending on previous state use the updater function format `setCount(prev => prev + 1)`?',
            'type': 'mcq',
            'code': None,
            'options': [
                'Because React batches state updates and closures might otherwise read stale state values',
                'Because calling setCount with a plain value throws a TypeError in strict mode',
                'Because it automatically prevents all child component re-renders',
                'Because it converts synchronous state into a Web Worker thread'
            ],
            'answer': 'Because React batches state updates and closures might otherwise read stale state values',
            'explanation': 'Functional state updates guarantee you are calculating the next state from the most up-to-date pending state value during batching.',
            'concept': 'State Batching & Immutability'
        },
        {
            'text': 'What causes an infinite loop in the following component?',
            'type': 'code_output',
            'code': '''function UserFeed() {
  const [data, setData] = useState([]);
  const options = { limit: 10 };

  useEffect(() => {
    fetchData(options).then(res => setData(res));
  }, [options]);

  return <div>{data.length} items</div>;
}''',
            'options': [
                '`options` is a new object reference created on every render, triggering useEffect continuously',
                'useState cannot hold array types inside functional components',
                'setData must be wrapped in Promise.resolve()',
                'useEffect cannot perform asynchronous operations'
            ],
            'answer': '`options` is a new object reference created on every render, triggering useEffect continuously',
            'explanation': 'Object literals recreate their memory reference on every render cycle. Wrapping in useMemo or defining outside the component prevents infinite triggers.',
            'concept': 'Hooks & Dependency Stability'
        },
        {
            'text': 'What is the primary architectural purpose of React Server Components (RSC)?',
            'type': 'mcq',
            'code': None,
            'options': [
                'To execute data-fetching components purely on the server with zero client JavaScript bundle overhead',
                'To replace Node.js express servers completely with browser-side workers',
                'To make all React state automatically persist to local storage',
                'To eliminate the need for HTML and CSS in modern web browsers'
            ],
            'answer': 'To execute data-fetching components purely on the server with zero client JavaScript bundle overhead',
            'explanation': 'Server components execute exclusively on the server, accessing databases directly and streaming pre-rendered UI without sending dependencies to the client bundle.',
            'concept': 'Server Components & Streaming'
        }
    ]

    for q_data in react_questions:
        q = Question(
            assessment_id=react_assessment.id,
            question_text=q_data['text'],
            question_type=q_data['type'],
            code_snippet=q_data['code'],
            correct_answer=q_data['answer'],
            explanation=q_data['explanation'],
            concept_tag=q_data['concept']
        )
        q.set_options(q_data['options'])
        db.session.add(q)

    db.session.flush()

    # Record a realistic past assessment attempt for Ashutosh
    attempt = AssessmentAttempt(
        user_id=student.id,
        assessment_id=js_assessment.id,
        score=75,
        total_questions=4,
        correct_count=3,
        passed=True,
        completed_at=datetime.now(timezone.utc) - timedelta(days=3)
    )
    attempt.strong_concepts = json.dumps(['Event Loop & Microtasks', 'Array Transformations (Functional)'])
    attempt.weak_concepts = json.dumps(['Async & Promise Handling'])
    attempt.answers = json.dumps([
        {'question_id': 1, 'correct': True, 'concept': 'Event Loop & Microtasks'},
        {'question_id': 2, 'correct': True, 'concept': 'Closures & Lexical Scope'},
        {'question_id': 3, 'correct': True, 'concept': 'Array Transformations (Functional)'},
        {'question_id': 4, 'correct': False, 'concept': 'Async & Promise Handling'}
    ])
    db.session.add(attempt)

    # 10. SEED PROJECTS & MILESTONES
    project1 = Project(
        user_id=student.id,
        title='PulseFlow — Developer Observability & Telemetry Platform',
        description='High-performance SaaS dashboard visualizing real-time HTTP latency, microservice trace cascades, and automated alert rules.',
        difficulty='Advanced',
        github_url='https://github.com/ashutosh-dev/pulseflow-telemetry',
        live_url='https://pulseflow.skillforge.app',
        status='Building',
        progress_percent=78,
        image_url='https://images.unsplash.com/photo-1551288049-bebda4e38f71?w=600&auto=format&fit=crop&q=80',
        start_date=datetime.now(timezone.utc) - timedelta(days=20)
    )
    project1.set_technologies(['React', 'TypeScript', 'Tailwind CSS', 'Node.js', 'PostgreSQL', 'Redis'])
    db.session.add(project1)
    db.session.flush()

    p1_milestones = [
        ('Design system tokens & glass telemetry panels', True, datetime.now(timezone.utc) - timedelta(days=15)),
        ('JWT auth & role-based organization workspaces', True, datetime.now(timezone.utc) - timedelta(days=10)),
        ('Real-time WebSockets event ingest pipeline', True, datetime.now(timezone.utc) - timedelta(days=4)),
        ('Prometheus metric aggregations & latency charts', False, datetime.now(timezone.utc) + timedelta(days=5)),
        ('E2E integration test suite with Playwright', False, datetime.now(timezone.utc) + timedelta(days=12))
    ]
    for m_title, m_comp, m_due in p1_milestones:
        pm = ProjectMilestone(project_id=project1.id, title=m_title, completed=m_comp, due_date=m_due)
        db.session.add(pm)

    project2 = Project(
        user_id=student.id,
        title='DevForge CLI — Automated Architecture Scaffolder',
        description='Node.js TypeScript CLI tool that scaffolds production-ready fullstack repos with preconfigured CI/CD, Docker, and linting rules.',
        difficulty='Intermediate',
        github_url='https://github.com/ashutosh-dev/devforge-cli',
        live_url='https://npmjs.com/package/devforge-cli',
        status='Completed',
        progress_percent=100,
        image_url='https://images.unsplash.com/photo-1618401471353-b98afee0b2eb?w=600&auto=format&fit=crop&q=80',
        start_date=datetime.now(timezone.utc) - timedelta(days=45),
        end_date=datetime.now(timezone.utc) - timedelta(days=12)
    )
    project2.set_technologies(['TypeScript', 'Node.js', 'Git', 'Docker', 'Testing'])
    db.session.add(project2)
    db.session.flush()

    p2_milestones = [
        ('Interactive CLI terminal prompts with Inquirer', True, datetime.now(timezone.utc) - timedelta(days=35)),
        ('GitHub template cloning & dynamic token injection', True, datetime.now(timezone.utc) - timedelta(days=25)),
        ('Unit tests with Vitest & automated NPM publishing', True, datetime.now(timezone.utc) - timedelta(days=14))
    ]
    for m_title, m_comp, m_due in p2_milestones:
        pm = ProjectMilestone(project_id=project2.id, title=m_title, completed=m_comp, due_date=m_due)
        db.session.add(pm)

    # 11. SEED LEARNING SESSIONS (Past 7 days for weekly activity chart)
    session_logs = [
        (skill_objs['react'].id, 65, 'Built custom hook for debouncing and optimistic mutations', 0),
        (skill_objs['javascript'].id, 45, 'Completed async event loop microtask exercises', 1),
        (skill_objs['postgresql'].id, 50, 'Practiced B-tree index optimizations and EXPLAIN ANALYZE queries', 2),
        (skill_objs['typescript'].id, 40, 'Refactored state machine actions with discriminated unions', 3),
        (skill_objs['react'].id, 55, 'Implemented React 19 transitions in dashboard charts', 4),
        (skill_objs['rest-apis'].id, 30, 'Designed idempotent Stripe webhook handler endpoints', 5),
        (skill_objs['html-css'].id, 25, 'Polished dark mode glassmorphism theme and contrast ratios', 6)
    ]
    for s_id, duration, notes, days_ago in session_logs:
        ls = LearningSession(
            user_id=student.id,
            skill_id=s_id,
            duration_minutes=duration,
            notes=notes,
            session_date=datetime.now(timezone.utc) - timedelta(days=days_ago)
        )
        db.session.add(ls)

    # 12. SEED GOALS
    g1 = Goal(
        user_id=student.id,
        title='Complete Full Stack Roadmap Phase 2 & 3',
        category='Roadmap',
        target_date=datetime.now(timezone.utc) + timedelta(days=24),
        progress_percent=65,
        status='in_progress'
    )
    g1.set_milestones([
        {'title': 'Master React Custom Hooks & Server Actions', 'completed': True},
        {'title': 'Complete TypeScript Generics & Zod Validation', 'completed': True},
        {'title': 'Pass PostgreSQL Indexing Assessment with 80%+', 'completed': False},
        {'title': 'Build and verify JWT auth middleware in Node.js', 'completed': False}
    ])
    db.session.add(g1)

    g2 = Goal(
        user_id=student.id,
        title='Ship PulseFlow to Product Hunt & Reach 100 Live Users',
        category='Project',
        target_date=datetime.now(timezone.utc) + timedelta(days=40),
        progress_percent=45,
        status='in_progress'
    )
    g2.set_milestones([
        {'title': 'Implement WebSocket live telemetry stream', 'completed': True},
        {'title': 'Complete Playwright automated test suite', 'completed': False},
        {'title': 'Deploy multi-region production cluster on Railway/AWS', 'completed': False}
    ])
    db.session.add(g2)

    # 13. SEED BADGES & USER BADGES
    badges_data = [
        ('first-forge', 'First Forge', 'Completed your first skill milestone and assessment verification.', 'Sparkles', 'Milestone', 50),
        ('week-warrior', 'Week Warrior', 'Maintained an unbroken 7-day learning streak on SkillForge.', 'Flame', 'Consistency', 100),
        ('project-builder', 'Project Builder', 'Successfully shipped and verified your first fullstack portfolio project.', 'Rocket', 'Project', 150),
        ('skill-master', 'Skill Master', 'Attained over 90% verified proficiency in a core engineering skill.', 'Award', 'Mastery', 200),
        ('roadmap-finisher', 'Roadmap Finisher', 'Conquered an entire career roadmap from foundation to capstone.', 'Crown', 'Milestone', 500),
        ('polyglot', 'Polyglot Engineer', 'Mastered skills across both frontend UI and distributed backend systems.', 'Zap', 'Mastery', 150),
        ('community-beacon', 'Community Beacon', 'Contributed 5+ verified solutions in the developer community.', 'MessageSquare', 'Community', 100)
    ]

    badge_objs = {}
    for b_slug, b_name, b_desc, b_icon, b_cat, b_pts in badges_data:
        b = Badge(
            slug=b_slug,
            name=b_name,
            description=b_desc,
            icon=b_icon,
            category=b_cat,
            points=b_pts
        )
        db.session.add(b)
        badge_objs[b_slug] = b

    db.session.flush()

    # Unlock first two badges for Ashutosh
    ub1 = UserBadge(user_id=student.id, badge_id=badge_objs['first-forge'].id, unlocked_at=datetime.now(timezone.utc) - timedelta(days=10))
    ub2 = UserBadge(user_id=student.id, badge_id=badge_objs['project-builder'].id, unlocked_at=datetime.now(timezone.utc) - timedelta(days=12))
    db.session.add_all([ub1, ub2])

    # 14. SEED NOTIFICATIONS (Grouped by Today and Earlier)
    notifications_data = [
        (student.id, 'React Hooks Next Best Action Ready', 'Based on your recent JavaScript mastery, React custom hooks has been scheduled as your next focus.', 'recommendation', False, '/roadmap', 0),
        (student.id, '6-Day Streak Alive! 🔥', 'You are one study session away from unlocking the Week Warrior achievement badge.', 'streak', False, '/learning', 0),
        (student.id, 'GitHub Sync Detected Activity', 'Detected 4 new commits in ashutosh-dev/pulseflow-telemetry. Milestones updated.', 'project', True, '/projects', 1),
        (student.id, 'JavaScript Assessment Verified', 'You scored 75% in JavaScript (ES6+) Core. Skill proficiency updated.', 'assessment', True, '/assessments', 3),
        (student.id, 'Welcome to SkillForge!', 'Your personalized Full Stack Developer roadmap has been forged and primed.', 'info', True, '/dashboard', 10)
    ]

    for u_id, n_title, n_msg, n_type, n_read, n_link, days_ago in notifications_data:
        n = Notification(
            user_id=u_id,
            title=n_title,
            message=n_msg,
            type=n_type,
            read=n_read,
            action_link=n_link,
            created_at=datetime.now(timezone.utc) - timedelta(days=days_ago)
        )
        db.session.add(n)

    # 15. SEED COMMUNITY POSTS & COMMENTS
    post1 = Post(
        user_id=student.id,
        title='How I structured zero-runtime design tokens with Tailwind CSS & CSS Variables',
        content='When scaling our dashboard UI, we noticed hardcoded hex values were causing dark mode inconsistencies. By declaring semantic CSS custom properties on :root and extending Tailwind theme tokens, theme transitions became instantaneous with 0 layout shift.',
        tag='Frontend',
        upvotes_count=14,
        created_at=datetime.now(timezone.utc) - timedelta(days=2)
    )
    db.session.add(post1)
    db.session.flush()

    c1 = Comment(
        post_id=post1.id,
        user_id=mentor.id,
        content='Spot on approach Ashutosh! We use this exact token architecture at scale. If you add `color-scheme: dark` at the root, native inputs and scrollbars will automatically match your palette.',
        created_at=datetime.now(timezone.utc) - timedelta(days=1)
    )
    db.session.add(c1)

    post2 = Post(
        user_id=mentor.id,
        title='Why junior backend engineers fail database query interviews (and how to ace them)',
        content='The #1 mistake is querying with `SELECT *` inside loops (N+1 queries). Always demonstrate familiarity with EXPLAIN ANALYZE, composite B-Tree indexes, and cursor-based keyset pagination.',
        tag='Database',
        upvotes_count=38,
        created_at=datetime.now(timezone.utc) - timedelta(days=4)
    )
    db.session.add(post2)

    # 16. SEED MENTOR REQUEST
    m_req = MentorRequest(
        student_id=student.id,
        mentor_id=mentor.id,
        topic='PulseFlow Architecture & PostgreSQL Scaling Review',
        message='Hi Sarah! I am building a real-time developer telemetry SaaS and would love your guidance on partitioning our PostgreSQL event logs and handling WebSocket spikes.',
        preferred_date='This Thursday at 6:00 PM EST',
        status='accepted',
        feedback_notes='Reviewed the database ERD. Advised Ashutosh to implement time-series partitioning and Redis cache-aside for active workspace query telemetry.',
        created_at=datetime.now(timezone.utc) - timedelta(days=5)
    )
    db.session.add(m_req)

    db.session.commit()
    print("[SkillForge] Successfully seeded database with rich realistic data!")

if __name__ == '__main__':
    from app import create_app
    app = create_app('development')
    with app.app_context():
        seed_database()
