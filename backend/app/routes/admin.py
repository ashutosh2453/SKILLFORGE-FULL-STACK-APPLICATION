from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import (
    db, User, Profile, Career, Skill, CareerSkill,
    Roadmap, RoadmapStep, Resource, Assessment, Question, Project
)

admin_bp = Blueprint('admin', __name__, url_prefix='/api/admin')

def require_admin():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user or user.role != 'admin':
        return None, jsonify({'error': 'Unauthorized: Admin privileges required'}), 403
    return user, None, None

@admin_bp.route('/stats', methods=['GET'])
@jwt_required()
def get_admin_stats():
    admin_user, err_resp, code = require_admin()
    if err_resp:
        return err_resp, code

    total_users = User.query.count()
    active_students = User.query.filter_by(role='student').count()
    total_mentors = User.query.filter_by(role='mentor').count()
    total_careers = Career.query.count()
    total_skills = Skill.query.count()
    total_roadmaps = Roadmap.query.count()
    total_resources = Resource.query.count()
    total_assessments = Assessment.query.count()
    total_projects = Project.query.count()

    return jsonify({
        'stats': {
            'total_users': total_users,
            'active_students': active_students,
            'total_mentors': total_mentors,
            'total_careers': total_careers,
            'total_skills': total_skills,
            'total_roadmaps': total_roadmaps,
            'total_resources': total_resources,
            'total_assessments': total_assessments,
            'total_projects': total_projects
        }
    }), 200


@admin_bp.route('/users', methods=['GET'])
@jwt_required()
def get_all_users():
    admin_user, err_resp, code = require_admin()
    if err_resp:
        return err_resp, code

    users = User.query.order_by(User.created_at.desc()).all()
    return jsonify({'users': [u.to_dict() for u in users]}), 200


@admin_bp.route('/users/<int:user_id>/role', methods=['PUT'])
@jwt_required()
def update_user_role(user_id):
    admin_user, err_resp, code = require_admin()
    if err_resp:
        return err_resp, code

    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    data = request.get_json() or {}
    role = data.get('role')
    if role in ['student', 'mentor', 'admin']:
        user.role = role
        db.session.commit()
        return jsonify({'message': f'User role updated to {role}', 'user': user.to_dict()}), 200
    return jsonify({'error': 'Invalid role'}), 400


@admin_bp.route('/skills', methods=['POST'])
@jwt_required()
def create_skill():
    admin_user, err_resp, code = require_admin()
    if err_resp:
        return err_resp, code

    data = request.get_json() or {}
    name = data.get('name', '').strip()
    category = data.get('category', 'Frontend')
    description = data.get('description', '')
    slug = data.get('slug', name.lower().replace(' ', '-'))

    if not name:
        return jsonify({'error': 'Skill name is required'}), 400

    skill = Skill(name=name, slug=slug, category=category, description=description)
    db.session.add(skill)
    db.session.commit()
    return jsonify({'message': 'Skill created successfully', 'skill': skill.to_dict()}), 201


@admin_bp.route('/skills/<int:skill_id>', methods=['DELETE'])
@jwt_required()
def delete_skill(skill_id):
    admin_user, err_resp, code = require_admin()
    if err_resp:
        return err_resp, code

    skill = Skill.query.get(skill_id)
    if not skill:
        return jsonify({'error': 'Skill not found'}), 404

    db.session.delete(skill)
    db.session.commit()
    return jsonify({'message': 'Skill deleted successfully'}), 200


@admin_bp.route('/resources', methods=['POST'])
@jwt_required()
def create_resource():
    admin_user, err_resp, code = require_admin()
    if err_resp:
        return err_resp, code

    data = request.get_json() or {}
    skill_id = data.get('skill_id')
    title = data.get('title', '').strip()
    url = data.get('url', '').strip()

    if not skill_id or not title or not url:
        return jsonify({'error': 'Skill ID, title, and URL are required'}), 400

    res = Resource(
        skill_id=skill_id,
        title=title,
        url=url,
        type=data.get('type', 'Article'),
        difficulty=data.get('difficulty', 'Intermediate'),
        duration_mins=int(data.get('duration_mins', 30)),
        provider=data.get('provider', 'Curated')
    )
    db.session.add(res)
    db.session.commit()
    return jsonify({'message': 'Resource created successfully', 'resource': res.to_dict()}), 201
