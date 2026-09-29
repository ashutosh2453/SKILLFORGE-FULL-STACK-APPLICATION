from flask import Blueprint, request, jsonify
from app.models import Career, CareerSkill, Roadmap

careers_bp = Blueprint('careers', __name__, url_prefix='/api/careers')

@careers_bp.route('', methods=['GET'])
def get_careers():
    careers = Career.query.all()
    result = []
    for c in careers:
        c_dict = c.to_dict()
        c_dict['total_skills'] = c.skills_required.count()
        roadmap = c.roadmaps.first()
        c_dict['has_roadmap'] = roadmap is not None
        c_dict['roadmap_steps_count'] = roadmap.steps.count() if roadmap else 0
        result.append(c_dict)

    return jsonify({'careers': result}), 200


@careers_bp.route('/<int:career_id>', methods=['GET'])
def get_career_detail(career_id):
    career = Career.query.get(career_id)
    if not career:
        return jsonify({'error': 'Career not found'}), 404

    career_data = career.to_dict()
    career_skills = CareerSkill.query.filter_by(career_id=career.id).all()
    career_data['skills_required'] = [cs.to_dict() for cs in career_skills]
    
    roadmap = career.roadmaps.first()
    career_data['roadmap'] = roadmap.to_dict() if roadmap else None

    return jsonify({'career': career_data}), 200
