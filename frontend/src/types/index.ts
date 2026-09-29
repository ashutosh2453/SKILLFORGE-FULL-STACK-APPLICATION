export interface User {
  id: number;
  email: string;
  username: string;
  role: 'student' | 'mentor' | 'admin';
  created_at: string;
  profile?: Profile;
}

export interface Profile {
  id: number;
  user_id: number;
  full_name: string;
  headline: string;
  bio: string;
  avatar_url: string;
  target_career_id?: number;
  target_career?: Career;
  experience_level: 'beginner' | 'intermediate' | 'advanced';
  learning_style: 'videos' | 'reading' | 'projects' | 'practice' | 'mixed';
  hours_per_week: number;
  current_streak: number;
  longest_streak: number;
  total_learning_minutes: number;
  github_username: string;
  onboarding_completed: boolean;
  theme_preference: string;
}

export interface Career {
  id: number;
  slug: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  average_salary: string;
  estimated_months: number;
  demand_level: string;
  difficulty: string;
  total_skills?: number;
  has_roadmap?: boolean;
  roadmap_steps_count?: number;
  skills_required?: CareerSkill[];
}

export interface CareerSkill {
  id: number;
  career_id: number;
  skill_id: number;
  skill: Skill;
  target_proficiency: number;
  importance: 'core' | 'recommended' | 'optional';
  weight: number;
}

export interface Skill {
  id: number;
  slug: string;
  name: string;
  category: string;
  description: string;
  icon: string;
  tags: string[];
  current_proficiency?: number;
  verified?: boolean;
  assessment_score?: number;
  level_label?: string;
  resources?: Resource[];
  assessment?: Assessment;
}

export interface SkillGapItem {
  skill_id: number;
  skill_name: string;
  category: string;
  icon: string;
  importance: 'core' | 'recommended' | 'optional';
  current_level: number;
  target_level: number;
  gap: number;
  gap_category: 'Critical Gap' | 'Moderate Gap' | 'Strong';
  status_color: 'rose' | 'amber' | 'emerald';
  verified: boolean;
  assessment_score: number;
}

export interface GapAnalysisData {
  career_id: number;
  career_title: string;
  overall_proficiency_pct: number;
  critical_count: number;
  moderate_count: number;
  strong_count: number;
  total_skills_required: number;
  skills: SkillGapItem[];
}

export interface RoadmapNode {
  id: number;
  skill_id: number;
  step_order: number;
  stage_name: string;
  title: string;
  description: string;
  node_type: 'skill' | 'milestone' | 'capstone';
  status: 'completed' | 'in_progress' | 'available' | 'locked' | 'recommended';
  current_proficiency: number;
  estimated_hours: number;
  prerequisites: number[];
  topics: { title: string; completed: boolean }[];
  resource_count: number;
  has_assessment: boolean;
  assessment_id?: number;
  assessment_score?: number;
  position: { x: number; y: number };
}

export interface RoadmapEdge {
  id: string;
  source: number;
  target: number;
  completed: boolean;
}

export interface RoadmapGraph {
  roadmap_id: number;
  title: string;
  description: string;
  career_id: number;
  version: string;
  total_nodes: number;
  completed_nodes: number;
  in_progress_nodes: number;
  progress_percent: number;
  nodes: RoadmapNode[];
  edges: RoadmapEdge[];
}

export interface Resource {
  id: number;
  skill_id: number;
  skill_name?: string;
  skill_category?: string;
  title: string;
  description: string;
  url: string;
  type: 'Video' | 'Article' | 'Documentation' | 'Course' | 'Practice' | 'Project';
  difficulty: 'Beginner' | 'Intermediate' | 'Advanced';
  duration_mins: number;
  provider: string;
  rating: number;
  is_free: boolean;
  user_status?: 'saved' | 'in_progress' | 'completed' | 'none';
  is_completed?: boolean;
}

export interface Question {
  id: number;
  assessment_id: number;
  question_text: string;
  question_type: 'mcq' | 'true_false' | 'code_output' | 'scenario';
  code_snippet?: string;
  options: string[];
  concept_tag: string;
}

export interface Assessment {
  id: number;
  skill_id: number;
  skill_name?: string;
  title: string;
  description: string;
  difficulty: string;
  time_limit_mins: number;
  pass_score: number;
  total_questions?: number;
  has_attempted?: boolean;
  latest_score?: number;
  passed?: boolean;
  questions?: Question[];
}

export interface ProjectMilestone {
  id: number;
  project_id: number;
  title: string;
  completed: boolean;
  due_date?: string;
}

export interface Project {
  id: number;
  user_id: number;
  title: string;
  description: string;
  technologies: string[];
  difficulty: string;
  github_url: string;
  live_url: string;
  status: 'Idea' | 'Planning' | 'Building' | 'Completed';
  progress_percent: number;
  image_url: string;
  start_date: string;
  end_date?: string;
  milestones: ProjectMilestone[];
}

export interface LearningSession {
  id: number;
  user_id: number;
  skill_id?: number;
  skill_name?: string;
  duration_minutes: number;
  notes: string;
  session_date: string;
}

export interface Goal {
  id: number;
  user_id: number;
  title: string;
  category: string;
  target_date: string;
  progress_percent: number;
  status: 'in_progress' | 'completed' | 'paused';
  milestones: { title: string; completed: boolean }[];
  created_at: string;
}

export interface Badge {
  id: number;
  slug: string;
  name: string;
  description: string;
  icon: string;
  category: string;
  points: number;
  unlocked?: boolean;
  unlocked_at?: string;
}

export interface Notification {
  id: number;
  user_id: number;
  title: string;
  message: string;
  type: 'assessment' | 'streak' | 'project' | 'recommendation' | 'achievement' | 'info';
  read: boolean;
  action_link: string;
  created_at: string;
}

export interface Post {
  id: number;
  user_id: number;
  author_username: string;
  author_headline: string;
  author_avatar: string;
  title: string;
  content: string;
  tag: string;
  upvotes_count: number;
  comments_count: number;
  has_upvoted: boolean;
  created_at: string;
}

export interface Comment {
  id: number;
  post_id: number;
  user_id: number;
  author_username: string;
  author_avatar: string;
  content: string;
  created_at: string;
}

export interface Mentor {
  id: number;
  user_id: number;
  name: string;
  avatar_url: string;
  company: string;
  role_title: string;
  bio: string;
  expertise: string[];
  years_experience: number;
  hourly_rate: string;
  rating: number;
  total_reviews: number;
  availability: string;
}

export interface Recommendation {
  title: string;
  action_type: string;
  skill_id?: number;
  skill_name?: string;
  target_career?: string;
  current_proficiency?: number;
  target_proficiency?: number;
  description: string;
  cta_label: string;
  link: string;
  resource_id?: number;
  assessment_id?: number;
  why_explanation: {
    headline: string;
    career_target?: string;
    reasons: string[];
  };
}
