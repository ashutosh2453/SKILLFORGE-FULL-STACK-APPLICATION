from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
from app.models import (
    User, Profile, Career, Skill, UserSkill,
    Project, AssessmentAttempt, LearningSession
)
from app.services.readiness_calculator import ReadinessCalculator
from app.services.gap_analyzer import GapAnalyzer

analytics_bp = Blueprint('analytics', __name__, url_prefix='/api/analytics')

@analytics_bp.route('/overview', methods=['GET'])
@jwt_required()
def get_analytics_overview():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = user.profile
    career_id = profile.target_career_id if profile else None
    if not career_id:
        c = Career.query.first()
        career_id = c.id if c else 1

    # 1. Career Readiness Index
    readiness = ReadinessCalculator.calculate_user_readiness(user_id)

    # 2. Skill Gap Analysis
    gap_data = GapAnalyzer.analyze_user_career_gap(user_id, career_id)

    # 3. Category Proficiency Breakdown (Radar Chart)
    all_user_skills = UserSkill.query.filter_by(user_id=user_id).all()
    categories = ['Frontend', 'Backend', 'Database', 'DevOps', 'AI/ML', 'System Design', 'Soft Skills']
    radar_data = []

    for cat in categories:
        cat_skills = [us for us in all_user_skills if us.skill and us.skill.category == cat]
        avg_score = round(sum(s.current_proficiency for s in cat_skills) / len(cat_skills)) if cat_skills else 20
        radar_data.append({
            'category': cat,
            'current': avg_score,
            'target': 85,
            'fullMark': 100
        })

    # 4. Assessment History Timeline
    attempts = AssessmentAttempt.query.filter_by(user_id=user_id).order_by(AssessmentAttempt.completed_at.asc()).all()
    timeline_data = []
    for a in attempts:
        timeline_data.append({
            'date': a.completed_at.strftime('%b %d') if a.completed_at else 'Recent',
            'score': a.score,
            'title': a.assessment.title if a.assessment else 'Assessment',
            'passed': a.passed
        })

    # 5. Summary Metrics
    total_hours = round((profile.total_learning_minutes if profile else 0) / 60, 1)
    skills_mastered = sum(1 for us in all_user_skills if us.current_proficiency >= 80)
    projects_completed = Project.query.filter_by(user_id=user_id, status='Completed').count()

    return jsonify({
        'readiness': readiness,
        'gap_summary': {
            'overall_proficiency_pct': gap_data['overall_proficiency_pct'] if gap_data else 0,
            'critical_gaps': gap_data['critical_count'] if gap_data else 0,
            'moderate_gaps': gap_data['moderate_count'] if gap_data else 0,
            'strong_skills': gap_data['strong_count'] if gap_data else 0,
            'skills_list': gap_data['skills'] if gap_data else []
        },
        'radar_chart': radar_data,
        'assessment_timeline': timeline_data,
        'metrics': {
            'total_hours': total_hours,
            'current_streak': profile.current_streak if profile else 0,
            'longest_streak': profile.longest_streak if profile else 0,
            'skills_mastered': skills_mastered,
            'total_skills_tracked': len(all_user_skills),
            'projects_completed': projects_completed
        }
    }), 200
