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
import Loading from './components/Loading';
import Results from './components/Results';
import PlantingPlanResults from './components/PlantingPlanResults';

import { Sprout, ArrowLeft } from 'lucide-react';

function App() {
  const [user, setUser] = useState<User | null>(null);
  const [loading, setLoading] = useState(true);
  const [activeTab, setActiveTab] = useState('dashboard');

  // Tools Tab State
  const [toolState, setToolState] = useState<'hub' | 'soil' | 'planner'>('hub');
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
          <h1 className="text-3xl font-serif font-bold text-sage-900 mb-2">Sprout & Scout</h1>
          <p className="text-sage-600 mb-8">Your social gardening companion.</p>
          
          <button 
            onClick={() => signInWithGoogle()}
            className="w-full bg-sage-800 text-white font-bold py-4 rounded-xl shadow-lg hover:bg-sage-900 transition-all flex items-center justify-center gap-2"
          >
             Sign In with Google
          </button>
          <p className="text-xs text-sage-400 mt-4">
            Note: Demo mode enabled if no API keys found.
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