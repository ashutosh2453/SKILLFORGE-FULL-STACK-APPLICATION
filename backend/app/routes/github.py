from flask import Blueprint, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
from datetime import datetime, timezone, timedelta
from app.models import User, Project

github_bp = Blueprint('github', __name__, url_prefix='/api/github')

@github_bp.route('/sync-status', methods=['GET'])
@jwt_required()
def get_github_sync():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    username = user.profile.github_username if user and user.profile else 'ashutosh-dev'

    # Simulated realistic GitHub telemetry for portfolio projects
    activity = {
        'connected': True,
        'mode': 'Simulated Demo Sync (Live GitHub Token Optional in .env)',
        'username': username,
        'avatar': 'https://avatars.githubusercontent.com/u/583231?v=4',
        'public_repos': 18,
        'total_contributions_this_year': 642,
        'languages': [
            {'name': 'TypeScript', 'percentage': 44.5, 'color': '#3178c6'},
            {'name': 'Python', 'percentage': 32.1, 'color': '#3572A5'},
            {'name': 'CSS & HTML', 'percentage': 15.4, 'color': '#e34c26'},
            {'name': 'SQL', 'percentage': 8.0, 'color': '#336791'}
        ],
        'recent_commits': [
            {
                'repo': f'{username}/pulseflow-telemetry',
                'message': 'feat(tracing): implement distributed spans with OpenTelemetry',
                'timestamp': (datetime.now(timezone.utc) - timedelta(hours=3)).isoformat(),
                'sha': 'a8f4c12'
            },
            {
                'repo': f'{username}/pulseflow-telemetry',
                'message': 'perf: add Redis cache layer to high-frequency metric queries',
                'timestamp': (datetime.now(timezone.utc) - timedelta(days=1)).isoformat(),
                'sha': '7c2e9b1'
            },
            {
                'repo': f'{username}/devforge-cli',
                'message': 'fix: normalize windows path separators in template generator',
                'timestamp': (datetime.now(timezone.utc) - timedelta(days=4)).isoformat(),
                'sha': '3b890ef'
            }
        ]
    }

    return jsonify({'github': activity}), 200
