from app.models import Career, CareerSkill, UserSkill, Skill

class GapAnalyzer:
    @staticmethod
    def analyze_user_career_gap(user_id, career_id):
        career = Career.query.get(career_id)
        if not career:
            return None

        career_skills = CareerSkill.query.filter_by(career_id=career_id).all()
        user_skills_map = {
            us.skill_id: us for us in UserSkill.query.filter_by(user_id=user_id).all()
        }

        analysis = []
        total_weighted_current = 0
        total_weighted_target = 0
        critical_count = 0
        moderate_count = 0
        strong_count = 0

        for cs in career_skills:
            skill = cs.skill
            if not skill:
                continue

            user_skill = user_skills_map.get(cs.skill_id)
            current_level = user_skill.current_proficiency if user_skill else 0
            target_level = cs.target_proficiency or 80
            gap = max(0, target_level - current_level)

            if gap >= 40:
                gap_category = 'Critical Gap'
                status_color = 'rose'
                critical_count += 1
            elif gap >= 15:
                gap_category = 'Moderate Gap'
                status_color = 'amber'
                moderate_count += 1
            else:
                gap_category = 'Strong'
                status_color = 'emerald'
                strong_count += 1

            weight = cs.weight or 1.0
            total_weighted_current += (current_level * weight)
            total_weighted_target += (target_level * weight)

            analysis.append({
                'skill_id': skill.id,
                'skill_name': skill.name,
                'category': skill.category,
                'icon': skill.icon,
                'importance': cs.importance,
                'current_level': current_level,
                'target_level': target_level,
                'gap': gap,
                'gap_category': gap_category,
                'status_color': status_color,
                'verified': user_skill.verified if user_skill else False,
                'assessment_score': user_skill.assessment_score if user_skill else 0
            })

        # Sort with critical gaps first, then by gap descending
        priority_order = {'Critical Gap': 0, 'Moderate Gap': 1, 'Strong': 2}
        analysis.sort(key=lambda x: (priority_order.get(x['gap_category'], 3), -x['gap']))

        overall_proficiency_pct = (
            round((total_weighted_current / total_weighted_target) * 100)
            if total_weighted_target > 0 else 0
        )
        overall_proficiency_pct = min(100, max(0, overall_proficiency_pct))

        return {
            'career_id': career.id,
            'career_title': career.title,
            'overall_proficiency_pct': overall_proficiency_pct,
            'critical_count': critical_count,
            'moderate_count': moderate_count,
            'strong_count': strong_count,
            'total_skills_required': len(career_skills),
            'skills': analysis
        }
