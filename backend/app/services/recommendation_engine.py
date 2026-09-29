from app.models import (
    User, Profile, Career, CareerSkill, UserSkill,
    Roadmap, RoadmapStep, Resource, AssessmentAttempt, Assessment
)
from app.services.gap_analyzer import GapAnalyzer

class RecommendationEngine:
    @staticmethod
    def get_next_best_action(user_id):
        user = User.query.get(user_id)
        if not user:
            return None

        profile = user.profile
        target_career_id = profile.target_career_id if profile else None
        hours_available = profile.hours_per_week if profile else 10

        career = Career.query.get(target_career_id) if target_career_id else Career.query.first()
        if not career:
            return {
                'title': 'Explore Career Paths',
                'action_type': 'select_career',
                'description': 'Select a target career to unlock your personalized roadmap and skill gap analytics.',
                'cta_label': 'Choose Career',
                'link': '/careers',
                'why_explanation': {
                    'headline': 'Why this action?',
                    'reasons': [
                        'No target career has been selected yet',
                        'SkillForge generates recommendations dynamically based on your chosen career destination',
                        'Selecting a target creates your bespoke roadmap instantly'
                    ]
                }
            }

        # 1. Analyze Gaps & Roadmap Progress
        gap_data = GapAnalyzer.analyze_user_career_gap(user_id, career.id)
        roadmap = Roadmap.query.filter_by(career_id=career.id).first()
        steps = roadmap.steps.order_by(RoadmapStep.step_order).all() if roadmap else []

        user_skills_map = {
            us.skill_id: us for us in UserSkill.query.filter_by(user_id=user_id).all()
        }

        # Find first incomplete roadmap step or highest critical gap
        recommended_step = None
        prereqs_met = False

        for step in steps:
            skill = step.skill
            if not skill:
                continue

            us = user_skills_map.get(skill.id)
            prof = us.current_proficiency if us else 0

            # Check if this step is incomplete (< 80%)
            if prof < 80:
                # Check prerequisites
                prereqs = step.get_prerequisites()
                all_prereqs_done = True
                prereq_names = []
                for p_id in prereqs:
                    p_us = user_skills_map.get(p_id)
                    p_step = next((s for s in steps if s.skill_id == p_id or s.id == p_id), None)
                    p_name = p_step.title if p_step else "Prerequisite"
                    prereq_names.append(p_name)
                    if not p_us or p_us.current_proficiency < 70:
                        all_prereqs_done = False

                recommended_step = step
                prereqs_met = all_prereqs_done
                break

        # Fallback to critical gap if no roadmap step
        if not recommended_step and gap_data and gap_data['skills']:
            first_gap = gap_data['skills'][0]
            recommended_skill_id = first_gap['skill_id']
            skill_name = first_gap['skill_name']
            current_prof = first_gap['current_level']
            target_prof = first_gap['target_level']
        elif recommended_step:
            recommended_skill_id = recommended_step.skill_id
            skill_name = recommended_step.title
            us = user_skills_map.get(recommended_skill_id) if recommended_skill_id else None
            current_prof = us.current_proficiency if us else 0
            target_prof = 85
        else:
            recommended_skill_id = 1
            skill_name = "Core Fundamentals"
            current_prof = 0
            target_prof = 80

        # Find an active resource for this skill
        best_resource = Resource.query.filter_by(skill_id=recommended_skill_id).first() if recommended_skill_id else None
        
        # Check if user has an assessment to verify
        assessment = Assessment.query.filter_by(skill_id=recommended_skill_id).first() if recommended_skill_id else None
        latest_attempt = None
        if assessment:
            latest_attempt = AssessmentAttempt.query.filter_by(
                user_id=user_id, assessment_id=assessment.id
            ).order_by(AssessmentAttempt.completed_at.desc()).first()

        # Build dynamic transparent explanation
        reasons = []
        if current_prof > 0:
            reasons.append(f"You have already made initial progress ({current_prof}% proficiency) in {skill_name}")
        else:
            reasons.append(f"This is the foundational next milestone in your {career.title} roadmap")

        reasons.append(f"{skill_name} is a required core competency for {career.title} (Target: {target_prof}%)")

        if latest_attempt and not latest_attempt.passed:
            reasons.append(f"Your recent assessment scored {latest_attempt.score}% with concept gaps in {', '.join(latest_attempt.get_weak_concepts()[:2]) or 'core topics'}")
        elif not latest_attempt:
            reasons.append(f"Completing this will unlock your verified skill assessment badge")

        reasons.append(f"Fits within your planned {hours_available} hours/week learning bandwidth")

        action_title = f"Master {skill_name}"
        action_desc = f"Continue through {skill_name} modules to close your {max(0, target_prof - current_prof)}% target proficiency gap."
        cta_label = "Continue Learning →"
        link = f"/roadmap"

        if best_resource:
            action_desc += f" Suggested resource: {best_resource.title} ({best_resource.duration_mins} mins)."

        return {
            'title': action_title,
            'action_type': 'learn_skill',
            'skill_id': recommended_skill_id,
            'skill_name': skill_name,
            'target_career': career.title,
            'current_proficiency': current_prof,
            'target_proficiency': target_prof,
            'description': action_desc,
            'cta_label': cta_label,
            'link': link,
            'resource_id': best_resource.id if best_resource else None,
            'assessment_id': assessment.id if assessment else None,
            'why_explanation': {
                'headline': f'Why is {skill_name} recommended?',
                'career_target': career.title,
                'reasons': reasons
            }
        }
