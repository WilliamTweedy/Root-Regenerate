
import React, { useState, useEffect } from 'react';
import { subscribeToAuth, User, signInWithGoogle } from './services/firebase';
import { generateSoilDiagnosis, generatePlantingPlan } from './services/geminiService';
import { SoilDiagnosisInputs, PlantingPlanInputs, PlantingPlanResponse, DiagnosisResponse } from './types';

import Dashboard from './components/Dashboard';
import Navigation from './components/Navigation';
import Scanner from './components/Scanner';
import Chat from './components/Chat';
import Harvest from './components/Harvest';
import ToolsHub from './components/ToolsHub';
import Questionnaire from './components/Questionnaire';
import PlantingWizard from './components/PlantingWizard';
import PlantDoctor from './components/PlantDoctor';
import GapFiller from './components/GapFiller';
import Loading from './components/Loading';
import Results from './components/Results';
import PlantingPlanResults from './components/PlantingPlanResults';

import { Sprout, ArrowLeft, AlertCircle } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');
  const [loginError, setLoginError] = useState<string | null>(null);

  // Tools Tab State
  const [toolState, setToolState] = useState<'hub' | 'soil' | 'planner' | 'doctor' | 'gap_filler'>('hub');
  const [diagnosisData, setDiagnosisData] = useState<DiagnosisResponse | null>(null);
  const [planData, setPlanData] = useState<PlantingPlanResponse | null>(null);
  const [isToolLoading, setIsToolLoading] = useState(false);

  useEffect(() => {
    const unsubscribe = subscribeToAuth((currentUser) => {
      setUser(currentUser);
      setLoading(false);
    });
    return () => unsubscribe();
  }, []);

  const handleLogin = async () => {
    setLoginError(null);
    try {
      await signInWithGoogle();
    } catch (error: any) {
      console.error("Login Error:", error);
      let msg = "Failed to sign in. Please try again.";
      
      // Handle common Firebase errors with user-friendly messages
      if (error?.code === 'auth/unauthorized-domain') {
        msg = "Domain not authorized. Add this website URL to Firebase Console > Authentication > Settings > Authorized Domains.";
      } else if (error?.code === 'auth/popup-closed-by-user') {
        msg = "Sign-in cancelled.";
      } else if (error?.code === 'auth/api-key-not-valid') {
        msg = "Invalid API Configuration. Please check your Vercel Environment Variables.";
      } else if (error?.message) {
        msg = error.message;
      }
      
      setLoginError(msg);
    }
  };

  // --- Soil Tool Handlers ---
  const handleDiagnosisComplete = async (inputs: SoilDiagnosisInputs) => {
    setIsToolLoading(true);
    try {
      const result = await generateSoilDiagnosis(inputs);
      setDiagnosisData(result);
    } catch (error) {
      console.error(error);
      alert("Error analyzing soil. Please try again.");
      setToolState('hub');
    } finally {
      setIsToolLoading(false);
    }
  };

  // --- Planner Tool Handlers ---
  const handlePlanComplete = async (inputs: PlantingPlanInputs) => {
    setIsToolLoading(true);
    try {
      const result = await generatePlantingPlan(inputs);
      setPlanData(result);
    } catch (error) {
      console.error(error);
      alert("Error generating plan. Please try again.");
      setToolState('hub');
    } finally {
      setIsToolLoading(false);
    }
  };

  // Reset Tool Flow
  const resetTools = () => {
    setDiagnosisData(null);
    setPlanData(null);
    setToolState('hub');
    setIsToolLoading(false);
  };

  if (loading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-sage-50 text-sage-500">
        <Sprout className="w-12 h-12 animate-bounce" />
      </div>
    );
  }

  if (!user) {
    return (
      <div className="min-h-screen bg-sage-50 flex flex-col items-center justify-center px-6">
        <div className="bg-white p-8 rounded-3xl shadow-xl w-full max-w-sm text-center">
          <div className="w-20 h-20 bg-terra-100 rounded-full flex items-center justify-center mx-auto mb-6 text-terra-600">
             <Sprout className="w-10 h-10" />
          </div>
          <h1 className="text-3xl font-serif font-bold text-sage-900 mb-2">Root & Regenerate</h1>
          <p className="text-sage-600 mb-8">Your social gardening companion.</p>
          
          <button 
            onClick={handleLogin}
            className="w-full bg-sage-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sage-900 transition-all flex items-center justify-center gap-2"
          >
             <svg className="w-5 h-5" viewBox="0 0 24 24">
                <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" />
                <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" />
                <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" />
                <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" />
             </svg>
             Sign In with Google
          </button>
          
          {loginError && (
            <div className="mt-4 p-3 bg-red-50 text-red-600 text-sm rounded-lg flex items-start gap-2 text-left">
              <AlertCircle className="w-4 h-4 flex-shrink-0 mt-0.5" />
              <span>{loginError}</span>
            </div>
          )}

          <p className="text-xs text-sage-400 mt-4">
            Note: Demo mode enabled automatically if no API keys are found.
          </p>
        </div>
      </div>
    );
  }

  // Render Tools Content Logic
  const renderToolsContent = () => {
    if (isToolLoading) return <Loading />;
    
    if (diagnosisData) {
      return <Results diagnosis={diagnosisData} onReset={resetTools} />;
    }
    
    if (planData) {
      return <PlantingPlanResults plan={planData} onReset={resetTools} user={user} />;
    }

    if (toolState === 'soil') {
      return (
        <div className="relative">
          <button onClick={resetTools} className="absolute top-4 left-4 text-sage-500 flex items-center gap-1 font-medium z-10">
             <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <Questionnaire onComplete={handleDiagnosisComplete} />
        </div>
      );
    }

    if (toolState === 'planner') {
      return (
        <div className="relative">
          <button onClick={resetTools} className="absolute top-4 left-4 text-sage-500 flex items-center gap-1 font-medium z-10">
             <ArrowLeft className="w-4 h-4" /> Back
          </button>
          <PlantingWizard onComplete={handlePlanComplete} />
        </div>
      );
    }

    if (toolState === 'doctor') {
       return <PlantDoctor onBack={resetTools} />;
    }

    if (toolState === 'gap_filler') {
       return <GapFiller user={user} onBack={resetTools} />;
    }

    return <ToolsHub onSelectTool={setToolState} />;
  };

  return (
    <div className="min-h-screen bg-cream text-sage-900 font-sans selection:bg-terra-200">
      <main className="min-h-screen">
        {activeTab === 'dashboard' && <Dashboard user={user} onNavigate={setActiveTab} />}
        {activeTab === 'scan' && <Scanner user={user} onComplete={() => setActiveTab('dashboard')} />}
        {activeTab === 'tools' && renderToolsContent()}
        {activeTab === 'chat' && <Chat user={user} />}
        {activeTab === 'harvest' && <Harvest user={user} />}
      </main>
      
      <Navigation activeTab={activeTab} onTabChange={setActiveTab} />
    </div>
  );
}

export default App;
