from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app.models import db, Goal

goals_bp = Blueprint('goals', __name__, url_prefix='/api/goals')

@goals_bp.route('', methods=['GET'])
@jwt_required()
def get_goals():
    user_id = int(get_jwt_identity())
    goals = Goal.query.filter_by(user_id=user_id).order_by(Goal.target_date.asc()).all()
    return jsonify({'goals': [g.to_dict() for g in goals]}), 200


@goals_bp.route('', methods=['POST'])
@jwt_required()
def create_goal():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Goal title is required'}), 400

    target_date_str = data.get('target_date')
    try:
        target_date = datetime.fromisoformat(target_date_str) if target_date_str else datetime.now(timezone.utc)
    except Exception:
        target_date = datetime.now(timezone.utc)

    category = data.get('category', 'Skill')
    milestones = data.get('milestones', [])

    goal = Goal(
        user_id=user_id,
        title=title,
        category=category,
        target_date=target_date,
        progress_percent=0,
        status='in_progress'
    )
    goal.set_milestones(milestones)
    db.session.add(goal)
    db.session.commit()

    return jsonify({
        'message': 'Goal created successfully',
        'goal': goal.to_dict()
    }), 201


@goals_bp.route('/<int:goal_id>/toggle-milestone', methods=['POST'])
@jwt_required()
def toggle_goal_milestone(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    data = request.get_json() or {}
    m_idx = data.get('milestone_index')
    milestones = goal.get_milestones()

    if m_idx is None or m_idx < 0 or m_idx >= len(milestones):
        return jsonify({'error': 'Invalid milestone index'}), 400

    milestones[m_idx]['completed'] = not milestones[m_idx].get('completed', False)
    goal.set_milestones(milestones)

    comp_count = sum(1 for m in milestones if m.get('completed', False))
    goal.progress_percent = round((comp_count / len(milestones)) * 100) if milestones else 0
    if goal.progress_percent == 100:
        goal.status = 'completed'

    db.session.commit()
    return jsonify({
        'message': 'Milestone updated',
        'goal': goal.to_dict()
    }), 200


@goals_bp.route('/<int:goal_id>', methods=['DELETE'])
@jwt_required()
def delete_goal(goal_id):
    user_id = int(get_jwt_identity())
    goal = Goal.query.filter_by(id=goal_id, user_id=user_id).first()
    if not goal:
        return jsonify({'error': 'Goal not found'}), 404

    db.session.delete(goal)
    db.session.commit()
    return jsonify({'message': 'Goal deleted successfully'}), 200
