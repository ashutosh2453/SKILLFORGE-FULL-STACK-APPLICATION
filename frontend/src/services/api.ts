const API_BASE = '/api';

export class ApiError extends Error {
  status: number;
  data: any;

  constructor(message: string, status: number, data?: any) {
    super(message);
    this.status = status;
    this.data = data;
    this.name = 'ApiError';
  }
}

async function request<T>(endpoint: string, options: RequestInit = {}): Promise<T> {
  const token = localStorage.getItem('skillforge_token');

  const headers: Record<string, string> = {
    'Content-Type': 'application/json',
    ...(options.headers as Record<string, string> || {}),
  };

  if (token) {
    headers['Authorization'] = `Bearer ${token}`;
  }

  const response = await fetch(`${API_BASE}${endpoint}`, {
    ...options,
    headers,
  });

  const isJson = response.headers.get('content-type')?.includes('application/json');
  const data = isJson ? await response.json() : null;

  if (!response.ok) {
    const errorMsg = data?.error || response.statusText || 'An unexpected error occurred';
    throw new ApiError(errorMsg, response.status, data);
  }

  return data as T;
}

export const api = {
  // Auth
  register: (payload: any) => request<any>('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  login: (payload: any) => request<any>('/auth/login', { method: 'POST', body: JSON.stringify(payload) }),
  demoLogin: (role: string) => request<any>('/auth/demo-login', { method: 'POST', body: JSON.stringify({ role }) }),
  getMe: () => request<any>('/auth/me'),

  // Profile
  getProfile: () => request<any>('/profile'),
  updateProfile: (data: any) => request<any>('/profile', { method: 'PUT', body: JSON.stringify(data) }),
  completeOnboarding: (data: any) => request<any>('/profile/onboarding', { method: 'POST', body: JSON.stringify(data) }),

  // Careers
  getCareers: () => request<any>('/careers'),
  getCareerDetail: (id: number) => request<any>(`/careers/${id}`),

  // Skills
  getSkills: (params?: { category?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.category) q.set('category', params.category);
    if (params?.search) q.set('search', params.search);
    return request<any>(`/skills?${q.toString()}`);
  },
  getSkillDetail: (id: number) => request<any>(`/skills/${id}`),
  getSkillMatrix: () => request<any>('/skills/matrix'),
  getGapAnalysis: (careerId?: number) => {
    const q = careerId ? `?career_id=${careerId}` : '';
    return request<any>(`/skills/gap-analysis${q}`);
  },
  updateSkillLevel: (skillId: number, proficiency: number) =>
    request<any>('/skills/update-level', { method: 'POST', body: JSON.stringify({ skill_id: skillId, proficiency }) }),

  // Roadmap
  getRoadmap: (careerId?: number) => {
    const q = careerId ? `?career_id=${careerId}` : '';
    return request<any>(`/roadmap${q}`);
  },
  toggleStepTopic: (stepId: number, topicIndex: number) =>
    request<any>(`/roadmap/step/${stepId}/toggle-topic`, { method: 'POST', body: JSON.stringify({ topic_index: topicIndex }) }),
  completeStep: (stepId: number) =>
    request<any>(`/roadmap/step/${stepId}/complete`, { method: 'POST' }),

  // Assessments
  getAssessments: () => request<any>('/assessments'),
  getAssessment: (id: number) => request<any>(`/assessments/${id}`),
  submitAssessment: (id: number, answers: Record<string, string>) =>
    request<any>(`/assessments/${id}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  getAssessmentHistory: () => request<any>('/assessments/history'),

  // Resources
  getResources: (params?: { skill_id?: number; type?: string; difficulty?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.skill_id) q.set('skill_id', params.skill_id.toString());
    if (params?.type) q.set('type', params.type);
    if (params?.difficulty) q.set('difficulty', params.difficulty);
    if (params?.search) q.set('search', params.search);
    return request<any>(`/resources?${q.toString()}`);
  },
  updateResourceStatus: (id: number, status: string) =>
    request<any>(`/resources/${id}/status`, { method: 'POST', body: JSON.stringify({ status }) }),

  // Projects
  getProjects: () => request<any>('/projects'),
  createProject: (data: any) => request<any>('/projects', { method: 'POST', body: JSON.stringify(data) }),
  updateProject: (id: number, data: any) => request<any>(`/projects/${id}`, { method: 'PUT', body: JSON.stringify(data) }),
  deleteProject: (id: number) => request<any>(`/projects/${id}`, { method: 'DELETE' }),
  toggleMilestone: (projectId: number, milestoneId: number) =>
    request<any>(`/projects/${projectId}/milestones/${milestoneId}/toggle`, { method: 'POST' }),

  // Learning
  getLearningSessions: () => request<any>('/learning/sessions'),
  logLearningSession: (data: { skill_id?: number; duration_minutes: number; notes?: string }) =>
    request<any>('/learning/sessions', { method: 'POST', body: JSON.stringify(data) }),
  getWeeklyLearningChart: () => request<any>('/learning/weekly-chart'),

  // Analytics
  getAnalyticsOverview: () => request<any>('/analytics/overview'),

  // Recommendations
  getNextAction: () => request<any>('/recommendations/next-action'),
  getWeeklyPlan: () => request<any>('/recommendations/weekly-plan'),
  getAiExplanation: (skillName: string) =>
    request<any>('/recommendations/ai-explain', { method: 'POST', body: JSON.stringify({ skill_name: skillName }) }),
  getAiProjectIdea: (skills: string[], difficulty?: string) =>
    request<any>('/recommendations/ai-project-idea', { method: 'POST', body: JSON.stringify({ skills, difficulty }) }),

  // Goals
  getGoals: () => request<any>('/goals'),
  createGoal: (data: any) => request<any>('/goals', { method: 'POST', body: JSON.stringify(data) }),
  toggleGoalMilestone: (goalId: number, milestoneIndex: number) =>
    request<any>(`/goals/${goalId}/toggle-milestone`, { method: 'POST', body: JSON.stringify({ milestone_index: milestoneIndex }) }),
  deleteGoal: (goalId: number) => request<any>(`/goals/${goalId}`, { method: 'DELETE' }),

  // Achievements
  getAchievements: () => request<any>('/achievements'),

  // Community
  getCommunityPosts: (params?: { tag?: string; search?: string }) => {
    const q = new URLSearchParams();
    if (params?.tag) q.set('tag', params.tag);
    if (params?.search) q.set('search', params.search);
    return request<any>(`/community/posts?${q.toString()}`);
  },
  createCommunityPost: (data: { title: string; content: string; tag: string }) =>
    request<any>('/community/posts', { method: 'POST', body: JSON.stringify(data) }),
  votePost: (postId: number) => request<any>(`/community/posts/${postId}/vote`, { method: 'POST' }),
  getPostComments: (postId: number) => request<any>(`/community/posts/${postId}/comments`),
  addComment: (postId: number, content: string) =>
    request<any>(`/community/posts/${postId}/comments`, { method: 'POST', body: JSON.stringify({ content }) }),

  // Mentors
  getMentors: () => request<any>('/mentors'),
  requestMentorship: (mentorUserId: number, data: { topic: string; message: string; preferred_date: string }) =>
    request<any>(`/mentors/${mentorUserId}/request`, { method: 'POST', body: JSON.stringify(data) }),
  getMyMentorRequests: () => request<any>('/mentors/my-requests'),
  updateMentorRequestStatus: (id: number, status: string, feedbackNotes?: string) =>
    request<any>(`/mentors/requests/${id}/status`, { method: 'PUT', body: JSON.stringify({ status, feedback_notes: feedbackNotes }) }),

  // Notifications
  getNotifications: () => request<any>('/notifications'),
  markNotificationRead: (id: number) => request<any>(`/notifications/${id}/read`, { method: 'POST' }),
  markAllNotificationsRead: () => request<any>('/notifications/read-all', { method: 'POST' }),

  // GitHub Simulation
  getGithubSync: () => request<any>('/github/sync-status'),

  // Admin
  getAdminStats: () => request<any>('/admin/stats'),
  getAllUsers: () => request<any>('/admin/users'),
  updateUserRole: (userId: number, role: string) =>
    request<any>(`/admin/users/${userId}/role`, { method: 'PUT', body: JSON.stringify({ role }) }),
  adminCreateSkill: (data: any) => request<any>('/admin/skills', { method: 'POST', body: JSON.stringify(data) }),
  adminDeleteSkill: (id: number) => request<any>(`/admin/skills/${id}`, { method: 'DELETE' }),
  adminCreateResource: (data: any) => request<any>('/admin/resources', { method: 'POST', body: JSON.stringify(data) }),
};
