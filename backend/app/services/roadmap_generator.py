from app.models import Roadmap, RoadmapStep, UserSkill, Resource, Assessment, Project

class RoadmapGenerator:
    @staticmethod
    def get_user_roadmap_graph(user_id, career_id):
        roadmap = Roadmap.query.filter_by(career_id=career_id).first()
        if not roadmap:
            return None

        steps = roadmap.steps.order_by(RoadmapStep.step_order).all()
        user_skills_map = {
            us.skill_id: us for us in UserSkill.query.filter_by(user_id=user_id).all()
        }

        nodes = []
        edges = []
        completed_skills = set()
        first_available_found = False

        # First pass: identify completed skills
        for step in steps:
            skill = step.skill
            if not skill:
                continue
            us = user_skills_map.get(skill.id)
            if us and us.current_proficiency >= 80:
                completed_skills.add(skill.id)

        # Second pass: determine status and create graph edges
        for idx, step in enumerate(steps):
            skill = step.skill
            skill_id = skill.id if skill else step.id
            us = user_skills_map.get(skill_id)
            current_prof = us.current_proficiency if us else 0
            prereqs = step.get_prerequisites() # List of prerequisite skill_ids

            # Check if all prerequisites are fulfilled
            prereqs_satisfied = True
            for pid in prereqs:
                if pid not in completed_skills:
                    prereqs_satisfied = False
                    break

            if current_prof >= 80:
                status = 'completed'
            elif current_prof > 0:
                status = 'in_progress'
            elif prereqs_satisfied:
                if not first_available_found:
                    status = 'recommended'
                    first_available_found = True
                else:
                    status = 'available'
            else:
                status = 'locked'

            # Get resource and project counts
            resource_count = Resource.query.filter_by(skill_id=skill_id).count() if skill else 0
            assessment = Assessment.query.filter_by(skill_id=skill_id).first() if skill else None

            # Calculate graph coordinates if not set
            # Simple alternating staggered layout for visual polish
            grid_x = step.grid_x if step.grid_x != 0 else (idx % 3) * 280 + 100
            grid_y = step.grid_y if step.grid_y != 0 else (idx // 3) * 180 + 80

            nodes.append({
                'id': step.id,
                'skill_id': skill_id,
                'step_order': step.step_order,
                'stage_name': step.stage_name,
                'title': step.title,
                'description': step.description,
                'node_type': step.node_type,
                'status': status,
                'current_proficiency': current_prof,
                'estimated_hours': step.estimated_hours,
                'prerequisites': prereqs,
                'topics': step.get_topics(),
                'resource_count': resource_count,
                'has_assessment': assessment is not None,
                'assessment_id': assessment.id if assessment else None,
                'assessment_score': us.assessment_score if us else None,
                'position': {
                    'x': grid_x,
                    'y': grid_y
                }
            })

            # Create edges from prerequisites
            for pid in prereqs:
                parent_step = next((s for s in steps if s.skill_id == pid or s.id == pid), None)
                if parent_step:
                    edges.append({
                        'id': f"edge-{parent_step.id}-{step.id}",
                        'source': parent_step.id,
                        'target': step.id,
                        'completed': parent_step.skill_id in completed_skills
                    })
            
            # Default linear fallback edge if no explicit prereqs and not first
            if not prereqs and idx > 0:
                prev_step = steps[idx - 1]
                edges.append({
                    'id': f"edge-{prev_step.id}-{step.id}",
                    'source': prev_step.id,
                    'target': step.id,
                    'completed': prev_step.skill_id in completed_skills
                })

        total_nodes = len(nodes)
        completed_nodes = sum(1 for n in nodes if n['status'] == 'completed')
        in_progress_nodes = sum(1 for n in nodes if n['status'] == 'in_progress')
        progress_pct = round((completed_nodes / total_nodes) * 100) if total_nodes > 0 else 0

        return {
            'roadmap_id': roadmap.id,
            'title': roadmap.title,
            'description': roadmap.description,
            'career_id': career_id,
            'version': roadmap.version,
            'total_nodes': total_nodes,
            'completed_nodes': completed_nodes,
            'in_progress_nodes': in_progress_nodes,
            'progress_percent': progress_pct,
            'nodes': nodes,
            'edges': edges
        }
