// Auth types
export interface LoginData {
  email: string;
  password: string;
}

export interface User {
  id: string;
  name: string;
  email: string;
  onboardingCompleted?: boolean;
}

export interface AuthResponse {
  accessToken: string;
  refreshToken: string;
  user: User;
}

// Onboarding types
export interface OnboardingStatus {
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  completed: boolean;
  nextStepDescription: string;
  profile: Record<string, unknown>;
}

export interface OnboardingStepResponse {
  currentStep: number;
  totalSteps: number;
  progressPercentage: number;
  completed: boolean;
  nextStepDescription: string;
  profile: Record<string, unknown>;
}

// Step 1
export interface Step1Data {
  birthDate: string;
  occupation?: string;
  cpf: string;
}

// Step 2
export type IncomeRange = 'UNDER_2K' | 'RANGE_2K_5K' | 'RANGE_5K_10K' | 'RANGE_10K_20K' | 'OVER_20K';

export interface Step2Data {
  incomeRange: IncomeRange;
  paysRent: boolean;
  monthlyRent?: number | null;
}

// Step 3
export interface Step3Data {
  hasDebts: boolean;
  totalDebt?: number | null;
  debtTypes?: string[];
  hasEmergencyFund: boolean;
  emergencyFundMonths?: number | null;
}

// Step 4
export interface Step4Data {
  hasInvestments: boolean;
  investmentTypes?: string[];
  monthlyInvestmentGoal: number;
}

// Step 5
export type ExpenseControlPreference = 'MANUAL' | 'AUTOMATIC' | 'MIXED';
export type KnowledgeLevel = 'BEGINNER' | 'INTERMEDIATE' | 'ADVANCED';
export type ReportFrequency = 'DAILY' | 'WEEKLY' | 'MONTHLY' | 'ON_DEMAND';
export type CommunicationStyle = 'FORMAL' | 'FRIENDLY' | 'DIRECT';

export interface Step5Data {
  expenseControlPreference: ExpenseControlPreference;
  knowledgeLevel: KnowledgeLevel;
  reportFrequency: ReportFrequency;
  communicationStyle: CommunicationStyle;
  shortTermGoals: string[];
  longTermGoals: string[];
  primaryGoal: string | null;
  primaryGoalTimeframe: string | null;
  mainExpenseCategories: string[];
  notificationPreferences: string[];
}

// API Error
export interface ApiError {
  status: number;
  error: string;
  message: string;
}
