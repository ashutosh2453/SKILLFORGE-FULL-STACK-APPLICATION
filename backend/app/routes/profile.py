from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Profile, Career, Skill, UserSkill, CareerSkill

profile_bp = Blueprint('profile', __name__, url_prefix='/api/profile')

@profile_bp.route('', methods=['GET'])
@jwt_required()
def get_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = user.profile
    if not profile:
        profile = Profile(user_id=user.id)
        db.session.add(profile)
        db.session.commit()

    return jsonify({
        'user': user.to_dict(),
        'profile': profile.to_dict()
    }), 200


@profile_bp.route('', methods=['PUT'])
@jwt_required()
def update_profile():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    profile = user.profile
    data = request.get_json() or {}

    if 'full_name' in data:
        profile.full_name = data['full_name']
    if 'headline' in data:
        profile.headline = data['headline']
    if 'bio' in data:
        profile.bio = data['bio']
    if 'avatar_url' in data:
        profile.avatar_url = data['avatar_url']
    if 'target_career_id' in data:
        profile.target_career_id = data['target_career_id']
    if 'experience_level' in data:
        profile.experience_level = data['experience_level']
    if 'learning_style' in data:
        profile.learning_style = data['learning_style']
    if 'hours_per_week' in data:
        profile.hours_per_week = int(data['hours_per_week'])
    if 'github_username' in data:
        profile.github_username = data['github_username']
    if 'theme_preference' in data:
        profile.theme_preference = data['theme_preference']

    db.session.commit()
    return jsonify({
        'message': 'Profile updated successfully',
        'profile': profile.to_dict()
    }), 200


@profile_bp.route('/onboarding', methods=['POST'])
@jwt_required()
def complete_onboarding():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    career_id = data.get('target_career_id')
    initial_skills = data.get('known_skills', []) # list of skill_ids or slugs
    experience_level = data.get('experience_level', 'beginner')
    learning_style = data.get('learning_style', 'mixed')
    hours_per_week = int(data.get('hours_per_week', 10))

    profile = user.profile
    if career_id:
        profile.target_career_id = career_id
    profile.experience_level = experience_level
    profile.learning_style = learning_style
    profile.hours_per_week = hours_per_week
    profile.onboarding_completed = True

    # Initialize known skills
    for item in initial_skills:
        skill_id = item if isinstance(item, int) else None
        if not skill_id:
            s = Skill.query.filter_by(slug=str(item)).first()
            if s:
                skill_id = s.id

        if skill_id:
            existing = UserSkill.query.filter_by(user_id=user.id, skill_id=skill_id).first()
            if not existing:
                us = UserSkill(
                    user_id=user.id,
                    skill_id=skill_id,
                    current_proficiency=65 if experience_level == 'intermediate' else 40,
                    level_label='Intermediate' if experience_level == 'intermediate' else 'Beginner'
                )
                db.session.add(us)

    db.session.commit()
    return jsonify({
        'message': 'Onboarding completed and roadmap forged!',
        'profile': profile.to_dict()
    }), 200
