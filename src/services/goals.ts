import api from './api';

export type GoalStatus = 'IN_PROGRESS' | 'COMPLETED' | 'PAUSED';

export interface Goal {
  id: string;
  name: string;
  targetAmount: number;
  savedAmount: number;
  progressPercentage: number;
  deadline: string;
  icon?: string;
  relatedCategoryId?: string | null;
  status: GoalStatus;
  createdAt: string;
}

export interface CreateGoalPayload {
  name: string;
  targetAmount: number;
  deadline: string;
  icon?: string;
  relatedCategoryId?: string | null;
}

export async function getGoals(): Promise<Goal[]> {
  const res = await api.get('/api/v1/goals');
  return res.data;
}

export async function createGoal(data: CreateGoalPayload): Promise<Goal> {
  const res = await api.post('/api/v1/goals', data);
  return res.data;
}

export async function updateGoal(id: string, data: Partial<CreateGoalPayload> & { status?: GoalStatus }): Promise<Goal> {
  const res = await api.put(`/api/v1/goals/${id}`, data);
  return res.data;
}

export async function contributeGoal(id: string, amount: number): Promise<Goal> {
  const res = await api.post(`/api/v1/goals/${id}/contribute`, { amount });
  return res.data;
}

export async function deleteGoal(id: string): Promise<void> {
  await api.delete(`/api/v1/goals/${id}`);
}
