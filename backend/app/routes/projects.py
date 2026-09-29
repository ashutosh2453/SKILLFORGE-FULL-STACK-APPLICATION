from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone
from app.models import db, Project, ProjectMilestone, User

projects_bp = Blueprint('projects', __name__, url_prefix='/api/projects')

@projects_bp.route('', methods=['GET'])
@jwt_required()
def get_projects():
    user_id = int(get_jwt_identity())
    projects = Project.query.filter_by(user_id=user_id).order_by(Project.start_date.desc()).all()
    return jsonify({'projects': [p.to_dict() for p in projects]}), 200


@projects_bp.route('', methods=['POST'])
@jwt_required()
def create_project():
    user_id = int(get_jwt_identity())
    data = request.get_json() or {}

    title = data.get('title', '').strip()
    if not title:
        return jsonify({'error': 'Project title is required'}), 400

    description = data.get('description', '')
    technologies = data.get('technologies', [])
    difficulty = data.get('difficulty', 'Intermediate')
    github_url = data.get('github_url', '')
    live_url = data.get('live_url', '')
    status = data.get('status', 'Planning')
    image_url = data.get('image_url', 'https://images.unsplash.com/photo-1555066931-4365d14bab8c?w=600&auto=format&fit=crop&q=80')
    milestones_data = data.get('milestones', [])

    project = Project(
        user_id=user_id,
        title=title,
        description=description,
        difficulty=difficulty,
        github_url=github_url,
        live_url=live_url,
        status=status,
        progress_percent=0,
        image_url=image_url,
        start_date=datetime.now(timezone.utc)
    )
    project.set_technologies(technologies)
    db.session.add(project)
    db.session.flush()

    for m in milestones_data:
        m_title = m.get('title') if isinstance(m, dict) else str(m)
        if m_title:
            pm = ProjectMilestone(project_id=project.id, title=m_title, completed=False)
            db.session.add(pm)

    db.session.commit()
    return jsonify({
        'message': 'Project created successfully',
        'project': project.to_dict()
    }), 201


@projects_bp.route('/<int:project_id>', methods=['PUT'])
@jwt_required()
def update_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    data = request.get_json() or {}
    if 'title' in data:
        project.title = data['title']
    if 'description' in data:
        project.description = data['description']
    if 'technologies' in data:
        project.set_technologies(data['technologies'])
    if 'difficulty' in data:
        project.difficulty = data['difficulty']
    if 'github_url' in data:
        project.github_url = data['github_url']
    if 'live_url' in data:
        project.live_url = data['live_url']
    if 'status' in data:
        project.status = data['status']
        if data['status'] == 'Completed' and not project.end_date:
            project.end_date = datetime.now(timezone.utc)
            project.progress_percent = 100
    if 'progress_percent' in data:
        project.progress_percent = int(data['progress_percent'])
    if 'image_url' in data:
        project.image_url = data['image_url']

    db.session.commit()
    return jsonify({
        'message': 'Project updated successfully',
        'project': project.to_dict()
    }), 200


@projects_bp.route('/<int:project_id>', methods=['DELETE'])
@jwt_required()
def delete_project(project_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    db.session.delete(project)
    db.session.commit()
    return jsonify({'message': 'Project deleted successfully'}), 200


@projects_bp.route('/<int:project_id>/milestones/<int:milestone_id>/toggle', methods=['POST'])
@jwt_required()
def toggle_milestone(project_id, milestone_id):
    user_id = int(get_jwt_identity())
    project = Project.query.filter_by(id=project_id, user_id=user_id).first()
    if not project:
        return jsonify({'error': 'Project not found'}), 404

    milestone = ProjectMilestone.query.filter_by(id=milestone_id, project_id=project.id).first()
    if not milestone:
        return jsonify({'error': 'Milestone not found'}), 404

    milestone.completed = not milestone.completed
    
    # Recalculate project progress
    all_milestones = project.milestones.all()
    if all_milestones:
        comp_count = sum(1 for m in all_milestones if m.completed)
        project.progress_percent = round((comp_count / len(all_milestones)) * 100)
        if project.progress_percent == 100:
            project.status = 'Completed'
            project.end_date = datetime.now(timezone.utc)
        elif project.status == 'Idea' or project.status == 'Planning':
            project.status = 'Building'

    db.session.commit()
    return jsonify({
        'message': 'Milestone status toggled',
        'project': project.to_dict()
    }), 200
