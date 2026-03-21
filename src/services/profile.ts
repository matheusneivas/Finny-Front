import api from './api';

export interface UserProfile {
  id?: string;
  fullName?: string;
  email?: string;
  occupation?: string;
  birthDate?: string;
  incomeRange?: string;
  paysRent?: boolean;
  monthlyRent?: number;
  hasDebts?: boolean;
  totalDebt?: number;
  debtTypes?: string[];
  hasEmergencyFund?: boolean;
  emergencyFundMonths?: number;
  hasInvestments?: boolean;
  investmentTypes?: string[];
  monthlyInvestmentGoal?: number;
  expenseControlPreference?: string;
  knowledgeLevel?: string;
  reportFrequency?: string;
  communicationStyle?: string;
}

export async function getProfile(): Promise<UserProfile> {
  const res = await api.get('/api/v1/users/profile');
  return res.data;
}

export async function updateProfile(data: Partial<UserProfile>): Promise<UserProfile> {
  const res = await api.put('/api/v1/users/profile', data);
  return res.data;
}
