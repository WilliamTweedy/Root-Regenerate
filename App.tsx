import React, { useState, useEffect } from 'react';
import Header from './components/Header';
import Hero from './components/Hero';
import Questionnaire from './components/Questionnaire';
import PlantingWizard from './components/PlantingWizard';
import Results from './components/Results';
import PlantingPlanResults from './components/PlantingPlanResults';
import Loading from './components/Loading';
import SavedPlansList from './components/SavedPlansList';
import { SoilDiagnosisInputs, PlantingPlanInputs, PlantingPlanResponse, DiagnosisResponse, SavedPlan } from './types';
import { generateSoilDiagnosis, generatePlantingPlan } from './services/geminiService';
import { auth, onAuthStateChanged, User } from './services/firebase';

type ViewState = 'home' | 'soil-diagnosis' | 'planting-plan' | 'loading' | 'results' | 'saved-plans';

function App() {
  const [view, setView] = useState<ViewState>('home');
  // Changed from string to DiagnosisResponse | string | null
  const [diagnosisContent, setDiagnosisContent] = useState<DiagnosisResponse | string | null>(null);
  const [planContent, setPlanContent] = useState<PlantingPlanResponse | null>(null);
  const [resultType, setResultType] = useState<'diagnosis' | 'plan'>('diagnosis');
  const [user, setUser] = useState<User | null>(null);

  useEffect(() => {
    // Only attempt to listen for auth changes if auth is initialized
    if (auth) {
      const unsubscribe = onAuthStateChanged(auth, (currentUser) => {
        setUser(currentUser);
      });
      return () => unsubscribe();
    }
  }, []);

  // Navigation Handlers
  const goHome = () => {
    setDiagnosisContent(null);
    setPlanContent(null);
    setView('home');
    window.scrollTo(0, 0);
  };

  const startDiagnosis = () => {
    setResultType('diagnosis');
    setView('soil-diagnosis');
    window.scrollTo(0, 0);
  };

  const startPlanning = () => {
    setResultType('plan');
    setView('planting-plan');
    window.scrollTo(0, 0);
  };
  
  const viewSavedPlans = () => {
    if (!auth) {
      alert("Please configure Firebase to use this feature.");
      return;
    }
    setView('saved-plans');
    window.scrollTo(0, 0);
  };

  const handleSelectSavedPlan = (plan: SavedPlan) => {
    setPlanContent(plan.data);
    setResultType('plan');
    setView('results');
    window.scrollTo(0, 0);
  };

  // Logic Handlers
  const handleSoilDiagnosisComplete = async (inputs: SoilDiagnosisInputs) => {
    setView('loading');
    window.scrollTo(0, 0);
    
    try {
      const result = await generateSoilDiagnosis(inputs);
      setDiagnosisContent(result);
      setView('results');
    } catch (error) {
      console.error(error);
      setDiagnosisContent("An error occurred while connecting to the knowledge base. Please try again.");
      setView('results');
    }
  };

  const handlePlantingPlanComplete = async (inputs: PlantingPlanInputs) => {
    setView('loading');
    window.scrollTo(0, 0);
    
    try {
      const result = await generatePlantingPlan(inputs);
      setPlanContent(result);
      setView('results');
    } catch (error) {
      console.error(error);
      // If planting plan fails, we might want to show a simpler error, 
      // but for now we reuse the diagnosis Content logic or add a separate error state.
      // To keep it simple, we use diagnosisContent for generic errors if needed, or alert.
      setDiagnosisContent("An error occurred while analyzing your seeds. Please try again.");
      setResultType('diagnosis'); 
      setView('results');
    }
  };

  return (
    <div className="min-h-screen bg-earth-50/30 flex flex-col">
      <Header onReset={goHome} onViewSaved={viewSavedPlans} user={user} />
      
      <main className="flex-grow">
        {view === 'home' && (
          <Hero 
            onStartDiagnosis={startDiagnosis} 
            onStartPlanning={startPlanning} 
          />
        )}
        
        {view === 'soil-diagnosis' && (
          <div className="animate-fade-in">
            <Questionnaire onComplete={handleSoilDiagnosisComplete} />
          </div>
        )}

        {view === 'planting-plan' && (
          <div className="animate-fade-in">
            <PlantingWizard onComplete={handlePlantingPlanComplete} />
          </div>
        )}

        {view === 'saved-plans' && user && (
          <div className="animate-fade-in">
            <SavedPlansList user={user} onSelectPlan={handleSelectSavedPlan} onBack={goHome} />
          </div>
        )}
        
        {view === 'loading' && <Loading />}
        
        {view === 'results' && (
          <div className="animate-fade-in">
            {resultType === 'diagnosis' ? (
              <Results diagnosis={diagnosisContent || "No data"} onReset={goHome} />
            ) : (
              planContent ? (
                <PlantingPlanResults plan={planContent} onReset={goHome} user={user} />
              ) : (
                <Results diagnosis={typeof diagnosisContent === 'string' ? diagnosisContent : "Error generating plan."} onReset={goHome} />
              )
            )}
          </div>
        )}
      </main>

      <footer className="bg-earth-800 text-earth-200 py-8 text-center">
        <div className="max-w-5xl mx-auto px-4">
          <p className="mb-2 font-serif text-lg">Root & Regenerate</p>
          <p className="text-sm opacity-70">Inspired by minimal disturbance gardening principles.</p>
          <p className="text-xs mt-4 opacity-50">
            This tool uses AI to generate advice. Always observe your local conditions.
          </p>
        </div>
      </footer>
    </div>
  );
}

export default App;