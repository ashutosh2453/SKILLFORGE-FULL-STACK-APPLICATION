import pytest
import os
import sys

# Add backend directory to sys.path
sys.path.insert(0, os.path.abspath(os.path.join(os.path.dirname(__file__), '..')))

from app import create_app
from app.models import db, User, Career, Skill, UserSkill, Assessment, Question
from app.seed_data import seed_database
from app.services.gap_analyzer import GapAnalyzer
from app.services.readiness_calculator import ReadinessCalculator
from app.services.recommendation_engine import RecommendationEngine

@pytest.fixture
def client():
    app = create_app('development')
    app.config['TESTING'] = True
    app.config['SQLALCHEMY_DATABASE_URI'] = 'sqlite:///:memory:'

    with app.app_context():
        db.create_all()
        seed_database()
        with app.test_client() as client:
            yield client

def test_auth_login(client):
    res = client.post('/api/auth/login', json={
        'identifier': 'student@skillforge.io',
        'password': 'password123'
    })
    assert res.status_code == 200
    data = res.get_json()
    assert 'token' in data
    assert data['user']['username'] == 'ashutosh'

def test_demo_login_admin(client):
    res = client.post('/api/auth/demo-login', json={'role': 'admin'})
    assert res.status_code == 200
    data = res.get_json()
    assert data['user']['role'] == 'admin'

def test_careers_list(client):
    res = client.get('/api/careers')
    assert res.status_code == 200
    data = res.get_json()
    assert len(data['careers']) >= 5

def test_gap_analyzer(client):
    with client.application.app_context():
        student = User.query.filter_by(username='ashutosh').first()
        career = Career.query.filter_by(slug='full-stack-developer').first()
        gap_data = GapAnalyzer.analyze_user_career_gap(student.id, career.id)
        
        assert gap_data is not None
        assert 'overall_proficiency_pct' in gap_data
        assert len(gap_data['skills']) > 0

def test_readiness_calculator(client):
    with client.application.app_context():
        student = User.query.filter_by(username='ashutosh').first()
        readiness = ReadinessCalculator.calculate_user_readiness(student.id)
        
        assert readiness is not None
        assert 0 <= readiness['overall_readiness'] <= 100
        assert 'breakdown' in readiness
        assert 'skills' in readiness['breakdown']
        assert 'projects' in readiness['breakdown']

def test_recommendations_why_explanation(client):
    with client.application.app_context():
        student = User.query.filter_by(username='ashutosh').first()
        action = RecommendationEngine.get_next_best_action(student.id)
        
        assert action is not None
        assert 'why_explanation' in action
        assert len(action['why_explanation']['reasons']) > 0

def test_assessment_flow(client):
    # 1. Login to get token
    res = client.post('/api/auth/login', json={
        'identifier': 'student@skillforge.io',
        'password': 'password123'
    })
    token = res.get_json()['token']
    headers = {'Authorization': f'Bearer {token}'}

    # 2. Get assessments
    res = client.get('/api/assessments', headers=headers)
    assert res.status_code == 200
    assessments = res.get_json()['assessments']
    assert len(assessments) > 0
    test_id = assessments[0]['id']

    # 3. Submit attempt
    submit_res = client.post(f'/api/assessments/{test_id}/submit', headers=headers, json={
        'answers': {'1': '1, 4, 3, 2'}
    })
    assert submit_res.status_code == 200
    result_data = submit_res.get_json()['result']
    assert 'score' in result_data
    assert 'strong_concepts' in result_data
