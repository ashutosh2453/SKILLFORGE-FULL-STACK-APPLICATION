import os

class AIService:
    @staticmethod
    def generate_roadmap_explanation(career_title, skill_name, user_experience):
        """
        Explain why a skill matters for a target career and how to study it effectively.
        """
        return {
            'concept': f"{skill_name} in {career_title}",
            'industry_context': f"In modern {career_title} roles, {skill_name} serves as a foundational building block for shipping scalable, maintainable architectures.",
            'key_mental_models': [
                f"Declarative state transitions and data flow in {skill_name}",
                f"Performance optimizations and memory lifecycle management",
                f"Production debugging and telemetry integration"
            ],
            'recommended_study_sequence': [
                f"1. Core syntax and standard library patterns (2-3 hrs)",
                f"2. Build a standalone micro-project exercising edge cases (4-5 hrs)",
                f"3. Take the SkillForge verified assessment to test retention (15 mins)"
            ],
            'common_interview_questions': [
                f"How does {skill_name} handle asynchronous operations under load?",
                f"What trade-offs exist between alternative patterns in {skill_name}?"
            ],
            'source': 'SkillForge Intelligent Engine'
        }

    @staticmethod
    def generate_project_idea(skill_names, difficulty='Intermediate'):
        """
        Suggest a portfolio-worthy project given a list of skills.
        """
        skills_str = ", ".join(skill_names)
        return {
            'title': f"Real-Time Collaborative Workspace using {skills_str}",
            'tagline': "Production-ready portfolio artifact showcasing end-to-end architecture",
            'difficulty': difficulty,
            'features': [
                "Role-based workspace access & JWT authentication",
                "Optimistic UI updates with real-time websocket synchronization",
                "Automated CI/CD pipeline with unit & integration test coverage",
                "Telemetry dashboard tracking latency, error rates, and user engagement"
            ],
            'technologies': skill_names,
            'estimated_hours': 25,
            'github_template_advice': "Structure with /frontend, /backend, /docs, and include an architectural diagram in README.md."
        }
