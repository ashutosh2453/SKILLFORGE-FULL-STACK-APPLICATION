from datetime import datetime, timezone
import json
from flask_sqlalchemy import SQLAlchemy
from werkzeug.security import generate_password_hash, check_password_hash

db = SQLAlchemy()

class User(db.Model):
    __tablename__ = 'users'

    id = db.Column(db.Integer, primary_key=True)
    email = db.Column(db.String(120), unique=True, nullable=False, index=True)
    username = db.Column(db.String(80), unique=True, nullable=False, index=True)
    password_hash = db.Column(db.String(256), nullable=False)
    role = db.Column(db.String(20), default='student', nullable=False) # student, mentor, admin
    is_active = db.Column(db.Boolean, default=True)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    updated_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc), onupdate=lambda: datetime.now(timezone.utc))

    # Relationships
    profile = db.relationship('Profile', backref='user', uselist=False, cascade='all, delete-orphan')
    user_skills = db.relationship('UserSkill', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    resource_progresses = db.relationship('ResourceProgress', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    assessment_attempts = db.relationship('AssessmentAttempt', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    projects = db.relationship('Project', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    learning_sessions = db.relationship('LearningSession', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    goals = db.relationship('Goal', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    user_badges = db.relationship('UserBadge', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    notifications = db.relationship('Notification', backref='user', lazy='dynamic', cascade='all, delete-orphan')
    posts = db.relationship('Post', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    comments = db.relationship('Comment', backref='author', lazy='dynamic', cascade='all, delete-orphan')
    mentor_profile = db.relationship('MentorProfile', backref='user', uselist=False, cascade='all, delete-orphan')
    student_mentor_requests = db.relationship('MentorRequest', foreign_keys='MentorRequest.student_id', backref='student', lazy='dynamic', cascade='all, delete-orphan')
    mentor_received_requests = db.relationship('MentorRequest', foreign_keys='MentorRequest.mentor_id', backref='mentor', lazy='dynamic', cascade='all, delete-orphan')

    def set_password(self, password):
        self.password_hash = generate_password_hash(password)

    def check_password(self, password):
        return check_password_hash(self.password_hash, password)

    def to_dict(self):
        return {
            'id': self.id,
            'email': self.email,
            'username': self.username,
            'role': self.role,
            'created_at': self.created_at.isoformat() if self.created_at else None,
            'profile': self.profile.to_dict() if self.profile else None
        }


class Profile(db.Model):
    __tablename__ = 'profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    full_name = db.Column(db.String(120), default='')
    headline = db.Column(db.String(255), default='')
    bio = db.Column(db.Text, default='')
    avatar_url = db.Column(db.String(255), default='')
    target_career_id = db.Column(db.Integer, db.ForeignKey('careers.id', ondelete='SET NULL'), nullable=True)
    experience_level = db.Column(db.String(50), default='beginner') # beginner, intermediate, advanced
    learning_style = db.Column(db.String(50), default='mixed') # videos, reading, projects, practice, mixed
    hours_per_week = db.Column(db.Integer, default=10)
    current_streak = db.Column(db.Integer, default=0)
    longest_streak = db.Column(db.Integer, default=0)
    total_learning_minutes = db.Column(db.Integer, default=0)
    github_username = db.Column(db.String(100), default='')
    onboarding_completed = db.Column(db.Boolean, default=False)
    theme_preference = db.Column(db.String(20), default='dark')

    target_career = db.relationship('Career', backref='aspiring_users')

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'full_name': self.full_name,
            'headline': self.headline,
            'bio': self.bio,
            'avatar_url': self.avatar_url,
            'target_career_id': self.target_career_id,
            'target_career': self.target_career.to_dict() if self.target_career else None,
            'experience_level': self.experience_level,
            'learning_style': self.learning_style,
            'hours_per_week': self.hours_per_week,
            'current_streak': self.current_streak,
            'longest_streak': self.longest_streak,
            'total_learning_minutes': self.total_learning_minutes,
            'github_username': self.github_username,
            'onboarding_completed': self.onboarding_completed,
            'theme_preference': self.theme_preference
        }


class Career(db.Model):
    __tablename__ = 'careers'

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False, index=True)
    title = db.Column(db.String(120), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(80), default='Code')
    category = db.Column(db.String(80), default='Engineering')
    average_salary = db.Column(db.String(50), default='$115,000 / yr')
    estimated_months = db.Column(db.Integer, default=6)
    demand_level = db.Column(db.String(20), default='High') # High, Very High, Steady
    difficulty = db.Column(db.String(20), default='Intermediate') # Beginner, Intermediate, Advanced

    # Relationships
    skills_required = db.relationship('CareerSkill', backref='career', lazy='dynamic', cascade='all, delete-orphan')
    roadmaps = db.relationship('Roadmap', backref='career', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'title': self.title,
            'description': self.description,
            'icon': self.icon,
            'category': self.category,
            'average_salary': self.average_salary,
            'estimated_months': self.estimated_months,
            'demand_level': self.demand_level,
            'difficulty': self.difficulty
        }


class Skill(db.Model):
    __tablename__ = 'skills'

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False, index=True)
    name = db.Column(db.String(100), nullable=False)
    category = db.Column(db.String(60), nullable=False, index=True) # Frontend, Backend, Database, DevOps, AI/ML, Programming, Tools, Soft Skills
    description = db.Column(db.Text, default='')
    icon = db.Column(db.String(80), default='Zap')
    tags = db.Column(db.Text, default='[]') # JSON array string

    # Relationships
    career_associations = db.relationship('CareerSkill', backref='skill', lazy='dynamic', cascade='all, delete-orphan')
    user_proficiencies = db.relationship('UserSkill', backref='skill', lazy='dynamic', cascade='all, delete-orphan')
    resources = db.relationship('Resource', backref='skill', lazy='dynamic', cascade='all, delete-orphan')
    assessments = db.relationship('Assessment', backref='skill', lazy='dynamic', cascade='all, delete-orphan')
    learning_sessions = db.relationship('LearningSession', backref='skill', lazy='dynamic')

    def get_tags(self):
        try:
            return json.loads(self.tags)
        except Exception:
            return []

    def set_tags(self, tags_list):
        self.tags = json.dumps(tags_list)

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'name': self.name,
            'category': self.category,
            'description': self.description,
            'icon': self.icon,
            'tags': self.get_tags()
        }


class CareerSkill(db.Model):
    __tablename__ = 'career_skills'

    id = db.Column(db.Integer, primary_key=True)
    career_id = db.Column(db.Integer, db.ForeignKey('careers.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    target_proficiency = db.Column(db.Integer, default=80) # 0 - 100 %
    importance = db.Column(db.String(20), default='core') # core, recommended, optional
    weight = db.Column(db.Float, default=1.0)

    def to_dict(self):
        return {
            'id': self.id,
            'career_id': self.career_id,
            'skill_id': self.skill_id,
            'skill': self.skill.to_dict() if self.skill else None,
            'target_proficiency': self.target_proficiency,
            'importance': self.importance,
            'weight': self.weight
        }


class UserSkill(db.Model):
    __tablename__ = 'user_skills'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    current_proficiency = db.Column(db.Integer, default=0) # 0 - 100 %
    verified = db.Column(db.Boolean, default=False)
    last_practiced_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    assessment_score = db.Column(db.Integer, default=0)
    level_label = db.Column(db.String(30), default='Novice') # Novice, Beginner, Intermediate, Advanced, Master

    __table_args__ = (db.UniqueConstraint('user_id', 'skill_id', name='uq_user_skill'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skill_id': self.skill_id,
            'skill': self.skill.to_dict() if self.skill else None,
            'current_proficiency': self.current_proficiency,
            'verified': self.verified,
            'last_practiced_at': self.last_practiced_at.isoformat() if self.last_practiced_at else None,
            'assessment_score': self.assessment_score,
            'level_label': self.level_label
        }


class Roadmap(db.Model):
    __tablename__ = 'roadmaps'

    id = db.Column(db.Integer, primary_key=True)
    career_id = db.Column(db.Integer, db.ForeignKey('careers.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, default='')
    version = db.Column(db.String(20), default='2026.1')
    total_steps = db.Column(db.Integer, default=0)

    steps = db.relationship('RoadmapStep', backref='roadmap', lazy='dynamic', cascade='all, delete-orphan', order_by='RoadmapStep.step_order')

    def to_dict(self):
        return {
            'id': self.id,
            'career_id': self.career_id,
            'title': self.title,
            'description': self.description,
            'version': self.version,
            'total_steps': self.total_steps
        }


class RoadmapStep(db.Model):
    __tablename__ = 'roadmap_steps'

    id = db.Column(db.Integer, primary_key=True)
    roadmap_id = db.Column(db.Integer, db.ForeignKey('roadmaps.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='SET NULL'), nullable=True)
    step_order = db.Column(db.Integer, nullable=False) # 1, 2, 3...
    stage_name = db.Column(db.String(100), default='Foundation') # Foundation, Core Development, Advanced, Specialization, Capstone
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, default='')
    node_type = db.Column(db.String(30), default='skill') # skill, milestone, capstone
    prerequisites = db.Column(db.Text, default='[]') # JSON array of step_order or skill_ids
    topics = db.Column(db.Text, default='[]') # JSON array of topic items {title, completed}
    estimated_hours = db.Column(db.Integer, default=20)
    grid_x = db.Column(db.Integer, default=0) # Graph layout coordinates
    grid_y = db.Column(db.Integer, default=0)

    skill = db.relationship('Skill')

    def get_prerequisites(self):
        try:
            return json.loads(self.prerequisites)
        except Exception:
            return []

    def set_prerequisites(self, prereqs):
        self.prerequisites = json.dumps(prereqs)

    def get_topics(self):
        try:
            return json.loads(self.topics)
        except Exception:
            return []

    def set_topics(self, topics_list):
        self.topics = json.dumps(topics_list)

    def to_dict(self):
        return {
            'id': self.id,
            'roadmap_id': self.roadmap_id,
            'skill_id': self.skill_id,
            'skill': self.skill.to_dict() if self.skill else None,
            'step_order': self.step_order,
            'stage_name': self.stage_name,
            'title': self.title,
            'description': self.description,
            'node_type': self.node_type,
            'prerequisites': self.get_prerequisites(),
            'topics': self.get_topics(),
            'estimated_hours': self.estimated_hours,
            'grid_x': self.grid_x,
            'grid_y': self.grid_y
        }


class Resource(db.Model):
    __tablename__ = 'resources'

    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    description = db.Column(db.Text, default='')
    url = db.Column(db.String(500), nullable=False)
    type = db.Column(db.String(50), default='Article') # Video, Article, Documentation, Course, Practice, Project
    difficulty = db.Column(db.String(30), default='Beginner') # Beginner, Intermediate, Advanced
    duration_mins = db.Column(db.Integer, default=30)
    provider = db.Column(db.String(100), default='SkillForge Curated')
    rating = db.Column(db.Float, default=4.8)
    is_free = db.Column(db.Boolean, default=True)

    progresses = db.relationship('ResourceProgress', backref='resource', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'skill_id': self.skill_id,
            'skill_name': self.skill.name if self.skill else None,
            'skill_category': self.skill.category if self.skill else None,
            'title': self.title,
            'description': self.description,
            'url': self.url,
            'type': self.type,
            'difficulty': self.difficulty,
            'duration_mins': self.duration_mins,
            'provider': self.provider,
            'rating': self.rating,
            'is_free': self.is_free
        }


class ResourceProgress(db.Model):
    __tablename__ = 'resource_progress'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    resource_id = db.Column(db.Integer, db.ForeignKey('resources.id', ondelete='CASCADE'), nullable=False)
    status = db.Column(db.String(30), default='saved') # saved, in_progress, completed
    completed_at = db.Column(db.DateTime, nullable=True)
    notes = db.Column(db.Text, default='')

    __table_args__ = (db.UniqueConstraint('user_id', 'resource_id', name='uq_user_resource'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'resource_id': self.resource_id,
            'status': self.status,
            'completed_at': self.completed_at.isoformat() if self.completed_at else None,
            'notes': self.notes,
            'resource': self.resource.to_dict() if self.resource else None
        }


class Assessment(db.Model):
    __tablename__ = 'assessments'

    id = db.Column(db.Integer, primary_key=True)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, default='')
    difficulty = db.Column(db.String(30), default='Intermediate')
    time_limit_mins = db.Column(db.Integer, default=15)
    pass_score = db.Column(db.Integer, default=70) # 70%

    questions = db.relationship('Question', backref='assessment', lazy='dynamic', cascade='all, delete-orphan')
    attempts = db.relationship('AssessmentAttempt', backref='assessment', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, include_questions_count=True):
        data = {
            'id': self.id,
            'skill_id': self.skill_id,
            'skill_name': self.skill.name if self.skill else None,
            'title': self.title,
            'description': self.description,
            'difficulty': self.difficulty,
            'time_limit_mins': self.time_limit_mins,
            'pass_score': self.pass_score
        }
        if include_questions_count:
            data['total_questions'] = self.questions.count()
        return data


class Question(db.Model):
    __tablename__ = 'questions'

    id = db.Column(db.Integer, primary_key=True)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id', ondelete='CASCADE'), nullable=False)
    question_text = db.Column(db.Text, nullable=False)
    question_type = db.Column(db.String(30), default='mcq') # mcq, true_false, code_output, scenario
    code_snippet = db.Column(db.Text, nullable=True)
    options = db.Column(db.Text, nullable=False) # JSON array of strings
    correct_answer = db.Column(db.String(255), nullable=False)
    explanation = db.Column(db.Text, default='')
    concept_tag = db.Column(db.String(100), default='General')

    def get_options(self):
        try:
            return json.loads(self.options)
        except Exception:
            return []

    def set_options(self, options_list):
        self.options = json.dumps(options_list)

    def to_dict(self, include_answer=False):
        data = {
            'id': self.id,
            'assessment_id': self.assessment_id,
            'question_text': self.question_text,
            'question_type': self.question_type,
            'code_snippet': self.code_snippet,
            'options': self.get_options(),
            'concept_tag': self.concept_tag
        }
        if include_answer:
            data['correct_answer'] = self.correct_answer
            data['explanation'] = self.explanation
        return data


class AssessmentAttempt(db.Model):
    __tablename__ = 'assessment_attempts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    assessment_id = db.Column(db.Integer, db.ForeignKey('assessments.id', ondelete='CASCADE'), nullable=False)
    score = db.Column(db.Integer, nullable=False) # percentage 0-100
    total_questions = db.Column(db.Integer, default=0)
    correct_count = db.Column(db.Integer, default=0)
    passed = db.Column(db.Boolean, default=False)
    strong_concepts = db.Column(db.Text, default='[]') # JSON array of concepts
    weak_concepts = db.Column(db.Text, default='[]') # JSON array of concepts
    answers = db.Column(db.Text, default='[]') # JSON breakdown of questions, user choices, correctness
    completed_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def get_strong_concepts(self):
        try:
            return json.loads(self.strong_concepts)
        except Exception:
            return []

    def get_weak_concepts(self):
        try:
            return json.loads(self.weak_concepts)
        except Exception:
            return []

    def get_answers(self):
        try:
            return json.loads(self.answers)
        except Exception:
            return []

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'assessment_id': self.assessment_id,
            'assessment_title': self.assessment.title if self.assessment else None,
            'skill_name': self.assessment.skill.name if self.assessment and self.assessment.skill else None,
            'score': self.score,
            'total_questions': self.total_questions,
            'correct_count': self.correct_count,
            'passed': self.passed,
            'strong_concepts': self.get_strong_concepts(),
            'weak_concepts': self.get_weak_concepts(),
            'answers': self.get_answers(),
            'completed_at': self.completed_at.isoformat() if self.completed_at else None
        }


class Project(db.Model):
    __tablename__ = 'projects'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    description = db.Column(db.Text, default='')
    technologies = db.Column(db.Text, default='[]') # JSON array of string skill tags
    difficulty = db.Column(db.String(30), default='Intermediate') # Beginner, Intermediate, Advanced, Capstone
    github_url = db.Column(db.String(255), default='')
    live_url = db.Column(db.String(255), default='')
    status = db.Column(db.String(30), default='Building') # Idea, Planning, Building, Completed
    progress_percent = db.Column(db.Integer, default=0)
    image_url = db.Column(db.String(255), default='')
    start_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))
    end_date = db.Column(db.DateTime, nullable=True)

    milestones = db.relationship('ProjectMilestone', backref='project', lazy='dynamic', cascade='all, delete-orphan')

    def get_technologies(self):
        try:
            return json.loads(self.technologies)
        except Exception:
            return []

    def set_technologies(self, tech_list):
        self.technologies = json.dumps(tech_list)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'description': self.description,
            'technologies': self.get_technologies(),
            'difficulty': self.difficulty,
            'github_url': self.github_url,
            'live_url': self.live_url,
            'status': self.status,
            'progress_percent': self.progress_percent,
            'image_url': self.image_url,
            'start_date': self.start_date.isoformat() if self.start_date else None,
            'end_date': self.end_date.isoformat() if self.end_date else None,
            'milestones': [m.to_dict() for m in self.milestones]
        }


class ProjectMilestone(db.Model):
    __tablename__ = 'project_milestones'

    id = db.Column(db.Integer, primary_key=True)
    project_id = db.Column(db.Integer, db.ForeignKey('projects.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    completed = db.Column(db.Boolean, default=False)
    due_date = db.Column(db.DateTime, nullable=True)

    def to_dict(self):
        return {
            'id': self.id,
            'project_id': self.project_id,
            'title': self.title,
            'completed': self.completed,
            'due_date': self.due_date.isoformat() if self.due_date else None
        }


class LearningSession(db.Model):
    __tablename__ = 'learning_sessions'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    skill_id = db.Column(db.Integer, db.ForeignKey('skills.id', ondelete='SET NULL'), nullable=True)
    duration_minutes = db.Column(db.Integer, default=30)
    notes = db.Column(db.Text, default='')
    session_date = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'skill_id': self.skill_id,
            'skill_name': self.skill.name if self.skill else 'General Study',
            'duration_minutes': self.duration_minutes,
            'notes': self.notes,
            'session_date': self.session_date.isoformat() if self.session_date else None
        }


class Goal(db.Model):
    __tablename__ = 'goals'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(200), nullable=False)
    category = db.Column(db.String(50), default='Skill') # Skill, Project, Career, Study
    target_date = db.Column(db.DateTime, nullable=False)
    progress_percent = db.Column(db.Integer, default=0)
    status = db.Column(db.String(30), default='in_progress') # in_progress, completed, paused
    milestones = db.Column(db.Text, default='[]') # JSON array of {title, completed}
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def get_milestones(self):
        try:
            return json.loads(self.milestones)
        except Exception:
            return []

    def set_milestones(self, items):
        self.milestones = json.dumps(items)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'category': self.category,
            'target_date': self.target_date.isoformat() if self.target_date else None,
            'progress_percent': self.progress_percent,
            'status': self.status,
            'milestones': self.get_milestones(),
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Badge(db.Model):
    __tablename__ = 'badges'

    id = db.Column(db.Integer, primary_key=True)
    slug = db.Column(db.String(80), unique=True, nullable=False)
    name = db.Column(db.String(100), nullable=False)
    description = db.Column(db.Text, nullable=False)
    icon = db.Column(db.String(80), default='Award')
    category = db.Column(db.String(50), default='Mastery') # Milestone, Consistency, Mastery, Project, Community
    points = db.Column(db.Integer, default=50)

    user_badges = db.relationship('UserBadge', backref='badge', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self):
        return {
            'id': self.id,
            'slug': self.slug,
            'name': self.name,
            'description': self.description,
            'icon': self.icon,
            'category': self.category,
            'points': self.points
        }


class UserBadge(db.Model):
    __tablename__ = 'user_badges'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    badge_id = db.Column(db.Integer, db.ForeignKey('badges.id', ondelete='CASCADE'), nullable=False)
    unlocked_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    __table_args__ = (db.UniqueConstraint('user_id', 'badge_id', name='uq_user_badge'),)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'badge_id': self.badge_id,
            'badge': self.badge.to_dict() if self.badge else None,
            'unlocked_at': self.unlocked_at.isoformat() if self.unlocked_at else None
        }


class Notification(db.Model):
    __tablename__ = 'notifications'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(150), nullable=False)
    message = db.Column(db.Text, nullable=False)
    type = db.Column(db.String(40), default='info') # assessment, streak, project, recommendation, achievement, info
    read = db.Column(db.Boolean, default=False)
    action_link = db.Column(db.String(255), default='')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'title': self.title,
            'message': self.message,
            'type': self.type,
            'read': self.read,
            'action_link': self.action_link,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Post(db.Model):
    __tablename__ = 'posts'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    title = db.Column(db.String(255), nullable=False)
    content = db.Column(db.Text, nullable=False)
    tag = db.Column(db.String(50), default='General') # React, Python, Backend, Frontend, Career, AI, SQL
    upvotes_count = db.Column(db.Integer, default=0)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    comments = db.relationship('Comment', backref='post', lazy='dynamic', cascade='all, delete-orphan', order_by='Comment.created_at.asc()')
    votes = db.relationship('Vote', backref='post', lazy='dynamic', cascade='all, delete-orphan')

    def to_dict(self, current_user_id=None):
        has_upvoted = False
        if current_user_id:
            has_upvoted = Vote.query.filter_by(post_id=self.id, user_id=current_user_id).first() is not None

        return {
            'id': self.id,
            'user_id': self.user_id,
            'author_username': self.author.username if self.author else 'Anonymous',
            'author_headline': self.author.profile.headline if self.author and self.author.profile else '',
            'author_avatar': self.author.profile.avatar_url if self.author and self.author.profile else '',
            'title': self.title,
            'content': self.content,
            'tag': self.tag,
            'upvotes_count': self.upvotes_count,
            'comments_count': self.comments.count(),
            'has_upvoted': has_upvoted,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Comment(db.Model):
    __tablename__ = 'comments'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    content = db.Column(db.Text, nullable=False)
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'post_id': self.post_id,
            'user_id': self.user_id,
            'author_username': self.author.username if self.author else 'Anonymous',
            'author_avatar': self.author.profile.avatar_url if self.author and self.author.profile else '',
            'content': self.content,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }


class Vote(db.Model):
    __tablename__ = 'votes'

    id = db.Column(db.Integer, primary_key=True)
    post_id = db.Column(db.Integer, db.ForeignKey('posts.id', ondelete='CASCADE'), nullable=False)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    vote_type = db.Column(db.String(10), default='up') # up

    __table_args__ = (db.UniqueConstraint('post_id', 'user_id', name='uq_post_user_vote'),)


class MentorProfile(db.Model):
    __tablename__ = 'mentor_profiles'

    id = db.Column(db.Integer, primary_key=True)
    user_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False, unique=True)
    company = db.Column(db.String(100), default='')
    role_title = db.Column(db.String(100), default='Senior Staff Engineer')
    bio = db.Column(db.Text, default='')
    expertise_tags = db.Column(db.Text, default='[]') # JSON array
    years_experience = db.Column(db.Integer, default=5)
    hourly_rate = db.Column(db.String(40), default='Free for Students')
    rating = db.Column(db.Float, default=4.9)
    total_reviews = db.Column(db.Integer, default=24)
    availability = db.Column(db.String(50), default='Available this week')

    def get_expertise(self):
        try:
            return json.loads(self.expertise_tags)
        except Exception:
            return []

    def set_expertise(self, tags):
        self.expertise_tags = json.dumps(tags)

    def to_dict(self):
        return {
            'id': self.id,
            'user_id': self.user_id,
            'name': self.user.profile.full_name if self.user and self.user.profile else self.user.username,
            'avatar_url': self.user.profile.avatar_url if self.user and self.user.profile else '',
            'company': self.company,
            'role_title': self.role_title,
            'bio': self.bio,
            'expertise': self.get_expertise(),
            'years_experience': self.years_experience,
            'hourly_rate': self.hourly_rate,
            'rating': self.rating,
            'total_reviews': self.total_reviews,
            'availability': self.availability
        }


class MentorRequest(db.Model):
    __tablename__ = 'mentor_requests'

    id = db.Column(db.Integer, primary_key=True)
    student_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    mentor_id = db.Column(db.Integer, db.ForeignKey('users.id', ondelete='CASCADE'), nullable=False)
    topic = db.Column(db.String(150), default='Roadmap & Project Code Review')
    message = db.Column(db.Text, nullable=False)
    preferred_date = db.Column(db.String(100), default='')
    status = db.Column(db.String(30), default='pending') # pending, accepted, rejected, completed
    feedback_notes = db.Column(db.Text, default='')
    created_at = db.Column(db.DateTime, default=lambda: datetime.now(timezone.utc))

    def to_dict(self):
        return {
            'id': self.id,
            'student_id': self.student_id,
            'student_name': self.student.profile.full_name if self.student and self.student.profile else self.student.username,
            'mentor_id': self.mentor_id,
            'mentor_name': self.mentor.profile.full_name if self.mentor and self.mentor.profile else self.mentor.username,
            'topic': self.topic,
            'message': self.message,
            'preferred_date': self.preferred_date,
            'status': self.status,
            'feedback_notes': self.feedback_notes,
            'created_at': self.created_at.isoformat() if self.created_at else None
        }
