from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app.models import db, MentorProfile, MentorRequest, User

mentors_bp = Blueprint('mentors', __name__, url_prefix='/api/mentors')

@mentors_bp.route('', methods=['GET'])
def get_mentors():
    mentors = MentorProfile.query.all()
    return jsonify({'mentors': [m.to_dict() for m in mentors]}), 200


@mentors_bp.route('/<int:mentor_user_id>/request', methods=['POST'])
@jwt_required()
def request_mentorship(mentor_user_id):
    student_id = int(get_jwt_identity())
    mentor_user = User.query.get(mentor_user_id)
    if not mentor_user:
        return jsonify({'error': 'Mentor not found'}), 404

    data = request.get_json() or {}
    topic = data.get('topic', 'Roadmap & Portfolio Review')
    message = data.get('message', '').strip()
    preferred_date = data.get('preferred_date', '')

    if not message:
        return jsonify({'error': 'Message cannot be empty'}), 400

    req = MentorRequest(
        student_id=student_id,
        mentor_id=mentor_user.id,
        topic=topic,
        message=message,
        preferred_date=preferred_date,
        status='pending',
        created_at=datetime.now(timezone.utc)
    )
    db.session.add(req)
    db.session.commit()

    return jsonify({
        'message': 'Mentorship request sent successfully',
        'request': req.to_dict()
    }), 201


@mentors_bp.route('/my-requests', methods=['GET'])
@jwt_required()
def get_my_requests():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    if user.role == 'mentor':
        requests = MentorRequest.query.filter_by(mentor_id=user_id).order_by(MentorRequest.created_at.desc()).all()
    else:
        requests = MentorRequest.query.filter_by(student_id=user_id).order_by(MentorRequest.created_at.desc()).all()

    return jsonify({'requests': [r.to_dict() for r in requests]}), 200


@mentors_bp.route('/requests/<int:request_id>/status', methods=['PUT'])
@jwt_required()
def update_request_status(request_id):
    user_id = int(get_jwt_identity())
    req = MentorRequest.query.get(request_id)
    if not req:
        return jsonify({'error': 'Request not found'}), 404

    data = request.get_json() or {}
    status = data.get('status') # accepted, rejected, completed
    feedback_notes = data.get('feedback_notes')

    if status:
        req.status = status
    if feedback_notes is not None:
        req.feedback_notes = feedback_notes

    db.session.commit()
    return jsonify({
        'message': 'Mentorship request status updated',
        'request': req.to_dict()
    }), 200
