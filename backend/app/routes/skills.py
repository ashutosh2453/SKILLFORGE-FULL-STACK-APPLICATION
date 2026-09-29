from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, Skill, UserSkill, User, Profile, Career, CareerSkill, Resource, Assessment, AssessmentAttempt
from app.services.gap_analyzer import GapAnalyzer

skills_bp = Blueprint('skills', __name__, url_prefix='/api/skills')

@skills_bp.route('', methods=['GET'])
def get_skills():
    category = request.args.get('category')
    search = request.args.get('search', '').strip().lower()

    query = Skill.query
    if category and category.lower() != 'all':
        query = query.filter_by(category=category)
    if search:
        query = query.filter(Skill.name.ilike(f'%{search}%') | Skill.description.ilike(f'%{search}%'))

    skills = query.all()
    return jsonify({'skills': [s.to_dict() for s in skills]}), 200


@skills_bp.route('/<int:skill_id>', methods=['GET'])
@jwt_required(optional=True)
def get_skill_detail(skill_id):
    skill = Skill.query.get(skill_id)
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404

    data = skill.to_dict()
    
    # Resources
    resources = Resource.query.filter_by(skill_id=skill.id).all()
    data['resources'] = [r.to_dict() for r in resources]

    # Assessment
    assessment = Assessment.query.filter_by(skill_id=skill.id).first()
    data['assessment'] = assessment.to_dict() if assessment else None

    # User context if logged in
    user_id = get_jwt_identity()
    if user_id:
        user_id = int(user_id)
        user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=skill.id).first()
        data['user_proficiency'] = user_skill.to_dict() if user_skill else {
            'current_proficiency': 0,
            'verified': False,
            'assessment_score': 0,
            'level_label': 'Novice'
        }
        if assessment:
            latest_attempt = AssessmentAttempt.query.filter_by(
                user_id=user_id, assessment_id=assessment.id
            ).order_by(AssessmentAttempt.completed_at.desc()).first()
            data['latest_attempt'] = latest_attempt.to_dict() if latest_attempt else None

    return jsonify({'skill': data}), 200


@skills_bp.route('/matrix', methods=['GET'])
@jwt_required()
def get_user_skill_matrix():
    user_id = int(get_jwt_identity())
    user_skills = UserSkill.query.filter_by(user_id=user_id).all()
    user_map = {us.skill_id: us for us in user_skills}

    all_skills = Skill.query.all()
    grouped = {}

    for s in all_skills:
        cat = s.category or 'General'
        if cat not in grouped:
            grouped[cat] = []

        us = user_map.get(s.id)
        grouped[cat].append({
            'skill_id': s.id,
            'slug': s.slug,
            'name': s.name,
            'icon': s.icon,
            'description': s.description,
            'category': cat,
            'current_proficiency': us.current_proficiency if us else 0,
            'verified': us.verified if us else False,
            'assessment_score': us.assessment_score if us else 0,
            'level_label': us.level_label if us else 'Novice',
            'last_practiced_at': us.last_practiced_at.isoformat() if us and us.last_practiced_at else None
        })

    return jsonify({'categories': grouped}), 200


@skills_bp.route('/gap-analysis', methods=['GET'])
@jwt_required()
def get_gap_analysis():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    career_id = request.args.get('career_id')
    if not career_id and user.profile:
        career_id = user.profile.target_career_id

    if not career_id:
        career = Career.query.first()
        career_id = career.id if career else 1

    gap_data = GapAnalyzer.analyze_user_career_gap(user_id, int(career_id))
    if not gap_data:
        return jsonify({'error': 'Career not found'}), 404

    return jsonify({'gap_analysis': gap_data}), 200


@skills_bp.route('/update-level', methods=['POST'])
@jwt_required()
def update_skill_level():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    skill_id = data.get('skill_id')
    proficiency = data.get('proficiency')

    if skill_id is None or proficiency is None:
        return jsonify({'error': 'skill_id and proficiency are required'}), 400

    proficiency = max(0, min(100, int(proficiency)))
    user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=skill_id).first()

    if not user_skill:
        user_skill = UserSkill(user_id=user_id, skill_id=skill_id)
        db.session.add(user_skill)

    user_skill.current_proficiency = proficiency
    if proficiency >= 85:
        user_skill.level_label = 'Master'
    elif proficiency >= 70:
        user_skill.level_label = 'Advanced'
    elif proficiency >= 50:
        user_skill.level_label = 'Intermediate'
    elif proficiency >= 25:
        user_skill.level_label = 'Beginner'
    else:
        user_skill.level_label = 'Novice'

    db.session.commit()
    return jsonify({
        'message': 'Skill proficiency updated',
        'user_skill': user_skill.to_dict()
    }), 200
