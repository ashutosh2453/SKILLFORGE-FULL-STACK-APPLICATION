from flask import Flask, jsonify
from flask_cors import CORS
from flask_jwt_extended import JWTManager
from app.config import config_by_name
from app.models import db

jwt = JWTManager()

def create_app(config_name='development'):
    app = Flask(__name__)
    app.config.from_object(config_by_name[config_name])

    # Enable CORS
    CORS(app, resources={r"/api/*": {"origins": "*"}})

    # Initialize extensions
    db.init_app(app)
    jwt.init_app(app)

    # JWT Error handlers
    @jwt.expired_token_loader
    def expired_token_callback(jwt_header, jwt_payload):
        return jsonify({'error': 'Token has expired', 'code': 'token_expired'}), 401

    @jwt.invalid_token_loader
    def invalid_token_callback(error):
        return jsonify({'error': 'Signature verification failed', 'code': 'token_invalid'}), 401

    @jwt.unauthorized_loader
    def missing_token_callback(error):
        return jsonify({'error': 'Authorization token is missing', 'code': 'authorization_required'}), 401

    # Register Blueprints
    from app.routes.auth import auth_bp
    from app.routes.profile import profile_bp
    from app.routes.careers import careers_bp
    from app.routes.skills import skills_bp
    from app.routes.roadmap import roadmap_bp
    from app.routes.assessments import assessments_bp
    from app.routes.resources import resources_bp
    from app.routes.projects import projects_bp
    from app.routes.learning import learning_bp
    from app.routes.analytics import analytics_bp
    from app.routes.recommendations import recommendations_bp
    from app.routes.goals import goals_bp
    from app.routes.achievements import achievements_bp
    from app.routes.community import community_bp
    from app.routes.mentors import mentors_bp
    from app.routes.notifications import notifications_bp
    from app.routes.admin import admin_bp
    from app.routes.github import github_bp

    app.register_blueprint(auth_bp)
    app.register_blueprint(profile_bp)
    app.register_blueprint(careers_bp)
    app.register_blueprint(skills_bp)
    app.register_blueprint(roadmap_bp)
    app.register_blueprint(assessments_bp)
    app.register_blueprint(resources_bp)
    app.register_blueprint(projects_bp)
    app.register_blueprint(learning_bp)
    app.register_blueprint(analytics_bp)
    app.register_blueprint(recommendations_bp)
    app.register_blueprint(goals_bp)
    app.register_blueprint(achievements_bp)
    app.register_blueprint(community_bp)
    app.register_blueprint(mentors_bp)
    app.register_blueprint(notifications_bp)
    app.register_blueprint(admin_bp)
    app.register_blueprint(github_bp)

    @app.route('/api/health', methods=['GET'])
    def health_check():
        return jsonify({
            'status': 'healthy',
            'platform': 'SkillForge Engine',
            'version': '1.0.0'
        }), 200

    # Global Error Handlers
    @app.errorhandler(404)
    def not_found_error(error):
        return jsonify({'error': 'Resource not found', 'code': 404}), 404

    @app.errorhandler(500)
    def internal_error(error):
        db.session.rollback()
        return jsonify({'error': 'Internal server error occurred', 'code': 500}), 500

    return app
