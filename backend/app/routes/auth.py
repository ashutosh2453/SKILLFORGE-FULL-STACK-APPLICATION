from flask import Blueprint, request, jsonify
from flask_jwt_extended import create_access_token, jwt_required, get_jwt_identity
from app.models import db, User, Profile, Career, Skill, UserSkill

auth_bp = Blueprint('auth', __name__, url_prefix='/api/auth')

@auth_bp.route('/register', methods=['POST'])
def register():
    data = request.get_json() or {}
    email = data.get('email', '').strip().lower()
    username = data.get('username', '').strip()
    password = data.get('password', '')
    full_name = data.get('full_name', username)

    if not email or not username or not password:
        return jsonify({'error': 'Email, username, and password are required'}), 400

    if User.query.filter_by(email=email).first():
        return jsonify({'error': 'Email is already registered'}), 409

    if User.query.filter_by(username=username).first():
        return jsonify({'error': 'Username is already taken'}), 409

    user = User(
        email=email,
        username=username,
        role='student'
    )
    user.set_password(password)
    db.session.add(user)
    db.session.flush()

    default_career = Career.query.filter_by(slug='full-stack-developer').first()
    profile = Profile(
        user_id=user.id,
        full_name=full_name,
        headline='Aspiring Software Engineer',
        target_career_id=default_career.id if default_career else None,
        experience_level='beginner',
        hours_per_week=10,
        current_streak=1,
        onboarding_completed=False
    )
    db.session.add(profile)
    db.session.commit()

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Account created successfully',
        'token': access_token,
        'user': user.to_dict()
    }), 201


@auth_bp.route('/login', methods=['POST'])
def login():
    data = request.get_json() or {}
    identifier = data.get('identifier', '').strip().lower() # email or username
    password = data.get('password', '')

    if not identifier or not password:
        return jsonify({'error': 'Email/username and password are required'}), 400

    user = User.query.filter(
        (User.email == identifier) | (User.username == identifier)
    ).first()

    if not user or not user.check_password(password):
        return jsonify({'error': 'Invalid email/username or password'}), 401

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': 'Login successful',
        'token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/demo-login', methods=['POST'])
def demo_login():
    """
    Instant role switcher for demonstration (Student, Mentor, Admin).
    """
    data = request.get_json() or {}
    role = data.get('role', 'student').lower()

    if role == 'admin':
        user = User.query.filter_by(role='admin').first()
    elif role == 'mentor':
        user = User.query.filter_by(role='mentor').first()
    else:
        user = User.query.filter_by(role='student').first()

    if not user:
        return jsonify({'error': f'Demo user for role {role} not found. Please run seed script.'}), 404

    access_token = create_access_token(identity=str(user.id))
    return jsonify({
        'message': f'Switched to {role.capitalize()} demo account',
        'token': access_token,
        'user': user.to_dict()
    }), 200


@auth_bp.route('/me', methods=['GET'])
@jwt_required()
def get_me():
    user_id = int(get_jwt_identity())
    user = User.query.get(user_id)
    if not user:
        return jsonify({'error': 'User not found'}), 404

    return jsonify({'user': user.to_dict()}), 200
