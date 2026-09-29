from app.models import (
    User, Profile, Career, CareerSkill, UserSkill,
    Project, AssessmentAttempt, LearningSession
)
from app.services.gap_analyzer import GapAnalyzer

class ReadinessCalculator:
    @staticmethod
    def calculate_user_readiness(user_id):
        user = User.query.get(user_id)
        if not user:
            return None

        profile = user.profile
        target_career_id = profile.target_career_id if profile else None

        # 1. Skills Mastery (Weight: 40%)
        skills_score = 0
        if target_career_id:
            gap_data = GapAnalyzer.analyze_user_career_gap(user_id, target_career_id)
            if gap_data:
                skills_score = gap_data['overall_proficiency_pct']
        else:
            all_user_skills = UserSkill.query.filter_by(user_id=user_id).all()
            if all_user_skills:
                skills_score = round(sum(s.current_proficiency for s in all_user_skills) / len(all_user_skills))

        # 2. Project Experience (Weight: 25%)
        projects = Project.query.filter_by(user_id=user_id).all()
        if not projects:
            projects_score = 0
        else:
            completed_projects = [p for p in projects if p.status == 'Completed']
            building_projects = [p for p in projects if p.status == 'Building']
            # Max 3 completed projects or high progress
            project_points = (len(completed_projects) * 35) + (len(building_projects) * 15)
            # Add average project progress percentage
            avg_progress = sum(p.progress_percent for p in projects) / len(projects)
            projects_score = round(min(100, (project_points * 0.5) + (avg_progress * 0.5)))

        # 3. Assessment Verification (Weight: 20%)
        attempts = AssessmentAttempt.query.filter_by(user_id=user_id).all()
        if not attempts:
            assessments_score = 0
        else:
            # Average score of latest attempts
            avg_score = sum(a.score for a in attempts) / len(attempts)
            passed_ratio = len([a for a in attempts if a.passed]) / len(attempts)
            assessments_score = round((avg_score * 0.7) + (passed_ratio * 100 * 0.3))
            assessments_score = min(100, assessments_score)

        # 4. Learning Consistency (Weight: 15%)
        current_streak = profile.current_streak if profile else 0
        sessions = LearningSession.query.filter_by(user_id=user_id).all()
        total_sessions = len(sessions)
        
        streak_score = min(100, current_streak * 14) # 7-day streak gives ~98%
        volume_score = min(100, total_sessions * 10)
        consistency_score = round((streak_score * 0.6) + (volume_score * 0.4))

        # Overall composite readiness index
        # 40% Skills + 25% Projects + 20% Assessments + 15% Consistency
        overall_readiness = round(
            (skills_score * 0.40) +
            (projects_score * 0.25) +
            (assessments_score * 0.20) +
            (consistency_score * 0.15)
        )
        overall_readiness = min(100, max(0, overall_readiness))

        # Determine Strongest and Focus Area
        areas = [
            {'name': 'Skills Mastery', 'score': skills_score, 'key': 'skills'},
            {'name': 'Project Portfolio', 'score': projects_score, 'key': 'projects'},
            {'name': 'Assessment Performance', 'score': assessments_score, 'key': 'assessments'},
            {'name': 'Learning Consistency', 'score': consistency_score, 'key': 'consistency'}
        ]
        areas.sort(key=lambda x: x['score'], reverse=True)
        strongest_area = areas[0]['name']
        focus_area = areas[-1]['name']

        return {
            'overall_readiness': overall_readiness,
            'breakdown': {
                'skills': skills_score,
                'projects': projects_score,
                'assessments': assessments_score,
                'consistency': consistency_score
            },
            'strongest_area': strongest_area,
            'focus_area': focus_area,
            'disclaimer': 'SkillForge Readiness Index is a developmental metric calculated from your completed milestones, verified assessments, and projects. It is not an external hiring guarantee.'
        }
