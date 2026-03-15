import api from './api';
import type {
  OnboardingStatus,
  OnboardingStepResponse,
  Step1Data,
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
} from '../types';

export const getOnboardingStatus = (): Promise<OnboardingStatus> =>
  api.get('/api/v1/onboarding/status').then((r) => r.data);

export const submitStep1 = (data: Step1Data): Promise<OnboardingStepResponse> =>
  api.post('/api/v1/onboarding/step/1', data).then((r) => r.data);

export const submitStep2 = (data: Step2Data): Promise<OnboardingStepResponse> =>
  api.post('/api/v1/onboarding/step/2', data).then((r) => r.data);

export const submitStep3 = (data: Step3Data): Promise<OnboardingStepResponse> =>
  api.post('/api/v1/onboarding/step/3', data).then((r) => r.data);

export const submitStep4 = (data: Step4Data): Promise<OnboardingStepResponse> =>
  api.post('/api/v1/onboarding/step/4', data).then((r) => r.data);

export const submitStep5 = (data: Step5Data): Promise<OnboardingStepResponse> =>
  api.post('/api/v1/onboarding/step/5', data).then((r) => r.data);
