from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app.models import db, Resource, ResourceProgress, Skill

resources_bp = Blueprint('resources', __name__, url_prefix='/api/resources')

@resources_bp.route('', methods=['GET'])
@jwt_required(optional=True)
def get_resources():
    skill_id = request.args.get('skill_id')
    res_type = request.args.get('type')
    difficulty = request.args.get('difficulty')
    search = request.args.get('search', '').strip().lower()

    query = Resource.query
    if skill_id:
        query = query.filter_by(skill_id=int(skill_id))
    if res_type and res_type.lower() != 'all':
        query = query.filter_by(type=res_type)
    if difficulty and difficulty.lower() != 'all':
        query = query.filter_by(difficulty=difficulty)
    if search:
        query = query.filter(
            Resource.title.ilike(f'%{search}%') |
            Resource.description.ilike(f'%{search}%') |
            Resource.provider.ilike(f'%{search}%')
        )

    resources = query.all()
    
    # Map user progress if user is logged in
    user_id = get_jwt_identity()
    user_progress_map = {}
    if user_id:
        user_id = int(user_id)
        progresses = ResourceProgress.query.filter_by(user_id=user_id).all()
        user_progress_map = {p.resource_id: p for p in progresses}

    result = []
    for r in resources:
        r_dict = r.to_dict()
        user_prog = user_progress_map.get(r.id)
        r_dict['user_status'] = user_prog.status if user_prog else 'none'
        r_dict['is_completed'] = user_prog.status == 'completed' if user_prog else False
        result.append(r_dict)

    return jsonify({'resources': result}), 200


@resources_bp.route('/<int:resource_id>/status', methods=['POST'])
@jwt_required()
def update_resource_status(resource_id):
    user_id = int(get_jwt_identity())
    resource = Resource.query.get(resource_id)
    if not resource:
        return jsonify({'error': 'Resource not found'}), 404

    data = request.get_json() or {}
    status = data.get('status', 'in_progress') # saved, in_progress, completed, none

    prog = ResourceProgress.query.filter_by(user_id=user_id, resource_id=resource.id).first()
    
    if status == 'none':
        if prog:
            db.session.delete(prog)
            db.session.commit()
        return jsonify({'message': 'Resource status reset', 'status': 'none'}), 200

    if not prog:
        prog = ResourceProgress(user_id=user_id, resource_id=resource.id)
        db.session.add(prog)

    prog.status = status
    if status == 'completed':
        prog.completed_at = datetime.now(timezone.utc)

    db.session.commit()
    return jsonify({
        'message': f'Resource marked as {status}',
        'progress': prog.to_dict()
    }), 200
