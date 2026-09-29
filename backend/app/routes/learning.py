from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
from app.models import db, LearningSession, User, Profile, Skill, UserSkill

learning_bp = Blueprint('learning', __name__, url_prefix='/api/learning')

@learning_bp.route('/sessions', methods=['GET'])
@jwt_required()
def get_sessions():
    user_id = int(get_jwt_identity())
    sessions = LearningSession.query.filter_by(user_id=user_id).order_by(LearningSession.session_date.desc()).limit(30).all()
    user = User.query.get(user_id)
    profile = user.profile if user else None

    return jsonify({
        'sessions': [s.to_dict() for s in sessions],
        'total_learning_minutes': profile.total_learning_minutes if profile else 0,
        'current_streak': profile.current_streak if profile else 0,
        'longest_streak': profile.longest_streak if profile else 0
    }), 200


@learning_bp.route('/sessions', methods=['POST'])
@jwt_required()
def log_session():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}
    skill_id = data.get('skill_id')
    duration = int(data.get('duration_minutes', 30))
    notes = data.get('notes', '')

    session = LearningSession(
        user_id=user_id,
        skill_id=skill_id,
        duration_minutes=duration,
        notes=notes,
        session_date=datetime.now(timezone.utc)
    )
    db.session.add(session)

    user = User.query.get(user_id)
    if user and user.profile:
        user.profile.total_learning_minutes += duration
        user.profile.current_streak = max(1, user.profile.current_streak + 1)
        user.profile.longest_streak = max(user.profile.longest_streak, user.profile.current_streak)

    # Increment skill proficiency slightly from practice
    if skill_id:
        us = UserSkill.query.filter_by(user_id=user_id, skill_id=skill_id).first()
        if us:
            us.last_practiced_at = datetime.now(timezone.utc)
            us.current_proficiency = min(100, us.current_proficiency + 2)

    db.session.commit()
    return jsonify({
        'message': 'Learning session logged successfully',
        'session': session.to_dict()
    }), 201


@learning_bp.route('/weekly-chart', methods=['GET'])
@jwt_required()
def get_weekly_chart():
    user_id = int(get_jwt_identity())
    now = datetime.now(timezone.utc)
    
    daily_data = []
    days_of_week = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun']

    for i in range(6, -1, -1):
        target_date = now - timedelta(days=i)
        day_start = target_date.replace(hour=0, minute=0, second=0, microsecond=0)
        day_end = target_date.replace(hour=23, minute=59, second=59, microsecond=999999)

        sessions = LearningSession.query.filter(
            LearningSession.user_id == user_id,
            LearningSession.session_date >= day_start,
            LearningSession.session_date <= day_end
        ).all()

        total_mins = sum(s.duration_minutes for s in sessions)
        day_name = days_of_week[target_date.weekday()]

        daily_data.append({
            'day': day_name,
            'date': target_date.strftime('%b %d'),
            'minutes': total_mins,
            'hours': round(total_mins / 60, 1),
            'sessions_count': len(sessions)
        })

    return jsonify({'weekly_chart': daily_data}), 200
