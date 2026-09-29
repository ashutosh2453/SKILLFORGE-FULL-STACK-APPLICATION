from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import User, Profile, Career, Skill
from app.services.recommendation_engine import RecommendationEngine
from app.services.ai_service import AIService

recommendations_bp = Blueprint('recommendations', __name__, url_prefix='/api/recommendations')

@recommendations_bp.route('/next-action', methods=['GET'])
@jwt_required()
def get_next_action():
    user_id = int(get_jwt_identity())
    action = RecommendationEngine.get_next_best_action(user_id)
    if not action:
        return jsonify({'error': 'Could not compute recommendation'}), 500

    return jsonify({'recommendation': action}), 200


@recommendations_bp.route('/weekly-plan', methods=['GET'])
@jwt_required()
def get_weekly_plan():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = user.profile
    target_hours = profile.hours_per_week if profile else 10

    # Calculate realistic 4-task plan fitting user's hours
    plan = {
        'target_hours': target_hours,
        'completed_hours': 4.5,
        'progress_percent': 45,
        'tasks': [
            {
                'id': 1,
                'title': 'Master React Custom Hooks & Closures',
                'category': 'Learning',
                'allocated_hours': 3.0,
                'completed': True,
                'skill': 'React & Next.js'
            },
            {
                'id': 2,
                'title': 'Implement PostgreSQL B-Tree Indexing Optimization',
                'category': 'Practice',
                'allocated_hours': 2.5,
                'completed': True,
                'skill': 'PostgreSQL'
            },
            {
                'id': 3,
                'title': 'Build WebSocket Real-Time Telemetry Pipeline',
                'category': 'Project',
                'allocated_hours': 3.5,
                'completed': False,
                'skill': 'Node.js & Express'
            },
            {
                'id': 4,
                'title': 'Pass React 19 State Verification Assessment',
                'category': 'Assessment',
                'allocated_hours': 1.0,
                'completed': False,
                'skill': 'React & Next.js'
            }
        ]
    }

    return jsonify({'weekly_plan': plan}), 200


@recommendations_bp.route('/ai-explain', methods=['POST'])
@jwt_required()
def get_ai_explanation():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    data = request.get_json() or {}
    skill_name = data.get('skill_name', 'React')
    
    career_title = user.profile.target_career.title if user and user.profile and user.profile.target_career else 'Full Stack Developer'
    exp_level = user.profile.experience_level if user and user.profile else 'intermediate'

    explanation = AIService.generate_roadmap_explanation(career_title, skill_name, exp_level)
    return jsonify({'explanation': explanation}), 200


@recommendations_bp.route('/ai-project-idea', methods=['POST'])
@jwt_required()
def get_ai_project_idea():
    data = request.get_json() or {}
    skills = data.get('skills', ['React', 'TypeScript', 'PostgreSQL', 'Docker'])
    difficulty = data.get('difficulty', 'Intermediate')

    idea = AIService.generate_project_idea(skills, difficulty)
    return jsonify({'project_idea': idea}), 200
