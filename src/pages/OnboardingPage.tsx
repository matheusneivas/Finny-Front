import { useState, useEffect, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../contexts/AuthContext';
import { StepHeader } from '../components/onboarding/StepHeader';
import { ProgressBar } from '../components/ui/ProgressBar';
import { ErrorToast } from '../components/ui/ErrorToast';
import { WelcomeScreen } from '../components/onboarding/WelcomeScreen';
import { Step1 } from '../components/onboarding/Step1';
import type { Step1DataExtended } from '../components/onboarding/Step1';
import { Step2 } from '../components/onboarding/Step2';
import { Step3 } from '../components/onboarding/Step3';
import { Step4 } from '../components/onboarding/Step4';
import { Step5 } from '../components/onboarding/Step5';
import { StepAccount } from '../components/onboarding/StepAccount';
import type { AccountData } from '../components/onboarding/StepAccount';
import {
  getOnboardingStatus,
  submitStep1,
  submitStep2,
  submitStep3,
  submitStep4,
  submitStep5,
} from '../services/onboarding';
import api from '../services/api';
import type {
  Step2Data,
  Step3Data,
  Step4Data,
  Step5Data,
  ApiError,
} from '../types';
import './OnboardingPage.css';

// Steps 1-5 are profile questions, step 6 is account creation
const TOTAL_STEPS = 5;

type CollectedData = {
  step1?: Step1DataExtended;
  step2?: Step2Data;
  step3?: Step3Data;
  step4?: Step4Data;
  step5?: Step5Data;
};

function getProgressPercent(step: number): number {
  return Math.round((step / TOTAL_STEPS) * 100);
}

export function OnboardingPage() {
  const navigate = useNavigate();
  const { isAuthenticated, setOnboardingCompleted, login } = useAuth();

  // step 0 = welcome, 1-5 = profile questions, 6 = account creation
  const [currentStep, setCurrentStep] = useState(0);
  const [progressPercent, setProgressPercent] = useState(0);
  const [loading, setLoading] = useState(false);
  const [initializing, setInitializing] = useState(true);
  const [apiError, setApiError] = useState<string | null>(null);
  const [slideDir, setSlideDir] = useState<'left' | 'right'>('left');
  const [animating, setAnimating] = useState(false);
  const [collected, setCollected] = useState<CollectedData>({});
  const prevStep = useRef(0);

  useEffect(() => {
    if (isAuthenticated) {
      // Existing user resuming onboarding — get current step from API
      getOnboardingStatus()
        .then((status) => {
          if (status.completed) {
            setOnboardingCompleted(true);
            navigate('/home', { replace: true });
            return;
          }
          const step = Math.min(Math.max(status.currentStep, 1), TOTAL_STEPS);
          setCurrentStep(step);
          setProgressPercent(getProgressPercent(step));
        })
        .catch(() => setCurrentStep(1))
        .finally(() => setInitializing(false));
    } else {
      // New user — start from welcome
      setInitializing(false);
    }
  }, []);

  const changeStep = (next: number, direction: 'left' | 'right') => {
    if (animating) return;
    setAnimating(true);
    setSlideDir(direction);
    setTimeout(() => {
      prevStep.current = next;
      setCurrentStep(next);
      setProgressPercent(next >= 1 && next <= TOTAL_STEPS ? getProgressPercent(next) : next > TOTAL_STEPS ? 100 : 0);
      setAnimating(false);
    }, 260);
  };

  const handleBack = () => {
    if (currentStep <= 1) { changeStep(0, 'right'); return; }
    changeStep(currentStep - 1, 'right');
  };

  const handleApiError = (err: unknown) => {
    const e = err as { response?: { data?: ApiError }; code?: string };
    if (!e?.response) return; // Network error — don't block UI
    const msg = e.response.data?.message ?? 'Ocorreu um erro. Tente novamente.';
    setApiError(msg);
  };

  // Steps 1-5: save locally and advance
  const handleStep1 = (data: Step1DataExtended) => {
    setCollected((p) => ({ ...p, step1: data }));
    changeStep(2, 'left');
  };

  const handleStep2 = (data: Step2Data) => {
    setCollected((p) => ({ ...p, step2: data }));
    changeStep(3, 'left');
  };

  const handleStep3 = (data: Step3Data) => {
    setCollected((p) => ({ ...p, step3: data }));
    changeStep(4, 'left');
  };

  const handleStep4 = (data: Step4Data) => {
    setCollected((p) => ({ ...p, step4: data }));
    changeStep(5, 'left');
  };

  const handleStep5 = (data: Step5Data) => {
    setCollected((p) => ({ ...p, step5: data }));
    if (isAuthenticated) {
      // Existing user: submit steps to API then finish
      submitAllSteps({ ...collected, step5: data });
    } else {
      // New user: go to account creation step
      changeStep(6, 'left');
    }
  };

  const submitAllSteps = async (data: CollectedData) => {
    setLoading(true);
    try {
      if (data.step1) await submitStep1({ birthDate: data.step1.birthDate, occupation: data.step1.occupation });
      if (data.step2) await submitStep2(data.step2);
      if (data.step3) await submitStep3(data.step3);
      if (data.step4) await submitStep4(data.step4);
      if (data.step5) await submitStep5(data.step5);
      setOnboardingCompleted(true);
      navigate('/onboarding/success', { replace: true });
    } catch (err) {
      handleApiError(err);
    } finally {
      setLoading(false);
    }
  };

  // Step 6: register → save token → submit profile steps → success
  const handleAccount = async (accountData: AccountData) => {
    const { step1 } = collected;
    if (!step1) return;
    setLoading(true);
    try {
      // 1. Create account
      const res = await api.post('/api/v1/auth/register', {
        name: step1.name,
        email: accountData.email,
        password: accountData.password,
      });
      const { accessToken, refreshToken, user } = res.data;

      // 2. Save auth
      login(accessToken, refreshToken, user);

      // 3. Submit all profile steps to API
      await submitAllSteps(collected);
    } catch (err) {
      const e = err as { response?: { data?: ApiError } };
      const msg = e?.response?.data?.message ?? 'Erro ao criar conta. Tente novamente.';
      setApiError(msg);
      setLoading(false);
    }
  };

  if (initializing) {
    return (
      <div className="onboarding-loading">
        <div className="onboarding-spinner" />
      </div>
    );
  }

  // Welcome screen
  if (currentStep === 0) {
    return <WelcomeScreen onStart={() => changeStep(1, 'left')} />;
  }

  const isAccountStep = currentStep === 6;
  const displayStep = isAccountStep ? TOTAL_STEPS : currentStep;
  const animClass = animating
    ? slideDir === 'left' ? 'slide-out-left' : 'slide-out-right'
    : 'slide-in';

  const renderStep = () => {
    switch (currentStep) {
      case 1: return <Step1 initialData={collected.step1 ?? {}} onSubmit={handleStep1} loading={loading} />;
      case 2: return <Step2 initialData={collected.step2 ?? {}} onSubmit={handleStep2} loading={loading} />;
      case 3: return <Step3 initialData={collected.step3 ?? {}} onSubmit={handleStep3} loading={loading} />;
      case 4: return <Step4 initialData={collected.step4 ?? {}} onSubmit={handleStep4} loading={loading} />;
      case 5: return <Step5 initialData={collected.step5 ?? {}} onSubmit={handleStep5} loading={loading} />;
      case 6: return <StepAccount userName={collected.step1?.name ?? ''} onSubmit={handleAccount} loading={loading} />;
      default: return null;
    }
  };

  return (
    <div className="onboarding-page">
      <StepHeader
        currentStep={displayStep}
        totalSteps={TOTAL_STEPS}
        onBack={handleBack}
        showBack={!loading}
      />

      <ProgressBar
        current={displayStep}
        total={TOTAL_STEPS}
        percentage={progressPercent}
      />

      <ErrorToast message={apiError} onDismiss={() => setApiError(null)} />

      <div className={`step-wrapper ${animClass}`} key={currentStep}>
        {renderStep()}
      </div>
    </div>
  );
}
