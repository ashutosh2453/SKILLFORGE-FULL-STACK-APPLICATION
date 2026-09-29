from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from app.models import db, User, Profile, Career, Roadmap, RoadmapStep, UserSkill
from app.services.roadmap_generator import RoadmapGenerator

roadmap_bp = Blueprint('roadmap', __name__, url_prefix='/api/roadmap')

@roadmap_bp.route('', methods=['GET'])
@jwt_required()
def get_user_roadmap():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    career_id = request.args.get('career_id')
    if not career_id and user.profile:
        career_id = user.profile.target_career_id

    if not career_id:
        default_career = Career.query.first()
        career_id = default_career.id if default_career else 1

    graph_data = RoadmapGenerator.get_user_roadmap_graph(user_id, int(career_id))
    if not graph_data:
        return jsonify({'error': 'Roadmap not found for target career'}), 404

    return jsonify({'roadmap': graph_data}), 200


@roadmap_bp.route('/<int:career_id>', methods=['GET'])
@jwt_required()
def get_career_roadmap(career_id):
    user_id = int(get_jwt_identity())
    graph_data = RoadmapGenerator.get_user_roadmap_graph(user_id, career_id)
    if not graph_data:
        return jsonify({'error': 'Roadmap not found for this career'}), 404

    return jsonify({'roadmap': graph_data}), 200


@roadmap_bp.route('/step/<int:step_id>/toggle-topic', methods=['POST'])
@jwt_required()
def toggle_step_topic(step_id):
    user_id = int(get_jwt_identity())
    step = RoadmapStep.query.get(step_id)
    if not step:
        return jsonify({'error': 'Roadmap step not found'}), 404

    data = request.get_json() or {}
    topic_index = data.get('topic_index')

    topics = step.get_topics()
    if topic_index is None or topic_index < 0 or topic_index >= len(topics):
        return jsonify({'error': 'Invalid topic index'}), 400

    topics[topic_index]['completed'] = not topics[topic_index].get('completed', False)
    step.set_topics(topics)

    # Recalculate skill proficiency if skill is attached
    if step.skill_id:
        completed_count = sum(1 for t in topics if t.get('completed', False))
        calc_prof = round((completed_count / len(topics)) * 100) if topics else 0

        us = UserSkill.query.filter_by(user_id=user_id, skill_id=step.skill_id).first()
        if not us:
            us = UserSkill(user_id=user_id, skill_id=step.skill_id)
            db.session.add(us)
        us.current_proficiency = max(us.current_proficiency, calc_prof)

    db.session.commit()
    return jsonify({
        'message': 'Topic status updated',
        'topics': topics
    }), 200


@roadmap_bp.route('/step/<int:step_id>/complete', methods=['POST'])
@jwt_required()
def mark_step_complete(step_id):
    user_id = int(get_jwt_identity())
    step = RoadmapStep.query.get(step_id)
    if not step:
        return jsonify({'error': 'Roadmap step not found'}), 404

    # Mark all topics completed
    topics = step.get_topics()
    for t in topics:
        t['completed'] = True
    step.set_topics(topics)

    if step.skill_id:
        us = UserSkill.query.filter_by(user_id=user_id, skill_id=step.skill_id).first()
        if not us:
            us = UserSkill(user_id=user_id, skill_id=step.skill_id)
            db.session.add(us)
        us.current_proficiency = 100
        us.verified = True
        us.level_label = 'Master'

    db.session.commit()
    return jsonify({
        'message': f'Marked {step.title} as completed!',
        'step_id': step.id
    }), 200
