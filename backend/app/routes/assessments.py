from flask import Blueprint, request, jsonify
from flask_jwt_extended import jwt_required, get_jwt_identity
import json
from datetime import datetime, timezone
from app.models import db, Assessment, Question, AssessmentAttempt, UserSkill, Skill, Notification

assessments_bp = Blueprint('assessments', __name__, url_prefix='/api/assessments')

@assessments_bp.route('', methods=['GET'])
@jwt_required()
def get_assessments():
    user_id = int(get_jwt_identity())
    assessments = Assessment.query.all()
    result = []

    for a in assessments:
        a_dict = a.to_dict()
        latest_attempt = AssessmentAttempt.query.filter_by(
            user_id=user_id, assessment_id=a.id
        ).order_by(AssessmentAttempt.completed_at.desc()).first()

        a_dict['has_attempted'] = latest_attempt is not None
        a_dict['latest_score'] = latest_attempt.score if latest_attempt else None
        a_dict['passed'] = latest_attempt.passed if latest_attempt else False
        result.append(a_dict)

    return jsonify({'assessments': result}), 200


@assessments_bp.route('/<int:assessment_id>', methods=['GET'])
@jwt_required()
def get_assessment(assessment_id):
    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({'error': 'Assessment not found'}), 404

    data = assessment.to_dict()
    questions = assessment.questions.all()
    # Do not leak correct answers to frontend during quiz
    data['questions'] = [q.to_dict(include_answer=False) for q in questions]

    return jsonify({'assessment': data}), 200


@assessments_bp.route('/<int:assessment_id>/submit', methods=['POST'])
@jwt_required()
def submit_assessment(assessment_id):
    user_id = int(get_jwt_identity())
    assessment = Assessment.query.get(assessment_id)
    if not assessment:
        return jsonify({'error': 'Assessment not found'}), 404

    data = request.get_json() or {}
    user_answers = data.get('answers', {}) # Dict of {question_id: selected_option_text}

    questions = assessment.questions.all()
    if not questions:
        return jsonify({'error': 'No questions found in this assessment'}), 400

    correct_count = 0
    total_questions = len(questions)
    breakdown = []
    strong_concepts = set()
    weak_concepts = set()

    for q in questions:
        user_choice = str(user_answers.get(str(q.id)) or user_answers.get(q.id) or '').strip()
        is_correct = (user_choice.lower() == q.correct_answer.strip().lower())

        if is_correct:
            correct_count += 1
            if q.concept_tag:
                strong_concepts.add(q.concept_tag)
        else:
            if q.concept_tag:
                weak_concepts.add(q.concept_tag)

        breakdown.append({
            'question_id': q.id,
            'question_text': q.question_text,
            'code_snippet': q.code_snippet,
            'user_answer': user_choice,
            'correct_answer': q.correct_answer,
            'is_correct': is_correct,
            'explanation': q.explanation,
            'concept_tag': q.concept_tag
        })

    # Weak concepts should not overlap strong
    weak_concepts = [c for c in weak_concepts if c not in strong_concepts] or list(weak_concepts)
    strong_concepts = list(strong_concepts)

    score_pct = round((correct_count / total_questions) * 100)
    passed = score_pct >= assessment.pass_score

    # Save Attempt
    attempt = AssessmentAttempt(
        user_id=user_id,
        assessment_id=assessment.id,
        score=score_pct,
        total_questions=total_questions,
        correct_count=correct_count,
        passed=passed,
        strong_concepts=json.dumps(strong_concepts),
        weak_concepts=json.dumps(weak_concepts),
        answers=json.dumps(breakdown),
        completed_at=datetime.now(timezone.utc)
    )
    db.session.add(attempt)

    # Update UserSkill record
    if assessment.skill_id:
        user_skill = UserSkill.query.filter_by(user_id=user_id, skill_id=assessment.skill_id).first()
        if not user_skill:
            user_skill = UserSkill(user_id=user_id, skill_id=assessment.skill_id)
            db.session.add(user_skill)

        user_skill.assessment_score = max(user_skill.assessment_score, score_pct)
        if passed:
            user_skill.verified = True
            user_skill.current_proficiency = max(user_skill.current_proficiency, score_pct)
            if score_pct >= 85:
                user_skill.level_label = 'Master'
            elif score_pct >= 70:
                user_skill.level_label = 'Advanced'
        user_skill.last_practiced_at = datetime.now(timezone.utc)

    # Trigger notification
    notif_msg = f"You scored {score_pct}% on {assessment.title}."
    if passed:
        notif_msg += " Skill verified! Great work."
    else:
        notif_msg += " Review the weak concepts and re-attempt to verify."

    notif = Notification(
        user_id=user_id,
        title=f"Assessment Complete: {score_pct}%",
        message=notif_msg,
        type='assessment',
        action_link='/assessments'
    )
    db.session.add(notif)

    db.session.commit()

    return jsonify({
        'message': 'Assessment submitted successfully',
        'result': {
            'score': score_pct,
            'passed': passed,
            'pass_score': assessment.pass_score,
            'correct_count': correct_count,
            'total_questions': total_questions,
            'strong_concepts': strong_concepts,
            'weak_concepts': weak_concepts,
            'breakdown': breakdown,
            'recommendation': f"Focus on {weak_concepts[0]} and review recommended practice exercises." if weak_concepts else "Excellent mastery across all concepts!"
        }
    }), 200


@assessments_bp.route('/history', methods=['GET'])
@jwt_required()
def get_assessment_history():
    user_id = int(get_jwt_identity())
    attempts = AssessmentAttempt.query.filter_by(user_id=user_id).order_by(AssessmentAttempt.completed_at.desc()).all()
    return jsonify({'history': [a.to_dict() for a in attempts]}), 200
